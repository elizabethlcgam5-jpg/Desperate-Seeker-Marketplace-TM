import { Router, type IRouter } from "express";
import {
  db,
  usersTable,
  listingsTable,
  requestsTable,
  messagesTable,
  notificationsTable,
  commissionsTable,
  responsesTable,
  threadsTable,
} from "@workspace/db";
import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { readCurrentUserId } from "../lib/session";
import type { Request, Response, NextFunction } from "express";

const router: IRouter = Router();

function getAdminIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = readCurrentUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const admins = getAdminIds();
  if (admins.size === 0) {
    res.status(503).json({
      error:
        "Admin access not configured. Set ADMIN_USER_IDS env var (comma-separated user IDs).",
    });
    return;
  }
  if (!admins.has(userId)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  (req as Request & { currentUserId: string }).currentUserId = userId;
  next();
}

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [userCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable);
  const [sellerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(sql`${usersTable.subscriptionTier} != 'free'`);
  const [listingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listingsTable);
  const [activeListings] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listingsTable)
    .where(eq(listingsTable.isAvailable, true));
  const [soldListings] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listingsTable)
    .where(eq(listingsTable.status, "sold"));
  const [requestCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(requestsTable);
  const [messageCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messagesTable);
  const [commissionSum] = await db
    .select({
      total: sql<number>`coalesce(sum(${commissionsTable.commissionAmount}), 0)::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(commissionsTable);
  const [unreadNotifs] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(eq(notificationsTable.read, false));

  res.json({
    users: { total: userCount?.count ?? 0, sellers: sellerCount?.count ?? 0 },
    listings: {
      total: listingCount?.count ?? 0,
      active: activeListings?.count ?? 0,
      sold: soldListings?.count ?? 0,
    },
    requests: { total: requestCount?.count ?? 0 },
    messages: { total: messageCount?.count ?? 0 },
    commissions: {
      totalEarned: Number(commissionSum?.total ?? 0),
      transactions: commissionSum?.count ?? 0,
    },
    notifications: { unread: unreadNotifs?.count ?? 0 },
  });
});

router.get("/admin/users", requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      handle: usersTable.handle,
      email: usersTable.email,
      tier: usersTable.subscriptionTier,
      joinedAt: usersTable.joinedAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.joinedAt))
    .limit(100);
  res.json(
    rows.map((r) => ({
      ...r,
      joinedAt: r.joinedAt.toISOString(),
    })),
  );
});

router.get("/admin/listings", requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      sellerName: listingsTable.sellerName,
      category: listingsTable.category,
      price: listingsTable.price,
      status: listingsTable.status,
      availability: listingsTable.availability,
      isAvailable: listingsTable.isAvailable,
      createdAt: listingsTable.createdAt,
    })
    .from(listingsTable)
    .orderBy(desc(listingsTable.createdAt))
    .limit(100);
  res.json(
    rows.map((r) => ({
      ...r,
      price: Number(r.price),
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/admin/messages", requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      id: messagesTable.id,
      threadId: messagesTable.threadId,
      senderId: messagesTable.senderId,
      body: messagesTable.body,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .orderBy(desc(messagesTable.createdAt))
    .limit(50);
  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/admin/commissions", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(commissionsTable)
    .orderBy(desc(commissionsTable.createdAt))
    .limit(100);
  res.json(
    rows.map((r) => ({
      id: r.id,
      sellerId: r.sellerId,
      listingId: r.listingId,
      salePrice: Number(r.salePrice),
      commissionAmount: Number(r.commissionAmount),
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/admin/requests", requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      id: requestsTable.id,
      title: requestsTable.title,
      category: requestsTable.category,
      status: requestsTable.status,
      urgency: requestsTable.urgency,
      buyerId: requestsTable.buyerId,
      createdAt: requestsTable.createdAt,
    })
    .from(requestsTable)
    .orderBy(desc(requestsTable.createdAt))
    .limit(100);
  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.delete("/admin/listings/all", requireAdmin, async (_req, res) => {
  const ids = (
    await db.select({ id: listingsTable.id }).from(listingsTable)
  ).map((r) => r.id);
  if (ids.length === 0) {
    res.json({ deleted: 0 });
    return;
  }
  await db
    .delete(commissionsTable)
    .where(inArray(commissionsTable.listingId, ids));
  await db
    .delete(notificationsTable)
    .where(
      and(
        isNotNull(notificationsTable.listingId),
        inArray(notificationsTable.listingId, ids),
      ),
    );
  const result = await db.delete(listingsTable);
  res.json({ deleted: ids.length, rows: result.rowCount ?? ids.length });
});

router.delete("/admin/requests/all", requireAdmin, async (_req, res) => {
  const ids = (
    await db.select({ id: requestsTable.id }).from(requestsTable)
  ).map((r) => r.id);
  if (ids.length === 0) {
    res.json({ deleted: 0 });
    return;
  }
  await db.delete(responsesTable).where(inArray(responsesTable.requestId, ids));
  await db.delete(threadsTable).where(inArray(threadsTable.requestId, ids));
  await db
    .delete(notificationsTable)
    .where(
      and(
        isNotNull(notificationsTable.requestId),
        inArray(notificationsTable.requestId, ids),
      ),
    );
  const result = await db.delete(requestsTable);
  res.json({ deleted: ids.length, rows: result.rowCount ?? ids.length });
});

export default router;
