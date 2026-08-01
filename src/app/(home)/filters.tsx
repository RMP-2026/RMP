import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/ui/Button";
import { FilterChip } from "../../components/ui/FilterChip";
import { PriceRangeSlider } from "../../components/ui/PriceRangeSlider";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { SelectField } from "../../components/ui/SelectField";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { MOCK_VEHICLES } from "../../lib/mock-data";
import { useSearch } from "../../lib/search-context";
import { DEFAULT_FILTERS, SearchFilters, VehicleType } from "../../types/rmp";

const VEHICLE_TYPES: VehicleType[] = ["SUV", "Truck", "Sedan", "Convertible"];
const MAKES = ["Toyota", "Tesla", "Ford", "Jeep"];
const YEARS = ["2025", "2024", "2023", "2022"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const SEATS = ["2", "4", "5", "7+"];

export default function FiltersScreen() {
  const { filters: savedFilters, setFilters } = useSearch();
  const [filters, setLocalFilters] = useState<SearchFilters>(savedFilters);

  const resultCount = useMemo(() => {
    return MOCK_VEHICLES.filter((v) => {
      if (v.pricePerDay < filters.priceMin || v.pricePerDay > filters.priceMax) return false;
      if (filters.vehicleTypes.length > 0 && !filters.vehicleTypes.includes(v.type)) return false;
      if (filters.make && v.make !== filters.make) return false;
      if (filters.year && String(v.year) !== filters.year) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      if (filters.seats && filters.seats !== "7+" && String(v.seats) !== filters.seats) return false;
      if (filters.allStarHostsOnly && !v.verifiedCompany) return false;
      return true;
    }).length;
  }, [filters]);

  const toggleType = (type: VehicleType) =>
    setLocalFilters((prev) => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(type)
        ? prev.vehicleTypes.filter((t) => t !== type)
        : [...prev.vehicleTypes, type],
    }));

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScreenHeader
          title="Filters"
          right={
            <Pressable
              accessibilityRole="button"
              onPress={() => setLocalFilters(DEFAULT_FILTERS)}
              className="h-10 items-center justify-center active:opacity-70"
            >
              <Text className="text-body-base font-semibold text-teal">Clear all</Text>
            </Pressable>
          }
        />

        <ScrollView contentContainerClassName="px-5 pb-4" showsVerticalScrollIndicator={false}>
          <Text className="mb-3 mt-2 text-heading-lg font-bold text-ink">Price range</Text>
          <PriceRangeSlider
            min={25}
            max={300}
            valueMin={filters.priceMin}
            valueMax={filters.priceMax}
            onChange={({ min, max }) => setLocalFilters((prev) => ({ ...prev, priceMin: min, priceMax: max }))}
          />

          <Text className="mb-3 mt-8 text-heading-lg font-bold text-ink">Vehicle type</Text>
          <View className="flex-row flex-wrap gap-2">
            <FilterChip
              label="All"
              selected={filters.vehicleTypes.length === 0}
              onPress={() => setLocalFilters((prev) => ({ ...prev, vehicleTypes: [] }))}
            />
            {VEHICLE_TYPES.map((type) => (
              <FilterChip
                key={type}
                label={type}
                selected={filters.vehicleTypes.includes(type)}
                onPress={() => toggleType(type)}
              />
            ))}
          </View>

          <View className="mt-6">
            <SelectField
              label="Make"
              value={filters.make}
              options={MAKES}
              onChange={(v) => setLocalFilters((prev) => ({ ...prev, make: v }))}
            />
            <SelectField
              label="Year"
              value={filters.year}
              options={YEARS}
              onChange={(v) => setLocalFilters((prev) => ({ ...prev, year: v }))}
            />
            <SelectField
              label="Transmission"
              value={filters.transmission}
              options={TRANSMISSIONS}
              onChange={(v) => setLocalFilters((prev) => ({ ...prev, transmission: v }))}
            />
            <SelectField
              label="Seats"
              value={filters.seats}
              options={SEATS}
              onChange={(v) => setLocalFilters((prev) => ({ ...prev, seats: v }))}
            />
          </View>

          <View className="mt-4 gap-4">
            <View className="flex-row items-center justify-between border-b border-white/5 py-3">
              <Text className="text-body-md font-semibold text-ink">All-Star Hosts</Text>
              <ToggleSwitch
                value={filters.allStarHostsOnly}
                onValueChange={(v) => setLocalFilters((prev) => ({ ...prev, allStarHostsOnly: v }))}
              />
            </View>
            <View className="flex-row items-center justify-between border-b border-white/5 py-3">
              <Text className="text-body-md font-semibold text-ink">Unlimited distance</Text>
              <ToggleSwitch
                value={filters.unlimitedDistance}
                onValueChange={(v) => setLocalFilters((prev) => ({ ...prev, unlimitedDistance: v }))}
              />
            </View>
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-body-md font-semibold text-ink">Wheelchair accessible</Text>
              <ToggleSwitch
                value={filters.wheelchairAccessible}
                onValueChange={(v) => setLocalFilters((prev) => ({ ...prev, wheelchairAccessible: v }))}
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-5 pb-2 pt-2">
          <PrimaryButton
            label={`Show ${resultCount} results`}
            onPress={() => {
              setFilters(filters);
              router.back();
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
