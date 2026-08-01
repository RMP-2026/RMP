import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import type { Trip, Vehicle } from "../../types/rmp";

export function TripCard({
  trip,
  vehicle,
  onPress,
}: {
  trip: Trip;
  vehicle: Vehicle;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface p-3 active:opacity-90"
    >
      <View className="h-16 w-16 overflow-hidden rounded-xl bg-surface-high">
        <Image source={{ uri: vehicle.photos[0] }} contentFit="cover" className="h-full w-full" />
      </View>
      <View className="flex-1">
        <Text className="text-caption-sm text-ink-sub">
          {trip.startDate} – {trip.endDate}
        </Text>
        <Text className="mt-0.5 text-body-md font-bold text-ink">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <Text className="text-body-base text-ink-sub">{vehicle.location}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#7A8599" />
    </Pressable>
  );
}
