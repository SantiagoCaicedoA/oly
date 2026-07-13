import CompetitionLifts from "@/components/competition-lifts";
import RecentInsight from "@/components/recent-insight";
import RecentLifts from "@/components/recent-lifts";
import UserProfileInfo from "@/components/user-profile-info";
import { useGetProfileQuery } from "@/store/api";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyProfile() {
  const { data, isLoading } = useGetProfileQuery();
  const user = data?.data;
  const profile = user?.profile;
  const displayName = user?.name || profile?.display_name || "Athlete";
  const username = user?.username || "";
  const unit = profile?.bodyweight_unit || "kg";
  const snatchKg = profile?.strength_stats?.classic?.snatch?.value ?? 0;
  const cjKg = profile?.strength_stats?.classic?.clean_jerk?.value ?? 0;

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

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={olyColors.text.secondary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <UserProfileInfo isOwnProfile name={displayName} username={username} />
          <CompetitionLifts
            snatch={{ liftName: "Snatch", weight: snatchKg, unit }}
            cleanAndJerk={{ liftName: "Clean & Jerk", weight: cjKg, unit }}
          />
          <RecentLifts />
          <RecentInsight />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
