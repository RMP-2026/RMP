import { verifyWebhook } from "@clerk/backend/webhooks";

import { inngest } from "@/inngest/client";

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

  if (event.type === "user.created") {
    await inngest.send({
      name: "clerk/user.created",
      data: event.data,
    });
  }

  return new Response("OK", { status: 200 });
}
