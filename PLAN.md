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

- [x] Set repo-local git identity (`user.name = "RMP"`, `user.email =
      "tohotnow@outlook.com"`)
- [x] Baseline commit of the current state before restructuring (commit `d87c939` on
      `king`; full pre-rewrite copy also archived at
      `C:\Users\tohot\RMP-backup-pre-monorepo-2026-08-01`)
- [x] Create `apps/` and `packages/` directories
- [x] Move the Expo app (`src`, `app.json`, `expo-env.d.ts`, `assets`, `package.json`,
      `tsconfig.json`, plus `babel.config.js`/`eslint.config.js`/`global.css`/
      `metro.config.js`/`nativewind-env.d.ts`/`tailwind.config.js`/`patches/`/`eas.json`/
      `drizzle.config.ts`/`.env.local`/`android/` — not itemized in the original list but
      clearly belong with the app) into `apps/mobile/`. Note: `git mv` on `src/` itself
      failed with a Windows file-lock (`Permission denied`) — worked around with a
      verified copy + delete instead of a rename; git still recorded it as a rename via
      similarity detection
- [x] Remove `package-lock.json` (pnpm replaces npm at the root)
- [x] Add `pnpm-workspace.yaml` (`apps/*`, `packages/*`) — also holds `allowBuilds` for
      the packages pnpm blocks native/postinstall scripts for by default (`sharp`,
      `esbuild`, `@sentry/cli`, `unrs-resolver`, etc.) — all approved, all trusted
      ecosystem packages the toolchain needs
- [x] Add root `package.json` (`private: true`, `packageManager` pin, scripts delegating
      to `turbo run <task>`)
- [x] Add `turbo.json` pipeline (`build`, `dev`, `lint`, `typecheck`, `test`)
- [x] Add root `tsconfig.json` project-reference hub + `packages/config/tsconfig-base.json`
- [x] Rename `apps/mobile/package.json` name to `@rmp/mobile`
- [x] Configure `apps/mobile/metro.config.js` for pnpm/workspace symlink resolution
      (`watchFolders`, `nodeModulesPaths`, `unstable_enableSymlinks`,
      `disableHierarchicalLookup`)
- [x] Scaffold `apps/web` via `create-next-app` (TypeScript, App Router, Tailwind), rename
      to `@rmp/web`; pinned `turbopack.root` in `next.config.ts` to stop it from picking
      up an unrelated lockfile elsewhere on disk
- [x] Scaffold empty `packages/db`, `packages/shared`, `packages/api`, `packages/jobs`,
      `packages/config` with minimal stubs (each a real workspace member: `package.json` +
      `tsconfig.json` extending the shared base + a placeholder `src/index.ts`)
- [ ] Create Neon project (main branch = prod) — **needs you**: no Neon account/API
      access available to me; you already have a dev database (`DATABASE_URL`), this item
      is specifically about a separate prod branch/project
- [ ] Create Sentry projects for both apps — **needs you**: no Sentry account access;
      mobile already has a Sentry DSN configured, web needs its own project
- [ ] Create PostHog project, initialize SDK in both apps — **needs you** for project
      creation/API key; SDK wiring itself is a later-phase code task once the key exists
- [ ] Wire Axiom log drain for `apps/web` / `packages/jobs` — **needs you**: no Axiom
      account access
- [x] Add `.github/workflows/ci.yml` running `pnpm install --frozen-lockfile` +
      `turbo run lint typecheck build`
- [x] **Done-gate** (partial — see step-by-step test below): `pnpm install` +
      `pnpm turbo run build lint typecheck` all green except two **pre-existing**
      `apps/mobile` typedRoutes errors in `(auth)/forgot-password.tsx` and
      `(auth)/sign-in.tsx` (present before this rewrite, unrelated to it — left alone
      rather than guessed at). `expo start`/`next dev` booting and the Sentry/PostHog test
      event are yours to verify — I don't start dev servers or have those dashboards.

## Phase 1 — Auth + data layer

