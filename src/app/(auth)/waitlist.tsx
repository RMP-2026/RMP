import { Ionicons } from "@expo/vector-icons";
import { useWaitlist } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Href, router } from "expo-router";
import { cssInterop } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(LinearGradient, { className: "style" });
cssInterop(Image, { className: "style" });

export default function WaitlistScreen() {
  const { waitlist, errors, fetchStatus } = useWaitlist();

  const [emailAddress, setEmailAddress] = useState("");
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const isBusy = fetchStatus === "fetching";

  const handleJoin = async () => {
    setFormError(null);
    setEmailFieldError(!emailAddress.trim() ? "Email address is required." : null);
    if (!emailAddress.trim()) return;

    const { error } = await waitlist.join({ emailAddress: emailAddress.trim() });
    if (error) {
      setFormError(error.longMessage ?? "Something went wrong. Please try again.");
      return;
    }
    setJoined(true);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <Image
        source={require("../../../assets/images/auth-screen-bg.png")}
        contentFit="cover"
        className="absolute inset-0 h-full w-full"
      />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow justify-center px-6 pb-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center">
              <Image
                source={require("../../../assets/images/rmp-logo.png")}
                contentFit="contain"
                className="h-16 w-16"
              />
            </View>

            {joined ? (
              <View className="mt-10 items-center">
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-teal">
                  <Ionicons name="checkmark" size={32} color="#080C14" />
                </View>

                <Text className="mt-6 text-center text-heading-xxl font-extrabold text-ink">
                  You&apos;re on the list!
                </Text>
                <Text className="mt-2 text-center text-body-base text-ink-sub">
                  We&apos;ll email {emailAddress} the moment RMP opens its doors.
                </Text>

                <Pressable
                  className="mt-10 flex-row justify-center transition-transform active:scale-95 active:opacity-60"
                  onPress={() => router.replace("/sign-in" as Href)}
                >
                  <Text className="text-sm text-ink-sub">Already have an account? </Text>
                  <Text className="text-sm font-semibold text-teal">Sign In</Text>
                </Pressable>
              </View>
            ) : (
              <View className="mt-8">
                <Text className="text-center text-heading-xxl font-extrabold text-ink">
                  Be First to Experience a Better Way to Rent
                </Text>
                <Text className="mt-3 text-center text-body-base text-ink-sub">
                  RMP is launching soon. Join the waitlist to get early access and be notified the
                  moment we open the doors.
                </Text>

                <Text className="mb-2 mt-10 text-label-xs font-semibold tracking-widest text-ink-sub">
                  EMAIL ADDRESS
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="john@email.com"
                  placeholderTextColor="#7A8599"
                  value={emailAddress}
                  onChangeText={(text) => {
                    setEmailAddress(text);
                    setEmailFieldError(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
                {emailFieldError ? (
                  <Text className="mt-2 text-body-base text-danger">{emailFieldError}</Text>
                ) : errors?.fields?.emailAddress ? (
                  <Text className="mt-2 text-body-base text-danger">Enter a valid email address.</Text>
                ) : null}

                {formError ? (
                  <Text className="mt-3 text-body-base text-danger">{formError}</Text>
                ) : null}

                <Pressable
                  className="mt-6 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
                  disabled={isBusy}
                  onPress={handleJoin}
                >
                  <LinearGradient
                    colors={["#1AE0A8", "#00B88A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full w-full items-center justify-center"
                  >
                    {isBusy ? (
                      <ActivityIndicator color="#080C14" />
                    ) : (
                      <Text className="text-base font-bold text-background">Join the Waitlist</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <View className="mt-5 flex-row items-center justify-center gap-1.5">
                  <Ionicons name="shield-checkmark-outline" size={14} color="#7A8599" />
                  <Text className="text-caption-sm text-ink-sub">
                    No spam. Early access updates only.
                  </Text>
                </View>

                <Pressable
                  className="mt-8 flex-row justify-center transition-transform active:scale-95 active:opacity-60"
                  onPress={() => router.replace("/sign-in" as Href)}
                >
                  <Text className="text-sm text-ink-sub">Already have an account? </Text>
                  <Text className="text-sm font-semibold text-teal">Sign In</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
