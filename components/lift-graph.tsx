import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/* ── Mock data — will be replaced with real lift history ── */
const MOCK_DATA = [
  { label: "FEB 3", value: 105, isToday: false },
  { label: "FEB 7", value: 110, isToday: false },
  { label: "FEB 12", value: 112, isToday: false },
  { label: "FEB 17", value: 118, isToday: false },
  { label: "TODAY", value: 120, isToday: true },
];

const MAX_BAR_HEIGHT = 60;

interface LiftGraphProps {
  liftName: string;
}

export default function LiftGraph({ liftName }: LiftGraphProps) {
  const maxValue = Math.max(...MOCK_DATA.map((d) => d.value));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>PROGRESSION</Text>

      <View style={styles.card}>
        {/* Bars */}
        <View style={styles.barsRow}>
          {MOCK_DATA.map((item, i) => {
            const barHeight =
              (item.value / maxValue) * MAX_BAR_HEIGHT;

            return (
              <View key={i} style={styles.barCol}>
                <Text
                  style={[
                    styles.barValue,
                    item.isToday && styles.barValueActive,
                  ]}
                >
                  {item.value}
                  <Text style={styles.barUnit}> kg</Text>
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: item.isToday
                          ? olyColors.intensity.high
                          : olyColors.bg.activeHighlight,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    item.isToday && styles.barLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: olyLayout.sectionHeaderGap,
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
  },

  /* Bars */
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: olySpacing[8],
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: olySpacing[4],
  },
  barValue: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  barValueActive: {
    color: olyColors.text.primary,
    fontFamily: olyFonts.medium,
  },
  barUnit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  barTrack: {
    width: "100%",
    height: MAX_BAR_HEIGHT,
    justifyContent: "flex-end",
    borderRadius: olyRadius.sm,
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: olyRadius.sm,
  },
  barLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  barLabelActive: {
    color: olyColors.text.primary,
    fontFamily: olyFonts.medium,
  },
});
