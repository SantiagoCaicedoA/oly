/**
 * My Profile — the athlete's competitive resume (redesign v2).
 *
 * Order tells the story: who I am → where I rank → my verified bests →
 * what I've earned → what only I can see → the full record.
 * All data is live: profile, /leaderboard/me, athlete card (proof videos),
 * /lifts/me (history), /posts?feed=mine (grid), /follow/status (counts).
 */

import { OlyAvatar } from "@/src/oly-components/atoms/OlyAvatar";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { CompetitionLiftCards } from "@/src/oly-components/profile/CompetitionLiftCards";
import { InsightsCarousel } from "@/src/oly-components/profile/InsightsCarousel";
import { ProfileArchive } from "@/src/oly-components/profile/ProfileArchive";
import { ProfileRankCard } from "@/src/oly-components/profile/ProfileRankCard";
import { SeasonBadgesShelf } from "@/src/oly-components/profile/SeasonBadges";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ── IWF 2025-06 class labels from bodyweight — mirrors backend classTable ── */
const MEN_BOUNDS: [number, string][] = [
  [60, "60"], [65, "65"], [71, "71"], [79, "79"], [88, "88"], [94, "94"], [110, "110"],
];
const WOMEN_BOUNDS: [number, string][] = [
  [48, "48"], [53, "53"], [58, "58"], [63, "63"], [69, "69"], [77, "77"], [86, "86"],
];
function classFor(sex: "M" | "F", bw: number): string {
  const bounds = sex === "M" ? MEN_BOUNDS : WOMEN_BOUNDS;
  for (const [limit, label] of bounds) if (bw <= limit) return label;
  return sex === "M" ? "+110" : "+86";
}

