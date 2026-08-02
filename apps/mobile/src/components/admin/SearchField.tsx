import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

export function SearchField({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View className="mt-6 h-14 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4">
      <Ionicons name="search" size={18} color="#3B82F6" />
      <TextInput
        className="flex-1 text-body-md text-ink"
        placeholder={placeholder}
        placeholderTextColor="#7A8599"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
