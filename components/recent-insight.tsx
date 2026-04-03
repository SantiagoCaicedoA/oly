import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

/* ── Component ──────────────────────────────────────── */

export default function RecentInsight() {
  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>RECENT INSIGHT</Text>
        <TouchableOpacity hitSlop={olySpacing[8]}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={olyColors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* ─────────── Feeling vs Performance ─────────── */}
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>Feeling vs Performance</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={olyColors.text.secondary}
          />
        </View>

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

        {/* Graph — mock curves, will be replaced with live data */}
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
            {/* Snatch — brand blue */}
            <Path
              d="M0,65 C50,60 100,30 150,20 C200,10 250,45 300,40"
              stroke={olyPalette.primary}
              strokeWidth={2.5}
              fill="none"
            />
            {/* Clean & Jerk — muted white */}
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
          Your <Text style={styles.textBold}>best performance</Text> sessions
          correlate with <Text style={styles.textBold}>moderate RPE</Text> during
          de-load phase
        </Text>
      </TouchableOpacity>

      {/* ─────────── Snatch : Clean & Jerk Ratio ─────────── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>SNATCH : CLEAN & JERK RATIO</Text>

        {/* Hero number */}
        <View style={styles.heroRow}>
          <Text style={styles.heroNumber}>80</Text>
          <Text style={styles.heroUnit}>%</Text>
        </View>

        {/* Lift comparison */}
        <View style={styles.compareRow}>
          <View style={styles.compareItem}>
            <View style={styles.compareValueRow}>
              <Text style={styles.compareNumber}>120</Text>
              <Text style={styles.compareUnit}>kg</Text>
            </View>
            <Text style={styles.compareLabel}>SNATCH</Text>
          </View>

          <View style={styles.compareDivider} />

          <View style={styles.compareItem}>
            <View style={styles.compareValueRow}>
              <Text style={styles.compareNumber}>150</Text>
              <Text style={styles.compareUnit}>kg</Text>
            </View>
            <Text style={styles.compareLabel}>CLEAN & JERK</Text>
          </View>
        </View>

        {/* Ratio bar */}
        <View style={styles.barSection}>
          <View style={styles.barTrack}>
            <View style={styles.barFill} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>70%</Text>
            <Text style={styles.barLabelIdeal}>Ideal 78–82%</Text>
            <Text style={styles.barLabel}>90%</Text>
          </View>
        </View>

        {/* Coach callout */}
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            <Text style={styles.calloutBold}>Balanced lifter. </Text>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Shared card */
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    gap: olySpacing[16],
  },

  /* ── Graph Card ── */
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  textBold: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },

  /* ── Ratio Card ── */
  cardLabel: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginVertical: -olySpacing[4],
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
    marginLeft: 2,
  },

  /* Compare */
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  compareItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  compareValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[4],
  },
  compareNumber: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  compareUnit: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  compareLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  compareDivider: {
    width: 1,
    height: 36,
    backgroundColor: olyColors.border.default,
  },

  /* Bar */
  barSection: {
    gap: olySpacing[4],
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: olyColors.border.default,
  },
  barFill: {
    width: "50%",
    height: 4,
    borderRadius: 2,
    backgroundColor: olyPalette.primary,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  barLabelIdeal: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
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
  calloutBold: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
});
