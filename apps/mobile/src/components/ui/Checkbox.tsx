import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export function Checkbox({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      className="flex-row items-center gap-3 active:opacity-70"
    >
      <View
        className={`h-6 w-6 items-center justify-center rounded-md border ${
          checked ? "border-teal bg-teal" : "border-white/20 bg-transparent"
        }`}
      >
        {checked ? <Ionicons name="checkmark" size={16} color="#080C14" /> : null}
      </View>
      {label ? <Text className="text-body-md text-ink">{label}</Text> : null}
    </Pressable>
  );
}

export function RadioButton({
  selected,
  onPress,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center gap-3 active:opacity-70"
    >
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? "border-teal" : "border-white/20"
        }`}
      >
        {selected ? <View className="h-3 w-3 rounded-full bg-teal" /> : null}
      </View>
      {label ? <Text className="text-body-md text-ink">{label}</Text> : null}
    </Pressable>
  );
}

export function RadioCard({
  selected,
  onPress,
  title,
  subtitle,
  trailing,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  trailing?: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-2xl border p-4 active:opacity-90 ${
        selected ? "border-teal bg-teal/10" : "border-white/10 bg-surface"
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected ? "border-teal" : "border-white/20"
          }`}
        >
          {selected ? <View className="h-2.5 w-2.5 rounded-full bg-teal" /> : null}
        </View>
        <View>
          <Text className="text-body-md font-bold text-ink">{title}</Text>
          {subtitle ? <Text className="text-body-base text-ink-sub">{subtitle}</Text> : null}
        </View>
      </View>
      {trailing ? (
        <Text className={`text-body-md font-bold ${selected ? "text-teal" : "text-ink"}`}>{trailing}</Text>
      ) : null}
    </Pressable>
  );
}
