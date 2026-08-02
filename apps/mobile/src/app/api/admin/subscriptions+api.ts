import { createClerkClient } from "@clerk/backend";

import { withPermission } from "@/lib/permissions/middleware";

const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  throw new Error("Add your Clerk Secret Key to the .env file");
}

const clerkClient = createClerkClient({ secretKey });

/** Admin-only, read-only: Host subscription plans + features, sourced live from Clerk Billing — not mirrored in Postgres. Edit plans/features in the Clerk Dashboard, not here. */
export const GET = withPermission("subscriptions:manage", async () => {
  const { data: plans } = await clerkClient.billing.getPlanList({ payerType: "user" });

  return Response.json({
    plans: plans
      .filter((plan) => !plan.isDefault)
      .map((plan) => ({
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        feeCents: plan.fee?.amount ?? 0,
        currency: plan.fee?.currency ?? "usd",
        features: plan.features.map((feature) => ({ slug: feature.slug, name: feature.name })),
      })),
  });
});
