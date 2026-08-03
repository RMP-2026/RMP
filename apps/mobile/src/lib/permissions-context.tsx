import { useAuth } from "@clerk/expo";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { mobileApiOrigin } from "@/lib/api-origin";
import type { FeatureKey, SubscriptionPlanKey } from "@/lib/subscription-features";

type PermissionsState = {
  features: FeatureKey[];
  subscriptionPlan: SubscriptionPlanKey | null;
  isLoading: boolean;
};

type PermissionsContextValue = PermissionsState & {
  hasFeature: (key: FeatureKey) => boolean;
  refresh: () => Promise<void>;
};

const EMPTY_STATE: PermissionsState = {
  features: [],
  subscriptionPlan: null,
  isLoading: true,
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

/**
 * Fetches the signed-in user's Clerk Billing feature entitlements once per session and
 * caches them for UI gating. The server (`/api/me/permissions`, and `withFeature` on
 * individual routes) is always the real enforcement point — this is for show/hide only.
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

      const response = await fetch(`${mobileApiOrigin()}/api/me/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to load permissions (${response.status})`);

      const data = await response.json();
      setState({
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
