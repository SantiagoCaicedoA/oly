/**
 * InsightsCarousel — private, swipeable coach's-eye cards ("Only you see this").
 *
 * One card per swipe, paging dots below. Cards:
 *  1. Snatch : C&J ratio with a directional verdict (78–82% ideal band)
 *  2. Total progression — running-best line built from verified lift history
 *  3. Pound for pound — Sinclair score
 *  4. Rank this season
 * Cards degrade honestly: with fewer than 3 history points the chart card
 * explains what to do instead of drawing a fake trend.
 */

import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import type { MyRankResponse, SeasonMeta } from "@/types/api/leaderboard";
import type { MyLift } from "@/types/api/profile";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polyline,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const CARD_W = Dimensions.get("window").width - olyLayout.screenPadding * 2;

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
      (a, b) => new Date(a.liftDate).getTime() - new Date(b.liftDate).getTime()
    );
  let sn = 0;
  let cj = 0;
  const pts: TotalPoint[] = [];
  for (const l of usable) {
    if (l.liftType === "snatch") sn = Math.max(sn, l.weightKg);
    else cj = Math.max(cj, l.weightKg);
    if (sn > 0 && cj > 0) {
      pts.push({ t: new Date(l.liftDate).getTime(), total: sn + cj });
    }
  }
  // collapse same-total consecutive points but always keep first + last
  return pts.filter(
    (p, i) => i === 0 || i === pts.length - 1 || p.total !== pts[i - 1].total
  );
}

const fmtDay = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/* ── chart ────────────────────────────────────────────────────── */

function TotalChart({ points }: { points: TotalPoint[] }) {
  // Pixel-true canvas (no viewBox stretching) and index-spaced x:
  // sparse PR events read as a clean staircase, never a vertical cliff.
  const W = CARD_W - olySpacing[16] * 2;
  const H = 124;
  const PAD_X = 6;
  const PAD_TOP = 14;
  const PAD_BOT = 10;
  const LABEL_W = 40;
  const n = points.length;
  const vMin = Math.min(...points.map((p) => p.total));
  const vMax = Math.max(...points.map((p) => p.total));
  const x = (i: number) =>
    PAD_X + (i * (W - PAD_X * 2 - LABEL_W)) / Math.max(1, n - 1);
  const y = (v: number) =>
    vMax === vMin
      ? H / 2
      : H - PAD_BOT - ((v - vMin) / (vMax - vMin)) * (H - PAD_TOP - PAD_BOT);
  const linePts = points.map((p, i) => `${x(i)},${y(p.total)}`).join(" ");
  const area =
    `M ${x(0)},${y(points[0].total)} ` +
    points.map((p, i) => `L ${x(i)},${y(p.total)}`).join(" ") +
    ` L ${x(n - 1)},${H} L ${x(0)},${H} Z`;
  const last = points[n - 1];
  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={olyPalette.white} stopOpacity={0.14} />
          <Stop offset="1" stopColor={olyPalette.white} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {[0.3, 0.62].map((f) => (
        <Line
          key={f}
          x1={0}
          y1={H * f}
          x2={W}
          y2={H * f}
          stroke="rgba(226, 232, 240, 0.07)"
          strokeWidth={1}
        />
      ))}
      <Path d={area} fill="url(#totalFill)" />
      <Polyline
        points={linePts}
        fill="none"
        stroke={olyPalette.white}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={x(n - 1)} cy={y(last.total)} r={3.5} fill={olyPalette.white} />
      <SvgText
        x={x(n - 1) + 8}
        y={y(last.total) + 4}
        fontSize={12}
        fontWeight="500"
        fill={olyPalette.white}
      >
        {last.total}
      </SvgText>
    </Svg>
  );
}

