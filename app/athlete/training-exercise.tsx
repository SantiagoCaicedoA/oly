import { Images } from "@/assets";
import ActionSheet from "@/components/action-sheet";
import ExerciseSection from "@/components/exercise-section";
import LiftGraph from "@/components/lift-graph";
import SetDetail from "@/components/set-detail";
import TalkToCoach from "@/components/talk-to-coach";
import TimerBottomSheet from "@/components/timer-bottom-sheet";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useCustomSetMutation } from "@/store/api";
import { Days, ExerciseSet } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { CustomSetPayload } from "@/types/api/dashboard";
import { Typography } from "@/utils/custom-styles";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";

export default function TrainingExercise() {
  const { colors } = useTheme();
  const { showSuccess, showError } = useToast();
  const [checkedSetNumber, setCheckedSetNumber] = useState<number | null>(null);
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

  const DAY_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const todayData = days?.[selectedDayKey as keyof Days];
  const [activeIndex, setActiveIndex] = useState(
    selectedDayExercises?.findIndex(
      (e) => e.exercise_name === selectedExerciseName,
    ) ?? 0,
  );
  const exerciseData = selectedDayExercises?.[activeIndex] ?? null;
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
  const handleBackPress = () => {
    router.back();
  };

  const handlePressExercise = (set: ExerciseSet) => {
    setSelectedSet(set);
    setCheckedSetNumber(set.set_number);
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
      setCheckedSetNumber(null);
    }
  };

  const handlePreviousExercise = () => {
    if (!selectedDayExercises) return;

    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      setCheckedSetNumber(null);
    }
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
    footer: {
      borderTopColor: colors.text,
      borderTopWidth: scale(0.6),
      flexDirection: "row",
      paddingHorizontal: scale(25),
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.headerBackground,
      paddingVertical: scale(20),
    },
    icon: {
      width: scale(30),
      height: scale(20),
      resizeMode: "contain",
    },
    timerContainer: {
      borderColor: colors.text,
      borderWidth: scale(0.5),
      borderRadius: scale(15),
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-evenly",
      paddingVertical: scale(12),
      paddingHorizontal: scale(15),
      gap: scale(12),
    },
    divider: {
      height: scale(15),

      borderColor: colors.text,
      borderWidth: scale(0.3),
    },
    footerText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.light,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    footerButtonContainer: {
      gap: scale(15),
      alignItems: "center",
      justifyContent: "center",
    },
    startText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    loaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Image
                source={Images.arrowBack}
                style={{ width: "100%", height: "100%" }}
              />
            </TouchableOpacity>

            <Text style={styles.headerText}>
              {exerciseData?.exercise_name ?? "LIFT"}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ExerciseSection
              count={selectedDayExercises?.length ?? 0}
              activeIndex={activeIndex}
              onTabChange={(index) => {
                setActiveIndex(index);
                setCheckedSetNumber(null);
              }}
            />
            <LiftGraph liftName={exerciseData?.exercise_name ?? "LIFT"} />
            <TalkToCoach coach_note={exerciseData?.coach_note} />

            {exerciseData?.sets?.map((set: ExerciseSet) => (
              <SetDetail
                key={set.set_number}
                setNumber={set.set_number}
                reps={set.reps}
                weight={set.weight}
                rpm={set.rpm_percent}
                isChecked={checkedSetNumber === set.set_number}
                onPress={() => handlePressExercise(set)}
              />
            ))}

            <CustomButton
              title={isLoading ? "ADDING" : "ADD SET"}
              onPress={handleAddSet}
            />
          </ScrollView>

          <ActionSheet
            ref={bottomSheetRef}
            set={selectedSet}
            exercise={exerciseData}
            coachPrescription={todayData?.coach_prescription}
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
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerButtonContainer}
            onPress={handlePreviousExercise}
          >
            <Image source={Images.arrowBack} style={styles.icon} />
            <Text style={styles.footerText}>BACK</Text>
          </TouchableOpacity>
          <View style={styles.timerContainer}>
            <Image
              source={
                isTimerRunning
                  ? Images.starttimmer
                  : timeRemaining > 0
                    ? Images.pause
                    : Images.alarmicon
              }
              style={styles.icon}
            />

            <Text style={styles.startText}>
              {isTimerRunning || timeRemaining > 0
                ? formatTime(timeRemaining)
                : "START"}
            </Text>
            <View style={styles.divider}></View>
            <TouchableOpacity onPress={handleStartTimer}>
              <Image source={Images.arrowup} style={styles.icon} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.footerButtonContainer}
            onPress={handleNextExercise}
          >
            <Image
              source={Images.arrowforward}
              style={styles.icon}
              tintColor={colors.text}
            />
            <Text style={styles.footerText}>NEXT</Text>
          </TouchableOpacity>
        </View>
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
