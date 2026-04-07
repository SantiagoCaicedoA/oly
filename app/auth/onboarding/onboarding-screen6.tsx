/**
 * Onboarding Screen 6 — Goals (Redesigned v2)
 *
 * Collects competition intent, competition name + date,
 * and current training phase.
 *
 * Abdul's data flow unchanged — dispatches to onboardingSlice.
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import {
  olyTypography,
  olyFonts,
  olyLetterSpacing,
} from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import {
  saveOnboardingData,
  selectOnboardingData,
} from "@/store/reducer/onboardingSlice";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen6Props {
  onBack?: () => void;
  onComplete?: () => void;
  mode?: "onboarding" | "settings";
}

interface OnboardingScreen6Values {
  preparing_for_competition: boolean;
  competition_name: string;
  compDay: string;
  compMonth: string;
  compYear: string;
  training_phase: string;
  weight_class: string;
  target_total: string;
}

/* ── Data ──────────────────────────────────────────────── */

const MONTHS = [
  { value: "1", short: "Jan", long: "January", num: "01" },
  { value: "2", short: "Feb", long: "February", num: "02" },
  { value: "3", short: "Mar", long: "March", num: "03" },
  { value: "4", short: "Apr", long: "April", num: "04" },
  { value: "5", short: "May", long: "May", num: "05" },
  { value: "6", short: "Jun", long: "June", num: "06" },
  { value: "7", short: "Jul", long: "July", num: "07" },
  { value: "8", short: "Aug", long: "August", num: "08" },
  { value: "9", short: "Sep", long: "September", num: "09" },
  { value: "10", short: "Oct", long: "October", num: "10" },
  { value: "11", short: "Nov", long: "November", num: "11" },
  { value: "12", short: "Dec", long: "December", num: "12" },
];

const currentYear = new Date().getFullYear();
// Competition dates: this year + next 3 years
const COMP_YEARS = Array.from({ length: 4 }, (_, i) =>
  String(currentYear + i)
);

function getDaysInMonth(month: string, year: string): number {
  if (!month) return 31;
  const m = parseInt(month, 10);
  const y = year ? parseInt(year, 10) : currentYear;
  return new Date(y, m, 0).getDate();
}

function getMonthShort(value: string): string {
  const m = MONTHS.find((mo) => mo.value === value);
  return m ? m.short : "";
}

const TRAINING_PHASES = [
  {
    value: "starting_fresh",
    title: "Starting Fresh",
    description: "New to structured training or starting over",
  },
  {
    value: "in_training_block",
    title: "In a Training Block",
    description: "Currently following a structured program",
  },
  {
    value: "post_competition",
    title: "Post-Competition",
    description: "Recently competed, transitioning phases",
  },
  {
    value: "deload_recovery",
    title: "Deload / Recovery",
    description: "Taking it easy, managing fatigue",
  },
  {
    value: "coming_back",
    title: "Coming Back from Injury",
    description: "Returning to training after time off",
  },
] as const;

/* ── Wheel picker constants ────────────────────────────── */

