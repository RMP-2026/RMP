import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { useState } from "react";
import { View } from "react-native";

cssInterop(LinearGradient, { className: "style" });

const REVENUE_TREND = [22, 30, 26, 38, 33, 46, 40, 54, 48, 62, 56, 70, 64, 80, 74, 92, 86, 100];

export function RevenueSparkline({ height = 120 }: { height?: number }) {
  const [width, setWidth] = useState(0);

  const points = REVENUE_TREND.map((value, i) => ({
    x: (i / (REVENUE_TREND.length - 1)) * width,
    y: height - (value / 100) * (height - 16) - 8,
  }));

  return (
    <View
      className="w-full overflow-hidden rounded-xl"
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <LinearGradient
        colors={["rgba(26,224,168,0.28)", "rgba(26,224,168,0)"]}
        className="absolute inset-x-0 bottom-0"
        style={{ height: height * 0.75 }}
      />
      {width > 0 &&
        points.slice(0, -1).map((point, i) => {
          const next = points[i + 1];
          const dx = next.x - point.x;
          const dy = next.y - point.y;
          const length = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                left: point.x,
                top: point.y - 1.25,
                width: length,
                height: 2.5,
                backgroundColor: "#1AE0A8",
                borderRadius: 2,
                transform: [{ rotate: `${angle}rad` }],
                transformOrigin: "left center",
              }}
            />
          );
        })}
    </View>
  );
}
