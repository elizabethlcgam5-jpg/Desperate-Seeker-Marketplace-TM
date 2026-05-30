---
name: Codegen / typecheck baseline noise
description: Known pre-existing typecheck failures in this repo that are unrelated to your changes.
---

# Codegen / typecheck baseline noise

Two classes of pre-existing failures are part of the baseline — do NOT treat
them as regressions from your work:

1. **Web typecheck** (`@workspace/desperately-seeking`): generated TanStack Query
   option types mark `queryKey` as required, so every call passing
   `{ query: { enabled } }` / `{ query: { refetchInterval } }` errors with
   `TS2741: Property 'queryKey' is missing`. This affects ~25 call sites across
   the app. Vite does not run tsc, so the app builds and ships regardless.
   Also pre-existing: `RequestSummary` missing `tags`/`maxBudget`/`zipCode`.

2. **`typecheck:libs`** (runs as the tail step of `api-spec run codegen`):
   `Cannot find type definition file for 'node'` and
   `integrations-openai-ai-server` errors (`pRetry.AbortError`,
   `response.data` possibly undefined). The orval generation itself still
   succeeds — verify your new schema fields actually landed in
   `lib/api-zod/src/generated/...` and `lib/api-client-react/src/generated/...`
   rather than trusting the command's overall exit code.

**Why:** wasted effort chasing these as if they were caused by a change.
**How to apply:** after codegen, grep the generated files for your new field to
confirm success; ignore the listed errors unless a NEW class appears.
