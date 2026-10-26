/**
 * TimeWheel — Quiet hours, design "3. Two wheels" on the canvas.
 *
 * Two columns that glide and settle in 30 minute steps, one soft band across
 * both marking the choice, "to" in the middle. The fade and the size change
 * are driven by the scroll itself on the native thread, so nothing redraws
 * while you scroll and it moves like the iOS picker. Values are minutes
 * after midnight.
 */
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { formatTime } from "@/src/oly-hooks/useNotificationSettings";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";

const ROW = 44;
const VISIBLE = 5;
const LABEL_H = 22;
const STEPS = Array.from({ length: 48 }, (_, i) => i * 30);

function Column({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const index = Math.max(0, STEPS.indexOf(value));
  const y = useRef(new Animated.Value(index * ROW)).current;
  const listRef = useRef<any>(null);
  const lastTick = useRef(index);

  // Keep the wheel on the saved value when it loads or changes elsewhere.
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: index * ROW, animated: false });
    lastTick.current = index;
  }, [index]);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y } } }], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          // A light tick as each step passes the band. No state, no redraw.
          const i = Math.round(e.nativeEvent.contentOffset.y / ROW);
          if (i !== lastTick.current && i >= 0 && i < STEPS.length) {
            lastTick.current = i;
            Haptics.selectionAsync();
          }
        },
      }),
    [y],
  );

  const settle = (offset: number) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, Math.round(offset / ROW)));
    if (STEPS[i] !== value) onChange(STEPS[i]);
  };

  return (
    <View style={s.col}>
      <Text style={s.overline}>{label}</Text>
      <Animated.FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(m: number) => String(m)}
        style={{ height: ROW * VISIBLE }}
        contentContainerStyle={{
          paddingVertical: ROW * Math.floor(VISIBLE / 2),
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate={0.988}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          settle(e.nativeEvent.contentOffset.y)
        }
        getItemLayout={(_: unknown, i: number) => ({
          length: ROW,
          offset: ROW * i,
          index: i,
        })}
        initialScrollIndex={index}
        windowSize={7}
        accessibilityLabel={`${label}, ${formatTime(value)}`}
        renderItem={({ item, index: i }: { item: number; index: number }) => {
          const range = [
            (i - 2) * ROW,
            (i - 1) * ROW,
            i * ROW,
            (i + 1) * ROW,
            (i + 2) * ROW,
          ];
          const opacity = y.interpolate({
            inputRange: range,
            outputRange: [0.15, 0.45, 1, 0.45, 0.15],
            extrapolate: "clamp",
          });
          const scale = y.interpolate({
            inputRange: range,
            outputRange: [0.86, 0.92, 1.14, 0.92, 0.86],
            extrapolate: "clamp",
          });
          return (
            <Animated.View style={[s.row, { opacity, transform: [{ scale }] }]}>
              <Text style={s.item}>{formatTime(item)}</Text>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

export function TimeWheel({
  start,
  end,
  onChange,
}: {
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}) {
  return (
    <View>
      <View style={s.band} pointerEvents="none" />
      <View style={s.cols}>
        <Column
          label="Starts"
          value={start}
          onChange={(v) => onChange(v, end)}
        />
        <View style={s.toWrap} pointerEvents="none">
          <Text style={s.to}>to</Text>
        </View>
        <Column label="Ends" value={end} onChange={(v) => onChange(start, v)} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  cols: { flexDirection: "row" },
  col: { flex: 1 },
  overline: {
    ...olyTypography.caption,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
    textAlign: "center",
    height: LABEL_H,
  },
  row: { height: ROW, alignItems: "center", justifyContent: "center" },
  item: {
    fontFamily: olyFonts.medium,
    fontSize: 19,
    color: olyColors.text.primary,
  },
  band: {
    position: "absolute",
    left: 0,
    right: 0,
    top: LABEL_H + ROW * 2,
    height: ROW,
    borderRadius: olyRadius.lg,
    backgroundColor: olyColors.glass.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: olyColors.glass.raised,
  },
  toWrap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: LABEL_H,
  },
  to: { ...olyTypography.caption, color: olyColors.text.hint },
});
