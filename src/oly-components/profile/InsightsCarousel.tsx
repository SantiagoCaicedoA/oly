/**
 * InsightsCarousel, private cards only the athlete sees.
 *
 * Each card reads the same way: an overline, one big number, one plain
 * sentence and one small visual. Swipe between them, paging dots below.
 *  1. Snatch to C&J ratio against the 78 to 82 ideal band
 *  2. Total progression, a running best line from verified lift history
 *  3. Pound for pound, Sinclair and the share of the class it beats
 *  4. This season, rank and the spots either side
 * Cards degrade honestly: without the data a card says what would fill it.
 */

import { GlowBar, Glass, Overline } from "@/src/oly-components/shop/ShopKit";
import {
  InsightExplainSheet,
  type InsightExplain,
} from "@/src/oly-components/profile/InsightExplainSheet";
import { MOCK_RANK_MOVE, type Neighbours } from "@/src/oly-mock/profile";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import type {
  BoardRow,
  MyRankResponse,
  SeasonMeta,
} from "@/types/api/leaderboard";
import type { MyLift } from "@/types/api/profile";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

const CARD_GAP = 10;
const CARD_PAD = 18;
/** How much of the next card peeks in. */
const PEEK = 40;

/* ── data shaping ─────────────────────────────────────────────── */

interface TotalPoint {
  t: number;
  total: number;
}

/** Running best (snatch + C&J) at each verified submission that has both. */
function totalSeries(lifts: MyLift[]): TotalPoint[] {
  const usable = lifts
    .filter((l) => l.status === "live")
    .slice()
    .sort(
      (a, b) => new Date(a.liftDate).getTime() - new Date(b.liftDate).getTime(),
    );
  let sn = 0;
  let cj = 0;
  const pts: TotalPoint[] = [];
  for (const l of usable) {
    if (l.liftType === "snatch") sn = Math.max(sn, l.weightKg);
    else cj = Math.max(cj, l.weightKg);
    if (sn > 0 && cj > 0)
      pts.push({ t: new Date(l.liftDate).getTime(), total: sn + cj });
  }
  // collapse same-total consecutive points but always keep first + last
  return pts.filter(
    (p, i) => i === 0 || i === pts.length - 1 || p.total !== pts[i - 1].total,
  );
}

const month = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short" });

/** Whole days until the season ends, never below 0. Null without a season. */
const daysLeftIn = (season: SeasonMeta | null) =>
  season
    ? Math.max(0, Math.ceil((+new Date(season.endsAt) - Date.now()) / 86400000))
    : null;

