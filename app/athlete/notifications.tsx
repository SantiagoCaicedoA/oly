import { NotificationCard } from "@/src/oly-components/notifications/NotificationCard";
import { OlyScreenHeader } from "@/src/oly-components/organisms/OlyScreenHeader";
import {
  OlyFloatingHeader,
  useFloatingHeader,
} from "@/src/oly-components/organisms/OlyFloatingHeader";
import { GlassTabs, Glows } from "@/src/oly-components/shop/ShopKit";
import { useNotificationFeed } from "@/src/oly-mock/notifications";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import {
  useApproveFollowRequestMutation,
  useDeclineFollowRequestMutation,
  useFollowAthleteMutation,
  useMarkNotificationsReadMutation,
} from "@/store/api";
import type {
  NotificationType,
  OlyNotification,
} from "@/types/api/notifications";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

/**
 * Notifications. Design "C. Glass cards with filters" on the canvas.
 *
 * Four filters. Rank is where you stand, Lifts is what happened to your
 * lifts and olys, People is everyone else. Messages are not here on
 * purpose: they live in the Messages tab.
 *
 * The header is the Wallet header (plain back arrow, 20px title, floating
 * over the list with a fade), not the canvas one, so every pushed screen
 * reads the same. The filters ride in the header so they stay put.
 */
type Filter = "all" | "rank" | "lifts" | "people";

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "rank", label: "Rank" },
  { value: "lifts", label: "Lifts" },
  { value: "people", label: "People" },
];

const GROUP: Record<NotificationType, Exclude<Filter, "all">> = {
  rank_up: "rank",
  rank_down: "rank",
  proximity: "rank",
  lift_verified: "lifts",
  lift_rejected: "lifts",
  olys_earned: "lifts",
  challenge_ending: "lifts",
  challenge_completed: "lifts",
  like: "people",
  comment: "people",
  comment_reply: "people",
  comment_like: "people",
  follow: "people",
  follow_request: "people",
  following_pr: "people",
};

const EMPTY: Record<Filter, string> = {
  all: "Likes, comments and rank changes show up here.",
  rank: "When you move on the board, you'll see it here.",
  lifts: "Verified lifts, olys and challenges show up here.",
  people: "Likes, comments and new followers show up here.",
};

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const { headerH, onLayout } = useFloatingHeader(110);
  const feed = useNotificationFeed();
  const [markRead] = useMarkNotificationsReadMutation();
  const [approve] = useApproveFollowRequestMutation();
  const [decline] = useDeclineFollowRequestMutation();
  const [follow] = useFollowAthleteMutation();

  // Rows answered on this screen (request accepted or declined) leave the
  // list; follow-backs flip their button. Kept locally so it feels instant.
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  // Opening the screen reads everything. Done once, after the list lands,
  // and never on sample data.
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current || feed.isLoading || feed.isSample) return;
    if (feed.items.some((n) => !n.read)) {
      marked.current = true;
      markRead();
    }
  }, [feed.isLoading, feed.isSample, feed.items, markRead]);

  const rows = useMemo(
    () =>
      feed.items.filter(
        (n) =>
          !gone.has(n._id) && (filter === "all" || GROUP[n.type] === filter),
      ),
    [feed.items, filter, gone],
  );

  const open = (n: OlyNotification) => {
    const postId = n.data?.postId;
    if (postId)
      router.push({
        pathname: "/athlete/post-expanded",
        params: { post_id: postId },
      });
  };

  const answer = async (n: OlyNotification, accept: boolean) => {
    setGone((s) => new Set(s).add(n._id));
    const userId = n.data?.userId;
    if (feed.isSample || !userId) return;
    try {
      await (accept ? approve(userId) : decline(userId)).unwrap();
    } catch {
      setGone((s) => {
        const next = new Set(s);
        next.delete(n._id);
        return next;
      });
    }
  };

  const followBack = async (n: OlyNotification) => {
    setFollowed((s) => new Set(s).add(n._id));
    const userId = n.data?.userId;
    if (feed.isSample || !userId) return;
    try {
      await follow(userId).unwrap();
    } catch {
      setFollowed((s) => {
        const next = new Set(s);
        next.delete(n._id);
        return next;
      });
    }
  };

  return (
    <View style={styles.screen}>
      <Glows variant="wallet" />

      <FlatList
        data={rows}
        keyExtractor={(n) => n._id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: headerH + olySpacing[12] },
        ]}
        scrollIndicatorInsets={{ top: headerH }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={feed.isFetching && !feed.isLoading}
            onRefresh={feed.refetch}
            tintColor={olyColors.text.secondary as string}
            progressViewOffset={headerH}
          />
        }
        renderItem={({ item }) => (
          <NotificationCard
            n={item}
            onPress={item.data?.postId ? () => open(item) : undefined}
            onAccept={() => answer(item, true)}
            onDecline={() => answer(item, false)}
            onFollowBack={() => followBack(item)}
            followedBack={followed.has(item._id)}
          />
        )}
        ListEmptyComponent={
          feed.isLoading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {feed.isError ? "Couldn't load notifications" : "Nothing yet"}
              </Text>
              <Text style={styles.emptyBody}>
                {feed.isError ? "Pull down to try again." : EMPTY[filter]}
              </Text>
            </View>
          )
        }
      />

      <OlyFloatingHeader onLayout={onLayout}>
        <OlyScreenHeader title="Notifications" onBack={() => router.back()} />
        <View style={styles.tabs}>
          <GlassTabs options={FILTERS} value={filter} onChange={setFilter} />
        </View>
      </OlyFloatingHeader>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  tabs: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[8],
  },
  list: {
    paddingHorizontal: olySpacing[12],
    paddingBottom: olySpacing[40],
  },
  empty: {
    alignItems: "center",
    paddingTop: olySpacing[40],
    paddingHorizontal: olySpacing[32],
    gap: olySpacing[8],
  },
  emptyTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  emptyBody: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
  },
});
