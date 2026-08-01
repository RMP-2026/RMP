import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, PressableProps, Text } from "react-native";

cssInterop(LinearGradient, { className: "style" });

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
};

export function PrimaryButton({ label, loading, disabled, fullWidth = true, className, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      className={`h-14 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-teal/40 active:opacity-90 ${
        disabled ? "opacity-40" : ""
      } ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      {...rest}
    >
      <LinearGradient
        colors={["#1AE0A8", "#00B88A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-full w-full items-center justify-center px-6"
      >
        {loading ? (
          <ActivityIndicator color="#080C14" />
        ) : (
          <Text className="text-body-md font-bold text-background">{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({ label, loading, disabled, fullWidth = true, className, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      className={`h-14 items-center justify-center rounded-full border border-white/10 bg-surface-high px-6 active:opacity-80 ${
        disabled ? "opacity-40" : ""
      } ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#F0F4FF" />
      ) : (
        <Text className="text-body-md font-bold text-ink">{label}</Text>
      )}
    </Pressable>
  );
}

export function GhostButton({ label, loading, disabled, fullWidth = false, className, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      className={`h-14 items-center justify-center rounded-full border border-white/10 px-6 active:opacity-70 ${
        disabled ? "opacity-40" : ""
      } ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#F0F4FF" />
      ) : (
        <Text className="text-body-md font-bold text-ink">{label}</Text>
      )}
    </Pressable>
  );
}

export function DestructiveButton({ label, loading, disabled, fullWidth = true, className, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      className={`h-14 items-center justify-center rounded-full bg-danger px-6 active:opacity-80 ${
        disabled ? "opacity-40" : ""
      } ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#F0F4FF" />
      ) : (
        <Text className="text-body-md font-bold text-ink">{label}</Text>
      )}
    </Pressable>
  );
}

export function IconButton({
  children,
  className,
  disabled,
  ...rest
}: PressableProps & { children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`h-10 w-10 items-center justify-center rounded-full bg-black/40 active:opacity-70 ${
        disabled ? "opacity-40" : ""
      } ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
