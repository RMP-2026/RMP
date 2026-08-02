import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VEHICLE_PLACEHOLDER } from "../../lib/placeholder-images";

export function PhotoGallery({ photos, height = 300 }: { photos: string[]; height?: number }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[index] : VEHICLE_PLACEHOLDER;

  return (
    <View>
      <Pressable onPress={() => setFullscreen(true)} accessibilityRole="button">
        <Image source={{ uri: currentPhoto }} contentFit="cover" style={{ width: "100%", height }} />
      </Pressable>
      {hasPhotos ? (
        <View className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1">
          <Text className="text-caption-sm text-ink">
            {index + 1}/{photos.length}
          </Text>
        </View>
      ) : null}

      <Modal visible={fullscreen} animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <View className="flex-1 bg-black">
          <SafeAreaView edges={["top"]} className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-2">
              {hasPhotos ? (
                <Text className="text-body-md font-semibold text-ink">
                  {index + 1} / {photos.length}
                </Text>
              ) : (
                <View />
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close gallery"
                onPress={() => setFullscreen(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
              >
                <Ionicons name="close" size={20} color="#F0F4FF" />
              </Pressable>
            </View>
            <Image source={{ uri: currentPhoto }} contentFit="contain" className="flex-1" />
            {hasPhotos ? (
              <View className="flex-row justify-center gap-2 py-4">
                {photos.map((_, i) => (
                  <Pressable key={i} onPress={() => setIndex(i)} hitSlop={6}>
                    <View className={`h-2 w-2 rounded-full ${i === index ? "bg-teal" : "bg-white/30"}`} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
