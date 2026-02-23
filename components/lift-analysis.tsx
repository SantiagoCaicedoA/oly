import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
import AnalysisSegment from "./analysis-segment";
type LiftAnalysisProps = {
  barSpeed: string;
  onBarSpeedChange: (v: string) => void;
  positionQuality: string;
  onPositionQualityChange: (v: string) => void;
  primaryLimitingFactor: string | null;
  onPrimaryLimitingFactorChange: (v: string) => void;
};

export default function LiftAnalysis({
  barSpeed,
  onBarSpeedChange,
  positionQuality,
  onPositionQualityChange,
  primaryLimitingFactor,
  onPrimaryLimitingFactorChange,
}: LiftAnalysisProps) {
  const { colors } = useTheme();

  const options = ["Poor", "Acceptable", "Good", "Excellent"];

  const limitingFactorOptions = [
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

  const styles = StyleSheet.create({
    liftAnalysis: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: scale(16),
      borderWidth: scale(0.3),
      borderColor: colors.text,
      paddingHorizontal: scale(15),
      paddingVertical: scale(22),
    },
    subHeading: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },

    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
    optionRow: {
      flexDirection: "row",
      gap: scale(8),
      marginTop: scale(12),
      flexWrap: "wrap",
    },
    option: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(9),
      borderRadius: scale(18),
      backgroundColor: colors.lightBlue,
      borderWidth: scale(1),
      borderColor: colors.primary,
    },
    activeOption: {
      backgroundColor: colors.primary,
    },
    optionText: {
      fontSize: Typography.fontSize.sm,
      color: colors.text,
    },
  });

  return (
    <>
      <Text style={styles.liftAnalysis}>lift analysis</Text>

      <View style={styles.container}>
        <AnalysisSegment
          title="Bar speed"
          value={barSpeed}
          options={options}
          valueTextMap={barSpeedTextMap}
          onChange={onBarSpeedChange}
        />

        <AnalysisSegment
          title="Position Quality"
          value={positionQuality}
          options={options}
          valueTextMap={positionQualityTextMap}
          onChange={onPositionQualityChange}
        />

        {positionQuality === "Poor" && (
          <>
            <Text style={styles.subHeading}>primary limiting factor</Text>
            <View style={styles.optionRow}>
              {limitingFactorOptions.map((opt) => {
                const isActive = primaryLimitingFactor === opt;

                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.option, isActive && styles.activeOption]}
                    activeOpacity={0.8}
                    onPress={() => onPrimaryLimitingFactorChange(opt)}
                  >
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>
    </>
  );
}
