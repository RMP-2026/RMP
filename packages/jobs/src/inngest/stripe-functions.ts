import { bookings, companies, db, subscriptions } from "@rmp/db";
import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";

import { inngest } from "./client";

const SUBSCRIPTION_STATUS_MAP: Record<Stripe.Subscription.Status, "trialing" | "active" | "past_due" | "paused" | "canceled"> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  paused: "paused",
  canceled: "canceled",
  incomplete: "past_due",
  incomplete_expired: "canceled",
  unpaid: "past_due",
};

export const syncStripeAccountUpdated = inngest.createFunction(
  { id: "sync-stripe-account-updated", triggers: [{ event: "stripe/account.updated" }] },
  async ({ event }) => {
    const account = event.data as Stripe.Account;
    const status = account.charges_enabled && account.payouts_enabled ? "active" : "pending";
    await db.update(companies).set({ stripeAccountStatus: status, updatedAt: new Date() }).where(eq(companies.stripeAccountId, account.id));
  },
);

export const syncStripeSubscriptionUpdated = inngest.createFunction(
  { id: "sync-stripe-subscription-updated", triggers: [{ event: "stripe/customer.subscription.updated" }] },
  async ({ event }) => {
    const subscription = event.data as Stripe.Subscription;
    const companyId = subscription.metadata?.companyId;
    if (!companyId) return;

    const tier = (subscription.metadata?.tier as "starter" | "professional" | "premium" | undefined) ?? "starter";
    const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end
      ? new Date(subscription.items.data[0].current_period_end * 1000)
      : null;

    const status = SUBSCRIPTION_STATUS_MAP[subscription.status];

    await db
      .insert(subscriptions)
      .values({ companyId, tier, stripeSubscriptionId: subscription.id, status, trialEndsAt, currentPeriodEnd })
      .onConflictDoUpdate({
        target: subscriptions.companyId,
        set: { tier, stripeSubscriptionId: subscription.id, status, trialEndsAt, currentPeriodEnd, updatedAt: new Date() },
      });
  },
);

// Fires ~3 days before a trial ends. Notification sending is Phase 5 (Resend/Twilio
// aren't wired to this yet) — this just keeps the local trial_ends_at value current.
export const stripeTrialWillEnd = inngest.createFunction(
  { id: "stripe-trial-will-end", triggers: [{ event: "stripe/customer.subscription.trial_will_end" }] },
  async ({ event }) => {
    const subscription = event.data as Stripe.Subscription;
    if (!subscription.trial_end) return;
    await db
      .update(subscriptions)
      .set({ trialEndsAt: new Date(subscription.trial_end * 1000) })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  },
);

/**
 * Grace period: on a failed invoice, wait 3 days; if the subscription is still unpaid
 * by then, pause the company. Cancelled automatically if invoice.payment_succeeded
 * arrives for the same customer in the meantime — see PLAN.md Phase 2.
 */
export const stripeGracePeriod = inngest.createFunction(
  {
    id: "stripe-grace-period",
    triggers: [{ event: "stripe/invoice.payment_failed" }],
    cancelOn: [{ event: "stripe/invoice.payment_succeeded", match: "data.customer" }],
  },
  async ({ event, step }) => {
    const invoice = event.data as Stripe.Invoice;

    await step.sleep("grace-period", "3d");

    await step.run("pause-company", async () => {
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const stripeSubscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
      if (!stripeSubscriptionId) return;

      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
      });
      if (!subscription) return;

      await db
        .update(companies)
        .set({ status: "paused", updatedAt: new Date() })
        .where(eq(companies.id, subscription.companyId));
      await db.update(subscriptions).set({ status: "past_due", updatedAt: new Date() }).where(eq(subscriptions.id, subscription.id));

      // Pause semantics (PLAN.md Phase 2): any booking still "pending" the moment the
      // company pauses is auto-declined — CAS so a concurrent customer
      // cancel/company decline can't race it. approved/active bookings are untouched
      // and run to completion; payment voiding/notification wiring lands in Phase 4
      // once bookings/PaymentIntents actually exist.
      await db
        .update(bookings)
        .set({ status: "declined", updatedAt: new Date() })
        .where(and(eq(bookings.companyId, subscription.companyId), eq(bookings.status, "pending")));
    });
  },
);
