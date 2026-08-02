import { adminAuditLog, companies, db, documents } from "@rmp/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../trpc";

async function logAudit(actorUserId: string, action: string, targetType: string, targetId: string, metadata?: Record<string, unknown>) {
  await db.insert(adminAuditLog).values({ actorUserId, action, targetType, targetId, metadata });
}

export const adminRouter = router({
  companiesPending: adminProcedure.query(async () => {
    const pending = await db.query.companies.findMany({ where: eq(companies.status, "pending") });
    const withDocs = await Promise.all(
      pending.map(async (company) => ({
        company,
        documents: await db.query.documents.findMany({ where: eq(documents.companyId, company.id) }),
      })),
    );
    return withDocs;
  }),

  /**
   * Approval is recorded against this exact document version (documents.id, not just
   * "the company's rental agreement generically") — see PLAN.md Phase 2.
   */
  reviewDocument: adminProcedure
    .input(z.object({ documentId: z.string().uuid(), decision: z.enum(["approved", "rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(documents)
        .set({ status: input.decision, reviewedByUserId: ctx.userId, reviewedAt: new Date() })
        .where(eq(documents.id, input.documentId))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND" });

      await logAudit(ctx.userId, `document.${input.decision}`, "document", input.documentId, {
        documentType: updated.type,
        companyId: updated.companyId,
      });
      return updated;
    }),

  /** Requires every document on the company — especially the rental agreement — to already be individually approved. */
  approveCompany: adminProcedure.input(z.object({ companyId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const companyDocs = await db.query.documents.findMany({ where: eq(documents.companyId, input.companyId) });
    const unapproved = companyDocs.filter((d) => d.status !== "approved");
    if (unapproved.length > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `${unapproved.length} document(s) still need review before this company can be approved.`,
      });
    }

    const [company] = await db
      .update(companies)
      .set({ status: "active", updatedAt: new Date() })
      .where(and(eq(companies.id, input.companyId), eq(companies.status, "pending")))
      .returning();
    if (!company) throw new TRPCError({ code: "NOT_FOUND" });

    await logAudit(ctx.userId, "company.approved", "company", input.companyId);
    return company;
  }),

  rejectCompany: adminProcedure
    .input(z.object({ companyId: z.string().uuid(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [company] = await db
        .update(companies)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(and(eq(companies.id, input.companyId), eq(companies.status, "pending")))
        .returning();
      if (!company) throw new TRPCError({ code: "NOT_FOUND" });

      await logAudit(ctx.userId, "company.rejected", "company", input.companyId, { reason: input.reason });
      return company;
    }),
});
