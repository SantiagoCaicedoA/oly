/**
 * My Profile, redesign v3 (Lifts and Progress tabs on glass).
 *
 * Header: olys balance and share, then who I am, tier and streak, counts,
 * edit and share, and the Lifts | Progress switch. Lifts is the post grid;
 * Progress is rank, rival, challenge, milestones, badges, verified lifts
 * and insights (ProfileProgress).
 * Live data: profile, /leaderboard/me, athlete card (proof videos),
 * /lifts/me (history), /posts?feed=mine (grid), /follow/status (counts).
 * Mock data: wallet and tiers, streak, rival, badges (src/oly-mock).
 */

import { OlyAvatar } from "@/src/oly-components/atoms/OlyAvatar";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
import { LiftsGrid } from "@/src/oly-components/profile/LiftGrid";
import { ProfileProgress, type LiftBests } from "@/src/oly-components/profile/ProfileProgress";
import { HexVerifiedMark } from "@/src/oly-components/profile/SeasonBadges";
import { boardLabel as labelFor, classFor } from "@/src/oly-components/records/ladder";
import { Glass, GlassButton, GlassTabs, GlowBar, kit } from "@/src/oly-components/shop/ShopKit";
import {
  MOCK_COUNTS,
  MOCK_LIFTS,
  MOCK_ME,
  MOCK_POSTS,
  MOCK_SQUATS,
  MOCK_STREAK,
} from "@/src/oly-mock/profile";
import { fmt, tierFor, useWallet } from "@/src/oly-mock/wallet";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import {
  useGetAthleteCardQuery,
  useGetCurrentSeasonQuery,
  useGetFollowStatusQuery,
  useGetMyLiftsQuery,
  useGetMyPostsQuery,
  useGetMyRankQuery,
  useGetProfileQuery,
} from "@/store/api";
import type { BoardParams } from "@/types/api/leaderboard";
import type { MyLift } from "@/types/api/profile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

type Tab = "lifts" | "progress";
const TABS = [
  { value: "lifts", label: "Lifts" },
  { value: "progress", label: "Progress" },
] as const;

/** Best live, reviewed lift of one type, 0 when there is none. */
const verifiedBest = (lifts: MyLift[], type: MyLift["liftType"]) =>
  Math.max(
    0,
    ...lifts
      .filter((l) => l.liftType === type && l.status === "live" && !l.pendingReview)
      .map((l) => l.weightKg),
  );

