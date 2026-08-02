import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../components/ui/Button";
import { ProgressIndicator } from "../../../components/ui/ProgressIndicator";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { ToggleSwitch } from "../../../components/ui/ToggleSwitch";
import { useHostOnboarding } from "../../../lib/host-onboarding-context";
import { Routes } from "../../../lib/routes";

export default function HostLocationScreen() {
  const { homeAddress, airportDelivery, customDelivery, update } = useHostOnboarding();
  const [editing, setEditing] = useState(homeAddress.length === 0);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View>
          <ScreenHeader title="" />
          <ProgressIndicator step={3} total={5} />
          <View className="gap-6 px-5 pt-4">
            <Text className="text-heading-xxl font-extrabold text-ink">Where is your car usually parked?</Text>

            <View>
              <Text className="mb-2 text-label-xs font-semibold tracking-widest text-ink-sub">HOME LOCATION</Text>
              {editing ? (
                <TextInput
                  autoFocus
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="1234 NW 7th Ave, Miami, FL 33127"
                  placeholderTextColor="#7A8599"
                  value={homeAddress}
                  onChangeText={(v) => update({ homeAddress: v })}
                  onSubmitEditing={() => setEditing(false)}
                />
              ) : (
                <Pressable
                  onPress={() => setEditing(true)}
                  className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-surface p-4 active:opacity-90"
                >
                  <Text className="flex-1 text-body-md font-semibold text-ink">{homeAddress}</Text>
                  <Ionicons name="pencil" size={16} color="#7A8599" />
                </Pressable>
              )}
            </View>

            <View className="flex-row items-center justify-between border-b border-white/5 py-3">
              <Text className="text-body-md font-semibold text-ink">Airport delivery</Text>
              <ToggleSwitch value={airportDelivery} onValueChange={(v) => update({ airportDelivery: v })} />
            </View>
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-body-md font-semibold text-ink">Custom delivery</Text>
              <ToggleSwitch value={customDelivery} onValueChange={(v) => update({ customDelivery: v })} />
            </View>
          </View>
        </View>

        <View className="px-5 pb-2">
          <PrimaryButton
            label="Continue"
            disabled={homeAddress.trim().length === 0}
            onPress={() => router.push(Routes.becomeHostPricing as Href)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
