import ChallengeCard from "@/components/challenge-card";
import FeedCard from "@/components/feed-card";
import { Glass, Glows, kit } from "@/src/oly-components/shop/ShopKit";
import { fmt, useWallet } from "@/src/oly-mock/wallet";
import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useGetPostsQuery } from "@/store/api";
import { RootState } from "@/store/store";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
import { useSelector } from "react-redux";

/**
 * Home feed. Feed A on the canvas.
 *
 * The header floats over the feed: avatar, olys balance, post and
 * notifications, with a fade so posts dissolve under it. The weekly
 * challenge sits above the first post, and every post is a glass FeedCard.
 */

const LIMIT = 10;


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
  const user = useSelector((s: RootState) => (s.auth as any).user);
  const meInitials = ((user?.name ?? "").trim().split(/\s+/).map((w: string) => w[0]).join("").slice(0, 2) || "ME").toUpperCase();
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

  /* Feed A: the olys balance replaces the rank chip. It opens the Shop. */
  const wallet = useWallet();
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(110);
  const olysChip = (
    <Pressable hitSlop={4}
      onPress={() => router.push("/(tabs)/marketplace")}
      style={({ pressed }) => [styles.olysWrap, pressed && kit.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${fmt(wallet.balance)} olys. Open the shop.`}
    >
      <Glass radius={olyRadius.full} style={styles.olys}>
        <View style={styles.olysDot} />
        <Text style={styles.olysText}>{fmt(wallet.balance)} olys</Text>
      </Glass>
    </Pressable>
  );

  const header = (
    <View style={styles.header}>
      <Pressable hitSlop={4}
        onPress={() => router.push("/(tabs)/profile")}
        style={styles.me}
        accessibilityRole="button"
        accessibilityLabel="Your profile"
      >
        {user?.photo_url ? (
          <Image source={{ uri: user.photo_url }} style={styles.meImg} />
        ) : (
          <Text style={styles.meInitials}>{meInitials}</Text>
        )}
      </Pressable>
      {olysChip}
      <View style={styles.actions}>
        <Pressable hitSlop={4}
          style={[styles.act, styles.actBrand]}
          onPress={compose}
          accessibilityRole="button"
          accessibilityLabel="Post a lift"
        >
          {/* text-primary on the blue disc. The glyph is never blue. */}
          <OlyIcon name="plus" size={22} color={olyColors.text.primary} />
        </Pressable>
        <Pressable hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={({ pressed }) => pressed && kit.pressed}
        >
          <Glass radius={olyRadius.full} style={styles.act}>
            <OlyIcon name="bell" size={20} color={olyColors.text.primary} />
          </Glass>
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
      <View style={styles.root}>
      <Glows variant="shop" />
      <View style={styles.screen}>

        {isLoading ? (
          <View style={[styles.skelWrap, { paddingTop: headerH + 14 }]}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={allPosts}
            keyExtractor={(i) => i._id}
            renderItem={({ item }) => (
              <FeedCard
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
              { paddingTop: headerH },
              styles.list,
              allPosts.length === 0 && styles.listEmpty,
            ]}
            ListHeaderComponent={<ChallengeCard />}
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
            scrollIndicatorInsets={{ top: headerH }}
            windowSize={5}
            initialNumToRender={6}
            removeClippedSubviews
          />
        )}
        {/* Header floats over the feed. A fade from the page colour sits
            behind it, so posts dissolve under it instead of being cut by
            a hard line. */}
        <OlyFloatingHeader onLayout={onHeaderLayout}>{header}</OlyFloatingHeader>
      </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: olyColors.bg.page },
  screen: { flex: 1, backgroundColor: "transparent" },
  olysWrap: { marginLeft: olySpacing[8] + 2, flexShrink: 1 },
  olys: { height: 40, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  olysDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: olyColors.glass.glow, ...olyGlow.md },
  olysText: { fontFamily: olyFonts.medium, fontSize: 14, color: olyColors.text.primary },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[8],
  },
  /* Your profile: your face, top left. */
  me: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  meImg: { width: 40, height: 40 },
  meInitials: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  actions: {
    marginLeft: "auto",
    flexDirection: "row",
    gap: olySpacing[8],
  },
  /* A circular action sits one elevation step above the screen. */
  act: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  actBrand: { backgroundColor: olyPalette.primary, ...olyGlow.md },
  dot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
  },

  skelWrap: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[16],
  },

  /* No horizontal padding. Posts run edge to edge and supply their own
     gutters for text; the media deliberately has none. */
  list: {
    paddingBottom: 120,
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
