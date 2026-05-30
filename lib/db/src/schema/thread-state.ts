import {
  pgTable,
  text,
  timestamp,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { threadsTable } from "./threads";

// Per-user, per-thread state: mute, last-read marker (for unread counts), and a
// per-user soft-delete (hiddenAt) so deleting a chat only removes it from the
// deleting user's inbox.
export const threadStateTable = pgTable(
  "thread_state",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => threadsTable.id, { onDelete: "cascade" }),
    muted: boolean("muted").notNull().default(false),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    hiddenAt: timestamp("hidden_at", { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.threadId] }),
  }),
);

export type ThreadStateRow = typeof threadStateTable.$inferSelect;
