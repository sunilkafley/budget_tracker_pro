import React, { useState } from "react";
import { DimensionValue, Pressable, Text, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { SpendingPoint } from "../application/useCases/GetInsightsUseCase";
import { CategoryBreakdown } from "../domain/models/Report";
import { finance, formatMoney } from "./FinanceUI";
import { colors } from "../theme";
const palette = [
  "#8959ED",
  "#15B78C",
  "#F5A329",
  "#2FA1CD",
  "#4D82E5",
  "#DC4D9C",
  "#A786E5",
  "#7C9AA0",
];
export function SpendingBars({ points }: { points: SpendingPoint[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const active =
    selected === null
      ? points.length - 1
      : Math.min(selected, points.length - 1);
  const point = points[active];
  const maximum = Math.max(1, ...points.map((item) => item.amount));
  return (
    <>
      <Text style={[finance.caption, { marginTop: 8, marginBottom: 20 }]}>
        {point
          ? point.start.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }) +
            " – " +
            new Date(point.end.getTime() - 1).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }) +
            ": " +
            formatMoney(point.amount)
          : "No spending in this period."}
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "flex-end",
          height: 160,
        }}
      >
        {points.map((item, index) => (
          <Pressable
            key={item.start.toISOString()}
            accessibilityRole="button"
            accessibilityLabel={
              item.start.toLocaleDateString() + ": " + formatMoney(item.amount)
            }
            accessibilityState={{ selected: active === index }}
            onPress={() => setSelected(index)}
            style={{
              flex: 1,
              height: "100%",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: "100%",
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "#F5F6FA",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: (Math.max(3, (item.amount / maximum) * 100) +
                    "%") as DimensionValue,
                  backgroundColor:
                    active === index ? colors.primary : "#A298F1",
                  borderRadius: 14,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 10,
                color: active === index ? colors.primary : colors.muted,
                fontWeight: active === index ? "700" : "400",
              }}
            >
              {points.length > 5
                ? item.start.toLocaleDateString(undefined, { weekday: "short" })
                : item.start.getDate() + "/" + (item.start.getMonth() + 1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}
export function ExpenseDonut({
  categories,
  total,
}: {
  categories: CategoryBreakdown[];
  total: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedItem = categories.find((item) => item.category === selected);
  const sorted = [...categories].sort((a, b) => b.amount - a.amount);
  let offset = -90;
  return (
    <>
      <View style={{ alignItems: "center", marginVertical: 24 }}>
        <View style={{ width: 236, height: 236 }}>
          <Svg width={236} height={236} viewBox="0 0 236 236">
            <Circle
              cx={118}
              cy={118}
              r={96}
              fill="none"
              stroke={colors.border}
              strokeWidth={25}
            />
            {sorted
              .filter((item) => item.amount > 0)
              .map((item, index) => {
                const angle = total > 0 ? (item.amount / total) * 360 : 0;
                const start = offset;
                offset += angle;
                const end = start + Math.min(angle, 359.999);
                const radians = (value: number) => (value * Math.PI) / 180;
                const arc =
                  "M " +
                  (118 + 96 * Math.cos(radians(start))) +
                  " " +
                  (118 + 96 * Math.sin(radians(start))) +
                  " A 96 96 0 " +
                  (angle > 180 ? "1" : "0") +
                  " 1 " +
                  (118 + 96 * Math.cos(radians(end))) +
                  " " +
                  (118 + 96 * Math.sin(radians(end)));
                return (
                  <Path
                    key={item.category}
                    d={arc}
                    fill="none"
                    stroke={palette[index % palette.length]}
                    strokeWidth={selected === item.category ? 32 : 25}
                    strokeLinecap="butt"
                    opacity={selected && selected !== item.category ? 0.3 : 1}
                    onPress={() =>
                      setSelected(
                        selected === item.category ? null : item.category,
                      )
                    }
                  />
                );
              })}
          </Svg>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              inset: 35,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                fontSize: 11,
                letterSpacing: 1,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              {selectedItem
                ? selectedItem.category.toUpperCase()
                : "TOTAL SPENT"}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                fontSize: 25,
                fontWeight: "800",
                color: colors.text,
                marginTop: 10,
              }}
            >
              {formatMoney(selectedItem?.amount ?? total)}
            </Text>
          </View>
        </View>
      </View>
      {sorted.length === 0 ? (
        <Text style={finance.caption}>No expenses to break down yet.</Text>
      ) : (
        sorted.map((item, index) => (
          <Pressable
            key={item.category}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === item.category }}
            accessibilityLabel={item.category + ", " + formatMoney(item.amount)}
            onPress={() =>
              setSelected(selected === item.category ? null : item.category)
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              minHeight: 54,
              paddingHorizontal: 8,
              borderRadius: 14,
              backgroundColor:
                selected === item.category ? colors.primarySoft : "transparent",
            }}
          >
            <View
              style={{
                width: 11,
                height: 11,
                borderRadius: 6,
                backgroundColor: palette[index % palette.length],
              }}
            />
            <Text style={[finance.title, { flex: 1, fontSize: 14 }]}>
              {item.category}
            </Text>
            <Text style={finance.caption}>
              {total > 0 ? Math.round((item.amount / total) * 100) : 0}%
            </Text>
            <Text style={[finance.title, { fontSize: 14 }]}>
              {formatMoney(item.amount)}
            </Text>
          </Pressable>
        ))
      )}
    </>
  );
}
