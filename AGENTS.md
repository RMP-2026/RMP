# RMP is now a pnpm/Turborepo monorepo

The single-app Expo project has been restructured into `apps/mobile` (Expo, was the
whole repo before), `apps/web` (Next.js), and `packages/{db,shared,api,jobs,config}`.
See `PLAN.md` for the full build plan/checklist and `docs/authorization.md` for the
RBAC/subscription system. `pnpm` is the package manager (not npm) — run everything from
the repo root via `pnpm turbo run <task>`, or scope to one workspace with
`pnpm --filter @rmp/mobile <script>`.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Tech stack

- **Monorepo**: pnpm workspaces + Turborepo. `apps/mobile` (Expo), `apps/web` (Next.js),
  `packages/db` (Drizzle schema/client), `packages/shared` (cross-app types/constants/
  business logic), `packages/api` (tRPC routers), `packages/jobs` (Inngest functions),
  `packages/config` (shared tsconfig base). Workspace packages are referenced via
  `workspace:*` and imported as `@rmp/db`, `@rmp/shared`, etc. — never a relative
  `../../packages/...` import across a package boundary.
- Expo SDK ~57, React Native 0.86, React 19.2 (`apps/mobile`)
- expo-router with `typedRoutes` and `reactCompiler` experiments enabled — don't manually memoize with useMemo/useCallback for render perf, and use typed `href`s (no raw string routes)
- NativeWind v4 + Tailwind for all mobile styling — do not use StyleSheet.create or another styling library
- @expo/ui and native tabs for mobile UI/navigation — see "Native-first UI" below. The mobile app should feel and behave like a native app, not a JS-rendered one.
- Next.js (App Router) + Tailwind for `apps/web` — the company/admin dashboard
- tRPC (`packages/api`) as the API layer, consumed from both apps — `public`/`protected`/`company`/`admin` procedure builders, Clerk-authenticated
- @clerk/expo (mobile) / @clerk/nextjs (web) for auth — mobile's token-cache pattern in `apps/mobile/src/app/_layout.tsx` stays as-is; don't change ClerkProvider/tokenCache wiring without reason. Clerk webhooks (`CLERK_WEBHOOK_SIGNING_SECRET`) sync user data server-side. Host subscriptions run on **Clerk Billing** (User Plans: Starter/Professional/Premium + Features) — see `docs/authorization.md`; general marketplace billing (Stripe Connect + Stripe Billing per PLAN.md Phase 2) is separate and still to be built.
- Postgres via Neon (`DATABASE_URL`) as the database, schema/client living in `packages/db` once Phase 1 lands (currently still in `apps/mobile/src/db` pending that migration)
- Drizzle ORM for all schema and queries — no raw SQL strings outside Drizzle, no other ORM (Prisma, etc.)
- ImageKit for image upload/optimization/delivery (`IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`) — don't store or serve raw unoptimized images
- Inngest (`packages/jobs`) for background jobs / async workflows (`INNGEST_DEV`) — long-running or deferred work goes through Inngest functions, not ad-hoc server-side timers or fire-and-forget promises
- @sentry/react-native/expo (mobile) + @sentry/nextjs (web) for error tracking — `Sentry.wrap(RootLayout)` must stay the default export of `apps/mobile/src/app/_layout.tsx`
- Persona for KYC, DocuSign for rental-agreement e-signature, Stripe (Connect + Billing) for company payments/payouts/marketplace subscriptions, Twilio for SMS, Resend for transactional email, Upstash for rate limiting, PostHog for product analytics, Axiom for log aggregation, Better Uptime for monitoring — all per `PLAN.md`; **not yet wired up** as of Phase 0 (scaffold only), don't assume any of these are live until the corresponding phase says so
- OpenAI API is available (`OPENAI_API_KEY`) for AI-powered features
- Unsplash API is available (`UNSPLASH_ACCESS_KEY`/`UNSPLASH_SECRET_KEY`), currently used for stock/seed imagery

## Native-first UI — always use native tabs (mobile)

- The mobile app must always use **native tabs**, never a JavaScript-rendered tab bar. Tab navigation is a hard requirement, not a preference.
- Import from `expo-router/unstable-native-tabs` (`NativeTabs`, `NativeTabs.Trigger`, `.Icon`, `.Label`, `.Badge`). Do not use the old JS-based `expo-router/tabs`, a hand-rolled tab bar, or any third-party tab component.
- `@expo/ui` has no tab component of its own (SwiftUI `TabView` is not exposed through it) — native tabs always come from expo-router, not @expo/ui. Use `@expo/ui` for other native SwiftUI/Jetpack Compose elements (buttons, switches, pickers, etc.) where a native look matters.
- Native tabs are alpha (SDK 54+): max 5 tabs on Android, no nested native tabs, tabs can't be added/removed at runtime. Confirm these limits still hold against the SDK 57 docs before relying on them.
- Prefer native/platform components generally over custom JS re-implementations of standard UI (tabs, pickers, switches, etc.) — check `@expo/ui` first before reaching for a JS-only component.

## Dev servers

- Never run `expo start`, `next dev`, `pnpm dev`/`turbo run dev`, or any other command that launches either app. The user runs dev servers themselves in a separate terminal.
- If you need to verify a change, ask the user to check it in their running instance instead of starting your own.
- **File-lock note (Windows)**: a running Expo/Metro dev server holds open handles on files under `apps/mobile/src/`, which blocks directory renames/moves (`git mv` fails with `Permission denied`) even though file edits/deletes are unaffected. If a move fails this way, ask the user to stop the dev server first rather than working around it silently.

## Project conventions

- Mobile route groups (`apps/mobile/src/app/`): `(auth)` for unauthenticated screens, `(home)` for authenticated screens, `admin` (its own `Stack` > `(tabs)` nested group, mirroring `(home)`'s pattern) for the RBAC-gated admin area — place new screens accordingly
- Cross-package imports use the workspace package name (`@rmp/db`, `@rmp/shared`, `@rmp/api`, `@rmp/jobs`), never a relative path reaching into another package
- Required env vars per app (see `apps/mobile/.env.local`, and `apps/web/.env.local` once web needs them): `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `DATABASE_URL`, `OPENAI_API_KEY`, `UNSPLASH_ACCESS_KEY`, `UNSPLASH_SECRET_KEY`, `INNGEST_DEV`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_URL_ENDPOINT`, `SENTRY_AUTH_TOKEN`, `EXPO_PUBLIC_SENTRY_DSN` — client-exposed vars must keep the `EXPO_PUBLIC_`/`NEXT_PUBLIC_` prefix; everything else stays server-only. Missing required keys should throw at startup, matching the existing pattern in `apps/mobile/src/app/_layout.tsx`
- Run `pnpm turbo run lint typecheck` (or scope with `--filter`) before considering a change done — this replaces the old single-app `expo lint`
