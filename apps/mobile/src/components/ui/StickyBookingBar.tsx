import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "./Button";

export function StickyBookingBar({
  pricePerDay,
  total,
  buttonLabel,
  onPress,
  disabled,
  loading,
}: {
  pricePerDay?: number;
  total?: number;
  buttonLabel: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <View className="border-t border-white/10 bg-surface">
      <SafeAreaView edges={["bottom"]}>
        <View className="flex-row items-center justify-between px-5 py-3">
          <View>
            {pricePerDay !== undefined ? (
              <View className="flex-row items-baseline gap-1">
                <Text className="text-heading-lg font-extrabold text-ink">${pricePerDay}</Text>
                <Text className="text-body-base text-ink-sub">/day</Text>
              </View>
            ) : null}
            {total !== undefined ? <Text className="text-body-base text-ink-sub">${total} total</Text> : null}
          </View>
          <PrimaryButton label={buttonLabel} onPress={onPress} disabled={disabled} loading={loading} fullWidth={false} className="px-8" />
        </View>
      </SafeAreaView>
    </View>
  );
}
