import { Router, type IRouter } from "express";
import { db, commissionsTable, listingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListMyCommissionsResponse,
} from "@workspace/api-zod";
import { withCurrentUser } from "../lib/session";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

const COMMISSION_RATE = 0.05;

function serializeCommission(
  row: typeof commissionsTable.$inferSelect & { listingTitle?: string | null },
) {
  return {
    id: row.id,
    sellerId: row.sellerId,
    listingId: row.listingId ?? null,
    requestId: row.requestId ?? null,
    listingTitle: row.listingTitle ?? null,
    salePrice: Number(row.salePrice),
    commissionAmount: Number(row.commissionAmount),
    status: row.status as "pending" | "paid",
    notes: row.notes ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

router.patch(
  "/listings/:listingId/sold",
  withCurrentUser,
  async (req, res) => {
    const { listingId } = req.params;
    const { salePrice, notes } = req.body as {
      salePrice: number;
      notes?: string | null;
    };

    if (!salePrice || isNaN(Number(salePrice)) || Number(salePrice) <= 0) {
      res.status(400).json({ error: "salePrice must be a positive number" });
      return;
    }

    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, listingId))
      .limit(1);

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const price = Number(salePrice);
    const commission = parseFloat((price * COMMISSION_RATE).toFixed(2));

    await db
      .update(listingsTable)
      .set({ status: "sold", isAvailable: false })
      .where(eq(listingsTable.id, listingId));

    const sellerId = listing.sellerId ?? req.currentUserId!;

    const [commissionRow] = await db
      .insert(commissionsTable)
      .values({
        id: randomUUID(),
        sellerId,
        listingId,
        salePrice: price.toString(),
        commissionAmount: commission.toString(),
        status: "pending",
        notes: notes ?? null,
      })
      .returning();

    res.json(
      serializeCommission({ ...commissionRow, listingTitle: listing.title }),
    );
  },
);

router.get("/me/commissions", withCurrentUser, async (req, res) => {
  const rows = await db
    .select({
      commission: commissionsTable,
      listingTitle: listingsTable.title,
    })
    .from(commissionsTable)
    .leftJoin(listingsTable, eq(commissionsTable.listingId, listingsTable.id))
    .where(eq(commissionsTable.sellerId, req.currentUserId!))
    .orderBy(desc(commissionsTable.createdAt));

  const serialized = rows.map((r) =>
    serializeCommission({ ...r.commission, listingTitle: r.listingTitle }),
  );

  res.json(ListMyCommissionsResponse.parse(serialized));
});

export { COMMISSION_RATE };
export default router;
