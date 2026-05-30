import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export type NotificationSettings = {
  enabled: boolean;
  messageAlerts: boolean;
  sound: boolean;
  vibration: boolean;
  email: boolean;
  push: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  messageAlerts: true,
  sound: true,
  vibration: true,
  email: false,
  push: false,
};

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url").notNull(),
  bio: text("bio").notNull().default(""),
  location: text("location").notNull().default(""),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  subscriptionRenewsAt: timestamp("subscription_renews_at", {
    withTimezone: true,
  }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectOnboardingComplete: boolean("stripe_connect_onboarding_complete")
    .notNull()
    .default(false),
  instantMatch: boolean("instant_match").notNull().default(false),
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  notificationSettings: jsonb("notification_settings")
    .$type<NotificationSettings>()
    .notNull()
    .default(DEFAULT_NOTIFICATION_SETTINGS),
});

export type User = typeof usersTable.$inferSelect;
