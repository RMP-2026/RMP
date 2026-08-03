import { inngest } from "@rmp/jobs";
import { verifyWebhook } from "@clerk/backend/webhooks";

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
    const ts =
      "updated_at" in event.data && typeof event.data.updated_at === "number" ? event.data.updated_at : Date.now();

    await inngest.send({
      name: `clerk/${event.type}`,
      data: event.data,
      ts,
    });
  }

  return new Response("OK", { status: 200 });
}
