/**
 * Tap an insight card, get a quick explanation (Insight explain A on the
 * canvas): a title with your own number, then three short answers.
 * What it means, why it matters, what to do. Copy is built from the same
 * numbers the card shows, so it always talks about you.
 */
import {
  Glass,
  GlassButton,
  Overline,
  Sheet,
} from "@/src/oly-components/shop/ShopKit";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/** Where a Sinclair score comes from: total times a bodyweight factor. */
export interface SinclairMath {
  total: number;
  score: number;
  /** Bodyweight on the day of the lift, which is what the score uses. */
  liftBodyweightKg: number | null;
  /** Today's bodyweight, shown only when it differs. */
  currentBodyweightKg: number | null;
  /** Totals that score the same at other bodyweights. */
  sameAs: { bw: number; total: number }[];
}

/** This season: the board around you and what each next step costs. */
export interface SeasonView {
  daysLeft: number | null;
  /** Places gained this month. */
  move: number | null;
  total: number;
  rows: { rank: number; name: string; value: number; me?: boolean }[];
  targets: { label: string; kg: number }[];
}

export interface InsightExplain {
  over: string;
  title: string;
  season?: SeasonView;
  /** Pound for pound only: shows the math instead of "What it means". */
  sinclair?: SinclairMath;
  means: string;
  matters: string;
  todo: string;
}

export function InsightExplainSheet({
  explain,
  onClose,
}: {
  explain: InsightExplain | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!explain} onClose={onClose}>
      {explain ? (
        <>
          <Overline>{explain.over}</Overline>
          <Text style={s.title}>{explain.title}</Text>
          {explain.sinclair ? <SinclairBreakdown m={explain.sinclair} /> : null}
          {explain.season ? <SeasonBreakdown v={explain.season} /> : null}
          {[
            ...(explain.sinclair || explain.season
              ? []
              : [["What it means", explain.means]]),
            ["Why it matters", explain.matters],
            ...(explain.season ? [] : [["What to do", explain.todo]]),
          ].map(([q, a], i) => (
            <View key={q} style={[s.row, i > 0 && s.rule]}>
              <Text style={s.q}>{q}</Text>
              <Text style={s.a}>{a}</Text>
            </View>
          ))}
          <GlassButton label="Got it" onPress={onClose} style={s.btn} />
        </>
      ) : null}
    </Sheet>
  );
}

