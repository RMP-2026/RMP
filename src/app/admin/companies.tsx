import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SearchField } from "@/components/admin/SearchField";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Company = {
  id: string;
  name: string;
  location: string;
  vehicles: number;
  revenue: string;
  rating: string | null;
  status: "Active" | "Pending" | "Suspended";
};

const COMPANIES: Company[] = [
  { id: "1", name: "Elite Car Rentals", location: "Miami, FL", vehicles: 18, revenue: "$24.8k", rating: "4.9", status: "Active" },
  { id: "2", name: "Prestige Fleet", location: "New York, NY", vehicles: 24, revenue: "$41.2k", rating: "4.8", status: "Active" },
  { id: "3", name: "TopDrive Miami", location: "Miami, FL", vehicles: 9, revenue: "$12.3k", rating: null, status: "Pending" },
  { id: "4", name: "Luxury Auto Co.", location: "LA, CA", vehicles: 31, revenue: "$58.9k", rating: "4.7", status: "Active" },
];

const FILTERS = [
  { key: "all", label: `All (${COMPANIES.length})` },
  { key: "Active", label: "Active" },
  { key: "Pending", label: `Pending (${COMPANIES.filter((c) => c.status === "Pending").length})` },
  { key: "Suspended", label: "Suspended" },
] as const;

const STATUS_TONE = { Active: "success", Pending: "warning", Suspended: "danger" } as const;

function CompanyCard({ company }: { company: Company }) {
  return (
    <View className="flex-row items-start justify-between rounded-2xl border border-white/5 bg-surface-high p-4">
      <View className="flex-1 pr-3">
        <Text className="text-body-md font-bold text-ink">{company.name}</Text>
        <Text className="mt-0.5 text-body-base text-ink-sub">{company.location}</Text>
        <View className="mt-2 flex-row items-center gap-3">
          <Text className="text-body-base text-ink-sub">{company.vehicles} vehicles</Text>
          <Text className="text-body-base font-bold text-teal">{company.revenue}</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-body-base font-semibold text-warning">{company.rating ?? "—"}</Text>
          </View>
        </View>
      </View>
      <StatusBadge label={company.status} tone={STATUS_TONE[company.status]} />
    </View>
  );
}

export default function AdminCompaniesScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const initialFilter = FILTERS.some((f) => f.key === params.status)
    ? (params.status as (typeof FILTERS)[number]["key"])
    : "all";

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>(initialFilter);

  // Native tabs keep this screen mounted across visits, so re-sync `filter` whenever
  // the status param changes (e.g. navigating here again from a different action row).
  const [syncedStatusParam, setSyncedStatusParam] = useState(params.status);
  if (params.status !== syncedStatusParam) {
    setSyncedStatusParam(params.status);
    setFilter(initialFilter);
  }

  const companies = useMemo(
    () =>
      COMPANIES.filter((c) => filter === "all" || c.status === filter).filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, filter],
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-4 text-heading-xxl font-extrabold text-ink">Companies</Text>

          <SearchField placeholder="Search companies..." value={query} onChangeText={setQuery} />

          <View className="mt-4 flex-row flex-wrap gap-2">
            {FILTERS.map((f) => {
              const selected = filter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  className={`rounded-full px-4 py-2 ${
                    selected ? "bg-teal" : "border border-white/10 bg-surface-high"
                  }`}
                >
                  <Text className={`text-body-base font-bold ${selected ? "text-background" : "text-ink-sub"}`}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-4 gap-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
