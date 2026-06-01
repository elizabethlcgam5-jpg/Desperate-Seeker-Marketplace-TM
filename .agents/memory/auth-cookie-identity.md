---
name: Auth cookie identity & the auto-assign fallback trap
description: Why generated API hooks must send credentials, and why withCurrentUser silently mis-attributes identity on write endpoints
---

# Auth cookie identity in Desperately Seeking

This app authenticates with an httpOnly `ds_user_id` cookie (SameSite=Lax). Two
non-obvious traps caused real production bugs (welcome banner missing; a seller's
response showing under the wrong user's name).

## Trap 1: the generated client mutator must send credentials

`customFetch` (the Orval mutator in `@workspace/api-client-react`) originally
called `fetch()` with no `credentials` option, so generated React Query hooks
(`useGetCurrentUser`, `useCreateResponse`, …) relied on the `same-origin`
default. Every hand-written `fetch` in the web app already used
`credentials: "include"`. When the API is reached cross-origin (proxy / iframe
contexts), the default dropped the auth cookie on generated-hook calls only —
so those calls were treated as anonymous while hand-written ones authenticated.

**Rule:** the shared mutator must default to `credentials: "include"` so
generated hooks authenticate identically to hand-written fetches.
**How to apply:** if generated-hook calls behave as a different/anonymous user
than hand-written calls, suspect the mutator's credentials option first.

## Trap 2: withCurrentUser silently assigns the FIRST seeded user

`withCurrentUser` (api-server `lib/session.ts`) auto-assigns the first user by
`joinedAt` when no valid cookie is present (a demo convenience). On a write
endpoint this is dangerous: a request without a cookie is silently attributed to
that seeded user instead of failing. This is exactly how a seller's response got
recorded under the wrong name.

**Rule:** identity-sensitive WRITE endpoints must use `requireCurrentUser`
(401, no fallback), not `withCurrentUser`. Reserve `withCurrentUser` for
read/demo paths where an anonymous fallback identity is acceptable.

## Trap 3: own-email vs others'-email on the wire

`serializeUser` includes `email`, but the shared OpenAPI `User` schema must NOT
expose it (it serializes every seller/buyer — would leak all emails). The
current user's own email is exposed via a separate `CurrentUser` schema
(`allOf: User + nullable email`) used only by `GET /me`. The frontend uses
`currentUser.email` presence as its "is a real logged-in account" signal
(seeded/anonymous users have null email), so `GET /me` MUST return email or the
welcome banner / header auth state silently breaks.
**Why:** Zod `.parse()` against the response schema strips any field not in the
schema — so adding a field to `serializeUser` alone is not enough; the response
schema must include it too.
