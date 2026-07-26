# RMP — Build Plan Checklist

Living checklist for the RMP build, derived from the full architecture/spec doc. Check
items off as they're completed. Source of truth for *why* each decision was made lives in
the full plan at `C:\Users\tohot\.claude\plans\breezy-gathering-church.md` — this file is
just the task list.

**Stack**: Expo (React Native) + Clerk + Neon (Postgres) + Turborepo/pnpm + Next.js +
Drizzle + tRPC + Inngest + ImageKit + Persona + DocuSign + Stripe + Sentry + Upstash
Ratelimit + PostHog + Axiom + Better Uptime + Resend + Twilio. No Flutter, no Firebase.

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
      `promo_codes`, `promo_redemptions`, `deposit_holds`, `damage_claims`, `reviews`,
      `support_tickets`, `chargebacks`) in `packages/db/src/schema/`
- [ ] Enable Postgres extensions: `btree_gist`, `cube`, `earthdistance`, `pg_trgm`
- [ ] Add the `bookings_no_overlap` `EXCLUDE USING gist` double-booking constraint
- [ ] Run initial Drizzle migration against Neon
- [ ] Wire Clerk into `apps/mobile` (Google + Apple OAuth only, `@clerk/clerk-expo`)
- [ ] Wire Clerk into `apps/web` (`@clerk/nextjs`), add `middleware.ts` role gate
- [ ] Add Clerk webhook (`user.created`/`updated`/`deleted`) syncing into `users`
- [ ] Add phone number collection + verification (Twilio Verify, decoupled from Clerk
      sign-in) as a post-signup step, stored on `users`, gating SMS notification opt-in
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
- [ ] Add required cancellation-window selection (24h or 48h, one must be chosen) to
      the application, stored as `companies.cancellationWindowHours`
- [ ] Add ImageKit doc upload for business license / EIN / insurance
- [ ] Add rental-agreement contract PDF upload to the application (same `documents` +
      ImageKit flow, new document type) — each company brings its own contract, not a
      shared master template
- [ ] Build admin pending-applications queue (`apps/web`)
- [ ] Admin approval must explicitly include reviewing the uploaded rental-agreement
      PDF, not just KYC/business documents — it's the renter's real legal exposure
- [ ] Add `admin_audit_log` writes on every admin approve/reject action
- [ ] Set up Stripe Connect (Express) onboarding, hosted flow
- [ ] Add Stripe `account.updated` webhook handler
- [ ] Set up Stripe Billing subscription via Stripe Checkout with `trial_period_days`
      (1-month trial)
- [ ] Wire Inngest: trial-end job
- [ ] Wire Inngest: grace-period job (`invoice.payment_failed` → 3-day
      `step.sleepUntil` → `paused`, with cancel-on-event for `invoice.payment_succeeded`)
- [ ] Define `paused` semantics precisely: vehicles hidden from search/public pages,
      new booking requests rejected, new staff invites blocked — but any booking
      already active/approved before the pause continues its normal lifecycle
      uninterrupted (handoff, return, messaging, overage billing all still work)
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
      name, location, tags, plus a date-range param that excludes vehicles already
      booked for any overlapping day via the `bookings` exclusion constraint); also
      excludes vehicles belonging to a `paused` company
- [ ] Wire live-as-you-type search UI (debounced ~200-300ms) with a date-range picker
- [ ] Build mobile nearby-search screen (`cube`/`earthdistance` radius query) — iOS
      gets the map view; Android v1 ships a distance-sorted list (no map), Android map
      integration deferred to v2 (see open items)
- [ ] Integrate Apple Maps (native MapKit via `react-native-maps`) on mobile (iOS)
- [ ] Integrate Apple MapKit JS on the web dashboard
- [ ] Build company profile screen (fleet grid, socials, policies, verification badge,
      average rating + review count)
- [ ] Build vehicle detail screen
- [ ] Add `slug` field to `companies` (and `vehicles` if given individual public URLs)
- [ ] Build public, unauthenticated, SSR company profile page (`apps/web`, e.g. `/c/[slug]`)
      and vehicle detail page (e.g. `/v/[slug]`) — outside the `(dashboard)` route group,
      indexable by search engines
