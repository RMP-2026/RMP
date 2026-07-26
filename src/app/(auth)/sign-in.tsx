import { Ionicons } from "@expo/vector-icons";
import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
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

type Step = "credentials" | "verify";

const navigateAfterAuth = ({
  session,
  decorateUrl,
}: {
  session?: { currentTask?: unknown } | null;
  decorateUrl: (url: string) => string;
}) => {
  if (session?.currentTask) return;
  const url = decorateUrl("/");
  if (url.startsWith("http")) window.location.href = url;
  else router.replace(url as Href);
};

export default function SignInScreen() {
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [step, setStep] = useState<Step>("credentials");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [ssoStrategy, setSsoStrategy] = useState<"oauth_apple" | "oauth_google" | null>(null);

  const isBusy = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const isSsoBusy = ssoStrategy !== null;

  const handleSSO = async (strategy: "oauth_apple" | "oauth_google") => {
    setFormError(null);
    setSsoStrategy(strategy);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      console.error("SSO error:", JSON.stringify(err, null, 2));
      setFormError("Something went wrong signing in. Please try again.");
    } finally {
      setSsoStrategy(null);
    }
  };

  const handleContinue = async () => {
    setFormError(null);

    const { error } = await signIn.password({ emailAddress, password });

    if (error) {
      if (error.code === "form_identifier_not_found") {
        const { error: signUpError } = await signUp.password({ emailAddress, password });
        if (signUpError) {
          setFormError(signUpError.longMessage ?? "Something went wrong.");
          return;
        }
        await signUp.verifications.sendEmailCode();
        setStep("verify");
        return;
      }
      setFormError(error.longMessage ?? "Something went wrong.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: navigateAfterAuth });
    } else {
      setFormError("Additional verification is required for this account.");
    }
  };

  const handleVerify = async () => {
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? "Invalid code.");
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: navigateAfterAuth });
    }
  };

  return (
    <View className="flex-1 bg-[#05070A]">
      <StatusBar style="light" />
      <Image
        source={require("../../../assets/images/auth-bg.png")}
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
            <Image
              source={require("../../../assets/images/rmp-logo.png")}
              contentFit="contain"
              className="mt-6 h-14 w-14"
            />

            {step === "verify" ? (
              <View className="mt-8">
                <Text className="text-[28px] font-bold text-white">Check your email</Text>
                <Text className="mt-2 text-sm text-slate-400">
                  Enter the verification code we sent to {emailAddress}
                </Text>

                <Text className="mb-2 mt-8 text-[11px] font-semibold tracking-widest text-slate-400">
                  VERIFICATION CODE
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-[#0E1420] px-4 text-base text-white"
                  placeholder="123456"
                  placeholderTextColor="#5B6472"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoFocus
                />

                {formError ? (
                  <Text className="mt-3 text-sm text-red-400">{formError}</Text>
                ) : null}

                <Pressable
                  className="mt-8 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-emerald-500/40"
                  disabled={isBusy}
                  onPress={handleVerify}
                >
                  <LinearGradient
                    colors={["#1FDCA6", "#0EB588"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full w-full items-center justify-center"
                  >
                    {isBusy ? (
                      <ActivityIndicator color="#05070A" />
                    ) : (
                      <Text className="text-base font-bold text-[#05070A]">Verify</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <Pressable
                  className="mt-6 items-center"
                  onPress={() => signUp.verifications.sendEmailCode()}
                >
                  <Text className="text-sm font-medium text-[#19D59D]">Resend code</Text>
                </Pressable>
              </View>
            ) : (
              <View className="mt-8">
                <Text className="text-[28px] font-bold text-white">Welcome Back</Text>
                <Text className="mt-1 text-sm text-slate-400">Sign in to your RMP account</Text>

                <Text className="mb-2 mt-8 text-[11px] font-semibold tracking-widest text-slate-400">
                  EMAIL ADDRESS
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-[#0E1420] px-4 text-base text-white"
                  placeholder="john@email.com"
                  placeholderTextColor="#5B6472"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
                {signInErrors?.fields?.identifier || signUpErrors?.fields?.emailAddress ? (
                  <Text className="mt-2 text-sm text-red-400">Enter a valid email address.</Text>
                ) : null}

                <Text className="mb-2 mt-5 text-[11px] font-semibold tracking-widest text-slate-400">
                  PASSWORD
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-[#0E1420] px-4 text-base text-white"
                  placeholder="••••••••"
                  placeholderTextColor="#5B6472"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="password"
                />
                {signInErrors?.fields?.password || signUpErrors?.fields?.password ? (
                  <Text className="mt-2 text-sm text-red-400">Check your password.</Text>
                ) : null}

                <Pressable className="mt-3 items-end">
                  <Text className="text-sm font-medium text-[#19D59D]">Forgot Password?</Text>
                </Pressable>

                {formError ? (
                  <Text className="mt-3 text-sm text-red-400">{formError}</Text>
                ) : null}

                <Pressable
                  className="mt-6 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-emerald-500/40"
                  disabled={isBusy}
                  onPress={handleContinue}
                >
                  <LinearGradient
                    colors={["#1FDCA6", "#0EB588"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full w-full items-center justify-center"
                  >
                    {isBusy ? (
                      <ActivityIndicator color="#05070A" />
                    ) : (
                      <Text className="text-base font-bold text-[#05070A]">Sign In</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <View className="mt-6 flex-row items-center">
                  <View className="h-px flex-1 bg-white/10" />
                  <Text className="mx-3 text-xs font-medium tracking-widest text-slate-500">
                    OR
                  </Text>
                  <View className="h-px flex-1 bg-white/10" />
                </View>

                <Pressable
                  className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-full border border-white/10 bg-[#12161D]"
                  disabled={isBusy || isSsoBusy}
                  onPress={() => handleSSO("oauth_apple")}
                >
                  {ssoStrategy === "oauth_apple" ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                      <Text className="text-base font-semibold text-white">
                        Continue with Apple
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  className="mt-3 h-14 flex-row items-center justify-center gap-2 rounded-full border border-white/10 bg-[#12161D]"
                  disabled={isBusy || isSsoBusy}
                  onPress={() => handleSSO("oauth_google")}
                >
                  {ssoStrategy === "oauth_google" ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                      <Text className="text-base font-semibold text-white">
                        Continue with Google
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* Required mount point for Clerk's bot protection on sign-up */}
                <View nativeID="clerk-captcha" />

                <View className="mt-8 flex-row justify-center">
                  <Text className="text-sm text-slate-400">New to RMP? </Text>
                  <Text className="text-sm font-semibold text-[#19D59D]">Create Account</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
