import { verifyStripeWebhook } from "@rmp/api";
import { inngest } from "@rmp/jobs";

// Events packages/jobs's Inngest functions act on — see PLAN.md Phase 2 (Connect
// account status, trial-end, payment-failed grace period/pause).
const FORWARDED_EVENTS = new Set([
  "account.updated",
  "customer.subscription.trial_will_end",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  let event;
  try {
    event = await verifyStripeWebhook(request);
  } catch (err) {
    console.error("Stripe webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (FORWARDED_EVENTS.has(event.type)) {
    await inngest.send({
      name: `stripe/${event.type}`,
      data: event.data.object,
      ts: event.created * 1000,
    });
  }

  return new Response("OK", { status: 200 });
}
