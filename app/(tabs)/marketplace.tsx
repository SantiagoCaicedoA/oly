import {
  CountUp,
  DeltaFloat,
  Glass,
  GlowBar,
  Glows,
  kit,
  Overline,
  PrimaryButton,
  QuietButton,
  Sheet,
  showToast,
  Ticket,
  ToastHost,
} from "@/src/oly-components/shop/ShopKit";
import {
  Code,
  costOf,
  FRIEND_PULSE,
  FRIENDS,
  fmt,
  GEAR,
  gearReward,
  NEXT_DROP,
  QUESTS,
  Quest,
  redeem,
  Reward,
  toCad,
  toggleNotify,
  useWallet,
  VOUCHERS,
  WEEKLY,
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
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OlyScreenHeader } from "@/src/oly-components/organisms/OlyScreenHeader";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";

/**
 * Shop. Design F on the canvas ("F, clickable"): the balance is the
 * motivator, gear comes last.
 *
 * Runs on mock data (src/oly-mock/wallet.ts). Tapping the balance opens the
 * Wallet screen. Redeeming goes through one sheet with three states:
 * confirm, done (shows the new code) and short (not enough Olys yet).
 */
type SheetState =
  | { kind: "confirm"; r: Reward }
  | { kind: "done"; r: Reward; code: Code }
  | { kind: "short"; r: Reward }
  | null;

