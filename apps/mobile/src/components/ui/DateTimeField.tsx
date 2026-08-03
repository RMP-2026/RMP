import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheet } from "./BottomSheet";

export function DateTimeField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="h-14 flex-1 justify-center rounded-2xl border border-white/10 bg-surface px-4 active:opacity-80"
      >
        <Text className="text-caption-sm font-semibold text-ink-sub">{label}</Text>
        <Text className="mt-0.5 text-body-md font-semibold text-ink">{value}</Text>
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View className="gap-2">
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${
                opt === value ? "border-teal bg-teal/10" : "border-white/10 bg-surface-high"
              }`}
            >
              <Text className={`text-body-md font-semibold ${opt === value ? "text-teal" : "text-ink"}`}>{opt}</Text>
              {opt === value ? <Ionicons name="checkmark" size={18} color="#1AE0A8" /> : null}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}
