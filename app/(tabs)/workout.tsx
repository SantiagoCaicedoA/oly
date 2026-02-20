import CoachNote from "@/components/coach-note";
import ScreenWrapper from "@/components/screen-wrapper";
import TodaysTraining from "@/components/todays-training";
import VolumeIntensity from "@/components/volume-intensity";
import WeekCalendar from "@/components/week-calendar";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { useLazyGetAiTrainingQuery } from "@/store/api";
import { Days, Exercise, setTrainingData } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";

export default function Workout() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const token = useSelector((state: RootState) => state.auth.token);

  const days = useSelector((state: RootState) => state.training.days);
  const [fetchTraining, { data, isLoading, isError }] =
    useLazyGetAiTrainingQuery();

  useEffect(() => {
    if (token) {
      fetchTraining();
    }
  }, [token]);
  useEffect(() => {
    if (data) dispatch(setTrainingData(data));
  }, [data]);
  const DAY_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayKey = DAY_KEYS[selectedDate.getDay()] as keyof Days;
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
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: scale(12),
      paddingHorizontal: scale(24),
    },
    errorTitle: {
      fontSize: Typography.fontSize["2xl"],
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    errorSubtitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: scale(260),
      lineHeight: 25,
    },
    retryButton: {
      width: "70%",
      maxWidth: scale(160),
    },
  });
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !days) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>No Training Plan Found yet </Text>
          <Text style={styles.errorSubtitle}>
            We are in the process of generating training for you. If it takes
            time ,Please try again.
          </Text>
          <CustomButton
            title="RETRY"
            onPress={fetchTraining}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScreenWrapper>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <WeekCalendar
            days={days}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
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
