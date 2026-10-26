import { OlyIcon } from "@/components/icons/OlyIcon";
import {
  CountUp,
  Glass,
  GlassTabs,
  Glows,
  kit,
  Overline,
  showToast,
  Ticket,
  ToastHost,
} from "@/src/oly-components/shop/ShopKit";
import {
  ACTIVITY_GROUPS,
  EARNINGS,
  fmt,
  Range,
  signed,
  toCad,
  useWallet,
} from "@/src/oly-mock/wallet";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OlyScreenHeader } from "@/src/oly-components/organisms/OlyScreenHeader";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";

/**
 * Wallet. Design "Wallet B" on the canvas: balance, Olys earned per period
 * (tap a bar to read it), then Activity and Rewards.
 *
 * Mock data (src/oly-mock/wallet.ts), shared with the Shop tab, so a code
 * redeemed there shows up here straight away.
 */
const CHART_H = 96;

export default function WalletScreen() {
  const w = useWallet();
  const [tab, setTab] = useState<"activity" | "rewards">("activity");
  const [range, setRange] = useState<Range>("8W");
  const [sel, setSel] = useState<number | null>(null);
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(100);

  const d = EARNINGS[range];
  const n = d.values.length;
  const s = sel == null || sel >= n ? n - 1 : sel;
  const max = Math.max(...d.values);
  const avg = d.values.reduce((a, b) => a + b, 0) / n;
  const selLabel =
    s === n - 1
      ? d.unit === "month"
        ? "So far"
        : "This week"
      : d.unit === "month"
        ? d.labels[s]
        : `Week of ${d.labels[s]}`;

  const ready = w.codes.filter((c) => !c.used);
  const used = w.codes.filter((c) => c.used);

  const copy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.selectionAsync();
    showToast(`${code} copied`);
  };

  return (
    <View style={styles.screen}>
      <Glows variant="wallet" />
      <View style={styles.safe}>
        {/* Header floats over the scroll, with a fade behind. */}
        <OlyFloatingHeader onLayout={onHeaderLayout}>
        <OlyScreenHeader title="Wallet" onBack={() => router.back()} />
        </OlyFloatingHeader>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: headerH + olySpacing[8] }]}
          scrollIndicatorInsets={{ top: headerH }}
          showsVerticalScrollIndicator={false}
        >
          <Glass style={styles.card}>
            <Overline>BALANCE</Overline>
            <View style={styles.balanceRow}>
              <CountUp value={w.balance} style={styles.balance} />
              <Text style={styles.unit}>OLYS</Text>
            </View>
            <Text style={styles.muted}>
              Worth ${toCad(w.balance)} on the Oly store
            </Text>

            <View style={styles.rule} />

            <View style={styles.rowBetween}>
              <Text style={styles.small}>Earned per {d.unit}</Text>
              <Text style={styles.small}>
                <Text style={styles.selValue}>+{fmt(d.values[s])}</Text> ·{" "}
                {selLabel}
              </Text>
            </View>
            <View style={styles.bars}>
              {d.values.map((v, i) => {
                const h = Math.max(6, Math.round((v / max) * CHART_H));
                const on = i === s;
                return (
                  <Pressable
                    key={`${range}-${i}`}
                    style={styles.barSlot}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSel(i);
                    }}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`${d.labels[i]}, ${fmt(v)} olys`}
                  >
                    {on ? (
                      <LinearGradient
                        colors={[
                          olyColors.glass.glow,
                          olyColors.glass.glowDeep,
                        ]}
                        style={[styles.bar, styles.barOn, { height: h }]}
                      />
                    ) : (
                      <View style={[styles.bar, { height: h }]} />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.labels}>
              {d.labels.map((l, i) => (
                <Text
                  key={l}
                  style={[styles.xLabel, i === s && styles.xLabelOn]}
                  numberOfLines={1}
                >
                  {(n - 1 - i) % d.every === 0 ? (i === n - 1 ? "Now" : l) : ""}
                </Text>
              ))}
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>+{fmt(avg)}</Text>
                <Text style={styles.statLabel}>Average per {d.unit}</Text>
              </View>
              <View style={[styles.stat, styles.statRule]}>
                <Text style={styles.statValue}>+{fmt(max)}</Text>
                <Text style={styles.statLabel}>Best {d.unit}</Text>
              </View>
            </View>

            <View style={styles.ranges}>
              {(Object.keys(EARNINGS) as Range[]).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => {
                    setRange(r);
                    setSel(null);
                  }}
                  hitSlop={7}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: r === range }}
                  style={[styles.range, r === range && styles.rangeOn]}
                >
                  <Text
                    style={[
                      styles.rangeText,
                      r === range && styles.rangeTextOn,
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Glass>

          <GlassTabs
            options={[
              { value: "activity", label: "Activity" },
              { value: "rewards", label: "Rewards" },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === "activity" ? (
            ACTIVITY_GROUPS.map((g) => {
              const items = w.activity.filter((a) => a.group === g);
              if (!items.length) return null;
              return (
                <View key={g}>
                  <Overline style={styles.groupLabel}>{g}</Overline>
                  <Glass radius={olyRadius.tile}>
                    {items.map((a, i) => (
                      <View
                        key={a.id}
                        style={[
                          styles.row,
                          i < items.length - 1 && styles.rowRule,
                        ]}
                      >
                        <View style={styles.flex}>
                          <View style={styles.rowTitleLine}>
                            <Text style={styles.rowTitle} numberOfLines={1}>
                              {a.label}
                            </Text>
                            {a.kind === "pending" && (
                              <View style={styles.pendingTag}>
                                <Text style={styles.pendingText}>PENDING</Text>
                              </View>
                            )}
                          </View>
                          <Text style={kit.caption}>{a.sub}</Text>
                        </View>
                        <Text
                          style={[
                            styles.amount,
                            a.kind !== "in" && styles.amountMuted,
                          ]}
                        >
                          {signed(a.amount)}
                        </Text>
                      </View>
                    ))}
                  </Glass>
                </View>
              );
            })
          ) : (
            <View style={styles.rewards}>
              {ready.length ? (
                ready.map((c) => (
                  <Ticket key={c.code} c={c} onPress={() => copy(c.code)} />
                ))
              ) : (
                <Glass radius={olyRadius.tile} style={styles.empty}>
                  <Text style={styles.emptyText}>
                    No rewards yet. Redeem Olys in the Shop.
                  </Text>
                </Glass>
              )}
              {used.length > 0 && (
                <>
                  <Overline style={styles.usedLabel}>USED</Overline>
                  <Glass radius={olyRadius.tile}>
                    {used.map((c, i) => (
                      <View key={c.code} style={[styles.usedRow, i > 0 && styles.usedRule]}>
                        <View style={styles.flex}>
                          <Text style={styles.usedTitle}>{c.title}</Text>
                          <Text style={styles.usedText}>Used {c.date}</Text>
                        </View>
                        <Text style={styles.usedCode}>{c.code}</Text>
                      </View>
                    ))}
                  </Glass>
                </>
              )}
            </View>
          )}
        </ScrollView>
        <ToastHost />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
    paddingLeft: olySpacing[4],
    paddingVertical: 6,
  },
  iconBtn: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: olyFonts.medium,
    fontSize: 20,
    lineHeight: 26,
    color: olyColors.text.primary,
  },
  content: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[40],
    gap: olySpacing[16],
  },
  flex: { flex: 1, minWidth: 0 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  muted: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: 2,
  },
  small: {
    ...olyTypography.caption,
    fontSize: 13,
    color: olyColors.text.secondary,
  },

  card: {
    paddingHorizontal: olySpacing[20],
    paddingTop: olySpacing[20],
    paddingBottom: 18,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 6,
  },
  balance: {
    fontFamily: olyFonts.bold,
    fontWeight: "700",
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1,
    color: olyColors.text.primary,
  },
  unit: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    letterSpacing: 1,
    color: olyColors.text.secondary,
  },
  rule: {
    height: 1,
    backgroundColor: olyColors.glass.rule,
    marginTop: 18,
    marginBottom: olySpacing[16],
  },
  selValue: {
    ...olyTypography.body,
    fontSize: 15,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: CHART_H,
    marginTop: 14,
  },
  barSlot: { flex: 1, height: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 6, backgroundColor: olyColors.glass.bar },
  barOn: { ...olyGlow.md },
  labels: { flexDirection: "row", gap: 6, marginTop: 6 },
  xLabel: {
    flex: 1,
    textAlign: "center",
    ...olyTypography.caption,
    fontSize: 10,
    lineHeight: 12,
    color: olyColors.text.disabled,
  },
  xLabelOn: { color: olyColors.text.primary },
  stats: {
    flexDirection: "row",
    marginTop: olySpacing[16],
    paddingVertical: olySpacing[12],
    borderRadius: olyRadius.inner,
    backgroundColor: olyColors.glass.inset,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statRule: { borderLeftWidth: 1, borderLeftColor: olyColors.glass.rule },
  statValue: {
    ...olyTypography.body,
    fontSize: 15,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  statLabel: {
    ...olyTypography.caption,
    fontSize: 11,
    color: olyColors.text.secondary,
  },
  ranges: {
    flexDirection: "row",
    gap: olySpacing[4],
    marginTop: olySpacing[12],
    padding: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.inset,
  },
  range: {
    flex: 1,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: olyRadius.full,
  },
  rangeOn: { backgroundColor: olyColors.glass.selected },
  rangeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  rangeTextOn: { color: olyColors.text.primary },


  groupLabel: { marginLeft: olySpacing[4], marginBottom: olySpacing[8], marginTop: olySpacing[4] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olySpacing[16],
    paddingVertical: 13,
  },
  rowRule: { borderBottomWidth: 1, borderBottomColor: olyColors.glass.rule },
  rowTitleLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowTitle: {
    ...olyTypography.body,
    fontSize: 15,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    flexShrink: 1,
  },
  pendingTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
  },
  pendingText: {
    ...olyTypography.caption,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  amount: {
    ...olyTypography.body,
    fontSize: 15,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  amountMuted: { color: olyColors.text.secondary },

  rewards: { gap: 10 },
  empty: { paddingVertical: 22, paddingHorizontal: olySpacing[16] },
  emptyText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
  },
  usedLabel: { marginTop: olySpacing[16], marginHorizontal: olySpacing[4] },
  usedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    minHeight: 60,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  usedRule: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  usedTitle: { ...olyTypography.bodySmall, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  usedText: { ...olyTypography.caption, marginTop: 2, color: olyColors.text.hint },
  usedCode: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    letterSpacing: 1,
    color: olyColors.text.hint,
    textDecorationLine: "line-through",
  },
});
