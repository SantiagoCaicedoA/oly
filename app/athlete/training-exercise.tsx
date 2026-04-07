import ActionSheet from "@/components/action-sheet";
import ExerciseSection from "@/components/exercise-section";
import LiftGraph from "@/components/lift-graph";
import SetDetail from "@/components/set-detail";
import TalkToCoach from "@/components/talk-to-coach";
import TimerBottomSheet from "@/components/timer-bottom-sheet";
import CustomButton from "@/constants/custom-button";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useToast } from "@/context/toast-context";
import { useCustomSetMutation } from "@/store/api";
import { Days, ExerciseSet, setVideoForSet } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { CustomSetPayload } from "@/types/api/dashboard";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function TrainingExercise() {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();
  const [checkedSetNumbers, setCheckedSetNumbers] = useState<Set<number>>(
    new Set(),
  );
  const days = useSelector((state: RootState) => state.training.days);
  const selectedExerciseName = useSelector(
    (state: RootState) => state.training.selectedExerciseName,
  );
  const selectedDayKey = useSelector(
    (state: RootState) => state.training.selectedDayKey,
  );
  const selectedDayExercises = useSelector(
    (state: RootState) => state.training.selectedDayExercises,
  );

  const [customSet, { isLoading }] = useCustomSetMutation();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const timerSheetRef = useRef<BottomSheetModal>(null);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedSet, setSelectedSet] = useState<ExerciseSet | null>(null);
  const [savedSetNumber, setSavedSetNumber] = useState<number | null>(null);

  const todayData = days?.[selectedDayKey as keyof Days];
  const [activeIndex, setActiveIndex] = useState(
    selectedDayExercises?.findIndex(
      (e) => e.exercise_name === selectedExerciseName,
    ) ?? 0,
  );
  const exerciseData = selectedDayExercises?.[activeIndex] ?? null;

  const videosMap: Record<number, string> = {};
  if (exerciseData?.sets) {
    for (const s of exerciseData.sets) {
      if (s.video_uri) {
        videosMap[s.set_number] = s.video_uri;
      }
    }
  }

  useEffect(() => {
    if (!selectedSet || !exerciseData) return;
    const updatedSet = exerciseData.sets?.find(
      (s) => s.set_number === selectedSet.set_number,
    );
    if (updatedSet) {
      setSelectedSet({ ...updatedSet });
    }
  }, [exerciseData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBackPress = () => router.back();

  const handlePressExercise = (set: ExerciseSet) => {
    setSelectedSet(set);
    bottomSheetRef.current?.present();
  };

  const handleStartTimer = () => {
    timerSheetRef.current?.present();
  };

  const handleAddSet = async () => {
    try {
      if (!selectedDayKey || !exerciseData) return;
      const payload: CustomSetPayload = {
        day: selectedDayKey,
        exercise_index: activeIndex,
      };
      await customSet(payload).unwrap();
      showSuccess("Set Added Successfully", "");
    } catch (e) {
      showError("Failed To Add Set", "Error");
      console.log("error", e);
    }
  };

  const handleNextExercise = () => {
    if (!selectedDayExercises) return;
    if (activeIndex < selectedDayExercises.length - 1) {
      setActiveIndex((prev) => prev + 1);
      setCheckedSetNumbers(new Set());
    }
  };

  const handlePreviousExercise = () => {
    if (!selectedDayExercises) return;
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      setCheckedSetNumbers(new Set());
    }
  };

  /* ── Progress percentage ── */
  const completedSets = exerciseData?.sets?.filter((s) => s.isComplete).length ?? 0;
  const totalSets = exerciseData?.sets?.length ?? 1;
  const progressPercent = Math.round((completedSets / totalSets) * 100);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          {/* ── Header — back nav ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackPress}
              hitSlop={olySpacing[8]}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={olyColors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* ── Mini Timer Strip (visible when timer is active) ── */}
          {isTimerActive && (
            <TouchableOpacity
              style={styles.miniTimerStrip}
              onPress={handleStartTimer}
              activeOpacity={0.8}
            >
              <View style={styles.miniTimerContent}>
                <Text style={styles.miniTimerLabel}>REST</Text>
                <Text style={styles.miniTimerTime}>{formatTime(timeRemaining)}</Text>
              </View>
              {/* Thin progress line at bottom */}
              <View style={styles.miniTimerTrack}>
                <View
                  style={[
                    styles.miniTimerFill,
                    {
                      width: timerDuration > 0
                        ? `${(timeRemaining / timerDuration) * 100}%`
                        : "0%",
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          )}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Exercise Title + Icons ── */}
            <View style={styles.titleSection}>
              <View style={styles.titleRow}>
                <Text style={styles.exerciseTitle}>
                  {exerciseData?.exercise_name ?? "Lift"}
                </Text>
                <View style={styles.titleIcons}>
                  {!isTimerActive && (
                    <TouchableOpacity hitSlop={olySpacing[8]} onPress={handleStartTimer}>
                      <Ionicons
                        name="time-outline"
                        size={22}
                        color={olyColors.text.secondary}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity hitSlop={olySpacing[8]}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={22}
                      color={olyColors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.detailPillsRow}>
                <View style={styles.detailPill}>
                  <Text style={styles.detailPillText}>
                    Set {completedSets} of {totalSets}
                  </Text>
                </View>
                {exerciseData?.rpm_percent ? (
                  <View style={styles.detailPill}>
                    <Text style={styles.detailPillText}>
                      {exerciseData.rpm_percent}%
                    </Text>
                  </View>
                ) : null}
                {exerciseData?.time ? (
                  <View style={styles.detailPill}>
                    <Text style={styles.detailPillText}>
                      {exerciseData.time} rest
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* ── Segment Tabs ── */}
            <ExerciseSection
              count={selectedDayExercises?.length ?? 0}
              activeIndex={activeIndex}
              onTabChange={(index) => {
                setActiveIndex(index);
                setCheckedSetNumbers(new Set());
              }}
            />

            {/* ── Coach Card ── */}
            <TalkToCoach
              coach_note={exerciseData?.coach_note}
              key_cues={exerciseData?.key_cues_of_specific_lift}
            />

            {/* ── Lift Graph ── */}
            <LiftGraph liftName={exerciseData?.exercise_name ?? "Lift"} />

            {/* ── Working Sets Section ── */}
            <View style={styles.setsSection}>
              <Text style={styles.sectionLabel}>WORKING SETS</Text>
              {exerciseData?.sets?.map((set: ExerciseSet) => (
                <SetDetail
                  key={set.set_number}
                  setNumber={set.set_number}
                  reps={set.reps}
                  weight={set.weight}
                  rpm={set.rpm_percent}
                  isComplete={set.isComplete ?? false}
                  isMiss={set.was_it_a_miss ?? false}
                  hasVideo={!!videosMap[set.set_number]}
                  isJustSaved={savedSetNumber === set.set_number}
                  onPress={() => handlePressExercise(set)}
                />
              ))}
            </View>

            {/* ── Exercise Notes ── */}
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>EXERCISE NOTES</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add a note (optional)"
                placeholderTextColor={olyColors.text.disabled}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* ── Actions ── */}
            <View style={styles.actionsGroup}>
              <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet} activeOpacity={0.7}>
                <Text style={styles.addSetText}>
                  {isLoading ? "ADDING..." : "+ ADD SET"}
                </Text>
              </TouchableOpacity>
              <CustomButton
                title="Post Lift"
                onPress={() => {
                  const setsWithVideo = Object.entries(videosMap).map(
                    ([setNum, uri]) => {
                      const setData = exerciseData?.sets?.find(
                        (s) => s.set_number === Number(setNum),
                      );
                      return {
                        setNumber: Number(setNum),
                        videoUri: uri,
                        weight: setData?.weight ?? 0,
                        rpmPercent: setData?.rpm_percent ?? 0,
                        barSpeed: setData?.bar_speed ?? "",
                        positionQuality: setData?.position_quality ?? "",
                      };
                    },
                  );
                  const topSet = exerciseData?.sets?.reduce(
                    (max, s) => (s.weight > max.weight ? s : max),
                    exerciseData.sets[0],
                  );
                  router.push({
                    pathname: "/athlete/create-new-post",
                    params: {
                      exerciseName: exerciseData?.exercise_name ?? "",
                      weight: String(topSet?.weight ?? 0),
                      totalSets: String(exerciseData?.sets?.length ?? 0),
                      rpmPercent: String(topSet?.rpm_percent ?? 0),
                      barSpeed: topSet?.bar_speed ?? "",
                      positionQuality: topSet?.position_quality ?? "",
                      setsWithVideo: JSON.stringify(setsWithVideo),
                    },
                  });
                }}
              />
            </View>
          </ScrollView>


          <ActionSheet
            ref={bottomSheetRef}
            set={selectedSet}
            exercise={exerciseData}
            coachPrescription={todayData?.coach_prescription}
            videosMap={videosMap}
            onSaved={(setNumber) => {
              setSavedSetNumber(setNumber);
              setTimeout(() => setSavedSetNumber(null), 1200);
            }}
            onVideoChange={(setNumber, uri) => {
              dispatch(
                setVideoForSet({
                  exerciseIndex: activeIndex,
                  setNumber,
                  videoUri: uri,
                }),
              );
            }}
          />
          <TimerBottomSheet
            ref={timerSheetRef}
            isTimerActive={isTimerActive}
            isTimerRunning={isTimerRunning}
            onStartTimer={(seconds: number) => {
              setTimerDuration(seconds);
              setTimeRemaining(seconds);
              setIsTimerRunning(true);
              setIsTimerActive(true);
              timerSheetRef.current?.dismiss();
            }}
            onPauseTimer={() => {
              setIsTimerRunning(false);
              timerSheetRef.current?.dismiss();
            }}
            onResumeTimer={() => {
              setIsTimerRunning(true);
              timerSheetRef.current?.dismiss();
            }}
          />
        </SafeAreaView>

        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={olyPalette.primary} />
          </View>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
    gap: olySpacing[20],
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[8],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
  },
  /* Mini Timer Strip */
  miniTimerStrip: {
    backgroundColor: olyColors.bg.subtleHighlight,
    marginBottom: olySpacing[8],
  },
  miniTimerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[12],
    gap: olySpacing[8],
  },
  miniTimerLabel: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  miniTimerTime: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  miniTimerTrack: {
    height: 2,
    backgroundColor: olyColors.border.default,
  },
  miniTimerFill: {
    height: "100%",
    backgroundColor: olyPalette.primary,
  },

  /* Title Section */
  titleSection: {
    gap: olySpacing[8],
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingTop: olySpacing[4],
  },
  exerciseTitle: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
    flex: 1,
    marginRight: olySpacing[12],
  },
  detailPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  detailPill: {
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
  },
  detailPillText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  /* Sets Section */
  setsSection: {
    gap: olyLayout.sectionHeaderGap,
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Add Set */
  addSetButton: {
    alignItems: "center",
    justifyContent: "center",
    height: olyLayout.inputHeight,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    borderRadius: olyRadius.full,
  },
  addSetText: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Exercise Notes */
  notesSection: {
    gap: olySpacing[8],
  },
  notesLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  notesInput: {
    ...olyTypography.bodySmall,
    color: olyColors.text.primary,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    minHeight: 72,
  },

  /* Actions group */
  actionsGroup: {
    gap: olySpacing[12],
  },


  /* Loader */
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
