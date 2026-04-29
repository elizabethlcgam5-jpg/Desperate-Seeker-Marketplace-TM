import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "exact" | "similar"
  title: text("title").notNull(),
  message: text("message").notNull(),
  requestId: text("request_id"),
  requestTitle: text("request_title"),
  requestDescription: text("request_description"),
  listingId: text("listing_id"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type NotificationRow = typeof notificationsTable.$inferSelect;
