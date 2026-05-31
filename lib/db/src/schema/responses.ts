import {
  pgTable,
  text,
  timestamp,
  numeric,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { requestsTable } from "./requests";

export const responsesTable = pgTable("responses", {
  id: text("id").primaryKey(),
  requestId: text("request_id")
    .notNull()
    .references(() => requestsTable.id, { onDelete: "cascade" }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  responseType: text("response_type").notNull().default("have"),
  price: numeric("price"),
  condition: text("condition"),
  message: text("message").notNull(),
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("pending"),
  threadId: text("thread_id"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ResponseRow = typeof responsesTable.$inferSelect;
