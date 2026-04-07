import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/* ── Types ──────────────────────────────────────────── */

interface LiftData {
  liftName: string;
  weight: number;
  unit?: string;
  delta?: number;
}

interface CompetitionLiftsProps {
  snatch?: LiftData;
  cleanAndJerk?: LiftData;
}

/* ── Component ──────────────────────────────────────── */

export default function CompetitionLifts({
  snatch = { liftName: "Snatch", weight: 120, delta: 5 },
  cleanAndJerk = { liftName: "Clean & Jerk", weight: 150, delta: 3 },
}: CompetitionLiftsProps) {
  const total = snatch.weight + cleanAndJerk.weight;
  const unit = snatch.unit ?? "kg";

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>CLASSIC LIFTS</Text>
        <TouchableOpacity hitSlop={olySpacing[8]}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={olyColors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <LiftCardView lift={snatch} />
        <LiftCardView lift={cleanAndJerk} />
      </View>

      {/* ── Total ── */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>
          {total}
          <Text style={styles.totalUnit}> {unit}</Text>
        </Text>
      </View>
    </View>
  );
}

/* ── Lift Card ──────────────────────────────────────── */

function LiftCardView({ lift }: { lift: LiftData }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      {/* Video area */}
      <View style={styles.thumbnail}>
        {/* Play icon — centered, subtle */}
        <View style={styles.playButton}>
          <Ionicons
            name="play"
            size={14}
            color={olyColors.text.primary}
            style={{ marginLeft: 2 }}
          />
        </View>

        {/* Gradient fade at bottom */}
        <LinearGradient
          colors={["transparent", olyPalette.card]}
          style={styles.gradient}
        />

        {/* Delta badge — top right */}
        {lift.delta != null && lift.delta > 0 && (
          <View style={styles.deltaBadge}>
            <Text style={styles.deltaText}>+{lift.delta}</Text>
          </View>
        )}
      </View>

      {/* Info — overlaps gradient */}
      <View style={styles.info}>
        <Text style={styles.liftName}>{lift.liftName.toUpperCase()}</Text>
        <Text style={styles.weight}>
          {lift.weight}
          <Text style={styles.unit}> {lift.unit ?? "kg"}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
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
  row: {
    flexDirection: "row",
    gap: olySpacing[8],
  },

  /* Card */
  card: {
    flex: 1,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },

  /* Thumbnail */
  thumbnail: {
    height: 160,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: olySpacing[32],
    height: olySpacing[32],
    borderRadius: olySpacing[32] / 2,
    backgroundColor: olyColors.bg.subtleHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: olySpacing[40],
  },

  /* Delta badge — floating top-right */
  deltaBadge: {
    position: "absolute",
    top: olySpacing[8],
    right: olySpacing[8],
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[8],
    paddingVertical: olySpacing[4],
  },
  deltaText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },

  /* Info */
  info: {
    paddingHorizontal: olySpacing[12],
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
    gap: olySpacing[4],
  },
  liftName: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  weight: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
  },
  unit: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.regular,
    color: olyColors.text.secondary,
  },

  /* Total */
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olyLayout.cardPadding,
    paddingVertical: olySpacing[12],
  },
  totalLabel: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  totalValue: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  totalUnit: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.regular,
    color: olyColors.text.secondary,
  },
});
