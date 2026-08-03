import { useState } from "react";
import { PanResponder, Text, View } from "react-native";

const THUMB_SIZE = 22;

export function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: { min: number; max: number }) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);

  const toX = (value: number) => {
    if (trackWidth === 0) return 0;
    return ((value - min) / (max - min)) * trackWidth;
  };

  const toValue = (x: number) => {
    const ratio = Math.min(1, Math.max(0, x / trackWidth));
    return Math.round(min + ratio * (max - min));
  };

  const makeResponder = (thumb: "min" | "max") => {
    let startValue = thumb === "min" ? valueMin : valueMax;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startValue = thumb === "min" ? valueMin : valueMax;
      },
      onPanResponderMove: (_evt, gesture) => {
        const base = toX(startValue);
        const x = base + gesture.dx;
        const next = toValue(x);
        if (thumb === "min") {
          onChange({ min: Math.min(next, valueMax), max: valueMax });
        } else {
          onChange({ min: valueMin, max: Math.max(next, valueMin) });
        }
      },
    });
  };

  const minResponder = makeResponder("min");
  const maxResponder = makeResponder("max");

  return (
    <View>
      <View className="mb-2 flex-row justify-between">
        <Text className="text-body-md font-bold text-ink">${valueMin}</Text>
        <Text className="text-body-md font-bold text-ink">{valueMax >= max ? `$${max}+` : `$${valueMax}`}</Text>
      </View>
      <View
        className="h-8 justify-center"
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width - THUMB_SIZE)}
      >
        <View className="h-1.5 rounded-full bg-white/10" />
        <View
          className="absolute h-1.5 rounded-full bg-teal"
          style={{ left: toX(valueMin), width: Math.max(0, toX(valueMax) - toX(valueMin)) }}
        />
        <View
          {...minResponder.panHandlers}
          className="absolute h-[22px] w-[22px] rounded-full border-2 border-background bg-teal"
          style={{ left: toX(valueMin) }}
        />
        <View
          {...maxResponder.panHandlers}
          className="absolute h-[22px] w-[22px] rounded-full border-2 border-background bg-teal"
          style={{ left: toX(valueMax) }}
        />
      </View>
    </View>
  );
}
