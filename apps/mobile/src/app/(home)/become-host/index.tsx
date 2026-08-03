import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton } from "../../../components/ui/Button";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { Routes } from "../../../lib/routes";
import { useTrpc } from "../../../lib/trpc";

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }[] = [
  { icon: "pricetag-outline", title: "Set your own price", subtitle: "You're always in control of your daily rate." },
  { icon: "calendar-outline", title: "Choose your availability", subtitle: "List your fleet whenever it works for you." },
  { icon: "shield-checkmark-outline", title: "Get protected", subtitle: "Every trip is backed by a protection plan." },
  { icon: "cash-outline", title: "Get paid securely", subtitle: "Payouts go straight to your linked account." },
];

type CompanyStatus = "none" | "pending" | "rejected" | "active" | "paused";

export default function BecomeHostIntroScreen() {
  const trpc = useTrpc();
  const [status, setStatus] = useState<CompanyStatus>("none");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    trpc.company.mine
      .query()
      .then((mine) => {
        if (cancelled) return;
        if (mine.length === 0) {
          setStatus("none");
        } else {
          // A user can belong to multiple companies eventually; for now surface the
          // most relevant single status (any active company wins over a pending one).
          const active = mine.find((m) => m.company.status === "active" || m.company.status === "paused");
          setStatus((active ?? mine[0]).company.status as CompanyStatus);
        }
      })
      .catch(() => setStatus("none"))
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [trpc]);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1AE0A8" />
      </View>
    );
  }

  if (status === "active" || status === "paused") {
    router.replace(Routes.becomeHostVehicle as Href);
    return null;
  }

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

            {status === "pending" ? (
              <View className="rounded-2xl border border-white/10 bg-surface-high p-4">
                <Text className="text-body-md font-bold text-ink">Application under review</Text>
                <Text className="mt-1 text-body-base text-ink-sub">
                  We&apos;re reviewing your business details and documents. We&apos;ll notify you once your account is approved.
                </Text>
              </View>
            ) : status === "rejected" ? (
              <View className="rounded-2xl border border-danger/30 bg-danger/10 p-4">
                <Text className="text-body-md font-bold text-ink">Application not approved</Text>
                <Text className="mt-1 text-body-base text-ink-sub">Contact support for details, or submit a new application.</Text>
              </View>
            ) : (
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
            )}
          </View>
        </View>

        {status === "none" || status === "rejected" ? (
          <View className="gap-3 px-5 pb-2">
            <PrimaryButton label="Get started" onPress={() => router.push(Routes.becomeHostApply as Href)} />
            <SecondaryButton
              label="Learn more"
              onPress={() =>
                Alert.alert("Become a Host", "Rental companies and fleet operators can list vehicles on RMP as a verified company.")
              }
            />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
