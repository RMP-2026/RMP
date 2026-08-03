import { Href, router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../../components/ui/EmptyState";
import { PrimaryButton } from "../../../components/ui/Button";
import { VehicleCard } from "../../../components/ui/VehicleCard";
import { useFavorites } from "../../../lib/favorites-context";
import { MOCK_VEHICLES } from "../../../lib/mock-data";
import { Routes } from "../../../lib/routes";

export default function FavoritesScreen() {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [editMode, setEditMode] = useState(false);
  const favoriteVehicles = MOCK_VEHICLES.filter((v) => favoriteIds.has(v.id));

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
          <Text className="text-heading-xl font-extrabold text-ink">Favorites</Text>
          {favoriteVehicles.length > 0 ? (
            <Pressable onPress={() => setEditMode((v) => !v)} className="active:opacity-70">
              <Text className="text-body-md font-semibold text-teal">{editMode ? "Done" : "Edit"}</Text>
            </Pressable>
          ) : null}
        </View>

        {favoriteVehicles.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            subtitle="Tap the heart on any car to save it here."
            action={
              <PrimaryButton
                label="Browse cars"
                fullWidth={false}
                className="mt-2 px-8"
                onPress={() => router.push(Routes.searchResults as Href)}
              />
            }
          />
        ) : (
          <FlatList
            data={favoriteVehicles}
            keyExtractor={(v) => v.id}
            contentContainerClassName="gap-3 px-5 pb-8"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-2">
                {editMode ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove from favorites"
                    onPress={() => toggleFavorite(item.id)}
                    className="h-9 w-9 items-center justify-center rounded-full bg-danger/15"
                  >
                    <Text className="text-body-md font-bold text-danger">−</Text>
                  </Pressable>
                ) : null}
                <View className="flex-1">
                  <VehicleCard
                    vehicle={item}
                    favorited
                    onToggleFavorite={() => toggleFavorite(item.id)}
                    onPress={() => router.push(Routes.vehicle(item.id) as Href)}
                  />
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
