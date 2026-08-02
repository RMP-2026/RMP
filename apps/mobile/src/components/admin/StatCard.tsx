import { Text, View } from "react-native";

import { TrendPill, type TrendColor } from "./TrendPill";

const VALUE_COLOR: Record<TrendColor, string> = {
  teal: "text-teal",
  success: "text-ink",
  info: "text-info",
  warning: "text-warning",
};

export function StatCard({
  value,
  label,
  trend,
  color,
}: {
  value: string;
  label: string;
  trend: string;
  color: TrendColor;
}) {
  return (
    <View className="w-[48%] rounded-2xl border border-white/5 bg-surface-high p-4">
      <Text className={`text-heading-xl font-extrabold ${VALUE_COLOR[color]}`}>{value}</Text>
      <Text className="mt-1 text-body-base text-ink-sub">{label}</Text>
      <View className="mt-3">
        <TrendPill value={trend} color={color} />
      </View>
    </View>
  );
}
