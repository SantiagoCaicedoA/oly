import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

/* ── Component ──────────────────────────────────────── */

export default function RecentInsight() {
  return (
    <View style={styles.section}>
      {/* ─────────── Feeling vs Performance ─────────── */}
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.cardTitle}>Feeling vs Performance</Text>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: olyPalette.primary }]} />
            <Text style={styles.legendText}>SNATCH</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: olyColors.text.disabled }]} />
            <Text style={styles.legendText}>CLEAN & JERK</Text>
          </View>
        </View>

        {/* Graph — mock curves */}
        <View style={styles.graphArea}>
          <View style={[styles.graphGridLine, { top: 0 }]} />
          <View style={[styles.graphGridLine, { top: "50%" }]} />
          <View style={[styles.graphGridLine, { bottom: 0 }]} />
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 300 100"
            preserveAspectRatio="none"
            style={StyleSheet.absoluteFillObject}
          >
            <Path
              d="M0,65 C50,60 100,30 150,20 C200,10 250,45 300,40"
              stroke={olyPalette.primary}
              strokeWidth={2.5}
              fill="none"
            />
            <Path
              d="M0,55 C50,50 100,50 150,45 C200,40 250,50 300,48"
              stroke={olyColors.text.disabled}
              strokeWidth={2}
              fill="none"
            />
          </Svg>
        </View>

        {/* Insight */}
        <Text style={styles.insightText}>
          Your <Text style={styles.bold}>best sessions</Text> happen
          when energy is <Text style={styles.bold}>high</Text> and stress
          is <Text style={styles.bold}>low</Text> — typically after rest days
        </Text>
      </View>

      {/* ─────────── Snatch : Clean & Jerk Ratio ─────────── */}
      <View style={styles.card}>
        {/* Label */}
        <Text style={styles.ratioLabel}>SNATCH : CLEAN & JERK RATIO</Text>

        {/* Hero */}
        <View style={styles.heroRow}>
          <Text style={styles.heroNumber}>80</Text>
          <Text style={styles.heroUnit}>%</Text>
        </View>

        {/* Lifts — subdued, supporting data */}
        <View style={styles.liftsRow}>
          <View style={styles.liftItem}>
            <Text style={styles.liftValue}>120<Text style={styles.liftUnit}> kg</Text></Text>
            <Text style={styles.liftName}>SNATCH</Text>
          </View>
          <View style={styles.liftDivider} />
          <View style={styles.liftItem}>
            <Text style={styles.liftValue}>150<Text style={styles.liftUnit}> kg</Text></Text>
            <Text style={styles.liftName}>CLEAN & JERK</Text>
          </View>
        </View>

        {/* Bar — muted track, blue fill, dot marker */}
        <View style={styles.barBlock}>
          <View style={styles.barTrack}>
            <View style={styles.barFill} />
            <View style={styles.barDot} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barEndpoint}>70%</Text>
            <Text style={styles.barIdeal}>Ideal 78–82%</Text>
            <Text style={styles.barEndpoint}>90%</Text>
          </View>
        </View>

        {/* Callout */}
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            <Text style={styles.bold}>Balanced lifter. </Text>
            Ratio sits in the ideal range — both lifts are progressing proportionally.
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* Section */
  section: {
    gap: olySpacing[12],
  },

  /* Shared card */
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    gap: olySpacing[16],
  },

  /* ── Graph Card ── */
  cardTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  legendRow: {
    flexDirection: "row",
    gap: olySpacing[16],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  graphArea: {
    height: 100,
    justifyContent: "center",
  },
  graphGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: olyColors.text.disabled,
  },
  insightText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
  },

  /* ── Ratio Card ── */
  ratioLabel: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  heroNumber: {
    fontSize: 56,
    lineHeight: 64,
    fontFamily: olyFonts.medium,
    fontWeight: "500",
    color: olyColors.text.primary,
  },
  heroUnit: {
    ...olyTypography.title2,
    color: olyColors.text.secondary,
    marginLeft: olySpacing[4],
  },

  /* Lifts */
  liftsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  liftItem: {
    flex: 1,
    alignItems: "center",
    gap: olySpacing[4],
  },
  liftValue: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  liftUnit: {
    ...olyTypography.caption,
    fontFamily: olyFonts.regular,
    color: olyColors.text.secondary,
  },
  liftName: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  liftDivider: {
    width: 1,
    height: 28,
    backgroundColor: olyColors.border.default,
  },

  /* Bar */
  barBlock: {
    gap: olySpacing[4],
  },
  barTrack: {
    height: olySpacing[4],
    borderRadius: olySpacing[4] / 2,
    backgroundColor: olyColors.border.default,
    position: "relative",
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "50%",
    height: olySpacing[4],
    borderRadius: olySpacing[4] / 2,
    backgroundColor: olyPalette.primary,
  },
  barDot: {
    position: "absolute",
    left: "50%",
    marginLeft: -olySpacing[4],
    top: -olySpacing[4],
    width: olySpacing[12],
    height: olySpacing[12],
    borderRadius: olySpacing[12] / 2,
    backgroundColor: olyPalette.primary,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barEndpoint: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
  barIdeal: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  /* Callout */
  callout: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.lg,
    padding: olySpacing[12],
  },
  calloutText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
  },

  /* Shared */
  bold: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
});
