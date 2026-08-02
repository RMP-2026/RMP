import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export function EmptyState({
  icon = "car-outline",
  title,
  subtitle,
  action,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-high">
        <Ionicons name={icon} size={28} color="#7A8599" />
      </View>
      <Text className="text-center text-heading-lg font-bold text-ink">{title}</Text>
      {subtitle ? <Text className="text-center text-body-base text-ink-sub">{subtitle}</Text> : null}
      {action}
    </View>
  );
}

export function ErrorState({
  title = "Something went wrong",
  subtitle = "Please try again.",
  onRetry,
}: {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-danger/10">
        <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
      </View>
      <Text className="text-center text-heading-lg font-bold text-ink">{title}</Text>
      <Text className="text-center text-body-base text-ink-sub">{subtitle}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8} className="mt-2 active:opacity-70">
          <Text className="text-body-md font-bold text-teal">Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingSkeleton({ className = "h-24 w-full" }: { className?: string }) {
  return <View className={`rounded-2xl bg-surface-high/80 ${className}`} />;
}
