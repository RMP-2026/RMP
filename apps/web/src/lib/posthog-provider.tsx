"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import type { ReactNode } from "react";

const enabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

/**
 * `posthog.init()` runs at module load in instrumentation-client.ts, before this ever
 * renders — this just wires the already-initialized client into React context. No-op
 * wrapper when PostHog isn't configured (see PLAN.md Phase 0 open items).
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  if (!enabled) return children;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
