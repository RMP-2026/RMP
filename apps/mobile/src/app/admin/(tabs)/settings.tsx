import { useClerk } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminSettingsScreen() {
  const { signOut } = useClerk();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-5">
          <Text className="mt-4 text-heading-xxl font-extrabold text-ink">Settings</Text>

          <Pressable
            className="mt-8 h-14 items-center justify-center rounded-full border border-white/10 bg-surface-high"
            onPress={() => signOut()}
          >
            <Text className="text-body-md font-bold text-ink">Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
