import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export type UploadState = "empty" | "uploading" | "uploaded";

export function ImageUploadCard({
  label,
  uri,
  state,
  onPress,
  onRemove,
}: {
  label: string;
  uri?: string;
  state: UploadState;
  onPress: () => void;
  onRemove?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="aspect-square flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-surface-high"
    >
      {state === "uploaded" && uri ? (
        <>
          <Image source={{ uri }} contentFit="cover" className="h-full w-full" />
          <View className="absolute bottom-1.5 left-1.5 right-1.5 flex-row items-center justify-between rounded-md bg-black/60 px-1.5 py-1">
            <Text className="text-caption-sm text-ink">{label}</Text>
            {onRemove ? (
              <Pressable hitSlop={6} onPress={onRemove}>
                <Ionicons name="close-circle" size={16} color="#F0F4FF" />
              </Pressable>
            ) : null}
          </View>
        </>
      ) : state === "uploading" ? (
        <>
          <ActivityIndicator color="#1AE0A8" />
          <Text className="mt-2 text-caption-sm text-ink-sub">{label}</Text>
        </>
      ) : (
        <>
          <Ionicons name="camera-outline" size={22} color="#7A8599" />
          <Text className="mt-1 text-caption-sm text-ink-sub">{label}</Text>
        </>
      )}
    </Pressable>
  );
}
