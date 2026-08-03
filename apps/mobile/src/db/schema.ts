import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// NOTE: this whole file (and apps/mobile/src/db, apps/mobile/src/inngest,
// apps/mobile/src/app/api/webhooks) is superseded by packages/db + packages/jobs +
// apps/web's webhook route (PLAN.md Phase 1) — kept alive for the user/waitlist sync
// path below, not because it's still the source of truth for the schema.
export const userRoleEnum = pgEnum("user_role", ["customer", "host", "admin", "support", "moderator"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  role: userRoleEnum("role").notNull().default("customer"),
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

// `permissions`/`roles`/`role_permissions`/`audit_log` were dropped from Postgres in the
// Phase 1 monorepo migration (see PLAN.md) — removed here too rather than left declaring
// tables that no longer exist. Platform access is now just `users.role`
// (`customer`/`admin`); company-level access is `company_staff` membership.
