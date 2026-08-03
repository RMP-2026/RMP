import { Text, View } from "react-native";

import type { TrendColor } from "./TrendPill";

const BAR_COLOR: Record<TrendColor, string> = {
  teal: "bg-teal",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
};

const TEXT_COLOR: Record<TrendColor, string> = {
  teal: "text-teal",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
};

export function MarketBar({
  name,
  pct,
  maxPct,
  color,
}: {
  name: string;
  pct: number;
  maxPct: number;
  color: TrendColor;
}) {
  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-body-md font-semibold text-ink">{name}</Text>
        <Text className={`text-body-md font-bold ${TEXT_COLOR[color]}`}>{pct}%</Text>
      </View>
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <View
          className={`h-full rounded-full ${BAR_COLOR[color]}`}
          style={{ width: `${(pct / maxPct) * 100}%` }}
        />
      </View>
    </View>
  );
}
