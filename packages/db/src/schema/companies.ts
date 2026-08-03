import { boolean, doublePrecision, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const companyStatusEnum = pgEnum("company_status", ["pending", "active", "paused", "rejected"]);

// 24 or 48, chosen once at onboarding — see Phase 2/4 cancellation-window logic.
export const cancellationWindowHoursEnum = pgEnum("cancellation_window_hours", ["24", "48"]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // public SSR profile page (Phase 3)
  bio: text("bio"),
  bannerUrl: text("banner_url"),
  avatarUrl: text("avatar_url"),
  verified: boolean("verified").notNull().default(false),
  status: companyStatusEnum("status").notNull().default("pending"),
  cancellationWindowHours: cancellationWindowHoursEnum("cancellation_window_hours"), // required before go-live, nullable pre-onboarding-completion
  addressLine1: text("address_line1"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  lat: doublePrecision("lat"), // geocoded at profile-save time (Phase 3)
  lng: doublePrecision("lng"),
  tags: text("tags").array().notNull().default([]), // trigram/tsvector search (Phase 3)
  stripeAccountId: text("stripe_account_id"), // Stripe Connect (Express)
  stripeAccountStatus: text("stripe_account_status"), // from account.updated webhook
  stripeCustomerId: text("stripe_customer_id"), // Stripe Billing (company subscription)
  legalHold: boolean("legal_hold").notNull().default(false), // open dispute/chargeback/claim/subpoena
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const companyStaffRoleEnum = pgEnum("company_staff_role", ["owner", "staff"]);

export const companyStaff = pgTable(
  "company_staff",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: companyStaffRoleEnum("role").notNull().default("staff"),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    joinedAt: timestamp("joined_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("company_staff_company_user_idx").on(table.companyId, table.userId)],
);
