import { Images } from "@/assets";
import PostCard from "@/components/post-card";
import { useTheme } from "@/context/theme-context";
import { useGetPostsQuery } from "@/store/api";
import { Typography } from "@/utils/custom-styles";
import { Stack } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

export default function Home() {
  const { colors } = useTheme();

  const { data, isLoading, error } = useGetPostsQuery();

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
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeAreaView style={styles.container}>
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
          data={data?.data || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
}
