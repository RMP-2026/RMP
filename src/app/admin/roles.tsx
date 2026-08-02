import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { PermissionKey, RoleKey } from "@/lib/permissions/catalog";

type RoleRow = { key: RoleKey; name: string; description: string; permissionKeys: PermissionKey[] };
type PermissionRow = { key: PermissionKey; resource: string; action: string; description: string };

async function apiFetch(path: string, token: string, init?: RequestInit) {
  const apiOrigin = process.env.EXPO_PUBLIC_API_URL ?? "";
  const response = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }
  return response.json();
}

export default function AdminRolesScreen() {
  const { getToken } = useAuth();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [expandedRole, setExpandedRole] = useState<RoleKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  async function load() {
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      setLoading(true);
      setError(null);
      const data = await apiFetch("/api/admin/roles", token);
      setRoles(data.roles);
      setPermissions(data.permissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load roles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(role: RoleRow, permissionKey: PermissionKey, grant: boolean) {
    const pendingId = `${role.key}:${permissionKey}`;
    setPendingKey(pendingId);
    const previous = roles;
    setRoles((prev) =>
      prev.map((r) =>
        r.key === role.key
          ? {
              ...r,
              permissionKeys: grant
                ? [...r.permissionKeys, permissionKey]
                : r.permissionKeys.filter((k) => k !== permissionKey),
            }
          : r,
      ),
    );

    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      await apiFetch(`/api/admin/roles/${role.key}/permissions`, token, {
        method: "PATCH",
        body: JSON.stringify({ permissionKey, grant }),
      });
    } catch (err) {
      setRoles(previous); // revert the optimistic update
      setError(err instanceof Error ? err.message : "Couldn't update permission.");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]}>
        <ScreenHeader title="Roles & Permissions" />
      </SafeAreaView>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1AE0A8" />
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
          {error ? <Text className="mb-4 text-body-base text-danger">{error}</Text> : null}
          <View className="gap-3">
            {roles.map((role) => {
              const expanded = expandedRole === role.key;
              return (
                <View key={role.key} className="rounded-2xl border border-white/5 bg-surface-high">
                  <Pressable
                    className="flex-row items-center justify-between p-4"
                    onPress={() => setExpandedRole(expanded ? null : role.key)}
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-body-md font-bold text-ink">{role.name}</Text>
                      <Text className="mt-0.5 text-body-base text-ink-sub">{role.description}</Text>
                      <Text className="mt-1 text-caption-sm text-teal">{role.permissionKeys.length} permissions</Text>
                    </View>
                    <Text className="text-body-base text-ink-sub">{expanded ? "Hide" : "Manage"}</Text>
                  </Pressable>

                  {expanded ? (
                    <View className="gap-2 border-t border-white/5 p-4">
                      {permissions.map((permission) => {
                        const granted = role.permissionKeys.includes(permission.key);
                        const disabled = pendingKey === `${role.key}:${permission.key}`;
                        return (
                          <View key={permission.key} className="flex-row items-center justify-between py-1.5">
                            <View className="flex-1 pr-3">
                              <Text className="text-body-base font-semibold text-ink">{permission.key}</Text>
                              <Text className="text-caption-sm text-ink-sub">{permission.description}</Text>
                            </View>
                            <ToggleSwitch
                              value={granted}
                              disabled={disabled}
                              onValueChange={(next) => toggle(role, permission.key, next)}
                            />
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
