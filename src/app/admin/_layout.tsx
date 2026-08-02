import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { usePermissions } from "@/lib/permissions-context";

export default function AdminLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading, hasPermission } = usePermissions();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (isLoading) return null;
  if (!hasPermission("system_settings:manage")) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
