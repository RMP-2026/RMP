import {
  inngest,
  stripeGracePeriod,
  stripeTrialWillEnd,
  syncStripeAccountUpdated,
  syncStripeSubscriptionUpdated,
  syncUserCreated,
  syncUserDeleted,
  syncUserUpdated,
  syncWaitlistEntryCreated,
  syncWaitlistEntryUpdated,
} from "@rmp/jobs";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreated,
    syncUserUpdated,
    syncUserDeleted,
    syncWaitlistEntryCreated,
    syncWaitlistEntryUpdated,
    syncStripeAccountUpdated,
    syncStripeSubscriptionUpdated,
    stripeTrialWillEnd,
    stripeGracePeriod,
  ],
});
