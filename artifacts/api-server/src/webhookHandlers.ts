import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { db, commissionsTable, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

/**
 * Handle marketplace-specific Stripe events (after StripeSync processes them).
 * The payload is already verified by StripeSync — we just parse and act.
 */
async function handleMarketplaceEvent(event: {
  type: string;
  data: { object: Record<string, any> };
}): Promise<void> {
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      if (obj.mode !== "payment") break;

      const commissionId = obj.metadata?.commissionId as string | undefined;
      const listingId = obj.metadata?.listingId as string | undefined;

      if (!commissionId || !listingId) break;

      const paymentIntentId =
        typeof obj.payment_intent === "string"
          ? obj.payment_intent
          : (obj.payment_intent as any)?.id;

      // Mark commission as paid
      await db
        .update(commissionsTable)
        .set({
          status: "paid",
          stripePaymentIntentId: paymentIntentId ?? null,
          stripeCheckoutSessionId: obj.id,
        })
        .where(eq(commissionsTable.id, commissionId));

      // Mark listing as sold
      await db
        .update(listingsTable)
        .set({ status: "sold", isAvailable: false })
        .where(eq(listingsTable.id, listingId));

      logger.info(
        { commissionId, listingId },
        "Marketplace sale completed via Stripe Checkout",
      );
      break;
    }

    case "payment_intent.succeeded": {
      const commissionId = obj.metadata?.commissionId as string | undefined;
      const listingId = obj.metadata?.listingId as string | undefined;

      if (!commissionId || !listingId) break;

      await db
        .update(commissionsTable)
        .set({ status: "paid", stripePaymentIntentId: obj.id })
        .where(eq(commissionsTable.id, commissionId));

      logger.info(
        { commissionId, paymentIntentId: obj.id },
        "Commission marked paid via payment_intent.succeeded",
      );
      break;
    }

    case "charge.succeeded": {
      // Informational — primary handling done via checkout.session.completed
      logger.info({ chargeId: obj.id }, "Charge succeeded");
      break;
    }

    default:
      break;
  }
}

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
          "Received type: " +
          typeof payload +
          ". " +
          "This usually means express.json() parsed the body before reaching this handler. " +
          "FIX: Ensure webhook route is registered BEFORE app.use(express.json()).",
      );
    }

    // 1. StripeSync — syncs Stripe data into the stripe.* DB schema
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // 2. Business logic — handle marketplace-specific events
    try {
      const event = JSON.parse(payload.toString()) as {
        type: string;
        data: { object: Record<string, any> };
      };
      await handleMarketplaceEvent(event);
    } catch (err) {
      logger.error({ err }, "Error processing marketplace webhook event");
    }
  }
}
