/**
 * Canonical permission catalog for RMP's role-based access control.
 *
 * This is the versioned source of truth seeded into Postgres (see
 * src/db/seed-permissions.ts) — the DB stays the live, admin-editable record of which
 * permissions a role currently grants, but every key used in code is defined here first,
 * so `hasPermission("vehicles:view")` gets compile-time typo safety.
 *
 * Adding a role later (Fleet Manager, Accounting, ...): add a RoleKey value + an entry
 * here, then `ALTER TYPE user_role ADD VALUE '...'` in Postgres. No other code changes.
 */

export type RoleKey = "customer" | "host" | "admin" | "support" | "moderator";

export const ROLE_KEYS: readonly RoleKey[] = ["customer", "host", "admin", "support", "moderator"];

export const ROLE_METADATA: Record<RoleKey, { name: string; description: string }> = {
  customer: {
    name: "Customer",
    description:
      "Browses vehicles, verifies identity, books vehicles, communicates with hosts, manages trips, makes payments, and reviews completed rentals.",
  },
  host: {
    name: "Host",
    description: "Rental companies that manage fleets, bookings, pricing, calendars, customers, and earnings.",
  },
  admin: {
    name: "Admin",
    description: "Full platform administrator with unrestricted access.",
  },
  support: {
    name: "Support",
    description: "Customer support staff.",
  },
  moderator: {
    name: "Moderator",
    description: "Marketplace trust and safety.",
  },
};

