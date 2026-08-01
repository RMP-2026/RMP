import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 max-h-[85%] rounded-t-3xl border-t border-white/10 bg-surface">
        <SafeAreaView edges={["bottom"]}>
          {title ? (
            <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-4">
              <Text className="text-heading-lg font-bold text-ink">{title}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-surface-high"
              >
                <Ionicons name="close" size={18} color="#F0F4FF" />
              </Pressable>
            </View>
          ) : null}
          <View className="px-5 pb-4 pt-2">{children}</View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export function AppModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/70 px-6" onPress={onClose}>
        <Pressable className="w-full rounded-3xl border border-white/10 bg-surface p-5" onPress={(e) => e.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
