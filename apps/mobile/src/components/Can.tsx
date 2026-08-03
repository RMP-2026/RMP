import type { ReactNode } from "react";

import { usePermissions } from "@/lib/permissions-context";
import type { FeatureKey } from "@/lib/subscription-features";

type CanProps = {
  children: ReactNode;
  fallback?: ReactNode;
  feature: FeatureKey;
};

/**
 * Gates UI on a Clerk Billing feature — e.g. the spec's Premium -> `booking_instant` ->
 * Instant Booking toggle example becomes `<Can feature="booking_instant"><InstantBookingToggle /></Can>`,
 * never a plan-name check.
 */
export function Can({ children, fallback = null, feature }: CanProps) {
  const { hasFeature } = usePermissions();

  return hasFeature(feature) ? children : fallback;
}
