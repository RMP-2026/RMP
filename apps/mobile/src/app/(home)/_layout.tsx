import { useAuth } from "@clerk/expo";
import { Href, Redirect, Stack } from "expo-router";
import { BookingProvider } from "../../lib/booking-context";
import { FavoritesProvider } from "../../lib/favorites-context";
import { HostOnboardingProvider } from "../../lib/host-onboarding-context";
import { SearchProvider } from "../../lib/search-context";

export default function HomeLayout() {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role === "admin") return <Redirect href={"/admin" as Href} />;

  return (
    <FavoritesProvider>
      <SearchProvider>
        <BookingProvider>
          <HostOnboardingProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </HostOnboardingProvider>
        </BookingProvider>
      </SearchProvider>
    </FavoritesProvider>
  );
}
