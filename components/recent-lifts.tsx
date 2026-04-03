import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ── Types ──────────────────────────────────────────── */

interface RecentLift {
  liftName: string;
  weight: number;
  unit?: string;
}

interface RecentLiftsProps {
  lifts?: RecentLift[];
  onSeeAll?: () => void;
}

/* ── Placeholder data ───────────────────────────────── */

const DEFAULT_LIFTS: RecentLift[] = [
  { liftName: "Power Snatch", weight: 115 },
  { liftName: "Clean", weight: 140 },
  { liftName: "Back Squat", weight: 180 },
];

/* ── Component ──────────────────────────────────────── */

export default function RecentLifts({
  lifts = DEFAULT_LIFTS,
  onSeeAll,
}: RecentLiftsProps) {
  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>RECENT LIFTS</Text>
        <TouchableOpacity onPress={onSeeAll} hitSlop={olySpacing[8]}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={olyColors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* 3-up grid */}
      <View style={styles.row}>
        {lifts.slice(0, 3).map((lift, index) => (
          <TouchableOpacity
            key={`${lift.liftName}-${index}`}
            style={styles.card}
            activeOpacity={0.7}
          >
            {/* Thumbnail */}
            <View style={styles.thumbnail}>
              <View style={styles.playButton}>
                <Ionicons
                  name="play"
                  size={14}
                  color={olyColors.text.primary}
                  style={{ marginLeft: 1 }}
                />
              </View>
            </View>

            {/* Info */}
            <Text style={styles.weight}>
              {lift.weight}
              <Text style={styles.unit}> {lift.unit ?? "kg"}</Text>
            </Text>
            <Text style={styles.liftName}>{lift.liftName.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const THUMB_HEIGHT = 100;

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
    height: THUMB_HEIGHT,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `rgba(0, 0, 0, 0.5)`,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Info */
  weight: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    paddingHorizontal: olySpacing[12],
    paddingTop: olySpacing[8],
  },
  unit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  liftName: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    paddingHorizontal: olySpacing[12],
    paddingBottom: olySpacing[12],
  },
});
