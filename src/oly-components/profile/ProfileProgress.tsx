/**
 * ProfileProgress, the Progress tab of my profile.
 *
 * In order: rank and olys, the rival one spot up, the weekly challenge,
 * milestones, badges, the verified competition lifts and the private
 * insights. Rank, lifts, the card and the season are live; the wallet,
 * challenge, rival, badges and percentile read mocks in src/oly-mock.
 */

import type { Sex } from "@/constants/leaderboard-data";
import ChallengeCard from "@/components/challenge-card";
import { OlyAvatar } from "@/src/oly-components/atoms/OlyAvatar";
import { InsightsCarousel } from "@/src/oly-components/profile/InsightsCarousel";
import { LiftTile } from "@/src/oly-components/profile/LiftGrid";
import { BadgeGrid, type Badge } from "@/src/oly-components/profile/SeasonBadges";
import { levelFor, type LadderLift } from "@/src/oly-components/records/ladder";
import MilestonesSheet, {
  MilestoneList,
  milestoneOlys,
  NowNext,
  type MilestoneLift,
} from "@/src/oly-components/records/MilestonesSheet";
import { Glass, GlowBar, Overline, PrimaryButton } from "@/src/oly-components/shop/ShopKit";
import {
  MOCK_EARNED_BADGES,
  MOCK_LOCKED_BADGES,
  mockBeatPct,
  mockNeighbours,
} from "@/src/oly-mock/profile";
import { CHALLENGE, fmt, tierFor, useWallet } from "@/src/oly-mock/wallet";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import type { AthleteCardLift, AthleteCardResponse, MyRankResponse, SeasonMeta } from "@/types/api/leaderboard";
import type { MyLift } from "@/types/api/profile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

/** Best numbers on record per milestone lift, kg. */
export type LiftBests = Record<LadderLift, number>;

/** The four ladder lifts and where each is stored in the record book. */
const MILESTONE_LIFTS: { lift: LadderLift; name: string; category: "classic" | "squat"; index: number }[] = [
  { lift: "snatch", name: "Snatch", category: "classic", index: 0 },
  { lift: "cj", name: "Clean & Jerk", category: "classic", index: 1 },
  { lift: "back", name: "Back Squat", category: "squat", index: 0 },
  { lift: "front", name: "Front Squat", category: "squat", index: 1 },
];

function buildMilestones(
  sex: Sex,
  bodyweightKg: number | null,
  bests: LiftBests,
  verified: { snatch: boolean; cj: boolean },
): MilestoneLift[] {
  if (!bodyweightKg) return [];
  return MILESTONE_LIFTS.flatMap(({ lift, name }) => {
    const lv = levelFor(lift, bests[lift], sex, bodyweightKg);
    if (!lv) return [];
    return [
      {
        name,
        best: bests[lift],
        marks: lv.marks,
        mults: lv.mults,
        level: lv.level,
        verified: lift === "snatch" ? verified.snatch : lift === "cj" ? verified.cj : false,
      },
    ];
  });
}

const daysAgo = (iso: string | null) => {
  if (!iso) return null;
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
};

const verifiedLift = (l: AthleteCardLift | null | undefined) => (l && !l.pendingReview ? l : null);

