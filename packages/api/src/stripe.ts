import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

/** Null until a real Stripe account/keys exist — see PLAN.md Phase 2 open items. */
export const stripe = secretKey ? new Stripe(secretKey) : null;

if (!stripe) {
  console.warn("[@rmp/api] STRIPE_SECRET_KEY not set — Connect/Billing endpoints will throw until configured.");
}

export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  premium: process.env.STRIPE_PRICE_PREMIUM,
} as const;

export async function verifyStripeWebhook(request: Request): Promise<Stripe.Event> {
  if (!stripe) {
    throw new Error("Stripe isn't configured yet.");
  }
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
  if (!signature || !webhookSecret) {
    throw new Error("Missing Stripe webhook signature or signing secret.");
  }
  const body = await request.text();
  return stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
}
