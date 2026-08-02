# RMP Authorization System

RMP's authorization is two independent, composable layers. Neither is ever checked by
name in business logic — only by permission/feature key.

1. **Role permissions** — `customer` / `host` / `admin` / `support` / `moderator`. Custom,
   Postgres-backed, admin-editable. Answers "what can this *kind of user* do."
2. **Host subscription features** — Starter / Professional / Premium. Clerk Billing Plans
   + Features. Answers "what has this *specific host* paid to unlock."

A Host user always has the `host` role; their subscription only adds feature entitlements
on top of the Host role's base permissions. Never write `if (role === "admin")` or
`if (plan === "premium")` — always `hasPermission("resource:action")` or
`hasFeature("feature_slug")`.

## Architecture

```
User (Clerk)
 ├─ publicMetadata.role ──► Postgres users.role ──► role_permissions ──► permissions
 │                                                   (admin-editable, /admin/roles)
 └─ Clerk Billing subscription (Host only) ──► Plan → Features
                                                (admin-editable, Clerk Dashboard)
```

- **Role permissions**: `src/lib/permissions/catalog.ts` is the versioned TS source of
  truth for permission keys (compile-time typo safety). `npm run db:seed-permissions`
  upserts it into Postgres (`permissions`, `roles`, `role_permissions`). The DB tables are
  the live, admin-editable record — editing them (via `/admin/roles` or directly) changes
  behavior with no deploy.
- **Subscription features**: provisioned into Clerk Billing directly (Plans: `starter`,
  `professional`, `premium`; ~25 Features). `src/lib/subscription-features.ts` mirrors the
  slugs for compile-time safety. There's no Postgres mirror — Clerk Billing is the only
  source of truth, and `src/app/api/admin/subscriptions+api.ts` reads it live for the
  admin summary screen.

## Permission inheritance

- **Roles**: flat. Each role has its own fixed permission set (no role hierarchy).
- **Subscription tiers**: cumulative via explicit feature attachment, not duplication.
  Each feature slug is defined once; Professional's Plan attaches every Starter slug plus
  its own new ones, Premium attaches Professional's (already including Starter's) plus its
  own. Vehicle-count limits (`vehicles_limit_5` / `vehicles_limit_15` / `vehicles_unlimited`)
  are the one non-cumulative exception — exactly one is attached per tier — resolved via
  `vehicleLimitFromFeatures()` in `subscription-features.ts`.

## Server-side enforcement

- `withPermission(key, handler)` (`src/lib/permissions/middleware.ts`): verifies the Clerk
  bearer token, loads the caller's role from Postgres, resolves permissions (5-entry
  in-memory cache, 60s TTL — cardinality is just the 5 roles), 403s if `key` isn't granted.
- `withFeature(key, handler)` (`src/lib/features/middleware.ts`): uses Clerk's full
  `authenticateRequest()` to get a `.has()`-capable auth object, checks
  `auth.has({ feature: "user:<slug>" })`. The `user:` prefix is required — Clerk
  disambiguates user-level vs. org-level plans/features and RMP's subscriptions are
  user-level (see `toClerkFeatureCheck`/`toClerkPlanCheck`).
