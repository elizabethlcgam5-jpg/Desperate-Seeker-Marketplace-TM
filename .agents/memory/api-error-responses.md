---
name: API errors must be JSON
description: Why the Express API needs a global JSON error handler and aligned body-size limits.
---

# API error responses must always be JSON

**Rule:** the Express API must end with a global error-handling middleware that
serializes EVERY error to JSON (validation → 400, payload-too-large → 413, else
500). Route handlers that call `Schema.parse(req.body)` throw on bad input;
Express 5 forwards that to the error handler automatically.

**Why:** without a JSON error handler, a thrown ZodError or a body-parser 413
falls through to Express's *default* handler, which returns an **HTML** error
page. The web client does `await res.json()` on error responses, and parsing
HTML/empty bodies throws a `SyntaxError`. In Safari/WebKit that SyntaxError's
message is the cryptic **"The string did not match the expected pattern."** —
which then surfaces as a toast and completely masks the real cause (e.g. a
missing field or an oversized photo). This shipped to production and blocked
sellers from posting.

**How to apply:**
- Keep the JSON error handler registered LAST (after all routes) in `app.ts`.
- Keep the server `express.json({ limit })` >= any client-side upload guard,
  accounting for base64 inflation (~1.37x). The photo uploader guards at 10MB on
  the file → server needs ~15mb JSON limit, or photos 413 silently.
- On the client, never call `res.json()` blindly on an error branch. Read text
  first and JSON.parse defensively (see `readError` in listings/new.tsx), so a
  non-JSON body (proxy 502, gateway error) can never throw the WebKit message.
