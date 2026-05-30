---
name: Thread access control
description: Message threads must be participant-gated on every read and action.
---

# Thread access control (IDOR)

Any endpoint that returns or mutates a message thread (or its messages,
mute/read/delete state) must verify the current user is one of the two
participants — for this app that is `request.buyerId` or `response.sellerId`
of the thread. Return 404 (not 403) for non-participants so thread existence
isn't leaked.

**Why:** `GET /threads/:id` previously fetched a thread by ID and returned full
participants + entire message history with no participant check, so any
authenticated user who knew/guessed a thread ID could read the whole
conversation. Caught in code review for the messaging-settings feature.

**How to apply:** When adding any new thread-scoped route, copy the participant
guard pattern right after the row is loaded. `withCurrentUser` only identifies
the caller — it does NOT authorize them for a specific thread.
