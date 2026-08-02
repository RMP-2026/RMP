import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PickupOptionId, ProtectionPlanId } from "../types/rmp";

type BookingDraft = {
  pickupOption: PickupOptionId;
  deliveryAddress: string;
  protectionPlan: ProtectionPlanId;
};

type BookingContextValue = BookingDraft & {
  setPickupOption: (option: PickupOptionId) => void;
  setDeliveryAddress: (address: string) => void;
  setProtectionPlan: (plan: ProtectionPlanId) => void;
  reset: () => void;
};

const DEFAULT_DRAFT: BookingDraft = {
  pickupOption: "vehicle",
  deliveryAddress: "",
  protectionPlan: "standard",
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(DEFAULT_DRAFT);

  const value = useMemo(
    () => ({
      ...draft,
      setPickupOption: (pickupOption: PickupOptionId) => setDraft((prev) => ({ ...prev, pickupOption })),
      setDeliveryAddress: (deliveryAddress: string) => setDraft((prev) => ({ ...prev, deliveryAddress })),
      setProtectionPlan: (protectionPlan: ProtectionPlanId) => setDraft((prev) => ({ ...prev, protectionPlan })),
      reset: () => setDraft(DEFAULT_DRAFT),
    }),
    [draft]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