- [x] Write full Drizzle schema (`users`, `companies`, `company_staff`, `vehicles`,
      `bookings`, `booking_reservations`, `documents`, `messages`, `subscriptions`,
      `payouts`, `notifications`, `admin_audit_log`, `inspections`,
      `booking_extensions`, `favorites`, `promo_codes`, `promo_redemptions`,
      `deposit_holds`, `damage_claims`, `reviews`, `support_tickets`,
      `support_ticket_messages`, `chargebacks`) in `packages/db/src/schema/`.
      `users.role` is `customer`/`admin` only — company-level access is
      `company_staff` membership (`owner`/`staff`), not a platform role
- [x] Enable Postgres extensions: `btree_gist`, `cube`, `earthdistance`, `pg_trgm`
      (plus `pgcrypto` for the uuid PK columns) — `packages/db/src/extensions-and-constraints.sql`
- [x] Add the `bookings_no_overlap` `EXCLUDE USING gist` double-booking constraint,
      scoped to `pending`/`approved`/`active`/`blocked` via half-open
      `daterange(start_date, end_date, '[)')` overlap; the blocking-status set lives
      once in `packages/shared/src/booking-status.ts`
      (`BLOCKING_BOOKING_STATUSES`) for Phase 3's search query to reuse
- [x] Run initial Drizzle migration against Neon — required first dropping the
      pre-PLAN.md RBAC tables (`permissions`/`roles`/`role_permissions`/`audit_log`)
      and reshaping `users` (name -> first_name/last_name, role enum 5 values -> 2),
      confirmed with you before running since it was destructive; both are backed up
      (commit `d87c939`, folder backup)
- [x] Wire Clerk into `apps/mobile` (Google + Apple OAuth) — already done pre-rewrite
      via `useSSO()`; verified both providers enabled on the Clerk instance and the
      `rmp` deep-link scheme is configured
- [x] Wire Clerk into `apps/web` (`@clerk/nextjs`), add `proxy.ts` role gate (Next.js
      16 renamed `middleware.ts` -> `proxy.ts`) — added a `metadata` session claim
      (Clerk Dashboard) so `sessionClaims.metadata.role` is readable without a DB
      round-trip; admin routes 404 for non-admins, company-tier auth is a DB check
      inside packages/api's `companyProcedure`, not middleware
- [x] Add Clerk webhook (`user.created`/`updated`/`deleted`) syncing into `users` —
      `apps/web/src/app/api/webhooks/clerk` -> Inngest -> `packages/jobs`. The old
      `apps/mobile` copy of this is now redundant (see note below)
- [x] Add phone number collection + verification (Twilio Verify, decoupled from Clerk
      sign-in) — `packages/api`'s `phone.sendCode`/`phone.verifyCode`; throws a clear
      `PRECONDITION_FAILED` until `TWILIO_*` env vars are set (**needs you** — no
      Twilio account access available)
- [x] Stand up `packages/api` with `trpc.ts` (context + `public`/`protected`/`company`/
      `admin` procedure builders) and a round-trip `me` router
- [x] Add Upstash Ratelimit middleware to the tRPC procedure builders (on
      `protectedProcedure`, the base every other tier builds on) — fails open with a
      console warning until `UPSTASH_REDIS_REST_URL`/`_TOKEN` are set (**needs you** —
      no Upstash account access available)
- [x] Mount tRPC route handler in `apps/web` (`/api/trpc/[trpc]`, Node runtime)
- [x] Wire tRPC client in `apps/mobile` with Clerk bearer token — `apps/mobile/src/lib/trpc.ts`;
      `EXPO_PUBLIC_API_URL` must point at wherever `apps/web` is running
- [x] Add role-gated route-group skeletons in `apps/web`
      (`(dashboard)/company`, `(dashboard)/admin`)
- [x] **Done-gate** (partial — see step-by-step test below): `pnpm turbo run build lint
      typecheck` all green. Signing in on both apps, the `users` row syncing, and
      `trpc.me.get()` succeeding are yours to verify — I can't drive a browser/device or
      start dev servers. Rate-limit rejection can't be tested until Upstash is configured.

