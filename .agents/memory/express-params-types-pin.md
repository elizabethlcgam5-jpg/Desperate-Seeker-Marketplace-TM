---
name: express-serve-static-core params pin
description: Why @types/express-serve-static-core is pinned to 5.0.x in the pnpm overrides.
---

`@types/express-serve-static-core` is pinned to `5.0.7` via a pnpm-workspace.yaml `overrides` entry.

**Why:** 5.1.x widened `ParamsDictionary` to `[key: string]: string | string[]` (to type wildcard `*id` route params). That makes every `const { id } = req.params` value `string | string[]`, which breaks all the drizzle `eq(col, id)` calls and any function expecting a plain `string` across the api-server routes — dozens of TS errors. The pin restores `[key: string]: string`.

**How to apply:** Keep the pin unless the app actually starts using wildcard route params. If a future @types/express bump pulls in a transitive serve-static-core that re-breaks param typing, re-pin (or bump the pin) rather than coercing every call site with `String(...)`. The pin is the single root-cause fix; per-call coercion is the fallback only.
