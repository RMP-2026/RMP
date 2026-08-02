import { companies, db } from "@rmp/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { STRIPE_PRICE_IDS, stripe } from "../stripe";
import { companyProcedure, router } from "../trpc";

function requireStripe() {
  if (!stripe) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Billing isn't configured yet." });
  }
  return stripe;
}

export const billingRouter = router({
  /** Stripe Connect (Express) hosted onboarding — PLAN.md Phase 2. */
  connectOnboarding: companyProcedure
    .input(z.object({ returnUrl: z.string().url(), refreshUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const client = requireStripe();
      const company = await db.query.companies.findFirst({ where: eq(companies.id, input.companyId) });
      if (!company) throw new TRPCError({ code: "NOT_FOUND" });

      let accountId = company.stripeAccountId;
      if (!accountId) {
        const account = await client.accounts.create({ type: "express" });
        accountId = account.id;
        await db.update(companies).set({ stripeAccountId: accountId }).where(eq(companies.id, company.id));
      }

      const link = await client.accountLinks.create({
        account: accountId,
        type: "account_onboarding",
        return_url: input.returnUrl,
        refresh_url: input.refreshUrl,
      });
      return { url: link.url };
    }),

  /** Stripe Billing subscription checkout with a 1-month trial — PLAN.md Phase 2. */
  checkout: companyProcedure
    .input(
      z.object({
        tier: z.enum(["starter", "professional", "premium"]),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = requireStripe();
      const priceId = STRIPE_PRICE_IDS[input.tier];
      if (!priceId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: `No Stripe price configured for tier "${input.tier}".` });
      }

      const company = await db.query.companies.findFirst({ where: eq(companies.id, input.companyId) });
      if (!company) throw new TRPCError({ code: "NOT_FOUND" });

      let customerId = company.stripeCustomerId;
      if (!customerId) {
        const customer = await client.customers.create({ name: company.name, metadata: { companyId: company.id } });
        customerId = customer.id;
        await db.update(companies).set({ stripeCustomerId: customerId }).where(eq(companies.id, company.id));
      }

      const session = await client.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: { trial_period_days: 30, metadata: { companyId: company.id, tier: input.tier } },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      });
      return { url: session.url };
    }),
});
