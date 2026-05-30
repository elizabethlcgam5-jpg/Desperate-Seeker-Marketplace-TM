---
name: Online presence design
description: How "online" status is derived and the privacy/scaling constraints around it.
---

# Online presence (green dot)

Presence is **last-seen-derived**, not a real-time socket. `users.lastSeenAt` is
refreshed on cookie-authenticated requests in the session middleware; a user is
`online` if seen within ~2 minutes.

**Privacy rule:** the shared `serializeUser` is reused across MANY public
endpoints (requests feed, responses, user lookups). Therefore expose only a
coarse `online` boolean — never the exact `lastSeenAt` timestamp — or you leak
every user's activity history app-wide.
**Why:** code review flagged that putting `lastSeenAt` on the generic User
schema leaked precise activity timestamps far beyond chat participants.

**Throttle rule:** presence writes must be safe on multi-instance autoscale.
Use BOTH an in-memory fast-path AND a conditional `UPDATE ... WHERE lastSeenAt
IS NULL OR lastSeenAt < now() - interval '30s'`. An in-memory map alone lets
each instance write independently → write amplification.

**Auth caveat (pre-existing, app-wide):** presence trust is only as strong as
the `ds_user_id` raw-cookie auth this whole app uses; it's spoofable to the same
degree as every other authenticated action here. Not specific to presence — do
not rearchitect auth as part of a presence change.

**How to apply:** only mark presence for genuinely cookie-authed users — exclude
the `withCurrentUser` anonymous fallback (guard `readCurrentUserId(req) ===
userId`), or anonymous traffic marks the first seeded user "online".
