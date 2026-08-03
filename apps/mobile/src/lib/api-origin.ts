import Constants from "expo-constants";

/**
 * Origin for apps/mobile's own Expo Router `+api.ts` routes (e.g. `/api/me/permissions`,
 * `/api/host/apply`) — these are served by the Expo/Metro dev server, not apps/web, so they
 * must NOT use `EXPO_PUBLIC_API_URL` (that's apps/web's origin, for tRPC only — see trpc.ts).
 * `Constants.expoConfig.hostUri` is the host:port the JS bundle was loaded from (e.g.
 * "10.0.0.232:8081", already including the Metro port) and only exists under `expo start`.
 * There's no dev server in a production build, so a real deployed origin will be needed
 * there once these routes ship.
 */
export function mobileApiOrigin() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return "";
  return `http://${hostUri}`;
}
