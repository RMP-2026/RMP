import type { DeletedObjectJSON, UserJSON, WaitlistEntryJSON } from "@clerk/backend";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, waitlistEntries } from "@/db/schema";

import { inngest } from "./client";

function primaryEmailFor(data: UserJSON) {
  const { id, email_addresses, primary_email_address_id } = data;
  const primaryEmail = (email_addresses as ((typeof email_addresses)[number] & { id: string })[]).find(
    (email) => email.id === primary_email_address_id,
  );
  if (!primaryEmail) {
    throw new Error(`Clerk user ${id} has no primary email address`);
  }
  return primaryEmail.email_address;
}

function roleFor(data: UserJSON): "customer" | "host" | "admin" {
  const role = data.public_metadata?.role;
  return role === "admin" || role === "host" ? role : "customer";
}

export const syncUserCreated = inngest.createFunction(
  { id: "sync-user-created", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const data = event.data as UserJSON;
    const { id, first_name, last_name, image_url } = data;

    await db
      .insert(users)
      .values({
        id,
        email: primaryEmailFor(data),
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url ?? null,
        role: roleFor(data),
      })
      .onConflictDoNothing({ target: users.id });
  },
);

export const syncUserUpdated = inngest.createFunction(
  { id: "sync-user-updated", triggers: [{ event: "clerk/user.updated" }] },
  async ({ event }) => {
    const data = event.data as UserJSON;
    const { id, first_name, last_name, image_url } = data;

    await db
      .update(users)
      .set({
        email: primaryEmailFor(data),
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url ?? null,
        role: roleFor(data),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  },
);

export const syncUserDeleted = inngest.createFunction(
  { id: "sync-user-deleted", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    const { id } = event.data as DeletedObjectJSON;
    if (!id) throw new Error("Clerk user.deleted webhook payload is missing an id");

    await db.delete(users).where(eq(users.id, id));
  },
);

function upsertWaitlistEntry(data: WaitlistEntryJSON) {
  return db
    .insert(waitlistEntries)
    .values({
      id: data.id,
      email: data.email_address,
      status: data.status,
    })
    .onConflictDoUpdate({
      target: waitlistEntries.id,
      set: {
        email: data.email_address,
        status: data.status,
        updatedAt: new Date(),
      },
    });
}

export const syncWaitlistEntryCreated = inngest.createFunction(
  { id: "sync-waitlist-entry-created", triggers: [{ event: "clerk/waitlistEntry.created" }] },
  async ({ event }) => {
    await upsertWaitlistEntry(event.data as WaitlistEntryJSON);
  },
);

export const syncWaitlistEntryUpdated = inngest.createFunction(
  { id: "sync-waitlist-entry-updated", triggers: [{ event: "clerk/waitlistEntry.updated" }] },
  async ({ event }) => {
    await upsertWaitlistEntry(event.data as WaitlistEntryJSON);
  },
);
