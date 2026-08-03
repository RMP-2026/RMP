import { Href, router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../components/ui/Button";
import { ProgressIndicator } from "../../../components/ui/ProgressIndicator";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { SelectField } from "../../../components/ui/SelectField";
import { useHostOnboarding } from "../../../lib/host-onboarding-context";
import { Routes } from "../../../lib/routes";

const MAKES = ["Toyota", "Tesla", "Ford", "Jeep", "Honda", "Chevrolet"];
const MODELS: Record<string, string[]> = {
  Toyota: ["RAV4", "Camry", "Corolla"],
  Tesla: ["Model 3", "Model Y"],
  Ford: ["Bronco", "F-150", "Mustang"],
  Jeep: ["Wrangler", "Grand Cherokee"],
  Honda: ["Civic", "CR-V"],
  Chevrolet: ["Tahoe", "Malibu"],
};
const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021"];

export default function HostVehicleDetailsScreen() {
  const { make, model, year, update } = useHostOnboarding();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View>
          <ScreenHeader title="" />
          <ProgressIndicator step={1} total={5} />
          <View className="px-5 pt-4">
            <Text className="text-heading-xxl font-extrabold text-ink">Tell us about your vehicle</Text>
            <View className="mt-4">
              <SelectField
                label="Make"
                value={make}
                options={MAKES}
                onChange={(v) => update({ make: v, model: null })}
              />
              <SelectField
                label="Model"
                value={model}
                placeholder={make ? "Select a model" : "Choose a make first"}
                options={make ? MODELS[make] ?? [] : []}
                onChange={(v) => update({ model: v })}
              />
              <SelectField label="Year" value={year} options={YEARS} onChange={(v) => update({ year: v })} />
            </View>
          </View>
        </View>

        <View className="px-5 pb-2">
          <PrimaryButton
            label="Continue"
            disabled={!make || !model || !year}
            onPress={() => router.push(Routes.becomeHostPhotos as Href)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
