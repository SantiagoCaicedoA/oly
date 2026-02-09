import { Images } from "@/assets";
import PostCard from "@/components/post-card";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { Stack } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

export default function Home() {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
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
      backgroundColor: "#0f1b25",
      paddingVertical: scale(12),
      borderBottomWidth: 0.5,
      borderColor: colors.text,

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
  });

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
