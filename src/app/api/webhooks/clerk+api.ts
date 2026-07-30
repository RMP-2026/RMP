import { verifyWebhook } from "@clerk/backend/webhooks";

import { inngest } from "@/inngest/client";

const FORWARDED_EVENTS = new Set([
  "user.created",
  "user.updated",
  "user.deleted",
  "waitlistEntry.created",
  "waitlistEntry.updated",
]);

export async function POST(request: Request) {
  let event;

  try {
    event = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    });
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (FORWARDED_EVENTS.has(event.type)) {
    await inngest.send({
      name: `clerk/${event.type}`,
      data: event.data,
    });
  }

  return new Response("OK", { status: 200 });
}
