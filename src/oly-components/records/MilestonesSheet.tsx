/**
 * Milestones sheet for the record book.
 *
 * Two views, from the canvas:
 * - Overview (the "?"): olys earned from milestones out of the total,
 *   the closest reward, what is waiting on a video, and every lift.
 * - One lift (its milestone line, or a row in the overview): now and next,
 *   the four step ladder, and the video button.
 */
import { LEVEL_OLYS, MAX_LEVEL } from "@/src/oly-components/records/ladder";
import {
  Glass,
  GlassButton,
  GlowBar,
  Overline,
  PrimaryButton,
  QuietButton,
  SHEET_SIDE,
  SheetBackdrop,
  SheetGrabber,
  SheetSurface,
} from "@/src/oly-components/shop/ShopKit";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface MilestoneLift {
  name: string;
  /** Best number on record, in display units. */
  best: number;
  /** The four milestone weights, in display units. */
  marks: number[];
  /** Bodyweight multiple of each milestone. */
  mults: number[];
  /** Milestones reached, 0 to 4. */
  level: number;
  verified: boolean;
}

/** "all" for the overview, or a lift name. */
export type MilestoneView = "all" | string;

const olysUpTo = (level: number) => LEVEL_OLYS.slice(0, level).reduce((a, b) => a + b, 0);
const TOTAL_PER_LIFT = olysUpTo(MAX_LEVEL);
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Progress from the last milestone reached to the next one, 0 to 1. */
function partial(l: MilestoneLift) {
  if (l.level >= MAX_LEVEL) return 1;
  const prev = l.level === 0 ? 0 : l.marks[l.level - 1];
  return Math.max(0, Math.min(1, (l.best - prev) / (l.marks[l.level] - prev)));
}

