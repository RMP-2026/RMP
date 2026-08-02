import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { bookings } from "./bookings";
import { companies } from "./companies";
import { users } from "./users";

export const depositHoldStatusEnum = pgEnum("deposit_hold_status", [
  "pending",
  "releasing",
  "released",
  "capturing",
  "captured",
  "failed",
]);

export const depositHolds = pgTable("deposit_holds", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  status: depositHoldStatusEnum("status").notNull().default("pending"),
  idempotencyKey: text("idempotency_key"), // set by whichever flow (auto-release/claim/admin) wins the CAS to releasing/capturing
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const damageClaimStatusEnum = pgEnum("damage_claim_status", [
  "pending",
  "approved",
  "denied",
  "contested",
]);

export const damageClaims = pgTable("damage_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  depositHoldId: uuid("deposit_hold_id")
    .notNull()
    .references(() => depositHolds.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: damageClaimStatusEnum("status").notNull().default("pending"),
  filedAt: timestamp("filed_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payoutStatusEnum = pgEnum("payout_status", ["pending", "held", "sent", "failed"]);

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  bookingId: text("booking_id").references(() => bookings.id),
  amountCents: integer("amount_cents").notNull(),
  stripeTransferId: text("stripe_transfer_id"),
  status: payoutStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chargebackStatusEnum = pgEnum("chargeback_status", ["open", "won", "lost"]);
export const chargebackReconciliationStatusEnum = pgEnum("chargeback_reconciliation_status", [
  "unreconciled",
  "reconciling",
  "reconciled",
  "failed",
]);

export const chargebacks = pgTable("chargebacks", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  stripeDisputeId: text("stripe_dispute_id").notNull().unique(), // webhook retries are a no-op against this
  status: chargebackStatusEnum("status").notNull().default("open"),
  reconciliationStatus: chargebackReconciliationStatusEnum("reconciliation_status").notNull().default("unreconciled"),
  reconciliationIdempotencyKey: text("reconciliation_idempotency_key"),
  amountCents: integer("amount_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionTierEnum = pgEnum("subscription_tier", ["starter", "professional", "premium"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "paused",
  "canceled",
]);

// Company Stripe Billing subscription (distinct from the Clerk-Billing-based host
// subscriptions built pre-PLAN.md — see docs/authorization.md for that superseded
// approach; this is the Stripe-Billing version PLAN.md Phase 2 specifies).
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .unique()
    .references(() => companies.id, { onDelete: "cascade" }),
  tier: subscriptionTierEnum("tier").notNull().default("starter"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const promoDiscountTypeEnum = pgEnum("promo_discount_type", ["percent", "fixed"]);

// v2 feature — schema only per PLAN.md Open Items, no UI/flow built in v1.
export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountType: promoDiscountTypeEnum("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  expiresAt: timestamp("expires_at"),
  maxRedemptions: integer("max_redemptions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const promoRedemptions = pgTable("promo_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  promoCodeId: uuid("promo_code_id")
    .notNull()
    .references(() => promoCodes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  bookingId: text("booking_id").references(() => bookings.id),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
});
