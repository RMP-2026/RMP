import type { UserJSON } from "@clerk/backend";

import { db } from "@/db";
import { users } from "@/db/schema";

import { inngest } from "./client";

export const syncUserCreated = inngest.createFunction(
  { id: "sync-user-created", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { id, email_addresses, first_name, last_name, image_url } = event.data as UserJSON;

    await db
      .insert(users)
      .values({
        id,
        email: email_addresses[0]?.email_address ?? "",
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url ?? null,
      })
      .onConflictDoNothing({ target: users.id });
  },
);