export default function MarketplaceScreen() {
  const w = useWallet();
  const [tab, setTab] = useState<"earn" | "redeem">("earn");
  const [sheet, setSheet] = useState<SheetState>(null);
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(100);

  const open = (r: Reward) =>
    setSheet(
      w.balance >= r.cost ? { kind: "confirm", r } : { kind: "short", r },
    );

  const confirm = (r: Reward) => {
    const code = redeem(r);
    if (code) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSheet({ kind: "done", r, code });
    }
  };

  const copy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.selectionAsync();
    showToast(`${code} copied`);
  };

  return (
    <View style={styles.screen}>
      <Glows variant="shop" />
      <View style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: headerH }]}
          scrollIndicatorInsets={{ top: headerH }}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.push("/athlete/wallet")}
            accessibilityRole="button"
            style={({ pressed }) => pressed && kit.pressed}
          >
            <BalanceCard />
          </Pressable>

          <Glass radius={olyRadius.full} style={styles.tabs}>
            {(["earn", "redeem"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                hitSlop={{ top: 4, bottom: 4 }}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === t }}
                style={[styles.tab, tab === t && styles.tabOn]}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
                  {t === "earn" ? "Earn" : "Redeem"}
                </Text>
              </Pressable>
            ))}
          </Glass>

          <Glass>
            {tab === "earn"
              ? QUESTS.map((q, i) => (
                  <QuestRow key={q.id} q={q} last={i === QUESTS.length - 1} />
                ))
              : VOUCHERS.map((v, i) => {
                  const short = v.cost - w.balance;
                  return (
                    <View
                      key={v.id}
                      style={[
                        styles.row,
                        i < VOUCHERS.length - 1 && styles.rowRule,
                      ]}
                    >
                      <View style={styles.flex}>
                        <Text style={styles.rowTitle}>{v.title}</Text>
                        <Text style={kit.caption}>
                          {fmt(v.cost)} Olys · {v.detail}
                        </Text>
                      </View>
                      {short > 0 ? (
                        <Pressable
                          onPress={() => open(v)}
                          hitSlop={5}
                          accessibilityRole="button"
                          accessibilityLabel={`${v.title}, ${fmt(short)} Olys to go`}
                          style={({ pressed }) => [styles.ctaLocked, pressed && kit.pressed]}
                        >
                          <Text style={styles.ctaLockedText}>{fmt(short)} to go</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => open(v)}
                          hitSlop={5}
                          style={({ pressed }) => [
                            styles.cta,
                            pressed && styles.ctaPressed,
                          ]}
                        >
                          <Text style={styles.ctaText}>Redeem</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
          </Glass>

          <SectionHeader title="Friends this week" />
          <Glass style={styles.friends}>
            {FRIENDS.map((f, i) => {
              const me = f.id === "me";
              return (
                <View key={f.id} style={[styles.friend, me && styles.friendMe]}>
                  <Text style={[styles.friendRank, me && styles.friendRankMe]}>
                    {i + 1}
                  </Text>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{f.initials}</Text>
                  </View>
                  <Text
                    style={[styles.friendName, me && styles.friendNameMe]}
                    numberOfLines={1}
                  >
                    {f.name}
                  </Text>
                  <Text style={styles.friendOlys}>+{fmt(f.olys)}</Text>
                </View>
              );
            })}
          </Glass>
          <View style={styles.pulse}>
            <Text style={kit.caption} numberOfLines={1}>
              <Text style={styles.pulseName}>{FRIEND_PULSE.name}</Text>{" "}
              {FRIEND_PULSE.text} · {FRIEND_PULSE.time}
            </Text>
          </View>

          <SectionHeader title="What your Olys get you" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.hScroll}
          >
            {GEAR.map((g) => {
              const cost = costOf(g);
              const claimable = w.balance >= cost;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => open(gearReward(g))}
                  style={({ pressed }) => [
                    claimable ? styles.gearGlow : styles.gearDim,
                    pressed && kit.pressed,
                  ]}
                >
                  <Glass
                    style={styles.gear}
                    borderColor={
                      claimable
                        ? olyColors.glass.accentBorder
                        : olyColors.glass.border
                    }
                  >
                    <LinearGradient
                      colors={
                        claimable
                          ? olyColors.glass.photoReady
                          : olyColors.glass.photo
                      }
                      start={{ x: 0.5, y: 0.2 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.gearImage}
                    >
                      <Text style={styles.photoHint}>Product photo</Text>
                      <View
                        style={[
                          styles.pricePill,
                          claimable && styles.pricePillReady,
                        ]}
                      >
                        <Text style={styles.pricePillText}>
                          {fmt(cost)} Olys
                        </Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.gearBody}>
                      <Text
                        style={[styles.rowTitle, !claimable && styles.dimText]}
                        numberOfLines={1}
                      >
                        {g.name}
                      </Text>
                      {claimable ? (
                        <View style={styles.readyLine}>
                          <View style={styles.glowDot} />
                          <Text style={styles.readyText}>
                            ${g.priceCad} value
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.priceFaint} numberOfLines={1}>
                          ${g.priceCad} value · {fmt(cost - w.balance)} to go
                        </Text>
                      )}
                    </View>
                  </Glass>
                </Pressable>
              );
            })}
          </ScrollView>

          <DropCard notify={w.notify} />
        </ScrollView>

        {/* Title floats over the scroll, with a fade behind. */}
        <OlyFloatingHeader onLayout={onHeaderLayout}>
          <OlyScreenHeader
            title="Shop"
            right={
              <Pressable hitSlop={4}
              onPress={() => router.push("/athlete/how-olys")}
              style={({ pressed }) => pressed && kit.pressed}
              accessibilityRole="button"
              accessibilityLabel="How olys work"
            >
              <Glass radius={olyRadius.full} style={styles.headerBtn}>
                <Text style={styles.headerBtnText}>?</Text>
              </Glass>
            </Pressable>
            }
          />
        </OlyFloatingHeader>

        <Sheet open={!!sheet} onClose={() => setSheet(null)}>
          {sheet?.kind === "confirm" && (
            <View style={styles.center}>
              <Text style={styles.sheetTitle}>{sheet.r.title}</Text>
              <Text style={styles.sheetSub}>{sheet.r.detail}</Text>
              <View style={styles.split}>
                <View style={styles.splitCell}>
                  <Text style={styles.splitValue}>{fmt(sheet.r.cost)}</Text>
                  <Text style={kit.caption}>Olys</Text>
                </View>
                <View style={[styles.splitCell, styles.splitRule]}>
                  <Text style={[styles.splitValue, styles.splitMuted]}>
                    {fmt(w.balance - sheet.r.cost)}
                  </Text>
                  <Text style={kit.caption}>Left after</Text>
                </View>
              </View>
              <PrimaryButton
                label="Redeem"
                onPress={() => confirm(sheet.r)}
                style={styles.sheetBtn}
              />
              <QuietButton label="Not now" onPress={() => setSheet(null)} />
            </View>
          )}
          {sheet?.kind === "done" && (
            <View style={styles.center}>
              <Text style={styles.sheetTitle}>It&apos;s yours</Text>
              <Text style={styles.sheetSub}>
                Saved in your wallet. {fmt(w.balance)} Olys left.
              </Text>
              <View style={styles.sheetTicket}>
                <Ticket c={sheet.code} onPress={() => copy(sheet.code.code)} />
              </View>
              <PrimaryButton
                label="Shop the Oly store"
                onPress={() => {
                  setSheet(null);
                  showToast("Opens the Oly store with your code");
                }}
                style={styles.sheetBtn}
              />
              <QuietButton label="Done" onPress={() => setSheet(null)} />
            </View>
          )}
          {sheet?.kind === "short" && (
            <View style={styles.center}>
              <Text style={styles.sheetTitle}>{sheet.r.title}</Text>
              <Text style={styles.sheetSub}>{sheet.r.detail}</Text>
              <View style={[styles.split, styles.splitShort]}>
                <View style={styles.splitRow}>
                  <View style={styles.splitCell}>
                    <Text style={styles.splitValue}>{fmt(w.balance)}</Text>
                    <Text style={kit.caption}>You have</Text>
                  </View>
                  <View style={[styles.splitCell, styles.splitRule]}>
                    <Text style={styles.splitValue}>{fmt(sheet.r.cost - w.balance)}</Text>
                    <Text style={kit.caption}>To go</Text>
                  </View>
                </View>
                <View style={styles.shortBar}>
                  <GlowBar pct={w.balance / sheet.r.cost} height={4} />
                </View>
              </View>
              <Text style={[styles.sheetSub, styles.shortNote]}>
                About {Math.ceil((sheet.r.cost - w.balance) / 120)} verified lifts away
              </Text>
              <PrimaryButton
                label="Ways to earn"
                onPress={() => {
                  setSheet(null);
                  router.push("/athlete/how-olys");
                }}
                style={styles.sheetBtn}
              />
              <QuietButton label="Not now" onPress={() => setSheet(null)} />
            </View>
          )}
        </Sheet>
        <ToastHost />
      </View>
    </View>
  );
}

