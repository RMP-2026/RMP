import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { companies } from "./companies";
import { documents } from "./documents";
import { users } from "./users";
import { vehicles } from "./vehicles";

// The full lifecycle. "pending"/"approved"/"active"/"blocked" are the set that blocks a
// date range (see bookings_no_overlap in the extensions/constraints migration) — kept in
// sync with packages/shared's BLOCKING_BOOKING_STATUSES constant, which the Phase 3
// search-availability query also reads instead of re-deriving its own list.
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "approved",
  "active",
  "blocked",
  "completed",
  "declined",
  "cancelled",
]);

export const bookings = pgTable("bookings", {
  // Generated application-side (not defaultRandom) so it can be shared with the
  // booking_reservations outbox row created in the same step — see Phase 4.
  id: text("id").primaryKey(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id),
  status: bookingStatusEnum("status").notNull().default("pending"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  dailyRateCents: integer("daily_rate_cents").notNull(), // snapshot at booking time
  totalAmountCents: integer("total_amount_cents").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  rentalAgreementDocumentId: uuid("rental_agreement_document_id").references(() => documents.id), // pinned version — Phase 4
  docusignEnvelopeId: text("docusign_envelope_id"),
  overageAmountCents: integer("overage_amount_cents"),
  overagePaymentIntentId: text("overage_payment_intent_id"),
  legalHold: boolean("legal_hold").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookingReservationStatusEnum = pgEnum("booking_reservation_status", [
  "pending",
  "committed",
  "failed",
]);

// Outbox row for the booking-creation flow: written before the Stripe PaymentIntent
// call, since a single Postgres transaction can't span an external API call — see
// Phase 4. Its id is the same value later used as bookings.id.
export const bookingReservations = pgTable("booking_reservations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  stripeIdempotencyKey: text("stripe_idempotency_key").notNull(),
  status: bookingReservationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookingExtensionStatusEnum = pgEnum("booking_extension_status", [
  "pending",
  "approved",
  "declined",
]);

export const bookingExtensions = pgTable("booking_extensions", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  newEndDate: date("new_end_date").notNull(),
  status: bookingExtensionStatusEnum("status").notNull().default("pending"),
  additionalAmountCents: integer("additional_amount_cents").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inspectionTypeEnum = pgEnum("inspection_type", ["handoff", "return"]);

export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  type: inspectionTypeEnum("type").notNull(),
  mileageReading: integer("mileage_reading").notNull(),
  fuelReading: text("fuel_reading"), // e.g. "full", "3/4" — company-defined scale
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
