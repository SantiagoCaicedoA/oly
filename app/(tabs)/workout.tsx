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
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

/* Enable LayoutAnimation on Android */
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

// What each training phase means — shown when the phase badge is expanded.
const PHASE_DESCRIPTIONS: Record<string, string> = {
  Base: "Building muscle and work capacity — the raw engine. Higher volume, moderate intensity. More size now becomes strength later.",
  Strength: "Turning that muscle into maximal strength. Heavier squats and pulls, lower reps — the lifts climb toward the meet.",
  Peak: "Expressing strength as speed. Intensity climbs, volume drops, and the competition lifts sharpen.",
  Deload: "Planned recovery so you come back stronger. Pull the ego back this week.",
  Taper: "Shedding fatigue so you show up fresh and fast. Keep it crisp — no heroes.",
  "Max-Out": "Time to express it — find out what all the work built. Trust your openers, then hunt.",
  "Base Test": "A checkpoint, not a max — measuring the strength you banked so the next block loads off real numbers.",
};

export default function Workout() {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [phaseExpanded, setPhaseExpanded] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const days = useSelector((state: RootState) => state.training.days);
  const phase = useSelector((state: RootState) => state.training.phase);
  const blockWeek = useSelector((state: RootState) => state.training.blockWeek);
  const weeksTotal = useSelector((state: RootState) => state.training.weeksTotal);
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  const [fetchTraining, { data, isLoading, isError, error }] =
    useLazyGetAiTrainingQuery();

  useEffect(() => {
    if (token) {
      fetchTraining(undefined, false);
    }
  }, [token]);

  useEffect(() => {
    if (data) dispatch(setTrainingData(data));
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

    const key = `daily_check_in_done_${userId}_${dayKey}`;
    const done = await AsyncStorage.getItem(key);

    if (done) {
      router.push({
        pathname: "/athlete/training-exercise",
        params: { dayKey },
      });
    } else {
      router.push({
        pathname: "/athlete/daily-check-in",
        params: { dayKey },
      });
    }
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

        {/* ── Section 2: Phase Badge (real phase/week from backend) ── */}
        {phase ? (
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
              <Text style={styles.phaseBadgeText}>{String(phase).toUpperCase()}</Text>
            </View>
            {blockWeek && weeksTotal ? (
              <Text style={styles.phaseWeek}>WEEK {blockWeek} OF {weeksTotal}</Text>
            ) : null}
            <Ionicons
              name={phaseExpanded ? "chevron-up" : "chevron-down"}
              size={14}
              color={olyColors.text.secondary}
            />
          </TouchableOpacity>

          {phaseExpanded && (
            <Text style={styles.phaseDetailText}>
              {PHASE_DESCRIPTIONS[phase] || "Your current training block."}
            </Text>
          )}
        </View>
        ) : null}

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
