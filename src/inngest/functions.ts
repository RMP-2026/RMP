import type { UserJSON } from "@clerk/backend";

import { db } from "@/db";
import { users } from "@/db/schema";

import { inngest } from "./client";

export const syncUserCreated = inngest.createFunction(
  { id: "sync-user-created", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } =
      event.data as UserJSON;

    const primaryEmail = (email_addresses as ((typeof email_addresses)[number] & { id: string })[]).find(
      (email) => email.id === primary_email_address_id,
    );
    if (!primaryEmail) {
      throw new Error(`Clerk user ${id} has no primary email address`);
    }

    await db
      .insert(users)
      .values({
        id,
        email: primaryEmail.email_address,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url ?? null,
      })
      .onConflictDoNothing({ target: users.id });
  },
);
