# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Tech stack

- Expo SDK ~57, React Native 0.86, React 19.2
- expo-router with `typedRoutes` and `reactCompiler` experiments enabled — don't manually memoize with useMemo/useCallback for render perf, and use typed `href`s (no raw string routes)
- NativeWind v4 + Tailwind for all styling — do not use StyleSheet.create or another styling library
- @expo/ui and native tabs for UI/navigation — see "Native-first UI" below. This app should feel and behave like a native app, not a JS-rendered one.
- @clerk/expo for auth, with the token-cache pattern in `src/app/_layout.tsx` — don't change the ClerkProvider/tokenCache wiring without reason. Clerk webhooks are configured (`CLERK_WEBHOOK_SIGNING_SECRET`) for syncing user data server-side.
- Postgres via Neon (`DATABASE_URL`) as the database
- Drizzle ORM for all schema and queries — no raw SQL strings outside Drizzle, no other ORM (Prisma, etc.)
- ImageKit for image upload/optimization/delivery (`IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`) — don't store or serve raw unoptimized images
- Inngest for background jobs / async workflows (`INNGEST_DEV`) — long-running or deferred work (webhooks processing, notifications, etc.) goes through Inngest functions, not ad-hoc server-side timers or fire-and-forget promises
- @sentry/react-native/expo for error tracking and monitoring — `Sentry.wrap(RootLayout)` must stay the default export of `_layout.tsx`
- OpenAI API is available (`OPENAI_API_KEY`) for AI-powered features
- Unsplash API is available (`UNSPLASH_ACCESS_KEY`/`UNSPLASH_SECRET_KEY`), currently used for stock/seed imagery

## Native-first UI — always use native tabs

- This app must always use **native tabs**, never a JavaScript-rendered tab bar. Tab navigation is a hard requirement, not a preference.
- Import from `expo-router/unstable-native-tabs` (`NativeTabs`, `NativeTabs.Trigger`, `.Icon`, `.Label`, `.Badge`). Do not use the old JS-based `expo-router/tabs`, a hand-rolled tab bar, or any third-party tab component.
- `@expo/ui` has no tab component of its own (SwiftUI `TabView` is not exposed through it) — native tabs always come from expo-router, not @expo/ui. Use `@expo/ui` for other native SwiftUI/Jetpack Compose elements (buttons, switches, pickers, etc.) where a native look matters.
- Native tabs are alpha (SDK 54+): max 5 tabs on Android, no nested native tabs, tabs can't be added/removed at runtime. Confirm these limits still hold against the SDK 57 docs before relying on them.
- Prefer native/platform components generally over custom JS re-implementations of standard UI (tabs, pickers, switches, etc.) — check `@expo/ui` first before reaching for a JS-only component.

## Dev server

- Never run `expo start`, `npm run start/android/ios/web`, or any other command that launches the app. The user always has the dev server running in a separate terminal already.
- If you need to verify a change, ask the user to check it in their running instance instead of starting your own.

## Project conventions

- Route groups: `(auth)` for unauthenticated screens, `(home)` for authenticated screens — place new screens accordingly
- Required env vars (see `.env.local`): `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `DATABASE_URL`, `OPENAI_API_KEY`, `UNSPLASH_ACCESS_KEY`, `UNSPLASH_SECRET_KEY`, `INNGEST_DEV`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_URL_ENDPOINT`, `SENTRY_AUTH_TOKEN`, `EXPO_PUBLIC_SENTRY_DSN` — client-exposed vars must keep the `EXPO_PUBLIC_` prefix; everything else stays server-only. Missing required keys should throw at startup, matching the existing pattern in `_layout.tsx`
- Run `expo lint` before considering a change done