const PERMISSION_ENTRIES = {
  customer: [
    ["vehicles:view", "Browse vehicle listings and details."],
    ["vehicles:search", "Search and filter available vehicles."],
    ["companies:view", "View rental company profiles and fleets."],
    ["bookings:create", "Submit a new vehicle booking."],
    ["bookings:view_own", "View one's own current and past bookings."],
    ["bookings:cancel_own", "Cancel one's own eligible bookings."],
    ["trips:manage_own", "Manage one's own active and upcoming trips."],
    ["payments:create", "Pay for bookings, deposits, and approved charges."],
    ["payments:view_own", "View one's own payment history and receipts."],
    ["payment_methods:manage_own", "Add or remove one's own payment methods."],
    ["documents:upload_license", "Upload a driver's license for verification."],
    ["documents:upload_identity", "Upload identity-verification documents."],
    ["documents:view_own", "View the status of one's own uploaded documents."],
    ["agreements:sign", "Review and sign rental agreements."],
    ["messages:send", "Send messages to hosts or support."],
    ["messages:view_own", "View one's own conversations."],
    ["favorites:manage", "Save and remove favorite vehicles."],
    ["reviews:create", "Review a completed booking."],
    ["profile:manage_own", "Update one's own profile information."],
    ["notifications:manage_own", "Manage one's own notification preferences."],
  ],
  host: [
    ["company:manage", "Manage the host's rental company account."],
    ["company:view_dashboard", "View the host dashboard."],
    ["company:view_profile", "View the host's public company profile."],
    ["employees:manage", "Manage employees on the host account."],
    ["vehicles:create", "Add a new vehicle listing."],
    ["vehicles:update", "Edit an existing vehicle listing."],
    ["vehicles:delete", "Remove a vehicle listing."],
    ["vehicles:view_own", "View the host's own vehicle listings."],
    ["photos:upload", "Upload vehicle photos."],
    ["pricing:manage", "Manage vehicle pricing."],
    ["calendar:view", "View the booking calendar."],
    ["calendar:manage", "Manage availability on the booking calendar."],
    ["bookings:view", "View bookings for the host's fleet."],
    ["bookings:approve", "Approve a pending booking request."],
    ["bookings:reject", "Reject a pending booking request."],
    ["customers:view", "View customers who have booked the host's vehicles."],
    ["deposits:manage", "Manage security deposits."],
    ["earnings:view", "View earnings."],
    ["withdrawals:create", "Withdraw earnings."],
    ["agreements:manage", "Manage rental agreements."],
    ["insurance:manage", "Manage insurance coverage."],
    ["policies:manage", "Manage rental policies."],
    ["notifications:manage", "Manage host notification settings."],
    ["subscription:view", "View the host's subscription plan."],
    ["subscription:update", "Change the host's subscription plan."],
    ["locations:manage", "Manage pickup/dropoff locations."],
    ["analytics:basic", "View basic host analytics."],
  ],
  admin: [
    ["users:manage", "Manage any platform user."],
    ["roles:manage", "Manage roles."],
    ["permissions:manage", "Manage which permissions a role grants."],
    ["hosts:manage", "Manage host accounts."],
    ["companies:manage", "Manage rental companies."],
    ["vehicles:manage", "Manage any vehicle listing."],
    ["bookings:manage", "Manage any booking."],
    ["payments:manage", "Manage payments platform-wide."],
    ["refunds:manage", "Issue and manage refunds."],
    ["subscriptions:manage", "Manage host subscriptions platform-wide."],
    ["verification:manage", "Manage identity/document verification."],
    ["support:manage", "Manage the support desk."],
    ["reviews:manage", "Manage reviews platform-wide."],
    ["reports:view", "View platform reports."],
    ["analytics:view", "View platform-wide analytics."],
    ["feature_flags:manage", "Manage feature flags."],
    ["moderation:manage", "Manage trust & safety moderation."],
    ["system_settings:manage", "Manage system-wide settings."],
  ],
  support: [
    ["users:view", "View platform users."],
    ["hosts:view", "View host accounts."],
    ["companies:view", "View rental company profiles and fleets."],
    ["bookings:view", "View bookings for the host's fleet."],
    ["payments:view", "View payments."],
    ["verification:view", "View identity/document verification status."],
    ["tickets:manage", "Manage support tickets."],
    ["messages:view", "View user conversations."],
    ["credits:issue", "Issue account credits."],
    ["accounts:suspend", "Suspend a user account."],
  ],
  moderator: [
    ["companies:review", "Review a rental company for trust & safety."],
    ["vehicles:review", "Review a vehicle listing for trust & safety."],
    ["photos:review", "Review uploaded photos for trust & safety."],
    ["reviews:review", "Review a submitted review for trust & safety."],
    ["listings:approve", "Approve a pending listing."],
    ["listings:reject", "Reject a pending listing."],
    ["listings:suspend", "Suspend a live listing."],
    ["accounts:flag", "Flag a user account for review."],
    ["messages:moderate", "Moderate messages between users."],
    ["fraud:review", "Review a suspected fraud case."],
    ["verification:review", "Review a pending identity/document verification."],
  ],
} as const satisfies Record<RoleKey, readonly (readonly [string, string])[]>;

export type PermissionKey = (typeof PERMISSION_ENTRIES)[RoleKey][number][0];

export const ROLE_PERMISSIONS: Record<RoleKey, readonly PermissionKey[]> = {
  customer: PERMISSION_ENTRIES.customer.map(([key]) => key),
  host: PERMISSION_ENTRIES.host.map(([key]) => key),
  admin: PERMISSION_ENTRIES.admin.map(([key]) => key),
  support: PERMISSION_ENTRIES.support.map(([key]) => key),
  moderator: PERMISSION_ENTRIES.moderator.map(([key]) => key),
};

/** Deduped catalog of every permission key (some keys are shared across roles, e.g. `companies:view`). */
export const PERMISSIONS: readonly { key: PermissionKey; resource: string; action: string; description: string }[] =
  (() => {
    const descriptionByKey = new Map<PermissionKey, string>();
    for (const role of ROLE_KEYS) {
      for (const [key, description] of PERMISSION_ENTRIES[role]) {
        descriptionByKey.set(key, description);
      }
    }
    return Array.from(descriptionByKey.entries()).map(([key, description]) => {
      const [resource, action] = key.split(":");
      return { key, resource, action, description };
    });
  })();
