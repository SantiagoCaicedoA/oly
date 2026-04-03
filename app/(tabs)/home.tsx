import PostCard from "@/components/post-card";
import CustomButton from "@/constants/custom-button";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import { useGetPostsQuery } from "@/store/api";
import { RootState } from "@/store/store";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const HEADER_ICON_SIZE = 24;

const FEED_FILTERS = [
  "All",
  "Snatch",
  "Clean & Jerk",
  "Squats",
  "PRs",
  "Following",
] as const;

export default function Home() {
  const insets = useSafeAreaInsets();
  const token = useSelector((state: RootState) => state.auth.token);
  const LIMIT = 10;
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const isLoadingMore = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());
  const {
    data: postsData,
    isLoading,
    isError,
    isFetching,
  } = useGetPostsQuery({ page, limit: LIMIT }, { skip: !token });
  const posts = postsData?.data ?? [];

  useEffect(() => {
    if (postsData?.data) {
      if (page === 1) {
        setAllPosts(postsData.data);
      } else {
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const unique = postsData.data.filter((p) => !existingIds.has(p._id));
          return [...prev, ...unique];
        });
      }
      if (postsData.data.length < LIMIT) setHasMore(false);
      else setHasMore(true);
    }
  }, [page, postsData]);

  const handlePostPress = (post_id: string) => {
    router.push({
      pathname: "/athlete/post-expanded",
      params: { post_id },
    });
  };
  const handleLoadMore = () => {
    if (isLoadingMore.current || isFetching || isLoading || !hasMore) return;
    isLoadingMore.current = true;
    setPage((prev) => prev + 1);
  };
  useEffect(() => {
    if (!isFetching) {
      isLoadingMore.current = false;
    }
  }, [isFetching]);
  const handleRefresh = () => {
    setHasMore(true);
    setPage(1);
  };
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const ids = new Set<string>(
      viewableItems.map((item: any) => item.item._id),
    );
    setVisiblePostIds(ids);
  }).current;

  const renderEmptyComponent = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>
          Share your first lift and start tracking your progress.
        </Text>
        <CustomButton
          title="Create Post"
          onPress={() => router.push("athlete/create-new-post")}
          style={styles.button}
        />
      </View>
    );
  };

  const renderErrorComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.errorText}>
        Something went wrong. Please try again.
      </Text>

      <CustomButton
        title="Retry"
        onPress={handleRefresh}
        style={styles.button}
      />
    </View>
  );
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={olyPalette.primary} />
        </View>
      </SafeAreaView>
    );
  }
  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        {renderErrorComponent()}
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.stickyHeader}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.profileAvatar}
                onPress={() => router.push("/athlete/my-profile")}
                activeOpacity={0.7}
              >
                <Text style={styles.profileAvatarText}>OF</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>COMMUNITY</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity hitSlop={olySpacing[8]} activeOpacity={0.6}>
                <Ionicons
                  name="search-outline"
                  size={HEADER_ICON_SIZE}
                  color={olyColors.text.secondary}
                />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={olySpacing[8]} activeOpacity={0.6}>
                <View>
                  <Ionicons
                    name="mail-outline"
                    size={HEADER_ICON_SIZE}
                    color={olyColors.text.secondary}
                  />
                  <View style={styles.notificationDot} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity hitSlop={olySpacing[8]} activeOpacity={0.6}>
                <Ionicons
                  name="notifications-outline"
                  size={HEADER_ICON_SIZE}
                  color={olyColors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={styles.filterContainer}
          >
            {FEED_FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <LinearGradient
            colors={[olyPalette.background, "transparent"]}
            style={styles.headerFade}
          />
        </View>

        <FlatList
          data={allPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={handlePostPress}
              isVisible={visiblePostIds.has(item._id)}
            />
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          contentContainerStyle={[
            styles.listContent,
            allPosts.length === 0 && { flex: 1 },
          ]}
          ListFooterComponent={() =>
            isFetching && !isLoading ? (
              <ActivityIndicator
                size="small"
                color={olyPalette.primary}
                style={{ padding: olySpacing[8] }}
              />
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          windowSize={5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  stickyHeader: {
    backgroundColor: olyPalette.background,
    zIndex: 1,
  },
  headerFade: {
    height: 12,
    marginTop: -1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    fontSize: 11,
    fontFamily: olyTypography.caption.fontFamily,
    fontWeight: "500",
    color: olyColors.text.secondary,
  },
  headerTitle: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[20],
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    borderWidth: 1.5,
    borderColor: olyPalette.card,
  },
  filterContainer: {
    flexGrow: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: olySpacing[8],
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[12],
  },
  filterPill: {
    paddingHorizontal: olySpacing[16],
    height: 32,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  filterPillActive: {
    backgroundColor: olyPalette.primary,
    borderColor: olyPalette.primary,
  },
  filterText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  filterTextActive: {
    color: olyPalette.white,
  },
  listContent: {
    paddingTop: olySpacing[4],
    paddingBottom: olySpacing[16],
    paddingHorizontal: olyLayout.screenPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },

  errorText: {
    ...olyTypography.body,
    color: olyColors.text.error,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: olySpacing[24],
    gap: olySpacing[12],
  },

  emptyTitle: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },

  emptySubtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    textAlign: "center",
    maxWidth: 260,
  },

  button: {
    width: "70%",
    maxWidth: 160,
  },
});
