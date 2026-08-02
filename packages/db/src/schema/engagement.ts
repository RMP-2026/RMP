import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { bookings } from "./bookings";
import { companies } from "./companies";
import { users } from "./users";
import { vehicles } from "./vehicles";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  senderUserId: text("sender_user_id").references(() => users.id, { onDelete: "set null" }), // scrubbed on account deletion, thread retained
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g. "booking_status_changed", "new_message"
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  // One review per booking, enforced at the DB level (unique), not just app-level.
  bookingId: text("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  authorUserId: text("author_user_id").references(() => users.id, { onDelete: "set null" }), // identity unlinked on deletion, text/rating kept
  rating: integer("rating").notNull(), // 1-5, enforced by a CHECK constraint in the migration
  body: text("body"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
