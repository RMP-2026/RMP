import { useAuth } from "@clerk/expo";
import type { AppRouter } from "@rmp/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useMemo } from "react";

/**
 * apps/web hosts the tRPC route handler (/api/trpc) — apps/mobile is a pure client.
 * EXPO_PUBLIC_API_URL must point at that app's origin, not apps/mobile's own API routes.
 */
function trpcUrl() {
  const apiOrigin = process.env.EXPO_PUBLIC_API_URL ?? "";
  return `${apiOrigin}/api/trpc`;
}

export function createTrpcClient(getToken: () => Promise<string | null>) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: trpcUrl(),
        headers: async () => {
          const token = await getToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

/** Memoized per-component tRPC client, authenticated with the current Clerk session. */
export function useTrpc() {
  const { getToken } = useAuth();
  return useMemo(() => createTrpcClient(getToken), [getToken]);
}
