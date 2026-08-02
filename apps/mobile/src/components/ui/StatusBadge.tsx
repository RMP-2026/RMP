import { Text, View } from "react-native";

export type StatusBadgeTone = "active" | "pending" | "canceled" | "verified" | "neutral";

const TONE_STYLES: Record<StatusBadgeTone, { bg: string; border: string; text: string }> = {
  active: { bg: "bg-success/10", border: "border-success/40", text: "text-success" },
  pending: { bg: "bg-warning/10", border: "border-warning/40", text: "text-warning" },
  canceled: { bg: "bg-danger/10", border: "border-danger/40", text: "text-danger" },
  verified: { bg: "bg-teal/10", border: "border-teal/40", text: "text-teal" },
  neutral: { bg: "bg-white/5", border: "border-white/10", text: "text-ink-sub" },
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: StatusBadgeTone }) {
  const s = TONE_STYLES[tone];
  return (
    <View className={`self-start rounded-lg border px-2.5 py-1 ${s.bg} ${s.border}`}>
      <Text className={`text-caption-sm font-bold ${s.text}`}>{label}</Text>
    </View>
  );
}
