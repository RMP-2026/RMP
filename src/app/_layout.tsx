import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import * as Sentry from "@sentry/react-native";

import "../../global.css";

Sentry.init({
  dsn: "https://17b1a135fda5ddc6d5d0cc3e0607150b@o4511768792334336.ingest.us.sentry.io/4511771788902400",
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
  enableLogs: true,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);
