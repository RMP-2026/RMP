import { companies, companyStaff, db, documents } from "@rmp/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { companyProcedure, protectedProcedure, router } from "../trpc";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

const documentInput = z.object({
  type: z.enum(["business_license", "ein", "insurance", "rental_agreement"]),
  imagekitFileId: z.string(),
  url: z.string().url(),
});

export const companyRouter = router({
  /**
   * "Join as Host" application (PLAN.md Phase 2). Creates the company (status
   * "pending"), the applicant as its owner, and the uploaded verification/agreement
   * documents — all pending admin review. Rate-limited via protectedProcedure's base
   * middleware (document-submission endpoints per Phase 2's rate-limit item).
   */
  submitApplication: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        cancellationWindowHours: z.enum(["24", "48"]),
        addressLine1: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().min(1),
        documents: z.array(documentInput).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const requiredTypes = new Set<"business_license" | "ein" | "insurance" | "rental_agreement">([
        "business_license",
        "ein",
        "insurance",
        "rental_agreement",
      ]);
      const providedTypes = new Set(input.documents.map((d) => d.type));
      const missing = [...requiredTypes].filter((t) => !providedTypes.has(t));
      if (missing.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Missing required document(s): ${missing.join(", ")}` });
      }

      const [company] = await db
        .insert(companies)
        .values({
          ownerId: ctx.userId,
          name: input.name,
          slug: slugify(input.name),
          status: "pending",
          cancellationWindowHours: input.cancellationWindowHours,
          addressLine1: input.addressLine1,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
        })
        .returning();

      await db.insert(companyStaff).values({
        companyId: company.id,
        userId: ctx.userId,
        role: "owner",
        joinedAt: new Date(),
      });

      await db.insert(documents).values(
        input.documents.map((doc) => ({
          companyId: company.id,
          type: doc.type,
          imagekitFileId: doc.imagekitFileId,
          url: doc.url,
          status: "pending" as const,
        })),
      );

      return company;
    }),

  /** The signed-in user's companies (owner or staff). */
  mine: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select({ company: companies, role: companyStaff.role })
      .from(companyStaff)
      .innerJoin(companies, eq(companies.id, companyStaff.companyId))
      .where(eq(companyStaff.userId, ctx.userId));
  }),

  get: companyProcedure.query(async ({ input }) => {
    const company = await db.query.companies.findFirst({ where: eq(companies.id, input.companyId) });
    if (!company) throw new TRPCError({ code: "NOT_FOUND" });
    return company;
  }),
});
