import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(LinearGradient, { className: "style" });

const SECTIONS = [
  {
    title: "1. Acceptance",
    body: "By using RMP, you agree to these terms. Rental companies are independent operators.",
  },
  {
    title: "2. Booking Policy",
    body: "All bookings are subject to company approval. Cancellation policies vary by company.",
  },
  {
    title: "3. Insurance",
    body: "Each company provides their own insurance coverage for listed vehicles.",
  },
  {
    title: "4. Privacy",
    body: "We collect minimal data necessary to operate the platform, never sold to third parties.",
  },
  {
    title: "5. Disputes",
    body: "Any disputes are resolved through binding arbitration in accordance with applicable law.",
  },
];

export default function TermsPrivacyScreen() {
  const handleAgree = () => {
    router.replace("/splash");
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 px-6">
          <Text className="mt-4 text-heading-xxl font-extrabold text-ink">Terms &amp; Privacy</Text>
          <Text className="mt-1 text-body-base text-ink-sub">Last updated January 2025</Text>

          <ScrollView
            className="mt-6 flex-1"
            contentContainerClassName="gap-3 pb-2"
            showsVerticalScrollIndicator={false}
          >
            {SECTIONS.map((section) => (
              <View
                key={section.title}
                className="rounded-2xl border border-white/10 bg-surface p-4"
              >
                <Text className="text-body-md font-bold text-teal">{section.title}</Text>
                <Text className="mt-1 text-body-base text-ink-sub">{section.body}</Text>
              </View>
            ))}
          </ScrollView>

          <Pressable
            className="mt-4 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
            onPress={handleAgree}
          >
            <LinearGradient
              colors={["#1AE0A8", "#00B88A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full w-full items-center justify-center"
            >
              <Text className="text-base font-bold text-background">I Agree &amp; Continue</Text>
            </LinearGradient>
          </Pressable>

          <Text className="mb-2 mt-4 text-center text-caption-sm text-ink-sub">
            Terms &amp; Privacy
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
