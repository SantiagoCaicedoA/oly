import CoachNote from "@/components/coach-note";
import ScreenWrapper from "@/components/screen-wrapper";
import TodaysTraining from "@/components/todays-training";
import VolumeIntensity from "@/components/volume-intensity";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { Exercise } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { router } from "expo-router";

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";

export default function Workout() {
  const { colors } = useTheme();
  const coachNote = useSelector((state: RootState) => state.training.coachNote);
  const keyCues = useSelector((state: RootState) => state.training.keyCues);
  const todaysTraining = useSelector(
    (state: RootState) => state.training.todaysTraining,
  );

  const handlePressItem = (item: Exercise) => {
    router.push("/athlete/daily-check-in");
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
