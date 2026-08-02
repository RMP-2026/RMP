import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { companies } from "./companies";
import { users } from "./users";

// Business/KYC docs use "approved"/"rejected"; rental_agreement additionally needs
// admin review before it can be used as a DocuSign envelope source (Phase 2).
export const documentTypeEnum = pgEnum("document_type", [
  "business_license",
  "ein",
  "insurance",
  "rental_agreement",
  "kyc_selfie",
  "other",
]);
export const documentStatusEnum = pgEnum("document_status", ["pending", "approved", "rejected"]);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Exactly one of companyId/userId is set depending on document_type (company docs vs. user KYC).
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  imagekitFileId: text("imagekit_file_id").notNull(),
  url: text("url").notNull(),
  status: documentStatusEnum("status").notNull().default("pending"),
  reviewedByUserId: text("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  // Every upload is immutable — a replacement creates a new row, never overwrites this one.
  version: integer("version").notNull().default(1),
  supersedesDocumentId: uuid("supersedes_document_id").references((): AnyPgColumn => documents.id),
  legalHold: boolean("legal_hold").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
