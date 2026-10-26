/**
 * Onboarding Screen 2 — the record book.
 *
 * One screen, two modes:
 * - onboarding: "Your total" card that fills in live as the athlete types,
 *   then inline inputs grouped as competition lifts, squats and a
 *   collapsed "Add variations" group. Per-lift video picker, accuracy
 *   pills and BACK/NEXT as before.
 * - settings: the filled record book. Verified total card, rich rows with
 *   rank and next milestone, plain variation rows. Every number opens
 *   LiftEditSheet; edits land in the onboarding slice and the settings
 *   wrapper's Save button sends them. A milestone line opens that lift in
 *   MilestonesSheet, the header "?" opens its overview. No accuracy pills.
 *
 * Abdul's data flow is unchanged — liftValues keeps its four categorised
 * arrays in kg, video upload via useUploadAthleteVideoMutation.
 */

import { onboardingStyles } from "@/src/oly-components/onboarding/onboarding-styles";
import type { Sex } from "@/constants/leaderboard-data";
import { useToast } from "@/context/toast-context";
import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { olyAlert } from "@/src/oly-components/feedback/OlyAlert";
import {
  classFor,
  boardLabel,
  levelFor,
  worldRecordCap,
  type LadderLift,
  type LevelInfo,
} from "@/src/oly-components/records/ladder";
import LiftEditSheet, {
  type LiftEditTarget,
  type RecordKind,
} from "@/src/oly-components/records/LiftEditSheet";
import {
  RecordGroup,
  RecordRow,
  SimpleRecordRow,
  TotalCard,
} from "@/src/oly-components/records/RecordBook";
import MilestonesSheet, {
  type MilestoneLift,
} from "@/src/oly-components/records/MilestonesSheet";
import { mockRank } from "@/src/oly-mock/records";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import { useUploadAthleteVideoMutation } from "@/store/api";
import { saveOnboardingData, selectOnboardingData } from "@/store/reducer/onboardingSlice";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

type LiftCategory = "classic" | "variation" | "squat" | "press";
type BoardKey = "snatch" | "clean_jerk";

/** What settings knows from the API and onboarding can't. */
export interface RecordBookData {
  /** Verified on the board, kg. */
  verified: Partial<Record<BoardKey, number>>;
  /** Waiting on review, kg. */
  pending: Partial<Record<BoardKey, number>>;
  sex: Sex;
  bodyweightKg: number;
}

interface OnboardingScreen2Props {
  onBack?: () => void;
  onComplete?: () => void;
  mode?: "onboarding" | "settings";
  /** Settings only. Onboarding reads sex and bodyweight from screen 1. */
  records?: RecordBookData;
  /** Settings only. The "?" in the header opens the milestones sheet. */
  milestonesOpen?: boolean;
  onCloseMilestones?: () => void;
  /** Settings only. Height of the floating header above, so content starts below it and scrolls under its fade. */
  topInset?: number;
}

interface LiftIdentifier {
  category: LiftCategory;
  index: number;
  label: string;
}

/* ── Lift Data ─────────────────────────────────────────── */

const CLASSIC_LIFTS = [
  { label: "Snatch", value: 0 },
  { label: "Clean & Jerk", value: 0 },
];

const VARIATION_LIFTS = [
  { label: "Power Snatch", value: 0 },
  { label: "Clean", value: 0 },
  { label: "Power Clean", value: 0 },
];

const SQUAT_LIFTS = [
  { label: "Back Squat", value: 0 },
  { label: "Front Squat", value: 0 },
  { label: "Overhead Squat", value: 0 },
];

const PRESS_LIFTS = [
  { label: "Strict Press", value: 0 },
  { label: "Push Press", value: 0 },
  { label: "Jerk", value: 0 },
  { label: "Power Jerk", value: 0 },
];

const LIFTS: Record<LiftCategory, { label: string; value: number }[]> = {
  classic: CLASSIC_LIFTS,
  variation: VARIATION_LIFTS,
  squat: SQUAT_LIFTS,
  press: PRESS_LIFTS,
};

