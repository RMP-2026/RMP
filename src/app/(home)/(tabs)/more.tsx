import { useClerk, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppModal } from "../../../components/ui/BottomSheet";
import { DestructiveButton, GhostButton } from "../../../components/ui/Button";
import { ProfileMenuRow } from "../../../components/ui/ProfileMenuRow";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { GUEST_AVATAR } from "../../../lib/placeholder-images";
import { Routes } from "../../../lib/routes";
import { useAppRole } from "../../../lib/roles";

export default function MoreScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const role = useAppRole();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const placeholder = (title: string) => () =>
    Alert.alert(title, "This section isn't connected to a backend yet.");

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setLoggingOut(false);
      setLogoutConfirmVisible(false);
      router.replace("/sign-in" as Href);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
          <View className="mt-3 flex-row items-center gap-4 py-3">
            <Image source={{ uri: user?.imageUrl ?? GUEST_AVATAR }} contentFit="cover" className="h-16 w-16 rounded-full" />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-heading-lg font-bold text-ink">{user?.firstName ?? "Guest"}</Text>
                {role !== "user" ? (
                  <StatusBadge label={role === "admin" ? "Admin" : "Host"} tone={role === "admin" ? "pending" : "verified"} />
                ) : null}
              </View>
              <Text className="text-body-base font-semibold text-teal" onPress={placeholder("View profile")}>
                View profile
              </Text>
            </View>
          </View>

          <View className="mt-2">
            <ProfileMenuRow icon="person-outline" label="Account info" onPress={placeholder("Account info")} />
            <ProfileMenuRow icon="card-outline" label="Payment methods" onPress={placeholder("Payment methods")} />
            <ProfileMenuRow icon="wallet-outline" label="Travel credit" value="$60.00" onPress={placeholder("Travel credit")} />
            <ProfileMenuRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push("/notifications" as Href)}
            />
            <ProfileMenuRow icon="pricetag-outline" label="Promotions" onPress={placeholder("Promotions")} />
            <ProfileMenuRow icon="help-circle-outline" label="Help Center" onPress={placeholder("Help Center")} />
            <ProfileMenuRow icon="language-outline" label="Language" value="English" onPress={placeholder("Language")} />
            <ProfileMenuRow icon="shield-checkmark-outline" label="Privacy settings" onPress={placeholder("Privacy settings")} />
            <ProfileMenuRow
              icon="document-text-outline"
              label="Terms and policies"
              onPress={() => router.push("/terms-privacy" as Href)}
            />
          </View>

          <Text className="mb-2 mt-6 text-label-xs font-semibold tracking-widest text-ink-sub">HOSTING</Text>
          <View>
            {role === "user" ? (
              <ProfileMenuRow
                icon="business-outline"
                label="Become a host"
                onPress={() => router.push(Routes.becomeHost as Href)}
              />
            ) : (
              <>
                <ProfileMenuRow
                  icon="storefront-outline"
                  label="View public profile"
                  onPress={() => router.push(Routes.company("company-1") as Href)}
                />
                <ProfileMenuRow
                  icon="car-outline"
                  label="Manage vehicles"
                  onPress={() => router.push(Routes.companyFleet("company-1") as Href)}
                />
              </>
            )}
          </View>

          {__DEV__ ? (
            <>
              <Text className="mb-2 mt-6 text-label-xs font-semibold tracking-widest text-ink-sub">DEVELOPER</Text>
              <ProfileMenuRow
                icon="color-palette-outline"
                label="Component library"
                onPress={() => router.push(Routes.componentLibrary as Href)}
              />
            </>
          ) : null}

          <View className="mt-6">
            <ProfileMenuRow icon="log-out-outline" label="Log out" onPress={() => setLogoutConfirmVisible(true)} />
            <ProfileMenuRow
              icon="trash-outline"
              label="Close account"
              destructive
              onPress={() =>
                Alert.alert("Close account", "Contact support to permanently close your RMP account.")
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <AppModal visible={logoutConfirmVisible} onClose={() => setLogoutConfirmVisible(false)}>
        <Text className="text-heading-lg font-bold text-ink">Log out?</Text>
        <Text className="mt-2 text-body-base text-ink-sub">You&apos;ll need to sign in again to access your account.</Text>
        <View className="mt-5 flex-row gap-3">
          <GhostButton label="Cancel" fullWidth className="flex-1" onPress={() => setLogoutConfirmVisible(false)} />
          <DestructiveButton label="Log out" fullWidth className="flex-1" loading={loggingOut} onPress={handleLogout} />
        </View>
      </AppModal>
    </View>
  );
}
