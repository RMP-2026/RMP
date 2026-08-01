import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton } from "../../../components/ui/Button";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { Routes } from "../../../lib/routes";

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }[] = [
  { icon: "pricetag-outline", title: "Set your own price", subtitle: "You're always in control of your daily rate." },
  { icon: "calendar-outline", title: "Choose your availability", subtitle: "List your fleet whenever it works for you." },
  { icon: "shield-checkmark-outline", title: "Get protected", subtitle: "Every trip is backed by a protection plan." },
  { icon: "cash-outline", title: "Get paid securely", subtitle: "Payouts go straight to your linked account." },
];

export default function BecomeHostIntroScreen() {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View>
          <ScreenHeader title="Become a Host" />
          <View className="gap-6 px-5 pt-2">
            <View>
              <Text className="text-heading-xxl font-extrabold text-ink">List your car</Text>
              <Text className="mt-2 text-body-md text-ink-sub">Earn money sharing your car on RMP.</Text>
            </View>
            <View className="gap-5">
              {BENEFITS.map((b) => (
                <View key={b.title} className="flex-row items-start gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                    <Ionicons name={b.icon} size={18} color="#1AE0A8" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-body-md font-bold text-ink">{b.title}</Text>
                    <Text className="text-body-base text-ink-sub">{b.subtitle}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="gap-3 px-5 pb-2">
          <PrimaryButton label="Get started" onPress={() => router.push(Routes.becomeHostVehicle as Href)} />
          <SecondaryButton
            label="Learn more"
            onPress={() =>
              Alert.alert("Become a Host", "Rental companies and fleet operators can list vehicles on RMP as a verified company.")
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
