import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { BottomSheet } from "./BottomSheet";

export function SelectField({
  label,
  value,
  placeholder = "Any",
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  placeholder?: string;
  options: string[];
  onChange: (next: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="flex-row items-center justify-between border-b border-white/5 py-4"
      >
        <View>
          <Text className="text-body-md font-semibold text-ink">{label}</Text>
          <Text className="mt-0.5 text-body-base text-ink-sub">{value ?? placeholder}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#7A8599" />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View className="gap-2">
          <Pressable
            onPress={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${
              value === null ? "border-teal bg-teal/10" : "border-white/10 bg-surface-high"
            }`}
          >
            <Text className={`text-body-md font-semibold ${value === null ? "text-teal" : "text-ink"}`}>
              {placeholder}
            </Text>
            {value === null ? <Ionicons name="checkmark" size={18} color="#1AE0A8" /> : null}
          </Pressable>
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
