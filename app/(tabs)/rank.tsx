import { Images } from "@/assets";
import ExerciseChart from "@/components/exercise-chart";
import LiftSections from "@/components/lift-sections";
import MutualFriends from "@/components/mutual-friends";
import UserProfileInfo from "@/components/user-profile-info";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

export default function Rank() {
  const { colors } = useTheme();
  const handleBackPress = () => {
    router.back();
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(12),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(10),
      position: "relative",
      backgroundColor: colors.headerBackground,
    },
    backButton: {
      position: "absolute",
      left: scale(15),
      width: scale(12),
      height: scale(12),
    },
    headerText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
      textAlign: "center",
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image
            source={Images.arrowBack}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>

        <Text style={styles.headerText}>My Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <UserProfileInfo />
        <MutualFriends />
        <ExerciseChart />
        <LiftSections
          title="LIFT"
          liftDetails={[
            { liftName: "Snatch", weight: 120 },
            { liftName: "Clean & Jerk", weight: 140 },
          ]}
        />
        <LiftSections
          title="ARCHIVE"
          liftDetails={[
            { liftName: "Snatch", weight: 120 },
            { liftName: "Clean & Jerk", weight: 140 },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