- Both forward a `params` argument for dynamic route segments (Expo Router's `+api.ts`
  convention — `[roleKey]+api.ts` receives `{ roleKey }` as the handler's third arg).

```ts
export const POST = withPermission("bookings:approve", async (request, ctx) => { ... });
export const POST = withFeature("booking_instant", async (request, ctx) => { ... });
```

## Client-side gating (UI only — never the real check)

- `usePermissions()` (`src/lib/permissions-context.tsx`): fetches `/api/me/permissions`
  once per sign-in (role + permissions + Clerk features + active plan, all resolved
  server-side in one call), cached in a context provider mounted at the app root.
- `<Can permission="...">` / `<Can feature="...">` / `<Can anyPermission={[...]}>`
  (`src/components/Can.tsx`): the spec's example —
  Premium → `booking_instant` → Instant Booking toggle — is
  `<Can feature="booking_instant"><InstantBookingToggle /></Can>`.

The client fetch computes features via the same `auth.has()` server-side call `withFeature`
uses, rather than a direct client-side `@clerk/expo` `has()` call — this sidesteps
depending on that exact client API existing in the currently-installed SDK version, at the
cost of one extra round trip per sign-in (cached after that).

## Admin dashboard

- `/admin/roles`: toggle any permission on/off for any role. Blocks revoking `admin`'s own
  `permissions:manage`/`roles:manage` (the one hard-coded guard rail, to prevent an admin
  locking every admin out).
- `/admin/subscriptions`: read-only summary of the 3 Clerk Billing plans, pulled live via
  `@clerk/backend`'s `clerkClient.billing.getPlanList()`. Edits happen in the Clerk
  Dashboard, not here — there's no reason to rebuild Clerk's own plan editor in-app.
- `/admin/audit-log`: the most recent 100 `audit_log` rows.

## Audit logging

`logAudit()` (`src/lib/permissions/audit.ts`) writes to Postgres `audit_log`
(`actorUserId`, `action`, `targetType`, `targetId`, `metadata`, `createdAt`). Two sources:

1. Role/permission edits — `PATCH /api/admin/roles/[roleKey]/permissions`.
2. Host subscription lifecycle — Clerk billing webhooks
   (`subscription.created/updated`, `subscriptionItem.active/canceled/pastDue/expired`)
   forwarded through the existing Clerk webhook → Inngest pipeline
   (`src/app/api/webhooks/clerk+api.ts` → `src/inngest/functions.ts`), the same mechanism
   already used for user sync. This is a local record only — Clerk Billing itself remains
   the source of truth for current subscription state.

## Future roles

Adding a role (Fleet Manager, Accounting, Marketing, Regional Manager, API Client,
Insurance Auditor, Read-only Investor, ...) doesn't change this architecture:

1. `ALTER TYPE user_role ADD VALUE 'fleet_manager';` — additive, safe, no table rewrite.
2. Add the role + its permission list to `src/lib/permissions/catalog.ts`.
3. `npm run db:seed-permissions`.

No changes to `withPermission`, `usePermissions`, `<Can>`, or any admin screen — they're
all already generic over `RoleKey`/`PermissionKey`.

There's intentionally no per-user permission override table. Every future role in the spec
is a genuinely new *role*, not a per-user exception, so the role/role_permissions model
covers it without extra schema.

## Best practices & security notes

- **Never branch on role/plan name in business logic.** `hasPermission()`/`hasFeature()`
  only. This is what makes the admin dashboard's toggles actually take effect everywhere
  instead of only in the places someone remembered to update.
- **Server re-checks everything.** Client-side `<Can>`/`usePermissions()` only hide UI —
  every mutating route is wrapped in `withPermission`/`withFeature` independently. A
  hidden button is not a security boundary.
- **The `admin` role can't revoke its own permission-management access** — see
  `PATCH /api/admin/roles/[roleKey]/permissions`. Losing `permissions:manage` on `admin`
  would require a direct DB fix to recover from.
- **Cache TTL is a deliberate 60s tradeoff**, not an oversight: role_permissions changes
  are rare (an admin action), and the cache key space is just the 5 roles, so a short TTL
  plus the explicit `invalidateRoleCache()` call inside the PATCH handler means edits are
  visible immediately to the admin who made them and within a minute to everyone else. If
  this ever needs to be instant across many server instances, the scaling path is a shared
  cache (Redis/edge KV) invalidated on write — not built now because it's not in the
  current stack and the cardinality doesn't justify it yet.
- **Clerk publicMetadata.role is set server-side only** (`src/app/api/host/apply+api.ts`
  is the one self-service exception, and it only grants `host`, never `admin`/`support`/
  `moderator`). Don't add a path that lets a client set its own role directly.
