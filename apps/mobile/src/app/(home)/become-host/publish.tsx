import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton } from "../../../components/ui/Button";
import { ProgressIndicator } from "../../../components/ui/ProgressIndicator";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { isValidDailyPrice, useHostOnboarding } from "../../../lib/host-onboarding-context";
import { MOCK_COMPANY } from "../../../lib/mock-data";
import { VEHICLE_PHOTOS } from "../../../lib/placeholder-images";
import { Routes } from "../../../lib/routes";
import { useApplyForHost } from "../../../lib/roles";

export default function HostPublishScreen() {
  const { make, model, year, dailyPrice, homeAddress, reset } = useHostOnboarding();
  const applyForHost = useApplyForHost();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const missing = [
    !make || !model || !year ? "Vehicle details" : null,
    !homeAddress ? "Home location" : null,
    !isValidDailyPrice(dailyPrice) ? "Pricing" : null,
  ].filter(Boolean);

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError(null);
    try {
      // Publishing your first listing grants the "host" role, which unlocks host-only screens
      // (fleet management, host dashboard) alongside the guest experience you already have.
      await applyForHost();
      setPublished(true);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Couldn't publish your listing. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    // TODO: the RAV4 photo, "rav4" vehicle route, and MOCK_COMPANY id below are placeholders
    // until the create-listing API exists; replace with the created listing's own data then.
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
          <View className="items-center gap-3 px-8 pt-10">
            <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-success">
              <Ionicons name="checkmark" size={40} color="#22C55E" />
            </View>
            <Text className="text-heading-xxl font-extrabold text-ink">Your listing is live!</Text>
            <Text className="text-center text-body-base text-ink-sub">Guests can now book your car.</Text>
          </View>

          <View className="gap-3 px-5 pb-2">
            <View className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface p-3">
              <Image source={{ uri: VEHICLE_PHOTOS.rav4[0] }} contentFit="cover" className="h-14 w-14 rounded-xl" />
              <View className="flex-1">
                <Text className="text-body-md font-bold text-ink">
                  {year} {make} {model}
                </Text>
                <Text className="text-body-base text-ink-sub">${dailyPrice}/day</Text>
              </View>
            </View>
            <PrimaryButton
              label="View my listing"
              onPress={() => {
                reset();
                router.push(Routes.vehicle("rav4") as Href);
              }}
            />
            <SecondaryButton
              label="Go to vehicles"
              onPress={() => {
                reset();
                router.push(Routes.companyFleet(MOCK_COMPANY.id) as Href);
              }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View>
          <ScreenHeader title="" />
          <ProgressIndicator step={5} total={5} />
          <View className="gap-5 px-5 pt-4">
            <Text className="text-heading-xxl font-extrabold text-ink">You&apos;re almost ready!</Text>

            <View className="gap-2 rounded-2xl border border-white/10 bg-surface p-4">
              <SummaryRow label="Vehicle" value={make && model && year ? `${year} ${make} ${model}` : "Incomplete"} />
              <SummaryRow label="Location" value={homeAddress || "Incomplete"} />
              <SummaryRow label="Price" value={isValidDailyPrice(dailyPrice) ? `$${dailyPrice}/day` : "Incomplete"} />
            </View>

            {missing.length > 0 ? (
              <View className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
                <Text className="text-body-md font-bold text-warning">Missing information</Text>
                <Text className="mt-1 text-body-base text-warning">{missing.join(", ")}</Text>
              </View>
            ) : null}

            {publishError ? (
              <View className="rounded-2xl border border-danger/40 bg-danger/10 p-4">
                <Text className="text-body-base text-danger">{publishError}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="px-5 pb-2">
          <PrimaryButton label="Publish listing" loading={publishing} disabled={missing.length > 0} onPress={handlePublish} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-body-base text-ink-sub">{label}</Text>
      <Text className="text-body-md font-semibold text-ink">{value}</Text>
    </View>
  );
}