- [ ] Add `sitemap.xml`/`robots.txt` generation covering public company/vehicle pages
- [ ] Add Open Graph / Twitter meta tags (title, description, image) to public pages so
      listings render nicely when shared
- [ ] Geocode company address → `lat`/`lng` at profile-save time
- [ ] Handle location-permission-denied fallback to manual city/zip search
- [ ] Apply rate limiting to the search endpoint (anti-scraping)
- [ ] **Done-gate**: a published active vehicle is immediately discoverable by
      name/make/tag search and a date-range filter correctly excludes already-booked
      vehicles, displayed correctly with photos/pricing/policies, the search endpoint
      is rate-limited, and the public company/vehicle pages are indexable and render
      correct OG previews when shared

## Phase 4 — Booking + payment flow

- [ ] Build booking request flow with availability/exclusion-constraint race handling
      (catch Postgres `23P01`, void PaymentIntent on conflict)
- [ ] Integrate Persona KYC (one-time, triggered at first booking)
- [ ] Integrate DocuSign embedded signing using each company's own uploaded
      rental-agreement PDF as the envelope source document, with
      signature/date/renter-name/vehicle/price fields placed via DocuSign anchor-tab
      text matching (not a shared master template — every company's contract differs)
- [ ] Create Stripe PaymentIntent (manual capture) transactionally with the booking
      insert
- [ ] Build company approve → capture PaymentIntent + push notification
- [ ] Build company decline → void PaymentIntent, dates auto-freed
- [ ] Build customer cancellation flow (pre-handoff): refund policy read from the
      booking's company (`companies.cancellationWindowHours`, 24 or 48) — full refund
      outside that window before start, none inside it — partial/full Stripe refund
      issued, dates auto-freed
- [ ] Build handoff/complete actions driving
      `pending → approved → active → completed`
- [ ] Create deposit-hold Stripe PaymentIntent (manual capture, separate from the
      rental-fee PaymentIntent) at handoff, recorded in `deposit_holds`
- [ ] Wire Inngest payout-scheduling job on `completed` → Stripe Connect transfer →
      `payouts` row — checks the company isn't currently `paused` first; if paused, the
      job holds/retries rather than transferring, resuming automatically once the
      company is unpaused
- [ ] Wire Stripe `charge.dispute.created`/`.closed` webhook: on a lost dispute, record
      it in `chargebacks` and deduct the loss from the company's next payout (or
      invoice/debit directly if the relevant payout is insufficient or already sent) —
      chargebacks are a company-vs-customer matter, RMP is not a party to the loss
- [ ] Build handoff/return photo inspection UI (mobile + web), submitting to
      `inspections` with mileage/fuel readings
- [ ] Build mileage/fuel overage billing: compute `overageAmountCents` from
      `inspections` readings vs. vehicle mileage limit / company fuel policy, create a
      second Stripe charge, store `overagePaymentIntentId`
- [ ] Build damage-claim flow: company can file a claim in `damage_claims` against the
      return-inspection photos within a configurable window (e.g. 48–72h after
      `completed`); Inngest job auto-releases the `deposit_holds` row if no claim is
      filed in that window
- [ ] Build damage-claim resolution: approved → partial/full capture of the deposit
      PaymentIntent; denied → release; add a customer-facing "contest this claim" path
      routed to an admin queue
- [ ] Write concurrency test: two overlapping booking inserts, exactly one succeeds
- [ ] **Done-gate**: full lifecycle (request → KYC → sign → authorize → approve →
      capture → handoff-with-photos-and-deposit-hold → complete → return-with-photos →
      overage-charged-if-applicable → deposit-released-or-claimed → payout) works
      end-to-end in test mode, a customer cancellation before handoff correctly
      refunds per the company's chosen window and frees the dates, and a simulated
      lost dispute correctly deducts from the company's payout

## Phase 5 — Messaging, notifications + company analytics

- [ ] Build `messages` tRPC router (per-booking thread)
- [ ] Wire polling/refetch UI (`refetchInterval` ~10-15s, not real-time chat)
- [ ] Register Expo push tokens
- [ ] Wire Inngest notification-fanout function (new message, booking status change)
- [ ] Build `notifications` table + web in-app notification center
- [ ] Wire Resend for transactional email (payment-failure reminders, document
      rejected, booking confirmations)