function Section({
  label,
  note,
  first,
  children,
}: {
  label: string;
  note?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={first ? s.sectionFirst : s.section}>
      <View style={s.sectionHead}>
        <Overline>{label}</Overline>
        {note ? <Text style={s.note}>{note}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function ProfileProgress({
  me,
  rankLoading,
  season,
  sex,
  cls,
  boardLabel,
  card,
  lifts,
  bests,
  bodyweightKg,
  hasVerified,
  onClaim,
}: {
  me: MyRankResponse["me"];
  rankLoading: boolean;
  season: SeasonMeta | null;
  sex: Sex;
  /** Class the rank is on, e.g. "94". */
  cls: string | null;
  /** "Men 94 kg". */
  boardLabel: string | null;
  card: AthleteCardResponse | null;
  lifts: MyLift[];
  bests: LiftBests;
  bodyweightKg: number | null;
  hasVerified: boolean;
  onClaim: () => void;
}) {
  const wallet = useWallet();
  const tier = tierFor(wallet.lifetime);
  const [milestoneView, setMilestoneView] = useState<string | null>(null);

  const vSnatch = verifiedLift(card?.videos.snatch);
  const vCj = verifiedLift(card?.videos.cleanjerk);
  const milestones = buildMilestones(sex, bodyweightKg, bests, {
    snatch: !!vSnatch || lifts.some((l) => l.liftType === "snatch" && l.status === "live" && !l.pendingReview),
    cj: !!vCj || lifts.some((l) => l.liftType === "cleanjerk" && l.status === "live" && !l.pendingReview),
  });
  const olys = milestoneOlys(milestones);

  const neighbours = me && cls ? mockNeighbours(me.value, sex, cls) : null;
  const rival = me && me.rank > 1 ? neighbours?.above ?? null : null;
  const sinclair = card?.stats.sinclair ?? me?.sinclair ?? null;
  const beatPct = sinclair && cls ? mockBeatPct(sinclair, sex, cls) : null;

  const badges: Badge[] = [
    ...MOCK_EARNED_BADGES.map((b) => ({ state: "earned" as const, ...b })),
    {
      state: "progress",
      title: season?.label ?? "This season",
      sub: "In progress",
      /* "Red Season '26" shows '26 on the hex. */
      value: season?.label?.match(/'\d{2}/)?.[0] ?? "S",
    },
    ...MOCK_LOCKED_BADGES.map((title) => ({ state: "locked" as const, title, sub: "Locked" })),
  ];

  const addVideo = (name: string) => {
    const m = MILESTONE_LIFTS.find((l) => l.name === name);
    if (!m) return;
    const kg = bests[m.lift];
    router.push({
      pathname: "/athlete/create-new-post",
      params: {
        recordCategory: m.category,
        recordIndex: String(m.index),
        recordLift: m.name,
        ...(kg > 0 ? { recordKg: String(kg) } : {}),
      },
    });
  };

  return (
    <View>
      {/* 1. rank and olys */}
      {me ? (
        <Pressable
          onPress={() => router.push("/athlete/wallet")}
          accessibilityRole="button"
          accessibilityLabel={`Rank ${me.rank}, ${fmt(wallet.balance)} olys. Open wallet`}
          style={({ pressed }) => [s.sectionFirst, pressed && s.pressed]}
        >
          <NowNext
            left={{ over: "RANK", value: `#${me.rank}`, hint: `${boardLabel ?? "Season board"}, ${me.value} kg` }}
            right={{ over: "OLYS", value: fmt(wallet.balance), hint: `Tier ${tier.index + 1}` }}
            pct={tier.pct}
            footLeft={
              tier.next ? (
                <>
                  <Text style={s.strong}>{fmt(tier.toNext ?? 0)}</Text> to Tier {tier.index + 2}
                </>
              ) : (
                "Top tier"
              )
            }
            footRight={
              <>
                Wallet <Ionicons name="chevron-forward" size={13} color={olyColors.text.hint} />
              </>
            }
          />
        </Pressable>
      ) : (
        !rankLoading && (
          <Glass radius={olyRadius.xl} style={[s.sectionFirst, s.emptyRank]}>
            <Text style={s.emptyTitle}>Your rank starts with one lift</Text>
            <Text style={s.emptyText}>
              Post a video of a single snatch or clean and jerk and take your spot on{" "}
              {season?.label ?? "the season board"}.
            </Text>
            <PrimaryButton label="Post your first lift" onPress={onClaim} style={s.emptyBtn} />
          </Glass>
        )
      )}

      {/* 2. rival */}
      {rival && me && (
        <Section label="YOUR RIVAL">
          <Pressable
            onPress={() => router.push("/(tabs)/rank")}
            accessibilityRole="button"
            accessibilityLabel={`${rival.user.name}, number ${me.rank - 1}. Open the board`}
            style={({ pressed }) => pressed && s.pressed}
          >
            <Glass radius={olyRadius.tile} style={s.rival}>
              <View style={s.rivalTop}>
                <OlyAvatar source={rival.user.avatarUrl ?? undefined} name={rival.user.name} size="medium" />
                <View style={s.flex}>
                  <Text style={s.rivalName} numberOfLines={1}>
                    {rival.user.name} <Text style={s.rivalRank}>#{me.rank - 1}</Text>
                  </Text>
                  {rival.snatchKg ? (
                    <Text style={s.small} numberOfLines={1}>
                      {rival.snatchKg} kg snatch
                      {daysAgo(rival.achievedAt) ? `, ${daysAgo(rival.achievedAt)}` : ""}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={olyColors.text.hint} />
              </View>
              <View style={s.rivalBar}>
                <GlowBar pct={me.value / rival.value} height={4} />
              </View>
              <View style={s.spread}>
                <Text style={s.small}>
                  You <Text style={s.strong}>{me.value}</Text>
                </Text>
                <Text style={s.small}>
                  <Text style={s.strong}>{Math.round(rival.value - me.value)} kg</Text> to pass
                </Text>
                <Text style={s.small}>
                  {rival.user.name.split(" ")[0]} <Text style={s.strong}>{rival.value}</Text>
                </Text>
              </View>
            </Glass>
          </Pressable>
        </Section>
      )}

      {/* 3. weekly challenge */}
      <Section
        label="WEEKLY CHALLENGE"
        note={`${CHALLENGE.daysLeft} ${CHALLENGE.daysLeft === 1 ? "day" : "days"} left`}
      >
        <ChallengeCard compact />
      </Section>

      {/* 4. milestones */}
      {milestones.length > 0 && (
        <Section label="MILESTONES" note={`${fmt(olys.earned)} of ${fmt(olys.total)}`}>
          <MilestoneList lifts={milestones} unit="kg" onOpen={setMilestoneView} />
        </Section>
      )}

      {/* 5. badges */}
      <Section
        label="BADGES"
        note={`${badges.filter((b) => b.state === "earned").length} of ${badges.length}`}
      >
        <BadgeGrid badges={badges} />
      </Section>

      {/* 6. competition lifts */}
      {(vSnatch || vCj) && (
        <Section label="COMPETITION LIFTS" note="Verified">
          <View style={s.compRow}>
            {[
              { lift: vSnatch, name: "Snatch" },
              { lift: vCj, name: "Clean & Jerk" },
            ].map(({ lift, name }) =>
              lift ? (
                <LiftTile
                  key={name}
                  kg={lift.weightKg}
                  name={name}
                  videoUrl={lift.videoUrl}
                  onPress={lift.videoUrl ? () => Linking.openURL(lift.videoUrl as string) : undefined}
                  style={s.compTile}
                />
              ) : (
                <View key={name} style={s.flex} />
              ),
            )}
          </View>
        </Section>
      )}

      {/* 7. insights, own profile only, and only with data to read */}
      {hasVerified && (
        <Section label="INSIGHTS" note="Only you">
          <InsightsCarousel
            snatchKg={card?.stats.snatchKg ?? me?.snatchKg ?? null}
            cleanKg={card?.stats.cleanKg ?? me?.cleanKg ?? null}
            sinclair={sinclair}
            lifts={lifts}
            me={me}
            boardLabel={boardLabel}
            beatPct={beatPct}
            neighbours={neighbours}
            sex={sex}
            bodyweightKg={bodyweightKg}
            season={season}
          />
        </Section>
      )}

      <MilestonesSheet
        view={milestoneView}
        onClose={() => setMilestoneView(null)}
        lifts={milestones}
        unit="kg"
        bodyweight={bodyweightKg ? String(Math.round(bodyweightKg * 10) / 10) : null}
        onAddVideo={addVideo}
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.8 },
  spread: { flexDirection: "row", justifyContent: "space-between", gap: olySpacing[8] },
  sectionFirst: { marginTop: olySpacing[16] },
  section: { marginTop: 28 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginHorizontal: olySpacing[4],
    marginBottom: 10,
  },
  note: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.hint },
  small: { fontFamily: olyFonts.regular, fontSize: 13, color: olyColors.text.secondary },
  strong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  emptyRank: { padding: olySpacing[16] },
  emptyTitle: { fontFamily: olyFonts.bold, fontSize: 16, lineHeight: 20, color: olyColors.text.primary },
  emptyText: {
    ...olyTypography.bodySmall,
    lineHeight: 20,
    marginTop: olySpacing[4],
    color: olyColors.text.secondary,
  },
  emptyBtn: { marginTop: olySpacing[16] },
  rival: { paddingHorizontal: 18, paddingVertical: olySpacing[16] },
  rivalTop: { flexDirection: "row", alignItems: "center", gap: olySpacing[12] },
  rivalName: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.text.primary },
  rivalRank: { fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  rivalBar: { marginTop: 14, marginBottom: 10 },
  compRow: { flexDirection: "row", gap: 6 },
  /** Two 4:5 tiles side by side on a phone. */
  compTile: { flex: 1, height: 200 },
});
