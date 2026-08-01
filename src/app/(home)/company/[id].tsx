import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { VehicleCard } from "../../../components/ui/VehicleCard";
import { useFavorites } from "../../../lib/favorites-context";
import { getVehicleById, MOCK_COMPANY } from "../../../lib/mock-data";
import { Routes } from "../../../lib/routes";

export default function CompanyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const company = id === MOCK_COMPANY.id ? MOCK_COMPANY : null;
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!company) return null;

  const previewVehicles = company.vehicleIds.slice(0, 3).map(getVehicleById).filter(Boolean);

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
        <View>
          <Image source={{ uri: company.bannerUrl }} contentFit="cover" style={{ width: "100%", height: 180 }} />
          <View className="absolute inset-0 bg-black/20" />
          <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pt-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
            >
              <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share profile"
              onPress={() => router.push(Routes.companyShare(company.id) as Href)}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
            >
              <Ionicons name="share-outline" size={18} color="#F0F4FF" />
            </Pressable>
          </SafeAreaView>
        </View>

        <View className="gap-4 px-5 pt-3">
          <View className="-mt-12 flex-row items-end gap-3">
            <Image
              source={{ uri: company.avatarUrl }}
              contentFit="cover"
              className="h-24 w-24 rounded-full border-4 border-background"
            />
          </View>

          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-heading-xxl font-extrabold text-ink">{company.name}</Text>
              {company.verified ? <Ionicons name="checkmark-circle" size={20} color="#1AE0A8" /> : null}
            </View>
            {company.allStarHost ? (
              <View className="mt-1 flex-row items-center gap-1">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-body-base font-semibold text-ink-sub">All-Star Host</Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row justify-between rounded-2xl border border-white/10 bg-surface p-4">
            <Stat label="Trips" value={company.tripCount.toLocaleString()} />
            <Stat label="Rating" value={company.rating.toFixed(2)} />
            <Stat label="Years hosting" value={String(company.yearsHosting)} />
          </View>

          <View className="flex-row items-center gap-2">
            <Ionicons name="chatbox-ellipses-outline" size={16} color="#7A8599" />
            <Text className="text-body-base text-ink-sub">Typically responds within {company.responseTime}</Text>
          </View>

          <Text className="text-body-md text-ink-sub">{company.bio}</Text>

          <View className="flex-row gap-3">
            <PrimaryButton
              label={`View cars (${company.vehicleIds.length})`}
              fullWidth={false}
              className="flex-1"
              onPress={() => router.push(Routes.companyFleet(company.id) as Href)}
            />
            <SecondaryButton
              label="Message company"
              fullWidth={false}
              className="flex-1"
              onPress={() => router.push(Routes.inboxThread("thread-1") as Href)}
            />
          </View>

          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-heading-lg font-bold text-ink">Fleet</Text>
              <Pressable onPress={() => router.push(Routes.companyFleet(company.id) as Href)} className="active:opacity-70">
                <Text className="text-body-base font-semibold text-teal">See all</Text>
              </Pressable>
            </View>
            <View className="gap-3">
              {previewVehicles.map(
                (vehicle) =>
                  vehicle && (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      favorited={isFavorite(vehicle.id)}
                      onToggleFavorite={() => toggleFavorite(vehicle.id)}
                      onPress={() => router.push(Routes.vehicle(vehicle.id) as Href)}
                    />
                  )
              )}
            </View>
          </View>

          <View>
            <Text className="mb-2 text-heading-lg font-bold text-ink">Policies</Text>
            <StatusBadge label="Verified Company" tone="verified" />
            <Text className="mt-2 text-body-base text-ink-sub">
              All vehicles are independently owned and operated by {company.name}. RMP does not own or maintain listed
              vehicles.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="text-heading-lg font-extrabold text-ink">{value}</Text>
      <Text className="text-caption-sm text-ink-sub">{label}</Text>
    </View>
  );
}
