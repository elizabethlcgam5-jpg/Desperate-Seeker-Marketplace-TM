import { Router, type IRouter } from "express";
import { db, requestsTable, responsesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetSellerAnalyticsResponse } from "@workspace/api-zod";
import { withCurrentUser } from "../lib/session";

const router: IRouter = Router();

router.get("/me/analytics", withCurrentUser, async (req, res) => {
  const sellerId = req.currentUserId!;

  const offers = await db
    .select({ r: responsesTable, req: requestsTable })
    .from(responsesTable)
    .innerJoin(requestsTable, eq(requestsTable.id, responsesTable.requestId))
    .where(eq(responsesTable.sellerId, sellerId))
    .orderBy(desc(responsesTable.createdAt));

  const totalOffers = offers.length;
  const totalViews = offers.reduce((acc, { r }) => acc + r.viewCount, 0);
  const accepted = offers.filter((o) => o.r.status === "accepted").length;
  const declined = offers.filter((o) => o.r.status === "declined").length;
  const pending = offers.filter((o) => o.r.status === "pending").length;
  const decided = accepted + declined;
  const acceptanceRate = decided === 0 ? 0 : accepted / decided;
  const avgViewsPerOffer = totalOffers === 0 ? 0 : totalViews / totalOffers;

  const recentOffers = offers.slice(0, 12).map(({ r, req: rq }) => ({
    id: r.id,
    requestId: r.requestId,
    requestTitle: rq.title,
    price: Number(r.price),
    status: r.status,
    viewCount: r.viewCount,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(
    GetSellerAnalyticsResponse.parse({
      totalOffers,
      totalViews,
      accepted,
      declined,
      pending,
      acceptanceRate,
      avgViewsPerOffer,
      recentOffers,
    }),
  );
});

export default router;
