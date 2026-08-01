import { useAuth, useUser } from "@clerk/expo";
import { Href, Redirect, Stack } from "expo-router";
import { BookingProvider } from "../../lib/booking-context";
import { FavoritesProvider } from "../../lib/favorites-context";
import { HostOnboardingProvider } from "../../lib/host-onboarding-context";
import { roleFromMetadata } from "../../lib/roles";
import { SearchProvider } from "../../lib/search-context";

export default function HomeLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (!user) return null;
  if (roleFromMetadata(user.publicMetadata.role) === "admin") return <Redirect href={"/admin" as Href} />;

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
