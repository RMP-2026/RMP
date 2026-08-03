import { serve } from "inngest/edge";

import { inngest } from "@/inngest/client";
import {
  syncUserCreated,
  syncUserDeleted,
  syncUserUpdated,
  syncWaitlistEntryCreated,
  syncWaitlistEntryUpdated,
} from "@/inngest/functions";

const handler = serve({
  client: inngest,
  functions: [syncUserCreated, syncUserUpdated, syncUserDeleted, syncWaitlistEntryCreated, syncWaitlistEntryUpdated],
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
