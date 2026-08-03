import { companies, companyStaff, db, subscriptions, users } from "@rmp/db";
import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";

import { companyProcedure, router } from "../trpc";

const SEAT_LIMITS = { starter: 1, professional: 5, premium: Infinity } as const;

export const staffRouter = router({
  invite: companyProcedure
    .input(z.object({ email: z.string().email(), role: z.enum(["owner", "staff"]).default("staff") }))
    .mutation(async ({ input }) => {
      const company = await db.query.companies.findFirst({ where: eq(companies.id, input.companyId) });
      if (company?.status === "paused") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "New staff invites are blocked while the company is paused." });
      }

      const subscription = await db.query.subscriptions.findFirst({ where: eq(subscriptions.companyId, input.companyId) });
      const tier = subscription?.tier ?? "starter"; // no subscription yet = pre-Stripe-checkout, treat as Starter's limit

      const [{ seatCount }] = await db
        .select({ seatCount: count() })
        .from(companyStaff)
        .where(eq(companyStaff.companyId, input.companyId));

      if (seatCount >= SEAT_LIMITS[tier]) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Your ${tier} plan is limited to ${SEAT_LIMITS[tier]} staff seat(s). Upgrade to invite more.`,
        });
      }

      const invitee = await db.query.users.findFirst({ where: eq(users.email, input.email) });
      if (!invitee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No RMP account found for that email yet — they need to sign up first." });
      }

      const [staff] = await db
        .insert(companyStaff)
        .values({ companyId: input.companyId, userId: invitee.id, role: input.role, invitedAt: new Date() })
        .onConflictDoNothing()
        .returning();
      if (!staff) {
        throw new TRPCError({ code: "CONFLICT", message: "That person is already on this company's staff." });
      }
      return staff;
    }),

  list: companyProcedure.query(async ({ input }) => {
    return db.select().from(companyStaff).where(eq(companyStaff.companyId, input.companyId));
  }),
});
