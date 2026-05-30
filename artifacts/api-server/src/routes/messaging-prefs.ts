import { Router, type IRouter } from "express";
import {
  db,
  usersTable,
  threadsTable,
  requestsTable,
  responsesTable,
  threadStateTable,
  blockedUsersTable,
  userReportsTable,
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { requireCurrentUser } from "../lib/session";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

const SETTING_KEYS: (keyof NotificationSettings)[] = [
  "enabled",
  "messageAlerts",
  "sound",
  "vibration",
  "email",
  "push",
];

function mergeSettings(
  base: NotificationSettings,
  patch: Record<string, unknown>,
): NotificationSettings {
  const next: NotificationSettings = { ...base };
  for (const key of SETTING_KEYS) {
    if (typeof patch[key] === "boolean") {
      next[key] = patch[key] as boolean;
    }
  }
  return next;
}

// Confirm the current user is a participant of the thread; returns the two
// participant ids (and the other participant) or null if not found / not allowed.
async function getThreadParticipants(threadId: string, userId: string) {
  const [row] = await db
    .select({ r: requestsTable, resp: responsesTable })
    .from(threadsTable)
    .innerJoin(requestsTable, eq(requestsTable.id, threadsTable.requestId))
    .innerJoin(responsesTable, eq(responsesTable.id, threadsTable.responseId))
    .where(eq(threadsTable.id, threadId))
    .limit(1);
  if (!row) return null;
  const isBuyer = row.r.buyerId === userId;
  const isSeller = row.resp.sellerId === userId;
  if (!isBuyer && !isSeller) return null;
  const otherUserId = isBuyer ? row.resp.sellerId : row.r.buyerId;
  return { buyerId: row.r.buyerId, sellerId: row.resp.sellerId, otherUserId };
}

// ---- Global notification settings -----------------------------------------

router.get(
  "/me/notification-settings",
  requireCurrentUser,
  async (req, res) => {
    const [user] = await db
      .select({ settings: usersTable.notificationSettings })
      .from(usersTable)
      .where(eq(usersTable.id, req.currentUserId!))
      .limit(1);
    res.json({
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(user?.settings ?? {}),
    });
  },
);

router.patch(
  "/me/notification-settings",
  requireCurrentUser,
  async (req, res) => {
    const userId = req.currentUserId!;
    const [user] = await db
      .select({ settings: usersTable.notificationSettings })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    const current: NotificationSettings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(user?.settings ?? {}),
    };
    const next = mergeSettings(current, (req.body ?? {}) as Record<string, unknown>);
    await db
      .update(usersTable)
      .set({ notificationSettings: next })
      .where(eq(usersTable.id, userId));
    res.json(next);
  },
);

// ---- Per-conversation controls --------------------------------------------

// Mark a thread as read (clears unread count for this user).
router.post("/threads/:threadId/read", requireCurrentUser, async (req, res) => {
  const userId = req.currentUserId!;
  const { threadId } = req.params;
  const participants = await getThreadParticipants(threadId, userId);
  if (!participants) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }
  await db
    .insert(threadStateTable)
    .values({ userId, threadId, lastReadAt: new Date() })
    .onConflictDoUpdate({
      target: [threadStateTable.userId, threadStateTable.threadId],
      set: { lastReadAt: new Date() },
    });
  res.json({ ok: true });
});

// Mute / unmute a single conversation.
router.post("/threads/:threadId/mute", requireCurrentUser, async (req, res) => {
  const userId = req.currentUserId!;
  const { threadId } = req.params;
  const muted = Boolean((req.body ?? {}).muted);
  const participants = await getThreadParticipants(threadId, userId);
  if (!participants) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }
  await db
    .insert(threadStateTable)
    .values({ userId, threadId, muted })
    .onConflictDoUpdate({
      target: [threadStateTable.userId, threadStateTable.threadId],
      set: { muted },
    });
  res.json({ muted });
});

// Delete a chat for the current user only (soft delete via hiddenAt).
router.delete("/threads/:threadId", requireCurrentUser, async (req, res) => {
  const userId = req.currentUserId!;
  const { threadId } = req.params;
  const participants = await getThreadParticipants(threadId, userId);
  if (!participants) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }
  await db
    .insert(threadStateTable)
    .values({ userId, threadId, hiddenAt: new Date() })
    .onConflictDoUpdate({
      target: [threadStateTable.userId, threadStateTable.threadId],
      set: { hiddenAt: new Date() },
    });
  res.json({ ok: true });
});

// ---- Block / report -------------------------------------------------------

router.post("/users/:userId/block", requireCurrentUser, async (req, res) => {
  const blockerId = req.currentUserId!;
  const blockedId = req.params.userId;
  if (blockedId === blockerId) {
    res.status(400).json({ error: "You can't block yourself." });
    return;
  }
  await db
    .insert(blockedUsersTable)
    .values({ id: randomUUID(), blockerId, blockedId })
    .onConflictDoNothing({
      target: [blockedUsersTable.blockerId, blockedUsersTable.blockedId],
    });
  res.json({ blocked: true });
});

router.delete("/users/:userId/block", requireCurrentUser, async (req, res) => {
  const blockerId = req.currentUserId!;
  const blockedId = req.params.userId;
  await db
    .delete(blockedUsersTable)
    .where(
      and(
        eq(blockedUsersTable.blockerId, blockerId),
        eq(blockedUsersTable.blockedId, blockedId),
      ),
    );
  res.json({ blocked: false });
});

router.post("/users/:userId/report", requireCurrentUser, async (req, res) => {
  const reporterId = req.currentUserId!;
  const reportedId = req.params.userId;
  const { reason, threadId } = (req.body ?? {}) as {
    reason?: string;
    threadId?: string;
  };
  if (reportedId === reporterId) {
    res.status(400).json({ error: "You can't report yourself." });
    return;
  }
  await db.insert(userReportsTable).values({
    id: randomUUID(),
    reporterId,
    reportedId,
    threadId: threadId ?? null,
    reason: (reason ?? "").slice(0, 2000),
  });
  res.json({ reported: true });
});

export default router;