/* ─── Pieces ─────────────────────────────────────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function BalanceCard() {
  const w = useWallet();
  const max = Math.max(...WEEKLY);
  const thisWeek = WEEKLY[WEEKLY.length - 1];

  return (
    <Glass style={styles.balanceCard}>
      <View style={styles.rowBetween}>
        <View style={styles.overlineRow}>
          <View style={styles.glowDot} />
          <Overline>BALANCE</Overline>
        </View>
        {w.pending > 0 && (
          <View style={styles.pill}>
            <View style={styles.dot} />
            <Text style={styles.pillText}>+{fmt(w.pending)} verifying</Text>
          </View>
        )}
      </View>

      <View style={styles.balanceRow}>
        <CountUp value={w.balance} style={styles.balance} />
        <Text style={styles.unit}>OLYS</Text>
        <DeltaFloat id={w.changeId} value={w.lastChange} />
      </View>
      <Text style={styles.muted}>${toCad(w.balance)} in store credit</Text>

      <View style={styles.weekBox}>
        <View style={styles.rowBetween}>
          <Text style={kit.caption}>
            This week <Text style={styles.weekValue}>+{fmt(thisWeek)}</Text>
          </Text>
          {thisWeek === max && <Text style={kit.caption}>Best week yet</Text>}
        </View>
        <View style={styles.bars}>
          {WEEKLY.map((v, i) => {
            const h = Math.max(4, Math.round((v / max) * 48));
            return (
              <View key={i} style={styles.barSlot}>
                {i === WEEKLY.length - 1 ? (
                  <LinearGradient
                    colors={[olyColors.glass.glow, olyColors.glass.glowDeep]}
                    style={[styles.bar, styles.barNow, { height: h }]}
                  />
                ) : (
                  <View style={[styles.bar, { height: h }]} />
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.tiny}>8 weeks ago</Text>
          <Text style={styles.tiny}>Now</Text>
        </View>
      </View>
    </Glass>
  );
}

function QuestRow({ q, last }: { q: Quest; last: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowRule]}>
      <View style={styles.flex}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {q.title}
        </Text>
        <Text style={kit.caption}>
          {q.total > 1
            ? `${q.done} of ${q.total} ${q.detail.toLowerCase()}`
            : q.detail}
        </Text>
        {q.total > 1 && q.done > 0 && (
          <View style={styles.rowBar}>
            <GlowBar pct={q.done / q.total} />
          </View>
        )}
      </View>
      <View style={styles.reward}>
        <Text style={styles.rewardText}>+{fmt(q.reward)}</Text>
      </View>
    </View>
  );
}

function DropCard({ notify }: { notify: boolean }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, NEXT_DROP.endsAt - now);
  const cells: [number, string][] = [
    [Math.floor(left / 86400000), "d"],
    [Math.floor((left % 86400000) / 3600000), "h"],
    [Math.floor((left % 3600000) / 60000), "m"],
  ];

  return (
    <Glass
      style={styles.drop}
      colors={olyColors.glass.drop}
      borderColor={olyColors.glass.dropBorder}
    >
      <View style={styles.rowBetween}>
        <View style={styles.dropTag}>
          <Text style={styles.dropTagText}>NEXT DROP</Text>
        </View>
        <Text style={kit.caption}>Members first</Text>
      </View>
      <Text style={styles.dropName}>{NEXT_DROP.name}</Text>
      <Text style={styles.muted}>{NEXT_DROP.blurb}</Text>
      <View style={[styles.rowBetween, styles.dropFoot]}>
        <View style={styles.countdown}>
          {cells.map(([n, u]) => (
            <View key={u} style={styles.countCell}>
              <Text style={styles.countNum}>{String(n).padStart(2, "0")}</Text>
              <Text style={kit.caption}>{u}</Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => {
            if (!notify)
              showToast(`We'll tell you when ${NEXT_DROP.name} lands`);
            toggleNotify();
          }}
          hitSlop={1}
          style={({ pressed }) => [
            notify ? styles.notifyOn : [styles.cta, styles.ctaTall],
            pressed && kit.pressed,
          ]}
        >
          <Text style={notify ? styles.notifyOnText : styles.ctaText}>
            {notify ? "You're in" : "Notify me"}
          </Text>
        </Pressable>
      </View>
    </Glass>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: 120,
    gap: olySpacing[16],
  },
  flex: { flex: 1, minWidth: 0 },
  center: { alignItems: "stretch" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  /* Floats over the scroll. Bottom padding leaves a 12pt gap to the balance card. */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
  },
  title: { ...olyTypography.title1, flex: 1, color: olyColors.text.primary },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: {
    ...olyTypography.body,
    fontSize: 17,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },

  priceFaint: { ...olyTypography.caption, color: olyColors.text.disabled },
  dimText: { color: olyColors.text.secondary },
  gearDim: { opacity: 0.72 },
  pricePill: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  pricePillReady: {
    backgroundColor: olyColors.glass.readyFill,
    borderColor: olyColors.glass.accentBorder,
    ...olyGlow.md,
  },
  pricePillText: {
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  readyLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  readyText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  tiny: {
    ...olyTypography.caption,
    fontSize: 11,
    color: olyColors.text.disabled,
  },
  muted: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: olyColors.glass.glow,
  },
  glowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: olyColors.glass.glow,
    ...olyGlow.md,
  },
  overlineRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
  },
  pillText: { ...olyTypography.caption, color: olyColors.text.primary },

  /* Balance */
  balanceCard: { padding: olySpacing[20] },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: olySpacing[8],
  },
  balance: {
    fontFamily: olyFonts.bold,
    fontWeight: "700",
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -1.5,
    color: olyColors.text.primary,
  },
  unit: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    letterSpacing: 1,
    color: olyColors.text.secondary,
  },
  weekBox: {
    marginTop: olySpacing[16],
    padding: 14,
    borderRadius: olyRadius.inner,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.rule,
  },
  weekValue: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  bars: {
    flexDirection: "row",
    gap: 6,
    height: 48,
    marginTop: olySpacing[12],
    marginBottom: olySpacing[8],
  },
  barSlot: { flex: 1, justifyContent: "flex-end" },
  bar: { borderRadius: olyRadius.sm, backgroundColor: olyColors.glass.bar },
  barNow: { ...olyGlow.md },

  /* Tabs */
  tabs: { flexDirection: "row", gap: olySpacing[4], padding: olySpacing[4] },
  tab: {
    flex: 1,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: olyRadius.full,
  },
  tabOn: {
    backgroundColor: olyColors.glass.selected,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  tabText: { ...olyTypography.label, color: olyColors.text.secondary },
  tabTextOn: { color: olyColors.text.primary },

  /* Rows */
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olySpacing[16],
    paddingVertical: 14,
  },
  rowRule: { borderBottomWidth: 1, borderBottomColor: olyColors.glass.rule },
  rowTitle: {
    ...olyTypography.body,
    fontSize: 15,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  rowBar: { marginTop: olySpacing[8] },
  reward: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
  },
  rewardText: {
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  cta: {
    height: 34,
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.button.primary.bg,
    ...olyGlow.md,
  },
  ctaTall: { height: 42 },
  ctaPressed: { backgroundColor: olyColors.button.primary.pressed },
  ctaText: { ...olyTypography.label, color: olyColors.text.onAccent },
  /** Same size as Redeem, quiet glass while the balance is short. */
  ctaLocked: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  ctaLockedText: { ...olyTypography.label, color: olyColors.text.secondary },

  /* Friends */
  friends: { padding: 6 },
  friend: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olySpacing[12],
    paddingVertical: 10,
    borderRadius: olyRadius.inner,
    borderWidth: 1,
    borderColor: "transparent",
  },
  friendMe: {
    backgroundColor: olyColors.glass.friend,
    borderColor: olyColors.glass.friendBorder,
  },
  friendRank: {
    width: 14,
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.bold,
    color: olyColors.text.secondary,
  },
  friendRankMe: { color: olyColors.text.primary },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: olyRadius.inner,
    backgroundColor: olyColors.bg.avatar,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  friendName: {
    flex: 1,
    ...olyTypography.body,
    fontSize: 15,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  friendNameMe: { fontFamily: olyFonts.bold },
  friendOlys: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  pulse: {
    marginTop: -olySpacing[8],
    paddingHorizontal: 14,
    paddingVertical: olySpacing[12],
    borderRadius: olyRadius.inner,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.rule,
  },
  pulseName: { fontFamily: olyFonts.medium, color: olyColors.text.primary },

  /* Gear */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: olySpacing[8],
  },
  sectionTitle: {
    ...olyTypography.number,
    fontFamily: olyFonts.bold,
    fontWeight: "700",
    color: olyColors.text.primary,
  },
  bleed: { marginHorizontal: -olyLayout.screenPadding, marginVertical: -28 },
  hScroll: {
    paddingHorizontal: olyLayout.screenPadding,
    gap: olySpacing[12],
    paddingVertical: olySpacing[32],
  },
  gearGlow: {
    ...olyGlow.md,
    borderRadius: olyRadius.xl,
  },
  gear: { width: 200 },
  gearImage: { height: 180, alignItems: "center", justifyContent: "center" },
  photoHint: { ...olyTypography.caption, color: olyColors.text.disabled },
  gearBody: {
    paddingHorizontal: olySpacing[16],
    paddingTop: 14,
    paddingBottom: olySpacing[16],
    gap: olySpacing[4],
  },

  /* Drop */
  drop: { padding: olySpacing[20], marginTop: olySpacing[8] },
  dropTag: {
    paddingHorizontal: olySpacing[8],
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.glass.dropTag,
  },
  dropTagText: {
    ...olyTypography.caption,
    fontSize: 11,
    fontFamily: olyFonts.bold,
    letterSpacing: 1,
    color: olyColors.text.primary,
  },
  dropName: {
    ...olyTypography.title2,
    fontSize: 26,
    fontFamily: olyFonts.bold,
    fontWeight: "700",
    color: olyColors.text.primary,
    marginTop: olySpacing[12],
    marginBottom: olySpacing[4],
  },
  dropFoot: { marginTop: 18 },
  countdown: { flexDirection: "row", gap: 6 },
  countCell: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: olySpacing[8],
    borderRadius: olyRadius.inner,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  countNum: {
    ...olyTypography.number,
    lineHeight: 24,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  notifyOn: {
    height: 42,
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  notifyOnText: { ...olyTypography.label, color: olyColors.text.primary },

  /* Sheets */
  sheetTitle: {
    ...olyTypography.title2,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
    textAlign: "center",
  },
  sheetSub: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    marginTop: olySpacing[4],
  },
  sheetBtn: { marginTop: olySpacing[20] },
  sheetTicket: { marginTop: 22 },
  split: {
    flexDirection: "row",
    marginTop: olySpacing[24],
    paddingVertical: 14,
    borderRadius: olyRadius.tile,
    backgroundColor: olyColors.glass.inset,
  },
  splitCell: { flex: 1, alignItems: "center", gap: 2 },
  splitRule: { borderLeftWidth: 1, borderLeftColor: olyColors.glass.rule },
  splitValue: {
    ...olyTypography.number,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  splitMuted: { color: olyColors.text.secondary },
  splitShort: { flexDirection: "column", paddingBottom: olySpacing[16] },
  splitRow: { flexDirection: "row" },
  shortBar: { marginTop: 14, marginHorizontal: 18 },
  shortNote: { marginTop: olySpacing[12] },
});
