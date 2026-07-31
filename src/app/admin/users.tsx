import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SearchField } from "@/components/admin/SearchField";

type PlatformUser = {
  id: string;
  name: string;
  email: string;
  trips: number;
  verified: boolean;
};

const USERS: PlatformUser[] = [
  { id: "1", name: "Jordan Park", email: "jordan@email.com", trips: 12, verified: true },
  { id: "2", name: "Alex Chen", email: "alex@email.com", trips: 7, verified: true },
  { id: "3", name: "Maria Torres", email: "maria@email.com", trips: 3, verified: false },
  { id: "4", name: "James Lee", email: "james@email.com", trips: 21, verified: true },
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function UserRow({ user }: { user: PlatformUser }) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-white/5 bg-surface-high p-4">
      <View className="flex-1 flex-row items-center gap-3 pr-3">
        <View className="h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-surface">
          <Text className="text-body-base font-bold text-ink">{initialsFor(user.name)}</Text>
        </View>
        <View>
          <Text className="text-body-md font-bold text-ink">{user.name}</Text>
          <Text className="mt-0.5 text-body-base text-info">{user.email}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-caption-sm text-ink-sub">{user.trips} trips</Text>
        <Text className={`mt-1 text-body-base font-bold ${user.verified ? "text-success" : "text-warning"}`}>
          {user.verified ? "Verified" : "Unverified"}
        </Text>
      </View>
    </View>
  );
}

export default function AdminUsersScreen() {
  const [query, setQuery] = useState("");

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return USERS.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [query]);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-4 text-heading-xxl font-extrabold text-ink">Users</Text>

          <SearchField placeholder="Search users..." value={query} onChangeText={setQuery} />

          <Text className="mb-4 mt-3 text-body-base text-ink-sub">12,430 total users · 847 this month</Text>

          <View className="gap-3">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
