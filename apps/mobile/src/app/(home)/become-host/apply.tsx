import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Href, router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "../../../components/ui/Button";
import { ImageUploadCard, UploadState } from "../../../components/ui/ImageUploadCard";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { SelectField } from "../../../components/ui/SelectField";
import { uploadToImageKit } from "../../../lib/imagekit-upload";
import { useTrpc } from "../../../lib/trpc";

type DocType = "business_license" | "ein" | "insurance" | "rental_agreement";

const DOC_SLOTS: { type: DocType; label: string }[] = [
  { type: "business_license", label: "Business license" },
  { type: "ein", label: "EIN letter" },
  { type: "insurance", label: "Insurance" },
  { type: "rental_agreement", label: "Rental agreement (PDF)" },
];

type UploadedDoc = { imagekitFileId: string; url: string };

// "Join as Host" company application (PLAN.md Phase 2) — creates a pending company
// for admin review; the existing become-host/vehicle-details.. flow (listing an
// individual vehicle) only makes sense once this company is approved.
export default function HostApplyScreen() {
  const trpc = useTrpc();

  const [name, setName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [cancellationWindow, setCancellationWindow] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<Record<DocType, UploadState>>({
    business_license: "empty",
    ein: "empty",
    insurance: "empty",
    rental_agreement: "empty",
  });
  const [uploaded, setUploaded] = useState<Partial<Record<DocType, UploadedDoc>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allDocsUploaded = DOC_SLOTS.every((slot) => uploaded[slot.type]);
  const canSubmit =
    name && addressLine1 && city && state && postalCode && country && cancellationWindow && allDocsUploaded && !submitting;

  const pickDocument = async (type: DocType) => {
    setError(null);
    setUploadState((prev) => ({ ...prev, [type]: "uploading" }));
    try {
      let file: { uri: string; name: string; mimeType: string } | null = null;

      if (type === "rental_agreement") {
        const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          file = { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? "application/pdf" };
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          file = { uri: asset.uri, name: asset.fileName ?? `${type}.jpg`, mimeType: asset.mimeType ?? "image/jpeg" };
        }
      }

      if (!file) {
        setUploadState((prev) => ({ ...prev, [type]: uploaded[type] ? "uploaded" : "empty" }));
        return;
      }

      const result = await uploadToImageKit(trpc, file);
      setUploaded((prev) => ({ ...prev, [type]: result }));
      setUploadState((prev) => ({ ...prev, [type]: "uploaded" }));
    } catch (err) {
      setUploadState((prev) => ({ ...prev, [type]: uploaded[type] ? "uploaded" : "empty" }));
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!cancellationWindow) return;
    setSubmitting(true);
    setError(null);
    try {
      await trpc.company.submitApplication.mutate({
        name,
        addressLine1,
        city,
        state,
        postalCode,
        country,
        cancellationWindowHours: cancellationWindow as "24" | "48",
        documents: DOC_SLOTS.map((slot) => ({ type: slot.type, ...uploaded[slot.type]! })),
      });
      Alert.alert(
        "Application submitted",
        "We'll review your business details and documents. You'll be notified once your account is approved.",
        [{ text: "OK", onPress: () => router.replace("/" as Href) }],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScreenHeader title="Company details" />
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled">
          <Text className="mt-2 text-body-base text-ink-sub">
            Tell us about your rental company. We&apos;ll review your details and documents before your account goes live.
          </Text>

          <Text className="mb-2 mt-6 text-label-xs font-semibold tracking-widest text-ink-sub">COMPANY NAME</Text>
          <TextInput
            className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
            placeholder="Acme Rentals LLC"
            placeholderTextColor="#7A8599"
            value={name}
            onChangeText={setName}
          />

          <Text className="mb-2 mt-5 text-label-xs font-semibold tracking-widest text-ink-sub">ADDRESS</Text>
          <TextInput
            className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
            placeholder="Street address"
            placeholderTextColor="#7A8599"
            value={addressLine1}
            onChangeText={setAddressLine1}
          />
          <View className="mt-3 flex-row gap-3">
            <TextInput
              className="h-14 flex-1 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
              placeholder="City"
              placeholderTextColor="#7A8599"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              className="h-14 w-24 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
              placeholder="State"
              placeholderTextColor="#7A8599"
              value={state}
              onChangeText={setState}
            />
          </View>
          <View className="mt-3 flex-row gap-3">
            <TextInput
              className="h-14 flex-1 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
              placeholder="Postal code"
              placeholderTextColor="#7A8599"
              value={postalCode}
              onChangeText={setPostalCode}
            />
            <TextInput
              className="h-14 flex-1 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
              placeholder="Country"
              placeholderTextColor="#7A8599"
              value={country}
              onChangeText={setCountry}
            />
          </View>

          <View className="mt-2">
            <SelectField
              label="Cancellation window"
              value={cancellationWindow ? `${cancellationWindow} hours` : null}
              placeholder="Choose one"
              options={["24 hours", "48 hours"]}
              onChange={(next) => setCancellationWindow(next ? next.split(" ")[0] : null)}
            />
          </View>

          <Text className="mb-3 mt-6 text-label-xs font-semibold tracking-widest text-ink-sub">DOCUMENTS</Text>
          <View className="flex-row flex-wrap gap-3">
            {DOC_SLOTS.map((slot) => {
              const state = uploadState[slot.type];
              return (
                <View key={slot.type} style={{ width: "31%" }}>
                  {state === "uploaded" ? (
                    <ImageUploadCard
                      label={slot.label}
                      state="uploaded"
                      uri={uploaded[slot.type]!.url}
                      onPress={() => pickDocument(slot.type)}
                      onRemove={() => {
                        setUploaded((prev) => ({ ...prev, [slot.type]: undefined }));
                        setUploadState((prev) => ({ ...prev, [slot.type]: "empty" }));
                      }}
                    />
                  ) : (
                    <ImageUploadCard label={slot.label} state={state} onPress={() => pickDocument(slot.type)} />
                  )}
                </View>
              );
            })}
          </View>

          {error ? <Text className="mt-4 text-body-base text-danger">{error}</Text> : null}

          <PrimaryButton label="Submit application" className="mt-8" disabled={!canSubmit} loading={submitting} onPress={handleSubmit} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
