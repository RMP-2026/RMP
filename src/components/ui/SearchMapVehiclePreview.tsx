import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import type { Vehicle } from "../../types/rmp";
import { RatingDisplay } from "./RatingDisplay";

export function SearchMapVehiclePreview({
  vehicle,
  favorited,
  onToggleFavorite,
  onPress,
}: {
  vehicle: Vehicle;
  favorited?: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface p-3 shadow-lg active:opacity-90"
    >
      <View className="h-20 w-24 overflow-hidden rounded-xl bg-surface-high">
        <Image source={{ uri: vehicle.photos[0] }} contentFit="cover" className="h-full w-full" />
      </View>
      <View className="flex-1">
        <Text className="text-body-md font-bold text-ink" numberOfLines={1}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <RatingDisplay rating={vehicle.rating} tripCount={vehicle.tripCount} />
        <Text className="mt-1 text-body-md font-extrabold text-ink">${vehicle.pricePerDay}/day</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={favorited ? "Remove from favorites" : "Add to favorites"}
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="h-9 w-9 items-center justify-center rounded-full bg-surface-high"
      >
        <Ionicons name={favorited ? "heart" : "heart-outline"} size={16} color={favorited ? "#EF4444" : "#7A8599"} />
      </Pressable>
    </Pressable>
  );
}
