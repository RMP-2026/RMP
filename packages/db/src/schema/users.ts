import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Platform-level role only. Company-level access (owner/staff) is a separate concern —
// see company_staff — checked by the tRPC "company" procedure tier via membership, not
// this column. A user with role "customer" can still own/staff a company.
export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: text("phone"), // collected post-signup, decoupled from Clerk sign-in (Phase 1)
  phoneVerifiedAt: timestamp("phone_verified_at"), // set once Twilio Verify confirms it
  smsOptOut: boolean("sms_opt_out").notNull().default(false), // checked at send time, not just at signup
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
  clerkUpdatedAt: timestamp("clerk_updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
