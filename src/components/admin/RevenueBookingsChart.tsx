import { Text, View } from "react-native";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const REVENUE = [30, 38, 34, 55, 62, 70, 92];
const BOOKINGS = [24, 30, 28, 46, 50, 60, 78];

const CHART_HEIGHT = 140;

export function RevenueBookingsChart() {
  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-label-xs font-bold tracking-widest text-ink-sub">REVENUE &amp; BOOKINGS</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="h-1 w-3 rounded-full bg-teal" />
            <Text className="text-caption-sm text-ink-sub">Revenue</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1 w-3 rounded-full bg-info" />
            <Text className="text-caption-sm text-ink-sub">Bookings</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-end justify-between" style={{ height: CHART_HEIGHT }}>
        {MONTHS.map((month, i) => (
          <View key={month} className="items-center gap-2">
            <View className="flex-row items-end gap-1" style={{ height: CHART_HEIGHT - 20 }}>
              <View
                className="w-2 rounded-full bg-teal"
                style={{ height: (REVENUE[i] / 100) * (CHART_HEIGHT - 20) }}
              />
              <View
                className="w-2 rounded-full bg-info"
                style={{ height: (BOOKINGS[i] / 100) * (CHART_HEIGHT - 20) }}
              />
            </View>
            <Text className="text-caption-sm text-ink-sub">{month}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
