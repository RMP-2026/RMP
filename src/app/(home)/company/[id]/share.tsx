import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Share as RNShare, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton } from "../../../../components/ui/Button";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { MOCK_COMPANY } from "../../../../lib/mock-data";

export default function CompanyShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const company = id === MOCK_COMPANY.id ? MOCK_COMPANY : null;
  const [copied, setCopied] = useState(false);

  if (!company) return null;

  const profileUrl = `rmp.app/company/${company.id}`;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScreenHeader title={`Share ${company.name}`} />
        <View className="flex-1 items-center gap-6 px-8 pt-4">
          <View className="h-56 w-56 items-center justify-center rounded-3xl border border-white/10 bg-white">
            <Ionicons name="qr-code" size={180} color="#080C14" />
          </View>
          <Text className="text-center text-body-base text-ink-sub">{profileUrl}</Text>
          <Text className="text-center text-body-base text-ink-sub">
            Anyone with this link can view {company.name}&apos;s public profile and cars.
          </Text>

          <View className="w-full gap-3">
            <PrimaryButton label="Share" onPress={() => RNShare.share({ message: `https://${profileUrl}` })} />
            <SecondaryButton label="Download" onPress={() => {}} />
            <Pressable
              onPress={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="items-center py-2 active:opacity-70"
            >
              <Text className="text-body-base font-semibold text-teal">{copied ? "Link copied!" : "Copy link"}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
