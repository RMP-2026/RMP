import { useClerk } from "@clerk/expo";
import type { Href } from "expo-router";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Can } from "@/components/Can";
import { ProfileMenuRow } from "@/components/ui/ProfileMenuRow";

export default function AdminSettingsScreen() {
  const { signOut } = useClerk();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-5">
          <Text className="mt-4 text-heading-xxl font-extrabold text-ink">Settings</Text>

          <View className="mt-4">
            <Can permission="permissions:manage">
              <ProfileMenuRow
                icon="key-outline"
                label="Roles & Permissions"
                onPress={() => router.push("/admin/roles" as Href)}
              />
            </Can>
            <Can permission="subscriptions:manage">
              <ProfileMenuRow
                icon="card-outline"
                label="Host Subscriptions"
                onPress={() => router.push("/admin/subscriptions" as Href)}
              />
            </Can>
            <Can permission="system_settings:manage">
              <ProfileMenuRow
                icon="time-outline"
                label="Audit Log"
                onPress={() => router.push("/admin/audit-log" as Href)}
              />
            </Can>
          </View>

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
