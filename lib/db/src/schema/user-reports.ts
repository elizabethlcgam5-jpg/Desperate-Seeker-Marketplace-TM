import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { threadsTable } from "./threads";

export const userReportsTable = pgTable("user_reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  reportedId: text("reported_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  threadId: text("thread_id").references(() => threadsTable.id, {
    onDelete: "set null",
  }),
  reason: text("reason").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserReportRow = typeof userReportsTable.$inferSelect;
