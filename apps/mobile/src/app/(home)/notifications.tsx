import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/ui/EmptyState";
import { ScreenHeader } from "../../components/ui/ScreenHeader";

export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]}>
        <ScreenHeader title="Notifications" />
      </SafeAreaView>
      <EmptyState
        icon="notifications-outline"
        title="No notifications yet"
        subtitle="Trip updates, messages, and promotions will show up here."
      />
    </View>
  );
}
