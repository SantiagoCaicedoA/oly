import { Images } from "@/assets";
import CustomButton from "@/constants/custom-button";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
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
    const snapPoints = useMemo(() => ["65%", "90%"], []);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: olyPalette.card }}
        handleIndicatorStyle={{ backgroundColor: olyColors.text.disabled }}
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
              <Text style={styles.sectionLabel}>REST TIME</Text>

              <View style={styles.timerContainer}>
                {isEditing ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => minutesRef.current?.focus()}
                    >
                      <TextInput
                        ref={minutesRef}
                        style={styles.timerInput}
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
                    <Text style={styles.timerDisplay}>:</Text>
                    <TouchableOpacity
                      onPress={() => secondsRef.current?.focus()}
                    >
                      <TextInput
                        ref={secondsRef}
                        style={styles.timerInput}
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
                    <Text style={styles.timerDisplay}>{selectedTimer}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.chipsRow}>
                {TIMER_OPTIONS.map((timer) => {
                  const isSelected = selectedTimer === timer;
                  return (
                    <TouchableOpacity
                      key={timer}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => handleTimerSelect(timer)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {timer}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ marginTop: olySpacing[24] }}>
                <ResetPresetTimer
                  title="SETTINGS"
                  checkedValues={checkedValues}
                  onToggle={toggleItem}
                  items={[
                    { label: "Auto start rest", icon: Images.play },
                    { label: "Sound notification", icon: Images.sound },
                  ]}
                />
              </View>

              <View style={{ marginTop: olySpacing[24] }}>
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

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[16],
    paddingBottom: olySpacing[40],
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
    textAlign: "center",
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: olySpacing[16],
  },
  timerDisplay: {
    ...olyTypography.display,
    fontSize: 56,
    lineHeight: 64,
    color: olyColors.text.primary,
    textAlign: "center",
  },
  timerInput: {
    ...olyTypography.display,
    fontSize: 56,
    lineHeight: 64,
    color: olyColors.text.primary,
    textAlign: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: olySpacing[8],
  },
  chip: {
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[8],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    backgroundColor: olyColors.bg.activeHighlight,
    minWidth: olyLayout.minTouchTarget,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: olyColors.bg.cardSelected,
    borderColor: olyColors.border.brand,
  },
  chipText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  chipTextActive: {
    color: olyColors.text.primary,
  },
});

export default TimerBottomSheet;
