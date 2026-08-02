import type { ReactNode } from "react";

import { usePermissions } from "@/lib/permissions-context";
import type { PermissionKey } from "@/lib/permissions/catalog";
import type { FeatureKey } from "@/lib/subscription-features";

type CanProps = {
  children: ReactNode;
  fallback?: ReactNode;
} & (
  | { permission: PermissionKey; anyPermission?: never; feature?: never }
  | { anyPermission: PermissionKey[]; permission?: never; feature?: never }
  | { feature: FeatureKey; permission?: never; anyPermission?: never }
);

/**
 * Gates UI on a role permission or a Clerk Billing feature — e.g. the spec's
 * Premium -> `booking_instant` -> Instant Booking toggle example becomes
 * `<Can feature="booking_instant"><InstantBookingToggle /></Can>`, never a plan-name check.
 */
export function Can({ children, fallback = null, permission, anyPermission, feature }: CanProps) {
  const { hasPermission, hasAnyPermission, hasFeature } = usePermissions();

  const allowed = permission
    ? hasPermission(permission)
    : anyPermission
      ? hasAnyPermission(anyPermission)
      : hasFeature(feature);

  return allowed ? children : fallback;
}
