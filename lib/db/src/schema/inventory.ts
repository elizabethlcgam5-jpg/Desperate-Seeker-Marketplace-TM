import {
  pgTable,
  text,
  timestamp,
  numeric,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const inventoryItemsTable = pgTable("inventory_items", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  style: text("style").notNull().default(""),
  description: text("description").notNull().default(""),
  priceMin: numeric("price_min"),
  priceMax: numeric("price_max"),
  lengthIn: numeric("length_in"),
  widthIn: numeric("width_in"),
  heightIn: numeric("height_in"),
  condition: text("condition").notNull().default("good"),
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type InventoryItemRow = typeof inventoryItemsTable.$inferSelect;
