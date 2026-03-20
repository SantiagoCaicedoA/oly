/**
 * OlyQualityRatingBar — 4-segment quality selector
 * Source: Design Bible v3.0, Section 8.2 Quality Rating Bar
 *
 * For bar speed and position quality in lift analysis
 * 4 segments: Poor / Acceptable / Good / Excellent
 * Height: 36px per segment
 * Container: oly-radius/full
 *
 * Figma: oly/quality-rating-bar
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyPalette } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyMaxFontScale } from "@/src/oly-theme/oly-typography";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";

// ─── Types ───────────────────────────────────────────────────────
interface OlyQualityRatingBarProps {
  options: string[];
  selectedIndex: number | null;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyQualityRatingBar: React.FC<OlyQualityRatingBarProps> = ({
  options,
  selectedIndex,
  onChange,
  style,
}) => {
  const handlePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(index);
  };

  return (
    <View style={[styles.container, style]}>
      {options.map((label, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={label}
            onPress={() => handlePress(index)}
            style={[
              styles.segment,
              isSelected ? styles.segmentSelected : styles.segmentUnselected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={label}
          >
            <Text
              style={[
                styles.label,
                isSelected ? styles.labelSelected : styles.labelUnselected,
              ]}
              maxFontSizeMultiplier={olyMaxFontScale.bodySmall}
            >
              {label}
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
    borderRadius: olyRadius.full,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: olyColors.border.brand,
  },
  segment: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentSelected: {
    backgroundColor: olyPalette.primary,
  },
  segmentUnselected: {
    backgroundColor: olyColors.bg.cardUnselected,
  },
  label: {
    ...olyTypography.bodySmall,
  },
  labelSelected: {
    color: olyColors.text.onBrand,
  },
  labelUnselected: {
    color: olyColors.text.primary,
  },
});

export default OlyQualityRatingBar;
