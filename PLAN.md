# RMP — Build Plan Checklist

Living checklist for the RMP build, derived from the full architecture/spec doc. Check
items off as they're completed. Source of truth for *why* each decision was made lives in
the full plan at `C:\Users\tohot\.claude\plans\breezy-gathering-church.md` — this file is
just the task list.

**Stack**: Expo (React Native) + Clerk + Neon (Postgres) + Turborepo/pnpm + Next.js +
Drizzle + tRPC + Inngest + ImageKit + Persona + DocuSign + Stripe + Sentry + Upstash
Ratelimit + PostHog + Axiom + Better Uptime. No Flutter, no Firebase.

---

## Phase 0 — Monorepo scaffold + CI

- [ ] Set repo-local git identity (`user.name = "RMP"`, `user.email =
      "tohotnow@outlook.com"`)
- [ ] Baseline commit of the current vanilla Expo scaffold
- [ ] Create `apps/` and `packages/` directories
- [ ] `git mv` the Expo app (`src`, `app.json`, `expo-env.d.ts`, `assets`, `package.json`,
      `tsconfig.json`) into `apps/mobile/`
- [ ] Remove `package-lock.json` (pnpm replaces npm at the root)
- [ ] Add `pnpm-workspace.yaml` (`apps/*`, `packages/*`)
- [ ] Add root `package.json` (`private: true`, `packageManager` pin, scripts delegating
      to `turbo run <task>`)
- [ ] Add `turbo.json` pipeline (`build`, `dev`, `lint`, `typecheck`, `test`)
- [ ] Add root `tsconfig.json` project-reference hub + `packages/config/tsconfig-base.json`
- [ ] Rename `apps/mobile/package.json` name to `@rmp/mobile`
- [ ] Configure `apps/mobile/metro.config.js` for pnpm/workspace symlink resolution
      (`watchFolders`, `nodeModulesPaths`, `unstable_enableSymlinks`,
      `disableHierarchicalLookup`)
- [ ] Scaffold `apps/web` via `create-next-app` (TypeScript, App Router, Tailwind), rename
      to `@rmp/web`
- [ ] Scaffold empty `packages/db`, `packages/shared`, `packages/api`, `packages/jobs`,
      `packages/config` with minimal stubs
- [ ] Create Neon project (main branch = prod)
- [ ] Create Sentry projects for both apps
- [ ] Create PostHog project, initialize SDK in both apps (`posthog-js` web,
      `posthog-react-native` mobile) — events wired progressively in later phases
- [ ] Wire Axiom log drain for `apps/web` / `packages/jobs`
- [ ] Add `.github/workflows/ci.yml` running `turbo run lint typecheck build`
- [ ] **Done-gate**: `pnpm install` + `pnpm turbo run build lint typecheck` all green;
      `expo start` boots the default screen; `next dev` boots the default page; a test
      Sentry/PostHog event reaches both dashboards

## Phase 1 — Auth + data layer

- [ ] Write full Drizzle schema (`users`, `companies`, `company_staff`, `vehicles`,
      `bookings`, `documents`, `messages`, `subscriptions`, `payouts`, `notifications`,
      `admin_audit_log`, `inspections`, `booking_extensions`, `favorites`,
      `promo_codes`, `promo_redemptions`) in `packages/db/src/schema/`
- [ ] Enable Postgres extensions: `btree_gist`, `cube`, `earthdistance`, `pg_trgm`
- [ ] Add the `bookings_no_overlap` `EXCLUDE USING gist` double-booking constraint
- [ ] Run initial Drizzle migration against Neon
- [ ] Wire Clerk into `apps/mobile` (Google + Apple OAuth only, `@clerk/clerk-expo`)
- [ ] Wire Clerk into `apps/web` (`@clerk/nextjs`), add `middleware.ts` role gate
- [ ] Add Clerk webhook (`user.created`/`updated`/`deleted`) syncing into `users`
- [ ] Stand up `packages/api` with `trpc.ts` (context + `public`/`protected`/`company`/
      `admin` procedure builders) and a round-trip `me` router
