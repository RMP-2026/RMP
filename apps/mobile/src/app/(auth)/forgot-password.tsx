import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const params = useLocalSearchParams<{ email?: string }>();
  const [emailAddress, setEmailAddress] = useState(params.email ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendResetCode = async () => {
    setFormError(null);
    if (!emailAddress) {
      setFormError("Enter your email address.");
      return;
    }

    setIsSending(true);
    try {
      if (signIn.identifier !== emailAddress) {
        const { error: createError } = await signIn.create({ identifier: emailAddress });
        if (createError) {
          if (createError.code === "form_identifier_not_found") {
            // Don't reveal whether the email is registered — behave like a successful request.
            router.push({
              pathname: "/sign-in",
              params: { step: "reset", email: emailAddress },
            });
            return;
          }
          setFormError(createError.longMessage ?? "Something went wrong. Please try again.");
          return;
        }
      }

      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setFormError(error.longMessage ?? "Couldn't send a reset code. Please try again.");
        return;
      }

      router.push({
        pathname: "/sign-in",
        params: { step: "reset", email: emailAddress },
      });
    } finally {
      setIsSending(false);
    }
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
            contentContainerClassName="flex-grow px-6 pb-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              className="mt-4 h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-surface-high transition-transform active:scale-95 active:opacity-60"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
            </Pressable>

            <Image
              source={require("../../../assets/images/rmp-logo-mark.png")}
              contentFit="contain"
              className="mt-8 h-16 w-16"
            />

            <Text className="mt-6 text-heading-xxl font-extrabold text-ink">
              Forgot Password?
            </Text>
            <Text className="mt-2 text-body-md text-ink-sub">
              No worries! Enter your email and we&apos;ll send a reset code.
            </Text>

            <Text className="mb-2 mt-8 text-label-xs font-semibold tracking-widest text-ink-sub">
              EMAIL ADDRESS
            </Text>
            <TextInput
              className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
              placeholder="john@email.com"
              placeholderTextColor="#7A8599"
              value={emailAddress}
              onChangeText={(text) => {
                setEmailAddress(text);
                setFormError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocus
            />
            {formError ? (
              <Text className="mt-2 text-body-base text-danger">{formError}</Text>
            ) : null}

            <Pressable
              className="mt-6 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
              disabled={isSending}
              onPress={handleSendResetCode}
            >
              <LinearGradient
                colors={["#1AE0A8", "#00B88A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full w-full items-center justify-center"
              >
                {isSending ? (
                  <ActivityIndicator color="#080C14" />
                ) : (
                  <Text className="text-base font-bold text-background">Send Reset Code</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              className="mt-6 flex-row justify-center transition-transform active:scale-95 active:opacity-60"
              onPress={() => router.back()}
            >
              <Text className="text-sm text-ink-sub">Back to </Text>
              <Text className="text-sm font-semibold text-teal">Sign In</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
