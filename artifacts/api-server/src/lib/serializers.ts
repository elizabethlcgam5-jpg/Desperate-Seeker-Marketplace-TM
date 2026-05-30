import type { User } from "@workspace/db";

// A user counts as "online" if they've made an authenticated request within
// this window. Presence is refreshed (throttled) on every authenticated request
// in the session middleware.
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function serializeUser(u: User) {
  const lastSeenMs = u.lastSeenAt ? u.lastSeenAt.getTime() : null;
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    email: u.email ?? null,
    avatarUrl: u.avatarUrl,
    joinedAt: u.joinedAt.toISOString(),
    bio: u.bio,
    location: u.location,
    subscriptionTier: u.subscriptionTier as
      | "free"
      | "seller_basic"
      | "seller_pro"
      | "seller_annual",
    subscriptionRenewsAt: u.subscriptionRenewsAt
      ? u.subscriptionRenewsAt.toISOString()
      : null,
    instantMatch: u.instantMatch,
    // Coarse presence only. We intentionally do NOT expose the exact
    // `lastSeenAt` timestamp on the wire to avoid leaking activity history.
    online:
      lastSeenMs !== null && Date.now() - lastSeenMs < ONLINE_THRESHOLD_MS,
  };
}

export function num(v: string | null | undefined): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