export default function MyProfile() {
  const [tab, setTab] = useState<Tab>("lifts");
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(52);
  const wallet = useWallet();
  const tier = tierFor(wallet.lifetime);

  const profileQ = useGetProfileQuery();
  const user = profileQ.data?.data;
  const profile = user?.profile;

  const myId: string | undefined = user?._id;
  const displayName = user?.name || profile?.display_name || "Athlete";
  const username = user?.username || "";
  const avatarUrl = profile?.profile_image_url || user?.photo_url || undefined;
  const countryCode: string | null = profile?.countryCode ?? null;
  const club: string | null = profile?.club ?? (countryCode ? "Independent" : null);

  const sex: "M" | "F" = profile?.sex === "Female" ? "F" : "M";
  const bwKg = useMemo(() => {
    const v = profile?.bodyweight_value;
    if (typeof v !== "number" || v <= 0) return null;
    return profile?.bodyweight_unit === "lbs" ? v * 0.453592 : v;
  }, [profile?.bodyweight_value, profile?.bodyweight_unit]);
  const weightClass = bwKg ? classFor(sex, bwKg) : null;

  const seasonQ = useGetCurrentSeasonQuery();
  // Card first, class-less: the server returns my best verified entry
  // wherever it actually lives, never a guess from profile bodyweight.
  const cardQ = useGetAthleteCardQuery(
    {
      userId: myId as string,
      lift: "sinclair",
      scope: "season",
      sex,
      age: "open",
    },
    { skip: !myId }
  );
  // Rank uses the server's class when a verified entry exists; the
  // profile-derived class is only the fallback for provisional athletes.
  const rankClass = cardQ.data?.athlete.weightClass ?? weightClass;
  const rankParams: BoardParams | null = rankClass
    ? { lift: "total", scope: "season", sex, age: "open", class: rankClass }
    : null;
  const rankQ = useGetMyRankQuery(rankParams as BoardParams, {
    skip: !rankParams || cardQ.isLoading,
  });
  const liftsQ = useGetMyLiftsQuery();
  const postsQ = useGetMyPostsQuery({ page: 1, limit: 24 });
  const followQ = useGetFollowStatusQuery(myId as string, { skip: !myId });

  const season = rankQ.data?.season ?? seasonQ.data?.season ?? null;
  /* Real data first. The mocks only fill an empty profile so the
     redesign can be tested; SHOW_MOCK_PROFILE turns them off. */
  const me = rankQ.data?.me ?? MOCK_ME;
  const card = cardQ.data ?? null;
  const realLifts = liftsQ.data?.lifts ?? [];
  const lifts: MyLift[] = realLifts.length ? realLifts : MOCK_LIFTS;
  const realPosts = postsQ.data?.data ?? [];
  const posts = realPosts.length ? realPosts : (MOCK_POSTS as unknown as typeof realPosts);
  const realCounts = followQ.data?.data;
  const counts =
    realCounts && (realCounts.followers || realCounts.following) ? realCounts : (MOCK_COUNTS ?? realCounts);

  const hasVerified = !!card?.videos.snatch || !!card?.videos.cleanjerk || lifts.length > 0;
  const verifiedMark =
    (!!card?.videos.snatch && !card.videos.snatch.pendingReview) ||
    (!!card?.videos.cleanjerk && !card.videos.cleanjerk.pendingReview) ||
    lifts.some((l) => l.status === "live" && !l.pendingReview);

  const board = rankClass ? labelFor(sex, rankClass) : null;
  const metaLine = [club, board].filter(Boolean).join(", ");

  const stats = profile?.strength_stats;
  const bests: LiftBests = {
    snatch: Math.max(Number(stats?.classic?.snatch?.value) || 0, verifiedBest(lifts, "snatch")),
    cj: Math.max(Number(stats?.classic?.clean_jerk?.value) || 0, verifiedBest(lifts, "cleanjerk")),
    back: Number(stats?.squat?.back_squat?.value) || MOCK_SQUATS?.back || 0,
    front: Number(stats?.squat?.front_squat?.value) || MOCK_SQUATS?.front || 0,
  };

  const onShare = () => {
    Share.share({
      message: username
        ? `Check my verified lifts on Oly, @${username}`
        : "Check my verified lifts on Oly",
    });
  };
  const onClaim = () => router.push("/athlete/create-new-post");

  if (profileQ.isLoading) {
    return (
      <OlyScreenWrapper padded={false}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={olyColors.text.secondary} />
        </View>
      </OlyScreenWrapper>
    );
  }

  return (
    <OlyScreenWrapper padded={false}>
      {/* top row: back, olys, share. Floats over the scroll with a fade. */}
      <OlyFloatingHeader safeTop={false} onLayout={onHeaderLayout}>
      <View style={styles.nav}>
        <View style={styles.navLeft}>
          {router.canGoBack() && (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={({ pressed }) => pressed && kit.pressed}
            >
              <Glass radius={olyRadius.full} style={styles.roundBtn}>
                <Ionicons name="chevron-back" size={20} color={olyColors.text.primary} />
              </Glass>
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push("/athlete/wallet")}
            hitSlop={{ top: 2, bottom: 2 }}
            accessibilityRole="button"
            accessibilityLabel={`${fmt(wallet.balance)} olys. Open wallet`}
            style={({ pressed }) => pressed && kit.pressed}
          >
            <Glass radius={olyRadius.full} style={styles.olys}>
              <View style={styles.olysDot} />
              <Text style={styles.olysNum}>{fmt(wallet.balance)}</Text>
              <Text style={styles.olysUnit}>olys</Text>
            </Glass>
          </Pressable>
        </View>
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share profile"
          style={({ pressed }) => pressed && kit.pressed}
        >
          <Glass radius={olyRadius.full} style={styles.roundBtn}>
            <Ionicons name="qr-code-outline" size={18} color={olyColors.text.primary} />
          </Glass>
        </Pressable>
      </View>
      </OlyFloatingHeader>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: headerH }]}
        scrollIndicatorInsets={{ top: headerH }}
        showsVerticalScrollIndicator={false}
      >
        {/* identity */}
        <View style={styles.identity}>
          <View style={styles.avatarRing}>
            <OlyAvatar source={avatarUrl} name={displayName} size="xl" />
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            {verifiedMark && <HexVerifiedMark size={18} />}
          </View>
          {!!username && <Text style={styles.meta}>@{username}</Text>}
          {(!!countryCode || !!metaLine) && (
            <Text style={styles.metaLine} numberOfLines={1}>
              {!!countryCode && <Text style={styles.cc}>{countryCode} </Text>}
              {metaLine}
            </Text>
          )}
          <View style={styles.tierPill}>
            <Text style={styles.pillText}>
              Tier <Text style={styles.strong}>{tier.index + 1}</Text>
            </Text>
            <View style={styles.tierBar}>
              <GlowBar pct={tier.pct} height={3} />
            </View>
            {MOCK_STREAK != null && (
              <>
                <View style={styles.pillRule} />
                <Text style={styles.pillText}>
                  Streak <Text style={styles.strong}>{MOCK_STREAK}</Text>
                </Text>
              </>
            )}
          </View>
        </View>

        {/* counts */}
        <Glass radius={olyRadius.tile} style={styles.stats}>
          {[
            { n: postsQ.data?.total || posts.length, label: "Lifts" },
            { n: counts?.followers ?? 0, label: "Followers" },
            { n: counts?.following ?? 0, label: "Following" },
          ].map((c, i) => (
            <View key={c.label} style={[styles.stat, i > 0 && styles.statRule]}>
              <Text style={styles.statNum}>{fmt(c.n)}</Text>
              <Text style={styles.statLabel}>{c.label}</Text>
            </View>
          ))}
        </Glass>

        <View style={styles.actions}>
          <GlassButton label="Edit profile" onPress={() => router.push("/athlete/settings")} style={styles.flex} />
          <GlassButton label="Share profile" onPress={onShare} style={styles.flex} />
        </View>

        <GlassTabs options={TABS} value={tab} onChange={setTab} style={styles.tabs} />

        {tab === "lifts" ? (
          <View style={styles.tabBody}>
            <LiftsGrid
              posts={posts}
              onOpenPost={(postId) =>
                router.push({
                  pathname: "/athlete/post-expanded",
                  params: { post_id: postId },
                })
              }
            />
          </View>
        ) : (
          <ProfileProgress
            me={me}
            rankLoading={rankQ.isLoading}
            season={season}
            sex={sex}
            cls={rankClass}
            boardLabel={board}
            card={card}
            lifts={lifts}
            bests={bests}
            bodyweightKg={bwKg ?? card?.stats.bodyweightKg ?? null}
            hasVerified={hasVerified}
            onClaim={onClaim}
          />
        )}
      </ScrollView>
    </OlyScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  strong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: 6,
  },
  navLeft: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  roundBtn: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  olys: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 40,
    paddingHorizontal: 14,
  },
  olysDot: {
    width: 7,
    height: 7,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    ...olyGlow.sm,
  },
  olysNum: { fontFamily: olyFonts.bold, fontSize: 14, color: olyColors.text.primary },
  olysUnit: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.secondary },
  scroll: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: 120,
  },
  identity: { alignItems: "center", paddingTop: olySpacing[4] },
  avatarRing: {
    padding: 3,
    borderRadius: olyRadius.full,
    borderWidth: 2,
    borderColor: olyColors.accent,
    ...olyGlow.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: olySpacing[20],
  },
  name: {
    flexShrink: 1,
    fontFamily: olyFonts.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: olyColors.text.primary,
  },
  meta: { marginTop: olySpacing[4], fontFamily: olyFonts.regular, fontSize: 13, color: olyColors.text.secondary },
  metaLine: { marginTop: 3, fontFamily: olyFonts.regular, fontSize: 13, color: olyColors.text.secondary },
  cc: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    marginTop: 14,
    paddingHorizontal: 14,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  pillText: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.secondary },
  tierBar: { width: 44, marginLeft: olySpacing[8] },
  pillRule: { width: 1, height: 14, marginHorizontal: olySpacing[12], backgroundColor: olyColors.glass.bar },
  stats: { flexDirection: "row", marginTop: 18, paddingVertical: 14 },
  stat: { flex: 1, alignItems: "center" },
  statRule: { borderLeftWidth: 1, borderLeftColor: olyColors.glass.rule },
  statNum: {
    fontFamily: olyFonts.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: olyColors.text.primary,
  },
  statLabel: { marginTop: 2, fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.secondary },
  actions: { flexDirection: "row", gap: olySpacing[8], marginTop: 10 },
  tabs: { marginTop: 18 },
  tabBody: { marginTop: olySpacing[16] },
});