/** "Diego Restrepo" reads as "Diego R." on the mini board. */
const shortName = (name: string) => {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

/* ── shared card pieces ───────────────────────────────────────── */

function Card({
  width,
  children,
}: {
  width: number;
  children: React.ReactNode;
}) {
  return (
    <Glass
      radius={olyRadius.xl}
      colors={olyColors.glass.ticket}
      style={[styles.card, { width }]}
    >
      {children}
    </Glass>
  );
}

function Head({
  over,
  value,
  unit,
  line,
}: {
  over: string;
  value?: string;
  unit?: string;
  line: string;
}) {
  return (
    <>
      <Overline>{over}</Overline>
      {value != null && (
        <View style={styles.bigRow}>
          <Text style={styles.big} maxFontSizeMultiplier={1.2}>
            {value}
          </Text>
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
      )}
      <Text style={value != null ? styles.line : styles.emptyLine}>{line}</Text>
    </>
  );
}

/* ── explanations, one per card ───────────────────────────────── */

/** IWF Sinclair coefficients (2021 cycle values). Only used to show equal scores at other sizes. TODO(api): read from the backend so it matches the board. */
const SINCLAIR = {
  M: { A: 0.722762521, b: 193.609 },
  F: { A: 0.787004341, b: 153.757 },
};
function sinclairFactor(sex: "M" | "F", bw: number) {
  const { A, b } = SINCLAIR[sex];
  return bw >= b ? 1 : Math.pow(10, A * Math.pow(Math.log10(bw / b), 2));
}

function explainFor(
  key: string,
  d: {
    sn: number | null;
    cj: number | null;
    points: TotalPoint[];
    sinclair: number | null;
    beatPct: number | null;
    me: MyRankResponse["me"];
    boardLabel: string | null;
    neighbours: Neighbours | null;
    sex: "M" | "F";
    bodyweightKg: number | null;
    season: SeasonMeta | null;
    /** Bodyweight on the most recent best lift. */
    liftBw: number | null;
  },
): InsightExplain {
  const board = d.boardLabel ?? "your class";
  if (key === "ratio") {
    const r = d.sn && d.cj ? Math.round((d.sn / d.cj) * 100) : null;
    return {
      over: "SNATCH TO C&J",
      title: r
        ? `Your snatch is ${r}% of your clean & jerk`
        : "How your two lifts compare",
      means: r
        ? `${d.sn} kg snatch divided by ${d.cj} kg clean & jerk. It shows how well your two lifts keep up with each other.`
        : "Your snatch divided by your clean & jerk. It shows how well your two lifts keep up with each other.",
      matters:
        "Most lifters land between 78 and 82%. Far below means your snatch is holding your total back. Far above means your clean & jerk is.",
      todo: !r
        ? "Add a snatch and a clean & jerk to your record book to see yours."
        : r < 78
          ? "Your snatch is behind. Snatch technique and pulls are the fastest way to grow your total."
          : r > 82
            ? "Your clean & jerk is behind. Jerks and front squats are the fastest way to grow your total."
            : "You are in the ideal range. Keep both lifts moving together and your total grows evenly.",
    };
  }
  if (key === "total") {
    const first = d.points[0];
    const last = d.points[d.points.length - 1];
    return {
      over: "TOTAL PROGRESSION",
      title: last
        ? `Your best total is ${last.total} kg`
        : "Your total over time",
      means:
        "Your best snatch plus your best clean & jerk, from verified lifts. Each point on the line is a new best total.",
      matters: "Total is what wins meets and what ranks you on the board.",
      todo:
        first && last && last.total > first.total
          ? `You are up ${last.total - first.total} kg since ${month(first.t)}. Post your next PR on video and the line keeps climbing.`
          : "Post your lifts on video. Every verified PR adds a point to the line.",
    };
  }
  if (key === "sinclair") {
    return {
      over: "POUND FOR POUND",
      title: d.sinclair
        ? `Your Sinclair is ${Math.round(d.sinclair)}`
        : "Strength for your size",
      sinclair:
        d.sinclair && d.sn && d.cj
          ? {
              total: d.sn + d.cj,
              score: d.sinclair,
              liftBodyweightKg: d.liftBw,
              currentBodyweightKg: d.bodyweightKg,
              sameAs: (d.sex === "F" ? [55, 76] : [61, 109]).map((bw) => ({
                bw,
                total: Math.round(d.sinclair! / sinclairFactor(d.sex, bw)),
              })),
            }
          : undefined,
      means:
        "Sinclair adjusts your total for bodyweight, so lifters of any size can be compared fairly. The pound for pound board uses it.",
      matters:
        d.beatPct != null
          ? `It shows how strong you are for your size. You beat ${d.beatPct}% of ${board}.`
          : "It shows how strong you are for your size, not just how much you lift.",
      todo: "Raise your total, or lift the same weight at a lighter bodyweight.",
    };
  }
  const above = d.neighbours?.above;
  const gap = above && d.me ? Math.max(0, above.value - d.me.value) : null;
  const n = d.neighbours;
  const me = d.me;
  const season =
    me && n
      ? {
          daysLeft: daysLeftIn(d.season),
          move: MOCK_RANK_MOVE,
          total: me.value,
          rows: [
            ...n.above2.map((r, i) => ({
              rank: me.rank - (n.above2.length - i),
              name: shortName(r.user.name),
              value: r.value,
            })),
            { rank: me.rank, name: "You", value: me.value, me: true },
            ...n.below2.map((r, i) => ({
              rank: me.rank + i + 1,
              name: shortName(r.user.name),
              value: r.value,
            })),
          ].filter((r) => r.rank >= 1),
          targets: [
            gap != null && above && me.rank > 1
              ? {
                  label: `Pass ${shortName(above.user.name)}`,
                  kg: Math.round(gap),
                }
              : null,
            n.top5 != null && me.rank > 5
              ? { label: "Top 5", kg: Math.round(n.top5 - me.value) }
              : null,
          ].filter(Boolean) as { label: string; kg: number }[],
        }
      : undefined;
  return {
    over: "THIS SEASON",
    season,
    title: d.me
      ? `You are #${d.me.rank} in ${board}`
      : "Your place this season",
    means:
      "Your place on this season's board for your class, ranked by verified total.",
    matters:
      "Boards reset every season, so everyone starts fresh and every lift counts.",
    todo:
      gap != null && d.me
        ? `Add ${gap} kg to your total to pass #${d.me.rank - 1}.`
        : d.me
          ? "You are at the top. Keep posting to hold your spot."
          : "Post a snatch or clean & jerk on video to take your spot.",
  };
}

/** Bodyweight on the newer of the best snatch and best C&J, the one Sinclair uses. */
function bestLiftBw(lifts: MyLift[]): number | null {
  const best = (type: MyLift["liftType"]) =>
    lifts
      .filter((l) => l.liftType === type && l.status === "live")
      .sort((a, b) => b.weightKg - a.weightKg)[0];
  const picks = [best("snatch"), best("cleanjerk")].filter(Boolean) as MyLift[];
  if (!picks.length) return null;
  const newest = picks.sort(
    (a, b) => +new Date(b.liftDate) - +new Date(a.liftDate),
  )[0];
  return newest.bodyweightKg > 0
    ? Math.round(newest.bodyweightKg * 10) / 10
    : null;
}

/* ── cards ────────────────────────────────────────────────────── */

function RatioCard({
  width,
  sn,
  cj,
}: {
  width: number;
  sn: number | null;
  cj: number | null;
}) {
  if (!sn || !cj) {
    return (
      <Card width={width}>
        <Head
          over="SNATCH TO C&J"
          line="Post a verified snatch and clean and jerk to see how the two lifts balance."
        />
      </Card>
    );
  }
  const pct = Math.round((sn / cj) * 100);
  const pos = Math.max(0, Math.min(1, (pct - 70) / 20)); // 70 to 90 scale
  const line =
    pct < 78
      ? "Your snatch is lagging behind your clean and jerk"
      : pct > 82
        ? "Your jerk is holding your total back"
        : "Your snatch is right where it should be";
  return (
    <Card width={width}>
      <Head over="SNATCH TO C&J" value={String(pct)} unit="%" line={line} />
      {/* Same track as the season chase: ideal range lit, you on it. */}
      <View style={styles.visual}>
        <View style={styles.chaseTrack}>
          <View style={styles.chaseLane} pointerEvents="none">
            <View style={styles.ratioIdeal} />
            <View style={[styles.chaseYou, { left: `${pos * 100}%` }]}>
              <Text style={styles.chaseYouText}>You</Text>
            </View>
          </View>
        </View>
        <View style={styles.chaseEnds}>
          <Text style={styles.tiny}>70%</Text>
          <Text style={[styles.tiny, styles.soft]}>Ideal 78 to 82</Text>
          <Text style={styles.tiny}>90%</Text>
        </View>
      </View>
    </Card>
  );
}

function TotalChart({
  points,
  width,
}: {
  points: TotalPoint[];
  width: number;
}) {
  const H = 60;
  const PAD = 6;
  const t0 = points[0].t;
  const span = Math.max(1, points[points.length - 1].t - t0);
  const vMin = Math.min(...points.map((p) => p.total));
  const vMax = Math.max(...points.map((p) => p.total));
  const x = (t: number) => PAD + ((t - t0) / span) * (width - PAD * 2);
  const y = (v: number) =>
    vMax === vMin ? H / 2 : H - 8 - ((v - vMin) / (vMax - vMin)) * (H - 16);
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${x(p.t)},${y(p.total)}`)
    .join(" ");
  const last = points[points.length - 1];
  const area = `${line} L${x(last.t)},${H} L${x(t0)},${H} Z`;
  return (
    <Svg width={width} height={H}>
      <Defs>
        <LinearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={olyColors.accent} stopOpacity={0.3} />
          <Stop offset="1" stopColor={olyColors.accent} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#totalFill)" />
      <Path
        d={line}
        fill="none"
        stroke={olyColors.accent}
        strokeOpacity={0.3}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={line}
        fill="none"
        stroke={olyColors.accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={x(last.t)}
        cy={y(last.total)}
        r={4.5}
        fill={olyPalette.white}
      />
    </Svg>
  );
}

function TotalCard({ width, lifts }: { width: number; lifts: MyLift[] }) {
  const points = useMemo(() => totalSeries(lifts), [lifts]);
  if (points.length < 3) {
    return (
      <Card width={width}>
        <Head
          over="TOTAL PROGRESSION"
          line={`Every verified lift adds a point here. Post ${3 - points.length} more and your total starts drawing its line.`}
        />
      </Card>
    );
  }
  const first = points[0];
  const last = points[points.length - 1];
  const gain = last.total - first.total;
  const span = last.t - first.t;
  const labels = [0, 1 / 3, 2 / 3].map((f) => month(first.t + span * f));
  return (
    <Card width={width}>
      <Head
        over="TOTAL PROGRESSION"
        value={`${gain >= 0 ? "+" : ""}${gain}`}
        unit="kg"
        line={`${first.total} to ${last.total} since ${month(first.t)}`}
      />
      <View style={styles.visual}>
        <TotalChart points={points} width={width - CARD_PAD * 2 - 2} />
        <View style={styles.scale}>
          {labels.map((l, i) => (
            <Text key={i} style={styles.tiny}>
              {l}
            </Text>
          ))}
          <Text style={[styles.tiny, styles.soft]}>Now</Text>
        </View>
      </View>
    </Card>
  );
}

function SinclairCard({
  width,
  sinclair,
  beatPct,
  boardLabel,
}: {
  width: number;
  sinclair: number | null;
  beatPct: number | null;
  boardLabel: string | null;
}) {
  if (!sinclair) {
    return (
      <Card width={width}>
        <Head
          over="POUND FOR POUND"
          line="Post a verified snatch and clean and jerk to get your Sinclair, the score that compares you across weight classes."
        />
      </Card>
    );
  }
  const ranked = beatPct != null && !!boardLabel;
  return (
    <Card width={width}>
      <Head
        over="POUND FOR POUND"
        value={String(Math.round(sinclair))}
        unit="Sinclair"
        line={
          !ranked
            ? "Your score across every weight class"
            : beatPct >= 50
              ? "Stronger than most lifters your size"
              : "Plenty of lifters your size to catch"
        }
      />
      {ranked && (
        <View style={styles.visual}>
          <GlowBar pct={beatPct / 100} height={6} />
          <View style={styles.scale}>
            <Text style={styles.tiny}>
              You beat <Text style={styles.strong}>{beatPct}%</Text> of{" "}
              {boardLabel}
            </Text>
            <Text style={styles.tiny}>
              {beatPct >= 100 ? "Top of the class" : `Top ${100 - beatPct}%`}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

function SeasonCard({
  width,
  me,
  boardLabel,
  neighbours,
  season,
}: {
  width: number;
  me: MyRankResponse["me"];
  boardLabel: string | null;
  neighbours: Neighbours | null;
  season: SeasonMeta | null;
}) {
  if (!me) {
    return (
      <Card width={width}>
        <Head
          over="THIS SEASON"
          line="You are not on a board yet. Post one verified lift and your rank shows up here."
        />
      </Card>
    );
  }
  const above: BoardRow | null =
    me.rank > 1 ? (neighbours?.above ?? null) : null;
  const below = neighbours?.below ?? null;
  const daysLeft = daysLeftIn(season);
  const gapUp = above ? Math.round(above.value - me.value) : null;
  const gapDown = below ? Math.round(me.value - below.value) : null;
  /* Where you sit between the athlete below and the one above. */
  const lo = below?.value ?? me.value - (gapUp ?? 10);
  const hi = above?.value ?? me.value;
  const pos = hi > lo ? (me.value - lo) / (hi - lo) : 1;

  return (
    <Card width={width}>
      <View style={styles.seasonTop}>
        <Overline>THIS SEASON</Overline>
        {daysLeft != null ? (
          <Text style={styles.tiny}>{daysLeft} days left</Text>
        ) : null}
      </View>
      <View style={styles.bigRow}>
        <Text style={styles.big} maxFontSizeMultiplier={1.2}>
          #{me.rank}
        </Text>
        <Text style={styles.unit}>{boardLabel}</Text>
        {MOCK_RANK_MOVE ? (
          <View style={styles.move}>
            <Text style={styles.moveText}>Up {MOCK_RANK_MOVE}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.line}>
        {me.provisional
          ? "Provisional until you post one verified lift"
          : me.rank === 1
            ? "Top of the board. Hold it."
            : gapUp != null
              ? `${gapUp} kg to pass ${shortName(above!.user.name)}`
              : "Every kilo you add defends the spot"}
      </Text>

      {/* The chase: you on a track between the lifter below and above. */}
      <View style={styles.visual}>
        <View style={styles.chaseEnds}>
          <Text style={styles.tiny}>
            {below ? `#${me.rank + 1}  ${below.value}` : ""}
          </Text>
          <Text style={styles.tiny}>
            {above ? `#${me.rank - 1}  ${above.value}` : ""}
          </Text>
        </View>
        <View style={styles.chaseTrack}>
          <View style={[styles.chaseFill, { width: `${pos * 100}%` }]} />
          {/* Marker lane is inset by half the marker, so it never hangs off the ends. */}
          <View style={styles.chaseLane} pointerEvents="none">
            <View style={[styles.chaseYou, { left: `${pos * 100}%` }]}>
              <Text style={styles.chaseYouText}>You</Text>
            </View>
          </View>
        </View>
        <View style={styles.chaseEnds}>
          <Text style={styles.tiny}>
            {gapDown != null ? (
              <>
                <Text style={styles.strong}>{gapDown} kg</Text> ahead of{" "}
                {shortName(below!.user.name)}
              </>
            ) : (
              ""
            )}
          </Text>
          <Text style={[styles.tiny, styles.strong]}>{me.value} kg</Text>
        </View>
      </View>
    </Card>
  );
}

