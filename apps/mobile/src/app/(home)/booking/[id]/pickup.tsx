import { Href, router, useLocalSearchParams } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../../components/ui/Button";
import { RadioCard } from "../../../../components/ui/Checkbox";
import { ScreenHeader } from "../../../../components/ui/ScreenHeader";
import { useBooking } from "../../../../lib/booking-context";
import { getVehicleById } from "../../../../lib/mock-data";
import { Routes } from "../../../../lib/routes";
import type { PickupOptionId } from "../../../../types/rmp";

export default function BookingPickupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = getVehicleById(id);
  const { pickupOption, setPickupOption, deliveryAddress, setDeliveryAddress } = useBooking();

  if (!vehicle) return null;

  const options: { id: PickupOptionId; title: string; subtitle: string; trailing: string }[] = [
    { id: "vehicle", title: "Pickup at car location", subtitle: vehicle.location, trailing: "Free" },
    { id: "airport", title: "Airport pickup", subtitle: "Miami International Airport", trailing: "$35" },
    { id: "delivery", title: "Bring the car to me", subtitle: "Enter delivery address", trailing: "from $35" },
  ];

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 justify-between">
        <View className="flex-1">
          <ScreenHeader title="Pickup & return" />
          <View className="gap-3 px-5 pt-2">
            {options.map((opt) => (
              <RadioCard
                key={opt.id}
                selected={pickupOption === opt.id}
                onPress={() => setPickupOption(opt.id)}
                title={opt.title}
                subtitle={opt.subtitle}
                trailing={opt.trailing}
              />
            ))}

            {pickupOption === "delivery" ? (
              <TextInput
                className="h-14 rounded-2xl border border-white/10 bg-surface px-4 text-body-md text-ink"
                placeholder="Enter delivery address"
                placeholderTextColor="#7A8599"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            ) : null}
          </View>
        </View>

        <View className="gap-3 px-5 pb-2">
          <Text className="text-center text-caption-sm text-ink-sub">
            Exact address shared after booking is confirmed.
          </Text>
          <PrimaryButton
            label="Continue"
            disabled={pickupOption === "delivery" && deliveryAddress.trim().length === 0}
            onPress={() => router.push(Routes.bookingProtection(vehicle.id) as Href)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
