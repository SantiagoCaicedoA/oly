import CompetitionLifts from "@/components/competition-lifts";
import RecentInsight from "@/components/recent-insight";
import RecentLifts from "@/components/recent-lifts";
import UserProfileInfo from "@/components/user-profile-info";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyProfile() {
  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Nav Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerTouch}
          onPress={handleBackPress}
          hitSlop={olySpacing[8]}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={olyColors.text.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerTouch}
          onPress={() => router.push("/athlete/settings")}
          hitSlop={olySpacing[8]}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={olyColors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <UserProfileInfo isOwnProfile />
        <CompetitionLifts />
        <RecentLifts />
        <RecentInsight />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: olyPalette.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: olyLayout.navBarHeight,
    paddingHorizontal: olyLayout.screenPadding,
  },
  headerTouch: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[40],
    gap: olySpacing[24],
  },
});
