import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheet } from "../../../components/ui/BottomSheet";
import { PrimaryButton } from "../../../components/ui/Button";
import { DateTimeField } from "../../../components/ui/DateTimeField";
import { CITY_LA, CITY_LV, CITY_MIAMI } from "../../../lib/placeholder-images";
import { Routes } from "../../../lib/routes";
import { useSearch } from "../../../lib/search-context";

const DATE_OPTIONS = ["Aug 9, 10 AM", "Aug 10, 10 AM", "Aug 11, 10 AM", "Aug 12, 10 AM", "Aug 13, 10 AM"];

const DESTINATIONS = [
  { name: "Miami", state: "FL", price: 41, image: CITY_MIAMI },
  { name: "Los Angeles", state: "CA", price: 48, image: CITY_LA },
  { name: "Las Vegas", state: "NV", price: 36, image: CITY_LV },
];

const CATEGORIES: { label: string; type: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "SUVs", type: "SUV", icon: "car-sport-outline" },
  { label: "Luxury", type: "Luxury", icon: "diamond-outline" },
  { label: "Trucks", type: "Truck", icon: "bus-outline" },
  { label: "Convertibles", type: "Convertible", icon: "sunny-outline" },
];

const CITY_SUGGESTIONS = ["Miami, FL", "Los Angeles, CA", "Las Vegas, NV", "Orlando, FL", "New York, NY"];

export default function GuestHomeScreen() {
  const { location, setLocation, fromLabel, setFromLabel, untilLabel, setUntilLabel, recentSearches, addRecentSearch } =
    useSearch();
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState("");

  const goToResults = () => {
    addRecentSearch(location);
    router.push(Routes.searchResults as Href);
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
          <View className="mt-2 flex-row items-center justify-between">
            <Image
              source={require("../../../../assets/images/rmp-logo.png")}
              contentFit="contain"
              className="h-9 w-9"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push("/notifications" as Href)}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
            >
              <Ionicons name="notifications-outline" size={20} color="#F0F4FF" />
            </Pressable>
          </View>

          <View className="mt-5 gap-3 rounded-3xl border border-white/10 bg-surface p-4">
            <Pressable
              accessibilityRole="button"
              onPress={() => setLocationSheetOpen(true)}
              className="rounded-2xl border border-white/10 bg-surface-high px-4 py-3 active:opacity-80"
            >
              <Text className="text-caption-sm font-semibold text-ink-sub">WHERE TO?</Text>
              <Text className="mt-0.5 text-body-md font-semibold text-ink">{location || "Airport, hotel, address, city"}</Text>
            </Pressable>

            <View className="flex-row gap-3">
              <DateTimeField label="FROM" value={fromLabel} options={DATE_OPTIONS} onChange={setFromLabel} />
              <DateTimeField label="UNTIL" value={untilLabel} options={DATE_OPTIONS} onChange={setUntilLabel} />
            </View>

            <PrimaryButton label="Search for cars" onPress={goToResults} />
          </View>

          <Text className="mb-3 mt-8 text-heading-lg font-extrabold text-ink">Popular destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            <View className="flex-row gap-3">
              {DESTINATIONS.map((dest) => (
                <Pressable
                  key={dest.name}
                  accessibilityRole="button"
                  onPress={() => {
                    setLocation(`${dest.name}, ${dest.state}`);
                    addRecentSearch(`${dest.name}, ${dest.state}`);
                    router.push(Routes.searchResults as Href);
                  }}
                  className="w-32 overflow-hidden rounded-2xl active:opacity-90"
                >
                  <Image source={{ uri: dest.image }} contentFit="cover" className="h-24 w-32" />
                  <View className="absolute inset-0 bg-black/25" />
                  <View className="absolute bottom-2 left-2 right-2">
                    <Text className="text-body-base font-bold text-ink">{dest.name}</Text>
                    <Text className="text-caption-sm text-ink">From ${dest.price}/day</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text className="mb-3 mt-8 text-heading-lg font-extrabold text-ink">Browse by category</Text>
          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.label}
                accessibilityRole="button"
                onPress={() => router.push(Routes.searchResults as Href)}
                className="items-center gap-2 rounded-2xl border border-white/10 bg-surface px-5 py-4 active:opacity-80"
                style={{ width: "47%" }}
              >
                <Ionicons name={cat.icon} size={22} color="#1AE0A8" />
                <Text className="text-body-base font-semibold text-ink">{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet visible={locationSheetOpen} onClose={() => setLocationSheetOpen(false)} title="Where to?">
        <View className="gap-4">
          <View className="h-14 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface-high px-4">
            <Ionicons name="search" size={18} color="#7A8599" />
            <TextInput
              className="flex-1 text-body-md text-ink"
              placeholder="Airport, hotel, address, city"
              placeholderTextColor="#7A8599"
              value={locationDraft}
              onChangeText={setLocationDraft}
              autoFocus
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLocation("Current location");
              setLocationSheetOpen(false);
            }}
            className="flex-row items-center gap-3 active:opacity-70"
          >
            <Ionicons name="locate" size={18} color="#1AE0A8" />
            <Text className="text-body-md font-semibold text-teal">Use current location</Text>
          </Pressable>

          {recentSearches.length > 0 ? (
            <View>
              <Text className="mb-2 text-label-xs font-semibold tracking-widest text-ink-sub">RECENT SEARCHES</Text>
              {recentSearches.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setLocation(item);
                    setLocationSheetOpen(false);
                  }}
                  className="flex-row items-center gap-3 py-2.5 active:opacity-70"
                >
                  <Ionicons name="time-outline" size={16} color="#7A8599" />
                  <Text className="text-body-md text-ink">{item}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View>
            <Text className="mb-2 text-label-xs font-semibold tracking-widest text-ink-sub">SUGGESTED CITIES</Text>
            {CITY_SUGGESTIONS.filter((c) => c.toLowerCase().includes(locationDraft.toLowerCase())).map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setLocation(item);
                  setLocationSheetOpen(false);
                }}
                className="flex-row items-center gap-3 py-2.5 active:opacity-70"
              >
                <Ionicons name="location-outline" size={16} color="#7A8599" />
                <Text className="text-body-md text-ink">{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
