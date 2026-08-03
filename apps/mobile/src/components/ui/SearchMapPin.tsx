import { Pressable, Text } from "react-native";

export function SearchMapPin({
  price,
  selected,
  x,
  y,
  onPress,
}: {
  price: number;
  selected?: boolean;
  x: number;
  y: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`$${price} per day`}
      onPress={onPress}
      style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: [{ translateX: -28 }] }}
      className={`rounded-full px-3 py-1.5 shadow-md active:opacity-90 ${selected ? "bg-teal" : "bg-surface-high border border-white/20"}`}
    >
      <Text className={`text-caption-sm font-extrabold ${selected ? "text-background" : "text-ink"}`}>${price}</Text>
    </Pressable>
  );
}
