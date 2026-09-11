/**
 * ProfileRankCard — the profile's competitive hero.
 *
 * Three states, driven by /api/leaderboard/me:
 * - leader   (rank 1, verified): blue-bordered card, SEASON LEADER pill,
 *   big #1, slow light sweep (same grammar as the golden ticket).
 * - ranked   (rank 2+, verified): same layout, quiet — no pill, no sweep.
 * - provisional (onboarding 1RMs only): greyed rank + full-width claim CTA.
 * Renders nothing while there is no rank at all (new user) — the parent
 * shows its own empty CTA in that case.
 */

import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import type { MyRankResponse, SeasonMeta } from "@/types/api/leaderboard";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Me = NonNullable<MyRankResponse["me"]>;

interface ProfileRankCardProps {
  me: Me;
  season: SeasonMeta | null;
  sex: "M" | "F";
  /** Rank-1 sweep + provisional CTA target */
  onClaim: () => void;
  onPress?: () => void;
}

/** Slow crystal sweep across the leader card (reduced-motion friendly: subtle, slow). */
function Sheen() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withDelay(
        2600,
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-160, 420]) },
      { rotate: "18deg" },
    ],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.sheen, style]} />
  );
}

export const ProfileRankCard: React.FC<ProfileRankCardProps> = ({
  me,
  season,
  sex,
  onClaim,
  onPress,
}) => {
  const isLeader = !me.provisional && me.rank === 1;
  const boardLabel = `${sex === "M" ? "Men" : "Women"} ${me.weightClass} kg`;
  const seasonLabel = season?.label ?? "Season";

  if (me.provisional) {
    return (
      <View style={[styles.card, styles.cardProvisional]}>
        <View style={styles.headRow}>
          <Text style={styles.kicker}>RANK</Text>
          <View style={styles.provPill}>
            <Text style={styles.provPillText}>UNCLAIMED</Text>
          </View>
        </View>
        <View style={styles.rankRow}>
          <Text style={[styles.rankBig, styles.rankBigMuted]}>
            <Text style={[styles.rankHash, styles.rankBigMuted]}>#</Text>
            {me.rank}
          </Text>
        </View>
        <Text style={styles.seasonLine}>
          {boardLabel} · {seasonLabel}
        </Text>
        <Text style={styles.proxLine}>Post a video of one lift to claim it</Text>
        <Pressable
          onPress={onClaim}
          style={({ pressed }) => [
            styles.claimBtn,
            pressed && { backgroundColor: olyPalette.primaryPressed },
          ]}
        >
          <Text style={styles.claimBtnText}>CLAIM YOUR SPOT</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isLeader && styles.cardLeader]}
    >
      {isLeader && <Sheen />}
      <View style={styles.headRow}>
        <Text style={styles.kicker}>RANK</Text>
        {isLeader && (
          <View style={styles.leaderPill}>
            <Text style={styles.leaderPillText}>SEASON LEADER</Text>
          </View>
        )}
      </View>
      <Text style={styles.rankBig}>
        <Text style={styles.rankHash}>#</Text>
        {me.rank}
      </Text>
      <Text style={styles.seasonLine}>
        {boardLabel} · {seasonLabel}
      </Text>
      <View style={styles.divider} />
      <View style={styles.proxRow}>
        <Ionicons
          name="stats-chart-outline"
          size={14}
          color={olyColors.text.disabled}
        />
        <Text style={styles.proxLineInline}>
          {me.snatchKg != null && me.cleanKg != null
            ? `Snatch ${me.snatchKg} · C&J ${me.cleanKg} · ${me.value} kg total`
            : `${me.value} kg total`}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olySpacing[16],
    overflow: "hidden",
  },
  cardLeader: {
    backgroundColor: "#12203A",
    borderWidth: 1,
    borderColor: "rgba(0, 74, 173, 0.9)",
    shadowColor: olyPalette.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardProvisional: {},
  sheen: {
    position: "absolute",
    top: -60,
    bottom: -60,
    width: 56,
    backgroundColor: "rgba(226, 232, 240, 0.07)",
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    ...olyTypography.label,
    fontSize: 12,
    lineHeight: 16,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  leaderPill: {
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: "rgba(0, 74, 173, 0.9)",
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4] + 2,
  },
  leaderPillText: {
    ...olyTypography.label,
    fontSize: 12,
    lineHeight: 14,
    color: "#AFC2FF",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  provPill: {
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4] + 2,
  },
  provPillText: {
    ...olyTypography.label,
    fontSize: 12,
    lineHeight: 14,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  rankRow: { flexDirection: "row", alignItems: "flex-end" },
  rankBig: {
    fontSize: 56,
    lineHeight: 60,
    fontFamily: olyTypography.display.fontFamily,
    fontWeight: "500",
    color: olyColors.text.primary,
    marginTop: olySpacing[8],
  },
  rankHash: {
    fontSize: 28,
    color: olyColors.text.disabled,
  },
  rankBigMuted: {
    color: olyColors.text.secondary,
  },
  seasonLine: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[8],
  },
  divider: {
    height: 1,
    backgroundColor: olyColors.border.default,
    marginTop: olySpacing[12],
    marginBottom: olySpacing[12],
  },
  proxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
  },
  proxLineInline: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  proxLine: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[12],
  },
  claimBtn: {
    marginTop: olySpacing[16],
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  claimBtnText: {
    ...olyTypography.label,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
});
