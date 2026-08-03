import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { companies } from "./companies";

export const vehicleStatusEnum = pgEnum("vehicle_status", ["draft", "live", "paused", "hidden"]);

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  slug: text("slug").unique(), // optional individual public URL (Phase 3)
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  trim: text("trim"),
  type: text("type").notNull(), // SUV/Truck/Sedan/Convertible/Van/Luxury etc.
  seats: integer("seats"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  fuel: text("fuel"),
  mpg: integer("mpg"),
  pricePerDayCents: integer("price_per_day_cents").notNull(),
  mileageLimitPerDay: integer("mileage_limit_per_day"), // null = unlimited; drives Phase 4 overage billing
  unlimitedDistance: boolean("unlimited_distance").notNull().default(false),
  wheelchairAccessible: boolean("wheelchair_accessible").notNull().default(false),
  features: text("features").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]), // trigram/tsvector search (Phase 3)
  photos: jsonb("photos").$type<string[]>().notNull().default([]), // ImageKit URLs
  status: vehicleStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
