/**
 * Daily Check-In — Redesigned v2.2
 *
 * Visual redesign using Oly Design System tokens.
 * API mutation & navigation flow unchanged.
 *
 * v2.2: Readiness chips match lift-analysis pill pattern.
 *
 * Sections: Header, Greeting, Sleep, Readiness, Soreness,
 *           Bodyweight, Notes, Submit
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import {
  olyTypography,
  olyFonts,
  olyLetterSpacing,
} from "@/src/oly-theme/oly-typography";
import {
  olyColors,
  olyPalette,
  olyGradient,
} from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useDailyCheckInMutation } from "@/store/api";
import { Days } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { DailyCheckInPayload } from "@/types/api/dashboard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

/* ── Constants ─────────────────────────────────────────── */

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const READINESS_OPTIONS = [
  { label: "Fatigued", value: 2 },
  { label: "Low", value: 4 },
  { label: "Normal", value: 6 },
  { label: "Good", value: 8 },
  { label: "Great", value: 10 },
] as const;

const SORENESS_LEVELS = [
  { label: "NONE", value: 0, color: olyColors.pain.none },
  { label: "MILD", value: 1, color: olyColors.pain.minor },
  { label: "MODERATE", value: 2, color: olyColors.pain.moderate },
  { label: "SEVERE", value: 3, color: olyColors.pain.sharp },
] as const;

const SORENESS_AREAS = [
  "KNEES",
  "LOWER BACK",
  "SHOULDERS",
  "WRISTS",
] as const;

const SLEEP_MIN = 4;
const SLEEP_MAX = 10;
const SLEEP_STEP = 0.5;

/* ── Helpers ───────────────────────────────────────────── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

/** Map readiness value (2-10) to motivation string for API */
function readinessToMotivation(value: number): string {
  if (value <= 4) return "Low";
  if (value <= 6) return "Neutral";
  return "High";
}

/** Normalize sleep hours (4-10) to 0-10 quality scale */
function sleepHoursToQuality(hours: number): number {
  return Math.round(((hours - SLEEP_MIN) / (SLEEP_MAX - SLEEP_MIN)) * 10);
}

/* ── Sleep Slider Component ────────────────────────────── */

interface SleepSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const SleepSlider: React.FC<SleepSliderProps> = ({ value, onChange }) => {
  const [barWidth, setBarWidth] = useState(0);
  const barPageX = useRef(0);
  const barWidthRef = useRef(0);

  const calculateValue = (pageX: number): number => {
    const locationX = pageX - barPageX.current;
    const percentage = Math.max(
      0,
      Math.min(1, locationX / barWidthRef.current)
    );
    const rawValue = SLEEP_MIN + percentage * (SLEEP_MAX - SLEEP_MIN);
    // Snap to nearest 0.5
    return Math.round(rawValue / SLEEP_STEP) * SLEEP_STEP;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(calculateValue(evt.nativeEvent.pageX));
    },
    onPanResponderMove: (evt) => {
      onChange(calculateValue(evt.nativeEvent.pageX));
    },
    onPanResponderRelease: () => {},
  });

  const onBarLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setBarWidth(width);
    barWidthRef.current = width;
  };

  const fillPercentage =
    ((value - SLEEP_MIN) / (SLEEP_MAX - SLEEP_MIN)) * 100;

  return (
    <View>
      <View
        style={sliderStyles.trackWrapper}
        onLayout={onBarLayout}
        ref={(ref) => {
          if (ref) {
            ref.measure((_x, _y, _w, _h, pageX) => {
              barPageX.current = pageX;
            });
          }
        }}
        {...panResponder.panHandlers}
      >
        {/* Track background */}
        <View style={sliderStyles.trackBg}>
          {/* Fill */}
          <View
            style={[
              sliderStyles.trackFill,
              { width: `${fillPercentage}%` },
            ]}
          />
        </View>

        {/* Thumb */}
        <View
          style={[
            sliderStyles.thumb,
            { left: `${fillPercentage}%` },
          ]}
        />
      </View>

      {/* Range labels */}
      <View style={sliderStyles.rangeLabels}>
        <Text style={sliderStyles.rangeText}>{SLEEP_MIN} hrs</Text>
        <Text style={sliderStyles.rangeText}>{SLEEP_MAX} hrs</Text>
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  trackWrapper: {
    height: 32,
    justifyContent: "center",
    position: "relative",
  },
  trackBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: `rgba(226, 232, 240, 0.08)`,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: olyPalette.primary,
  },
  thumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: olyPalette.primary,
    top: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: olySpacing[4],
  },
  rangeText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
});

/* ── Soreness Track Component ──────────────────────────── */

interface SorenessTrackProps {
  area: string;
  level: number;
  onChange: (level: number) => void;
}

