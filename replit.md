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
| `free` (Buyer) | $0 | Unlimited requests |
| `seller_basic` | $4.99/mo | Browse + message buyers |
| `seller_pro` | $12.99/6 months | + Analytics dashboard |
| `seller_annual` | $19.99/year | + Inventory Quick-List |

### Key Frontend Pages
- `/` — Hero (rotating categories, stats, lead teaser cards, "how it works")
- `/requests/new` — Create request (title, description, category, style, dimensions, budget, location, urgency, tags, private toggle)
- `/requests/:id` — Request detail + offer responses
- `/pricing` — Navy hero + 4-tier pricing cards
- `/me/inventory` — Seller Quick-List inventory (seller-gated)
- `/me/dashboard` — Seller dashboard (inventory matches + live buyer feed)
- `/me/analytics` — Pro seller analytics (seller_pro/seller_annual only)
- `/me/requests` — Buyer's own requests
- `/messages` — Message threads

### Key Backend Routes
- `GET /api/requests` — List requests (private filtering by subscription tier)
- `POST /api/requests` — Create request (isPrivate, style, dimensions, photos)
- `GET /api/me/inventory` — List inventory items
- `POST /api/me/inventory` — Quick-list inventory item
- `DELETE /api/me/inventory/:itemId` — Remove inventory item
- `GET /api/me/matches` — Inventory matching algorithm (category + style + size scoring)
- `GET /api/me/prospecting` — Live buyer feed for sellers
- `POST /api/me/feedback` — Seller feedback (rating 1-5 + comment)

### DB Schema Key Tables
- `requestsTable`: isPrivate, style, lengthIn/widthIn/heightIn, photos[]
- `inventoryItemsTable`: sellerId, title, category, style, priceMin/Max, dimensions, condition
- `sellerFeedbackTable`: sellerId, rating, comment

### Lead Teaser UI
Free-tier users see first 2 request cards blurred with "Unlock for $4.99/mo" button.
Private listings hidden entirely from non-subscribed users at the API level.

### Feedback Widget
Floating gold star button (bottom-right, visible to subscribed sellers only).
Opens a dialog with 5-star rating + freeform comment.
