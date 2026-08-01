import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../../components/ui/EmptyState";
import { COMPANY_AVATAR } from "../../../lib/placeholder-images";
import { MOCK_THREADS } from "../../../lib/mock-data";
import { Routes } from "../../../lib/routes";

export default function InboxScreen() {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
          <Text className="text-heading-xl font-extrabold text-ink">Inbox</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search messages"
            onPress={() => {}}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-high active:opacity-70"
          >
            <Ionicons name="search" size={18} color="#F0F4FF" />
          </Pressable>
        </View>

        {MOCK_THREADS.length === 0 ? (
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No messages yet"
            subtitle="Messages with rental companies will show up here."
          />
        ) : (
          <FlatList
            data={MOCK_THREADS}
            keyExtractor={(t) => t.id}
            contentContainerClassName="px-5 pb-8"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(Routes.inboxThread(item.id) as Href)}
                className="flex-row items-center gap-3 border-b border-white/5 py-3 active:opacity-80"
              >
                <View>
                  <Image source={{ uri: COMPANY_AVATAR }} contentFit="cover" className="h-12 w-12 rounded-full" />
                  {item.unreadCount > 0 ? (
                    <View className="absolute -right-1 -top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-teal px-1">
                      <Text className="text-label-xs font-bold text-background">{item.unreadCount}</Text>
                    </View>
                  ) : null}
                </View>
                <View className="flex-1">
                  <Text className="text-body-md font-bold text-ink">Sunshine Fleet Rentals</Text>
                  <Text className="text-body-base text-ink-sub" numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
                <Text className="text-caption-sm text-ink-sub">{item.lastMessageAt}</Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
