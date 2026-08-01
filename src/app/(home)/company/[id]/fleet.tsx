import { Href, router, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { VehicleCard } from "../../../../components/ui/VehicleCard";
import { useFavorites } from "../../../../lib/favorites-context";
import { getVehicleById, MOCK_COMPANY } from "../../../../lib/mock-data";
import { Routes } from "../../../../lib/routes";

export default function CompanyFleetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const company = id === MOCK_COMPANY.id ? MOCK_COMPANY : null;
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!company) return null;

  const vehicles = company.vehicleIds.map(getVehicleById).filter((v): v is NonNullable<typeof v> => !!v);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScreenHeader title={`${company.name}'s cars`} />
        <FlatList
          data={vehicles}
          keyExtractor={(v) => v.id}
          contentContainerClassName="gap-3 px-5 pb-8"
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
      </SafeAreaView>
    </View>
  );
}
