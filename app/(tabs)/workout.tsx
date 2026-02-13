import CoachNote from "@/components/coach-note";
import ScreenWrapper from "@/components/screen-wrapper";
import TodaysTraining from "@/components/todays-training";
import VolumeIntensity from "@/components/volume-intensity";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

export default function Workout() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(16),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScreenWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <VolumeIntensity />
          <CoachNote />
          <TodaysTraining />

          <CustomButton title="ADD EXERCISE" />
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}
