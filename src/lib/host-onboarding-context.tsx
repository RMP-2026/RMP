import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type HostOnboardingState = {
  make: string | null;
  model: string | null;
  year: string | null;
  photos: string[];
  homeAddress: string;
  airportDelivery: boolean;
  customDelivery: boolean;
  dailyPrice: string;
  weeklyDiscount: string;
  minimumTrip: string;
};

type HostOnboardingContextValue = HostOnboardingState & {
  update: (patch: Partial<HostOnboardingState>) => void;
  reset: () => void;
};

const DEFAULT_STATE: HostOnboardingState = {
  make: null,
  model: null,
  year: null,
  photos: [],
  homeAddress: "",
  airportDelivery: true,
  customDelivery: true,
  dailyPrice: "75",
  weeklyDiscount: "10%",
  minimumTrip: "1 day",
};

const HostOnboardingContext = createContext<HostOnboardingContextValue | null>(null);

export function HostOnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HostOnboardingState>(DEFAULT_STATE);

  const value = useMemo(
    () => ({
      ...state,
      update: (patch: Partial<HostOnboardingState>) => setState((prev) => ({ ...prev, ...patch })),
      reset: () => setState(DEFAULT_STATE),
    }),
    [state]
  );

  return <HostOnboardingContext.Provider value={value}>{children}</HostOnboardingContext.Provider>;
}

export function useHostOnboarding() {
  const ctx = useContext(HostOnboardingContext);
  if (!ctx) throw new Error("useHostOnboarding must be used within a HostOnboardingProvider");
  return ctx;
}
