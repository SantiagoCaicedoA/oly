/**
 * OlyStatDisplay — Number + unit + label display
 * Source: Design Bible v3.0, Section 8.2 Stat Display
 *
 * Hero variant: oly-display (32px) — weight on bar, PRs
 * Standard variant: oly-number (20px) — set data, percentages
 *
 * Figma: oly/stat-display/hero
 */

import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import {
  olyTypography,
  olyLetterSpacing,
  olyMaxFontScale,
} from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────
interface OlyStatDisplayProps {
  value: string | number;
  /** Unit shown next to value (ALL-CAPS) */
  unit?: string;
  /** Label below the number */
  label?: string;
  variant?: "hero" | "standard";
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyStatDisplay: React.FC<OlyStatDisplayProps> = ({
  value,
  unit,
  label,
  variant = "standard",
  style,
}) => {
  const isHero = variant === "hero";

  return (
    <View style={[styles.container, style]}>
      <View style={styles.valueRow}>
        <Text
          style={isHero ? styles.heroValue : styles.standardValue}
          maxFontSizeMultiplier={isHero ? olyMaxFontScale.display : olyMaxFontScale.number}
        >
          {value}
        </Text>
        {unit ? (
          <Text
            style={styles.unit}
            maxFontSizeMultiplier={olyMaxFontScale.caption}
          >
            {unit.toUpperCase()}
          </Text>
        ) : null}
      </View>
      {label ? (
        <Text
          style={styles.label}
          maxFontSizeMultiplier={olyMaxFontScale.bodySmall}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[4],
  },
  heroValue: {
    ...olyTypography.display,
    color: olyColors.text.primary,
  },
  standardValue: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  unit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  label: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
});

export default OlyStatDisplay;
