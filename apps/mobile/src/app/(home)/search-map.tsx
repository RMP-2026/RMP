import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchMapPin } from "../../components/ui/SearchMapPin";
import { SearchMapVehiclePreview } from "../../components/ui/SearchMapVehiclePreview";
import { useFavorites } from "../../lib/favorites-context";
import { CITY_MIAMI } from "../../lib/placeholder-images";
import { MOCK_VEHICLES } from "../../lib/mock-data";
import { Routes } from "../../lib/routes";

// TODO: swap for the installed map provider (e.g. react-native-maps) once configured;
// mock percentage coordinates stand in for real lat/lng pins until then.
const MOCK_PINS = [
  { x: 22, y: 28 },
  { x: 55, y: 18 },
  { x: 68, y: 46 },
  { x: 38, y: 62 },
];

export default function SearchMapScreen() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedVehicle = MOCK_VEHICLES.find((v) => v.id === selectedId) ?? null;

  return (
    <View className="flex-1 bg-background">
      <View className="absolute inset-0">
        <Image source={{ uri: CITY_MIAMI }} contentFit="cover" className="h-full w-full" style={{ opacity: 0.35 }} />
        <View className="absolute inset-0 bg-background/40" />
      </View>

      {MOCK_VEHICLES.map((vehicle, i) => (
        <SearchMapPin
          key={vehicle.id}
          price={vehicle.pricePerDay}
          selected={selectedId === vehicle.id}
          x={MOCK_PINS[i % MOCK_PINS.length].x}
          y={MOCK_PINS[i % MOCK_PINS.length].y}
          onPress={() => setSelectedId(vehicle.id)}
        />
      ))}

      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View className="flex-row items-center justify-between px-4 pt-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md active:opacity-80"
          >
            <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
          </Pressable>
          <View className="rounded-full bg-teal px-4 py-2 shadow-md">
            <Text className="text-body-base font-extrabold text-background">
              {MOCK_VEHICLES.length} cars in this area
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(Routes.filters as Href)}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md active:opacity-80"
          >
            <Ionicons name="options-outline" size={18} color="#F0F4FF" />
          </Pressable>
        </View>

        <View className="gap-3 px-4 pb-2">
          {!selectedVehicle ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {}}
              className="self-center rounded-full border border-white/10 bg-surface px-5 py-2.5 shadow-md active:opacity-80"
            >
              <Text className="text-body-base font-semibold text-ink">Search this area</Text>
            </Pressable>
          ) : null}

          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Center on my location"
              onPress={() => {}}
              className="h-11 w-11 items-center justify-center rounded-full bg-surface shadow-md active:opacity-80"
            >
              <Ionicons name="locate" size={18} color="#1AE0A8" />
            </Pressable>
          </View>

          {selectedVehicle ? (
            <SearchMapVehiclePreview
              vehicle={selectedVehicle}
              favorited={isFavorite(selectedVehicle.id)}
              onToggleFavorite={() => toggleFavorite(selectedVehicle.id)}
              onPress={() => router.push(Routes.vehicle(selectedVehicle.id) as Href)}
            />
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
