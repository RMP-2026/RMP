import { Href, router } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../components/ui/Button";
import { ProgressIndicator } from "../../../components/ui/ProgressIndicator";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { SelectField } from "../../../components/ui/SelectField";
import { isValidDailyPrice, useHostOnboarding } from "../../../lib/host-onboarding-context";
import { Routes } from "../../../lib/routes";

const DISCOUNTS = ["0%", "10%", "15%", "20%"];
const MIN_TRIPS = ["1 day", "2 days", "3 days", "1 week"];

export default function HostPricingScreen() {
  const { dailyPrice, weeklyDiscount, minimumTrip, update } = useHostOnboarding();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View>
          <ScreenHeader title="" />
          <ProgressIndicator step={4} total={5} />
          <View className="gap-6 px-5 pt-4">
            <Text className="text-heading-xxl font-extrabold text-ink">Set your price and availability</Text>

            <View>
              <Text className="mb-2 text-label-xs font-semibold tracking-widest text-ink-sub">DAILY PRICE</Text>
              <View className="h-14 flex-row items-center rounded-2xl border border-white/10 bg-surface px-4">
                <Text className="text-body-md font-bold text-ink">$</Text>
                <TextInput
                  className="ml-1 flex-1 text-body-md text-ink"
                  keyboardType="number-pad"
                  value={dailyPrice}
                  onChangeText={(v) => update({ dailyPrice: v.replace(/[^0-9]/g, "") })}
                />
                <Text className="text-body-base text-ink-sub">/day</Text>
              </View>
            </View>

            <View>
              <Text className="mb-2 text-label-xs font-semibold tracking-widest text-ink-sub">DISCOUNTS</Text>
              <SelectField
                label="Weekly (7+)"
                value={weeklyDiscount}
                options={DISCOUNTS}
                onChange={(v) => update({ weeklyDiscount: v ?? "0%" })}
              />
            </View>

            <SelectField
              label="Minimum trip"
              value={minimumTrip}
              options={MIN_TRIPS}
              onChange={(v) => update({ minimumTrip: v ?? "1 day" })}
            />
          </View>
        </View>

        <View className="px-5 pb-2">
          <PrimaryButton
            label="Continue"
            disabled={!isValidDailyPrice(dailyPrice)}
            onPress={() => router.push(Routes.becomeHostPublish as Href)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