/* ── carousel ─────────────────────────────────────────────────── */

export function InsightsCarousel({
  snatchKg,
  cleanKg,
  sinclair,
  lifts,
  me,
  boardLabel,
  beatPct,
  neighbours,
  sex,
  bodyweightKg,
  season,
}: {
  season: SeasonMeta | null;
  sex: "M" | "F";
  bodyweightKg: number | null;
  snatchKg: number | null;
  cleanKg: number | null;
  sinclair: number | null;
  lifts: MyLift[];
  me: MyRankResponse["me"];
  boardLabel: string | null;
  beatPct: number | null;
  neighbours: Neighbours | null;
}) {
  const { width: screenW } = useWindowDimensions();
  const cardW = screenW - olyLayout.screenPadding * 2 - PEEK;
  const step = cardW + CARD_GAP;
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const points = useMemo(() => totalSeries(lifts), [lifts]);

  const cards = [
    <RatioCard key="ratio" width={cardW} sn={snatchKg} cj={cleanKg} />,
    <TotalCard key="total" width={cardW} lifts={lifts} />,
    <SinclairCard
      key="sinclair"
      width={cardW}
      sinclair={sinclair}
      beatPct={beatPct}
      boardLabel={boardLabel}
    />,
    <SeasonCard
      key="season"
      width={cardW}
      me={me}
      boardLabel={boardLabel}
      neighbours={neighbours}
      season={season}
    />,
  ];

  return (
    <View>
      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.key)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setOpen(String(item.key))}
            accessibilityRole="button"
            accessibilityHint="Explains this insight"
            style={({ pressed }) => pressed && styles.pressed}
          >
            {item}
          </Pressable>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        style={styles.bleed}
        contentContainerStyle={styles.track}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / step))
        }
      />
      <View style={styles.dots}>
        {cards.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
        ))}
      </View>
      <InsightExplainSheet
        explain={
          open
            ? explainFor(open, {
                sn: snatchKg,
                cj: cleanKg,
                points,
                sinclair,
                beatPct,
                me,
                boardLabel,
                neighbours,
                sex,
                bodyweightKg,
                liftBw: bestLiftBw(lifts),
                season,
              })
            : null
        }
        onClose={() => setOpen(null)}
      />
    </View>
  );
}

