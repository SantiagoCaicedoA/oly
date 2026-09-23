/**
 * ProfileRankCard — the competitive hero.
 *
 * One component, two sizes, three states.
 *
 * States, driven by /api/leaderboard/me:
 *  - leader      rank 1, verified. Blue hairline, filled SEASON LEADER
 *                pill, and a slow light sweep.
 *  - ranked      rank 2+, verified. The same card, quiet. No hairline,
 *                no pill, no sweep.
 *  - provisional onboarding 1RMs only. Muted numeral and a claim CTA.
 * Renders nothing when there is no rank at all; the parent shows its
 * own empty state.
 *
 * Sizes:
 *  - full     the profile screen. Numeral at `hero`, divider, lifts line.
 *  - compact  the home feed, above the first post. Numeral at `display`,
 *             no divider, no lifts line. Same card, a third of the height.
 *
 * Two defects this replaced, both measured rather than guessed:
 *  - the hairline was rgba(0, 74, 173, 0.9), which composites to #1B4398
 *    and reads 1.43:1 on the card. A border carrying meaning needs 3:1.
 *  - the card filled with surface.leader #12203A, which is 1.08:1 against
 *    the page. As a surface it was not there, so an invisible shape was
 *    being outlined by an invisible line. The card now uses the ordinary
 *    card colour and belongs to the same family as every post.
 */

import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import type { MyRankResponse, SeasonMeta } from "@/types/api/leaderboard";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Me = NonNullable<MyRankResponse["me"]>;

