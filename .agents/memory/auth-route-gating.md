---
name: Client-side auth gating in the web app
description: How logged-out access is gated in desperately-seeking, and the rule that every non-marketing route must be explicitly protected
---

# Client-side auth gating (desperately-seeking)

Visitors may view PUBLIC/marketing pages while logged out; ANY browsing or
interaction requires sign-in. Enforced client-side via a `protect(Component)`
HOC in `App.tsx` wrapping each gated `<Route component={...}>`, backed by
`RequireAuth` (`components/require-auth.tsx`) + `useAuth()` (`hooks/use-auth.ts`,
authenticated = current user has an email).

**Public (ungated):** `/`, `/login`, `/pricing`, `/about`, `/how-it-works`,
`/help/*`, `/faq`, `/terms`, `/privacy`, `/contact`, `/welcome`. Everything else
(browse, request/listing detail, messages, profile, me/*, post/seller,
checkout, admin) is wrapped in `protect()`.

**Rule:** when adding a new route, classify it explicitly — wrap it in
`protect()` unless it is intentionally public marketing/legal content.
**Why:** a route added without `protect()` silently becomes a logged-out
access gap (admin was missed on the first pass and flagged in review).
**How to apply:** audit `App.tsx` whenever routes change; default new
interactive/data routes to protected.

Notes:
- `protect()` forwards all props (`<Component {...props} />`), so wouter's
  component-prop param passing and `useParams`/`useRoute` keep working.
- This is a UX layer only. The API server independently enforces auth on
  write endpoints (`requireCurrentUser`) — see `auth-cookie-identity.md`. The
  gate is not a substitute for server-side authorization.
