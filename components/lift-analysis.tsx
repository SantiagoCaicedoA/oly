import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AnalysisSegment from "./analysis-segment";

type LiftAnalysisProps = {
  barSpeed: string;
  onBarSpeedChange: (v: string) => void;
  positionQuality: string;
  onPositionQualityChange: (v: string) => void;
  primaryLimitingFactor: string | null;
  onPrimaryLimitingFactorChange: (v: string) => void;
};

const QUALITY_OPTIONS = ["Poor", "Acceptable", "Good", "Excellent"];

const LIMITING_FACTOR_OPTIONS = [
  "Legs",
  "Back",
  "Speed",
  "Overhead",
  "Position",
  "Timing",
];

const barSpeedTextMap: Record<string, string> = {
  Poor: "Too slow",
  Acceptable: "Slightly slow",
  Good: "Fast enough",
  Excellent: "Very explosive",
};

const positionQualityTextMap: Record<string, string> = {
  Poor: "Lost positions",
  Acceptable: "Minor breakdown",
  Good: "Positions held",
  Excellent: "Positions locked",
};

export default function LiftAnalysis({
  barSpeed,
  onBarSpeedChange,
  positionQuality,
  onPositionQualityChange,
  primaryLimitingFactor,
  onPrimaryLimitingFactorChange,
}: LiftAnalysisProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>LIFT ANALYSIS</Text>

      <View style={styles.card}>
        <AnalysisSegment
          title="Bar Speed"
          value={barSpeed}
          options={QUALITY_OPTIONS}
          valueTextMap={barSpeedTextMap}
          onChange={onBarSpeedChange}
        />

        <AnalysisSegment
          title="Position Quality"
          value={positionQuality}
          options={QUALITY_OPTIONS}
          valueTextMap={positionQualityTextMap}
          onChange={onPositionQualityChange}
        />

        {positionQuality === "Poor" && (
          <View style={styles.factorSection}>
            <Text style={styles.factorLabel}>PRIMARY LIMITING FACTOR</Text>
            <View style={styles.chipsRow}>
              {LIMITING_FACTOR_OPTIONS.map((opt) => {
                const isActive = primaryLimitingFactor === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, isActive && styles.chipActive]}
                    activeOpacity={0.7}
                    onPress={() => onPrimaryLimitingFactorChange(opt)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: olySpacing[8],
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  card: {
    ...olyElevation.level1,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    paddingVertical: olySpacing[20],
  },

  /* Limiting factor */
  factorSection: {
    gap: olySpacing[12],
    paddingTop: olySpacing[4],
  },
  factorLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  chip: {
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[8],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    backgroundColor: olyColors.bg.activeHighlight,
  },
  chipActive: {
    backgroundColor: olyColors.bg.cardSelected,
    borderColor: olyColors.border.brand,
  },
  chipText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  chipTextActive: {
    color: olyColors.text.primary,
  },
});
