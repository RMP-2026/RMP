import { createClerkClient } from "@clerk/backend";

import { FEATURE_KEYS, SUBSCRIPTION_PLANS, toClerkFeatureCheck, toClerkPlanCheck } from "@/lib/subscription-features";

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!secretKey) {
  throw new Error("Add your Clerk Secret Key to the .env file");
}
if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const clerkClient = createClerkClient({ secretKey, publishableKey });

/**
 * Returns the caller's Clerk Billing plan/features (Host subscriptions). Backs the RN
 * `usePermissions()`/`useHasFeature()` hooks — computed server-side here as the source of
 * truth those hooks fall back to if the installed `@clerk/expo` client can't expose
 * `has()` directly.
 *
 * Previously also returned Postgres-backed role/permissions; that RBAC system (and its
 * `permissions`/`roles`/`role_permissions` tables) was dropped in the Phase 1 monorepo
 * migration (see PLAN.md) and removed here rather than left throwing on a missing table.
 */
export async function GET(request: Request) {
  const requestState = await clerkClient.authenticateRequest(request, { acceptsToken: "session_token" });
  const auth = requestState.toAuth();
  if (!auth?.userId) {
    return Response.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const features = FEATURE_KEYS.filter((key) => auth.has({ feature: toClerkFeatureCheck(key) }));
  const plan = SUBSCRIPTION_PLANS.find((p) => auth.has({ plan: toClerkPlanCheck(p.key) }))?.key ?? null;

  return Response.json({
    subscriptionPlan: plan,
    features,
  });
}
