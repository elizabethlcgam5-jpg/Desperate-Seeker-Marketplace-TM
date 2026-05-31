---
name: SellerResponse serializer sync across routes
description: Two route files serialize SellerResponse; both must stay in sync with the OpenAPI schema or request-detail 400s.
---

# SellerResponse is serialized in TWO route files

`SellerResponse` (the offer object) is mapped to JSON in **two** places, and they
drift independently:

- `routes/responses.ts` — the dedicated endpoints (`/requests/:id/responses`,
  `/responses/:id`, status patch). This is the one people remember to update.
- `routes/requests.ts` — the **request-detail aggregate** endpoints
  (`GET /requests/:id` and `PATCH /requests/:id`) embed a `responses: [...]`
  array via their own inline `.map(...)`. Easy to forget.

**Rule:** any field added to / made required on the OpenAPI `SellerResponse`
schema must be added to BOTH mappers in lockstep.

**Why:** the aggregate endpoints call `GetRequestResponse.parse(...)` /
`UpdateRequestResponse.parse(...)`. A required field missing from the inline
`.map` makes the parse throw a ZodError → the global handler returns **400/500**
for the buyer's request-detail page, but ONLY for requests that actually have at
least one offer (empty-offer requests pass, hiding the bug). Bitten by
`responseType`, `viewCount`, and nullable `price` all at once.

**How to apply:** when touching response shape, grep both files for the field
list and diff them. Also note nullable numeric columns must serialize as
`x == null ? null : Number(x)` (not bare `Number(x)`, which yields `NaN`/throws).
