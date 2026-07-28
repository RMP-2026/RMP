import { serve } from "inngest/edge";

import { inngest } from "@/inngest/client";
import { syncUserCreated } from "@/inngest/functions";

const handler = serve({
  client: inngest,
  functions: [syncUserCreated],
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
