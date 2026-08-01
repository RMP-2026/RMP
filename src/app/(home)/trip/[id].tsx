import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DestructiveButton, PrimaryButton, SecondaryButton } from "../../../components/ui/Button";
import { RatingDisplay } from "../../../components/ui/RatingDisplay";
import { StatusBadge, StatusBadgeTone } from "../../../components/ui/StatusBadge";
import { getVehicleById, MOCK_TRIPS } from "../../../lib/mock-data";
import { Routes } from "../../../lib/routes";
import type { TripStatus } from "../../../types/rmp";

const STATUS_TONE: Record<TripStatus, StatusBadgeTone> = {
  requested: "pending",
  confirmed: "verified",
  upcoming: "verified",
  active: "active",
  completed: "neutral",
  canceled: "canceled",
};

const STATUS_LABEL: Record<TripStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  canceled: "Canceled",
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = MOCK_TRIPS.find((t) => t.id === id);
  const vehicle = trip ? getVehicleById(trip.vehicleId) : undefined;
  const [status, setStatus] = useState(trip?.status);

  if (!trip || !vehicle || !status) return null;

  const canCancel = status === "upcoming" || status === "confirmed" || status === "requested";
  const canModify = status === "upcoming" || status === "confirmed";
  const isActive = status === "active";

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <View>
          <Image source={{ uri: vehicle.photos[0] }} contentFit="cover" style={{ width: "100%", height: 260 }} />
          <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pt-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
            >
              <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share"
              onPress={() => Share.share({ message: `My RMP trip: ${vehicle.year} ${vehicle.make} ${vehicle.model}` })}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
            >
              <Ionicons name="share-outline" size={18} color="#F0F4FF" />
            </Pressable>
          </SafeAreaView>
          <View className="absolute left-4 top-16">
            <StatusBadge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
          </View>
        </View>

        <View className="gap-5 px-5 pt-5">
          <View>
            <Text className="text-heading-xxl font-extrabold text-ink">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text className="mt-1 text-body-md text-ink-sub">{vehicle.trim}</Text>
            <View className="mt-2">
              <RatingDisplay rating={vehicle.rating} tripCount={vehicle.tripCount} />
            </View>
          </View>

          <View className="gap-3 rounded-2xl border border-white/10 bg-surface p-4">
            <InfoRow icon="calendar-outline" title={`${trip.startDate} – ${trip.endDate}`} subtitle={`${trip.days} days`} />
            <InfoRow icon="location-outline" title={trip.pickupLocation} subtitle={trip.pickupAddress} />
          </View>

          <View className="flex-row gap-3">
            <SecondaryButton label="Message host" fullWidth={false} className="flex-1" onPress={() => router.push(Routes.inboxThread("thread-1") as Href)} />
            <PrimaryButton
              label="View instructions"
              fullWidth={false}
              className="flex-1"
              onPress={() => Alert.alert("Pickup instructions", "Meet your host at the curbside pickup area on arrival.")}
            />
          </View>

          {isActive ? (
            <View className="flex-row gap-3">
              <SecondaryButton label="Check-in" fullWidth={false} className="flex-1" onPress={() => Alert.alert("Checked in")} />
              <SecondaryButton label="Check-out" fullWidth={false} className="flex-1" onPress={() => Alert.alert("Checked out")} />
            </View>
          ) : null}

          {canModify || canCancel ? (
            <View className="gap-3 border-t border-white/5 pt-4">
              {canModify ? (
                <SecondaryButton label="Modify trip" onPress={() => router.push(Routes.bookingDates(vehicle.id) as Href)} />
              ) : null}
              {canCancel ? (
                <DestructiveButton
                  label="Cancel trip"
                  onPress={() =>
                    Alert.alert("Cancel trip?", "This trip will be canceled and refunded per the cancellation policy.", [
                      { text: "Keep trip", style: "cancel" },
                      { text: "Cancel trip", style: "destructive", onPress: () => setStatus("canceled") },
                    ])
                  }
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={18} color="#7A8599" />
      <View>
        <Text className="text-body-md font-semibold text-ink">{title}</Text>
        <Text className="text-body-base text-ink-sub">{subtitle}</Text>
      </View>
    </View>
  );
}
