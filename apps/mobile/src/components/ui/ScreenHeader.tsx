import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View className="h-14 flex-row items-center justify-between px-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack ?? (() => router.back())}
        className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
      >
        <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
      </Pressable>
      {title ? <Text className="text-heading-lg font-bold text-ink">{title}</Text> : <View />}
      {right ?? <View className="h-10 w-10" />}
    </View>
  );
}