const SorenessTrack: React.FC<SorenessTrackProps> = ({
  area,
  level,
  onChange,
}) => {
  const currentLevel = SORENESS_LEVELS[level] ?? SORENESS_LEVELS[0];

  return (
    <View style={sorenessStyles.row}>
      {/* Header: area name + level label */}
      <View style={sorenessStyles.rowHeader}>
        <Text style={sorenessStyles.areaLabel}>{area}</Text>
        <Text
          style={[
            sorenessStyles.levelLabel,
            { color: currentLevel.color },
          ]}
        >
          {currentLevel.label}
        </Text>
      </View>

      {/* Discrete dots track */}
      <View style={sorenessStyles.track}>
        {SORENESS_LEVELS.map((sl, index) => {
          const isActive = index <= level;
          const isCurrent = index === level;
          return (
            <TouchableOpacity
              key={sl.label}
              style={sorenessStyles.dotTouchArea}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(index);
              }}
              activeOpacity={0.7}
            >
              {/* Connector line (skip for first dot) */}
              {index > 0 && (
                <View
                  style={[
                    sorenessStyles.connector,
                    {
                      backgroundColor: index <= level
                        ? currentLevel.color
                        : olyColors.border.default,
                    },
                  ]}
                />
              )}
              {/* Dot */}
              <View
                style={[
                  sorenessStyles.dot,
                  isActive && {
                    backgroundColor: currentLevel.color,
                    borderColor: currentLevel.color,
                  },
                  isCurrent && sorenessStyles.dotCurrent,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const sorenessStyles = StyleSheet.create({
  row: {
    paddingVertical: olySpacing[16],
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: olySpacing[12],
  },
  areaLabel: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  levelLabel: {
    ...olyTypography.label,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
    height: 20,
  },
  dotTouchArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: olyLayout.minTouchTarget,
    justifyContent: "center",
  },
  connector: {
    flex: 1,
    height: 2,
    marginRight: -2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: olyColors.border.default,
  },
  dotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

/* ── Main Screen ───────────────────────────────────────── */

export default function DailyCheckIn() {
  // ── Redux state ──
  const user = useSelector((state: RootState) => state.auth.user);
  const days = useSelector((state: RootState) => state.training.days);

  const dayKey = DAY_KEYS[new Date().getDay()] as keyof Days;
  const todayData = days?.[dayKey];
  const dailyCheckIn = todayData?.daily_check_in;
  const todayKey = DAY_KEYS[new Date().getDay()];

  // ── Local state ──
  const [sleepHours, setSleepHours] = useState(
    dailyCheckIn?.sleep_quality
      ? SLEEP_MIN + (dailyCheckIn.sleep_quality / 10) * (SLEEP_MAX - SLEEP_MIN)
      : 7.5
  );
  const [readiness, setReadiness] = useState(
    dailyCheckIn?.mental_readiness ?? 6
  );
  const [sorenessLevels, setSorenessLevels] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      SORENESS_AREAS.forEach((area) => {
        initial[area] = 0;
      });
      // Restore from existing check-in if available
      if (dailyCheckIn?.sore_areas) {
        dailyCheckIn.sore_areas.forEach((area) => {
          const key = area.toUpperCase();
          if (key in initial) {
            initial[key] = Math.min(3, Math.max(1, Math.round(dailyCheckIn.intensity / 3)));
          }
        });
      }
      return initial;
    }
  );
  const [bodyweight, setBodyweight] = useState(81.2);
  const [bodyweightDelta] = useState(-0.3);
  const [notes, setNotes] = useState("");

  const [submitCheckIn, { isLoading }] = useDailyCheckInMutation();

  // ── Handlers ──
  const handleBack = () => {
    router.back();
  };

  const handleSorenessChange = (area: string, level: number) => {
    setSorenessLevels((prev) => ({ ...prev, [area]: level }));
  };

  const handleSubmit = async () => {
    // Build sore_areas from areas with level > 0
    const soreAreas = Object.entries(sorenessLevels)
      .filter(([_, level]) => level > 0)
      .map(([area]) => area);

    // Max soreness intensity across all areas (scale 0-3 → 0-10)
    const maxSoreness = Math.max(0, ...Object.values(sorenessLevels));
    const muscleSorenessScale = Math.round((maxSoreness / 3) * 10);
    const intensityScale = Math.round((maxSoreness / 3) * 10);

    const payload: DailyCheckInPayload = {
      day: todayKey,
      daily_check_in: {
        sleep_quality: sleepHoursToQuality(sleepHours),
        stress_level: 10 - readiness, // inverse: high readiness = low stress
        mental_readiness: readiness,
        motivation: readinessToMotivation(readiness),
        muscle_soreness: muscleSorenessScale,
        sore_areas: soreAreas,
        intensity: intensityScale,
      },
    };

    try {
      await submitCheckIn(payload).unwrap();
      router.push("athlete/training-exercise");
    } catch (error) {
      console.error("Daily check-in error:", error);
    }
  };

  // ── Derived ──
  const athleteName = user?.name ? getFirstName(user.name) : "Athlete";

  return (
    <LinearGradient
      colors={olyGradient.colors as unknown as string[]}
      locations={olyGradient.locations as unknown as number[]}
      start={olyGradient.start}
      end={olyGradient.end}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.headerBackTouch}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={olyColors.text.primary}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>DAILY CHECK-IN</Text>

          <Text style={styles.headerDate}>{getFormattedDate()}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Greeting ── */}
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingTitle}>
              {getGreeting()}, {athleteName}.
            </Text>
            <Text style={styles.greetingSubtitle}>
              Let's see how you're feeling before today's session.
            </Text>
          </View>

          {/* ── Sleep ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>SLEEP</Text>
            <View style={styles.card}>
              {/* Big number row */}
              <View style={styles.sleepNumberRow}>
                <Text style={styles.sleepNumber}>
                  {sleepHours.toFixed(1)}
                </Text>
                <Text style={styles.sleepUnit}>hrs</Text>
              </View>

              <View style={{ marginTop: olySpacing[16] }}>
                <SleepSlider value={sleepHours} onChange={setSleepHours} />
              </View>
            </View>
          </View>

          {/* ── Readiness ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>HOW READY DO YOU FEEL?</Text>
            <View style={styles.chipsRow}>
              {READINESS_OPTIONS.map((option) => {
                const isActive = readiness === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light
                      );
                      setReadiness(option.value);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Soreness ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>SORENESS</Text>
            <View style={styles.card}>
              {SORENESS_AREAS.map((area, index) => (
                <React.Fragment key={area}>
                  {index > 0 && <View style={styles.divider} />}
                  <SorenessTrack
                    area={area}
                    level={sorenessLevels[area] ?? 0}
                    onChange={(level) => handleSorenessChange(area, level)}
                  />
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* ── Bodyweight ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>BODYWEIGHT</Text>
            <View style={styles.card}>
              <View style={styles.bodyweightRow}>
                <View style={styles.bodyweightNumberRow}>
                  <Text style={styles.bodyweightNumber}>
                    {bodyweight.toFixed(1)}
                  </Text>
                  <Text style={styles.bodyweightUnit}>kg</Text>
                </View>
                <View style={styles.deltaPill}>
                  <Text style={styles.deltaText}>
                    {bodyweightDelta >= 0 ? "+" : ""}
                    {bodyweightDelta.toFixed(1)} kg
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Notes ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>ANYTHING ELSE?</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.notesInput}
                placeholder="How's stress, nutrition, travel, mindset..."
                placeholderTextColor={olyColors.text.disabled}
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Submit ── */}
          <View style={styles.submitBlock}>
            <OlyButton
              label="SUBMIT CHECK-IN"
              onPress={handleSubmit}
              variant="primary"
              fullWidth
              loading={isLoading}
            />
          </View>
        </ScrollView>

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator
              size="large"
              color={olyPalette.primary}
            />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: olyLayout.navBarHeight,
    paddingHorizontal: olyLayout.screenPadding,
  },
  headerBackTouch: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  headerDate: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    minWidth: olyLayout.minTouchTarget,
    textAlign: "right",
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[40],
    gap: olySpacing[32],
  },

  // ── Greeting ──
  greetingBlock: {
    gap: olySpacing[4],
    marginBottom: -olySpacing[8],
  },
  greetingTitle: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  greetingSubtitle: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  // ── Section pattern ──
  sectionBlock: {
    gap: olySpacing[8],
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
  },

  // ── Card — borderless, bg separation only ──
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
  },

  // ── Sleep ──
  sleepNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[4],
  },
  sleepNumber: {
    ...olyTypography.display,
    fontSize: 40,
    lineHeight: 48,
    color: olyColors.text.primary,
  },
  sleepUnit: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },

  // ── Readiness chips (matches lift-analysis pattern) ──
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  chip: {
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[8],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    backgroundColor: olyColors.bg.activeHighlight,
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

  // ── Divider ──
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: olyColors.border.default,
  },

  // ── Bodyweight ──
  bodyweightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bodyweightNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[8],
  },
  bodyweightNumber: {
    ...olyTypography.display,
    color: olyColors.text.primary,
  },
  bodyweightUnit: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },
  deltaPill: {
    backgroundColor: olyPalette.cardElevated,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
  },
  deltaText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  // ── Notes ──
  notesInput: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    minHeight: 72,
    padding: 0,
  },

  // ── Submit ──
  submitBlock: {
    marginTop: olySpacing[8],
  },

  // ── Loader ──
  loaderOverlay: {
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