- [ ] Wire Twilio for time-critical SMS (booking approved, pickup reminder, handoff
      issues) alongside push/email, gated on the phone verification from Phase 1
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
- [ ] Build `reviews` flow: customer submits a 1-5 star + text review once a booking
      reaches `completed` (one per booking), shown as average + count on the company
      profile and vehicle detail pages (including the public SSR pages from Phase 3)
- [ ] Build `support_tickets` flow: simple contact/issue form (mobile + web) creating a
      ticket routed to an admin queue, status tracked (`open`/`resolved`), replies via
      Resend
- [ ] **Done-gate**: reliable push + email + SMS delivery for every key lifecycle
      event, a company can view tier-appropriate analytics and export a report
      (Premium), a customer can extend a booking, save a favorite, leave a review
      after completion, and file a support ticket that reaches the admin queue

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

## Decisions log (resolved — kept for reference, not action items)

- **Chargebacks**: company absorbs the loss, not RMP — reflected in Phase 4's
  `charge.dispute` webhook, which claws back from the company's payout
- **Cancellation window**: per-company choice of 24h or 48h (required at onboarding),
  not a single global rule — reflected in Phase 2 (`companies.cancellationWindowHours`)
  and Phase 4 (cancellation flow reads it)
- **Reviews**: in scope for v1 (basic 1-5 star + text, post-completion) — reflected in
  Phase 3 (profile display) and Phase 5 (`reviews` build)
- **SMS**: in scope for v1 via Twilio — reflected in Phase 1 (phone verification) and
  Phase 5 (send wiring)
- **Support channel**: in-app contact/ticket form in v1, not email-only — reflected in
  Phase 5 (`support_tickets`)
- **Search date filter**: in scope for v1 — reflected in Phase 3
- **Maps**: iOS gets the map view in v1; Android ships a list view, map deferred to v2
  (see open item below)
- **Insurance/liability**: fully external to RMP — company and customer only; RMP is
  marketplace/software infrastructure, not a party to the rental agreement
- **Rental agreement**: each company uploads/owns its own contract PDF (admin-reviewed
  before go-live); DocuSign uses anchor-tab matching against it, not a shared template
- **Multi-location**: single address per company for v1 — reflected as-is in the
  existing schema, no change needed
- **Paused companies**: only new activity is blocked (new listings/bookings/staff);
  in-flight bookings run to completion, payouts hold rather than skip — reflected in
  Phase 2, 3, and 4

## Open items to resolve before/during the build (not blocking checklist progress, but tracked)

- [ ] Confirm ToS/Privacy Policy language is explicit that RMP is a marketplace/software
      platform only — not a party to the rental agreement and not an insurer; insurance
      and damage liability are between the company and customer
- [ ] Set up live accounts + API keys: Persona, DocuSign, Stripe (Connect + Billing),
      ImageKit, Inngest, Resend, Twilio, Upstash, PostHog, Axiom, Better Uptime
- [ ] Bundle identifier: using `com.rmp.app` as a placeholder through development —
      finalize the real value (and confirm Apple/Google developer accounts) before the
      EAS production build in Phase 6, since changing it after store submission means
      a new app listing
- [ ] Cost/quota ceilings (v1 default): rely on the existing Upstash rate-limit
      middleware plus Axiom usage alerts on paid-per-use integrations (Persona,
      DocuSign, Twilio, ImageKit); no automated hard-cutoff in v1 — an admin manually
      pauses an account if usage looks abusive
- [ ] Data retention/deletion (v1 default): on account deletion, scrub PII from
      `users`/`documents`; retain booking/payment/dispute/chargeback records for
      financial/legal record-keeping (confirm the exact retention period with whoever
      reviews the ToS/Privacy Policy)
- [ ] Android nearby-search map view — deferred to v2; v1 Android ships a
      distance-sorted list instead (needs its own Google Maps API key + billing when
      picked up)
- [ ] Promo codes (`promo_codes`/`promo_redemptions`) — explicitly v2, schema only for
      now, no UI/flow built in v1
