import { useAuth, useUser } from "@clerk/expo";
import { Href, Redirect, Stack } from "expo-router";

export default function HomeLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (!user) return null;
  if (user.publicMetadata.role === "admin") return <Redirect href={"/admin" as Href} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
