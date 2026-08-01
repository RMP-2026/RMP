import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import type { Vehicle } from "../../types/rmp";
import { RatingDisplay } from "./RatingDisplay";
import { StatusBadge } from "./StatusBadge";

export function VehicleCard({
  vehicle,
  favorited,
  onToggleFavorite,
  onPress,
}: {
  vehicle: Vehicle;
  favorited?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row gap-3 rounded-2xl border border-white/10 bg-surface p-3 active:opacity-90"
    >
      <View className="h-24 w-28 overflow-hidden rounded-xl bg-surface-high">
        <Image source={{ uri: vehicle.photos[0] }} contentFit="cover" className="h-full w-full" />
      </View>
      <View className="flex-1 justify-between">
        <View>
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 text-body-md font-bold text-ink" numberOfLines={1}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={favorited ? "Remove from favorites" : "Add to favorites"}
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
            >
              <Ionicons
                name={favorited ? "heart" : "heart-outline"}
                size={18}
                color={favorited ? "#EF4444" : "#7A8599"}
              />
            </Pressable>
          </View>
          <View className="mt-1">
            <RatingDisplay rating={vehicle.rating} tripCount={vehicle.tripCount} />
          </View>
          {vehicle.verifiedCompany ? (
            <View className="mt-1">
              <StatusBadge label="All-Star Host" tone="verified" />
            </View>
          ) : null}
        </View>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-body-md font-extrabold text-ink">${vehicle.pricePerDay}</Text>
          <Text className="text-body-base text-ink-sub">/day</Text>
          <Text className="ml-2 text-caption-sm text-ink-sub">${vehicle.pricePerDay * 3} total</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function VehicleGridCard({
  vehicle,
  favorited,
  onToggleFavorite,
  onPress,
}: {
  vehicle: Vehicle;
  favorited?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="overflow-hidden rounded-2xl border border-white/10 bg-surface active:opacity-90"
    >
      <View className="h-44 w-full bg-surface-high">
        <Image source={{ uri: vehicle.photos[0] }} contentFit="cover" className="h-full w-full" />
        {vehicle.verifiedCompany ? (
          <View className="absolute left-3 top-3">
            <StatusBadge label="All-Star Host" tone="verified" />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorited ? "Remove from favorites" : "Add to favorites"}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-black/40"
        >
          <Ionicons name={favorited ? "heart" : "heart-outline"} size={18} color={favorited ? "#EF4444" : "#F0F4FF"} />
        </Pressable>
        <View className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5">
          <Text className="text-caption-sm text-ink">1/{vehicle.photos.length}</Text>
        </View>
      </View>
      <View className="gap-2 p-4">
        <Text className="text-heading-lg font-extrabold text-ink">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <Text className="-mt-1 text-body-base text-ink-sub">{vehicle.trim}</Text>
        <View className="flex-row items-center gap-3">
          <RatingDisplay rating={vehicle.rating} tripCount={vehicle.tripCount} />
        </View>
        <View className="flex-row flex-wrap gap-4 border-t border-white/5 pt-3">
          <SpecItem icon="people-outline" label={`${vehicle.seats} seats`} />
          <SpecItem icon="flame-outline" label={vehicle.fuel} />
          <SpecItem icon="speedometer-outline" label={`${vehicle.mpg} MPG`} />
          <SpecItem icon="git-network-outline" label={vehicle.drivetrain} />
        </View>
        <View className="flex-row items-end justify-between pt-1">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-heading-lg font-extrabold text-ink">${vehicle.pricePerDay}</Text>
            <Text className="text-body-base text-ink-sub">/day</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function SpecItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={14} color="#7A8599" />
      <Text className="text-body-base text-ink-sub">{label}</Text>
    </View>
  );
}
