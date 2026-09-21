/**
 * SeasonBadges — Faceted Hex badge shelf (spec 2a).
 *
 * Flat vector polygons only: six bevel facets lit from the top-left, a dark
 * field, and an embossed numeral. Tier lives in the metal (gold / silver /
 * graphite); the caption under the badge names the season. In-progress is
 * always the neutral dashed hex; locked is the grey ghost.
 */

import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyTypography } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Polygon, Polyline, Rect, Text as SvgText } from "react-native-svg";

/* ── Spec geometry (viewBox 0 0 200 200) ─────────────────────── */

const HEX_OUTER = "196,100 148,183.1 52,183.1 4,100 52,16.9 148,16.9";
const HEX_RIM = "172,100 136,162.4 64,162.4 28,100 64,37.6 136,37.6";
const HEX_FIELD = "166,100 133,157.2 67,157.2 34,100 67,42.8 133,42.8";
const STAR =
  "100,46 112.9,82.2 151.4,83.3 120.9,106.8 131.7,143.7 100,122 68.3,143.7 79.1,106.8 48.6,83.3 87.1,82.2";

const FACETS: Array<[string, keyof Tier]> = [
  ["52,16.9 148,16.9 136,37.6 64,37.6", "L1"],
  ["148,16.9 196,100 172,100 136,37.6", "L2"],
  ["196,100 148,183.1 136,162.4 172,100", "D1"],
  ["148,183.1 52,183.1 64,162.4 136,162.4", "D2"],
  ["52,183.1 4,100 28,100 64,162.4", "D1"],
  ["4,100 52,16.9 64,37.6 28,100", "L2"],
];

type Tier = {
  L1: string;
  L2: string;
  D1: string;
  D2: string;
  L: string;
};

const TIERS: Record<"gold" | "silver" | "graphite", Tier> = {
  gold: { L1: "#EBD293", L2: "#D9B96A", D1: "#B08B3C", D2: "#8E6F26", L: "#F0DCA4" },
  silver: { L1: "#DFE5EE", L2: "#C2CAD6", D1: "#99A1AD", D2: "#7A828E", L: "#EEF2F7" },
  graphite: { L1: "#6E7681", L2: "#5A616B", D1: "#454B54", D2: "#343A42", L: "#9BA3AF" },
};

const PROGRESS_STROKE = "#C2CAD6";

const numeralSize = (v: string): [number, number] =>
  v.startsWith("#") ? [68, -3] : v.length >= 3 ? [62, -2] : [66, -2];

/* ── Badge SVGs ──────────────────────────────────────────────── */

export function HexBadgeEarned({
  tier,
  value,
  size = 64,
}: {
  tier: keyof typeof TIERS;
  value: string;
  size?: number;
}) {
  const t = TIERS[tier];
  const [fs, ls] = numeralSize(value);
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {FACETS.map(([pts, tone], i) => (
        <Polygon key={i} points={pts} fill={t[tone]} />
      ))}
      <Polygon
        points={HEX_OUTER}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={0.14}
        strokeWidth={1.2}
      />
      <Polygon points={HEX_RIM} fill={t.D2} />
      <Polygon points={HEX_FIELD} fill="#131A23" />
      <Polygon
        points={HEX_FIELD}
        fill="none"
        stroke="#000000"
        strokeOpacity={0.35}
        strokeWidth={2}
      />
      <SvgText
        x={100}
        y={124}
        textAnchor="middle"
        fontSize={fs}
        fontWeight="600"
        letterSpacing={ls}
        fill="#000000"
        fillOpacity={0.4}
      >
        {value}
      </SvgText>
      <SvgText
        x={100}
        y={122}
        textAnchor="middle"
        fontSize={fs}
        fontWeight="600"
        letterSpacing={ls}
        fill={t.L}
      >
        {value}
      </SvgText>
    </Svg>
  );
}

export function HexBadgeProgress({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Polygon points={HEX_OUTER} fill="#12161C" />
      <Polygon
        points={HEX_OUTER}
        fill="none"
        stroke={PROGRESS_STROKE}
        strokeOpacity={0.5}
        strokeWidth={3}
        strokeDasharray="16 12"
        strokeLinejoin="round"
      />
      <Polygon
        points={STAR}
        fill="#1E252E"
        stroke={PROGRESS_STROKE}
        strokeOpacity={0.35}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Verified mark — flat brand-blue hexagon (pointy-top) with a white check.
 * Sits on proof videos. Deliberately flat: the metallic facets stay
 * reserved for season awards.
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

export function HexBadgeLocked({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Polygon points={HEX_OUTER} fill="#1B222B" />
      <Polygon points={HEX_RIM} fill="#151B23" />
      <Rect x={82} y={95} width={36} height={10} rx={5} fill="#3A424C" />
    </Svg>
  );
}

/* ── Shelf ───────────────────────────────────────────────────── */

export interface SeasonBadge {
  state: "earned" | "progress" | "locked";
  caption: string;
  tier?: keyof typeof TIERS;
  value?: string;
}

export const SeasonBadgesShelf: React.FC<{ badges: SeasonBadge[] }> = ({
  badges,
}) => {
  // Nothing earned yet: one quiet row for the season in progress — locked
  // slots only appear once there's at least one real badge on the shelf.
  if (badges.length === 1 && badges[0].state === "progress") {
    return (
      <View style={styles.rowCard}>
        <HexBadgeProgress size={48} />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{badges[0].caption}</Text>
          <Text style={styles.rowSub}>
            In progress — finish top 3 when the season ends to earn it
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.shelf}>
      {badges.map((b, i) => (
        <View key={i} style={styles.tile}>
          {b.state === "earned" && b.tier && b.value ? (
            <HexBadgeEarned tier={b.tier} value={b.value} />
          ) : b.state === "progress" ? (
            <HexBadgeProgress />
          ) : (
            <HexBadgeLocked />
          )}
          <Text
            style={[
              styles.caption,
              b.state === "locked" && styles.captionLocked,
            ]}
          >
            {b.caption}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  shelf: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[16],
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olySpacing[16],
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  rowSub: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: olySpacing[8] + 2,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    paddingVertical: olySpacing[16],
  },
  caption: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  captionLocked: {
    color: olyColors.text.disabled,
  },
});
