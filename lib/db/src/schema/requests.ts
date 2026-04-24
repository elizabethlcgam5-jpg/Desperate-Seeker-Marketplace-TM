import {
  pgTable,
  text,
  timestamp,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const requestsTable = pgTable("requests", {
  id: text("id").primaryKey(),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  budgetMin: numeric("budget_min"),
  budgetMax: numeric("budget_max"),
  location: text("location").notNull().default(""),
  urgency: text("urgency").notNull().default("normal"),
  status: text("status").notNull().default("open"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type RequestRow = typeof requestsTable.$inferSelect;