/** Whole days until the season closes, or null when there is no date. */
function daysLeft(season: SeasonMeta | null): number | null {
  if (!season?.endsAt) return null;
  const ms = new Date(season.endsAt).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

interface ProfileRankCardProps {
  me: Me;
  season: SeasonMeta | null;
  sex: "M" | "F";
  /** Provisional CTA target. */
  onClaim: () => void;
  onPress?: () => void;
  /** Home feed size. Drops the divider and the lifts line. */
  compact?: boolean;
}

/** Band width. Wide, because light has no edges. */
const SWEEP_W = 150;
/** Time to cross the card. */
const SWEEP_MS = 2200;
/** Time spent off the card between passes. */
const SWEEP_REST_MS = 4200;

/**
 * The light sweep across the leader card.
 *
 * A gradient, not a block. A hard edged rectangle at 7% reads as a grey
 * bar sliding past, which is what it was. Light has no edges, so the band
 * is wide, its brightest point is a thin core, and both sides fall off to
 * nothing. It travels slowly and rests between passes.
 *
 * Reduce Motion is non-negotiable in this system, so it renders nothing
 * at all rather than animating more gently.
 *
 * Two things here are load bearing, and both were wrong first time.
 *
 * The sequence resets to 0 before every pass. `withRepeat` re-runs an
 * animation from wherever the value currently sits, so a sequence that
 * only ever animates TO 1 moves on its first pass and then, already at 1,
 * sits still for good. It swept once and looked broken after that.
 *
 * The card's width lives in a shared value, not React state. Held in
 * state it re-renders the card on every layout pass, which remounts this
 * component and restarts the animation mid-travel. A shared value is read
 * on the UI thread and changes nothing above it.
 */
function Sheen({ width }: { width: SharedValue<number> }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(t);
      return;
    }
    t.value = withRepeat(
      withSequence(
        /* Back to the start, instantly and off the card. */
        withTiming(0, { duration: 0 }),
        withDelay(
          SWEEP_REST_MS,
          withTiming(1, {
            duration: SWEEP_MS,
            /* Gentler than a cubic in-out, which visibly hangs at each
               end. Eases in, holds its pace across the face of the card,
               eases out. */
            easing: Easing.bezier(0.42, 0.0, 0.38, 1.0),
          }),
        ),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(t);
  }, [t, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: width.value > 0 ? 1 : 0,
    transform: [
      {
        translateX: interpolate(
          t.value,
          [0, 1],
          [-SWEEP_W, width.value + SWEEP_W],
        ),
      },
      { rotate: "16deg" },
    ],
  }));

  if (reduced) return null;

  return (
    <Animated.View
      pointerEvents="none"
      /* The band is one flat layer moving over a clipped, rounded parent.
         Promoting it keeps the compositor from re-rasterising the
         gradient on every frame. */
      shouldRasterizeIOS
      renderToHardwareTextureAndroid
      style={[styles.sheen, style]}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        /* Soft shoulders, a narrow bright core. Nothing steps. */
        colors={[
          "rgba(226,232,240,0)",
          "rgba(226,232,240,0.025)",
          "rgba(226,232,240,0.07)",
          "rgba(226,232,240,0.115)",
          "rgba(226,232,240,0.07)",
          "rgba(226,232,240,0.025)",
          "rgba(226,232,240,0)",
        ]}
        locations={[0, 0.22, 0.4, 0.5, 0.6, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export const ProfileRankCard: React.FC<ProfileRankCardProps> = ({
  me,
  season,
  sex,
  onClaim,
  onPress,
  compact = false,
}) => {
  const cardW = useSharedValue(0);
  const isLeader = !me.provisional && me.rank === 1;
  const boardLabel = `${sex === "M" ? "Men" : "Women"} ${me.weightClass} kg`;
  const seasonLabel = season?.label ?? "Season";

  const numeral = styles.rankFull;
  const hash = styles.hashFull;
  const pad = null;

  /**
   * The feed card is a different layout, not a smaller one.
   *
   * Shrinking the profile hero gives you three stacked rows in a box two
   * thirds the height, which reads as a hero that lost an argument. Above
   * a feed it has to be a strip. So the kicker carries the state instead
   * of a pill, the rank and the board label share one baseline, and the
   * countdown takes the right edge. Two lines, one row, no pill.
   */
  if (compact) {
    const days = daysLeft(season);
    const kicker = me.provisional
      ? "UNCLAIMED"
      : isLeader
        ? "SEASON LEADER"
        : "YOUR STANDING";

    return (
      <Pressable
        onPress={me.provisional ? onClaim : onPress}
        onLayout={(e) => {
          cardW.value = e.nativeEvent.layout.width;
        }}
        accessibilityRole="button"
        accessibilityLabel={
          `${kicker}. Rank ${me.rank}, ${boardLabel}.` +
          (days != null ? ` ${days} days left in ${seasonLabel}.` : "")
        }
        /* No hairline on the compact card. On the feed it was the only
           bordered surface on the screen and read as something that had
           wandered in from elsewhere. The kicker and the sweep carry the
           leader state; matching the posts is what makes it belong. */
        style={[styles.card, styles.cardCompact]}
      >
        {isLeader && <Sheen width={cardW} />}

        <View style={styles.cRow}>
          <View style={styles.cLeft}>
            <Text
              style={[styles.cKicker, isLeader && styles.cKickerLeader]}
              numberOfLines={1}
            >
              {kicker}
            </Text>
            <View style={styles.cLine}>
              <Text style={[styles.cRank, me.provisional && styles.rankMuted]}>
                <Text
                  style={[styles.cHash, me.provisional && styles.rankMuted]}
                >
                  #
                </Text>
                {me.rank}
              </Text>
              <Text style={styles.cBoard} numberOfLines={1}>
                {boardLabel}
              </Text>
            </View>
          </View>

          {days != null && (
            <View style={styles.cDays}>
              <Text style={styles.cDaysNum}>{days}</Text>
              <Text style={styles.cDaysLabel}>
                {days === 1 ? "DAY" : "DAYS"}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  const head = (
    <View style={styles.headRow}>
      <Text style={styles.kicker}>RANK</Text>
      {me.provisional ? (
        <View style={styles.provPill}>
          <Text style={styles.provPillText}>UNCLAIMED</Text>
        </View>
      ) : isLeader ? (
        /* Filled, not outlined. Brand blue is 1.60:1 on the card and
           cannot be drawn as a line. It can be filled, with ink on top. */
        <View style={styles.leaderPill}>
          <Text style={styles.leaderPillText}>SEASON LEADER</Text>
        </View>
      ) : null}
    </View>
  );

  if (me.provisional) {
    return (
      <View style={[styles.card, pad]}>
        {head}
        <Text style={[numeral, styles.rankMuted]}>
          <Text style={[hash, styles.rankMuted]}>#</Text>
          {me.rank}
        </Text>
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
      onLayout={(e) => {
        cardW.value = e.nativeEvent.layout.width;
      }}
      style={[styles.card, pad, isLeader && styles.cardLeader]}
    >
      {isLeader && <Sheen width={cardW} />}
      {head}
      <Text style={numeral}>
        <Text style={hash}>#</Text>
        {me.rank}
      </Text>
      <Text style={styles.seasonLine}>
        {boardLabel} · {seasonLabel}
      </Text>

      {!compact && (
        <>
          <View style={styles.divider} />
          <View style={styles.proxRow}>
            <OlyIcon name="rank" size={14} color={olyColors.text.disabled} />
            <Text style={styles.proxLineInline}>
              {me.snatchKg != null && me.cleanKg != null
                ? `Snatch ${me.snatchKg} · C&J ${me.cleanKg} · ${me.value} kg total`
                : `${me.value} kg total`}
            </Text>
          </View>
        </>
      )}
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
  /* The strip. Tighter than a card because it is a header, not a panel. */
  cardCompact: {
    paddingVertical: olySpacing[12],
    paddingHorizontal: olySpacing[16],
  },
  cRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[12] },
  cLeft: { flex: 1, minWidth: 0 },
  cKicker: {
    ...olyTypography.caption,
    fontFamily: olyTypography.label.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  /* 7.43:1 on card. Brand blue would be 1.60:1 and could not be read. */
  cKickerLeader: { color: olyColors.text.leader },
  /* Rank and board label share a baseline, so the eye reads one thing. */
  cLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[8],
    marginTop: olySpacing[4] - 1,
  },
  cRank: {
    ...olyTypography.display,
    color: olyColors.text.primary,
    letterSpacing: -0.5,
  },
  cHash: { fontSize: 18, color: olyColors.text.disabled },
  cBoard: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    flexShrink: 1,
  },
  cDays: { alignItems: "center", minWidth: 40 },
  cDaysNum: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  cDaysLabel: {
    ...olyTypography.caption,
    fontFamily: olyTypography.label.fontFamily,
    fontSize: 10,
    lineHeight: 13,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  /* No glow and no bespoke fill. One hairline at 3.35:1 does the work. */
  cardLeader: {
    borderWidth: 1,
    borderColor: olyColors.border.leader,
  },
  sheen: {
    position: "absolute",
    /* left: 0 explicitly. Without it the band takes its static position,
       which is inside the card's padding, so it starts 16px in and the
       travel is off by that much at both ends. */
    left: 0,
    /* Overhang. A 150 wide band tilted 16 degrees needs about 41px of
       vertical slack, plus enough to clear the taller card. */
    top: -60,
    bottom: -60,
    width: SWEEP_W,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 26,
  },
  kicker: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  leaderPill: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4] + 1,
  },
  leaderPillText: {
    ...olyTypography.caption,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  provPill: {
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
  },
  provPillText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  rankFull: {
    ...olyTypography.hero,
    color: olyColors.text.primary,
    marginTop: olySpacing[4],
  },
  hashFull: { fontSize: 26, color: olyColors.text.disabled },
  rankMuted: { color: olyColors.text.secondary },

  seasonLine: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: olyColors.border.default,
    marginVertical: olySpacing[12],
  },
  proxRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
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
