import { Text, View } from "react-native";

const STATUS_STYLES = {
  success: "border-success/30 bg-success/15 text-success",
  warning: "border-warning/30 bg-warning/15 text-warning",
  danger: "border-danger/30 bg-danger/15 text-danger",
} as const;

export function StatusBadge({ label, tone }: { label: string; tone: keyof typeof STATUS_STYLES }) {
  const classes = STATUS_STYLES[tone].split(" ");
  const [borderClass, bgClass, textClass] = classes;
  return (
    <View className={`self-start rounded-full border px-3 py-1 ${borderClass} ${bgClass}`}>
      <Text className={`text-caption-sm font-bold ${textClass}`}>{label}</Text>
    </View>
  );
}