const WHEEL_ITEM_HEIGHT = olyLayout.minTouchTarget; // 44 — matches Apple HIG
const WHEEL_VISIBLE_ITEMS = 5;

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen6({
  onBack,
  onComplete,
  mode = "onboarding",
}: OnboardingScreen6Props) {
  const isSettings = mode === "settings";
  const dispatch = useDispatch();
  const onboardingData = useSelector(selectOnboardingData);
  const navigation = useNavigation();
  const getValuesRef = useRef<() => OnboardingScreen6Values>(() => ({} as OnboardingScreen6Values));

  const { control, handleSubmit, watch, setValue, getValues } =
    useForm<OnboardingScreen6Values>({
      defaultValues: {
        preparing_for_competition:
          onboardingData?.preparing_for_competition ?? false,
        competition_name: onboardingData?.competition_name ?? "",
        compDay: onboardingData?.compDay ?? "",
        compMonth: onboardingData?.compMonth ?? "",
        compYear: onboardingData?.compYear ?? "",
        training_phase: onboardingData?.training_phase ?? "",
        weight_class: onboardingData?.weight_class ?? "",
        target_total: onboardingData?.target_total ?? "",
      },
    });

  const isCompeting = watch("preparing_for_competition");
  const trainingPhase = watch("training_phase");
  const compName = watch("competition_name");
  const compDay = watch("compDay");
  const compMonth = watch("compMonth");
  const compYear = watch("compYear");

  /* ── Validation — disable NEXT until required fields filled ── */
  const allFilled = (() => {
    if (!trainingPhase) return false;
    if (isCompeting) {
      if (!compName?.trim()) return false;
      if (!compDay) return false; // date not selected
    }
    return true;
  })();

  /* ── Competition date wheel picker state ── */
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempDay, setTempDay] = useState(0);
  const [tempMonth, setTempMonth] = useState(0);
  const [tempYear, setTempYear] = useState(0);
  const dayListRef = useRef<FlatList>(null);
  const monthListRef = useRef<FlatList>(null);
  const yearListRef = useRef<FlatList>(null);

  const dayItems = useMemo(() => {
    const max = getDaysInMonth(
      String(tempMonth + 1),
      COMP_YEARS[tempYear] || String(currentYear)
    );
    return Array.from({ length: max }, (_, i) => String(i + 1));
  }, [tempMonth, tempYear]);

  const monthItems = MONTHS.map((m) => m.short);
  const yearItems = COMP_YEARS;

  const watchedValues = watch();

  // Format the selected date for display
  const formattedCompDate = useMemo(() => {
    const { compDay, compMonth, compYear } = watchedValues;
    if (compDay && compMonth && compYear) {
      return `${getMonthShort(compMonth)} ${compDay}, ${compYear}`;
    }
    return "";
  }, [watchedValues.compDay, watchedValues.compMonth, watchedValues.compYear]);

  // Weeks until competition (settings mode)
  const weeksOut = useMemo(() => {
    if (!compDay || !compMonth || !compYear) return null;
    const comp = new Date(
      parseInt(compYear, 10),
      parseInt(compMonth, 10) - 1,
      parseInt(compDay, 10),
    );
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = comp.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.ceil(totalDays / 7);
  }, [compDay, compMonth, compYear]);

  // Open date modal — seed temp values from form (default: 1 week from today)
  const openDateModal = useCallback(() => {
    const oneWeekAhead = new Date();
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
    const defaultMonth = oneWeekAhead.getMonth(); // 0-indexed
    const defaultDay = oneWeekAhead.getDate() - 1; // 0-indexed
    const defaultYear = Math.max(0, COMP_YEARS.indexOf(String(oneWeekAhead.getFullYear())));
    const m = watchedValues.compMonth
      ? parseInt(watchedValues.compMonth, 10) - 1
      : defaultMonth;
    const d = watchedValues.compDay
      ? parseInt(watchedValues.compDay, 10) - 1
      : defaultDay;
    const y = watchedValues.compYear
      ? COMP_YEARS.indexOf(watchedValues.compYear)
      : defaultYear;
    setTempMonth(Math.max(0, m));
    setTempDay(Math.max(0, d));
    setTempYear(Math.max(0, y));
    setDateModalVisible(true);
    setTimeout(() => {
      dayListRef.current?.scrollToOffset({
        offset: Math.max(0, d) * WHEEL_ITEM_HEIGHT,
        animated: false,
      });
      monthListRef.current?.scrollToOffset({
        offset: Math.max(0, m) * WHEEL_ITEM_HEIGHT,
        animated: false,
      });
      yearListRef.current?.scrollToOffset({
        offset: Math.max(0, y) * WHEEL_ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, [watchedValues.compDay, watchedValues.compMonth, watchedValues.compYear]);

  // Minimum competition date — 1 week from today
  const minCompDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Confirm date selection — enforce minimum date
  const confirmDate = useCallback(() => {
    let day = tempDay + 1;
    let month = tempMonth; // 0-indexed
    let yearStr = yearItems[tempYear] || COMP_YEARS[0];
    const selected = new Date(parseInt(yearStr, 10), month, day);

    if (selected < minCompDate) {
      // Snap to minimum date
      day = minCompDate.getDate();
      month = minCompDate.getMonth();
      yearStr = String(minCompDate.getFullYear());
    }

    setValue("compDay", String(day), { shouldValidate: true });
    setValue("compMonth", String(month + 1), { shouldValidate: true });
    setValue("compYear", yearStr, { shouldValidate: true });
    setDateModalVisible(false);
  }, [tempDay, tempMonth, tempYear, setValue, yearItems, minCompDate]);

  // Handle scroll end for wheel columns
  const handleWheelScroll = useCallback(
    (setter: (i: number) => void, maxIndex: number) =>
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / WHEEL_ITEM_HEIGHT);
        setter(Math.max(0, Math.min(index, maxIndex)));
      },
    []
  );

  // Minimum indices for the current wheel position
  const minIndices = useMemo(() => {
    const minYear = Math.max(0, COMP_YEARS.indexOf(String(minCompDate.getFullYear())));
    const minMonth = minCompDate.getMonth(); // 0-indexed
    const minDay = minCompDate.getDate() - 1; // 0-indexed
    return { minYear, minMonth, minDay };
  }, [minCompDate]);

  // Check if a wheel item is before the minimum date
  const isBeforeMin = useCallback(
    (type: "day" | "month" | "year", index: number) => {
      const yearIdx = type === "year" ? index : tempYear;
      const monthIdx = type === "month" ? index : tempMonth;
      const dayIdx = type === "day" ? index : tempDay;

      if (yearIdx < minIndices.minYear) return true;
      if (yearIdx > minIndices.minYear) return false;
      // Same year
      if (monthIdx < minIndices.minMonth) return true;
      if (monthIdx > minIndices.minMonth) return false;
      // Same year + month
      if (dayIdx < minIndices.minDay) return true;
      return false;
    },
    [tempYear, tempMonth, tempDay, minIndices]
  );

  // Clamp day if month/year change makes it invalid, and enforce minimum date
  useEffect(() => {
    let newDay = tempDay;
    let newMonth = tempMonth;
    let newYear = tempYear;
    let changed = false;

    // Clamp day to valid range for the month
    if (newDay >= dayItems.length) {
      newDay = dayItems.length - 1;
      changed = true;
    }

    // Enforce minimum date
    if (newYear < minIndices.minYear) {
      newYear = minIndices.minYear;
      changed = true;
    }
    if (newYear === minIndices.minYear && newMonth < minIndices.minMonth) {
      newMonth = minIndices.minMonth;
      changed = true;
    }
    if (
      newYear === minIndices.minYear &&
      newMonth === minIndices.minMonth &&
      newDay < minIndices.minDay
    ) {
      newDay = minIndices.minDay;
      changed = true;
    }

    if (changed) {
      if (newDay !== tempDay) {
        setTempDay(newDay);
        dayListRef.current?.scrollToOffset({
          offset: newDay * WHEEL_ITEM_HEIGHT,
          animated: true,
        });
      }
      if (newMonth !== tempMonth) {
        setTempMonth(newMonth);
        monthListRef.current?.scrollToOffset({
          offset: newMonth * WHEEL_ITEM_HEIGHT,
          animated: true,
        });
      }
      if (newYear !== tempYear) {
        setTempYear(newYear);
        yearListRef.current?.scrollToOffset({
          offset: newYear * WHEEL_ITEM_HEIGHT,
          animated: true,
        });
      }
    }
  }, [dayItems.length, tempDay, tempMonth, tempYear, minIndices]);

  /* Keep ref in sync for auto-save */
  getValuesRef.current = getValues;

  /* Auto-save on back (settings mode) — revert to "No" if competition fields incomplete */
  useEffect(() => {
    if (!isSettings) return;
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      const vals = getValuesRef.current();
      const competitionComplete =
        vals.preparing_for_competition &&
        vals.competition_name?.trim() &&
        vals.compDay &&
        vals.compMonth &&
        vals.compYear;

      const sanitized = {
        ...onboardingData,
        ...vals,
        preparing_for_competition: !!competitionComplete,
        // Clear competition fields if incomplete
        ...(!competitionComplete && {
          competition_name: "",
          compDay: "",
          compMonth: "",
          compYear: "",
          weight_class: "",
          target_total: "",
        }),
      };
      dispatch(saveOnboardingData(sanitized));
    });
    return unsubscribe;
  }, [navigation, isSettings, dispatch, onboardingData]);

  /* ── Back (save progress) ── */
  const handleBack = () => {
    dispatch(saveOnboardingData({ ...onboardingData, ...getValues() }));
    if (onBack) onBack();
  };

  /* ── Submit ── */
  const onSubmit = (data: OnboardingScreen6Values) => {
    dispatch(saveOnboardingData({ ...onboardingData, ...data }));
    if (onComplete) onComplete();
  };

  /* ── Render ── */
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        {!isSettings && (
          <View style={styles.titleBlock}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2}>
              Goals
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
              Helps the AI plan your training direction
            </Text>
          </View>
        )}

        <View style={styles.formGroup}>
          {/* Preparing for Competition — YES/NO segmented control */}
          <View>
            <Text style={styles.sectionLabel}>PREPARING FOR A COMPETITION</Text>
            <Controller
              control={control}
              name="preparing_for_competition"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmentedTrack}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.segmentedOption,
                      value === true && styles.segmentedOptionActive,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => onChange(true)}
                  >
                    <Text
                      style={[
                        styles.segmentedText,
                        value === true && styles.segmentedTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.segmentedOption,
                      value === false && styles.segmentedOptionActive,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => onChange(false)}
                  >
                    <Text
                      style={[
                        styles.segmentedText,
                        value === false && styles.segmentedTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </Pressable>
                </View>
              )}
            />
          </View>

          {/* Conditional: Competition details */}
          {isCompeting ? (
            <>
              {/* Competition Name */}
              <Controller
                control={control}
                name="competition_name"
                render={({ field: { onChange, value } }) => (
                  <OlyFormField
                    label="COMPETITION NAME"
                    placeholder="e.g. National Championships"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />

              {/* Competition Date */}
              <View>
                <Text style={styles.sectionLabel}>COMPETITION DATE</Text>
                <Pressable
                  onPress={openDateModal}
                  style={({ pressed }) => [
                    styles.dropdownButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownButtonText,
                      !formattedCompDate && styles.dropdownPlaceholder,
                    ]}
                  >
                    {formattedCompDate || "Select competition date"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={olyColors.text.secondary}
                  />
                </Pressable>
              </View>

              {/* Weight Class (settings only) */}
              {isSettings && (
                <Controller
                  control={control}
                  name="weight_class"
                  render={({ field: { onChange, value } }) => (
                    <OlyFormField
                      label="WEIGHT CLASS"
                      placeholder="e.g. 73"
                      value={value}
                      onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))}
                      keyboardType="number-pad"
                      maxLength={4}
                      suffix={onboardingData?.weightUnit === "LB" ? "lbs" : "kg"}
                    />
                  )}
                />
              )}

              {/* Target Total (settings only) */}
              {isSettings && (
                <Controller
                  control={control}
                  name="target_total"
                  render={({ field: { onChange, value } }) => (
                    <OlyFormField
                      label="TARGET TOTAL"
                      placeholder="e.g. 280"
                      value={value}
                      onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))}
                      keyboardType="number-pad"
                      maxLength={4}
                      suffix={onboardingData?.weightUnit === "LB" ? "lbs" : "kg"}
                    />
                  )}
                />
              )}

              {/* Weeks out card (settings only, when date is set) */}
              {isSettings && weeksOut && (
                <View style={styles.weeksOutCard}>
                  <Text style={styles.weeksOutLabel}>WEEKS OUT</Text>
                  <Text style={styles.weeksOutValue}>
                    {weeksOut}
                    <Text style={styles.weeksOutUnit}> {weeksOut === 1 ? "week" : "weeks"}</Text>
                  </Text>
                </View>
              )}
            </>
          ) : (
            /* No competition — quiet empty state (settings only) */
            isSettings && (
              <Text style={styles.emptyState}>No competition scheduled</Text>
            )
          )}

          {/* Training Phase — only shown during onboarding */}
          {!isSettings && (
            <View>
              <Text style={styles.sectionLabel}>WHERE ARE YOU RIGHT NOW</Text>
              <Text style={styles.sectionSubtitle}>
                So the AI knows where to pick up
              </Text>
              <Controller
                control={control}
                name="training_phase"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.phaseList}>
                    {TRAINING_PHASES.map((phase) => {
                      const isActive = value === phase.value;
                      return (
                        <Pressable
                          key={phase.value}
                          onPress={() => onChange(phase.value)}
                          style={({ pressed }) => [
                            styles.phaseCard,
                            isActive && styles.phaseCardActive,
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.phaseTitle,
                              !isActive && styles.phaseTitleInactive,
                            ]}
                          >
                            {phase.title}
                          </Text>
                          <Text style={styles.phaseDescription}>
                            {phase.description}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* Bottom buttons */}
        {!isSettings && (
          <View style={styles.bottomButtons}>
            <OlyButton
              label="BACK"
              variant="secondary"
              onPress={handleBack}
              fullWidth
              style={styles.halfButton}
            />
            <OlyButton
              label="NEXT"
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              disabled={!allFilled}
              fullWidth
              style={styles.halfButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Competition Date Scroll Wheel Modal */}
      <Modal
        visible={dateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.wheelOverlay}>
          {/* Tap overlay to dismiss */}
          <Pressable
            style={styles.wheelOverlayTap}
            onPress={() => setDateModalVisible(false)}
          />
          <View style={styles.wheelSheet}>
            {/* Handle */}
            <View style={styles.wheelHandle} />

            {/* Header */}
            <View style={styles.wheelSheetHeader}>
              <Text style={styles.wheelSheetTitle}>COMPETITION DATE</Text>
              <Pressable
                onPress={() => setDateModalVisible(false)}
                hitSlop={olySpacing[12]}
              >
                <View style={styles.wheelCloseBtn}>
                  <Ionicons
                    name="close"
                    size={18}
                    color={olyColors.text.secondary}
                  />
                </View>
              </Pressable>
            </View>

            {/* Column labels */}
            <View style={styles.wheelLabels}>
              <Text style={styles.wheelLabel}>Day</Text>
              <Text style={styles.wheelLabel}>Month</Text>
              <Text style={styles.wheelLabel}>Year</Text>
            </View>

            {/* 3-column scroll wheels */}
            <View style={styles.wheelContainer}>
              {/* Selection highlight band */}
              <View style={styles.wheelHighlight} pointerEvents="none" />

              <View style={styles.wheelRow}>
                {/* Day wheel */}
                <FlatList
                  ref={dayListRef}
                  data={dayItems}
                  keyExtractor={(item) => `d-${item}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={WHEEL_ITEM_HEIGHT}
                  decelerationRate="fast"
                  nestedScrollEnabled
                  bounces={false}
                  style={styles.wheelColumn}
                  contentContainerStyle={{
                    paddingVertical: WHEEL_ITEM_HEIGHT * 2,
                  }}
                  getItemLayout={(_, index) => ({
                    length: WHEEL_ITEM_HEIGHT,
                    offset: WHEEL_ITEM_HEIGHT * index,
                    index,
                  })}
                  onMomentumScrollEnd={handleWheelScroll(
                    setTempDay,
                    dayItems.length - 1
                  )}
                  renderItem={({ item, index }) => {
                    const disabled = isBeforeMin("day", index);
                    return (
                      <View
                        style={[
                          styles.wheelItem,
                          { height: WHEEL_ITEM_HEIGHT },
                        ]}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            index === tempDay && styles.wheelItemTextActive,
                            disabled && styles.wheelItemTextDisabled,
                          ]}
                        >
                          {item}
                        </Text>
                      </View>
                    );
                  }}
                />

                {/* Month wheel */}
                <FlatList
                  ref={monthListRef}
                  data={monthItems}
                  keyExtractor={(item) => `m-${item}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={WHEEL_ITEM_HEIGHT}
                  decelerationRate="fast"
                  nestedScrollEnabled
                  bounces={false}
                  style={styles.wheelColumn}
                  contentContainerStyle={{
                    paddingVertical: WHEEL_ITEM_HEIGHT * 2,
                  }}
                  getItemLayout={(_, index) => ({
                    length: WHEEL_ITEM_HEIGHT,
                    offset: WHEEL_ITEM_HEIGHT * index,
                    index,
                  })}
                  onMomentumScrollEnd={handleWheelScroll(
                    setTempMonth,
                    monthItems.length - 1
                  )}
                  renderItem={({ item, index }) => {
                    const disabled = isBeforeMin("month", index);
                    return (
                      <View
                        style={[
                          styles.wheelItem,
                          { height: WHEEL_ITEM_HEIGHT },
                        ]}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            index === tempMonth && styles.wheelItemTextActive,
                            disabled && styles.wheelItemTextDisabled,
                          ]}
                        >
                          {item}
                        </Text>
                      </View>
                    );
                  }}
                />

                {/* Year wheel */}
                <FlatList
                  ref={yearListRef}
                  data={yearItems}
                  keyExtractor={(item) => `y-${item}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={WHEEL_ITEM_HEIGHT}
                  decelerationRate="fast"
                  nestedScrollEnabled
                  bounces={false}
                  style={styles.wheelColumn}
                  contentContainerStyle={{
                    paddingVertical: WHEEL_ITEM_HEIGHT * 2,
                  }}
                  getItemLayout={(_, index) => ({
                    length: WHEEL_ITEM_HEIGHT,
                    offset: WHEEL_ITEM_HEIGHT * index,
                    index,
                  })}
                  onMomentumScrollEnd={handleWheelScroll(
                    setTempYear,
                    yearItems.length - 1
                  )}
                  renderItem={({ item, index }) => {
                    const disabled = isBeforeMin("year", index);
                    return (
                      <View
                        style={[
                          styles.wheelItem,
                          { height: WHEEL_ITEM_HEIGHT },
                        ]}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            index === tempYear && styles.wheelItemTextActive,
                            disabled && styles.wheelItemTextDisabled,
                          ]}
                        >
                          {item}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            </View>

            {/* Confirm button */}
            <View style={styles.wheelConfirmContainer}>
              <OlyButton
                label="Confirm"
                onPress={confirmDate}
                variant="primary"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  /* Title */
  titleBlock: { marginBottom: olySpacing[20] },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  /* Form */
  formGroup: { gap: olySpacing[24] },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },
  sectionSubtitle: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginTop: olySpacing[4],
    marginBottom: olySpacing[8],
  },

  /* YES / NO pills — individual pills matching all other screens */
  segmentedTrack: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  segmentedOption: {
    flex: 1,
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyPalette.card,
  },
  segmentedOptionActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  segmentedText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "capitalize",
  },
  segmentedTextActive: {
    color: olyPalette.white,
  },

  /* Dropdown button (competition date — matches OlyTextInput height) */
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olySpacing[16],
    minHeight: olyLayout.inputHeight,
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
  },
  dropdownButtonText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  dropdownPlaceholder: {
    color: olyColors.text.disabled,
  },

  /* Weeks out card — matches competition-lifts total row */
  weeksOutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[16],
  },
  weeksOutLabel: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  weeksOutValue: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  weeksOutUnit: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Empty state */
  emptyState: {
    ...olyTypography.body,
    color: olyColors.text.disabled,
    textAlign: "center",
    paddingVertical: olySpacing[40],
  },

  /* Training phase cards */
  phaseList: {
    gap: olySpacing[8],
  },
  phaseCard: {
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[16],
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
  },
  phaseCardActive: {
    borderWidth: 1,
    borderColor: olyPalette.primary,
    backgroundColor: olyColors.bg.activeHighlight,
  },
  phaseTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  phaseTitleInactive: {
    color: olyColors.text.secondary,
  },
  phaseDescription: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  /* Bottom buttons */
  bottomButtons: {
    flexDirection: "row",
    gap: olySpacing[12],
    paddingTop: olySpacing[40],
    marginTop: "auto" as const,
  },
  halfButton: {
    flex: 1,
  },

  /* ── Wheel picker modal (same pattern as DOB on screen 1) ── */
  wheelOverlay: {
    flex: 1,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "flex-end" as const,
  },
  wheelOverlayTap: {
    flex: 1,
  },
  wheelSheet: {
    backgroundColor: olyPalette.card,
    borderTopLeftRadius: olyRadius.lg,
    borderTopRightRadius: olyRadius.lg,
    paddingBottom: olySpacing[32],
  },
  wheelHandle: {
    width: olySpacing[32],
    height: olySpacing[4],
    borderRadius: olyRadius.sm,
    backgroundColor: olyColors.border.default,
    alignSelf: "center" as const,
    marginTop: olySpacing[8],
  },
  wheelSheetHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
  },
  wheelSheetTitle: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase" as const,
  },
  wheelCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: olyPalette.card,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  wheelContainer: {
    position: "relative" as const,
    height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
    marginHorizontal: olySpacing[16],
    overflow: "hidden" as const,
  },
  wheelHighlight: {
    position: "absolute" as const,
    top: WHEEL_ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: WHEEL_ITEM_HEIGHT,
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.lg,
    zIndex: 1,
  },
  wheelLabels: {
    flexDirection: "row" as const,
    paddingHorizontal: olySpacing[16],
    marginBottom: olySpacing[8],
  },
  wheelLabel: {
    flex: 1,
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  wheelRow: {
    flexDirection: "row" as const,
    flex: 1,
  },
  wheelColumn: {
    flex: 1,
  },
  wheelItem: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  wheelItemText: {
    ...olyTypography.body,
    color: olyColors.text.disabled,
    textAlign: "center" as const,
  },
  wheelItemTextActive: {
    color: olyColors.text.primary,
    fontFamily: olyFonts.medium,
  },
  wheelItemTextDisabled: {
    color: olyColors.text.disabled,
    opacity: 0.3,
  },
  wheelConfirmContainer: {
    paddingHorizontal: olySpacing[16],
    marginTop: olySpacing[24],
  },
});
