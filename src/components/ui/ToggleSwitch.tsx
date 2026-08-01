import { Switch } from "react-native";

export function ToggleSwitch({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: "#141B28", true: "#0DBB8A" }}
      thumbColor="#F0F4FF"
      ios_backgroundColor="#141B28"
    />
  );
}