/* ── cards ────────────────────────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function RatioCard({ sn, cj }: { sn: number | null; cj: number | null }) {
  if (!sn || !cj) {
    return (
      <Card>
        <Text style={styles.cardTitle}>Snatch : Clean & Jerk ratio</Text>
        <Text style={styles.emptyText}>
          Post a verified snatch and clean & jerk and Oly will read your
          balance between the two lifts.
        </Text>
      </Card>
    );
  }
  const pct = Math.round((sn / cj) * 100);
  const pos = Math.max(0, Math.min(1, (pct - 70) / 20)); // 70%…90% scale
  const verdict =
    pct < 78
      ? { b: "Snatch is lagging.", rest: " It's the cheaper place to add kilos to your total — prioritize snatch work." }
      : pct > 82
      ? { b: "Big pull, harder jerk.", rest: " Your clean & jerk strength is the bottleneck — build the jerk." }
      : { b: "Balanced lifter.", rest: " Both lifts are moving together — keep building both." };
  return (
    <Card>
      <Text style={styles.cardTitle}>Snatch : Clean & Jerk ratio</Text>
      <Text style={styles.ratioBig}>
        {pct}
        <Text style={styles.ratioPct}>%</Text>
      </Text>
      <View style={styles.ratioSplit}>
        <View style={styles.ratioSide}>
          <Text style={styles.ratioVal}>
            {sn} <Text style={styles.ratioUnit}>kg</Text>
          </Text>
          <Text style={styles.ratioKey}>SNATCH</Text>
        </View>
        <View style={styles.ratioDiv} />
        <View style={styles.ratioSide}>
          <Text style={styles.ratioVal}>
            {cj} <Text style={styles.ratioUnit}>kg</Text>
          </Text>
          <Text style={styles.ratioKey}>CLEAN & JERK</Text>
        </View>
      </View>
      <View style={styles.ratioBar}>
        <View style={styles.ratioIdeal} />
        <View style={[styles.ratioMark, { left: `${pos * 100}%` }]} />
      </View>
      <View style={styles.ratioScale}>
        <Text style={styles.ratioScaleText}>70%</Text>
        <Text style={[styles.ratioScaleText, { color: olyColors.text.secondary }]}>
          Ideal 78–82%
        </Text>
        <Text style={styles.ratioScaleText}>90%</Text>
      </View>
      <View style={styles.verdict}>
        <Text style={styles.verdictText}>
          <Text style={styles.verdictBold}>{verdict.b}</Text>
          {verdict.rest}
        </Text>
      </View>
    </Card>
  );
}

function TotalCard({ lifts }: { lifts: MyLift[] }) {
  const points = useMemo(() => totalSeries(lifts), [lifts]);
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <Card>
      <Text style={styles.cardTitle}>Total progression</Text>
      {points.length >= 3 ? (
        <>
          <TotalChart points={points} />
          <View style={styles.xAxis}>
            <Text style={styles.xAxisText}>{fmtDay(first.t)}</Text>
            <Text style={styles.xAxisText}>{fmtDay(last.t)}</Text>
          </View>
          <Text style={styles.foot}>
            <Text style={styles.verdictBold}>
              {last.total - first.total >= 0 ? "+" : ""}
              {last.total - first.total} kg on the total
            </Text>{" "}
            this season
          </Text>
        </>
      ) : (
        <Text style={styles.emptyText}>
          Every verified lift adds a point to this chart. Post{" "}
          {Math.max(0, 3 - points.length)} more and your total starts drawing
          its line.
        </Text>
      )}
    </Card>
  );
}

function SinclairCard({
  sinclair,
  total,
  bodyweight,
}: {
  sinclair: number | null;
  total: number | null;
  bodyweight: number | null;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Pound for pound</Text>
      {sinclair ? (
        <>
          <Text style={styles.ratioBig}>{sinclair}</Text>
          <Text style={styles.sinclairKey}>SINCLAIR POINTS</Text>
          <View style={styles.ratioSplit}>
            <View style={styles.ratioSide}>
              <Text style={styles.ratioVal}>
                {total ?? "—"} <Text style={styles.ratioUnit}>kg</Text>
              </Text>
              <Text style={styles.ratioKey}>TOTAL</Text>
            </View>
            <View style={styles.ratioDiv} />
            <View style={styles.ratioSide}>
              <Text style={styles.ratioVal}>
                {bodyweight ?? "—"} <Text style={styles.ratioUnit}>kg</Text>
              </Text>
              <Text style={styles.ratioKey}>BODYWEIGHT</Text>
            </View>
          </View>
          <View style={styles.verdict}>
            <Text style={styles.verdictText}>
              The sport's pound-for-pound score — it lets you compare yourself
              across every weight class.
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>
          Post a verified snatch and clean & jerk to get your Sinclair — the
          score that compares you across weight classes.
        </Text>
      )}
    </Card>
  );
}

function RankCardMini({
  me,
  season,
  sex,
}: {
  me: MyRankResponse["me"];
  season: SeasonMeta | null;
  sex: "M" | "F";
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Rank this season</Text>
      {me ? (
        <>
          <Text style={styles.ratioBig}>
            <Text style={styles.ratioPct}>#</Text>
            {me.rank}
          </Text>
          <Text style={styles.sinclairKey}>
            {(sex === "M" ? "MEN" : "WOMEN") + ` ${me.weightClass} KG`}
          </Text>
          <View style={styles.verdict}>
            <Text style={styles.verdictText}>
              {me.provisional ? (
                "Provisional — post one verified lift and this becomes real."
              ) : (
                <>
                  <Text style={styles.verdictBold}>
                    {season?.label ?? "This season"}
                  </Text>
                  {season?.endsAt
                    ? ` locks ${new Date(season.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — every kilo you add defends the spot.`
                    : " — every kilo you add defends the spot."}
                </>
              )}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>
          You're not on a board yet. Post one verified lift and your rank
          appears here.
        </Text>
      )}
    </Card>
  );
}

/* ── carousel ─────────────────────────────────────────────────── */

