/**
 * SeasonBadges, faceted hex badges in Oly blue.
 *
 * Earned: six bevel facets of one blue metal lit from the top left, a dark
 * field, a white numeral and a soft blue glow. In progress: a dashed blue
 * hex with a faint star. Locked: a glass ghost with an empty field.
 * HexVerifiedMark, the flat check on proof videos, lives here too.
 */

import { olyColors, olyPalette, olyBadge } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import { Glass } from "@/src/oly-components/shop/ShopKit";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Polygon, Polyline, Rect, Text as SvgText } from "react-native-svg";

/** The badge metal: light (L) and dark (D) facets, plus the locked ghost fill. */
const BADGE_BLUE = {
  L1: olyBadge.L1,
  L2: olyBadge.L2,
  D1: olyBadge.D1,
  D2: olyBadge.D2,
  ghost: "rgba(239, 241, 244, 0.04)",
} as const;

/* ── Geometry (viewBox 0 0 200 200) ──────────────────────────── */

const HEX_OUTER = "196,100 148,183.1 52,183.1 4,100 52,16.9 148,16.9";
const HEX_RIM = "172,100 136,162.4 64,162.4 28,100 64,37.6 136,37.6";
const HEX_FIELD = "166,100 133,157.2 67,157.2 34,100 67,42.8 133,42.8";

const FACETS: [string, "L1" | "L2" | "D1" | "D2"][] = [
  ["52,16.9 148,16.9 136,37.6 64,37.6", "L1"],
  ["148,16.9 196,100 172,100 136,37.6", "L2"],
  ["196,100 148,183.1 136,162.4 172,100", "D1"],
  ["148,183.1 52,183.1 64,162.4 136,162.4", "D2"],
  ["52,183.1 4,100 28,100 64,162.4", "D1"],
  ["4,100 52,16.9 64,37.6 28,100", "L2"],
];

const BADGE_SIZE = 64;

/* ── Badge SVGs ──────────────────────────────────────────────── */

/** The six metal facets. `opacity` fades them for the in progress badge. */
function Facets({ opacity }: { opacity?: number }) {
  return (
    <>
      {FACETS.map(([pts, tone], i) => (
        <Polygon key={i} points={pts} fill={BADGE_BLUE[tone]} fillOpacity={opacity} />
      ))}
    </>
  );
}

/** The numeral in the field. Ranks ("#9") run a touch larger. */
function Numeral({ value, opacity }: { value: string; opacity?: number }) {
  return (
    <SvgText
      x={100}
      y={121}
      textAnchor="middle"
      fontSize={value.startsWith("#") ? 64 : 62}
      fontFamily={olyFonts.bold}
      fontWeight="700"
      letterSpacing={-2}
      fill={olyColors.media.ink}
      fillOpacity={opacity}
    >
      {value}
    </SvgText>
  );
}

function HexBadgeEarned({ value }: { value: string }) {
  return (
    <View style={styles.glow}>
      <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox="0 0 200 200">
        <Facets />
        <Polygon
          points={HEX_OUTER}
          fill="none"
          stroke={olyColors.media.ink}
          strokeOpacity={0.25}
          strokeWidth={1.5}
        />
        <Polygon points={HEX_RIM} fill={BADGE_BLUE.D2} />
        <Polygon points={HEX_FIELD} fill={olyPalette.background} />
        <Polygon
          points={HEX_FIELD}
          fill="none"
          stroke={olyColors.accent}
          strokeOpacity={0.35}
          strokeWidth={2}
        />
        <Numeral value={value} />
      </Svg>
    </View>
  );
}

/** In progress: the badge you will earn, faded, with a dashed blue rim. */
function HexBadgeProgress({ value }: { value?: string }) {
  return (
    <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox="0 0 200 200">
      <Facets opacity={0.28} />
      <Polygon points={HEX_RIM} fill={BADGE_BLUE.D2} fillOpacity={0.3} />
      <Polygon points={HEX_FIELD} fill={olyPalette.background} />
      <Polygon
        points={HEX_OUTER}
        fill="none"
        stroke={BADGE_BLUE.L2}
        strokeWidth={3}
        strokeDasharray="14 10"
        strokeLinejoin="round"
      />
      {value ? <Numeral value={value} opacity={0.55} /> : null}
    </Svg>
  );
}

function HexBadgeLocked() {
  return (
    <Svg width={BADGE_SIZE} height={BADGE_SIZE} viewBox="0 0 200 200">
      <Polygon
        points={HEX_OUTER}
        fill={BADGE_BLUE.ghost}
        stroke={olyColors.glass.border}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Polygon points={HEX_FIELD} fill={olyColors.glass.inset} />
      <Rect x={84} y={96} width={32} height={8} rx={4} fill={olyColors.glass.bar} />
    </Svg>
  );
}

/**
 * Verified mark: flat brand blue hexagon (pointy top) with a white check.
 * Sits on proof videos and next to a verified athlete's name. Deliberately
 * flat: the faceted metal stays reserved for badges.
 */
export function HexVerifiedMark({ size = 26 }: { size?: number }) {
  const HEX_POINTY = "100,10 178,55 178,145 100,190 22,145 22,55";
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Polygon
        points={HEX_POINTY}
        fill={olyPalette.primary}
        stroke={olyPalette.primary}
        strokeWidth={20}
        strokeLinejoin="round"
      />
      <Polyline
        points="62,102 90,130 140,72"
        fill="none"
        stroke={olyPalette.white}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ── Grid ────────────────────────────────────────────────────── */

export interface Badge {
  state: "earned" | "progress" | "locked";
  title: string;
  sub: string;
  /** The numeral. In progress badges show it faded. */
  value?: string;
}

/** Four to a row in one glass card: earned first, then in progress, then locked. */
export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <Glass radius={olyRadius.tile} style={styles.card}>
      {badges.map((b, i) => (
        <View
          key={i}
          style={styles.cell}
          accessible
          accessibilityLabel={`${b.title}, ${b.sub}`}
        >
          {b.state === "earned" && b.value ? (
            <HexBadgeEarned value={b.value} />
          ) : b.state === "progress" ? (
            <HexBadgeProgress value={b.value} />
          ) : (
            <HexBadgeLocked />
          )}
          <Text
            style={[styles.title, b.state !== "earned" && styles.dim]}
            numberOfLines={1}
          >
            {b.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {b.sub}
          </Text>
        </View>
      ))}
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: olySpacing[20],
    paddingHorizontal: 6,
    paddingTop: olySpacing[20],
    paddingBottom: 18,
  },
  cell: { width: "25%", alignItems: "center", paddingHorizontal: 2 },
  glow: { ...olyGlow.md },
  title: {
    marginTop: olySpacing[8],
    fontFamily: olyFonts.bold,
    fontSize: 11,
    lineHeight: 14,
    color: olyColors.text.primary,
  },
  dim: { color: olyColors.text.hint },
  sub: {
    marginTop: 1,
    fontFamily: olyFonts.regular,
    fontSize: 10,
    lineHeight: 13,
    color: olyColors.text.hint,
  },
});
