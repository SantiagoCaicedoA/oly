import CoachNote from "@/components/coach-note";
import TodaysTraining from "@/components/todays-training";
import VolumeIntensity from "@/components/volume-intensity";
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VolumeIntensity />
        <CoachNote />
        <TodaysTraining />
      </ScrollView>
    </SafeAreaView>
  );
}