**Known breakage, not fixed here — your call**: the pre-PLAN.md RBAC admin screens in
`apps/mobile` (`/admin/roles`, `/admin/subscriptions`, `/admin/audit-log` and their
`api/admin/*` routes) query the tables just dropped (`permissions`/`roles`/
`role_permissions`/`audit_log`) and will now error if visited. Left as-is rather than
silently deleted — say the word and I'll remove them (they're in the backup either way).

## Phase 2 — Company onboarding + admin approval

- [x] Build "Join as Host" application flow (mobile form) —
      `apps/mobile/src/app/(home)/become-host/apply.tsx`; `become-host/index.tsx` now
      checks `company.mine` first and only shows "Get started" (→ apply) when the user
      has no company yet, shows a pending/rejected state otherwise, and skips straight
      to the existing vehicle-listing flow once approved
- [x] Add required cancellation-window selection (24h or 48h) to the application,
      stored as `companies.cancellationWindowHours`
- [x] Add ImageKit doc upload for business license / EIN / insurance —
      `packages/api`'s `upload.getAuthParams` (signed direct-to-ImageKit upload) +
      `apps/mobile/src/lib/imagekit-upload.ts`; replaces the old mocked-upload TODO in
      the pre-existing `become-host/photos.tsx`, though that screen itself is unchanged
      this phase
- [x] Add rental-agreement contract PDF upload (same flow, `expo-document-picker` for
      the PDF vs. `expo-image-picker` for photos) — `company.submitApplication` requires
      all four document types before creating the company row; each is a fresh,
      immutable `documents` row
- [x] Build admin pending-applications queue (`apps/web`) —
      `(dashboard)/admin/page.tsx`, per-document approve/reject plus a company-level
      approve/reject; company approval is blocked until every document is individually
      approved
- [x] Admin approval requires the rental-agreement PDF (and every other document)
      individually reviewed first — `admin.approveCompany` throws
      `PRECONDITION_FAILED` listing what's still pending; `admin.reviewDocument` records
      the decision against that exact `documents.id`, never "the company's contract" generically
- [x] Add `admin_audit_log` writes on every admin approve/reject action (`document.approved`/
      `document.rejected`/`company.approved`/`company.rejected`, all with `actorUserId`)
- [x] Set up Stripe Connect (Express) onboarding, hosted flow —
      `billing.connectOnboarding` (Account + Account Link)
- [x] Add Stripe `account.updated` webhook handler — `apps/web/api/webhooks/stripe` ->
      Inngest -> `packages/jobs`'s `syncStripeAccountUpdated`
- [x] Set up Stripe Billing subscription via Stripe Checkout with `trial_period_days: 30`
      — `billing.checkout`; needs `STRIPE_PRICE_{STARTER,PROFESSIONAL,PREMIUM}` price
      IDs once a real Stripe account exists
- [x] Wire Inngest: trial-end job (`stripeTrialWillEnd`) — keeps `subscriptions.trial_ends_at`
      current; actual notification send is Phase 5 (Resend/Twilio not wired to this yet)
- [x] Wire Inngest: grace-period job (`stripeGracePeriod`) — `step.sleep("3d")` after
      `invoice.payment_failed`, `cancelOn` matching `invoice.payment_succeeded` by
      Stripe customer id (Inngest's built-in cancellation, equivalent to a race against
      `step.waitForEvent`)
