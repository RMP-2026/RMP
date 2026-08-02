import { useAuth } from "@clerk/expo";
import { Href, Redirect, Stack } from "expo-router";
import { BookingProvider } from "../../lib/booking-context";
import { FavoritesProvider } from "../../lib/favorites-context";
import { HostOnboardingProvider } from "../../lib/host-onboarding-context";
import { usePermissions } from "../../lib/permissions-context";
import { SearchProvider } from "../../lib/search-context";

export default function HomeLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading, hasPermission } = usePermissions();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (isLoading) return null;
  if (hasPermission("system_settings:manage")) return <Redirect href={"/admin" as Href} />;

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
