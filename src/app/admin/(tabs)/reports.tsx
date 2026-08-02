import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MarketBar } from "@/components/admin/MarketBar";
import { RevenueBookingsChart } from "@/components/admin/RevenueBookingsChart";
import type { TrendColor } from "@/components/admin/TrendPill";

const TOP_MARKETS: { name: string; pct: number; color: TrendColor }[] = [
  { name: "Miami, FL", pct: 34, color: "teal" },
  { name: "New York, NY", pct: 28, color: "info" },
  { name: "Los Angeles, CA", pct: 22, color: "warning" },
  { name: "Chicago, IL", pct: 16, color: "success" },
];

const GROWTH_STATS: { value: string; label: string; color: TrendColor }[] = [
  { value: "31%", label: "User Growth", color: "success" },
  { value: "24%", label: "Revenue Growth", color: "teal" },
  { value: "18%", label: "Booking Growth", color: "info" },
];

const GROWTH_TEXT_COLOR: Record<TrendColor, string> = {
  teal: "text-teal",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
};

const maxMarketPct = Math.max(...TOP_MARKETS.map((m) => m.pct));

export default function AdminReportsScreen() {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-4 text-heading-xxl font-extrabold text-ink">Platform Analytics</Text>

          <View className="mt-6 rounded-2xl border border-white/5 bg-surface-high p-4">
            <RevenueBookingsChart />
          </View>

          <Text className="mb-4 mt-6 text-label-xs font-bold tracking-widest text-ink-sub">
            TOP MARKETS
          </Text>
          <View>
            {TOP_MARKETS.map((market) => (
              <MarketBar key={market.name} name={market.name} pct={market.pct} maxPct={maxMarketPct} color={market.color} />
            ))}
          </View>

          <View className="mt-2 flex-row justify-between gap-3">
            {GROWTH_STATS.map((stat) => (
              <View
                key={stat.label}
                className="flex-1 items-center rounded-2xl border border-white/5 bg-surface-high py-4"
              >
                <Text className={`text-heading-lg font-extrabold ${GROWTH_TEXT_COLOR[stat.color]}`}>
                  {stat.value}
                </Text>
                <Text className="mt-1 text-center text-caption-sm text-ink-sub">{stat.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
