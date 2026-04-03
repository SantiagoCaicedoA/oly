import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import AnalysisSegment from "./analysis-segment";

const FAIL_OPTIONS = ["Pull", "Turnover", "Catch / overhead"];
const MISSED_OPTIONS = ["In front", "Behind", "Left", "Right"];
const WHERE_OPTIONS = [
  "Shoulder",
  "Elbow",
  "Wrist",
  "Back",
  "Hip",
  "Knee",
  "Ankle",
  "Other",
];

interface MissAndPainProps {
  wasMiss: boolean;
  onWasMissChange: (value: boolean) => void;
  failLocation: string;
  onFailLocationChange: (value: string) => void;
  missedWhere: string;
  onMissedWhereChange: (value: string) => void;
  painLevel: string;
  onPainLevelChange: (value: string) => void;
  painLevelTextMap: Record<string, string>;
  wasPain: boolean;
  onWasPainChange: (value: boolean) => void;
  wherePain: string;
  onWherePainChange: (value: string) => void;
}

export default function MissAndPain({
  wasMiss,
  onWasMissChange,
  failLocation,
  onFailLocationChange,
  missedWhere,
  onMissedWhereChange,
  onPainLevelChange,
  painLevelTextMap,
  painLevel,
  wasPain,
  onWasPainChange,
  wherePain,
  onWherePainChange,
}: MissAndPainProps) {
  return (
    <View style={styles.wrapper}>
      {/* Missed Lift toggle card */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Missed Lift</Text>
          <Text style={styles.toggleDesc}>Mark if you did not complete the lift</Text>
        </View>
        <Switch
          value={wasMiss}
          onValueChange={onWasMissChange}
          trackColor={{
            false: olyColors.border.default,
            true: olyPalette.primary,
          }}
          thumbColor={olyPalette.white}
        />
      </View>

      {/* Miss details (expanded) */}
      {wasMiss && (
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>WHERE DID IT FAIL?</Text>
          <View style={styles.chipsRow}>
            {FAIL_OPTIONS.map((opt) => {
              const isSelected = failLocation === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => onFailLocationChange(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.detailLabel}>MISSED WHERE?</Text>
          <View style={styles.chipsRow}>
            {MISSED_OPTIONS.map((opt) => {
              const isSelected = missedWhere === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => onMissedWhereChange(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive,
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

      {/* Pain / Discomfort toggle card */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Pain / Discomfort</Text>
          <Text style={styles.toggleDesc}>Flag for coach review</Text>
        </View>
        <Switch
          value={wasPain}
          onValueChange={onWasPainChange}
          trackColor={{
            false: olyColors.border.default,
            true: olyPalette.primary,
          }}
          thumbColor={olyPalette.white}
        />
      </View>

      {/* Pain details (expanded) */}
      {wasPain && (
        <View style={styles.detailCard}>
          <AnalysisSegment
            title="Pain Level"
            value={painLevel}
            options={["None", "Minor", "Moderate", "Sharp"]}
            valueTextMap={painLevelTextMap}
            onChange={onPainLevelChange}
          />

          <Text style={styles.detailLabel}>WHERE?</Text>
          <View style={styles.chipsRow}>
            {WHERE_OPTIONS.map((opt) => {
              const isSelected = wherePain === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => onWherePainChange(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive,
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: olySpacing[12],
  },

  /* Toggle cards */
  toggleCard: {
    ...olyElevation.level1,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: olySpacing[12],
  },
  toggleInfo: {
    flex: 1,
    gap: olySpacing[4],
  },
  toggleTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  toggleDesc: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Detail expansion */
  detailCard: {
    ...olyElevation.level1,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    gap: olySpacing[12],
  },
  detailLabel: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Chips */
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
