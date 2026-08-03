import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function RatingDisplay({
  rating,
  tripCount,
  size = 13,
}: {
  rating: number;
  tripCount?: number;
  size?: number;
}) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={size} color="#F59E0B" />
      <Text className="text-body-base font-semibold text-ink">{rating.toFixed(2)}</Text>
      {tripCount !== undefined ? (
        <Text className="text-body-base text-ink-sub">({tripCount} trips)</Text>
      ) : null}
    </View>
  );
}

export function StarRatingScale({ value, size = 20 }: { value: number; size?: number }) {
  const stars = [0, 1, 2, 3, 4];
  return (
    <View className="flex-row gap-0.5">
      {stars.map((i) => {
        const filled = value >= i + 1;
        const half = !filled && value > i && value < i + 1;
        return (
          <Ionicons
            key={i}
            name={filled ? "star" : half ? "star-half" : "star-outline"}
            size={size}
            color={filled || half ? "#F59E0B" : "#7A8599"}
          />
        );
      })}
    </View>
  );
}
