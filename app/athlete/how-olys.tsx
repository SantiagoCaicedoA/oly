import { OLY_LOGO_PATH, OLY_LOGO_VIEWBOX } from "@/constants/oly-logo";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { LEVEL_OLYS } from "@/src/oly-components/records/ladder";
import {
  Glass,
  GlowBar,
  Glows,
  kit,
  Overline,
  PrimaryButton,
} from "@/src/oly-components/shop/ShopKit";
import { fmt, tierFor, TIERS, toCad, useWallet } from "@/src/oly-mock/wallet";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
import Svg, { Path } from "react-native-svg";

/**
 * How olys work. Four story pages from the canvas (D3 Stories 1 to 4):
 * Why, Earn (interactive tabs and bodyweight milestones), Value and Tiers.
 *
 * Mock data only. Earn values, the store catalog and tier thresholds come
 * from the Rewards Program Spec. Tier names are placeholders (Tier 1 to 5).
 */


const PAGES = 4;

export default function HowOlysScreen() {
  const [page, setPage] = useState(0);
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(100);
  const fade = useRef(new Animated.Value(1)).current;

  const go = (next: number) => {
    if (next < 0 || next >= PAGES || next === page) return;
    Haptics.selectionAsync();
    Animated.timing(fade, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setPage(next);
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const close = () => router.back();
  const { width } = useWindowDimensions();

  return (
    <View style={s.screen}>
      <Glows variant="story" />
      <SafeAreaView style={s.safe} edges={["bottom"]}>
        {/* Progress + close float over the page, with a fade behind. */}
        <OlyFloatingHeader onLayout={onHeaderLayout}>
        <View style={s.progress}>
          {Array.from({ length: PAGES }).map((_, i) => (
            <Pressable
              key={i}
              onPress={() => go(i)}
              style={s.segHit}
              hitSlop={{ top: 14, bottom: 14 }}
              accessibilityRole="button"
              accessibilityLabel={`Page ${i + 1} of ${PAGES}`}
            >
              <View style={[s.seg, i <= page && s.segOn]} />
            </Pressable>
          ))}
        </View>
        <View style={s.closeRow}>
          <Pressable hitSlop={4}
            onPress={close}
            style={({ pressed }) => pressed && kit.pressed}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Glass radius={olyRadius.full} style={s.closeBtn}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M6 6l12 12M18 6L6 18"
                  stroke={olyColors.text.primary}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              </Svg>
            </Glass>
          </Pressable>
        </View>
        </OlyFloatingHeader>

        <Pressable
          style={s.flex}
          onPress={(e) => {
            // Story style: left third goes back, the rest goes forward.
            // Tabs and other buttons inside the page handle their own taps.
            if (e.nativeEvent.pageX < width / 3) go(page - 1);
            else go(page + 1);
          }}
        >
          <Animated.View style={[s.flex, { opacity: fade }]}>
            <ScrollView
              key={page}
              contentContainerStyle={[s.body, { paddingTop: headerH }]}
              scrollIndicatorInsets={{ top: headerH }}
              showsVerticalScrollIndicator={false}
            >
              {page === 0 && <WhyPage />}
              {page === 1 && <EarnPage />}
              {page === 2 && <ValuePage />}
              {page === 3 && <TiersPage />}
            </ScrollView>
          </Animated.View>
        </Pressable>

        {page === PAGES - 1 && (
          <View style={s.footer}>
            <PrimaryButton label="Start earning" onPress={close} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

/* ─── Shared ─────────────────────────────────────────────────────── */

function Head({
  n,
  label,
  title,
  sub,
}: {
  n: number;
  label: string;
  title: string;
  sub: string;
}) {
  return (
    <View>
      <Text style={s.kicker}>
        {n} OF {PAGES} · {label}
      </Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.sub}>{sub}</Text>
    </View>
  );
}

function Seg<T extends string>({
  items,
  value,
  onChange,
  small,
}: {
  items: { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
  small?: boolean;
}) {
  return (
    <Glass radius={olyRadius.full} style={s.segWrap}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(it.key);
            }}
            hitSlop={small ? 7 : 5}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[
              s.segItem,
              small ? s.segItemSmall : null,
              on && s.segItemOn,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                small ? s.segTextSmall : s.segText,
                on && s.segTextOn,
              ]}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </Glass>
  );
}

/* ─── 1. Why ─────────────────────────────────────────────────────── */

function WhyPage() {
  return (
    <View style={s.whyWrap}>
      <Svg width={52} height={52} viewBox={OLY_LOGO_VIEWBOX}>
        <Path d={OLY_LOGO_PATH} fill={olyColors.text.primary} />
      </Svg>
      <Text style={[s.kicker, s.whyKicker]}>1 OF {PAGES} · WHY</Text>
      <Text style={s.whyTitle}>{"Your lifts\nare worth\nsomething."}</Text>
      <Text style={s.sub}>
        Every verified lift adds olys to your wallet. Stack them, climb tiers,
        spend them on real gear.
      </Text>
    </View>
  );
}

/* ─── 2. Earn ────────────────────────────────────────────────────── */

type GroupKey = "train" | "miles" | "comp" | "comm";
type Row = { t: string; d: string; o: string; milestones?: boolean };

const GROUPS: Record<GroupKey, { label: string; sub: string; rows: Row[] }> = {
  train: {
    label: "Train",
    sub: "Show up and log your sessions.",
    rows: [
      { t: "Training log with top set video", d: "4 per week", o: "20" },
      { t: "Weekly consistency", d: "3+ logs in a week", o: "50" },
      { t: "4 week streak", d: "Once every 4 weeks", o: "100" },
      { t: "First video of a new lift", d: "Once per lift", o: "50" },
      { t: "Comeback bonus", d: "First lift after 30+ days away", o: "100" },
    ],
  },
  miles: {
    label: "Milestones",
    sub: "Get stronger and it shows.",
    rows: [
      { t: "Bodyweight check", d: "Redo every 90 days", o: "100" },
      { t: "Training PR", d: "Snatch, C&J, back or front squat", o: "75" },
      {
        t: "Bodyweight milestones",
        d: "Lift a multiple of your bodyweight",
        o: "100 to 800",
        milestones: true,
      },
    ],
  },
  comp: {
    label: "Compete",
    sub: "Step on the platform.",
    rows: [
      { t: "Meet day", d: "Result plus every attempt on video", o: "400" },
      { t: "Meet PR", d: "Snatch, C&J or total", o: "150" },
      { t: "First meet ever", d: "One time bonus", o: "200" },
      { t: "Oly season comp", d: "Once per season", o: "250" },
      { t: "Challenge completed", d: "Set per challenge", o: "200 to 500" },
    ],
  },
  comm: {
    label: "Community",
    sub: "Bring people into the sport.",
    rows: [
      { t: "Friend who posts a verified lift", d: "Up to 5 per month", o: "200" },
      { t: "Check in at a meet", d: "Go watch, up to 4 per month", o: "50" },
      { t: "Bring a friend to a meet", d: "Per meet", o: "50" },
      { t: "Share a lift card", d: "2 per week", o: "10" },
      { t: "Complete your profile", d: "One time", o: "50" },
    ],
  },
};

function EarnPage() {
  const [g, setG] = useState<GroupKey>("train");
  const group = GROUPS[g];
  return (
    <View>
      <Head
        n={2}
        label="EARN"
        title={"Every lift\npays you back."}
        sub="Four ways to earn. Tap through them."
      />
      <Seg
        items={(Object.keys(GROUPS) as GroupKey[]).map((k) => ({
          key: k,
          label: GROUPS[k].label,
        }))}
        value={g}
        onChange={setG}
      />
      <Glass radius={olyRadius.xl} style={s.earnCard}>
        {group.rows.map((r, i) => {
          const last = i === group.rows.length - 1;
          return (
            <View key={r.t}>
              <View style={[s.earnRow, !last && !r.milestones && s.rule]}>
                <View style={s.flex}>
                  <Text style={s.earnTitle}>{r.t}</Text>
                  <Text style={s.earnDesc}>{r.d}</Text>
                </View>
                <Text style={s.earnValue}>+{r.o}</Text>
              </View>
              {r.milestones && <Milestones />}
            </View>
          );
        })}
      </Glass>
      <Text style={s.note}>
        Lifts are verified within 72 hours, then olys land.
      </Text>
    </View>
  );
}

/** Mock athlete: 70 kg bodyweight, men's ladder from the spec. */
const BODYWEIGHT = 70;
type LiftKey = "snatch" | "cj" | "back" | "front";
const LIFTS: Record<LiftKey, { label: string; x: number[]; best: number }> = {
  snatch: { label: "Snatch", x: [0.5, 0.75, 1, 1.3], best: 62 },
  cj: { label: "C&J", x: [0.75, 1, 1.25, 1.6], best: 80 },
  back: { label: "Back squat", x: [1, 1.5, 2, 2.5], best: 118 },
  front: { label: "Front squat", x: [0.75, 1.25, 1.75, 2.1], best: 100 },
};

function Milestones() {
  const [lift, setLift] = useState<LiftKey>("snatch");
  const L = LIFTS[lift];
  const kg = L.x.map((m) => Math.round(m * BODYWEIGHT));
  const level = kg.filter((k) => L.best >= k).length;
  const fill = kg.map((k, i) => {
    if (L.best >= k) return 1;
    if (i !== level) return 0;
    const prev = i === 0 ? 0 : kg[i - 1];
    return (L.best - prev) / (k - prev);
  });
  const next = kg[level];

  return (
    <View style={s.mile}>
      <Seg
        small
        items={(Object.keys(LIFTS) as LiftKey[]).map((k) => ({
          key: k,
          label: LIFTS[k].label,
        }))}
        value={lift}
        onChange={setLift}
      />
      <View style={s.mileHead}>
        <Overline>YOUR BEST</Overline>
        {next !== undefined ? (
          <Text style={s.small}>
            <Text style={s.strong}>{next - L.best} kg</Text> to Level{" "}
            {level + 1}
          </Text>
        ) : (
          <Text style={s.small}>All levels done</Text>
        )}
      </View>
      <Text style={s.mileBest}>{L.best} kg</Text>
      <Text style={s.small}>
        Level {level} at {BODYWEIGHT} kg bodyweight
      </Text>
      <View style={s.mileBars}>
        {kg.map((k, i) => (
          <View key={i} style={s.flex}>
            <GlowBar pct={fill[i]} height={5} />
            <Text style={[s.mileKg, L.best < k && s.dim]}>{k} kg</Text>
            <Text style={s.mileOlys}>+{LEVEL_OLYS[i]} olys</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── 3. Value ───────────────────────────────────────────────────── */

const CATALOG = [
  { t: "$5 off", d: "On orders over $40", o: 1000 },
  { t: "Free shipping", d: "Canada and US, orders over $40", o: 1500 },
  { t: "$12 off", d: "On orders over $60", o: 2000 },
  { t: "Free Oly tee", d: "Added to orders over $50", o: 5000 },
];
const PRODUCTS = [
  { t: "Oly Socks", o: 3000 },
  { t: "Oly Cap", o: 5000 },
  { t: "Oly Tee", o: 7000 },
];

function ValuePage() {
  const w = useWallet();
  return (
    <View>
      <Head
        n={3}
        label="THE VALUE"
        title="200 olys = $1."
        sub="Real gear and savings on the Oly store."
      />
      <Glass radius={olyRadius.xl} style={s.youHave}>
        <Text style={s.youHaveLabel}>You have</Text>
        <View style={s.youHaveRow}>
          <Text style={s.youHaveOlys}>{fmt(w.balance)} olys</Text>
          <Text style={s.youHaveCad}>${toCad(w.balance)}</Text>
        </View>
      </Glass>
      <Glass radius={olyRadius.xl} style={s.catalog}>
        {CATALOG.map((c, i) => (
          <View
            key={c.t}
            style={[s.catRow, i < CATALOG.length - 1 && s.rule]}
          >
            <View style={s.flex}>
              <Text style={s.earnTitle}>{c.t}</Text>
              <Text style={s.earnDesc}>{c.d}</Text>
            </View>
            <View style={[s.dot, w.balance < c.o && s.dotOff]} />
            <Text style={s.catValue}>{fmt(c.o)}</Text>
          </View>
        ))}
      </Glass>
      <Text style={[s.kickerSmall, s.redeemLabel]}>What you could redeem</Text>
      <View style={s.products}>
        {PRODUCTS.map((p) => (
          <Glass key={p.t} radius={olyRadius.tile} style={s.product}>
            <LinearGradient
              colors={olyColors.glass.photoReady}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={s.productPhoto}
            />
            <Text style={s.productTitle}>{p.t}</Text>
            <Text style={s.earnDesc}>{fmt(p.o)} olys</Text>
          </Glass>
        ))}
      </View>
    </View>
  );
}

/* ─── 4. Tiers ───────────────────────────────────────────────────── */

const short = (n: number) => (n === 0 ? "0" : `${n / 1000}k`);

function TiersPage() {
  const w = useWallet();
  const life = w.lifetime;
  const { index: cur, next, pct } = tierFor(life);
  const segFill = (i: number) => (i < cur ? 1 : i > cur ? 0 : pct);

  return (
    <View>
      <Head
        n={4}
        label="TIERS"
        title={"Level up,\nunlock more."}
        sub="Tiers count all the olys you have ever earned. Spending never drops you."
      />
      <Glass
        radius={olyRadius.xl}
        colors={olyColors.glass.ticket}
        borderColor={olyColors.glass.accentBorder}
        style={s.tierCard}
      >
        <View style={s.tierHead}>
          <Overline>YOUR TIER</Overline>
          {next && (
            <Text style={s.small}>
              <Text style={s.strong}>{fmt(next.at - life)}</Text> to Tier{" "}
              {cur + 2}
            </Text>
          )}
        </View>
        <Text style={s.tierName}>Tier {cur + 1}</Text>
        <View style={s.tierTrack}>
          {TIERS.map((t, i) => (
            <View key={i} style={s.flex}>
              <GlowBar pct={segFill(i)} height={5} />
              <Text style={[s.tierSegName, i > cur && s.dim]}>
                Tier {i + 1}
              </Text>
              <Text style={s.tierSegAt}>{short(t.at)}</Text>
            </View>
          ))}
        </View>
      </Glass>

      <Glass radius={olyRadius.xl} style={s.perks}>
        <Overline style={s.perksLabel}>WHAT EACH TIER GIVES YOU</Overline>
        {TIERS.slice(1).map((t, k) => {
          const i = k + 1;
          const on = i <= cur;
          return (
            <View
              key={i}
              style={[
                s.perkRow,
                k > 0 && s.ruleTop,
                i > cur + 1 && s.faded,
              ]}
            >
              <View style={s.perkIcon}>
                {on ? (
                  <Svg width={14} height={14} viewBox="0 0 24 24">
                    <Path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke={olyColors.accent}
                      strokeWidth={2.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                ) : (
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2ZM8 11V8a4 4 0 0 1 8 0v3"
                      stroke={olyColors.text.hint}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
              </View>
              <View style={s.flex}>
                <View style={s.perkTitleRow}>
                  <Text style={s.perkTitle}>Tier {i + 1}</Text>
                  {i === cur && (
                    <View style={s.youTag}>
                      <Text style={s.youText}>YOU</Text>
                    </View>
                  )}
                </View>
                <Text style={s.earnDesc}>{t.perk}</Text>
              </View>
              <Text style={s.perkAt}>{fmt(t.at)}</Text>
            </View>
          );
        })}
      </Glass>
      {next && (
        <Text style={s.social}>38 lifters reached Tier {cur + 2} this month</Text>
      )}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  safe: { flex: 1 },
  flex: { flex: 1 },

  progress: { flexDirection: "row", gap: olySpacing[4], paddingHorizontal: olySpacing[16], paddingTop: olySpacing[8] },
  segHit: { flex: 1, paddingVertical: olySpacing[4] },
  seg: { height: 3, borderRadius: 2, backgroundColor: olyColors.glass.idle },
  segOn: { backgroundColor: olyColors.text.primary },
  closeRow: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: olySpacing[16], paddingTop: 6 },
  closeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },

  body: { paddingHorizontal: olySpacing[20], paddingBottom: olySpacing[20], flexGrow: 1 },
  footer: { paddingHorizontal: olySpacing[16], paddingTop: olySpacing[4], paddingBottom: olySpacing[8] },

  kicker: { fontFamily: olyFonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 1.5, color: olyColors.text.secondary },
  kickerSmall: { fontFamily: olyFonts.medium, fontSize: 11, letterSpacing: 1.5, color: olyColors.text.secondary },
  title: { marginTop: olySpacing[12], fontFamily: olyFonts.bold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8, color: olyColors.text.primary },
  sub: { marginTop: olySpacing[8], fontFamily: olyFonts.regular, fontSize: 15, lineHeight: 21, color: olyColors.text.secondary },
  small: { fontFamily: olyFonts.regular, fontSize: 12, lineHeight: 16, color: olyColors.text.secondary },
  strong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  dim: { color: olyColors.text.hint },
  faded: { opacity: 0.5 },
  rule: { borderBottomWidth: 1, borderBottomColor: olyColors.glass.rule },
  ruleTop: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  note: { marginTop: olySpacing[12], paddingHorizontal: olySpacing[4], fontFamily: olyFonts.regular, fontSize: 12, lineHeight: 18, color: olyColors.text.hint },

  whyWrap: { flex: 1, justifyContent: "center", paddingBottom: olySpacing[40] },
  whyKicker: { marginTop: olySpacing[20] },
  whyTitle: { marginTop: olySpacing[12], fontFamily: olyFonts.bold, fontSize: 44, lineHeight: 48, letterSpacing: -1.2, color: olyColors.text.primary },

  segWrap: { flexDirection: "row", gap: 2, padding: 3, marginTop: 18 },
  segItem: { flex: 1, height: 34, alignItems: "center", justifyContent: "center", borderRadius: olyRadius.full },
  segItemSmall: { flex: 0, flexGrow: 1, height: 30, paddingHorizontal: olySpacing[8] },
  segItemOn: { backgroundColor: olyColors.glass.border },
  segText: { fontFamily: olyFonts.medium, fontSize: 13, color: olyColors.text.secondary },
  segTextSmall: { fontFamily: olyFonts.medium, fontSize: 12, color: olyColors.text.secondary },
  segTextOn: { color: olyColors.text.primary },

  earnCard: { marginTop: olySpacing[12], paddingHorizontal: 18, paddingVertical: 6 },
  earnRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 },
  earnTitle: { fontFamily: olyFonts.medium, fontSize: 15, lineHeight: 20, color: olyColors.text.primary },
  earnDesc: { marginTop: 2, fontFamily: olyFonts.regular, fontSize: 12, lineHeight: 16, color: olyColors.text.hint },
  earnValue: { fontFamily: olyFonts.bold, fontSize: 17, color: olyColors.text.primary, fontVariant: ["tabular-nums"] },

  mile: {
    marginTop: olySpacing[4],
    marginBottom: olySpacing[12],
    padding: 14,
    paddingTop: olySpacing[12],
    borderRadius: olyRadius.tile,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.rule,
  },
  mileHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 14 },
  mileBest: { marginTop: 2, fontFamily: olyFonts.bold, fontSize: 26, lineHeight: 30, letterSpacing: -0.5, color: olyColors.text.primary },
  mileBars: { flexDirection: "row", gap: 6, marginTop: olySpacing[12] },
  mileKg: { marginTop: 10, fontFamily: olyFonts.bold, fontSize: 14, color: olyColors.text.primary },
  mileOlys: { marginTop: 1, fontFamily: olyFonts.regular, fontSize: 11, color: olyColors.text.hint },

  youHave: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  youHaveLabel: { fontFamily: olyFonts.regular, fontSize: 14, color: olyColors.text.secondary },
  youHaveRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  youHaveOlys: { fontFamily: olyFonts.bold, fontSize: 20, lineHeight: 24, color: olyColors.text.primary },
  youHaveCad: { fontFamily: olyFonts.medium, fontSize: 14, lineHeight: 24, color: olyColors.text.secondary, fontVariant: ["tabular-nums"] },
  catalog: { marginTop: 10, paddingHorizontal: 18, paddingVertical: 5 },
  catRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[8], paddingVertical: 10 },
  catValue: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.text.primary, fontVariant: ["tabular-nums"] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: olyColors.accent },
  dotOff: { backgroundColor: olyColors.glass.idle },
  redeemLabel: { marginTop: 18 },
  products: { flexDirection: "row", gap: olySpacing[8], marginTop: 10 },
  product: { flex: 1, padding: olySpacing[8], paddingBottom: 10 },
  productPhoto: { height: 112, borderRadius: olyRadius.inner, marginBottom: olySpacing[8] },
  productTitle: { fontFamily: olyFonts.medium, fontSize: 13, color: olyColors.text.primary },

  tierCard: { marginTop: 18, paddingHorizontal: olySpacing[16], paddingVertical: 14 },
  tierHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  tierName: { marginTop: olySpacing[4], fontFamily: olyFonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: olyColors.text.primary },
  tierTrack: { flexDirection: "row", gap: olySpacing[4], marginTop: olySpacing[12] },
  tierSegName: { marginTop: 7, fontFamily: olyFonts.bold, fontSize: 12, color: olyColors.text.primary },
  tierSegAt: { fontFamily: olyFonts.regular, fontSize: 10, color: olyColors.text.hint },

  perks: { marginTop: 10, paddingHorizontal: olySpacing[16], paddingVertical: 2 },
  perksLabel: { paddingTop: olySpacing[12], paddingBottom: 2 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[12], paddingVertical: 9 },
  perkIcon: { width: 14, alignItems: "center" },
  perkTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  perkTitle: { fontFamily: olyFonts.bold, fontSize: 14, color: olyColors.text.primary },
  perkAt: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.hint, fontVariant: ["tabular-nums"] },
  youTag: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: olyRadius.full, backgroundColor: olyColors.accent },
  youText: { fontFamily: olyFonts.bold, fontSize: 10, color: olyColors.text.onAccent },
  social: { marginTop: olySpacing[12], textAlign: "center", fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.hint },
});
