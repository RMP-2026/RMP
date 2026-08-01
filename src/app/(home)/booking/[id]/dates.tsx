import { Href, router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../../components/ui/Button";
import { DateTimeField } from "../../../../components/ui/DateTimeField";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { getVehicleById } from "../../../../lib/mock-data";
import { Routes } from "../../../../lib/routes";
import { useSearch } from "../../../../lib/search-context";

const DATE_OPTIONS = ["Aug 9, 10 AM", "Aug 10, 10 AM", "Aug 11, 10 AM", "Aug 12, 10 AM", "Aug 13, 10 AM"];

export default function BookingDatesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = getVehicleById(id);
  const { fromLabel, setFromLabel, untilLabel, setUntilLabel } = useSearch();

  if (!vehicle) return null;

  const days = 3;
  const subtotal = vehicle.pricePerDay * days;
  const weeklyDiscount = 0;
  const multiDayDiscount = Math.round(subtotal * 0.06);
  const total = subtotal - weeklyDiscount - multiDayDiscount;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View>
          <ScreenHeader title="Trip dates" />
          <View className="gap-5 px-5 pt-2">
            <View className="flex-row gap-3">
              <DateTimeField label="PICKUP" value={fromLabel} options={DATE_OPTIONS} onChange={setFromLabel} />
              <DateTimeField label="RETURN" value={untilLabel} options={DATE_OPTIONS} onChange={setUntilLabel} />
            </View>

            <View className="rounded-2xl border border-white/10 bg-surface p-4">
              <Text className="text-caption-sm font-semibold text-ink-sub">PICKUP & RETURN</Text>
              <Text className="mt-0.5 text-body-md font-semibold text-ink">{vehicle.location}</Text>
            </View>

            <View className="rounded-2xl border border-white/10 bg-surface p-4">
              <Text className="mb-3 text-body-md font-bold text-ink">Trip savings</Text>
              <View className="flex-row justify-between py-1">
                <Text className="text-body-base text-ink-sub">3-day discount</Text>
                <Text className="text-body-base text-success">-${multiDayDiscount}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-1 px-5 pb-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-heading-lg font-bold text-ink">Total</Text>
            <Text className="text-heading-lg font-extrabold text-ink">${total}</Text>
          </View>
          <PrimaryButton
            label="Continue"
            onPress={() => router.push(Routes.bookingPickup(vehicle.id) as Href)}
            className="mt-2"
          />
          <Text className="mt-2 text-center text-caption-sm text-ink-sub">
            Free cancellation until 48 hours before pickup
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
