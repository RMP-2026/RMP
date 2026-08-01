import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
import { Pressable, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../../components/ui/Button";
import { getTripByVehicleId, getVehicleById } from "../../../../lib/mock-data";
import { Routes } from "../../../../lib/routes";

export default function BookingConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = getVehicleById(id);
  const trip = vehicle ? getTripByVehicleId(vehicle.id) : undefined;

  if (!vehicle) return null;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View className="flex-row items-center justify-between px-4 pt-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(Routes.home as Href)}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
          >
            <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share"
            onPress={() =>
              Share.share({ message: `My RMP trip is confirmed: ${vehicle.year} ${vehicle.make} ${vehicle.model}` })
            }
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
          >
            <Ionicons name="share-outline" size={18} color="#F0F4FF" />
          </Pressable>
        </View>

        <View className="items-center gap-3 px-8">
          <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-success">
            <Ionicons name="checkmark" size={40} color="#22C55E" />
          </View>
          <Text className="text-heading-xxl font-extrabold text-ink">Your trip is confirmed!</Text>
          <Text className="text-center text-body-base text-ink-sub">
            You&apos;ll get a message with next steps.
          </Text>
        </View>

        <View className="gap-3 px-5 pb-4">
          <View className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface p-3">
            <Image source={{ uri: vehicle.photos[0] }} contentFit="cover" className="h-14 w-14 rounded-xl" />
            <View className="flex-1">
              <Text className="text-body-md font-bold text-ink">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              <Text className="text-body-base text-ink-sub">At {vehicle.location}</Text>
            </View>
          </View>
          <PrimaryButton
            label="View trip details"
            onPress={() => router.replace((trip ? Routes.tripDetail(trip.id) : Routes.trips) as Href)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
