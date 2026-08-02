import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

type PlanRow = {
  slug: string;
  name: string;
  description: string | null;
  feeCents: number;
  currency: string;
  features: { slug: string; name: string }[];
};

function formatFee(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export default function AdminSubscriptionsScreen() {
  const { getToken } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Not signed in");
        const apiOrigin = process.env.EXPO_PUBLIC_API_URL ?? "";
        const response = await fetch(`${apiOrigin}/api/admin/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Couldn't load subscription plans (${response.status})`);
        const data = await response.json();
        setPlans(data.plans);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load subscription plans.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]}>
        <ScreenHeader title="Host Subscriptions" />
      </SafeAreaView>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1AE0A8" />
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
          <Text className="mb-4 text-body-base text-ink-sub">
            Plans and features live in Clerk Billing, not this app — this is a read-only view. Edit them in the
            Clerk Dashboard.
          </Text>
          {error ? <Text className="mb-4 text-body-base text-danger">{error}</Text> : null}
          <View className="gap-3">
            {plans.map((plan) => (
              <View key={plan.slug} className="rounded-2xl border border-white/5 bg-surface-high p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-body-md font-bold text-ink">{plan.name}</Text>
                  <Text className="text-body-md font-bold text-teal">{formatFee(plan.feeCents, plan.currency)}/mo</Text>
                </View>
                {plan.description ? <Text className="mt-1 text-body-base text-ink-sub">{plan.description}</Text> : null}
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {plan.features.map((feature) => (
                    <View key={feature.slug} className="rounded-full border border-white/10 bg-surface px-3 py-1.5">
                      <Text className="text-caption-sm text-ink-sub">{feature.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <Pressable
            className="mt-6 h-14 items-center justify-center rounded-full border border-white/10 bg-surface-high"
            onPress={() => Linking.openURL("https://dashboard.clerk.com/last-active?path=billing/plans")}
          >
            <Text className="text-body-md font-bold text-ink">Manage in Clerk Dashboard</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
