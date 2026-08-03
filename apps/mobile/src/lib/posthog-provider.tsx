import { PostHogProvider as PHProvider } from "posthog-react-native";
import type { ReactNode } from "react";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (!apiKey) {
  console.warn("[apps/mobile] EXPO_PUBLIC_POSTHOG_KEY not set — PostHog analytics disabled.");
}

/**
 * Null when PostHog isn't configured yet (no account access available to provision it
 * automatically — see PLAN.md Phase 0 open items). Fail-open: renders children
 * unwrapped rather than throwing.
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  if (!apiKey) return children;
  return (
    <PHProvider apiKey={apiKey} options={{ host }}>
      {children}
    </PHProvider>
  );
}
