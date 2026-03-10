import { Images } from "@/assets";
import CustomButton from "@/constants/custom-button";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import ResetPresetTimer from "./reset-preset-timer";
type Props = {
  onStartTimer: (seconds: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  isTimerActive: boolean;
  isTimerRunning: boolean;
};
const TIMER_OPTIONS = ["45s", "1:00", "1:30", "2:00", "2:30"];

const TimerBottomSheet = forwardRef<BottomSheetModal, Props>(
  (
    {
      onStartTimer,
      onPauseTimer,
      onResumeTimer,
      isTimerActive,
      isTimerRunning,
    },
    ref,
  ) => {
    const { colors } = useTheme();

    const snapPoints = useMemo(() => ["50%", "90%"], []);
    const [checkedValues, setCheckedValues] = useState<boolean[]>([
      false,
      false,
    ]);
    const [minutes, setMinutes] = useState<string>("1");
    const [seconds, setSeconds] = useState<string>("00");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const selectedTimer = `${minutes}:${seconds}`;
    const [lastSelectedTimer, setLastSelectedTimer] = useState<string>("");
    const hasTimerChanged = selectedTimer !== lastSelectedTimer;
    const minutesRef = useRef<TextInput>(null);
    const secondsRef = useRef<TextInput>(null);
    const formatMinutes = (text: string) => {
      const cleaned = text.replace(/\D/g, "");
      const num = parseInt(cleaned) || 0;
      return num > 60 ? "60" : cleaned.slice(0, 2);
    };

    const formatSeconds = (text: string) => {
      if (text === "") return "";
      const cleaned = text.replace(/\D/g, "");
      const num = parseInt(cleaned) || 0;
      return num > 59 ? "59" : cleaned.slice(0, 2);
    };

    const handleSecondsBlur = () => {
      if (seconds === "" || !seconds) {
        setSeconds("00");
      } else if (seconds.length === 1) {
        setSeconds(seconds.padStart(2, "0"));
      }
      setIsEditing(false);
    };

    const toggleItem = (index: number) => {
      setCheckedValues((prev) =>
        prev.map((item, i) => (i === index ? !item : item)),
      );
    };

    const handleTimerSelect = (timer: string) => {
      if (timer.includes("s")) {
        const sec = timer.replace("s", "");
        setMinutes("0");
        setSeconds(sec.padStart(2, "0"));
      } else {
        const [min, sec] = timer.split(":");
        setMinutes(min);
        setSeconds(sec || "00");
      }
      setIsEditing(false);
    };
    const handleStart = () => {
      const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
      setLastSelectedTimer(selectedTimer);
      onStartTimer(totalSeconds);
    };
    const styles = StyleSheet.create({
      contentContainer: {
        flex: 1,
        backgroundColor: colors.background,
        padding: scale(20),
        marginBottom: scale(12),
      },
      restTime: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.textSecondary,
        textAlign: "center",
        textTransform: "uppercase",
      },
      timerContainer: {
        alignItems: "center",
        marginVertical: scale(10),
      },
      timer: {
        fontSize: Typography.fontSize["2xl"],
        fontWeight: Typography.fontWeight.bold,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.text,
        textAlign: "center",
      },
      timerInput: {
        fontSize: Typography.fontSize["2xl"],
        fontWeight: Typography.fontWeight.bold,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.text,
        textAlign: "center",
      },
      timerText: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.textSecondary,
        marginTop: scale(20),
        marginBottom: scale(12),
        textTransform: "uppercase",
      },
      timerOptionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: scale(8),
        marginBottom: scale(24),
      },
      chip: {
        paddingHorizontal: scale(15),
        paddingVertical: scale(8),
        borderRadius: scale(24),
        borderWidth: scale(1),
        borderColor: colors.primary,
        backgroundColor: colors.lightBlue,
      },
      chipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
      chipText: {
        fontSize: Typography.fontSize.base,
        fontWeight: "500",
        color: colors.text,
      },
      chipTextSelected: {
        color: colors.text,
      },
    });

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.text }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              if (!isEditing) return;
              setIsEditing(false);
              Keyboard.dismiss();
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.restTime}>REST TIME</Text>

              <View style={styles.timerContainer}>
                {isEditing ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => minutesRef.current?.focus()}
                      // style={{
                      //   width: scale(80),
                      //   alignItems: "center",
                      // }}
                    >
                      <TextInput
                        ref={minutesRef}
                        style={[styles.timerInput]}
                        value={minutes}
                        onChangeText={(text) => setMinutes(formatMinutes(text))}
                        onFocus={() => {
                          if (minutes === "") setMinutes("00");
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                        autoFocus
                      />
                    </TouchableOpacity>
                    <Text style={styles.timer}>:</Text>
                    <TouchableOpacity
                      onPress={() => secondsRef.current?.focus()}
                      // style={{ width: scale(100), alignItems: "center" }}
                    >
                      <TextInput
                        ref={secondsRef}
                        style={[styles.timerInput]}
                        value={seconds}
                        onChangeText={(text) => setSeconds(formatSeconds(text))}
                        onFocus={() => {
                          if (seconds === "") setSeconds("00");
                        }}
                        onBlur={handleSecondsBlur}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.timer}>{selectedTimer}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.timerText}>TIMER OPTIONS</Text>

              <View style={styles.timerOptionsContainer}>
                {TIMER_OPTIONS.map((timer) => {
                  const isSelected = selectedTimer === timer;
                  return (
                    <TouchableOpacity
                      key={timer}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleTimerSelect(timer)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {timer}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ResetPresetTimer
                title="RESET PRESETS"
                checkedValues={checkedValues}
                onToggle={toggleItem}
                items={[
                  { label: "Auto start rest", icon: Images.play },
                  { label: "Sound notification", icon: Images.sound },
                ]}
              />
              <View style={{ marginTop: scale(15) }}>
                {isTimerActive && !hasTimerChanged ? (
                  <ActionButtonsRow
                    primaryTitle={isTimerRunning ? "STOP" : "RESUME"}
                    secondaryTitle="RESET"
                    onPrimaryPress={() => {
                      if (isTimerRunning) {
                        onPauseTimer();
                      } else {
                        onResumeTimer();
                      }
                    }}
                    onSecondaryPress={() => {
                      const totalSeconds =
                        parseInt(minutes) * 60 + parseInt(seconds);
                      onStartTimer(totalSeconds);
                    }}
                  />
                ) : (
                  <CustomButton title="START" onPress={handleStart} />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default TimerBottomSheet;
