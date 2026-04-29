import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { withCurrentUser } from "../lib/session";

const router: IRouter = Router();

router.get("/notifications", withCurrentUser, async (req, res) => {
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.currentUserId!))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(30);

  const unreadCount = rows.filter((r) => !r.read).length;

  res.json({
    notifications: rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      requestId: r.requestId,
      requestTitle: r.requestTitle,
      requestDescription: r.requestDescription,
      listingId: r.listingId,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    })),
    unreadCount,
  });
});

router.patch("/notifications/read-all", withCurrentUser, async (req, res) => {
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(
      and(
        eq(notificationsTable.userId, req.currentUserId!),
        eq(notificationsTable.read, false),
      ),
    );
  res.json({ ok: true });
});

router.patch("/notifications/:id/read", withCurrentUser, async (req, res) => {
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(
      and(
        eq(notificationsTable.id, req.params.id),
        eq(notificationsTable.userId, req.currentUserId!),
      ),
    );
  res.json({ ok: true });
});

export default router;
