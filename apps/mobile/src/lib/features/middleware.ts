import { createClerkClient } from "@clerk/backend";

import type { FeatureKey } from "@/lib/subscription-features";
import { toClerkFeatureCheck } from "@/lib/subscription-features";

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!secretKey) {
  throw new Error("Add your Clerk Secret Key to the .env file");
}
if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const clerkClient = createClerkClient({ secretKey, publishableKey });

export type FeatureContext = { userId: string };

/** Wraps an Expo Router `+api.ts` handler so it only runs once the caller's active Clerk Billing plan grants `featureKey`. Never check the plan name — only the feature. The `params` arg forwards dynamic route segments. */
export function withFeature(
  featureKey: FeatureKey,
  handler: (request: Request, ctx: FeatureContext, params: Record<string, string>) => Promise<Response>,
) {
  return async (request: Request, params: Record<string, string> = {}): Promise<Response> => {
    const requestState = await clerkClient.authenticateRequest(request, { acceptsToken: "session_token" });
    const auth = requestState.toAuth();
    if (!auth?.userId) {
      return Response.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    if (!auth.has({ feature: toClerkFeatureCheck(featureKey) })) {
      return Response.json({ error: "Forbidden — upgrade required" }, { status: 403 });
    }

    return handler(request, { userId: auth.userId }, params);
  };
}