export default function MyProfile() {
  const profileQ = useGetProfileQuery();
  const user = profileQ.data?.data;
  const profile = user?.profile;

  const myId: string | undefined = user?._id;
  const displayName = user?.name || profile?.display_name || "Athlete";
  const username = user?.username || "";
  const avatarUrl =
    profile?.profile_image_url || user?.photo_url || undefined;
  const countryCode: string | null = profile?.countryCode ?? null;
  const club: string | null = profile?.club ?? null;

  const sex: "M" | "F" = profile?.sex === "Female" ? "F" : "M";
  const bwKg = useMemo(() => {
    const v = profile?.bodyweight_value;
    if (typeof v !== "number" || v <= 0) return null;
    return profile?.bodyweight_unit === "lbs" ? v * 0.453592 : v;
  }, [profile?.bodyweight_value, profile?.bodyweight_unit]);
  const weightClass = bwKg ? classFor(sex, bwKg) : null;

  const seasonQ = useGetCurrentSeasonQuery();
  // Card first, class-less: the server returns my best verified entry
  // wherever it actually lives — never a guess from profile bodyweight.
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
  const me = rankQ.data?.me ?? null;
  const card = cardQ.data ?? null;
  const lifts = liftsQ.data?.lifts ?? [];
  const posts = postsQ.data?.data ?? [];
  const counts = followQ.data?.data;

  const hasVerified =
    !!card?.videos.snatch || !!card?.videos.cleanjerk || lifts.length > 0;
  const hasArchive = lifts.length > 0 || posts.length > 0;

  const shownClass = card?.athlete.weightClass ?? weightClass;
  const boardLabel = shownClass
    ? `${sex === "M" ? "Men" : "Women"} ${shownClass} kg`
    : null;

  const onShare = () => {
    Share.share({
      message: username
        ? `Check my verified lifts on Oly — @${username}`
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
      {/* nav */}
      <View style={styles.nav}>
        {router.canGoBack() ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={olySpacing[8]}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={olyColors.text.secondary}
            />
          </Pressable>
        ) : (
          <View style={styles.navBtn} />
        )}
        <View style={styles.navRight}>
          <Pressable onPress={onShare} hitSlop={olySpacing[8]} style={styles.navBtn}>
            <Ionicons
              name="share-outline"
              size={20}
              color={olyColors.text.secondary}
            />
          </Pressable>
          <Pressable
            onPress={() => router.push("/athlete/settings")}
            hitSlop={olySpacing[8]}
            style={styles.navBtn}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={olyColors.text.secondary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* identity */}
        <View style={styles.idRow}>
          <OlyAvatar source={avatarUrl} name={displayName} size="large" />
          <View style={styles.idMain}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            {!!username && (
              <Text style={styles.handle} numberOfLines={1}>
                @{username}
              </Text>
            )}
          </View>
        </View>

        {/* chips — quiet identity, nothing screaming */}
        <View style={styles.chipRow}>
          {(countryCode || club) && (
            <View style={styles.chip}>
              {!!countryCode && <Text style={styles.chipCc}>{countryCode}</Text>}
              <Text style={styles.chipText}>{club ?? "Independent"}</Text>
            </View>
          )}
          {!!boardLabel && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{boardLabel}</Text>
            </View>
          )}
        </View>

        {/* counts */}
        <View style={styles.countsRow}>
          <Text style={styles.count}>
            <Text style={styles.countNum}>{counts?.followers ?? 0}</Text>{" "}
            followers
          </Text>
          <Text style={styles.count}>
            <Text style={styles.countNum}>{counts?.following ?? 0}</Text>{" "}
            following
          </Text>
        </View>

        {/* edit */}
        <Pressable
          onPress={() => router.push("/athlete/settings")}
          style={({ pressed }) => [
            styles.editBtn,
            pressed && { backgroundColor: olyPalette.cardElevated },
          ]}
        >
          <Text style={styles.editBtnText}>Edit profile</Text>
        </Pressable>

        {/* rank */}
        {me ? (
          <View style={styles.section}>
            <ProfileRankCard
              me={me}
              season={season}
              sex={sex}
              onClaim={onClaim}
              onPress={() => router.push("/(tabs)/rank")}
            />
          </View>
        ) : (
          !rankQ.isLoading && (
            <View style={styles.section}>
              <View style={styles.emptyRank}>
                <Text style={styles.emptyRankTitle}>
                  Your rank starts with one lift
                </Text>
                <Text style={styles.emptyRankText}>
                  Post a video of a single snatch or clean & jerk and take your
                  spot on {season?.label ?? "the season board"}.
                </Text>
                <Pressable
                  onPress={onClaim}
                  style={({ pressed }) => [
                    styles.claimBtn,
                    pressed && { backgroundColor: olyPalette.primaryPressed },
                  ]}
                >
                  <Text style={styles.claimBtnText}>POST YOUR FIRST LIFT</Text>
                </Pressable>
              </View>
            </View>
          )
        )}

        {/* competition lifts — only once there's something verified */}
        {hasVerified && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COMPETITION LIFTS</Text>
            <CompetitionLiftCards
              snatch={card?.videos.snatch ?? null}
              cleanjerk={card?.videos.cleanjerk ?? null}
            />
          </View>
        )}

        {/* season badges */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SEASON BADGES</Text>
          <SeasonBadgesShelf
            badges={[
              { state: "progress", caption: season?.label ?? "This season" },
            ]}
          />
        </View>

        {/* insights — own profile only, and only with data to read */}
        {hasVerified && (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>INSIGHTS</Text>
            <Text style={styles.sectionNote}>Only you see this</Text>
          </View>
          <InsightsCarousel
            snatchKg={card?.stats.snatchKg ?? me?.snatchKg ?? null}
            cleanKg={card?.stats.cleanKg ?? me?.cleanKg ?? null}
            sinclair={card?.stats.sinclair ?? me?.sinclair ?? null}
            totalKg={card?.stats.totalKg ?? null}
            bodyweightKg={
              card?.stats.bodyweightKg ??
              (bwKg ? Math.round(bwKg * 10) / 10 : null)
            }
            lifts={lifts}
            me={me}
            season={season}
            sex={sex}
          />
        </View>
        )}

        {/* archive */}
        {hasArchive && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ARCHIVE</Text>
          <ProfileArchive
            lifts={lifts}
            posts={posts}
            onOpenPost={(postId) =>
              router.push({
                pathname: "/athlete/post-expanded",
                params: { post_id: postId },
              })
            }
          />
        </View>
        )}
      </ScrollView>
    </OlyScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    minHeight: olyLayout.navBarHeight,
  },
  navRight: { flexDirection: "row", gap: olySpacing[8] },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[40],
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[16],
    marginTop: olySpacing[8],
  },
  idMain: { flex: 1, minWidth: 0 },
  name: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  handle: {
    ...olyTypography.bodySmall,
    color: olyColors.text.disabled,
    marginTop: olySpacing[4] / 2,
  },
  chipRow: {
    flexDirection: "row",
    gap: olySpacing[8],
    marginTop: olySpacing[16],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8] - 1,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12] + 2,
    paddingVertical: olySpacing[8] + 1,
  },
  chipCc: {
    ...olyTypography.caption,
    fontSize: 12,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  chipText: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  countsRow: {
    flexDirection: "row",
    gap: olySpacing[20],
    marginTop: olySpacing[16],
    paddingHorizontal: olySpacing[4] / 2,
  },
  count: {
    ...olyTypography.bodySmall,
    color: olyColors.text.disabled,
  },
  countNum: {
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  editBtn: {
    marginTop: olySpacing[16],
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    minHeight: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    ...olyTypography.label,
    color: olyColors.text.primary,
  },
  section: {
    marginTop: olySpacing[24],
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    ...olyTypography.label,
    fontSize: 12,
    lineHeight: 16,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[8] + 2,
  },
  sectionNote: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginBottom: olySpacing[8] + 2,
  },
  emptyRank: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olySpacing[16],
  },
  emptyRankTitle: {
    ...olyTypography.label,
    fontSize: 16,
    lineHeight: 20,
    color: olyColors.text.primary,
  },
  emptyRankText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
    marginTop: olySpacing[4],
  },
  claimBtn: {
    marginTop: olySpacing[16],
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    minHeight: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  claimBtnText: {
    ...olyTypography.label,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
});
