import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../../components/ui/Button";
import { RadioCard } from "../../../../components/ui/Checkbox";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { useBooking } from "../../../../lib/booking-context";
import { getVehicleById, PROTECTION_PLANS } from "../../../../lib/mock-data";
import { Routes } from "../../../../lib/routes";

export default function BookingProtectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = getVehicleById(id);
  const { protectionPlan, setProtectionPlan } = useBooking();
  const [showCompare, setShowCompare] = useState(false);

  if (!vehicle) return null;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View className="flex-1">
          <ScreenHeader title="Protection plan" />
          <View className="gap-3 px-5 pt-2">
            {PROTECTION_PLANS.map((plan) => (
              <RadioCard
                key={plan.id}
                selected={protectionPlan === plan.id}
                onPress={() => setProtectionPlan(plan.id)}
                title={plan.name}
                subtitle={plan.pricePerDay > 0 ? `$${plan.pricePerDay}/day — ${plan.coverageSummary}` : plan.coverageSummary}
                trailing={plan.pricePerDay === 0 ? undefined : `from ${plan.outOfPocket}`}
              />
            ))}

            {showCompare ? (
              <View className="rounded-2xl border border-white/10 bg-surface p-4">
                {PROTECTION_PLANS.map((plan) => (
                  <View key={plan.id} className="border-b border-white/5 py-2 last:border-0">
                    <Text className="text-body-md font-bold text-ink">{plan.name}</Text>
                    <Text className="text-body-base text-ink-sub">Out-of-pocket: {plan.outOfPocket}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View className="gap-3 px-5 pb-2">
          <PrimaryButton label="Continue" onPress={() => router.push(Routes.bookingCheckout(vehicle.id) as Href)} />
          <Pressable onPress={() => setShowCompare((v) => !v)} className="items-center active:opacity-70">
            <Text className="text-body-base font-semibold text-teal">
              {showCompare ? "Hide comparison" : "Compare plans"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
