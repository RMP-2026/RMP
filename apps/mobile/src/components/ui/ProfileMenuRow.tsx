import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

export function ProfileMenuRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-white/5 py-4 active:opacity-70"
    >
      <Ionicons name={icon} size={20} color={destructive ? "#EF4444" : "#7A8599"} />
      <Text className={`flex-1 text-body-md font-semibold ${destructive ? "text-danger" : "text-ink"}`}>{label}</Text>
      {value ? <Text className="text-body-base text-ink-sub">{value}</Text> : null}
      {!destructive ? <Ionicons name="chevron-forward" size={16} color="#7A8599" /> : null}
    </Pressable>
  );
}
