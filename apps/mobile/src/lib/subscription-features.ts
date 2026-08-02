/**
 * Clerk Billing feature/plan key catalog for host subscriptions.
 *
 * Clerk Billing (Plans + Features) is the source of truth for subscription state —
 * there's no mirrored Postgres table. This file only gives the feature/plan slugs
 * compile-time typo safety, mirroring what was provisioned via `clerk config patch`
 * (see docs/authorization.md for the full provisioning record).
 *
 * Clerk feature/plan slugs don't allow colons, so these use underscores even though the
 * rest of the app's permission keys use `resource:action` — that's a Clerk constraint,
 * not a convention choice.
 */

export type SubscriptionPlanKey = "starter" | "professional" | "premium";

export const SUBSCRIPTION_PLANS: readonly { key: SubscriptionPlanKey; name: string; amountCents: number }[] = [
  { key: "starter", name: "Starter", amountCents: 2999 },
  { key: "professional", name: "Professional", amountCents: 5999 },
  { key: "premium", name: "Premium", amountCents: 14999 },
];

export const FEATURE_KEYS = [
  "calendar_basic",
  "calendar_smart",
  "calendar_same_day",
  "booking_instant",
  "booking_same_day",
  "analytics_customer",
  "analytics_fleet",
  "analytics_revenue",
  "analytics_advanced",
  "notifications_email",
  "notifications_sms",
  "support_email",
  "support_priority",
  "support_phone",
  "support_live_chat",
  "search_standard",
  "search_featured",
  "reports_basic",
  "reports_advanced",
  "employees_multiple",
  "vehicles_limit_5",
  "vehicles_limit_15",
  "vehicles_unlimited",
  "api_access",
  "whitelabel_enabled",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Clerk's `has()` disambiguates user-level vs org-level plans/features via a `user:`/`org:` prefix — RMP's subscriptions are user-level. */
export function toClerkFeatureCheck(key: FeatureKey): `user:${FeatureKey}` {
  return `user:${key}`;
}

export function toClerkPlanCheck(key: SubscriptionPlanKey): `user:${SubscriptionPlanKey}` {
  return `user:${key}`;
}

/** Numeric vehicle cap implied by whichever `vehicles_limit_*`/`vehicles_unlimited` feature is active. Never branch on plan name — check features. */
export function vehicleLimitFromFeatures(features: readonly string[]): number {
  if (features.includes("vehicles_unlimited" satisfies FeatureKey)) return Infinity;
  if (features.includes("vehicles_limit_15" satisfies FeatureKey)) return 15;
  if (features.includes("vehicles_limit_5" satisfies FeatureKey)) return 5;
  return 0;
}
