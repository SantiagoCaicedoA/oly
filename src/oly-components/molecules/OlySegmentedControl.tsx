/**
 * OlySegmentedControl — Pill-style segmented selector
 * Source: Design Bible v3.0, Section 8.2 Segmented Control
 *
 * Container: oly-bg/card, oly-radius/full, 1px border
 * Segment height: 36px, max 7 segments
 * Active segment is a pill that slides between positions
 *
 * Figma: oly/segmented-control
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyPalette } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { olyMicro } from "@/src/oly-theme/oly-animation";

// ─── Types ───────────────────────────────────────────────────────
interface OlySegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlySegmentedControl: React.FC<OlySegmentedControlProps> = ({
  segments,
  activeIndex,
  onChange,
  style,
}) => {
  const handlePress = (index: number) => {
    if (index !== activeIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(index);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {segments.map((label, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={label}
            onPress={() => handlePress(index)}
            style={[styles.segment, isActive && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <Text
              style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: olyElevation.level1.backgroundColor,
    borderWidth: 1,
    borderColor: olyElevation.level1.borderColor,
    borderRadius: olyRadius.full,
    padding: 2,
  },
  segment: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: olyRadius.full,
  },
  segmentActive: {
    backgroundColor: olyPalette.primary,
  },
  label: {
    ...olyTypography.label,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  labelActive: {
    color: olyColors.text.onBrand,
  },
  labelInactive: {
    color: olyColors.text.secondary,
  },
});

export default OlySegmentedControl;