- [x] `paused` semantics: company + subscription flip to `paused`/`past_due`, and any
      `pending` booking for that company is auto-declined (a scoped `UPDATE ... WHERE
      status = 'pending'`, so it can't touch a booking another writer already moved).
      **Partial**: PaymentIntent voiding and customer notification aren't wired — there's
      no real booking/payment-creation flow yet to attach them to (Phase 4). Vehicles
      hidden from search and new-booking-rejection are enforced by Phase 3's search
      query and Phase 4's booking creation respectively, once those exist and check
      `company.status`. New-staff-invite-blocking is enforced now (`staff.invite` throws
      if the company is paused)
- [x] Build staff invite flow with seat-limit enforcement (1 Starter / 5 Professional /
      unlimited Premium) — `staff.invite`; invites an existing RMP user by email (no
      email-invitation-of-new-users yet, that's Resend/Phase 5 territory)
- [x] Apply rate limiting to document-submission endpoints — inherited for free:
      `company.submitApplication` and `upload.getAuthParams` build on `protectedProcedure`,
      which already rate-limits first (Phase 1)
- [x] **Done-gate** (partial — see step-by-step test below): `pnpm turbo run build lint
      typecheck` all green (a real bug surfaced and got fixed here: tRPC rejects `apply`
      as a procedure name — collides with `Function.prototype.apply` — renamed to
      `company.submitApplication`). The actual apply → approve → Connect/Billing →
      invite flow needs Stripe + ImageKit credentials to run end-to-end — yours to
      verify once those exist; see step-by-step below for what's testable now.

**Needs you**: Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SIGNING_SECRET`,
`STRIPE_PRICE_*`) and ImageKit (`IMAGEKIT_*`) credentials — no account access available
for either. Note: a "claude.ai Stripe" MCP connector is available but needs your
authorization (claude.ai connector settings) before I could use it instead of the
hand-written `stripe` SDK calls here.

## Phase 3 — Vehicle listing + search

- [ ] Build company dashboard vehicle CRUD (`apps/web`)
- [ ] Add ImageKit multi-image upload for vehicles
- [ ] Add `tags` field + trigram/tsvector indexes on `vehicles` and `companies`
- [ ] Build `search.query` tRPC procedure (fuzzy multi-field: make/model/year, company
      name, location, tags, plus a date-range param that excludes a vehicle only when
      it has a booking in a blocking status — the same shared `pending`/`approved`/
      `active`/`blocked` set used by the `bookings_no_overlap` constraint — whose
      half-open `[startDate, endDate)` range overlaps the query range; `declined`,
      `cancelled`, and `completed` bookings never exclude a vehicle); also excludes
      vehicles belonging to a `paused` company
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
      text matching (not a shared master template — every company's contract differs).
      Envelope creation is an external API call and can't be part of a Postgres
      transaction, so treat it with the same outbox discipline as the Stripe
      PaymentIntent step below: persist the resolved *admin-approved*
      rental-agreement `documents.id` plus a DocuSign idempotency key on the
      `booking_reservations` outbox row (status `pending`) before calling DocuSign,
      call DocuSign with that idempotency key (a retried request after a
      crash/timeout returns the same envelope instead of creating a duplicate), then
      write both `bookings.rentalAgreementDocumentId` and the resulting envelope ID
      onto the booking row transactionally with the outbox row's `committed` update —
      set once, together, and never overwritten. On DocuSign failure, mark the outbox
      row `failed` and void any authorized PaymentIntent rather than leaving a
      half-created booking; the same Inngest sweep job that catches orphaned
      PaymentIntents (below) also catches outbox rows stuck `pending` on the DocuSign
      step past its TTL. A company uploading/approving a replacement PDF afterward has
      no effect on any existing booking: the booking's stored document version and
      signed envelope remain the permanent record of what was actually presented and
      signed
- [ ] Create the Stripe PaymentIntent (manual capture) as a step separate from the
      booking insert — a single Postgres transaction can't include an external
      Stripe API call, so this needs to be an idempotent reservation with
      compensation, not a false "transactional" write:
      1. Generate the booking's id and a Stripe idempotency key up front, and write
         a `booking_reservations` outbox row (id, user, vehicle, date range,
         idempotency key, status `pending`) in its own short transaction — the
         durable record of intent to book, independent of whether Stripe or the
         booking insert ever succeeds.
      2. Call Stripe to create the PaymentIntent using that idempotency key, so a
         retried request after a crash/timeout returns the same PaymentIntent
         instead of authorizing the card twice.
      3. Insert the `bookings` row (carrying the PaymentIntent id) and mark the
         outbox row `committed` in one transaction — this is where the
         exclusion-constraint race from the item above is caught (`23P01`); on
         conflict, void the PaymentIntent and mark the outbox row `failed` rather
         than leaving it `pending`.
      Wire an Inngest sweep job that finds outbox rows still `pending` past a short
      TTL (crash between steps 2–3) and voids the associated PaymentIntent, so no
      booking attempt can leave an orphaned authorized-but-uncaptured PaymentIntent
      with no matching booking row
- [ ] Build company approve → capture PaymentIntent + push notification
- [ ] Build company decline → void PaymentIntent, dates auto-freed
- [ ] Build customer cancellation flow (pre-handoff), strictly binary per company's
      `cancellationWindowHours` (24 or 48) — no partial-refund scenarios in v1:
      - **Outside the window** (more than `cancellationWindowHours` before `startDate`):
        full refund. If the booking is still `pending` (PaymentIntent authorized,
        not captured), void it — same as the company-decline path. If already
        `approved` (PaymentIntent captured), issue a full Stripe refund.
      - **Inside the window, or exactly at the boundary** (`cancellationWindowHours`
        before `startDate`, inclusive): no refund. `pending` bookings still void
        the uncaptured authorization (nothing to keep, nothing was charged);
        `approved` bookings retain the full captured amount — no Stripe refund
        issued.
      - **Fees**: no separate cancellation/platform fee exists in v1 — "full refund"
        means the entire captured rental-fee amount. Stripe's own processing fee on
        a refund is not recovered by RMP or the company (standard Stripe behavior),
        same as any other refund.
      - Either outcome frees the dates via the same auto-decline mechanics as the
        company-decline path (releases the blocking status, `bookings_no_overlap`
        exclusion drops).
- [ ] Build handoff/complete actions driving `pending → approved → active →
      completed`; `declined` (company decline, above) and `cancelled` (customer
      cancellation, above) are the other two terminal states, branching off
      `pending`/`approved` instead of continuing the happy path — all five statuses
      live in the same `bookings.status` column, which is the queryable record other
      consumers (availability via `bookings_no_overlap`, Phase 3 search exclusion,
      Phase 5 notification fanout) already read; each transition action (approve,
      decline, cancel, handoff, complete) must guard on the row's current status so a
      retried request or duplicate webhook is a no-op rather than double-voiding/
      double-refunding
- [ ] Create deposit-hold Stripe PaymentIntent (manual capture, separate from the
      rental-fee PaymentIntent) at handoff, recorded in `deposit_holds`
- [ ] Wire Inngest payout-scheduling job on `completed` → Stripe Connect transfer →
      `payouts` row — checks the company isn't currently `paused` first; if paused, the
      job holds/retries rather than transferring, resuming automatically once the
      company is unpaused
- [ ] Wire Stripe `charge.dispute.created`/`.closed` webhook: insert one immutable,
      ledger-backed record into `chargebacks` keyed by a unique constraint on the
      Stripe dispute ID (`stripeDisputeId`) — a webhook retry re-delivering the same
      dispute is a no-op against that key (unique-violation swallowed, never a second
      row and never an overwrite of the row's identity fields). Track the dispute's
      mutable status (`open`/`won`/`lost`) on that same row via a compare-and-set
      update restricted to the explicit monotonic transitions `open -> won` and
      `open -> lost`; both are terminal, so a `.created` delivered after `.closed`,
      or any other out-of-order/duplicate delivery, is rejected by the CAS check and
      can never regress the row off its terminal status. Only a transition landing on
      `lost` triggers reconciliation. Reconcile the loss against the company's next
      not-yet-executed payout (deduct from the `payouts` row before its Stripe
      Connect transfer fires); if the relevant payout is insufficient to cover the
      loss or has already been sent, issue a direct invoice/debit for the shortfall
      instead. Reconciliation calls an external system (a real Stripe invoice/debit
      call on the shortfall path) that can't live inside the same Postgres
      transaction as the chargeback row update, so use the same outbox discipline as
      the Stripe PaymentIntent step in Phase 4: CAS
      `chargebacks.reconciliationStatus` from `unreconciled` to `reconciling`
      (checking rows-affected) in its own transaction as the durable claim on this
      chargeback, generating a Stripe idempotency key derived from the dispute ID at
      the same time. Then perform the payout deduction or invoice/debit call using
      that idempotency key (a retry after a crash/timeout hits the same invoice
      instead of billing twice), and CAS `reconciling` to `reconciled` — or to
      `failed`, from which reconciliation may be safely retried — once the call
      returns. An Inngest sweep job finds chargebacks stuck `reconciling` past a
      short TTL (crash after the claim, before the external call resolves) and
      re-drives them from `failed`, so a retried webhook can never double-deduct or
      double-invoice and no chargeback is left unreconciled. Chargebacks remain a
      company-vs-customer matter: RMP is not a party to the loss, only the
      ledger/reconciliation mechanism
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
- [ ] Serialize terminal transitions on `deposit_holds`: auto-release (Inngest job),
      claim creation, and admin claim resolution are three independent writers that can
      race on the same row (e.g. the auto-release job firing at the same instant a claim
      is filed, or a claim being resolved while a customer's contest is in flight). The
      Stripe release/capture call is external and can't be part of a Postgres
      transaction, so apply the same outbox discipline as the Stripe PaymentIntent step
      in Phase 4: each flow first CASes `deposit_holds.status` from `pending` to an
      intermediate `releasing`/`capturing` state (`UPDATE deposit_holds SET status =
      'releasing' WHERE id = $1 AND status = 'pending'`, checking rows-affected) — this
      is the durable claim, so exactly one of the three writers wins the race — using an
      idempotency key derived from the deposit hold ID and action so a retried Stripe
      call after a crash/timeout can't double-release/double-capture. Only the writer
      that wins the CAS calls Stripe, then updates the row to the terminal `released`/
      `captured` status (or back to `failed`, safely retryable, on a Stripe error). An
      Inngest sweep job finds holds stuck in `releasing`/`capturing` past a short TTL
      (crash between the CAS and the Stripe call resolving) and re-drives them, so
      exactly one release-or-capture outcome ever succeeds per deposit hold and none are
      left stranded mid-transition
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
      issues) alongside push/email, gated on both phone verification from Phase 1 and
      the user's current SMS consent/suppression state (opt-out honored at send time,
      not just checked at signup)
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
      reaches `completed`. Enforce "one per booking" with a database-level unique
      constraint on `reviews.booking_id` — not an application-level check alone —
      and authorize the submission by verifying the requesting user is the
      booking's customer, not merely any authenticated user, before insert. Catch
      the resulting Postgres unique-violation (`23505`) on that constraint and
      treat it as a no-op/idempotent response, so a retried request or concurrent
      duplicate submission can't create a second review or surface as a hard
      error. Shown as average + count on the company profile and vehicle detail
      pages (including the public SSR pages from Phase 3)
- [ ] Build `support_tickets` flow: simple contact/issue form (mobile + web) creating a
      ticket routed to an admin queue, status tracked (`open`/`resolved`). Build the full
      reply loop, not just outbound notifications:
      - Add a `support_ticket_messages` table (`ticketId`, `senderType`
        [`customer`/`admin`], `body`, `createdAt`) — tickets have no `booking_id`, so
        the existing per-booking `messages` table doesn't fit; this is a separate thread
        store.
      - **Inbound (email reply)**: every outbound ticket notification is sent from a
        per-ticket plus-addressed reply-to (e.g. `support+<ticketId>@mail.rmp.app`).
        Configure a Resend Inbound webhook (`email.received`) on that receiving domain,
        handled by an Inngest function (not the raw route handler, since Resend retries
        delivery and this must be idempotent on `message_id`); correlate to the ticket
        by parsing the ticket id out of the inbound `to` address (Resend's inbound
        payload does not reliably surface `In-Reply-To`/`References`, so header
        threading isn't used for correlation), strip quoted history from the body, and
        reject/drop mail addressed to an unknown or already-`resolved`-past-retention
        ticket id.
      - **In-app (authenticated reply)**: a `support.reply` tRPC procedure, authorized
        to only the ticket's owning customer or an admin (`protected`/`admin` procedure
        builder), for replying without leaving the app.
      - Both paths append a row to `support_ticket_messages` and update
        `support_tickets`: a customer reply reopens a `resolved` ticket to `open`; an
        admin reply leaves status unchanged unless the admin explicitly marks it
        resolved. Both then trigger the existing Inngest notification fanout (Resend
        email to the customer, in-app/admin-queue update for the admin side) so the
        other party sees the new message
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
  before go-live); DocuSign uses anchor-tab matching against it, not a shared template.
  Uploads are immutable/versioned (new upload = new `documents` row, admin-approved
  independently) and each booking pins the exact approved document version + envelope
  used at signing time — reflected in Phase 2 (upload/approval) and Phase 4 (DocuSign
  integration) — so a later PDF replacement can never alter an existing booking's
  contract or envelope source. The data-retention policy (Open items, below) treats a
  pinned version as part of that booking's retained legal record rather than as a
  generic KYC/business `documents` row, so it's excluded from account-deletion hard
  deletion for as long as the booking it's pinned to survives
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
- [ ] Data retention/deletion (v1 default): on account deletion, apply a per-table
      deletion vs. anonymization policy covering every PII-bearing record, not just
      `users`/`documents`:
      - **Hard-deleted**: `users` PII fields (name, email, phone, address), `documents`
        of KYC/business-verification type (business license, EIN, insurance PDFs and
        their ImageKit assets), `favorites`, `notifications` — no legal/financial
        reason to retain these past account closure. Rental-agreement contract
        `documents` rows are excluded from this pass whenever a booking references
        them — see the dedicated bullet below; only a rental-agreement version never
        pinned to any booking (a superseded draft or a rejected/never-approved upload)
        is hard-deleted here
      - **Anonymized, record kept**: `messages` (sender scrubbed to a placeholder,
        thread retained if the counterparty's booking record must survive),
        `reviews` (text/rating kept for the counterparty's public profile integrity,
        author identity unlinked), `support_tickets` (ticket/resolution kept for
        support-quality audit, requester PII scrubbed), `inspections` (photos/mileage
        kept as part of the booking's damage/dispute evidence trail, uploader identity
        unlinked), `admin_audit_log` (action/target kept for compliance, acting-admin
        identity retained only if the admin account itself is still active — otherwise
        anonymized on that admin's own deletion)
      - **Retained as-is**: `bookings`, payment records (PaymentIntents, `payouts`),
        `disputes`/`chargebacks` — required for financial/legal record-keeping; also
        retain third-party provider identifiers embedded in these rows (Stripe
        customer/PaymentIntent IDs, Persona inquiry IDs, DocuSign envelope IDs) since
        they're the audit trail back to those providers, even though the `users` row
        they'd normally join to has been scrubbed
      - **Rental-agreement `documents` rows pinned to a booking**: any rental-agreement
        PDF version referenced by `bookings.rentalAgreementDocumentId` is retained
        as-is (not hard-deleted, not anonymized) for as long as the booking it's pinned
        to is retained — it's the exact signed contract version the DocuSign envelope
        was built from, and the booking's foreign key depends on the row still
        existing; hard-deleting it on the uploading company's or renter's account
        deletion would both orphan that legal record and break referential integrity.
        A pinned version tied to a booking already under `legal_hold` (open dispute/
        chargeback/claim) naturally stays held for as long as that hold applies
      - **Legal hold**: any record subject to an open dispute, chargeback, subpoena, or
        active `damage_claims` contest is exempt from deletion/anonymization until that
        hold is lifted, regardless of the account-deletion request — add a
        `legal_hold` flag checked by the deletion job before it touches a row
      - Confirm exact retention periods per category with whoever reviews the ToS/
        Privacy Policy
- [ ] Android nearby-search map view — deferred to v2; v1 Android ships a
      distance-sorted list instead (needs its own Google Maps API key + billing when
      picked up)
- [ ] Promo codes (`promo_codes`/`promo_redemptions`) — explicitly v2, schema only for
      now, no UI/flow built in v1
