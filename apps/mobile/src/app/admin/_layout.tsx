import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

/**
 * Platform-level "admin" role gate — mirrors `apps/web`'s `proxy.ts`, reading the same
 * `metadata.role` session claim (Clerk Dashboard-configured) rather than a DB round-trip.
 * The old fine-grained `role_permissions` check was removed with the RBAC tables it
 * depended on (see PLAN.md Phase 1).
 */
export default function AdminLayout() {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
