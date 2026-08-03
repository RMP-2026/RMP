import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
  enableLogs: true,
});

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-05-30",
  });
} else {
  console.warn("[apps/web] NEXT_PUBLIC_POSTHOG_KEY not set — PostHog analytics disabled.");
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
