import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { listingsTable } from "./listings";

export const commissionsTable = pgTable("commissions", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  listingId: text("listing_id").references(() => listingsTable.id, {
    onDelete: "set null",
  }),
  requestId: text("request_id"),
  salePrice: numeric("sale_price").notNull(),
  commissionAmount: numeric("commission_amount").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CommissionRow = typeof commissionsTable.$inferSelect;
