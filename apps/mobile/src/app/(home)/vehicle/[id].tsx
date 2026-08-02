import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PhotoGallery } from "../../../components/ui/PhotoGallery";
import { RatingDisplay } from "../../../components/ui/RatingDisplay";
import { StickyBookingBar } from "../../../components/ui/StickyBookingBar";
import { useFavorites } from "../../../lib/favorites-context";
import { getVehicleById, MOCK_COMPANY, MOCK_REVIEWS } from "../../../lib/mock-data";
import { Routes } from "../../../lib/routes";

const VISIBLE_FEATURES = 6;

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = getVehicleById(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-body-md text-ink-sub">Vehicle not found.</Text>
      </View>
    );
  }

  const reviews = MOCK_REVIEWS.filter((r) => r.vehicleId === vehicle.id);
  const features = showAllFeatures ? vehicle.features : vehicle.features.slice(0, VISIBLE_FEATURES);
  const extraOptions = [
    { id: "child-seat", label: "Child seat", price: 12 },
    { id: "gps", label: "GPS unit", price: 8 },
    { id: "additional-driver", label: "Additional driver", price: 15 },
  ];

  const toggleExtra = (extraId: string) =>
    setSelectedExtras((prev) => (prev.includes(extraId) ? prev.filter((e) => e !== extraId) : [...prev, extraId]));

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <View>
          <PhotoGallery photos={vehicle.photos} height={300} />
          <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pt-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
            >
              <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
            </Pressable>
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share"
                onPress={() =>
                  Share.share({ message: `Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model} on RMP` })
                }
                className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
              >
                <Ionicons name="share-outline" size={18} color="#F0F4FF" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isFavorite(vehicle.id) ? "Remove from favorites" : "Add to favorites"}
                onPress={() => toggleFavorite(vehicle.id)}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
              >
                <Ionicons
                  name={isFavorite(vehicle.id) ? "heart" : "heart-outline"}
                  size={18}
                  color={isFavorite(vehicle.id) ? "#EF4444" : "#F0F4FF"}
                />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <View className="gap-5 px-5 pt-5">
          <View>
            <Text className="text-heading-xxl font-extrabold text-ink">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text className="mt-1 text-body-md text-ink-sub">{vehicle.trim}</Text>
            <View className="mt-2 flex-row items-center gap-3">
              <RatingDisplay rating={vehicle.rating} tripCount={vehicle.tripCount} />
              {vehicle.verifiedCompany ? <StatusBadge label="All-Star Host" tone="verified" /> : null}
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4 rounded-2xl border border-white/10 bg-surface p-4">
            <SpecItem icon="people-outline" label={`${vehicle.seats} seats`} />
            <SpecItem icon="flame-outline" label={vehicle.fuel} />
            <SpecItem icon="speedometer-outline" label={`${vehicle.mpg} MPG`} />
            <SpecItem icon="git-network-outline" label={vehicle.drivetrain} />
            <SpecItem icon="cog-outline" label={vehicle.transmission} />
          </View>

          <View>
            <Text className="mb-3 text-heading-lg font-bold text-ink">Features</Text>
            <View className="flex-row flex-wrap gap-2">
              {features.map((f) => (
                <View key={f} className="rounded-full border border-white/10 bg-surface-high px-3 py-2">
                  <Text className="text-body-base text-ink">{f}</Text>
                </View>
              ))}
            </View>
            {vehicle.features.length > VISIBLE_FEATURES ? (
              <Pressable onPress={() => setShowAllFeatures((v) => !v)} className="mt-3 self-start active:opacity-70">
                <Text className="text-body-base font-semibold text-teal">
                  {showAllFeatures ? "Show less" : `See more features (+${vehicle.features.length - VISIBLE_FEATURES})`}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View>
            <View className="flex-row items-center justify-between">
              <Text className="text-heading-lg font-bold text-ink">Extras</Text>
            </View>
            <View className="mt-3 gap-2">
              {extraOptions.map((extra) => {
                const selected = selectedExtras.includes(extra.id);
                return (
                  <Pressable
                    key={extra.id}
                    onPress={() => toggleExtra(extra.id)}
                    className={`flex-row items-center justify-between rounded-2xl border p-4 active:opacity-90 ${
                      selected ? "border-teal bg-teal/10" : "border-white/10 bg-surface"
                    }`}
                  >
                    <Text className={`text-body-md font-semibold ${selected ? "text-teal" : "text-ink"}`}>
                      {extra.label}
                    </Text>
                    <Text className="text-body-base text-ink-sub">+${extra.price}/day</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => router.push(Routes.company(vehicle.companyId) as Href)}
            className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface p-4 active:opacity-90"
          >
            <Image source={{ uri: MOCK_COMPANY.avatarUrl }} contentFit="cover" className="h-12 w-12 rounded-full" />
            <View className="flex-1">
              <Text className="text-body-md font-bold text-ink">{MOCK_COMPANY.name}</Text>
              <Text className="text-body-base text-ink-sub">Responds within {MOCK_COMPANY.responseTime}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7A8599" />
          </Pressable>

          {reviews.length > 0 ? (
            <View>
              <Text className="mb-3 text-heading-lg font-bold text-ink">Reviews</Text>
              <View className="gap-3">
                {reviews.map((review) => (
                  <View key={review.id} className="rounded-2xl border border-white/10 bg-surface p-4">
                    <View className="flex-row items-center gap-3">
                      <Image source={{ uri: review.authorAvatarUrl }} contentFit="cover" className="h-9 w-9 rounded-full" />
                      <View>
                        <Text className="text-body-base font-bold text-ink">{review.authorName}</Text>
                        <Text className="text-caption-sm text-ink-sub">{review.date}</Text>
                      </View>
                    </View>
                    <Text className="mt-2 text-body-base text-ink-sub">{review.comment}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View>
            <Text className="mb-2 text-heading-lg font-bold text-ink">Rules & cancellation</Text>
            <Text className="text-body-base text-ink-sub">No smoking. No pets. Return with the same fuel level.</Text>
            <Text className="mt-2 text-body-base text-ink-sub">Free cancellation until 48 hours before your trip.</Text>
          </View>
        </View>
      </ScrollView>

      <StickyBookingBar
        pricePerDay={vehicle.pricePerDay}
        buttonLabel="Continue"
        onPress={() => router.push(Routes.bookingDates(vehicle.id) as Href)}
      />
    </View>
  );
}

function SpecItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={14} color="#7A8599" />
      <Text className="text-body-base text-ink-sub">{label}</Text>
    </View>
  );
}
