import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheet } from "../../../../components/ui/BottomSheet";
import { PrimaryButton } from "../../../../components/ui/Button";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { useBooking } from "../../../../lib/booking-context";
import { getVehicleById, PROTECTION_PLANS } from "../../../../lib/mock-data";
import { Routes } from "../../../../lib/routes";
import { useSearch } from "../../../../lib/search-context";

const MOCK_CARDS = ["Visa •••• 4242", "Mastercard •••• 8899"];

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = getVehicleById(id);
  const { fromLabel, untilLabel } = useSearch();
  const { protectionPlan } = useBooking();
  const [card, setCard] = useState(MOCK_CARDS[0]);
  const [cardSheetOpen, setCardSheetOpen] = useState(false);
  const [booking, setBooking] = useState(false);

  if (!vehicle) return null;

  const days = 3;
  const subtotal = vehicle.pricePerDay * days;
  const plan = PROTECTION_PLANS.find((p) => p.id === protectionPlan)!;
  const protectionCost = plan.pricePerDay * days;
  const taxesAndFees = Math.round((subtotal + protectionCost) * 0.08);
  const total = subtotal + protectionCost + taxesAndFees;

  const handleBookNow = () => {
    if (booking) return;
    setBooking(true);
    setTimeout(() => {
      setBooking(false);
      router.replace(Routes.bookingConfirmation(vehicle.id) as Href);
    }, 1200);
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScreenHeader title="Checkout" />
        <ScrollView contentContainerClassName="gap-5 px-5 pb-4" showsVerticalScrollIndicator={false}>
          <View>
            <Text className="text-heading-lg font-bold text-ink">Trip</Text>
            <Text className="mt-1 text-body-base text-ink-sub">
              {fromLabel} – {untilLabel}
            </Text>
            <Text className="text-body-base text-ink-sub">{days} days</Text>
          </View>

          <View className="gap-2 rounded-2xl border border-white/10 bg-surface p-4">
            <Row label={`${vehicle.pricePerDay}/day × ${days} days`} value={`$${subtotal}`} />
            <Row label={`Protection · ${plan.name}`} value={protectionCost === 0 ? "$0" : `$${protectionCost}`} />
            <Row label="Taxes & fees" value={`$${taxesAndFees}`} />
            <View className="mt-1 flex-row items-center justify-between border-t border-white/10 pt-3">
              <Text className="text-heading-lg font-bold text-ink">Total</Text>
              <Text className="text-heading-lg font-extrabold text-ink">${total}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setCardSheetOpen(true)}
            className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-surface p-4 active:opacity-90"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="card-outline" size={20} color="#F0F4FF" />
              <Text className="text-body-md text-ink">{card}</Text>
            </View>
            <Text className="text-body-base font-semibold text-teal">Edit</Text>
          </Pressable>
        </ScrollView>

        <View className="gap-3 px-5 pb-4 pt-2">
          <PrimaryButton label="Book now" loading={booking} onPress={handleBookNow} />
          <Text className="text-center text-caption-sm text-ink-sub">
            By booking you agree to the{" "}
            <Text className="text-teal" onPress={() => router.push("/terms-privacy" as Href)}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text className="text-teal" onPress={() => router.push("/terms-privacy" as Href)}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </SafeAreaView>

      <BottomSheet visible={cardSheetOpen} onClose={() => setCardSheetOpen(false)} title="Payment method">
        <View className="gap-2">
          {MOCK_CARDS.map((c) => (
            <Pressable
              key={c}
              onPress={() => {
                setCard(c);
                setCardSheetOpen(false);
              }}
              className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${
                c === card ? "border-teal bg-teal/10" : "border-white/10 bg-surface-high"
              }`}
            >
              <Text className={`text-body-md font-semibold ${c === card ? "text-teal" : "text-ink"}`}>{c}</Text>
              {c === card ? <Ionicons name="checkmark" size={18} color="#1AE0A8" /> : null}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-body-base text-ink-sub">{label}</Text>
      <Text className="text-body-base text-ink">{value}</Text>
    </View>
  );
}
