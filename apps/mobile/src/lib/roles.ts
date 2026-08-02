import { useAuth, useUser } from "@clerk/expo";

// The pre-Phase-1 role model had 5 platform roles; the current `packages/db` `users.role`
// enum only has `customer`/`admin` (company-level access is `company_staff` membership,
// not a platform role — see PLAN.md Phase 1). Kept as the wider set here since Clerk
// `publicMetadata.role` isn't validated against the DB enum and this is just a typo guard.
export type RoleKey = "customer" | "host" | "admin" | "support" | "moderator";
export const ROLE_KEYS: readonly RoleKey[] = ["customer", "host", "admin", "support", "moderator"];

export type AppRole = RoleKey;

export function roleFromMetadata(role: unknown): AppRole {
  return (ROLE_KEYS as readonly string[]).includes(role as string) ? (role as AppRole) : "customer";
}

/** Reads the signed-in user's role from Clerk's publicMetadata (source of truth, set server-side only). */
export function useAppRole(): AppRole {
  const { user } = useUser();
  return roleFromMetadata(user?.publicMetadata?.role);
}

/**
 * Calls the server to promote the current user to the "host" role, then reloads
 * the Clerk user so publicMetadata reflects the change immediately on this device.
 */
export function useApplyForHost() {
  const { getToken } = useAuth();
  const { user } = useUser();

  return async () => {
    const token = await getToken();
    if (!token) throw new Error("You must be signed in to become a host.");

    const apiOrigin = process.env.EXPO_PUBLIC_API_URL ?? "";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let response: Response;
    try {
      response = await fetch(`${apiOrigin}/api/host/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("The request timed out. Please try again.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "Couldn't apply for a host account. Please try again.");
    }

    await user?.reload();
  };
}
