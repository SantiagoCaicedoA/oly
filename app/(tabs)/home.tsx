import PostCard from "@/components/post-card";
import { OlyIcon } from "@/components/icons/OlyIcon";
import { ProfileRankCard } from "@/src/oly-components/profile/ProfileRankCard";
import { useMyStanding } from "@/src/oly-hooks/useMyStanding";
import { OLY_LOGO_PATH, OLY_LOGO_VIEWBOX } from "@/constants/oly-logo";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useGetPostsQuery } from "@/store/api";
import { RootState } from "@/store/store";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

/**
 * Home feed.
 *
 * Design system: Feed and rank / HomeFeed.
 *
 * Removed from the previous version:
 *  - The search and mail icons. Both are tabs now; a header icon that
 *    duplicates a tab teaches nothing.
 *  - Four of the six filters. Squats is not a competition lift, and the
 *    question a feed answers is whose lifts you are seeing.
 *  - The "COMMUNITY" title. It named nothing. The wordmark does the job.
 *  - The loading spinner, replaced by a skeleton in the feed's own shape.
 *
 * Added:
 *  - The two header actions, post and notifications, as a pair of circles
 *    on the right. The wordmark grows to 40 to hold the other end of the
 *    row, so the top no longer reads as empty.
 *
 * Removed after that:
 *  - The full width compose prompt. The plus in the header does the same
 *    job in a quarter of the space, and the empty state still offers it
 *    in words when there is nothing to read.
 *
 * Above the first post sits the compact ProfileRankCard, the same
 * component the profile screen uses as its hero. A feed is pleasant to
 * scroll; a standing is a reason to post. It is the one thing on this
 * screen that connects the feed to Rank, which is the actual product.
 * It renders nothing at all until there is a rank to show.
 *
 * NOT HERE YET: the Following / Everyone filter. `GetPostsParams` has no
 * `scope`, so the pills would be a control that does nothing. When the API
 * takes a scope, add it to GetPostsParams, put the two pills back from the
 * design system (Feed and rank / HomeFeed), and pass `scope` to the query.
 */

const LIMIT = 10;

function Wordmark() {
  return (
    <Svg width={40} height={40} viewBox={OLY_LOGO_VIEWBOX}>
      <Path d={OLY_LOGO_PATH} fill={olyColors.text.primary} />
    </Svg>
  );
}

