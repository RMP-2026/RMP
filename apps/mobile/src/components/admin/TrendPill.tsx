import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export type TrendColor = "teal" | "success" | "info" | "warning";

const COLOR_STYLES: Record<TrendColor, { bg: string; text: string; hex: string }> = {
  teal: { bg: "bg-teal/15", text: "text-teal", hex: "#1AE0A8" },
  success: { bg: "bg-success/15", text: "text-success", hex: "#22C55E" },
  info: { bg: "bg-info/15", text: "text-info", hex: "#3B82F6" },
  warning: { bg: "bg-warning/15", text: "text-warning", hex: "#F59E0B" },
};

export function TrendPill({ value, color }: { value: string; color: TrendColor }) {
  const styles = COLOR_STYLES[color];
  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-2 py-1 ${styles.bg}`}>
      <Ionicons name="arrow-up" size={10} color={styles.hex} />
      <Text className={`text-caption-sm font-bold ${styles.text}`}>{value}</Text>
    </View>
  );
}