function SeasonBreakdown({ v }: { v: SeasonView }) {
  const me = v.rows.find((r) => r.me);
  const stats = [
    v.daysLeft != null ? { value: `${v.daysLeft}`, label: "Days left" } : null,
    v.move ? { value: `Up ${v.move}`, label: "This month" } : null,
    { value: `${v.total}`, label: "Your total, kg" },
  ].filter(Boolean) as { value: string; label: string }[];
  return (
    <View style={s.math}>
      <Glass radius={olyRadius.tile} style={s.eq}>
        {stats.map((x, i) => (
          <React.Fragment key={x.label}>
            {i > 0 ? <View style={s.vRule} /> : null}
            <Term value={x.value} label={x.label} />
          </React.Fragment>
        ))}
      </Glass>

      <Overline style={s.sameLabel}>AROUND YOU</Overline>
      <Glass radius={olyRadius.tile}>
        {v.rows.map((r, i) => {
          const diff = me ? Math.round(r.value - me.value) : 0;
          return (
            <View
              key={r.rank}
              style={[s.ladderRow, i > 0 && s.rule, r.me && s.ladderMe]}
            >
              <Text style={[s.ladderRank, r.me && s.ladderInk]}>#{r.rank}</Text>
              <Text
                style={[s.ladderName, r.me && s.ladderInk]}
                numberOfLines={1}
              >
                {r.me ? "You" : r.name}
              </Text>
              <Text style={[s.ladderValue, r.me && s.ladderInk]}>
                {r.value}
              </Text>
              <View style={s.diffSlot}>
                {r.me ? null : (
                  <Text style={s.diff}>
                    {diff > 0 ? `+${diff}` : `${diff}`}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </Glass>

      {v.targets.length ? (
        <>
          <Overline style={s.sameLabel}>NEXT TARGETS</Overline>
          <View style={s.targets}>
            {v.targets.map((t) => (
              <Glass key={t.label} radius={olyRadius.tile} style={s.target}>
                <Text style={s.targetKg}>
                  +{t.kg}
                  <Text style={s.sameUnit}> kg</Text>
                </Text>
                <Text style={s.termLabel} numberOfLines={1}>
                  {t.label}
                </Text>
              </Glass>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function Term({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.term}>
      <Text style={s.termValue}>{value}</Text>
      <Text style={s.termLabel}>{label}</Text>
    </View>
  );
}

function SinclairBreakdown({ m }: { m: SinclairMath }) {
  const factor = m.score / m.total;
  return (
    <View style={s.math}>
      <Glass radius={olyRadius.tile} style={s.eq}>
        <Term value={`${m.total}`} label="Your total, kg" />
        <Text style={s.op}>×</Text>
        <Term
          value={factor.toFixed(3)}
          label={
            m.liftBodyweightKg
              ? `Factor at ${m.liftBodyweightKg} kg`
              : "Size factor"
          }
        />
        <Text style={s.op}>=</Text>
        <Term value={`${Math.round(m.score)}`} label="Sinclair" />
      </Glass>
      <Text style={s.a}>
        The factor comes from your bodyweight on the day of the lift
        {m.liftBodyweightKg ? `, ${m.liftBodyweightKg} kg` : ""}. Lighter
        lifters get a bigger factor and heavier lifters a smaller one, so every
        size is scored on the same scale.
        {m.currentBodyweightKg &&
        m.liftBodyweightKg &&
        Math.abs(m.currentBodyweightKg - m.liftBodyweightKg) >= 0.5
          ? ` You weigh ${m.currentBodyweightKg} kg now. Your next verified lift uses that.`
          : ""}
      </Text>
      {m.sameAs.length ? (
        <>
          <Overline style={s.sameLabel}>SAME SCORE AS</Overline>
          <Glass radius={olyRadius.tile}>
            {m.sameAs.map((x, i) => (
              <View key={x.bw} style={[s.sameRow, i > 0 && s.rule]}>
                <Text style={s.sameBw}>A {x.bw} kg lifter</Text>
                <Text style={s.sameTotal}>
                  {x.total} <Text style={s.sameUnit}>kg total</Text>
                </Text>
              </View>
            ))}
          </Glass>
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  math: {
    marginTop: olySpacing[8],
    marginBottom: olySpacing[8],
    gap: olySpacing[12],
  },
  eq: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: olySpacing[8],
  },
  term: { flex: 1, alignItems: "center" },
  termValue: {
    fontFamily: olyFonts.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.6,
    color: olyColors.text.primary,
  },
  termLabel: {
    marginTop: olySpacing[4],
    fontFamily: olyFonts.regular,
    fontSize: 11,
    color: olyColors.text.hint,
  },
  op: {
    fontFamily: olyFonts.regular,
    fontSize: 18,
    color: olyColors.text.hint,
  },
  sameLabel: { marginTop: olySpacing[4], marginHorizontal: olySpacing[4] },
  vRule: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: olyColors.glass.rule,
  },
  ladderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: olySpacing[16],
  },
  ladderMe: { backgroundColor: olyColors.glass.accentFill },
  ladderRank: {
    width: 32,
    fontFamily: olyFonts.bold,
    fontSize: 13,
    color: olyColors.text.hint,
  },
  ladderName: {
    flex: 1,
    fontFamily: olyFonts.medium,
    fontSize: 14,
    color: olyColors.text.secondary,
  },
  ladderValue: {
    fontFamily: olyFonts.bold,
    fontSize: 14,
    color: olyColors.text.secondary,
  },
  ladderInk: { color: olyColors.text.primary },
  diffSlot: { width: 40, alignItems: "flex-end" },
  diff: {
    fontFamily: olyFonts.medium,
    fontSize: 12,
    color: olyColors.text.hint,
  },
  targets: { flexDirection: "row", gap: olySpacing[8] },
  target: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  targetKg: {
    fontFamily: olyFonts.bold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: olyColors.text.primary,
  },
  sameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sameBw: {
    fontFamily: olyFonts.medium,
    fontSize: 14,
    color: olyColors.text.secondary,
  },
  sameTotal: {
    fontFamily: olyFonts.bold,
    fontSize: 15,
    color: olyColors.text.primary,
  },
  sameUnit: {
    fontFamily: olyFonts.regular,
    fontSize: 12,
    color: olyColors.text.hint,
  },
  title: {
    marginTop: olySpacing[8],
    marginBottom: olySpacing[8],
    fontFamily: olyFonts.bold,
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.4,
    color: olyColors.text.primary,
  },
  row: { paddingVertical: olySpacing[16] },
  rule: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  q: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.text.primary },
  a: {
    marginTop: olySpacing[4],
    fontFamily: olyFonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: olyColors.text.secondary,
  },
  btn: { marginTop: olySpacing[12] },
});