/** How the record book groups the four stored arrays. */
interface Slot {
  category: LiftCategory;
  index: number;
  kind: RecordKind;
  ladder?: LadderLift;
  board?: BoardKey;
}

const COMPETITION: Slot[] = [
  { category: "classic", index: 0, kind: "board", ladder: "snatch", board: "snatch" },
  { category: "classic", index: 1, kind: "board", ladder: "cj", board: "clean_jerk" },
];
const SQUATS: Slot[] = [
  { category: "squat", index: 0, kind: "squat", ladder: "back" },
  { category: "squat", index: 1, kind: "squat", ladder: "front" },
];
const VARIATIONS: Slot[] = [
  ...VARIATION_LIFTS.map((_, index) => ({ category: "variation" as const, index, kind: "variation" as const })),
  { category: "squat", index: 2, kind: "variation" },
  ...PRESS_LIFTS.map((_, index) => ({ category: "press" as const, index, kind: "variation" as const })),
];
/** Onboarding needs these four; variations are optional. */
const REQUIRED = [...COMPETITION, ...SQUATS];

const labelOf = (slot: Slot) => LIFTS[slot.category][slot.index].label;

const ACCURACY_OPTIONS = ["Tested", "Estimated", "Unsure"] as const;
type AccuracyValue = (typeof ACCURACY_OPTIONS)[number];

