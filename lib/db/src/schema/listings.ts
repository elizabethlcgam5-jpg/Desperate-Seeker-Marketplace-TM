import { pgTable, text, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const listingsTable = pgTable("listings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  category: text("category").notNull(),
  zipCode: text("zip_code").notNull().default(""),
  sellerId: text("seller_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull().default("active"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ListingRow = typeof listingsTable.$inferSelect;
