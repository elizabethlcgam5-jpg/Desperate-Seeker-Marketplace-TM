import { Router, type IRouter } from "express";
import { db, usersTable, requestsTable, responsesTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import {
  GetCurrentUserResponse,
  ListUsersResponse,
  SwitchUserBody,
  SwitchUserResponse,
  GetUserParams,
  GetUserResponse,
  UpdateCurrentUserBody,
  UpdateCurrentUserResponse,
  SubscribeCurrentUserBody,
  SubscribeCurrentUserResponse,
  ListPricingPlansResponse,
} from "@workspace/api-zod";
import { withCurrentUser, setCurrentUserId } from "../lib/session";
import { serializeUser } from "../lib/serializers";

const router: IRouter = Router();

router.get("/me", withCurrentUser, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.currentUserId!))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetCurrentUserResponse.parse(serializeUser(user)));
});

router.put("/me", withCurrentUser, async (req, res) => {
  const body = UpdateCurrentUserBody.parse(req.body);
  const [updated] = await db
    .update(usersTable)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.bio !== undefined && { bio: body.bio }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
    })
    .where(eq(usersTable.id, req.currentUserId!))
    .returning();
  res.json(UpdateCurrentUserResponse.parse(serializeUser(updated)));
});

router.post("/me/subscribe", withCurrentUser, async (req, res) => {
  const body = SubscribeCurrentUserBody.parse(req.body);
  const renews =
    body.tier === "free"
      ? null
      : body.tier === "seller_annual"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : body.tier === "seller_pro"
          ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const [updated] = await db
    .update(usersTable)
    .set({ subscriptionTier: body.tier, subscriptionRenewsAt: renews })
    .where(eq(usersTable.id, req.currentUserId!))
    .returning();
  res.json(SubscribeCurrentUserResponse.parse(serializeUser(updated)));
});

router.get("/pricing/plans", async (_req, res) => {
  const plans = [
    {
      tier: "free" as const,
      name: "Free",
      priceCents: 0,
      interval: "none" as const,
      tagline: "Post what you want. Sellers come to you.",
      features: [
        "Post unlimited buyer requests",
        "Receive offers from verified sellers",
        "Browse public listings marketplace",
        "Accept the best offer — always free for buyers",
      ],
      highlight: false,
    },
    {
      tier: "seller_basic" as const,
      name: "Premium",
      priceCents: 199,
      interval: "month" as const,
      tagline: "Unlock the full power of Desperately Seeking.",
      features: [
        "Unlimited responses",
        "Unlimited messaging",
        "Automatic Match Alerts",
        "Priority matching",
        "Verified Seller badge",
        "5% platform fee on successful sales",
        "No shipping fees, ever",
      ],
      highlight: true,
    },
    {
      tier: "seller_annual" as const,
      name: "Premium Yearly",
      priceCents: 2999,
      interval: "year" as const,
      tagline: "Save 60% with the yearly plan.",
      features: [
        "Everything in Premium",
        "Best value for frequent sellers",
        "Priority support",
        "Early access to new features",
      ],
      highlight: false,
    },
  ];
  res.json(ListPricingPlansResponse.parse(plans));
});

router.get("/users", async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.name);
  res.json(ListUsersResponse.parse(users.map(serializeUser)));
});

router.post("/users/switch", async (req, res) => {
  const body = SwitchUserBody.parse(req.body);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, body.userId))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  setCurrentUserId(res, user.id);
  res.json(SwitchUserResponse.parse(serializeUser(user)));
});

router.get("/users/:userId", async (req, res) => {
  const params = GetUserParams.parse(req.params);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, params.userId))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [reqCount] = await db
    .select({ c: count() })
    .from(requestsTable)
    .where(eq(requestsTable.buyerId, user.id));
  const [respCount] = await db
    .select({ c: count() })
    .from(responsesTable)
    .where(eq(responsesTable.sellerId, user.id));
  const [acceptedCount] = await db
    .select({ c: count() })
    .from(responsesTable)
    .where(
      and(
        eq(responsesTable.sellerId, user.id),
        eq(responsesTable.status, "accepted"),
      ),
    );

  const recentRequests = await db
    .select()
    .from(requestsTable)
    .where(eq(requestsTable.buyerId, user.id))
    .orderBy(desc(requestsTable.createdAt))
    .limit(5);

  const recentSummaries = await Promise.all(
    recentRequests.map(async (r) => {
      const [rc] = await db
        .select({ c: count() })
        .from(responsesTable)
        .where(eq(responsesTable.requestId, r.id));
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        budgetMin: r.budgetMin === null ? null : Number(r.budgetMin),
        budgetMax: r.budgetMax === null ? null : Number(r.budgetMax),
        status: r.status,
        urgency: r.urgency,
        location: r.location,
        createdAt: r.createdAt.toISOString(),
        buyer: serializeUser(user),
        responseCount: rc.c,
      };
    }),
  );

  res.json(
    GetUserResponse.parse({
      user: serializeUser(user),
      requestCount: reqCount.c,
      responseCount: respCount.c,
      acceptedCount: acceptedCount.c,
      recentRequests: recentSummaries,
    }),
  );
});

export default router;
