import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { Message } from "../../types/rmp";

export function MessageBubble({ message }: { message: Message }) {
  const isGuest = message.senderId === "guest";
  return (
    <View className={`mb-3 max-w-[80%] ${isGuest ? "ml-auto items-end" : "mr-auto items-start"}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isGuest ? "rounded-br-md bg-teal" : "rounded-bl-md bg-surface-high"
        }`}
      >
        <Text className={`text-body-md ${isGuest ? "text-background" : "text-ink"}`}>{message.text}</Text>
      </View>
      <View className="mt-1 flex-row items-center gap-1">
        <Text className="text-caption-sm text-ink-sub">{message.timestamp}</Text>
        {isGuest ? (
          <Ionicons name="checkmark-done" size={13} color={message.read ? "#1AE0A8" : "#7A8599"} />
        ) : null}
      </View>
    </View>
  );
}
