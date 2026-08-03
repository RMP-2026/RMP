import type { DeletedObjectJSON, UserJSON, WaitlistEntryJSON } from "@clerk/backend";
import { and, eq, isNull, lt, or } from "drizzle-orm";

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

// NOTE: this whole sync path (apps/mobile/src/db, apps/mobile/src/inngest,
// apps/mobile/src/app/api/webhooks) is superseded by packages/db + packages/jobs +
// apps/web's webhook route (PLAN.md Phase 1) — kept alive and enum-consistent so it
// doesn't error if it ever fires, not because it's still the intended path.
const VALID_ROLES = ["customer", "admin"] as const;

function roleFor(data: UserJSON): (typeof VALID_ROLES)[number] {
  const role = data.public_metadata?.role;
  return (VALID_ROLES as readonly string[]).includes(role as string) ? (role as (typeof VALID_ROLES)[number]) : "customer";
}

function upsertUser(data: UserJSON, clerkUpdatedAt: Date) {
  const { id, first_name, last_name, image_url } = data;
  const values = {
    email: primaryEmailFor(data),
    name: [first_name, last_name].filter(Boolean).join(" ") || null,
    imageUrl: image_url ?? null,
    role: roleFor(data),
  };

  return db
    .insert(users)
    .values({ id, ...values, clerkUpdatedAt })
    .onConflictDoUpdate({
      target: users.id,
      set: { ...values, clerkUpdatedAt, deletedAt: null, updatedAt: new Date() },
      // Only overwrite if this event is newer than what's stored, and don't resurrect
      // a user whose deletion is newer than this create/update.
      where: and(
        lt(users.clerkUpdatedAt, clerkUpdatedAt),
        or(isNull(users.deletedAt), lt(users.deletedAt, clerkUpdatedAt)),
      ),
    });
}

export const syncUserCreated = inngest.createFunction(
  { id: "sync-user-created", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const data = event.data as UserJSON;
    await upsertUser(data, new Date(event.ts ?? data.updated_at));
  },
);

export const syncUserUpdated = inngest.createFunction(
  { id: "sync-user-updated", triggers: [{ event: "clerk/user.updated" }] },
  async ({ event }) => {
    const data = event.data as UserJSON;
    await upsertUser(data, new Date(event.ts ?? data.updated_at));
  },
);

export const syncUserDeleted = inngest.createFunction(
  { id: "sync-user-deleted", triggers: [{ event: "clerk/user.deleted" }] },
  async ({ event }) => {
    const { id } = event.data as DeletedObjectJSON;
    if (!id) throw new Error("Clerk user.deleted webhook payload is missing an id");

    const deletedAt = new Date(event.ts ?? Date.now());

    await db
      .update(users)
      .set({ deletedAt, updatedAt: new Date() })
      // Don't let a stale delete regress a row a newer create/update has already advanced.
      .where(and(eq(users.id, id), lt(users.clerkUpdatedAt, deletedAt)));
  },
);

function upsertWaitlistEntry(data: WaitlistEntryJSON, clerkUpdatedAt: Date) {
  return db
    .insert(waitlistEntries)
    .values({
      id: data.id,
      email: data.email_address,
      status: data.status,
      clerkUpdatedAt,
    })
    .onConflictDoUpdate({
      target: waitlistEntries.id,
      set: {
        email: data.email_address,
        status: data.status,
        clerkUpdatedAt,
        updatedAt: new Date(),
      },
      // Only overwrite if this event is newer than what's stored.
      where: lt(waitlistEntries.clerkUpdatedAt, clerkUpdatedAt),
    });
}

export const syncWaitlistEntryCreated = inngest.createFunction(
  { id: "sync-waitlist-entry-created", triggers: [{ event: "clerk/waitlistEntry.created" }] },
  async ({ event }) => {
    const data = event.data as WaitlistEntryJSON;
    await upsertWaitlistEntry(data, new Date(event.ts ?? data.updated_at));
  },
);

export const syncWaitlistEntryUpdated = inngest.createFunction(
  { id: "sync-waitlist-entry-updated", triggers: [{ event: "clerk/waitlistEntry.updated" }] },
  async ({ event }) => {
    const data = event.data as WaitlistEntryJSON;
    await upsertWaitlistEntry(data, new Date(event.ts ?? data.updated_at));
  },
);

// The host subscription lifecycle -> audit_log functions that used to live here were
// removed: `audit_log` was dropped from Postgres in the Phase 1 monorepo migration (see
// PLAN.md), and this whole webhook/inngest copy is superseded by apps/web + packages/jobs
// anyway, which never reimplemented this audit trail — Clerk Billing is the source of
// truth for subscription state.
