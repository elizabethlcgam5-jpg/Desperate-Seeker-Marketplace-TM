import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "ds_user_id";
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365;

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
    sameSite: "lax",
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
