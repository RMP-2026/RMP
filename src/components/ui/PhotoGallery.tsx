import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export function PhotoGallery({ photos, height = 300 }: { photos: string[]; height?: number }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <View>
      <Pressable onPress={() => setFullscreen(true)} accessibilityRole="button">
        <Image source={{ uri: photos[index] }} contentFit="cover" style={{ width: "100%", height }} />
      </Pressable>
      <View className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1">
        <Text className="text-caption-sm text-ink">
          {index + 1}/{photos.length}
        </Text>
      </View>

      <Modal visible={fullscreen} animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <View className="flex-1 bg-black">
          <SafeAreaView edges={["top"]} className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-2">
              <Text className="text-body-md font-semibold text-ink">
                {index + 1} / {photos.length}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close gallery"
                onPress={() => setFullscreen(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
              >
                <Ionicons name="close" size={20} color="#F0F4FF" />
              </Pressable>
            </View>
            <Image source={{ uri: photos[index] }} contentFit="contain" className="flex-1" />
            <View className="flex-row justify-center gap-2 py-4">
              {photos.map((_, i) => (
                <Pressable key={i} onPress={() => setIndex(i)} hitSlop={6}>
                  <View className={`h-2 w-2 rounded-full ${i === index ? "bg-teal" : "bg-white/30"}`} />
                </Pressable>
              ))}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
