---
name: Zod/OpenAPI request body field stripping
description: Why new request-body fields silently vanish at runtime in this contract-first repo unless the OpenAPI schema is updated and codegen re-run.
---

# Request-body fields must be added to the OpenAPI schema, not just the route/DB

In this repo, server routes validate bodies with the **generated** Zod schemas
(`lib/api-zod/src/generated/api.ts`, imported with terse aliases like `n`), e.g.
`const body = n.parse(req.body)` in `routes/listings.ts`. Those schemas are
generated from `lib/api-spec/openapi.yaml` via
`pnpm --filter @workspace/api-spec run codegen`.

**Rule:** If you add a field to a DB table and a frontend form but do NOT add it to
the corresponding OpenAPI request-body schema (e.g. `CreateListingBody`) and
regenerate, Zod `.parse()` **silently strips the unknown key**. The route then
reads `body.<field>` as `undefined`, persists the column default, and the feature
appears wired but never actually saves. TypeScript also errors ("Property X does
not exist on the parsed type") — treat that error as a real runtime bug, not noise.

**Why:** Zod object schemas strip unknown keys by default. The generated schema is
the single source of truth for what survives `.parse()`.

**How to apply:** When adding any request-body field: (1) add it under the schema in
`openapi.yaml`, (2) run the codegen command, (3) then use it in the route. This
bit the listing fulfillment fields (`brandName`, `condition`, `availability`,
`shippingPrice`, `instantMatchOn`) — present in DB + route + form but missing from
`CreateListingBody`, so they were dropped on every create.

# Pre-existing typecheck noise in this repo (do not chase)

`pnpm --filter @workspace/api-server run typecheck` reports many pre-existing
errors unrelated to most changes: drizzle `eq(...)` "No overload matches this
call" across many routes (commissions, notifications, requests, stripe, listings),
`queryKey` missing on `useQuery` options across web pages, `RequestSummary` tag/
`maxBudget`/`zipCode` mismatches, and `TS6305`/"Cannot find type definition file
for 'node'" from the `integrations-openai-ai-server` lib not building. The dev/
prod servers run via esbuild/tsx which do NOT typecheck, so runtime is unaffected.
Verify your own touched files are clean rather than expecting a globally green typecheck.
