# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: Desperately Seeking

Buyer-first reverse marketplace. Buyers post ISO requests; subscribed sellers browse and respond.

### Design System (as of v2 redesign)
- **Primary**: Deep Navy `#0B3954` (HSL 206 74% 19%)
- **Accent**: Antique Gold `#D4AF37` (HSL 45 65% 52%)
- **Background**: Cream `#FDF5E6` (HSL 39 83% 95%)
- **Fonts**: Playfair Display (headings/serif), Inter (body)
- **Radius**: 1rem (`rounded-2xl` on cards)
- **Shadows**: Rich navy-tinted drop shadows for floating card effect

### Subscription Tiers
| Tier | Price | Key Feature |
|------|-------|-------------|
| `free` (Buyer) | $0 | Unlimited requests, no responding |
| `seller_basic` (Premium Monthly) | $7.99/mo | Respond + message buyers + commissions |
| `seller_annual` (Premium Annual) | $49.99/year | Everything + analytics + ~47% savings |

### Commission System
- Flat **5% commission** on completed sales (recorded via PATCH /listings/:id/sold)
- `commissions` DB table tracks: sellerId, listingId, salePrice, commissionAmount, status (pending/paid)
- Commission rate constant: `COMMISSION_RATE = 0.05` in `routes/commissions.ts`
- Sellers can view commission history at `/me/commissions`

### Key Frontend Pages
- `/` — Hero (rotating categories, stats, lead teaser cards, "how it works")
- `/browse` — Marketplace listings (ZIP-code + category filters)
- `/requests/new` — Create request (title, description, category, style, dimensions, budget, location, urgency, tags, private toggle)
- `/requests/:id` — Request detail + offer responses
- `/pricing` — Navy hero + 3-tier pricing cards (Free / Premium Monthly / Premium Annual)
- `/me/inventory` — Seller Quick-List inventory (seller-gated)
- `/me/dashboard` — Seller dashboard (commission summary + inventory matches + live buyer feed)
- `/me/commissions` — Commission history for sellers
- `/me/analytics` — Pro seller analytics (seller_pro/seller_annual only)
- `/me/requests` — Buyer's own requests
- `/messages` — Message threads

### Stripe Payments (Live)
- **Integration**: Replit Stripe connector (`connection:conn_stripe_01KQ0GR8C27WK3ZCTR22VWGRQY`)
- **Products seeded**: `seller_basic` ($4.99/mo), `seller_pro` ($12.99/6mo), `seller_annual` ($19.99/yr)
- **DB sync**: `stripe-replit-sync` backfills Stripe data into `stripe.*` tables (products, prices, subscriptions, etc.)
- **Webhook**: Auto-configured via `stripeSync.findOrCreateManagedWebhook` on startup → `/api/stripe/webhook`
- **Stripe tables migration**: If `stripe.*` tables are missing, run migration SQL files manually from `node_modules/.pnpm/stripe-replit-sync@*/node_modules/stripe-replit-sync/dist/migrations/*.sql`
- **Seed script**: `cd scripts && pnpm tsx src/seed-products.ts` (idempotent)
- **Checkout flow**: `POST /api/stripe/checkout { tier }` → redirect to Stripe-hosted checkout → success page syncs tier
- **Billing portal**: `POST /api/stripe/portal` → redirect to Stripe-managed billing portal

### Key Backend Routes
- `GET /api/requests` — List requests (private filtering by subscription tier)
- `POST /api/requests` — Create request (isPrivate, style, dimensions, photos)
- `GET /api/me/inventory` — List inventory items
- `POST /api/me/inventory` — Quick-list inventory item
- `DELETE /api/me/inventory/:itemId` — Remove inventory item
- `GET /api/me/matches` — Inventory matching algorithm (category + style + size scoring)
- `GET /api/me/prospecting` — Live buyer feed for sellers
- `POST /api/me/feedback` — Seller feedback (rating 1-5 + comment)
- `GET /api/stripe/plans` — Live Stripe plans from synced DB
- `POST /api/stripe/checkout` — Create Stripe checkout session (accepts `{ tier }`)
- `GET /api/stripe/success` — Post-checkout sync (called from success page)
- `POST /api/stripe/portal` — Create billing portal session

### DB Schema Key Tables
- `requestsTable`: isPrivate, style, lengthIn/widthIn/heightIn, photos[]
- `inventoryItemsTable`: sellerId, title, category, style, priceMin/Max, dimensions, condition
- `sellerFeedbackTable`: sellerId, rating, comment
- `usersTable` (extended): `stripeCustomerId`, `stripeSubscriptionId` columns added

### Lead Teaser UI
Free-tier users see first 2 request cards blurred with "Unlock for $4.99/mo" button.
Private listings hidden entirely from non-subscribed users at the API level.

### Feedback Widget
Floating gold star button (bottom-right, visible to subscribed sellers only).
Opens a dialog with 5-star rating + freeform comment.
