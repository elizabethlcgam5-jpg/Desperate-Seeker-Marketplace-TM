---
name: Orval react-query version detection in catalog monorepo
description: Why orval generates queryKey-required hooks here, and how to force the v5 shape.
---

# Orval react-query version pin (catalog monorepo gotcha)

Orval decides whether generated query hooks make `queryKey` optional by detecting
the installed `@tanstack/react-query` major version. It does this by reading the
nearest package.json's dependency string and running `compareVersions(x, "5.0.0")`.

In this monorepo orval runs in `lib/api-spec`, which does **not** depend on
react-query (the dep lives in `lib/api-client-react`, pinned as `"catalog:"`).
A `"catalog:"` string is not a real semver, so version detection fails, orval
assumes a pre-v5 shape, and the generated hooks type the `query` option as the
raw `UseQueryOptions<...>` — which in react-query v5 makes `queryKey` **required**.
Result: every `useXxx({ query: { enabled } })` call site fails typecheck with
"Property 'queryKey' is missing".

**Fix:** explicitly pin the version in `lib/api-spec/orval.config.ts` under the
`api-client-react` output: `override.query.version: 5`. This forces the v5
generator path (`Partial<UseQueryOptions<...>>` options + `DataTag` query keys),
so `queryKey` becomes optional.

**Why:** can't rely on auto-detection because the catalog protocol hides the
version, and api-spec intentionally has no react-query dependency.

## Two regen pitfalls (both required for a clean build)
1. Running `pnpm exec orval` directly regenerates `lib/api-zod/src/index.ts` to a
   2-line form (`export * from "./generated/api"; export * from "./generated/types";`)
   which double-exports `*Body` schemas → TS2308. The canonical codegen npm
   script overwrites it back to a single line. Prefer `pnpm --filter
   @workspace/api-spec run codegen`, or restore the single-line index after a
   direct orval run.
2. Artifacts consume the libs via TS project references, so they read the
   compiled `.d.ts` in `lib/<pkg>/dist/`, not `src/`. After regen you must rebuild
   the lib declarations (`tsc --build`, e.g. via `pnpm run typecheck:libs`) or the
   artifact keeps seeing the stale generated types.
