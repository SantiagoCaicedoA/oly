import { Images } from "@/assets";
import ActionSheet from "@/components/action-sheet";
import ExerciseSection from "@/components/exercise-section";
import LiftGraph from "@/components/lift-graph";
import SetDetail from "@/components/set-detail";
import TalkToCoach from "@/components/talk-to-coach";
import TimerBottomSheet from "@/components/timer-bottom-sheet";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { Days, ExerciseSet } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { Typography } from "@/utils/custom-styles";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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
  const [checked, setChecked] = useState(false);
  const days = useSelector((state: RootState) => state.training.days);
  const { exercise } = useLocalSearchParams();
  const exerciseData = exercise ? JSON.parse(exercise as string) : null;
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
  const dayKey = DAY_KEYS[new Date().getDay()] as keyof Days;
  const todayData = days?.[dayKey];
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
    bottomSheetRef.current?.present();
  };
  const handleStartTimer = () => {
    timerSheetRef.current?.present();
  };
  const handleAddSet = () => {
    router.push("/athlete/add-exercise");
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
            <ExerciseSection />
            <LiftGraph liftName={exerciseData?.exercise_name ?? "LIFT"} />
            <TalkToCoach />

            {exerciseData?.sets?.map((set: ExerciseSet) => (
              <SetDetail
                key={set.set_number}
                setNumber={set.set_number}
                reps={set.reps}
                weight={set.weight}
                rpm={set.rpm_percent}
                isChecked={checked}
                onPress={() => handlePressExercise(set)}
              />
            ))}

            <CustomButton title="ADD SET" onPress={handleAddSet} />
          </ScrollView>

          <ActionSheet
            ref={bottomSheetRef}
            set={selectedSet}
            exercise={exerciseData}
            coachPrescription={todayData?.coach_prescription}
            keyCues={todayData?.key_cues_of_specific_lift}
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
          <TouchableOpacity style={styles.footerButtonContainer}>
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
          <TouchableOpacity style={styles.footerButtonContainer}>
            <Image source={Images.arrowforward} style={styles.icon} />
            <Text style={styles.footerText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
