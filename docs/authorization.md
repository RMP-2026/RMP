# RMP Authorization System

RMP's authorization is currently one implemented layer plus one platform-role check:

1. **Platform role** — `customer` / `admin` only (`packages/db`'s `users.role`). Company-
   level access (owner/staff on a specific company) is `company_staff` membership, not a
   platform role — checked in `packages/api`'s `company` procedure builder, not here.
2. **Host subscription features** — Starter / Professional / Premium. Clerk Billing Plans
   + Features. Answers "what has this *specific host* paid to unlock." Never write
   `if (plan === "premium")` — always `hasFeature("feature_slug")`.

## History

Through Phase 0, RMP had a third layer: a custom, Postgres-backed, admin-editable
role/permission system (`customer`/`host`/`admin`/`support`/`moderator` roles, a
`permissions`/`role_permissions` matrix, `/admin/roles`, `/admin/audit-log`,
`withPermission()`). The Phase 1 monorepo migration (see `PLAN.md`) dropped those tables
(`permissions`, `roles`, `role_permissions`, `audit_log`) and reshaped `users` down to the
`customer`/`admin` model above — company-level access moved to `company_staff` membership.

The apps/mobile code built on that old system (`src/lib/permissions/`,
`src/lib/permissions-context.tsx`'s role/permission fields, `<Can permission=...>`,
`/admin/roles`, `/admin/subscriptions`, `/admin/audit-log` and their `api/admin/*` routes,
`src/inngest/functions.ts`'s billing-audit-log functions) was removed rather than left
throwing on missing tables. If a similar fine-grained RBAC system is needed again, design
it against `packages/db` from scratch rather than resurrecting the old catalog — the old
5-role model (`host`/`support`/`moderator` as platform roles) no longer matches how
company-level access works.

## Platform role gating

Both apps read the same Clerk session claim rather than doing a DB round-trip:

- `apps/web`'s `src/proxy.ts`: `sessionClaims.metadata.role`, 404s non-admins on
  `/(dashboard)/admin(.*)`.
- `apps/mobile`'s `src/app/admin/_layout.tsx` and `src/app/(home)/_layout.tsx`: same
  `sessionClaims.metadata.role` check, redirecting instead of 404ing.

The `metadata` claim is a Clerk Dashboard-configured session claim mirroring
`publicMetadata.role`, set server-side only — there's no self-service path that lets a
client set its own role.

## Host subscription features (Clerk Billing)

- Provisioned into Clerk Billing directly (Plans: `starter`, `professional`, `premium`;
  ~25 Features). `src/lib/subscription-features.ts` (apps/mobile) mirrors the slugs for
  compile-time safety. There's no Postgres mirror — Clerk Billing is the only source of
  truth.
- Cumulative via explicit feature attachment: Professional's Plan attaches every Starter
  slug plus its own new ones, Premium attaches Professional's (already including
  Starter's) plus its own. Vehicle-count limits (`vehicles_limit_5` / `vehicles_limit_15`
  / `vehicles_unlimited`) are the one non-cumulative exception — exactly one is attached
  per tier — resolved via `vehicleLimitFromFeatures()`.

### Server-side enforcement

`withFeature(key, handler)` (`apps/mobile/src/lib/features/middleware.ts`): uses Clerk's
full `authenticateRequest()` to get a `.has()`-capable auth object, checks
`auth.has({ feature: "user:<slug>" })`. The `user:` prefix is required — Clerk
disambiguates user-level vs. org-level plans/features and RMP's subscriptions are
user-level (see `toClerkFeatureCheck`/`toClerkPlanCheck`).

```ts
export const POST = withFeature("booking_instant", async (request, ctx) => { ... });
```

### Client-side gating (UI only — never the real check)

- `usePermissions()` (`apps/mobile/src/lib/permissions-context.tsx`): fetches
  `/api/me/permissions` once per sign-in (Clerk features + active plan, resolved
  server-side), cached in a context provider mounted at the app root.
- `<Can feature="...">` (`apps/mobile/src/components/Can.tsx`): the spec's example —
  Premium → `booking_instant` → Instant Booking toggle — is
  `<Can feature="booking_instant"><InstantBookingToggle /></Can>`.

The client fetch computes features via the same `auth.has()` server-side call `withFeature`
uses, rather than a direct client-side `@clerk/expo` `has()` call — this sidesteps
depending on that exact client API existing in the currently-installed SDK version, at the
cost of one extra round trip per sign-in (cached after that).

**Server re-checks everything.** Client-side `<Can>`/`usePermissions()` only hide UI —
every mutating route is wrapped in `withFeature` independently. A hidden button is not a
security boundary.