- [ ] Add Upstash Ratelimit middleware to the tRPC procedure builders, applied first to
      auth/signup paths
- [ ] Mount tRPC route handler in `apps/web` (`/api/trpc/[trpc]`, Node runtime)
- [ ] Wire tRPC client in `apps/mobile` with Clerk bearer token
- [ ] Add role-gated route-group skeletons in `apps/web`
      (`(dashboard)/company`, `(dashboard)/admin`)
- [ ] **Done-gate**: sign in via Google or Apple on both mobile and web, `users` row
      syncs correctly, authenticated `trpc.me.get()` succeeds from both apps, and a
      rate-limit-exceeded request is correctly rejected

## Phase 2 — Company onboarding + admin approval

- [ ] Build "Join as Host" application flow (mobile form)
- [ ] Add ImageKit doc upload for business license / EIN / insurance
- [ ] Build admin pending-applications queue (`apps/web`)
- [ ] Add `admin_audit_log` writes on every admin approve/reject action
- [ ] Set up Stripe Connect (Express) onboarding, hosted flow
- [ ] Add Stripe `account.updated` webhook handler
- [ ] Set up Stripe Billing subscription via Stripe Checkout with `trial_period_days`
      (1-month trial)
- [ ] Wire Inngest: trial-end job
- [ ] Wire Inngest: grace-period job (`invoice.payment_failed` → 3-day
      `step.sleepUntil` → `paused`, with cancel-on-event for `invoice.payment_succeeded`)
- [ ] Build staff invite flow with seat-limit enforcement (1 / 5 / unlimited by tier)
- [ ] Apply rate limiting to document-submission endpoints (Persona/DocuSign calls cost
      money per use)
- [ ] **Done-gate**: apply → admin-approve → Connect+Billing onboarding → staff invite
      within tier limits, all reflected live to admin

## Phase 3 — Vehicle listing + search

- [ ] Build company dashboard vehicle CRUD (`apps/web`)
- [ ] Add ImageKit multi-image upload for vehicles
- [ ] Add `tags` field + trigram/tsvector indexes on `vehicles` and `companies`
- [ ] Build `search.query` tRPC procedure (fuzzy multi-field: make/model/year, company
      name, location, tags)
- [ ] Wire live-as-you-type search UI (debounced ~200-300ms)
- [ ] Build mobile nearby-search screen (`cube`/`earthdistance` radius query)
- [ ] Integrate Apple Maps (native MapKit via `react-native-maps`) on mobile
- [ ] Integrate Apple MapKit JS on the web dashboard
- [ ] Build company profile screen (fleet grid, socials, policies, verification badge —
      no ratings)
- [ ] Build vehicle detail screen
- [ ] Geocode company address → `lat`/`lng` at profile-save time
- [ ] Handle location-permission-denied fallback to manual city/zip search
- [ ] Apply rate limiting to the search endpoint (anti-scraping)
- [ ] **Done-gate**: a published active vehicle is immediately discoverable by
      name/make/tag search and displayed correctly with photos/pricing/policies, and
      the search endpoint is rate-limited

## Phase 4 — Booking + payment flow

- [ ] Build booking request flow with availability/exclusion-constraint race handling
      (catch Postgres `23P01`, void PaymentIntent on conflict)
- [ ] Integrate Persona KYC (one-time, triggered at first booking)
- [ ] Integrate DocuSign embedded signing for the rental agreement
- [ ] Create Stripe PaymentIntent (manual capture) transactionally with the booking
      insert
- [ ] Build company approve → capture PaymentIntent + push notification
- [ ] Build company decline → void PaymentIntent, dates auto-freed
- [ ] Build handoff/complete actions driving
      `pending → approved → active → completed`
- [ ] Wire Inngest payout-scheduling job on `completed` → Stripe Connect transfer →
      `payouts` row
