import { Images } from "@/assets";
import PostCard from "@/components/post-card";
import ScreenWrapper from "@/components/screen-wrapper";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { useGetAiTrainingQuery, useGetPostsQuery } from "@/store/api";
import { setTrainingData } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { Typography } from "@/utils/custom-styles";
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";

export default function Home() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    data: postsData,
    isLoading,
    isError,
    refetch,
    isFetching,
    error,
  } = useGetPostsQuery();
  const { data } = useGetAiTrainingQuery();

  const posts = data?.data ?? [];
  useEffect(() => {
    if (data) {
      dispatch(setTrainingData(data));
    }
  }, [data]);
  const handlePostPress = (post_id: string) => {
    router.push({
      pathname: "/athlete/post-expanded",
      params: { post_id },
    });
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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

      <CustomButton title="Retry" onPress={refetch} style={styles.button} />
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
        <ScreenWrapper>
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
            data={postsData?.data || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <PostCard post={item} onPress={handlePostPress} />
            )}
            contentContainerStyle={[
              styles.listContent,
              posts.length === 0 && { flex: 1 },
            ]}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={refetch}
                colors={[colors.primary]}
                tintColor={colors.primary}
                size={56}
              />
            }
          />
        </ScreenWrapper>
      </SafeAreaView>
    </>
  );
}

// import { useGetAiTrainingQuery } from "@/store/api";
// import { setTrainingData } from "@/store/reducer/trainingSlice";
// import React, { useEffect } from "react";
// import { StyleSheet, Text, View } from "react-native";
// import { useDispatch } from "react-redux";

// export default function home() {
//   const dispatch = useDispatch();
//   const { data } = useGetAiTrainingQuery();

//   useEffect(() => {
//     if (data) {
//       dispatch(setTrainingData(data));
//     }
//   }, [data]);

//   return (
//     <View>
//       <Text>home</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({});
