---
name: p-retry AbortError import
description: p-retry v7 exports AbortError as a named export, not as a property of the default.
---

In p-retry v7, `AbortError` is a **named** export: `import pRetry, { AbortError } from "p-retry"`. It is NOT `pRetry.AbortError` (that pattern was valid in older CommonJS-style versions and now fails with TS2339).

**Why:** p-retry v7 is ESM-only with separate named exports; the default export is just the retry function.

**How to apply:** When wiring retry abort logic anywhere in the workspace, import `AbortError` by name. Same applies to other sindresorhus ESM utils that moved sub-exports off the default.
