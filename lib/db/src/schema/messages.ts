import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { threadsTable } from "./threads";

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threadsTable.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type MessageRow = typeof messagesTable.$inferSelect;
