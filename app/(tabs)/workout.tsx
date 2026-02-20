import CoachNote from "@/components/coach-note";
import ScreenWrapper from "@/components/screen-wrapper";
import TodaysTraining from "@/components/todays-training";
import VolumeIntensity from "@/components/volume-intensity";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { Days, Exercise } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { router } from "expo-router";

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";

export default function Workout() {
  const { colors } = useTheme();

  const days = useSelector((state: RootState) => state.training.days);
  const DAY_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayKey = DAY_KEYS[new Date().getDay()] as keyof Days;
  const todayData = days?.[dayKey];

  const coachNote = todayData?.coach_note ?? "";
  const keyCues = todayData?.key_cues ?? [];
  const todaysTraining = todayData?.exercises ?? [];
  const handlePressItem = (item: Exercise) => {
    router.push({
      pathname: "/athlete/training-exercise",
      params: { exercise: JSON.stringify(item) },
    });
  };

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
          <CoachNote coach_note={coachNote} key_cues={keyCues} />
          <TodaysTraining
            trainings={todaysTraining}
            onPressItem={handlePressItem}
          />

          <CustomButton title="ADD EXERCISE" />
        </ScrollView>
      </ScreenWrapper>
    </SafeAreaView>
  );
}