export default function MilestonesSheet({
  view,
  onClose,
  lifts,
  unit,
  bodyweight,
  onAddVideo,
}: {
  /** null keeps the sheet closed. */
  view: MilestoneView | null;
  onClose: () => void;
  lifts: MilestoneLift[];
  unit: string;
  /** Bodyweight in display units, for the footnote. */
  bodyweight: string | null;
  onAddVideo: (liftName: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<MilestoneView>("all");
  useEffect(() => {
    if (view) setCurrent(view);
  }, [view]);

  const lift = current === "all" ? null : lifts.find((l) => l.name === current) ?? null;

  return (
    <Modal visible={!!view} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SheetBackdrop onPress={onClose} />
      <SheetSurface style={[s.sheet, { top: insets.top + 10, paddingBottom: insets.bottom + olySpacing[8] }]}>
        <SheetGrabber />
        <Text style={s.head}>{lift ? lift.name.toUpperCase() : "MILESTONES"}</Text>
        {lift ? (
          <LiftView
            lift={lift}
            unit={unit}
            bodyweight={bodyweight}
            onAddVideo={() => {
              onClose();
              onAddVideo(lift.name);
            }}
            onAll={() => setCurrent("all")}
          />
        ) : (
          <Overview
            lifts={lifts}
            unit={unit}
            onOpen={setCurrent}
            onEarnAll={() => {
              onClose();
              router.push("/athlete/how-olys");
            }}
          />
        )}
      </SheetSurface>
    </Modal>
  );
}

/* ─── Overview ───────────────────────────────────────────────────── */

/**
 * Two columns, a thin bar and a footer line. Both sheet views open with
 * it, and the profile's rank and olys card is one too.
 */
export function NowNext({
  left,
  right,
  pct,
  footLeft,
  footRight,
}: {
  left: { over: string; value: string; unit?: string; hint: string };
  right: { over: string; value: string; unit?: string; hint: string };
  pct: number | null;
  footLeft?: React.ReactNode;
  footRight?: React.ReactNode;
}) {
  return (
    <Glass radius={olyRadius.xl} style={s.nowNext}>
      <View style={s.cols}>
        {[left, right].map((c, i) => (
          <React.Fragment key={c.over}>
            {i > 0 ? <View style={s.colRule} /> : null}
            <View style={s.col}>
              <Overline>{c.over}</Overline>
              <Text style={s.colNum} numberOfLines={1} adjustsFontSizeToFit>
                {c.value}
                {c.unit ? <Text style={s.colUnit}> {c.unit}</Text> : null}
              </Text>
              <Text style={s.hint}>{c.hint}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
      {pct != null ? (
        <View style={s.nowNextFoot}>
          <GlowBar pct={pct} height={4} />
          <View style={[s.spread, s.footLine]}>
            <Text style={s.small}>{footLeft}</Text>
            <Text style={s.small}>{footRight}</Text>
          </View>
        </View>
      ) : null}
    </Glass>
  );
}

function Overview({
  lifts,
  unit,
  onOpen,
  onEarnAll,
}: {
  lifts: MilestoneLift[];
  unit: string;
  onOpen: (name: string) => void;
  onEarnAll: () => void;
}) {
  const { earned, waiting, total } = milestoneOlys(lifts);
  const closest = lifts
    .filter((l) => l.level < MAX_LEVEL)
    .sort((a, b) => a.marks[a.level] - a.best - (b.marks[b.level] - b.best))[0];

  return (
    <>
      <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <NowNext
          left={{ over: "EARNED", value: earned.toLocaleString(), unit: "olys", hint: `of ${total.toLocaleString()}` }}
          right={
            closest
              ? {
                  over: "NEXT",
                  value: `+${LEVEL_OLYS[closest.level]}`,
                  hint: `${closest.name}, ${round1(closest.marks[closest.level] - closest.best)} ${unit} to go`,
                }
              : { over: "NEXT", value: "Done", hint: "Every milestone reached" }
          }
          pct={total ? earned / total : 0}
          footLeft={
            <>
              <Text style={s.strong}>{Math.round((earned / (total || 1)) * 100)}%</Text> of every milestone
            </>
          }
          footRight={
            waiting > 0 ? (
              <>
                <Text style={s.strong}>+{waiting.toLocaleString()}</Text> waiting on video
              </>
            ) : null
          }
        />

        <Overline style={s.section}>YOUR LIFTS</Overline>
        <MilestoneList lifts={lifts} unit={unit} onOpen={onOpen} />
      </ScrollView>
      <GlassButton label="Every way to earn olys" onPress={onEarnAll} style={s.footBtn} />
    </>
  );
}

/** Olys from milestones: paid (verified), waiting on a video, and the most there is. */
export function milestoneOlys(lifts: MilestoneLift[]) {
  const sum = (ls: MilestoneLift[]) => ls.reduce((n, l) => n + olysUpTo(l.level), 0);
  return {
    earned: sum(lifts.filter((l) => l.verified)),
    waiting: sum(lifts.filter((l) => !l.verified)),
    total: TOTAL_PER_LIFT * lifts.length,
  };
}

/** One row per lift: name, what is next, the four step bars. */
export function MilestoneList({
  lifts,
  unit,
  onOpen,
  style,
}: {
  lifts: MilestoneLift[];
  unit: string;
  onOpen: (name: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.group, style]}>
      {lifts.map((l, i) => (
        <Pressable
          key={l.name}
          onPress={() => onOpen(l.name)}
          accessibilityRole="button"
          accessibilityLabel={`${l.name} milestones`}
          style={({ pressed }) => [s.liftRow, i > 0 && s.rule, pressed && s.pressed]}
        >
          <View style={s.flex}>
            <View style={s.spread}>
              <Text style={s.liftName}>{l.name}</Text>
              <Text style={s.rowNote}>
                {l.verified ? (
                  l.level >= MAX_LEVEL ? (
                    "All earned"
                  ) : (
                    <>
                      <Text style={s.strong}>
                        {round1(l.marks[l.level] - l.best)} {unit}
                      </Text>{" "}
                      to +{LEVEL_OLYS[l.level]}
                    </>
                  )
                ) : l.level > 0 ? (
                  `+${olysUpTo(l.level)} waiting on video`
                ) : (
                  "No video yet"
                )}
              </Text>
            </View>
            <Bars lift={l} />
          </View>
          <Ionicons name="chevron-forward" size={16} color={olyColors.text.hint} />
        </Pressable>
      ))}
    </View>
  );
}

function Bars({ lift }: { lift: MilestoneLift }) {
  return (
    <View style={s.bars}>
      {lift.marks.map((_, i) => {
        const fill = i < lift.level ? 1 : i === lift.level ? partial(lift) : 0;
        return (
          <View key={i} style={s.track}>
            <View
              style={[s.barFill, lift.verified ? s.barOn : s.barGrey, { width: `${fill * 100}%` }]}
            />
          </View>
        );
      })}
    </View>
  );
}

/* ─── One lift ───────────────────────────────────────────────────── */

function LiftView({
  lift,
  unit,
  bodyweight,
  onAddVideo,
  onAll,
}: {
  lift: MilestoneLift;
  unit: string;
  bodyweight: string | null;
  onAddVideo: () => void;
  onAll: () => void;
}) {
  const done = lift.level >= MAX_LEVEL;
  const next = done ? null : lift.marks[lift.level];
  const steps = [0, 1, 2, 3].reverse();

  return (
    <>
      <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <NowNext
          left={{ over: "NOW", value: String(lift.best), unit, hint: `Level ${lift.level}` }}
          right={
            next != null
              ? { over: "NEXT", value: String(next), unit, hint: `${lift.mults[lift.level]}× bodyweight` }
              : { over: "NEXT", value: "Done", hint: "Every milestone reached" }
          }
          pct={next != null ? partial(lift) : null}
          footLeft={
            <>
              <Text style={s.strong}>
                {round1((next ?? 0) - lift.best)} {unit}
              </Text>{" "}
              to go
            </>
          }
          footRight={
            <>
              Pays <Text style={s.strong}>+{LEVEL_OLYS[lift.level]} olys</Text>
            </>
          }
        />

        <Overline style={s.section}>THE LADDER</Overline>
        <View style={s.group}>
          {steps.map((i, row) => {
            const reached = i < lift.level;
            const isNext = i === lift.level;
            return (
              <View key={i} style={[s.step, row > 0 && s.rule]}>
                {reached && lift.verified ? (
                  <View style={[s.dot, s.dotOn]}>
                    <Ionicons name="checkmark" size={14} color={olyColors.text.onAccent} />
                  </View>
                ) : reached ? (
                  <View style={[s.dot, s.dotLocked]}>
                    <Ionicons name="lock-closed-outline" size={12} color={olyColors.text.secondary} />
                  </View>
                ) : (
                  <View style={[s.dot, isNext ? s.dotNext : s.dotIdle]} />
                )}
                <View style={s.flex}>
                  <Text style={[s.stepNum, !reached && !isNext && s.dim]}>
                    {lift.marks[i]} {unit}
                  </Text>
                  <Text style={s.hint}>
                    Level {i + 1}, {lift.mults[i]}× bodyweight
                  </Text>
                </View>
                {reached && lift.verified ? (
                  <Text style={s.small}>Earned</Text>
                ) : (
                  <Text style={[s.stepNum, !reached && !isNext && s.dim]}>
                    +{LEVEL_OLYS[i]}
                    {reached ? <Text style={s.small}> locked</Text> : null}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
        <Text style={s.note}>
          {bodyweight ? `Steps are multiples of your ${bodyweight} ${unit} bodyweight. ` : ""}
          Each pays once, on a verified lift.
        </Text>
      </ScrollView>

      <PrimaryButton
        label={
          lift.verified || lift.level === 0
            ? `Post a ${lift.name.toLowerCase()} video`
            : `Add a video, unlock +${olysUpTo(lift.level)}`
        }
        onPress={onAddVideo}
        style={s.footBtn}
      />
      <QuietButton label="All milestones" onPress={onAll} />
    </>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.7 },
  spread: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: olySpacing[8] },
  sheet: {
    position: "absolute",
    left: SHEET_SIDE,
    right: SHEET_SIDE,
    bottom: 0,
    paddingHorizontal: olySpacing[16],
    paddingTop: 10,
  },
  head: {
    textAlign: "center",
    fontFamily: olyFonts.medium,
    fontSize: 13,
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
  },
  content: { paddingTop: olySpacing[16], paddingBottom: olySpacing[16] },
  section: { marginTop: olySpacing[24], marginBottom: 10, marginHorizontal: olySpacing[4] },
  small: { ...olyTypography.caption, fontSize: 13, color: olyColors.text.secondary },
  hint: { marginTop: 2, ...olyTypography.caption, fontSize: 12, color: olyColors.text.hint },
  strong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  dim: { color: olyColors.text.hint },
  group: {
    borderRadius: olyRadius.tile,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    overflow: "hidden",
  },
  rule: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  footBtn: { marginTop: olySpacing[8] },

  /* Overview */
  liftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: olySpacing[16],
  },
  liftName: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.text.primary },
  rowNote: { ...olyTypography.caption, fontSize: 12, color: olyColors.text.secondary },
  bars: { flexDirection: "row", gap: olySpacing[4], marginTop: 10 },
  track: {
    flex: 1,
    height: 4,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.idle,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: olyRadius.full },
  barOn: { backgroundColor: olyColors.accent },
  barGrey: { backgroundColor: olyColors.text.secondary },

  /* One lift */
  nowNext: { overflow: "hidden" },
  cols: { flexDirection: "row" },
  col: { flex: 1, paddingHorizontal: olySpacing[20], paddingTop: olySpacing[20], paddingBottom: 18 },
  colRule: { width: 1, marginVertical: 18, backgroundColor: olyColors.glass.rule },
  colNum: {
    marginTop: olySpacing[8],
    fontFamily: olyFonts.bold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.4,
    color: olyColors.text.primary,
  },
  colUnit: { fontSize: 14, letterSpacing: 0, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  nowNextFoot: { paddingHorizontal: olySpacing[20], paddingBottom: 18 },
  footLine: { marginTop: olySpacing[12] },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 60,
    paddingHorizontal: 18,
  },
  dot: { width: 26, height: 26, borderRadius: olyRadius.full, alignItems: "center", justifyContent: "center" },
  dotOn: { backgroundColor: olyColors.accent, ...olyGlow.sm },
  dotLocked: { backgroundColor: olyColors.glass.control },
  dotNext: { borderWidth: 2, borderColor: olyColors.accent },
  dotIdle: { borderWidth: 1, borderColor: olyColors.glass.border },
  stepNum: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.text.primary },
  note: {
    marginTop: olySpacing[12],
    marginHorizontal: olySpacing[4],
    ...olyTypography.caption,
    fontSize: 12,
    lineHeight: 17,
    color: olyColors.text.hint,
  },
});
