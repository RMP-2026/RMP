import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RevenueSparkline } from "@/components/admin/RevenueSparkline";
import { StatCard } from "@/components/admin/StatCard";

function ActionRow({
  icon,
  message,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  color: "warning" | "danger";
}) {
  const styles =
    color === "warning"
      ? { border: "border-warning/25", bg: "bg-warning/10", text: "text-warning", hex: "#F59E0B" }
      : { border: "border-danger/25", bg: "bg-danger/10", text: "text-danger", hex: "#EF4444" };

  return (
    <Pressable
      className={`flex-row items-center gap-3 rounded-2xl border ${styles.border} ${styles.bg} p-4 active:opacity-70`}
    >
      <Ionicons name={icon} size={18} color={styles.hex} />
      <Text className={`flex-1 text-body-md font-semibold ${styles.text}`}>{message}</Text>
      <Ionicons name="chevron-forward" size={16} color={styles.hex} />
    </Pressable>
  );
}

export default function AdminOverviewScreen() {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4 flex-row items-start justify-between">
            <View>
              <Text className="text-label-xs font-bold tracking-widest text-teal">ADMIN PORTAL</Text>
              <Text className="mt-1 text-heading-xxl font-extrabold text-ink">Platform Overview</Text>
            </View>
            <View className="rounded-full border border-white/10 bg-surface-high px-4 py-2">
              <Text className="text-body-base font-medium text-ink">Jul 2025</Text>
            </View>
          </View>

          <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
            <StatCard value="$124k" label="Platform Revenue" trend="24%" color="teal" />
            <StatCard value="847" label="Total Bookings" trend="18%" color="success" />
            <StatCard value="156" label="Active Companies" trend="8%" color="info" />
            <StatCard value="12.4k" label="Registered Users" trend="31%" color="warning" />
          </View>

          <View className="mt-6 rounded-2xl border border-white/5 bg-surface-high p-4">
            <Text className="text-label-xs font-bold tracking-widest text-ink-sub">PLATFORM REVENUE</Text>
            <View className="mt-3">
              <RevenueSparkline />
            </View>
          </View>

          <Text className="mb-3 mt-6 text-label-xs font-bold tracking-widest text-ink-sub">
            ACTION REQUIRED
          </Text>
          <View className="gap-3">
            <ActionRow icon="briefcase-outline" message="8 companies pending verification" color="warning" />
            <ActionRow icon="warning-outline" message="2 active disputes need review" color="danger" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
