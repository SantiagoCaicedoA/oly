import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
  const displayLifts = lifts.slice(0, 3);

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>RECENT LIFTS</Text>
        <TouchableOpacity
          onPress={onSeeAll ?? (() => router.push("/athlete/archive"))}
          hitSlop={olySpacing[8]}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={olyColors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Grid — 3 columns, 2 rows */}
      <View style={styles.grid}>
        {displayLifts.map((lift, index) => (
          <TouchableOpacity
            key={`${lift.liftName}-${index}`}
            style={styles.cell}
            activeOpacity={0.85}
          >
            <View style={styles.thumbnail}>
              {/* Gradient bottom */}
              <LinearGradient
                colors={["transparent", olyPalette.black]}
                style={styles.gradient}
              />

              {/* Weight + name overlay */}
              <View style={styles.overlay}>
                <Text style={styles.weight}>
                  {lift.weight}
                  <Text style={styles.unit}> {lift.unit ?? "kg"}</Text>
                </Text>
                <Text style={styles.liftName} numberOfLines={1}>
                  {lift.liftName.toUpperCase()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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

  /* Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[4],
  },
  cell: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: olyRadius.sm,
    overflow: "hidden",
  },

  /* Thumbnail */
  thumbnail: {
    flex: 1,
    backgroundColor: olyPalette.cardElevated,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },

  /* Overlay text */
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: olySpacing[8],
    paddingBottom: olySpacing[8],
  },
  weight: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  unit: {
    ...olyTypography.caption,
    fontFamily: olyFonts.regular,
    color: olyColors.text.secondary,
  },
  liftName: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
});
