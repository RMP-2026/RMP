import { boolean, jsonb, pgEnum, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// Adding a role later (Fleet Manager, Accounting, ...) is one additive migration —
// `ALTER TYPE user_role ADD VALUE '...'` — plus rows in `roles`/`role_permissions` below.
// No resolution/middleware code changes; see docs/authorization.md.
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

// --- Authorization: roles & permissions ---
// `permissions`/`role_permissions` are the admin-editable source of truth for what each
// role can do. Business logic must never compare role strings directly — always resolve
// through these tables (see src/lib/permissions/resolve.ts).

export const permissions = pgTable("permissions", {
  key: text("key").primaryKey(), // "resource:action", e.g. "vehicles:view"
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roles = pgTable("roles", {
  key: userRoleEnum("key").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isSystem: boolean("is_system").notNull().default(true), // the 5 spec-defined roles; future custom roles can be non-system
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleKey: userRoleEnum("role_key")
      .notNull()
      .references(() => roles.key, { onDelete: "cascade" }),
    permissionKey: text("permission_key")
      .notNull()
      .references(() => permissions.key, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleKey, table.permissionKey] })],
);

export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }), // null for system/webhook-driven events
  action: text("action").notNull(), // e.g. "role_permission.granted", "subscription.created"
  targetType: text("target_type").notNull(), // "role" | "permission" | "user" | "subscription"
  targetId: text("target_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
