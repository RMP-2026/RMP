import { Ionicons } from "@expo/vector-icons";
import { useSignUp, useSSO } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Href, router } from "expo-router";
import { cssInterop } from "nativewind";
import { useState } from "react";
import { EmailOtpStep } from "../../components/EmailOtpStep";
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

type Step = "form" | "verify";

const buildNavigateAfterAuth =
  (onBlocked: () => void) =>
  ({
    session,
    decorateUrl,
  }: {
    session?: { currentTask?: unknown } | null;
    decorateUrl: (url: string) => string;
  }) => {
    if (session?.currentTask) {
      onBlocked();
      return;
    }
    const url = decorateUrl("/terms-privacy");
    if (Platform.OS === "web" && url.startsWith("http")) window.location.href = url;
    else router.replace(url as Href);
  };

export default function SignUpScreen() {
  const { signUp, errors: signUpErrors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fullNameFieldError, setFullNameFieldError] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [phoneFieldError, setPhoneFieldError] = useState<string | null>(null);
  const [ssoStrategy, setSsoStrategy] = useState<"oauth_apple" | "oauth_google" | null>(null);

  const isBusy = fetchStatus === "fetching";
  const isSsoBusy = ssoStrategy !== null;

  const navigateAfterAuth = buildNavigateAfterAuth(() =>
    setFormError("Your account needs additional setup that this app doesn't support yet. Please contact support.")
  );

  const handleSSO = async (strategy: "oauth_apple" | "oauth_google") => {
    setFormError(null);
    setSsoStrategy(strategy);
    try {
      const { createdSessionId, setActive, authSessionResult } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId, navigate: navigateAfterAuth });
      } else if (authSessionResult?.type === "success") {
        setFormError(
          "We couldn't finish creating your account. New sign-ups currently require joining our waitlist."
        );
      }
    } catch (err) {
      console.error("SSO error:", err instanceof Error ? err.message : String(err));
      setFormError("Something went wrong signing in. Please try again.");
    } finally {
      setSsoStrategy(null);
    }
  };

  const handleCreateAccount = async () => {
    setFormError(null);

    setFullNameFieldError(!fullName.trim() ? "Full name is required." : null);
    setEmailFieldError(!emailAddress.trim() ? "Email address is required." : null);
    setPhoneFieldError(!phoneNumber.trim() ? "Phone number is required." : null);
    if (!fullName.trim() || !emailAddress.trim() || !phoneNumber.trim()) return;

    if (password !== confirmPassword) {
      setFormError("Passwords don't match each other.");
      return;
    }

    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(" ");

    const { error } = await signUp.password({
      emailAddress,
      password,
      phoneNumber: phoneNumber || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    if (error) {
      setFormError(error.longMessage ?? "Something went wrong.");
      return;
    }

    const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
    if (sendCodeError) {
      setFormError(sendCodeError.longMessage ?? "Couldn't send a verification code. Please try again.");
      return;
    }
    setStep("verify");
  };

  const handleVerify = async (code: string) => {
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? "Invalid code.");
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: navigateAfterAuth });
    } else {
      setFormError("We couldn't finish setting up your account. Please try again or contact support.");
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
            {step === "verify" ? (
              <EmailOtpStep
                email={emailAddress}
                onVerify={handleVerify}
                onResend={() => signUp.verifications.sendEmailCode()}
                isBusy={isBusy}
                formError={formError}
              />
            ) : (
              <View className="mt-10">
                <Text className="text-heading-xxl font-extrabold text-ink">Create Account</Text>
                <Text className="mt-1 text-body-base text-ink-sub">
                  Start renting premium vehicles today
                </Text>

                <Text className="mb-2 mt-8 text-label-xs font-semibold tracking-widest text-ink-sub">
                  FULL NAME
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="Enter full name"
                  placeholderTextColor="#7A8599"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setFullNameFieldError(null);
                  }}
                  autoCapitalize="words"
                  textContentType="name"
                />
                {fullNameFieldError ? (
                  <Text className="mt-2 text-body-base text-danger">{fullNameFieldError}</Text>
                ) : null}

                <Text className="mb-2 mt-5 text-label-xs font-semibold tracking-widest text-ink-sub">
                  EMAIL ADDRESS
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="Enter email address"
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
                ) : signUpErrors?.fields?.emailAddress ? (
                  <Text className="mt-2 text-body-base text-danger">Enter a valid email address.</Text>
                ) : null}

                <Text className="mb-2 mt-5 text-label-xs font-semibold tracking-widest text-ink-sub">
                  PHONE NUMBER
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="Enter phone number"
                  placeholderTextColor="#7A8599"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    setPhoneFieldError(null);
                  }}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                />
                {phoneFieldError ? (
                  <Text className="mt-2 text-body-base text-danger">{phoneFieldError}</Text>
                ) : null}

                <Text className="mb-2 mt-5 text-label-xs font-semibold tracking-widest text-ink-sub">
                  PASSWORD
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    className="h-14 rounded-2xl border border-white/10 bg-surface px-4 pr-12 text-body-md text-ink"
                    placeholder="Enter password"
                    placeholderTextColor="#7A8599"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    textContentType="newPassword"
                  />
                  <Pressable
                    className="absolute right-4"
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#7A8599"
                    />
                  </Pressable>
                </View>
                {signUpErrors?.fields?.password ? (
                  <Text className="mt-2 text-body-base text-danger">Check your password.</Text>
                ) : null}

                <Text className="mb-2 mt-5 text-label-xs font-semibold tracking-widest text-ink-sub">
                  CONFIRM PASSWORD
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    className="h-14 rounded-2xl border border-white/10 bg-surface px-4 pr-12 text-body-md text-ink"
                    placeholder="Re-enter password"
                    placeholderTextColor="#7A8599"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    textContentType="newPassword"
                  />
                  <Pressable
                    className="absolute right-4"
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#7A8599"
                    />
                  </Pressable>
                </View>

                {formError ? (
                  <Text className="mt-3 text-body-base text-danger">{formError}</Text>
                ) : null}

                <Pressable
                  className="mt-6 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
                  disabled={isBusy || isSsoBusy}
                  onPress={handleCreateAccount}
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
                      <Text className="text-base font-bold text-background">Create Account</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <View className="mt-6 flex-row items-center">
                  <View className="h-px flex-1 bg-white/10" />
                  <Text className="mx-3 text-caption-sm font-medium tracking-widest text-ink-sub">
                    OR
                  </Text>
                  <View className="h-px flex-1 bg-white/10" />
                </View>

                <View className="mt-6 flex-row gap-3">
                  <Pressable
                    className="h-14 flex-1 items-center justify-center rounded-full border border-white/10 bg-surface-high"
                    disabled={isBusy || isSsoBusy}
                    onPress={() => handleSSO("oauth_apple")}
                  >
                    {ssoStrategy === "oauth_apple" ? (
                      <ActivityIndicator color="#F0F4FF" />
                    ) : (
                      <Ionicons name="logo-apple" size={22} color="#F0F4FF" />
                    )}
                  </Pressable>

                  <Pressable
                    className="h-14 flex-1 items-center justify-center rounded-full border border-white/10 bg-surface-high"
                    disabled={isBusy || isSsoBusy}
                    onPress={() => handleSSO("oauth_google")}
                  >
                    {ssoStrategy === "oauth_google" ? (
                      <ActivityIndicator color="#F0F4FF" />
                    ) : (
                      <Ionicons name="logo-google" size={22} color="#F0F4FF" />
                    )}
                  </Pressable>
                </View>

                {/* Required mount point for Clerk's bot protection on sign-up */}
                <View nativeID="clerk-captcha" />

                <Pressable
                  className="mt-8 flex-row justify-center transition-transform active:scale-95 active:opacity-60"
                  onPress={() => router.replace("/sign-in" as Href)}
                >
                  <Text className="text-sm text-ink-sub">Already have an account? </Text>
                  <Text className="text-sm font-semibold text-teal">Sign In</Text>
                </Pressable>

                <Pressable
                  className="mt-3 flex-row justify-center transition-transform active:scale-95 active:opacity-60"
                  onPress={() => router.push("/waitlist" as Href)}
                >
                  <Text className="text-sm text-ink-sub">Sign-ups are limited. </Text>
                  <Text className="text-sm font-semibold text-teal">Join the Waitlist</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
