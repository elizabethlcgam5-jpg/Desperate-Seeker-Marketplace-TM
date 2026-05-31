---
name: api-spec codegen exits non-zero on pre-existing lib errors
description: Why `@workspace/api-spec run codegen` can fail even when orval generation succeeded
---

# api-spec codegen vs typecheck:libs

`pnpm --filter @workspace/api-spec run codegen` chains three steps:
`orval` → write the api-zod barrel → `pnpm -w run typecheck:libs`.

The final `typecheck:libs` step builds ALL composite libs, and there are
**pre-existing, unrelated** type errors in `lib/integrations-openai-ai-server`
(missing `node` types, `p-retry` `AbortError`, `response.data` possibly
undefined). So the codegen command exits with code 2 **even when orval
regenerated the schemas correctly**.

**Why:** the command treats lib typecheck as a post-step; a broken sibling lib
fails the whole script regardless of api-spec output.

**How to apply:** after running codegen, don't assume failure means the schemas
are wrong. Verify the actual generated output (e.g. grep the field in
`lib/api-client-react/src/generated/api.schemas.ts`) and re-run the consuming
artifact's own `typecheck`. If a generated field shows up mangled (e.g. an
optional property emitted as `n?: ...`), that's stale/corrupted output — re-run
codegen to fix it; orval itself succeeds even though the chained step reports 2.
