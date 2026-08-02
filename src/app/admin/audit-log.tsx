import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

type AuditEntry = {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export default function AdminAuditLogScreen() {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Not signed in");
        const apiOrigin = process.env.EXPO_PUBLIC_API_URL ?? "";
        const response = await fetch(`${apiOrigin}/api/admin/audit-log`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Couldn't load the audit log (${response.status})`);
        const data = await response.json();
        setEntries(data.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load the audit log.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]}>
        <ScreenHeader title="Audit Log" />
      </SafeAreaView>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1AE0A8" />
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
          {error ? <Text className="mb-4 text-body-base text-danger">{error}</Text> : null}
          {entries.length === 0 && !error ? (
            <Text className="text-body-base text-ink-sub">No audit events yet.</Text>
          ) : null}
          <View className="gap-2">
            {entries.map((entry) => (
              <View key={entry.id} className="rounded-2xl border border-white/5 bg-surface-high p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-body-base font-bold text-ink">{entry.action}</Text>
                  <Text className="text-caption-sm text-ink-sub">{new Date(entry.createdAt).toLocaleString()}</Text>
                </View>
                <Text className="mt-1 text-caption-sm text-ink-sub">
                  {entry.targetType}:{entry.targetId}
                  {entry.actorUserId ? ` · by ${entry.actorUserId}` : " · system"}
                </Text>
                {entry.metadata ? (
                  <Text className="mt-1 text-caption-sm text-ink-sub">{JSON.stringify(entry.metadata)}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
