import { useAuth, useUser } from "@clerk/expo";

export type AppRole = "user" | "host" | "admin";

export function roleFromMetadata(role: unknown): AppRole {
  return role === "admin" || role === "host" ? role : "user";
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
