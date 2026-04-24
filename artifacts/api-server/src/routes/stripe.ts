import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  getUncachableStripeClient,
  getStripePublishableKey,
  getStripeSync,
} from "../stripeClient";
import { withCurrentUser } from "../lib/session";

const router: IRouter = Router();

/**
 * After a successful Stripe checkout we look up the active subscription
 * and sync the tier back to our users table.
 */
async function syncSubscriptionForCustomer(stripeCustomerId: string) {
  try {
    const stripe = await getUncachableStripeClient();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.stripeCustomerId, stripeCustomerId))
      .limit(1);

    if (!user) return;

    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
      expand: ["data.items.data.price.product"],
    });

    if (subs.data.length === 0) {
      await db
        .update(usersTable)
        .set({
          subscriptionTier: "free",
          stripeSubscriptionId: null,
          subscriptionRenewsAt: null,
        })
        .where(eq(usersTable.id, user.id));
      return;
    }

    const sub = subs.data[0];
    const product = sub.items.data[0]?.price?.product as any;
    const tier =
      (product?.metadata as Record<string, string>)?.tier ?? "seller_basic";
    const renewsAt = new Date(sub.current_period_end * 1000);

    await db
      .update(usersTable)
      .set({
        subscriptionTier: tier,
        stripeSubscriptionId: sub.id,
        subscriptionRenewsAt: renewsAt,
      })
      .where(eq(usersTable.id, user.id));
  } catch (err) {
    console.error("Failed to sync subscription:", err);
  }
}

/**
 * Look up the active Stripe price ID for a given tier from the synced stripe schema.
 * Falls back to listing directly from the Stripe API if the table hasn't backfilled yet.
 */
async function getPriceIdForTier(tier: string): Promise<string | null> {
  // Try from synced stripe schema first
  try {
    const rows = await db.execute(sql`
      SELECT pr.id AS price_id
      FROM stripe.products p
      JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
        AND p.metadata->>'tier' = ${tier}
      LIMIT 1
    `);
    if (rows.rows.length > 0) {
      return rows.rows[0].price_id as string;
    }
  } catch {
    // stripe schema may not exist yet — fall back to API
  }

  // Fall back to Stripe API directly
  const stripe = await getUncachableStripeClient();
  const products = await stripe.products.search({
    query: `metadata['tier']:'${tier}' AND active:'true'`,
  });
  if (products.data.length === 0) return null;

  const prices = await stripe.prices.list({
    product: products.data[0].id,
    active: true,
    limit: 1,
  });
  return prices.data[0]?.id ?? null;
}

// ── GET /api/stripe/publishable-key ────────────────────────────────────────
router.get("/stripe/publishable-key", async (_req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stripe/plans ───────────────────────────────────────────────────
router.get("/stripe/plans", async (_req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT
        p.id        AS product_id,
        p.name      AS product_name,
        p.description AS product_description,
        p.metadata  AS product_metadata,
        pr.id       AS price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring
      FROM stripe.products p
      JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
        AND p.metadata->>'tier' IS NOT NULL
      ORDER BY pr.unit_amount ASC
    `);
    res.json(rows.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/stripe/checkout ───────────────────────────────────────────────
// Accepts { tier } OR { priceId } — tier is preferred for client simplicity
router.post("/stripe/checkout", withCurrentUser, async (req, res) => {
  try {
    const { tier, priceId: explicitPriceId } = req.body as {
      tier?: string;
      priceId?: string;
    };

    if (!tier && !explicitPriceId) {
      return res.status(400).json({ error: "tier or priceId is required" });
    }

    const stripe = await getUncachableStripeClient();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.currentUserId!))
      .limit(1);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Find or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db
        .update(usersTable)
        .set({ stripeCustomerId: customerId })
        .where(eq(usersTable.id, user.id));
    }

    // If already subscribed, send to billing portal to change/cancel
    if (user.stripeSubscriptionId) {
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/pricing`,
      });
      return res.json({ url: portal.url, isPortal: true });
    }

    // Resolve priceId
    const priceId = explicitPriceId ?? (tier ? await getPriceIdForTier(tier) : null);
    if (!priceId) {
      return res
        .status(404)
        .json({ error: `No active Stripe price found for tier: ${tier}` });
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stripe/success ─────────────────────────────────────────────────
router.get("/stripe/success", async (req, res) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) return res.status(400).json({ error: "session_id required" });

  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : (session.customer as any)?.id;

    if (customerId) {
      await syncSubscriptionForCustomer(customerId);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Success sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/stripe/portal ─────────────────────────────────────────────────
router.post("/stripe/portal", withCurrentUser, async (req, res) => {
  try {
    const stripe = await getUncachableStripeClient();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.currentUserId!))
      .limit(1);

    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/pricing`,
    });

    res.json({ url: portal.url });
  } catch (err: any) {
    console.error("Portal error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
