import { Text, View } from "react-native";

export function ProgressIndicator({ step, total }: { step: number; total: number }) {
  return (
    <View className="flex-row items-center gap-3 px-5 pt-2">
      <View className="h-1.5 flex-1 flex-row gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-teal" : "bg-white/10"}`} />
        ))}
      </View>
      <Text className="text-caption-sm font-semibold text-ink-sub">
        {step}/{total}
      </Text>
    </View>
  );
}
