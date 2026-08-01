import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, LoadingSkeleton } from "../../components/ui/EmptyState";
import { FilterChip } from "../../components/ui/FilterChip";
import { VehicleCard } from "../../components/ui/VehicleCard";
import { useFavorites } from "../../lib/favorites-context";
import { MOCK_VEHICLES } from "../../lib/mock-data";
import { Routes } from "../../lib/routes";
import { useSearch } from "../../lib/search-context";
import type { VehicleType } from "../../types/rmp";

const QUICK_FILTERS: { label: string; type?: VehicleType; allStar?: boolean; underPrice?: number }[] = [
  { label: "SUV", type: "SUV" },
  { label: "Under $100", underPrice: 100 },
  { label: "All-star", allStar: true },
];

type LoadState = "loading" | "loaded" | "error" | "empty";

export default function SearchResultsScreen() {
  const { location, fromLabel, untilLabel, filters } = useSearch();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeQuick, setActiveQuick] = useState<string[]>([]);
  const [state] = useState<LoadState>("loaded");

  const results = useMemo(() => {
    let list = MOCK_VEHICLES;
    if (filters.vehicleTypes.length > 0) list = list.filter((v) => filters.vehicleTypes.includes(v.type));
    if (activeQuick.includes("SUV")) list = list.filter((v) => v.type === "SUV");
    if (activeQuick.includes("Under $100")) list = list.filter((v) => v.pricePerDay < 100);
    if (activeQuick.includes("All-star")) list = list.filter((v) => v.verifiedCompany);
    return list;
  }, [activeQuick, filters.vehicleTypes]);

  const toggleQuick = (label: string) =>
    setActiveQuick((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 py-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
          >
            <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-heading-lg font-bold text-ink">{location}</Text>
            <Text className="text-body-base text-ink-sub">
              {fromLabel.split(",")[0]} – {untilLabel.split(",")[0]}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(Routes.filters as Href)}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
          >
            <Ionicons name="options-outline" size={18} color="#F0F4FF" />
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-2 px-4 pb-2 pt-1">
          <FilterChip
            label="Filters"
            icon={<Ionicons name="filter" size={14} color="#F0F4FF" />}
            onPress={() => router.push(Routes.filters as Href)}
          />
          {QUICK_FILTERS.map((f) => (
            <FilterChip
              key={f.label}
              label={f.label}
              selected={activeQuick.includes(f.label)}
              onPress={() => toggleQuick(f.label)}
            />
          ))}
        </View>

        <View className="flex-row items-center justify-between px-4 pb-2">
          <Text className="text-body-base text-ink-sub">{results.length} cars available</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(Routes.searchMap as Href)}
            className="flex-row items-center gap-1.5 active:opacity-70"
          >
            <Ionicons name="map-outline" size={16} color="#1AE0A8" />
            <Text className="text-body-base font-semibold text-teal">Map</Text>
          </Pressable>
        </View>

        {state === "loading" ? (
          <View className="gap-3 px-4">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} />
            ))}
          </View>
        ) : results.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No cars match your search"
            subtitle="Try adjusting your filters or dates."
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-3 px-4 pb-8"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <VehicleCard
                vehicle={item}
                favorited={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
                onPress={() => router.push(Routes.vehicle(item.id) as Href)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
