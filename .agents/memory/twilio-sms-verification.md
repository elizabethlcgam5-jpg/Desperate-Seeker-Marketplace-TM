---
name: Twilio SMS verification (dormant-until-activated pattern)
description: How phone verification is wired so it stays inert until Twilio secrets exist, and why the connector path was abandoned.
---

# Dormant-until-activated gating

SMS phone verification gates `POST /listings` ONLY when Twilio is configured.
`isTwilioConfigured()` checks for `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` /
`TWILIO_VERIFY_SERVICE_SID` env secrets. When absent: the listing gate is
skipped (app keeps working), and send/verify endpoints return `503
verification_unavailable` instead of crashing. When present: posting requires
`usersTable.phoneVerified`.

**Why:** The user wanted the feature built and ready but was not ready to add
Twilio funds/credentials. A hard gate would have broken all posting immediately.

**How to apply:** Any feature depending on an unconfigured external service should
degrade gracefully behind a config check rather than failing closed, when the
user explicitly wants it pre-built but inactive.

# Twilio connector was dismissed — use env-var secrets

The Replit Twilio connector (`connector:ccfg_twilio_...`) was dismissed by the
user multiple times via proposeIntegration. The implementation therefore reads
credentials from plain env secrets and calls the Twilio Verify v2 REST API
directly via `fetch` (Basic auth = base64(accountSid:authToken)), NOT the
connector proxy. If revisiting, either re-propose the connector or keep the
secrets path.

# drizzle-kit push is interactive and blocks here

`pnpm --filter @workspace/db run push` (and even `push-force`) prompt
interactively (e.g. an unrelated pending `users_email_unique` constraint) and
hang/break under non-interactive bash; piping `yes ""` kills the TTY. For simple
additive column changes, run idempotent SQL directly via the executeSql sandbox
(`ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`) instead.

# After editing a lib schema, rebuild the lib before consumers typecheck

Editing `lib/db/src/schema/*` does NOT update consumers' types until the composite
lib is rebuilt. Run `pnpm exec tsc --build lib/db/tsconfig.json` (db doesn't
depend on the openai lib, so it builds even when `typecheck:libs` fails there).
Otherwise api-server reports "Property X does not exist on usersTable".

# Sensitive endpoints need requireCurrentUser, not withCurrentUser

This app's `withCurrentUser` AUTO-ASSIGNS the first seeded user when no valid
cookie is present (dev-convenience auth). That means any endpoint using it is
effectively reachable unauthenticated. For cost-incurring or state-mutating
endpoints (e.g. sending SMS), use the strict `requireCurrentUser` guard, which
rejects with 401 when there's no valid cookie. Also added a 30s per-user send
cooldown (in-memory Map) to cap Twilio spend abuse.

**Why:** code review flagged that SMS-send could be triggered by unauthenticated
callers, incurring real Twilio cost.

# Listing phone gate is free-tier only

The phone-verification gate on POST /listings applies ONLY to non-premium
sellers (premium = seller_basic/seller_pro/seller_annual). The abuse vector is
multi-account farming of the 2-free-listing limit; paying sellers are exempt.

# Custom SMS body is set in Twilio, not in code

The verification SMS text ("Your Desperately Seeking™ verification code is:
{{CODE}}. Do not share this code with anyone.") is governed by the Twilio Verify
SERVICE template (Twilio Console → Verify → Services → Templates), NOT by the
/Verifications API call. The API only chooses channel (sms) + To. To customize
the body, edit/approve a template in the console and attach it to the service.

# Only mobile numbers allowed (Lookup)

send-phone-code calls Twilio Lookup v2 (Fields=line_type_intelligence) and blocks
type in {voip, nonFixedVoip, fixedVoip, landline}. Fails OPEN on non-404 Lookup
errors / network errors so transient issues never block legit users; 404 → treated
as invalid number.