/* ── styles ───────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -olyLayout.screenPadding },
  pressed: { opacity: 0.85 },
  track: { gap: CARD_GAP, paddingHorizontal: olyLayout.screenPadding },
  card: { padding: CARD_PAD, minHeight: 236 },
  bigRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: olySpacing[8],
  },
  big: {
    fontFamily: olyFonts.bold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.6,
    color: olyColors.text.primary,
  },
  unit: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
  line: {
    marginTop: olySpacing[4],
    fontFamily: olyFonts.medium,
    fontSize: 14,
    lineHeight: 19,
    color: olyColors.text.primary,
  },
  emptyLine: {
    ...olyTypography.bodySmall,
    marginTop: olySpacing[8],
    lineHeight: 20,
    color: olyColors.text.secondary,
  },
  /** Pinned to the card bottom, so every card balances at the same height. */
  visual: { marginTop: "auto", paddingTop: olySpacing[16] },
  tiny: {
    fontFamily: olyFonts.regular,
    fontSize: 11,
    color: olyColors.text.hint,
  },
  soft: { color: olyColors.text.secondary },
  strong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  scale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: olySpacing[8],
  },
  ratioIdeal: {
    position: "absolute",
    left: "40%",
    width: "20%",
    top: 0,
    bottom: 0,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    ...olyGlow.md,
  },
  seasonTop: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  move: {
    alignSelf: "flex-end",
    marginBottom: 9,
    marginLeft: olySpacing[4],
    paddingHorizontal: olySpacing[8],
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
  },
  moveText: {
    fontFamily: olyFonts.bold,
    fontSize: 11,
    color: olyColors.text.primary,
  },
  chaseEnds: { flexDirection: "row", justifyContent: "space-between" },
  chaseTrack: {
    height: 6,
    marginVertical: 14,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.idle,
  },
  chaseFill: {
    height: "100%",
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    ...olyGlow.sm,
  },
  chaseLane: { position: "absolute", left: 20, right: 20, top: 0, bottom: 0 },
  chaseYou: {
    position: "absolute",
    top: -9,
    marginLeft: -20,
    width: 40,
    height: 24,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.text.primary,
    alignItems: "center",
    justifyContent: "center",
    ...olyGlow.md,
  },
  chaseYouText: {
    fontFamily: olyFonts.bold,
    fontSize: 11,
    color: olyPalette.background,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.idle,
  },
  dotOn: { width: 18, backgroundColor: olyColors.text.primary },
});
