import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { requestsTable } from "./requests";
import { responsesTable } from "./responses";

export const threadsTable = pgTable("threads", {
  id: text("id").primaryKey(),
  requestId: text("request_id")
    .notNull()
    .references(() => requestsTable.id, { onDelete: "cascade" }),
  responseId: text("response_id")
    .notNull()
    .references(() => responsesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ThreadRow = typeof threadsTable.$inferSelect;
