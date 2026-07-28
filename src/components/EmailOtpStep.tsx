import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

cssInterop(LinearGradient, { className: "style" });

const CODE_LENGTH = 6;
const RESEND_SECONDS = 42;

export function EmailOtpStep({
  email,
  title = "Verify Your Email",
  onVerify,
  onResend,
  isBusy,
  formError,
}: {
  email: string;
  title?: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  isBusy: boolean;
  formError: string | null;
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleChangeDigit = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, "");
    if (!sanitized) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const next = [...digits];
    let cursor = index;
    for (const char of sanitized.split("")) {
      if (cursor >= CODE_LENGTH) break;
      next[cursor] = char;
      cursor += 1;
    }
    const nextIndex = Math.min(cursor, CODE_LENGTH - 1);
    setDigits(next);
    requestAnimationFrame(() => inputRefs.current[nextIndex]?.focus());
    if (next.every((d) => d !== "")) onVerify(next.join(""));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setDigits(Array(CODE_LENGTH).fill(""));
    setSecondsLeft(RESEND_SECONDS);
    onResend();
    inputRefs.current[0]?.focus();
  };

  return (
    <View className="mt-10 items-center">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-ink">
        <Ionicons name="mail-outline" size={28} color="#0E1420" />
        <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-teal">
          <Text className="text-[10px] font-bold text-background">@</Text>
        </View>
      </View>

      <Text className="mt-6 text-heading-xxl font-extrabold text-ink">{title}</Text>
      <Text className="mt-2 text-center text-body-base text-ink-sub">We sent a 6-digit code to</Text>
      <Text className="text-body-base font-semibold text-ink">{email}</Text>

      <View className="mt-8 w-full flex-row justify-between">
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            className={`h-14 w-12 rounded-2xl border text-center text-xl font-bold ${
              digit ? "border-teal bg-teal/10 text-teal" : "border-white/10 bg-surface text-ink"
            }`}
            value={digit}
            onChangeText={(text) => handleChangeDigit(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            placeholder="•"
            placeholderTextColor="#2A3244"
            autoFocus={index === 0}
          />
        ))}
      </View>

      {formError ? (
        <Text className="mt-3 text-center text-body-base text-danger">{formError}</Text>
      ) : null}

      <Pressable
        className="mt-8 h-14 w-full items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
        disabled={isBusy}
        onPress={() => onVerify(digits.join(""))}
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
            <Text className="text-base font-bold text-background">Verify</Text>
          )}
        </LinearGradient>
      </Pressable>

      <Pressable className="mt-6 flex-row items-center" onPress={handleResend} disabled={secondsLeft > 0}>
        <Text className="text-sm text-ink-sub">Didn&apos;t receive? </Text>
        <Text className="text-sm font-semibold text-teal">
          {secondsLeft > 0 ? `Resend (${secondsLeft}s)` : "Resend"}
        </Text>
      </Pressable>
    </View>
  );
}
