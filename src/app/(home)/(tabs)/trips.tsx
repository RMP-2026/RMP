import { Href, router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../../components/ui/EmptyState";
import { TripCard } from "../../../components/ui/TripCard";
import { getVehicleById, MOCK_TRIPS } from "../../../lib/mock-data";
import { Routes } from "../../../lib/routes";
import type { TripStatus } from "../../../types/rmp";

const TABS = ["Upcoming", "Past", "Canceled"] as const;
type Tab = (typeof TABS)[number];

const STATUS_FOR_TAB: Record<Tab, TripStatus[]> = {
  Upcoming: ["requested", "confirmed", "upcoming", "active"],
  Past: ["completed"],
  Canceled: ["canceled"],
};

export default function TripsScreen() {
  const [tab, setTab] = useState<Tab>("Upcoming");

  const trips = useMemo(
    () => MOCK_TRIPS.filter((t) => STATUS_FOR_TAB[tab].includes(t.status)),
    [tab]
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <Text className="px-5 pb-2 pt-3 text-heading-xl font-extrabold text-ink">Trips</Text>

        <View className="flex-row gap-2 px-5 pb-3">
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`h-10 items-center justify-center rounded-full px-4 ${
                tab === t ? "bg-teal" : "border border-white/10 bg-surface-high"
              }`}
            >
              <Text className={`text-body-base font-bold ${tab === t ? "text-background" : "text-ink"}`}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {trips.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={`No ${tab.toLowerCase()} trips`}
            subtitle="Book a car to see your trips here."
          />
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(t) => t.id}
            contentContainerClassName="gap-3 px-5 pb-8"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const vehicle = getVehicleById(item.vehicleId);
              if (!vehicle) return null;
              return (
                <TripCard trip={item} vehicle={vehicle} onPress={() => router.push(Routes.tripDetail(item.id) as Href)} />
              );
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
