/**
 * OlySwitch — the on/off switch from the settings designs.
 * Brand blue with a soft glow when on, quiet glass when off.
 */
import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";

const W = 51;
const H = 31;
const KNOB = 27;

export function OlySwitch({
  value,
  onChange,
  disabled,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  const t = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(t, { toValue: value ? 1 : 0, useNativeDriver: false, speed: 20, bounciness: 4 }).start();
  }, [value, t]);

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.selectionAsync();
        onChange(!value);
      }}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View
        style={{
          width: W,
          height: H,
          borderRadius: H / 2,
          padding: 2,
          backgroundColor: t.interpolate({
            inputRange: [0, 1],
            outputRange: [olyColors.glass.bar as string, olyPalette.primary],
          }),
          shadowColor: olyPalette.primary,
          shadowOpacity: value ? 0.5 : 0,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <Animated.View
          style={{
            width: KNOB,
            height: KNOB,
            borderRadius: KNOB / 2,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, W - KNOB - 4] }) }],
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

export default OlySwitch;
