import { useAuth } from "@clerk/expo";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { PermissionKey } from "@/lib/permissions/catalog";
import type { FeatureKey, SubscriptionPlanKey } from "@/lib/subscription-features";

type PermissionsState = {
  role: string | null;
  permissions: PermissionKey[];
  features: FeatureKey[];
  subscriptionPlan: SubscriptionPlanKey | null;
  isLoading: boolean;
};

type PermissionsContextValue = PermissionsState & {
  hasPermission: (key: PermissionKey) => boolean;
  hasAnyPermission: (keys: PermissionKey[]) => boolean;
  hasAllPermissions: (keys: PermissionKey[]) => boolean;
  hasFeature: (key: FeatureKey) => boolean;
  refresh: () => Promise<void>;
};

const EMPTY_STATE: PermissionsState = {
  role: null,
  permissions: [],
  features: [],
  subscriptionPlan: null,
  isLoading: true,
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

/**
 * Fetches the signed-in user's effective role permissions + Clerk Billing feature
 * entitlements once per session and caches them for UI gating. The server
 * (`/api/me/permissions`, and `withPermission`/`withFeature` on individual routes) is
 * always the real enforcement point — this is for show/hide only.
 */
export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [state, setState] = useState<PermissionsState>(EMPTY_STATE);

  async function fetchPermissions() {
    try {
      const token = await getToken();
      if (!token) {
        setState({ ...EMPTY_STATE, isLoading: false });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      const apiOrigin = process.env.EXPO_PUBLIC_API_URL ?? "";
      const response = await fetch(`${apiOrigin}/api/me/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to load permissions (${response.status})`);

      const data = await response.json();
      setState({
        role: data.role ?? null,
        permissions: data.permissions ?? [],
        features: data.features ?? [],
        subscriptionPlan: data.subscriptionPlan ?? null,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to load permissions:", err);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      await fetchPermissions();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const value: PermissionsContextValue = {
    ...state,
    hasPermission: (key) => state.permissions.includes(key),
    hasAnyPermission: (keys) => keys.some((key) => state.permissions.includes(key)),
    hasAllPermissions: (keys) => keys.every((key) => state.permissions.includes(key)),
    hasFeature: (key) => state.features.includes(key),
    refresh: fetchPermissions,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used within a PermissionsProvider");
  return ctx;
}
