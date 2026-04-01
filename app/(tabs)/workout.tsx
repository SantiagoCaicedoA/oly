import CoachNote from "@/components/coach-note";
import TodaysTraining from "@/components/todays-training";
import VolumeIntensity from "@/components/volume-intensity";
import WeekCalendar from "@/components/week-calendar";
import CustomButton from "@/constants/custom-button";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import { useLazyGetAiTrainingQuery } from "@/store/api";
import {
  Days,
  Exercise,
  setSelectedExercise,
  setTrainingData,
} from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

/* Enable LayoutAnimation on Android */
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

/* ── Constants ──────────────────────────────────────── */

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function Workout() {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [phaseExpanded, setPhaseExpanded] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const days = useSelector((state: RootState) => state.training.days);
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  const [fetchTraining, { data, isLoading, isError, error }] =
    useLazyGetAiTrainingQuery();

  useEffect(() => {
    if (token) {
      fetchTraining(undefined, false);
    }
  }, [token]);

  useEffect(() => {
    if (data) dispatch(setTrainingData(JSON.parse(JSON.stringify(data))));
  }, [data]);

  const dayKey = DAY_KEYS[selectedDate.getDay()] as keyof Days;
  const todayData = days?.[dayKey];
  const todaysTraining = todayData?.exercises ?? [];
  const isRestDay = todayData?.type === "rest";

  const coachNoteToShow = isRestDay
    ? "Today is your recovery day. You've had two solid sessions so far — let your body absorb the work. Come back tomorrow ready to move."
    : (todayData?.coach_note ?? "");

  const keyCuesToShow = isRestDay
    ? [
        "Prioritize sleep tonight",
        "Light mobility if anything feels tight",
        "Don't skip meals — your body is rebuilding",
      ]
    : (todayData?.key_cues ?? []);

  const handlePressItem = async (item: Exercise) => {
    dispatch(
      setSelectedExercise({
        name: item.exercise_name,
        dayKey,
        exercises: JSON.parse(JSON.stringify(todaysTraining)),
      }),
    );

    // TODO: Restore AsyncStorage gate after testing
    // const today = new Date().toDateString();
    // const key = `daily_check_in_done_${userId}_${today}`;
    // const done = await AsyncStorage.getItem(key);
    // if (done) {
    //   router.push("/athlete/training-exercise");
    // } else {
    //   await AsyncStorage.setItem(key, "true");
    //   router.push("/athlete/daily-check-in");
    // }

    // TEMP: Always show check-in for testing
    router.push("/athlete/daily-check-in");
  };

  /* ── Format selected date ── */
  const weekday = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const formattedDate = `${weekday}, ${monthDay}`;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={olyPalette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !days) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>No Training Plan Found</Text>
          <Text style={styles.errorSubtitle}>
            We're generating your training plan. Please try again shortly.
          </Text>
          <CustomButton
            title="Retry"
            onPress={() => fetchTraining(undefined, false)}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Header + Week Strip ── */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Today's Workout</Text>
              <Text style={styles.headerDate}>{formattedDate}</Text>
            </View>
            <TouchableOpacity
              hitSlop={olySpacing[8]}
              activeOpacity={0.6}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={olyColors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Week calendar strip */}
          <WeekCalendar
            days={days}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </View>

        {/* ── Section 2: Phase Badge ── */}
        {/* TODO: Wire to real phase data from backend */}
        {/* ── Phase Badge (expandable) ── */}
        <View style={styles.phaseSection}>
          <TouchableOpacity
            style={styles.phaseBadgeRow}
            activeOpacity={0.7}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.create(250, "easeInEaseOut", "opacity")
              );
              setPhaseExpanded(!phaseExpanded);
            }}
          >
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>ACCUMULATION</Text>
            </View>
            <Text style={styles.phaseWeek}>WEEK 3 OF 4</Text>
            <Ionicons
              name={phaseExpanded ? "chevron-up" : "chevron-down"}
              size={14}
              color={olyColors.text.secondary}
            />
          </TouchableOpacity>

          {phaseExpanded && (
            <Text style={styles.phaseDetailText}>
              Building volume — higher reps, moderate weight. This phase develops your work capacity and reinforces movement patterns before intensity increases.
            </Text>
          )}
        </View>

        {/* ── Section 3: Coach Card ── */}
        <CoachNote coach_note={coachNoteToShow} key_cues={keyCuesToShow} />

        {/* ── Section 4: Exercise Groups ── */}
        {todayData?.type === "training" && todaysTraining.length > 0 && (
          <TodaysTraining
            trainings={todaysTraining}
            onPressItem={handlePressItem}
          />
        )}

        {/* ── Section 5: Start Workout CTA ── */}
        {todayData?.type === "training" && todaysTraining.length > 0 && (
          <CustomButton
            title="Start Workout"
            onPress={() => {
              if (todaysTraining.length > 0) {
                handlePressItem(todaysTraining[0]);
              }
            }}
            style={styles.startButton}
          />
        )}
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
  scrollContent: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: 120,
    gap: olySpacing[16],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olySpacing[24],
  },

  /* Section 1: Header */
  headerSection: {
    gap: olySpacing[16],
    paddingTop: olySpacing[8],
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
  },
  headerDate: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  /* Section 2: Phase Badge */
  phaseSection: {
    gap: olyLayout.sectionHeaderGap,
  },
  phaseBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
  },
  phaseDetailText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
  },
  phaseBadge: {
    borderWidth: 1,
    borderColor: olyColors.border.default,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
  },
  phaseBadgeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  phaseWeek: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Start Workout CTA */
  startButton: {
    marginTop: olySpacing[8],
  },

  /* Error / Loading states */
  errorTitle: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
    textAlign: "center",
  },
  errorSubtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    width: "70%",
  },
});
