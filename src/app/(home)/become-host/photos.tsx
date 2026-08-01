import { Href, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton } from "../../../components/ui/Button";
import { ImageUploadCard, UploadState } from "../../../components/ui/ImageUploadCard";
import { ProgressIndicator } from "../../../components/ui/ProgressIndicator";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { VEHICLE_PHOTOS } from "../../../lib/placeholder-images";
import { Routes } from "../../../lib/routes";

const SLOTS = ["Front", "Back", "Left side", "Right side", "Interior", "Trunk"];

// TODO: swap the mocked upload for expo-image-picker + ImageKit once the picker dependency is added.
export default function HostPhotosScreen() {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const uploadTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = uploadTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const startUpload = (slot: string) => {
    if (uploads[slot] === "uploaded") return;
    if (uploadTimers.current[slot]) clearTimeout(uploadTimers.current[slot]);
    setUploads((prev) => ({ ...prev, [slot]: "uploading" }));
    uploadTimers.current[slot] = setTimeout(() => {
      setUploads((prev) => ({ ...prev, [slot]: "uploaded" }));
    }, 900);
  };

  const uploadedCount = SLOTS.filter((s) => uploads[s] === "uploaded").length;

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View className="flex-1">
          <ScreenHeader title="Add photos" />
          <ProgressIndicator step={2} total={5} />
          <View className="px-5 pt-4">
            <View className="flex-row flex-wrap gap-3">
              {SLOTS.map((slot) => (
                <View key={slot} style={{ width: "31%" }}>
                  {uploads[slot] === "uploaded" ? (
                    <ImageUploadCard
                      label={slot}
                      state="uploaded"
                      uri={VEHICLE_PHOTOS.rav4[0]}
                      onPress={() => startUpload(slot)}
                      onRemove={() => setUploads((prev) => ({ ...prev, [slot]: "empty" }))}
                    />
                  ) : (
                    <ImageUploadCard
                      label={slot}
                      state={uploads[slot] ?? "empty"}
                      onPress={() => startUpload(slot)}
                    />
                  )}
                </View>
              ))}
            </View>
            <SecondaryButton label="+ Add more" className="mt-4" onPress={() => {}} />
          </View>
        </View>

        <View className="px-5 pb-2">
          <PrimaryButton
            label="Continue"
            disabled={uploadedCount < SLOTS.length}
            onPress={() => router.push(Routes.becomeHostLocation as Href)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
