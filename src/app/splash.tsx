import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(LinearGradient, { className: "style" });
cssInterop(Image, { className: "style" });

export default function SplashScreen() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/auth-screen-bg.png")}
        contentFit="cover"
        className="absolute inset-0 h-full w-full"
      />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={require("../../assets/images/rmp-logo-mark.png")}
            contentFit="cover"
            className="h-24 w-24 rounded-[28px]"
          />

          <Text className="mt-6 text-heading-xxl font-extrabold text-ink">RMP</Text>
          <Text className="mt-1 text-caption-sm font-medium tracking-[3px] text-ink-sub">
            RENTAL MARKET PLACE
          </Text>
        </View>

        <View className="px-6 pb-2">
          <View className="mb-6 flex-row items-center justify-center gap-2">
            <View className="h-2 w-6 rounded-full bg-teal" />
            <View className="h-2 w-2 rounded-full bg-white/20" />
            <View className="h-2 w-2 rounded-full bg-white/20" />
          </View>

          <Pressable
            className="h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
            onPress={() => router.replace("/onboarding")}
          >
            <LinearGradient
              colors={["#1AE0A8", "#00B88A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full w-full items-center justify-center"
            >
              <Text className="text-base font-bold text-background">Get Started</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