- [ ] Build handoff/return photo inspection UI (mobile + web), submitting to
      `inspections` with mileage/fuel readings
- [ ] Build mileage/fuel overage billing: compute `overageAmountCents` from
      `inspections` readings vs. vehicle mileage limit / company fuel policy, create a
      second Stripe charge, store `overagePaymentIntentId`
- [ ] Write concurrency test: two overlapping booking inserts, exactly one succeeds
- [ ] **Done-gate**: full lifecycle (request → KYC → sign → authorize → approve →
      capture → handoff-with-photos → complete → return-with-photos →
      overage-charged-if-applicable → payout) works end-to-end in test mode

## Phase 5 — Messaging, notifications + company analytics

- [ ] Build `messages` tRPC router (per-booking thread)
- [ ] Wire polling/refetch UI (`refetchInterval` ~10-15s, not real-time chat)
- [ ] Register Expo push tokens
- [ ] Wire Inngest notification-fanout function (new message, booking status change)
- [ ] Build `notifications` table + web in-app notification center
- [ ] Wire Resend for transactional email (payment-failure reminders, document
      rejected, booking confirmations)
- [ ] Build company analytics dashboard — Starter: total bookings/revenue/upcoming
      bookings
- [ ] Build company analytics dashboard — Professional: booking trends over time,
      revenue-per-vehicle, repeat-vs-new customer breakdown, per-vehicle utilization
      rate
- [ ] Build company analytics dashboard — Premium: CSV/PDF export of any report
- [ ] Build `booking_extensions` flow: customer requests new end date → company
      approves/declines → incremental Stripe charge → `bookings.endDate` updated and
      re-validated against the exclusion constraint
- [ ] Build `favorites` CRUD + UI on vehicle/company cards
- [ ] **Done-gate**: reliable push + email delivery for every key lifecycle event, a
      company can view tier-appropriate analytics and export a report (Premium), a
      customer can extend a booking or save a favorite

## Phase 6 — Testing hardening + launch prep

- [ ] Backfill `packages/db` test coverage (Vitest against ephemeral Neon branch,
      including the double-booking concurrency test)
- [ ] Backfill `packages/shared` unit test coverage (pricing, subscription state
      machine, payout timing, availability logic)
- [ ] Write Playwright E2E suite for `apps/web` (admin approve/reject, vehicle CRUD,
      booking approve/decline+capture, billing/grace-period UI)
- [ ] Write Maestro E2E suite for `apps/mobile` (sign-in, search→book→pay, messaging)
- [ ] Verify insurance-expiration Inngest job (auto-suspend on lapse)
- [ ] Resolve iOS/Android bundle identifiers in `app.json`
- [ ] Configure EAS production build profile
- [ ] Set up Vercel production deployment
- [ ] Configure Better Uptime monitors on the API health endpoint + key third-party
      dependencies (Stripe, Persona, Clerk status)
- [ ] Draft, review (ideally lawyer-reviewed), and publish Terms of Service and
      Privacy Policy — hard launch blocker, not optional
- [ ] **Done-gate**: full CI green on `main`, staging walked end-to-end manually, EAS
      production builds produced for store submission, uptime monitoring is live,
      ToS/Privacy Policy published and linked from both apps

---

## Open items to resolve before/during the build (not blocking checklist progress, but tracked)

- [ ] Decide chargeback/clawback policy (RMP is merchant-of-record between capture and
      payout — who absorbs a chargeback loss?)
- [ ] Set up live accounts + API keys: Persona, DocuSign, Stripe (Connect + Billing),
      ImageKit, Inngest, Resend, Upstash, PostHog, Axiom, Better Uptime
- [ ] Decide iOS/Android bundle identifier (e.g. `com.rmp.app`) and confirm
      Apple/Google developer accounts
- [ ] Define cost/quota ceilings and what happens when a usage-based integration hits
      its limit
- [ ] Promo codes (`promo_codes`/`promo_redemptions`) — explicitly v2, schema only for
      now, no UI/flow built in v1
