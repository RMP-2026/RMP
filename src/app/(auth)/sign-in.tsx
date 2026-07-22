import { useSignIn, useSignUp } from "@clerk/expo";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";

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

  const [step, setStep] = useState<Step>("credentials");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isBusy = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";

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

  if (step === "verify") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          Enter the verification code we sent to {emailAddress}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoFocus
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <Pressable style={styles.button} disabled={isBusy} onPress={handleVerify}>
          {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
        </Pressable>
        <Pressable onPress={() => signUp.verifications.sendEmailCode()}>
          <Text style={styles.link}>Resend code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in or create an account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      {signInErrors?.fields?.identifier || signUpErrors?.fields?.emailAddress ? (
        <Text style={styles.error}>Enter a valid email address.</Text>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />
      {signInErrors?.fields?.password || signUpErrors?.fields?.password ? (
        <Text style={styles.error}>Check your password.</Text>
      ) : null}
      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <Pressable style={styles.button} disabled={isBusy} onPress={handleContinue}>
        {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </Pressable>
      {/* Required mount point for Clerk's bot protection on sign-up */}
      <View nativeID="clerk-captcha" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: "#d33",
    fontSize: 13,
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#208AEF",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    color: "#208AEF",
    textAlign: "center",
    marginTop: 8,
  },
});
