import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/* ── Types ──────────────────────────────────────────── */

interface LiftCard {
  liftName: string;
  weight: number;
  unit?: string;
  rpe?: number;
}

interface CompetitionLiftsProps {
  snatch?: LiftCard;
  cleanAndJerk?: LiftCard;
}

/* ── Component ──────────────────────────────────────── */

export default function CompetitionLifts({
  snatch = { liftName: "Snatch", weight: 120, rpe: 8.5 },
  cleanAndJerk = { liftName: "Clean & Jerk", weight: 150, rpe: 8.5 },
}: CompetitionLiftsProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>COMPETITION LIFTS</Text>
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
    </View>
  );
}

/* ── Lift Card ──────────────────────────────────────── */

function LiftCardView({ lift }: { lift: LiftCard }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      {/* Video thumbnail placeholder */}
      <View style={styles.thumbnail}>
        <View style={styles.playButton}>
          <Ionicons
            name="play"
            size={16}
            color={olyColors.text.primary}
            style={{ marginLeft: 2 }}
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.liftName}>{lift.liftName.toUpperCase()}</Text>
        <Text style={styles.weight}>
          {lift.weight}
          <Text style={styles.unit}> {lift.unit ?? "kg"}</Text>
        </Text>
        {lift.rpe != null && (
          <View style={styles.rpeBadge}>
            <Ionicons
              name="bar-chart"
              size={10}
              color={olyPalette.primary}
            />
            <Text style={styles.rpeText}>{lift.rpe}</Text>
          </View>
        )}
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
    height: 120,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `rgba(0, 0, 0, 0.5)`,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Info */
  info: {
    padding: olySpacing[12],
    gap: olySpacing[4],
  },
  liftName: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  weight: {
    ...olyTypography.title2,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  unit: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  rpeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[8],
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  rpeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
});
