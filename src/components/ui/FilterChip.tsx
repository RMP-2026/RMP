import type { ReactNode } from "react";
import { Pressable, Text } from "react-native";

export function FilterChip({
  label,
  selected,
  disabled,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-10 flex-row items-center gap-1.5 rounded-full border px-4 active:opacity-80 ${
        selected ? "border-teal bg-teal/15" : "border-white/10 bg-surface-high"
      } ${disabled ? "opacity-40" : ""}`}
    >
      {icon}
      <Text className={`text-body-base font-semibold ${selected ? "text-teal" : "text-ink"}`}>{label}</Text>
    </Pressable>
  );
}