/* A dim block in the shape of what is coming, with a slow pulse. */
function Skeleton({ height, width = "100%", radius = olyRadius.sm }: any) {
  const o = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [o]);
  return (
    <Animated.View
      style={{
        height,
        width,
        borderRadius: radius,
        backgroundColor: olyPalette.cardElevated,
        opacity: o,
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <View style={styles.skelCard}>
      <View style={styles.skelAuthor}>
        <Skeleton height={32} width={32} radius={olyRadius.full} />
        <Skeleton height={12} width={110} />
      </View>
      <Skeleton height={300} radius={0} />
      <View style={styles.skelBody}>
        <Skeleton height={16} width="45%" />
        <Skeleton height={12} width="72%" />
      </View>
    </View>
  );
}

export default function Home() {
  const token = useSelector((s: RootState) => s.auth.token);
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const loadingMore = useRef(false);

  const { data, isLoading, isError, isFetching } = useGetPostsQuery(
    { page, limit: LIMIT },
    { skip: !token },
  );

  useEffect(() => {
    if (!data?.data) return;
    setAllPosts((prev) => {
      if (page === 1) return data.data;
      const seen = new Set(prev.map((p: any) => p._id));
      return [...prev, ...data.data.filter((p: any) => !seen.has(p._id))];
    });
    setHasMore(data.data.length >= LIMIT);
  }, [page, data]);

  useEffect(() => {
    setAllPosts([]);
    setPage(1);
    setHasMore(true);
  }, [token]);

  useEffect(() => {
    if (!isFetching) loadingMore.current = false;
  }, [isFetching]);

  const onViewable = useRef(({ viewableItems }: any) =>
    setVisibleIds(new Set(viewableItems.map((v: any) => v.item._id))),
  ).current;

  const loadMore = () => {
    if (loadingMore.current || isFetching || isLoading || !hasMore) return;
    loadingMore.current = true;
    setPage((p) => p + 1);
  };

  const compose = () => router.push("/athlete/create-new-post");

  const standing = useMyStanding();

  /* No skeleton and no placeholder. An athlete with no rank yet gets the
     feed starting where it always did, rather than a box apologising. */
  const standingCard =
    standing.me && !standing.isLoading ? (
      <ProfileRankCard
        compact
        me={standing.me}
        season={standing.season}
        sex={standing.sex}
        onClaim={compose}
        onPress={() => router.push("/(tabs)/rank")}
      />
    ) : null;

  const header = (
    <View style={styles.header}>
      <Wordmark />
      <View style={styles.actions}>
        <Pressable
          style={[styles.act, styles.actBrand]}
          onPress={compose}
          accessibilityRole="button"
          accessibilityLabel="Post a lift"
        >
          {/* text-primary on the blue disc. The glyph is never blue. */}
          <OlyIcon name="plus" size={22} color={olyColors.text.primary} />
        </Pressable>
        <Pressable
          style={styles.act}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <OlyIcon name="bell" size={22} color={olyColors.text.secondary} />
          <View style={styles.dot} />
        </Pressable>
      </View>
    </View>
  );

  const empty = () => {
    if (isLoading) return null;
    if (isError) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>Couldn&apos;t load the feed</Text>
          <Text style={styles.stateBody}>
            Check your connection and try again.
          </Text>
          <Pressable style={styles.stateCta} onPress={() => setPage(1)}>
            <Text style={styles.stateCtaText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>Nothing here yet</Text>
        <Text style={styles.stateBody}>
          Follow a few athletes, or post the first lift and let the board find
          you.
        </Text>
        <Pressable style={styles.stateCta} onPress={compose}>
          <Text style={styles.stateCtaText}>Post a lift</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeAreaView style={styles.screen} edges={["top"]}>
        {header}

        {isLoading ? (
          <View style={styles.skelWrap}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={allPosts}
            keyExtractor={(i) => i._id}
            ListHeaderComponent={
              standingCard ? (
                <View style={styles.standing}>{standingCard}</View>
              ) : null
            }
            renderItem={({ item, index }) => (
              <PostCard
                first={index === 0}
                post={item}
                onPress={(id) =>
                  router.push({
                    pathname: "/athlete/post-expanded",
                    params: { post_id: id },
                  })
                }
                isVisible={visibleIds.has(item._id)}
              />
            )}
            onViewableItemsChanged={onViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            contentContainerStyle={[
              styles.list,
              allPosts.length === 0 && styles.listEmpty,
            ]}
            ListEmptyComponent={empty}
            ListFooterComponent={
              isFetching && allPosts.length ? (
                <View style={styles.footer}>
                  <Skeleton height={12} width="40%" />
                </View>
              ) : null
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
            windowSize={5}
            initialNumToRender={6}
            removeClippedSubviews
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[12],
  },
  actions: {
    marginLeft: "auto",
    flexDirection: "row",
    gap: olySpacing[8],
  },
  /* A circular action sits one elevation step above the screen. */
  act: {
    width: 38,
    height: 38,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  actBrand: { backgroundColor: olyPalette.primary },
  dot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    borderWidth: 2,
    borderColor: olyPalette.card,
  },

  standing: {
    marginHorizontal: olyLayout.screenPadding,
    marginBottom: olySpacing[16],
  },

  skelWrap: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[16],
  },

  /* No horizontal padding. Posts run edge to edge and supply their own
     gutters for text; the media deliberately has none. */
  list: {
    paddingBottom: olySpacing[16],
  },
  listEmpty: { flexGrow: 1 },
  footer: { paddingVertical: olySpacing[16], alignItems: "center" },

  skelCard: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
    marginBottom: olySpacing[16],
  },
  skelAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    padding: olySpacing[12],
  },
  skelBody: { padding: olySpacing[16], gap: olySpacing[8] },

  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: olySpacing[24],
    gap: olySpacing[8],
  },
  stateTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  stateBody: {
    ...olyTypography.bodySmall,
    lineHeight: 20,
    color: olyColors.text.secondary,
    textAlign: "center",
    maxWidth: 300,
  },
  stateCta: {
    marginTop: olySpacing[8],
    height: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[20],
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.button.primary.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  stateCtaText: {
    ...olyTypography.button,
    color: olyColors.button.primary.text,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
  },
});
