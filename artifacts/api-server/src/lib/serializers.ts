import type { User } from "@workspace/db";

export function serializeUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    avatarUrl: u.avatarUrl,
    joinedAt: u.joinedAt.toISOString(),
    bio: u.bio,
    location: u.location,
  };
}

export function num(v: string | null | undefined): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
