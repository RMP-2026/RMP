import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DestructiveButton, GhostButton, PrimaryButton, SecondaryButton } from "../../../components/ui/Button";
import { Checkbox, RadioButton } from "../../../components/ui/Checkbox";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../../components/ui/EmptyState";
import { FilterChip } from "../../../components/ui/FilterChip";
import { PriceRangeSlider } from "../../../components/ui/PriceRangeSlider";
import { RatingDisplay } from "../../../components/ui/RatingDisplay";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { SearchInput } from "../../../components/ui/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { ToggleSwitch } from "../../../components/ui/ToggleSwitch";
import { VehicleCard } from "../../../components/ui/VehicleCard";
import { MOCK_VEHICLES } from "../../../lib/mock-data";

const GUEST_TABS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Search", icon: "search" },
  { label: "Trips", icon: "calendar-outline" },
  { label: "Inbox", icon: "notifications-outline" },
  { label: "Favorites", icon: "heart-outline" },
  { label: "More", icon: "ellipsis-horizontal" },
];

const HOST_TABS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Trips", icon: "briefcase-outline" },
  { label: "Inbox", icon: "mail-outline" },
  { label: "Vehicles", icon: "car-outline" },
  { label: "Business", icon: "bar-chart-outline" },
  { label: "More", icon: "menu-outline" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="mb-3 text-heading-lg font-bold text-ink">{title}</Text>
      {children}
    </View>
  );
}

function TabBarPreview({ tabs, activeIndex }: { tabs: typeof GUEST_TABS; activeIndex: number }) {
  return (
    <View className="flex-row justify-around rounded-2xl border border-white/10 bg-surface-high py-3">
      {tabs.map((tab, i) => (
        <View key={tab.label} className="items-center gap-1">
          <Ionicons name={tab.icon} size={20} color={i === activeIndex ? "#1AE0A8" : "#7A8599"} />
          <Text className={`text-caption-sm ${i === activeIndex ? "text-teal" : "text-ink-sub"}`}>{tab.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ComponentLibraryScreen() {
  const [chipSelected, setChipSelected] = useState(true);
  const [toggleOn, setToggleOn] = useState(true);
  const [radioValue, setRadioValue] = useState("one");
  const [checked, setChecked] = useState(true);
  const [price, setPrice] = useState({ min: 25, max: 220 });

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScreenHeader title="Component Library" />
        <ScrollView contentContainerClassName="px-5 pb-12" showsVerticalScrollIndicator={false}>
          <Section title="Buttons">
            <View className="gap-3">
              <PrimaryButton label="Primary" onPress={() => {}} />
              <SecondaryButton label="Secondary" onPress={() => {}} />
              <GhostButton label="Ghost" onPress={() => {}} fullWidth />
              <DestructiveButton label="Destructive" onPress={() => {}} />
              <PrimaryButton label="Loading" loading onPress={() => {}} />
              <PrimaryButton label="Disabled" disabled onPress={() => {}} />
            </View>
          </Section>

          <Section title="Chips">
            <View className="flex-row flex-wrap gap-2">
              <FilterChip label="Chip" />
              <FilterChip label="Chip selected" selected={chipSelected} onPress={() => setChipSelected((v) => !v)} />
              <FilterChip label="Disabled" />
            </View>
          </Section>

          <Section title="Inputs">
            <View className="gap-3">
              <SearchInput placeholder="Search input" />
            </View>
          </Section>

          <Section title="Toggles / Radio / Checkbox">
            <View className="gap-4">
              <View className="flex-row items-center gap-4">
                <ToggleSwitch value={toggleOn} onValueChange={setToggleOn} />
                <ToggleSwitch value={false} onValueChange={() => {}} />
              </View>
              <RadioButton selected={radioValue === "one"} onPress={() => setRadioValue("one")} label="Option one" />
              <RadioButton selected={radioValue === "two"} onPress={() => setRadioValue("two")} label="Option two" />
              <Checkbox checked={checked} onPress={() => setChecked((v) => !v)} label="Checked" />
              <Checkbox checked={false} onPress={() => {}} label="Unchecked" />
            </View>
          </Section>

          <Section title="Navigation">
            <Text className="mb-2 text-body-base text-ink-sub">Bottom Nav (Guest)</Text>
            <TabBarPreview tabs={GUEST_TABS} activeIndex={0} />
            <Text className="mb-2 mt-4 text-body-base text-ink-sub">Bottom Nav (Host)</Text>
            <TabBarPreview tabs={HOST_TABS} activeIndex={2} />
          </Section>

          <Section title="Slider (Price)">
            <PriceRangeSlider min={25} max={300} valueMin={price.min} valueMax={price.max} onChange={setPrice} />
          </Section>

          <Section title="Rating">
            <RatingDisplay rating={4.98} tripCount={132} />
          </Section>

          <Section title="Badges">
            <View className="flex-row flex-wrap gap-2">
              <StatusBadge label="Active" tone="active" />
              <StatusBadge label="Pending" tone="pending" />
              <StatusBadge label="Canceled" tone="canceled" />
              <StatusBadge label="Verified" tone="verified" />
            </View>
          </Section>

          <Section title="Vehicle card">
            <VehicleCard vehicle={MOCK_VEHICLES[0]} favorited onToggleFavorite={() => {}} onPress={() => {}} />
          </Section>

          <Section title="Loading state">
            <LoadingSkeleton />
          </Section>

          <Section title="Empty state">
            <View className="rounded-2xl border border-white/10 bg-surface">
              <EmptyState icon="car-outline" title="No results" subtitle="Try a different search." />
            </View>
          </Section>

          <Section title="Error state">
            <View className="rounded-2xl border border-white/10 bg-surface">
              <ErrorState onRetry={() => {}} />
            </View>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
