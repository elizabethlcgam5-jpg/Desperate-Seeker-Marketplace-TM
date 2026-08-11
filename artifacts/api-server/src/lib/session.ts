import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, and, or, lt, isNull, sql } from "drizzle-orm";

const COOKIE_NAME = "ds_user_id";
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365;

// Presence tracking: refresh a user's `lastSeenAt` on authenticated requests.
// Two layers keep writes minimal AND correct on multi-instance (autoscale):
//   1. An in-memory fast-path skips the DB round-trip for ~30s per process.
//   2. The UPDATE itself is conditional (only writes if the row is actually
//      stale), so independent instances can't amplify writes — at most one
//      write per ~30s window globally per user.
const PRESENCE_WRITE_THROTTLE_MS = 30_000;
const lastPresenceWrite = new Map<string, number>();

function touchPresence(userId: string): void {
  const now = Date.now();
  const last = lastPresenceWrite.get(userId) ?? 0;
  if (now - last < PRESENCE_WRITE_THROTTLE_MS) return;
  lastPresenceWrite.set(userId, now);
  void db
    .update(usersTable)
    .set({ lastSeenAt: new Date() })
    .where(
      and(
        eq(usersTable.id, userId),
        or(
          isNull(usersTable.lastSeenAt),
          lt(usersTable.lastSeenAt, sql`now() - interval '30 seconds'`),
        ),
      ),
    )
    .catch(() => {
      // Best-effort presence update; never block the request on failure.
    });
}

export async function getOrAssignCurrentUserId(
  req: Request,
  res: Response,
): Promise<string> {
  let userId = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (userId) {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (existing) return existing.id;
  }

  const [first] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .orderBy(usersTable.joinedAt)
    .limit(1);

  if (!first) {
    throw new Error("No users seeded");
  }

  setCurrentUserId(res, first.id);
  return first.id;
}

export function readCurrentUserId(req: Request): string | undefined {
  return req.cookies?.[COOKIE_NAME] as string | undefined;
}

export function setCurrentUserId(res: Response, userId: string): void {
  res.cookie(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: process.env.APP_URL ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function withCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = await getOrAssignCurrentUserId(req, res);
    (req as Request & { currentUserId: string }).currentUserId = userId;
    // Only track presence for genuinely cookie-authenticated users, not the
    // auto-assigned fallback used for anonymous visitors.
    if (readCurrentUserId(req) === userId) touchPresence(userId);
    next();
  } catch (err) {
    next(err);
  }
}

// Strict guard: requires an EXISTING authenticated user (valid cookie that maps
// to a real user). Unlike `withCurrentUser`, it never auto-assigns the first
// seeded user — use this for sensitive/cost-incurring endpoints (e.g. sending
// SMS) so unauthenticated callers are rejected with 401 instead of silently
// acting as someone else.
export async function requireCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = readCurrentUserId(req);
    if (!userId) {
      res.status(401).json({ error: "unauthorized", message: "You must be signed in." });
      return;
    }
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!existing) {
      res.status(401).json({ error: "unauthorized", message: "You must be signed in." });
      return;
    }
    (req as Request & { currentUserId: string }).currentUserId = existing.id;
    touchPresence(existing.id);
    next();
  } catch (err) {
    next(err);
  }
}

declare global {
  namespace Express {
    interface Request {
      currentUserId?: string;
    }
  }
}

export {};