/* ── Unit conversion helpers ── */
const KG_TO_LB = 2.20462;
const kgToLb = (kg: number): number => Math.round(kg * KG_TO_LB);
const lbToKg = (lb: number): number => Math.round(lb / KG_TO_LB);
const asIs = (v: number): number => v;

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen2({
  onComplete,
  onBack,
  mode = "onboarding",
  records,
  milestonesOpen,
  onCloseMilestones,
  topInset = 0,
}: OnboardingScreen2Props) {
  const isSettings = mode === "settings";
  const { showSuccess, showError } = useToast();
  const dispatch = useDispatch();
  const onboardingData = useSelector(selectOnboardingData);

  /* Video state */
  const [isUploading, setIsUploading] = useState(false);
  const [liftVideos, setLiftVideos] = useState<Record<string, string>>(
    () => onboardingData?.liftVideos ?? {},
  );
  const [uploadAthleteVideo] = useUploadAthleteVideoMutation();

  /* Lift weight values (kg) — restore from Redux if available */
  const [liftValues, setLiftValues] = useState<Record<LiftCategory, number[]>>(
    () =>
      onboardingData?.liftValues ?? {
        classic: CLASSIC_LIFTS.map((l) => l.value),
        variation: VARIATION_LIFTS.map((l) => l.value),
        squat: SQUAT_LIFTS.map((l) => l.value),
        press: PRESS_LIFTS.map((l) => l.value),
      },
  );

  /* A posted video can raise a number from the post screen. Pick it up. */
  const storeValues = onboardingData?.liftValues;
  useEffect(() => {
    if (isSettings && storeValues) setLiftValues(storeValues);
  }, [isSettings, storeValues]);

  /* Accuracy — restore from Redux if available */
  const [accuracy, setAccuracy] = useState<AccuracyValue>(
    () => onboardingData?.accuracy ?? "Estimated",
  );

  /* Variations start open only if one is already filled in */
  const [showVariations, setShowVariations] = useState(() =>
    VARIATIONS.some((v) => (liftValues[v.category]?.[v.index] ?? 0) > 0),
  );

  /* The record being edited in the sheet (settings) */
  const [editing, setEditing] = useState<{ slot: Slot; target: LiftEditTarget } | null>(null);
  /* Which milestones view is open: a lift name, or null. */
  const [milestoneFrom, setMilestoneFrom] = useState<string | null>(null);

  /* Unit preference from screen 1 */
  const isLbs = onboardingData?.weightUnit === "LB";
  const unitLabel = isLbs ? "lbs" : "kg";
  const toDisplay = isLbs ? kgToLb : asIs;
  const toStorage = isLbs ? lbToKg : asIs;

  /* Sex and bodyweight drive the milestone ladder and the board */
  const sex: Sex =
    records?.sex ?? (/^f/i.test(onboardingData?.sex ?? "") ? "F" : "M");
  const typedBw = parseFloat(onboardingData?.weight ?? "") || 0;
  const bodyweightKg = records?.bodyweightKg ?? (isLbs ? typedBw / KG_TO_LB : typedBw);
  const cls = bodyweightKg > 0 ? classFor(sex, bodyweightKg) : null;
  const board = cls ? boardLabel(sex, cls) : null;

  /* ── Auto-save on back (settings mode only) ── */
  const navigation = useNavigation();
  const liftValuesRef = useRef(liftValues);
  const accuracyRef = useRef(accuracy);
  const liftVideosRef = useRef(liftVideos);
  liftValuesRef.current = liftValues;
  accuracyRef.current = accuracy;
  liftVideosRef.current = liftVideos;

  useEffect(() => {
    if (!isSettings) return;

    const unsubscribe = navigation.addListener("beforeRemove", () => {
      const vals = liftValuesRef.current;
      dispatch(
        saveOnboardingData({
          accuracy: accuracyRef.current,
          olympic_lifts: vals.classic.map((v) => v > 0),
          squats: vals.squat.map((v) => v > 0),
          press: vals.press.map((v) => v > 0),
          variations: vals.variation.map((v) => v > 0),
          liftValues: vals,
          liftVideos: liftVideosRef.current,
        }),
      );
    });

    return unsubscribe;
  }, [navigation, isSettings, dispatch]);

  /* ── Handlers ── */

  const valueOf = (slot: Slot) => liftValues[slot.category]?.[slot.index] ?? 0;

  const setStored = (category: LiftCategory, index: number, kg: number) => {
    const next = {
      ...liftValues,
      [category]: liftValues[category].map((v, i) => (i === index ? kg : v)),
    };
    setLiftValues(next);
    // Settings saves from the slice, so every edit goes there at once.
    if (isSettings) dispatch(saveOnboardingData({ liftValues: next }));
  };

  const handleValueChange = (
    category: LiftCategory,
    index: number,
    value: number,
  ) => setStored(category, index, toStorage(value));

  const getLiftKey = (lift: LiftIdentifier): string =>
    `${lift.category}_${lift.index}`;

  const pickVideo = async (lift: LiftIdentifier) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      olyAlert(
        "Permission needed",
        "Please allow access to your media library",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setIsUploading(true);
      try {
        const key = getLiftKey(lift);
        const videoUri = result.assets[0].uri;
        setLiftVideos((prev) => ({ ...prev, [key]: videoUri }));

        /* Upload to API in background */
        const formData = new FormData();
        formData.append("video", {
          uri: videoUri,
          type: "video/mp4",
          name: `${lift.label.replace(/\s+/g, "_")}.mp4`,
        } as any);
        await uploadAthleteVideo(formData).unwrap();
        showSuccess("Video added!");
      } catch {
        showError("Failed to upload video");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const showVideoOptions = (lift: LiftIdentifier) => {
    const key = getLiftKey(lift);
    const hasVideo = !!liftVideos[key];

    if (Platform.OS === "ios") {
      const options = hasVideo
        ? ["Cancel", "Replace Video", "Remove Video"]
        : ["Cancel", "Add Video"];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: hasVideo ? 2 : undefined,
        },
        (buttonIndex) => {
          if (hasVideo) {
            if (buttonIndex === 1) pickVideo(lift);
            if (buttonIndex === 2) handleRemoveVideo(lift);
          } else {
            if (buttonIndex === 1) pickVideo(lift);
          }
        },
      );
    } else {
      const actions = hasVideo
        ? [
            { text: "Cancel", style: "cancel" as const },
            { text: "Replace Video", onPress: () => pickVideo(lift) },
            {
              text: "Remove Video",
              style: "destructive" as const,
              onPress: () => handleRemoveVideo(lift),
            },
          ]
        : [
            { text: "Cancel", style: "cancel" as const },
            { text: "Add Video", onPress: () => pickVideo(lift) },
          ];
      olyAlert("Video Options", "Choose an action", actions);
    }
  };

  const handleRemoveVideo = (lift: LiftIdentifier) => {
    const key = getLiftKey(lift);
    setLiftVideos((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    showSuccess("Video removed!");
  };

  /* ── Back (save progress) ── */

  const handleBack = () => {
    dispatch(saveOnboardingData({ accuracy, liftValues, liftVideos }));
    if (onBack) onBack();
  };

  /* ── Validation — the four ranked and milestone lifts need a value ── */
  const allLiftsFilled = REQUIRED.every((slot) => valueOf(slot) > 0);

  /* ── Submit ── */

  const onSubmit = () => {
    if (!allLiftsFilled) return;

    /* Build selection booleans (backwards compat with Abdul's payload) */
    const olympic_lifts = liftValues.classic.map((v) => v > 0);
    const squats = liftValues.squat.map((v) => v > 0);
    const press = liftValues.press.map((v) => v > 0);
    const variations = liftValues.variation.map((v) => v > 0);

    dispatch(
      saveOnboardingData({
        accuracy,
        olympic_lifts,
        squats,
        press,
        variations,
        liftValues,
        liftVideos,
      }),
    );

    if (onComplete) onComplete();
  };

  /* ── Record book data ── */

  /* A verified lift is never shown below its verified number. */
  const shownOf = (slot: Slot) => {
    const v = slot.board ? records?.verified[slot.board] : undefined;
    return Math.max(valueOf(slot), v ?? 0);
  };

  const levelOf = (slot: Slot): LevelInfo | null =>
    slot.ladder ? levelFor(slot.ladder, shownOf(slot), sex, bodyweightKg) : null;

  const openEdit = (slot: Slot) => {
    const verifiedKg = slot.board ? records?.verified[slot.board] : undefined;
    const pendingKg = slot.board ? records?.pending[slot.board] : undefined;
    setEditing({
      slot,
      target: {
        name: labelOf(slot),
        kind: slot.kind,
        currentKg: shownOf(slot),
        verifiedKg,
        pendingKg,
        capKg:
          cls && slot.board
            ? worldRecordCap(slot.board === "snatch" ? "snatch" : "cj", sex, cls)
            : null,
        classLabel: cls ? `${cls} kg` : undefined,
      },
    });
  };

  /* Every lift with a milestone ladder, for the milestones sheet. */
  const milestoneLifts: MilestoneLift[] = [...COMPETITION, ...SQUATS].flatMap((slot) => {
    const level = levelOf(slot);
    if (!level) return [];
    return [
      {
        name: labelOf(slot),
        best: toDisplay(shownOf(slot)),
        marks: level.marks.map(toDisplay),
        mults: level.mults,
        level: level.level,
        verified: slot.board ? records?.verified[slot.board] != null : false,
      },
    ];
  });

  /* The number is only recorded if the post goes up. Discarding the post
     leaves the record book as it was. */
  const addVideo = (slot: Slot, kg: number) =>
    router.push({
      pathname: "/athlete/create-new-post",
      params: {
        recordCategory: slot.category,
        recordIndex: String(slot.index),
        recordLift: labelOf(slot),
        ...(kg > 0 ? { recordKg: String(kg) } : {}),
      },
    });

  const snatchKg = shownOf(COMPETITION[0]);
  const cjKg = shownOf(COMPETITION[1]);
  const vSnatch = records?.verified.snatch;
  const vCj = records?.verified.clean_jerk;
  const verifiedTotal = vSnatch != null && vCj != null ? vSnatch + vCj : null;
  const fmtBw = bodyweightKg > 0
    ? String(isLbs ? kgToLb(bodyweightKg) : Math.round(bodyweightKg * 10) / 10)
    : null;

  /** The rounded-down average level of the ladder lifts typed in so far. */
  const overallLevel = (): string | null => {
    const levels = REQUIRED.filter((slot) => valueOf(slot) > 0)
      .map(levelOf)
      .filter((l): l is LevelInfo => !!l);
    if (!levels.length) return null;
    const avg = levels.reduce((sum, l) => sum + l.level, 0) / levels.length;
    return `Level ${Math.floor(avg)}`;
  };

  const renderTotal = () => {
    if (isSettings && verifiedTotal != null) {
      const r = cls ? mockRank("total", verifiedTotal, sex, cls) : null;
      return (
        <TotalCard
          label="VERIFIED TOTAL"
          total={toDisplay(verifiedTotal)}
          unit={unitLabel}
          rank={r && board ? { rank: r.rank, board } : null}
          gap={r?.gapKg != null ? { kg: toDisplay(r.gapKg), rank: r.rank - 1 } : null}
          cols={[
            { label: "SNATCH", value: String(toDisplay(vSnatch!)) },
            { label: "C&J", value: String(toDisplay(vCj!)) },
            { label: "BODYWEIGHT", value: fmtBw },
          ]}
        />
      );
    }

    const total = snatchKg + cjKg;
    const third = isSettings
      ? { label: "BODYWEIGHT", value: fmtBw }
      : { label: "LEVEL", value: overallLevel(), plain: true };
    return (
      <TotalCard
        label="YOUR TOTAL"
        total={toDisplay(total)}
        unit={unitLabel}
        rank={null}
        gap={null}
        cols={[
          { label: "SNATCH", value: snatchKg > 0 ? String(toDisplay(snatchKg)) : null },
          { label: "C&J", value: cjKg > 0 ? String(toDisplay(cjKg)) : null },
          third,
        ]}
        footer={!isSettings && total === 0 ? "Fills in as you type below." : undefined}
      />
    );
  };

  /* ── Render helpers: settings ── */

  const renderRecordRow = (slot: Slot, i: number) => {
    const verifiedKg = slot.board ? records?.verified[slot.board] : undefined;
    const r =
      verifiedKg != null && cls
        ? mockRank(slot.board === "snatch" ? "snatch" : "cleanjerk", verifiedKg, sex, cls)
        : null;
    const level = levelOf(slot);
    const display = level
      ? {
          ...level,
          toNext: level.toNext != null ? toDisplay(level.toNext) : null,
          marks: level.marks.map(toDisplay),
        }
      : null;
    return (
      <RecordRow
        key={labelOf(slot)}
        name={labelOf(slot)}
        value={toDisplay(shownOf(slot))}
        unit={unitLabel}
        first={i === 0}
        verified={verifiedKg != null}
        rank={
          r && board
            ? { rank: r.rank, board, gapKg: r.gapKg != null ? toDisplay(r.gapKg) : null }
            : null
        }
        level={display}
        onEdit={() => openEdit(slot)}
        onAddVideo={() => addVideo(slot, shownOf(slot))}
        onMilestones={() => setMilestoneFrom(labelOf(slot))}
      />
    );
  };

  /* ── Render helpers: onboarding ── */

  const renderInputRow = (slot: Slot, i: number, hint?: string) => {
    const label = labelOf(slot);
    const storedWeight = valueOf(slot);
    const weight = toDisplay(storedWeight);
    const hasValue = storedWeight > 0;
    const lift = { category: slot.category, index: slot.index, label };
    const hasVideo = !!liftVideos[getLiftKey(lift)];

    return (
      <View key={label} style={[styles.liftRow, i > 0 && styles.rowRule]}>
        <View style={styles.liftText}>
          <Text
            style={[
              styles.liftName,
              { color: hasValue ? olyColors.text.primary : olyColors.text.secondary },
            ]}
          >
            {label}
          </Text>
          {hint ? <Text style={styles.liftHint}>{hint}</Text> : null}
        </View>

        <Pressable
          onPress={() => showVideoOptions(lift)}
          hitSlop={olySpacing[8]}
          accessibilityRole="button"
          accessibilityLabel={hasVideo ? `${label} video options` : `Add a ${label} video`}
          style={({ pressed }) => [
            styles.videoIcon,
            hasVideo && styles.videoIconActive,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={hasVideo ? "videocam" : "videocam-outline"}
            size={20}
            color={
              hasVideo
                ? olyPalette.primary
                : hasValue
                  ? olyColors.text.secondary
                  : olyColors.text.hint
            }
          />
        </Pressable>

        <View style={styles.weightPill}>
          <TextInput
            style={[
              styles.weightInput,
              { color: hasValue ? olyColors.text.primary : olyColors.text.hint },
            ]}
            value={weight === 0 ? "0" : weight.toString()}
            onChangeText={(text) => {
              const displayValue = parseInt(text) || 0;
              handleValueChange(slot.category, slot.index, displayValue);
            }}
            keyboardType="number-pad"
            maxLength={4}
            selectTextOnFocus
            accessibilityLabel={`${label} in ${unitLabel}`}
          />
          <Text style={styles.unitLabel}>{unitLabel}</Text>
        </View>
      </View>
    );
  };

  const variationNames = "Power snatch, clean, overhead squat, presses and jerks";

  /* ── Render ── */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, topInset > 0 && { paddingTop: topInset }]}
      scrollIndicatorInsets={{ top: topInset }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {!isSettings && (
        <View style={styles.titleBlock}>
          <Text style={styles.title} maxFontSizeMultiplier={1.2}>
            Your current lifts
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
            Best guesses are fine. You can fix them later.
          </Text>
        </View>
      )}

      {renderTotal()}

      {isSettings ? (
        <>
          <Text style={styles.categoryTitle}>COMPETITION LIFTS</Text>
          <RecordGroup>{COMPETITION.map(renderRecordRow)}</RecordGroup>

          <Text style={styles.categoryTitle}>SQUATS</Text>
          <RecordGroup>{SQUATS.map(renderRecordRow)}</RecordGroup>

          <Text style={styles.categoryTitle}>VARIATIONS</Text>
          <RecordGroup>
            {VARIATIONS.map((slot, i) => (
              <SimpleRecordRow
                key={labelOf(slot)}
                name={labelOf(slot)}
                value={toDisplay(valueOf(slot))}
                unit={unitLabel}
                first={i === 0}
                onEdit={() => openEdit(slot)}
              />
            ))}
          </RecordGroup>
        </>
      ) : (
        <>
          <Text style={styles.categoryTitle}>COMPETITION LIFTS</Text>
          <RecordGroup>
            {COMPETITION.map((slot, i) => renderInputRow(slot, i, "Ranks you on the board"))}
          </RecordGroup>

          <Text style={styles.categoryTitle}>SQUATS</Text>
          <RecordGroup>
            {SQUATS.map((slot, i) => renderInputRow(slot, i, "Counts for milestones"))}
          </RecordGroup>

          <Text style={styles.categoryTitle}>OPTIONAL</Text>
          <RecordGroup>
            <Pressable
              onPress={() => setShowVariations((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ expanded: showVariations }}
              style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}
            >
              <View style={styles.liftText}>
                <Text style={styles.addTitle}>
                  {showVariations ? "Variations" : "Add variations"}
                </Text>
                {!showVariations && <Text style={styles.liftHint}>{variationNames}</Text>}
              </View>
              <View style={styles.addIcon}>
                <Ionicons
                  name={showVariations ? "remove" : "add"}
                  size={18}
                  color={olyColors.text.primary}
                />
              </View>
            </Pressable>
            {showVariations && VARIATIONS.map((slot, i) => renderInputRow(slot, i + 1))}
          </RecordGroup>
        </>
      )}

      {/* Onboarding only. Video verification replaced it in the record book. */}
      {!isSettings && (
        <View style={styles.accuracyBlock}>
          <Text style={styles.accuracyTitle}>
            HOW ACCURATE ARE THESE NUMBERS?
          </Text>
          <View style={styles.accuracyRow}>
            {ACCURACY_OPTIONS.map((option) => {
              const isActive = accuracy === option;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.accuracyPill,
                    isActive && styles.accuracyPillActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setAccuracy(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.accuracyPillText,
                      isActive && styles.accuracyPillTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {!isSettings && (
        <View style={styles.bottomButtons}>
          <OlyButton
            label="BACK"
            variant="secondary"
            onPress={handleBack}
            fullWidth
            style={styles.backButton}
          />
          <OlyButton
            label="NEXT"
            variant="primary"
            onPress={onSubmit}
            disabled={!allLiftsFilled}
            fullWidth
            style={styles.nextButton}
          />
        </View>
      )}

      {isUploading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={olyColors.button.primary.bg}
          />
        </View>
      )}

      {isSettings && (
        <LiftEditSheet
          target={editing?.target ?? null}
          onClose={() => setEditing(null)}
          onSave={(kg) => {
            if (editing) setStored(editing.slot.category, editing.slot.index, kg);
          }}
          onAddVideo={(kg) => editing && addVideo(editing.slot, kg)}
          unit={unitLabel}
          toDisplay={toDisplay}
          toStorage={toStorage}
        />
      )}
      {isSettings && (
        <MilestonesSheet
          view={milestoneFrom ?? (milestonesOpen ? "all" : null)}
          lifts={milestoneLifts}
          unit={unitLabel}
          bodyweight={fmtBw}
          onAddVideo={(name) => {
            const slot = [...COMPETITION, ...SQUATS].find((x) => labelOf(x) === name);
            if (slot) addVideo(slot, shownOf(slot));
          }}
          onClose={() => {
            setMilestoneFrom(null);
            onCloseMilestones?.();
          }}
        />
      )}
    </ScrollView>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: olySpacing[24] },
  pressed: { opacity: 0.7 },

  titleBlock: onboardingStyles.titleBlock,
  title: onboardingStyles.title,
  subtitle: onboardingStyles.subtitle,

  categoryTitle: {
    ...olyTypography.caption,
    fontSize: 11,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: olySpacing[8],
    marginHorizontal: olySpacing[4],
  },

  liftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: olySpacing[16],
    paddingVertical: 10,
  },
  rowRule: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  liftText: { flex: 1 },
  liftName: { fontFamily: olyFonts.bold, fontSize: 15, lineHeight: 20 },
  liftHint: { ...olyTypography.caption, marginTop: 2, color: olyColors.text.hint },
  videoIcon: {
    width: 32,
    height: 32,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  videoIconActive: onboardingStyles.selected,
  weightPill: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 76,
    minHeight: olyLayout.minTouchTarget,
    paddingRight: 14,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  weightInput: {
    fontFamily: olyFonts.bold,
    fontSize: 16,
    minWidth: 48,
    minHeight: olyLayout.minTouchTarget,
    paddingLeft: 14,
    paddingRight: 3,
    paddingVertical: 0,
    textAlign: "right",
  },
  unitLabel: { ...olyTypography.caption, fontSize: 11, color: olyColors.text.hint },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: olySpacing[16],
    paddingVertical: 10,
  },
  addTitle: {
    fontFamily: olyFonts.medium,
    fontSize: 15,
    lineHeight: 20,
    color: olyColors.text.primary,
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.raised,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },

  accuracyBlock: { marginTop: olySpacing[24], gap: olySpacing[8] },
  accuracyTitle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  accuracyRow: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  accuracyPill: {
    flex: 1,
    minHeight: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  accuracyPillActive: onboardingStyles.selected,
  accuracyPillText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "capitalize",
  },
  accuracyPillTextActive: { color: olyColors.text.primary },

  bottomButtons: onboardingStyles.bottomButtons,
  backButton: { flex: 1 },
  nextButton: { flex: 1 },

  loaderContainer: onboardingStyles.loaderOverlay,
});
