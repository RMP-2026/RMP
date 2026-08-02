import { Ionicons } from "@expo/vector-icons";
import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Href, router, useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import { useRef, useState } from "react";
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

type Step = "credentials" | "verify" | "reset" | "newPassword" | "clientTrust";

const buildNavigate =
  (path: Href, onBlocked?: () => void) =>
  ({
    session,
    decorateUrl,
  }: {
    session?: { currentTask?: unknown } | null;
    decorateUrl: (url: string) => string;
  }) => {
    if (session?.currentTask) {
      onBlocked?.();
      return;
    }
    const url = decorateUrl(path);
    if (Platform.OS === "web" && url.startsWith("http")) window.location.href = url;
    else router.replace(url as Href);
  };

export default function SignInScreen() {
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const params = useLocalSearchParams<{ step?: string; email?: string }>();

  const [step, setStep] = useState<Step>(params.step === "reset" ? "reset" : "credentials");
  const [emailAddress, setEmailAddress] = useState(params.email ?? "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(null);
  const [ssoStrategy, setSsoStrategy] = useState<"oauth_apple" | "oauth_google" | null>(null);
  const emailInputRef = useRef<TextInput>(null);

  const isBusy = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const isSsoBusy = ssoStrategy !== null;

  const onSessionBlocked = () =>
    setFormError("Your account needs additional setup that this app doesn't support yet. Please contact support.");
  // Existing users land straight on home; brand-new accounts see terms-privacy once, first.
  const navigateToHome = buildNavigate("/" as Href, onSessionBlocked);
  const navigateToTerms = buildNavigate("/terms-privacy" as Href, onSessionBlocked);

  const handleSSO = async (strategy: "oauth_apple" | "oauth_google") => {
    setFormError(null);
    setSsoStrategy(strategy);
    try {
      const {
        createdSessionId,
        setActive,
        signUp: ssoSignUp,
        authSessionResult,
      } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        const navigate = ssoSignUp?.createdSessionId ? navigateToTerms : navigateToHome;
        await setActive({ session: createdSessionId, navigate });
      } else if (authSessionResult?.type === "success") {
        setFormError(
          "We couldn't finish signing you in. If you don't already have an account, new sign-ups currently require joining our waitlist."
        );
      }
    } catch (err) {
      console.error("SSO error:", err instanceof Error ? err.message : String(err));
      setFormError("Something went wrong signing in. Please try again.");
    } finally {
      setSsoStrategy(null);
    }
  };

  // Resolves whatever signIn.status is after a first-factor attempt: finishes the
  // sign-in, kicks off the "new device" email-code check, or surfaces an error.
  const resolveSignInStatus = async () => {
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: navigateToHome });
      return;
    }
    if (signIn.status === "needs_client_trust") {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) {
        setFormError(error.longMessage ?? "Couldn't send a verification code. Please try again.");
        return;
      }
      setStep("clientTrust");
      return;
    }
    setFormError("Additional verification is required for this account.");
  };

  const handleContinue = async () => {
    setFormError(null);
    setResetSuccessMessage(null);
    setEmailFieldError(!emailAddress ? "Email address is required." : null);
    setPasswordFieldError(!password ? "Password not filled in." : null);
    if (!emailAddress || !password) return;

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

    await resolveSignInStatus();
  };

  const handleVerifyClientTrust = async (code: string) => {
    setFormError(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? "Invalid code.");
      return;
    }
    await resolveSignInStatus();
  };

  const handleVerify = async (code: string) => {
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? "Invalid code.");
      return;
    }
    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: navigateToTerms });
    } else {
      setFormError("We couldn't finish setting up your account. Please try again or contact support.");
    }
  };

  const handleVerifyResetCode = async (code: string) => {
    setFormError(null);
    const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyError) {
      setFormError(verifyError.longMessage ?? "Invalid code.");
      return;
    }
    setStep("newPassword");
  };

  const handleSubmitNewPassword = async () => {
    setFormError(null);
    if (!newPassword || !confirmPassword) {
      setFormError("Enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }
    const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (submitError) {
      setFormError(submitError.longMessage ?? "Couldn't reset your password.");
      return;
    }
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResetSuccessMessage("Your password has been reset. Please sign in with your new password.");
    setStep("credentials");
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
            {step !== "verify" && step !== "clientTrust" && step !== "reset" ? (
              <Image
                source={require("../../../assets/images/rmp-logo.png")}
                contentFit="contain"
                className="mt-6 h-14 w-14"
              />
            ) : null}

            {step === "verify" ? (
              <EmailOtpStep
                email={emailAddress}
                onVerify={handleVerify}
                onResend={async () => {
                  const { error } = await signUp.verifications.sendEmailCode();
                  if (error) setFormError(error.longMessage ?? "Couldn't resend the code. Please try again.");
                }}
                isBusy={isBusy}
                formError={formError}
              />
            ) : step === "clientTrust" ? (
              <EmailOtpStep
                email={emailAddress}
                title="Verify This Device"
                onVerify={handleVerifyClientTrust}
                onResend={async () => {
                  const { error } = await signIn.mfa.sendEmailCode();
                  if (error) setFormError(error.longMessage ?? "Couldn't resend the code. Please try again.");
                }}
                isBusy={isBusy}
                formError={formError}
              />
            ) : step === "reset" ? (
              <View>
                <EmailOtpStep
                  email={emailAddress}
                  title="Reset Your Password"
                  onVerify={handleVerifyResetCode}
                  onResend={async () => {
                    const { error } = await signIn.resetPasswordEmailCode.sendCode();
                    if (error) setFormError(error.longMessage ?? "Couldn't resend the code. Please try again.");
                  }}
                  isBusy={isBusy}
                  formError={formError}
                />

                <Pressable
                  className="mt-6 items-center"
                  onPress={() => {
                    setFormError(null);
                    setStep("credentials");
                  }}
                >
                  <Text className="text-sm font-medium text-teal">Back to sign in</Text>
                </Pressable>
              </View>
            ) : step === "newPassword" ? (
              <View className="mt-8">
                <Text className="text-heading-xxl font-extrabold text-ink">Choose a new password</Text>
                <Text className="mt-2 text-body-base text-ink-sub">
                  Enter and confirm your new password for {emailAddress}
                </Text>

                <Text className="mb-2 mt-8 text-label-xs font-semibold tracking-widest text-ink-sub">
                  NEW PASSWORD
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="••••••••"
                  placeholderTextColor="#7A8599"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setFormError(null);
                  }}
                  secureTextEntry
                  textContentType="newPassword"
                  autoFocus
                />

                <Text className="mb-2 mt-5 text-label-xs font-semibold tracking-widest text-ink-sub">
                  CONFIRM PASSWORD
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="••••••••"
                  placeholderTextColor="#7A8599"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setFormError(null);
                  }}
                  secureTextEntry
                  textContentType="newPassword"
                />

                {formError ? (
                  <Text className="mt-3 text-body-base text-danger">{formError}</Text>
                ) : null}

                <Pressable
                  className="mt-8 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
                  disabled={isBusy}
                  onPress={handleSubmitNewPassword}
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
                      <Text className="text-base font-bold text-background">Reset Password</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <Pressable
                  className="mt-6 items-center"
                  onPress={() => {
                    setFormError(null);
                    setStep("credentials");
                  }}
                >
                  <Text className="text-sm font-medium text-teal">Back to sign in</Text>
                </Pressable>
              </View>
            ) : (
              <View className="mt-8">
                <Text className="text-heading-xxl font-extrabold text-ink">Welcome Back</Text>
                <Text className="mt-1 text-body-base text-ink-sub">Sign in to your RMP account</Text>
                {resetSuccessMessage ? (
                  <Text className="mt-3 text-body-base text-success">{resetSuccessMessage}</Text>
                ) : null}

                <Text className="mb-2 mt-8 text-label-xs font-semibold tracking-widest text-ink-sub">
                  EMAIL ADDRESS
                </Text>
                <TextInput
                  ref={emailInputRef}
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
                ) : signInErrors?.fields?.identifier || signUpErrors?.fields?.emailAddress ? (
                  <Text className="mt-2 text-body-base text-danger">Enter a valid email address.</Text>
                ) : null}

                <Text className="mb-2 mt-5 text-label-xs font-semibold tracking-widest text-ink-sub">
                  PASSWORD
                </Text>
                <TextInput
                  className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                  placeholder="••••••••"
                  placeholderTextColor="#7A8599"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordFieldError(null);
                  }}
                  secureTextEntry
                  textContentType="password"
                />
                {passwordFieldError ? (
                  <Text className="mt-2 text-body-base text-danger">{passwordFieldError}</Text>
                ) : signInErrors?.fields?.password || signUpErrors?.fields?.password ? (
                  <Text className="mt-2 text-body-base text-danger">Check your password.</Text>
                ) : null}

                <Pressable
                  className="mt-3 items-end transition-transform active:scale-95 active:opacity-60"
                  disabled={isBusy}
                  onPress={() =>
                    router.push({
                      pathname: "/forgot-password" as Href,
                      params: emailAddress ? { email: emailAddress } : undefined,
                    })
                  }
                >
                  <Text className="text-sm font-medium text-teal">Forgot Password?</Text>
                </Pressable>

                {formError ? (
                  <Text className="mt-3 text-body-base text-danger">{formError}</Text>
                ) : null}

                <Pressable
                  className="mt-6 h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
                  disabled={isBusy || isSsoBusy}
                  onPress={handleContinue}
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
                      <Text className="text-base font-bold text-background">Sign In</Text>
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
                  onPress={() => router.push("/sign-up" as Href)}
                >
                  <Text className="text-sm text-ink-sub">New to RMP? </Text>
                  <Text className="text-sm font-semibold text-teal">Create Account</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
