import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "host", "admin"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  role: userRoleEnum("role").notNull().default("user"),
  clerkUpdatedAt: timestamp("clerk_updated_at").notNull().defaultNow(), // Clerk-side event ordering, guards against out-of-order webhooks
  deletedAt: timestamp("deleted_at"), // soft-delete marker so a stale create/update can't resurrect a deleted user
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const waitlistEntryStatusEnum = pgEnum("waitlist_entry_status", [
  "pending",
  "invited",
  "completed",
  "rejected",
]);

export const waitlistEntries = pgTable("waitlist_entries", {
  id: text("id").primaryKey(), // Clerk waitlist entry ID
  email: text("email").notNull(),
  status: waitlistEntryStatusEnum("status").notNull(),
  clerkUpdatedAt: timestamp("clerk_updated_at").notNull().defaultNow(), // Clerk-side event ordering, guards against out-of-order webhooks
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
