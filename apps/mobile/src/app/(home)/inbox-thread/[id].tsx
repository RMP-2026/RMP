import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageBubble } from "../../../components/ui/MessageBubble";
import { MOCK_MESSAGES, MOCK_THREADS } from "../../../lib/mock-data";
import { COMPANY_AVATAR } from "../../../lib/placeholder-images";
import type { Message } from "../../../types/rmp";

export default function InboxThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = MOCK_THREADS.find((t) => t.id === id);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[id] ?? []);
  const [draft, setDraft] = useState("");

  if (!thread) return null;

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        threadId: thread.id,
        senderId: "guest",
        text: draft.trim(),
        timestamp: "Now",
        read: false,
      },
    ]);
    setDraft("");
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center gap-3 border-b border-white/5 px-4 py-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
          >
            <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
          </Pressable>
          <Image source={{ uri: COMPANY_AVATAR }} contentFit="cover" className="h-10 w-10 rounded-full" />
          <View className="flex-1">
            <Text className="text-body-md font-bold text-ink">Sunshine Fleet Rentals</Text>
            <Text className="text-caption-sm text-ink-sub">{thread.activeStatus}</Text>
          </View>
        </View>

        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerClassName="px-4 py-4"
            renderItem={({ item }) => <MessageBubble message={item} />}
            inverted={false}
          />

          <View className="flex-row items-center gap-2 border-t border-white/5 px-3 py-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add attachment"
              onPress={() => {}}
              className="h-11 w-11 items-center justify-center rounded-full bg-surface-high active:opacity-70"
            >
              <Ionicons name="attach" size={20} color="#7A8599" />
            </Pressable>
            <View className="h-11 flex-1 justify-center rounded-full border border-white/10 bg-surface px-4">
              <TextInput
                className="text-body-md text-ink"
                placeholder="Type a message..."
                placeholderTextColor="#7A8599"
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={send}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={send}
              disabled={!draft.trim()}
              className={`h-11 w-11 items-center justify-center rounded-full ${draft.trim() ? "bg-teal" : "bg-surface-high"}`}
            >
              <Ionicons name="arrow-up" size={20} color={draft.trim() ? "#080C14" : "#7A8599"} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
