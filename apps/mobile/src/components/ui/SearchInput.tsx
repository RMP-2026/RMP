import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

export function SearchInput({
  icon = "search",
  ...rest
}: TextInputProps & { icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View className="h-14 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4">
      <Ionicons name={icon} size={18} color="#7A8599" />
      <TextInput className="flex-1 text-body-md text-ink" placeholderTextColor="#7A8599" {...rest} />
    </View>
  );
}

export function FieldButton({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 flex-1 justify-center rounded-2xl border border-white/10 bg-surface px-4 active:opacity-80"
    >
      <View className="flex-row items-center gap-2">
        {icon ? <Ionicons name={icon} size={14} color="#7A8599" /> : null}
        <Text className="text-caption-sm font-semibold text-ink-sub">{label}</Text>
      </View>
      <Text className="mt-0.5 text-body-md font-semibold text-ink">{value}</Text>
    </Pressable>
  );
}
