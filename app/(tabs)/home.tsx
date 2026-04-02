import { Images } from "@/assets";
import PostCard from "@/components/post-card";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { useGetPostsQuery } from "@/store/api";
import { RootState } from "@/store/store";
import { Typography } from "@/utils/custom-styles";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const LIMIT = 10;
  const [page, setPage] = useState(1);
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

  
  useEffect(() => {
    setAllPosts([]);
    setPage(1);
    setHasMore(true);
  }, [token]);

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
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingBottom: insets.bottom + scale(30),
    },
    icon: {
      width: scale(20),
      height: scale(20),
      borderRadius: scale(20),
      marginRight: scale(10),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: scale(12),
      borderBottomWidth: 0.5,
      borderColor: colors.text,
      backgroundColor: colors.headerBackground,
      paddingHorizontal: scale(8),
    },
    headerSection: {
      flexDirection: "row",
    },
    home: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    listContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    emptyText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
    },

    errorText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: "red",
    },

    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(24),
      gap: scale(12),
    },

    emptyTitle: {
      fontSize: Typography.fontSize["2xl"],
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },

    emptySubtitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      textAlign: "center",

      maxWidth: scale(260),
    },

    button: {
      width: "70%",
      maxWidth: scale(160),
    },
  });

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
          <ActivityIndicator size="large" color={colors.primary} />
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
        {/* <ScreenWrapper> */}
        <View style={styles.header}>
          <View style={styles.headerSection}>
            <Image source={Images.profile} style={styles.icon} />
            <Image source={Images.search} style={styles.icon} />
          </View>
          <Text style={styles.home}>HOME</Text>
          <View style={styles.headerSection}>
            <Image source={Images.notificationicon} style={styles.icon} />
            <Image source={Images.comment} style={styles.icon} />
          </View>
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
                color={colors.primary}
                style={{ padding: scale(10) }}
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
        {/* </ScreenWrapper> */}
      </SafeAreaView>
    </>
  );
}