interface InsightsCarouselProps {
  snatchKg: number | null;
  cleanKg: number | null;
  sinclair: number | null;
  totalKg: number | null;
  bodyweightKg: number | null;
  lifts: MyLift[];
  me: MyRankResponse["me"];
  season: SeasonMeta | null;
  sex: "M" | "F";
}

export const InsightsCarousel: React.FC<InsightsCarouselProps> = ({
  snatchKg,
  cleanKg,
  sinclair,
  totalKg,
  bodyweightKg,
  lifts,
  me,
  season,
  sex,
}) => {
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const cards = [
    <RatioCard key="ratio" sn={snatchKg} cj={cleanKg} />,
    <TotalCard key="total" lifts={lifts} />,
    <SinclairCard
      key="sinclair"
      sinclair={sinclair}
      total={totalKg}
      bodyweight={bodyweightKg}
    />,
    <RankCardMini key="rank" me={me} season={season} sex={sex} />,
  ];

  return (
    <View>
      <FlatList
        ref={listRef}
        data={cards}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <View style={{ width: CARD_W }}>{item}</View>}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / CARD_W))
        }
      />
      <View style={styles.dots}>
        {cards.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
};

/* ── styles ───────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olySpacing[16],
    minHeight: 312,
  },
  cardTitle: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    marginBottom: olySpacing[12],
  },
  emptyText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
    marginTop: olySpacing[4],
  },
  ratioBig: {
    fontSize: 40,
    lineHeight: 46,
    fontFamily: olyTypography.display.fontFamily,
    fontWeight: "500",
    color: olyColors.text.primary,
    textAlign: "center",
  },
  ratioPct: {
    fontSize: 20,
    color: olyColors.text.secondary,
  },
  sinclairKey: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    textAlign: "center",
    marginTop: olySpacing[4],
    marginBottom: olySpacing[12],
  },
  ratioSplit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[20],
    marginTop: olySpacing[12],
  },
  ratioSide: { alignItems: "center" },
  ratioVal: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  ratioUnit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  ratioKey: {
    ...olyTypography.caption,
    fontSize: 12,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    marginTop: olySpacing[4],
  },
  ratioDiv: {
    width: 1,
    height: 30,
    backgroundColor: olyColors.border.default,
  },
  ratioBar: {
    height: 5,
    borderRadius: olyRadius.sm,
    backgroundColor: olyPalette.cardElevated,
    marginTop: olySpacing[16],
    marginHorizontal: olySpacing[4],
  },
  ratioIdeal: {
    position: "absolute",
    left: "40%",
    width: "20%",
    top: 0,
    bottom: 0,
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.sm,
  },
  ratioMark: {
    position: "absolute",
    top: -3,
    width: 11,
    height: 11,
    marginLeft: -6,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
  },
  ratioScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: olySpacing[8],
    marginHorizontal: olySpacing[4],
  },
  ratioScaleText: {
    ...olyTypography.caption,
    fontSize: 12,
    color: olyColors.text.disabled,
  },
  verdict: {
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.sm + 4,
    padding: olySpacing[12],
    marginTop: olySpacing[12],
  },
  verdictText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
  },
  verdictBold: {
    fontFamily: olyTypography.label.fontFamily,
    fontWeight: "500",
    color: olyColors.text.primary,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: olySpacing[8],
  },
  xAxisText: {
    ...olyTypography.caption,
    fontSize: 12,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  foot: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[12],
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: olySpacing[8],
    marginTop: olySpacing[12],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
  },
  dotOn: {
    backgroundColor: olyColors.text.secondary,
  },
});
