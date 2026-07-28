import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import { useRef, useState } from "react";
import type { ComponentProps } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(LinearGradient, { className: "style" });
cssInterop(Image, { className: "style" });

type Slide = {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    icon: "business",
    title: "Verified Fleet Companies",
    description:
      "Browse premium rental companies with verified fleets, real reviews, and transparent pricing.",
  },
  {
    icon: "calendar",
    title: "Book in Minutes",
    description: "Request a booking, get instant approval, and hit the road — all from your phone.",
  },
  {
    icon: "shield-checkmark",
    title: "Fully Insured Rentals",
    description: "Every vehicle comes with comprehensive insurance managed by the rental company.",
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const handleContinue = () => {
    if (isLastSlide) {
      router.replace("/");
    } else {
      goToSlide(activeIndex + 1);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/auth-screen-bg.png")}
        contentFit="cover"
        className="absolute inset-0 h-full w-full"
      />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          className="flex-1"
        >
          {SLIDES.map((slide) => (
            <View key={slide.title} style={{ width }} className="px-6">
              <View className="mt-2 h-56 items-center justify-center rounded-[28px] border border-white/10 bg-surface-high">
                <Ionicons name={slide.icon} size={64} color="#1AE0A8" />
              </View>

              <Text className="mt-8 text-heading-xxl font-extrabold text-ink">{slide.title}</Text>
              <Text className="mt-3 text-body-md text-ink-sub">{slide.description}</Text>
            </View>
          ))}
        </ScrollView>

        <View className="px-6 pb-2">
          <View className="mb-6 flex-row items-center justify-center gap-2">
            {SLIDES.map((slide, index) => (
              <View
                key={slide.title}
                className={
                  index === activeIndex
                    ? "h-2 w-6 rounded-full bg-teal"
                    : "h-2 w-2 rounded-full bg-white/20"
                }
              />
            ))}
          </View>

          <Pressable
            className="h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40"
            onPress={handleContinue}
          >
            <LinearGradient
              colors={["#1AE0A8", "#00B88A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full w-full items-center justify-center"
            >
              <Text className="text-base font-bold text-background">
                {isLastSlide ? "Get Started" : "Continue"}
              </Text>
            </LinearGradient>
          </Pressable>

          {isLastSlide ? (
            <View className="mb-6" />
          ) : (
            <Pressable className="mb-6 mt-4 items-center" onPress={() => router.replace("/")}>
              <Text className="text-sm font-medium text-ink-sub">Skip</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
