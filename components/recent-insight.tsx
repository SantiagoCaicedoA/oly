import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

/* ── Gauge helpers ─────────────────────────────────── */

const GAUGE_SIZE = 180;
const GAUGE_STROKE = 8;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;

/** Build a semicircle arc path from `startPct` (0-1) to `endPct` (0-1). */
function gaugeArc(r: number, startPct: number, endPct: number): string {
  const cx = GAUGE_SIZE / 2;
  const cy = GAUGE_SIZE / 2;
  const startAngle = Math.PI + startPct * Math.PI;
  const endAngle = Math.PI + endPct * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endPct - startPct > 0.5 ? 1 : 0;
  return `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`;
}

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
        {/* Gauge + hero number */}
        <View style={styles.gaugeContainer}>
          <Svg width={GAUGE_SIZE} height={GAUGE_SIZE / 2 + 8} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE / 2 + 8}`}>
            {/* Track arc (background) */}
            <Path
              d={gaugeArc(GAUGE_RADIUS, 0, 1)}
              stroke={olyColors.border.default}
              strokeWidth={GAUGE_STROKE}
              fill="none"
              strokeLinecap="round"
            />
            {/* Ideal zone arc (78-82% mapped to 0-1 on 70-90% range) */}
            <Path
              d={gaugeArc(GAUGE_RADIUS, (78 - 70) / 20, (82 - 70) / 20)}
              stroke={olyPalette.primary}
              strokeWidth={GAUGE_STROKE}
              fill="none"
              strokeLinecap="round"
              opacity={0.35}
            />
            {/* Marker dot at 80% position: (80-70)/20 = 0.5 */}
            {(() => {
              const angle = Math.PI + 0.5 * Math.PI;
              const cx = GAUGE_SIZE / 2 + GAUGE_RADIUS * Math.cos(angle);
              const cy = GAUGE_SIZE / 2 + GAUGE_RADIUS * Math.sin(angle);
              return (
                <Path
                  d={`M${cx - 5},${cy} a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0`}
                  fill={olyPalette.primary}
                />
              );
            })()}
          </Svg>

          {/* Hero number overlaid at bottom center of arc */}
          <View style={styles.heroOverlay}>
            <View style={styles.heroRow}>
              <Text style={styles.heroNumber}>80</Text>
              <Text style={styles.heroUnit}>%</Text>
            </View>
          </View>
        </View>

        {/* Lift breakdown — compact */}
        <View style={styles.liftRow}>
          <Text style={styles.liftText}>
            <Text style={styles.liftValue}>120 kg </Text>
            <Text style={styles.liftLabel}>SN</Text>
          </Text>
          <Text style={styles.liftDivider}>/</Text>
          <Text style={styles.liftText}>
            <Text style={styles.liftValue}>150 kg </Text>
            <Text style={styles.liftLabel}>C&J</Text>
          </Text>
        </View>

        {/* Coach callout */}
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            <Text style={styles.calloutBold}>Balanced lifter. </Text>
            Your ratio is in the ideal 78–82% range — both lifts are progressing proportionally.
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

  /* ── Ratio Card — Gauge ── */
  gaugeContainer: {
    alignItems: "center",
    marginTop: -olySpacing[4],
    marginBottom: -olySpacing[8],
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  heroNumber: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: olyFonts.medium,
    fontWeight: "500",
    color: olyColors.text.primary,
  },
  heroUnit: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginLeft: 2,
  },

  /* Lift row — compact inline */
  liftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
  },
  liftText: {
    flexDirection: "row",
  },
  liftValue: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  liftLabel: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  liftDivider: {
    ...olyTypography.bodySmall,
    color: olyColors.text.disabled,
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
