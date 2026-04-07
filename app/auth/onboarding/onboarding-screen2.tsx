/**
 * Onboarding Screen 2 — Current Strength (Redesigned v2)
 *
 * Collects 1RM (or estimated) weights for all lifts across 4 categories:
 * Classic, Variation, Squat, Press.
 * Optional video upload per lift. Accuracy self-report (Tested/Estimated/Unsure).
 *
 * Abdul's data flow is unchanged — dispatches to onboardingSlice,
 * video upload via useUploadAthleteVideoMutation.
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
} from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyOverlay } from "@/src/oly-theme/oly-elevation";
import { useToast } from "@/context/toast-context";
import { useUploadAthleteVideoMutation } from "@/store/api";
import { saveOnboardingData, selectOnboardingData } from "@/store/reducer/onboardingSlice";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen2Props {
  onBack?: () => void;
  onComplete?: () => void;
  mode?: "onboarding" | "settings";
}

type LiftCategory = "classic" | "variation" | "squat" | "press";

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

const ACCURACY_OPTIONS = ["Tested", "Estimated", "Unsure"] as const;
type AccuracyValue = (typeof ACCURACY_OPTIONS)[number];

/* ── Unit conversion helpers ── */
const KG_TO_LB = 2.20462;
const kgToLb = (kg: number): number => Math.round(kg * KG_TO_LB);
const lbToKg = (lb: number): number => Math.round(lb / KG_TO_LB);

const CATEGORIES: {
  key: LiftCategory;
  title: string;
  lifts: { label: string; value: number }[];
}[] = [
  { key: "classic", title: "CLASSIC", lifts: CLASSIC_LIFTS },
  { key: "variation", title: "VARIATION", lifts: VARIATION_LIFTS },
  { key: "squat", title: "SQUAT", lifts: SQUAT_LIFTS },
  { key: "press", title: "PRESS", lifts: PRESS_LIFTS },
];

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen2({
  onComplete,
  onBack,
  mode = "onboarding",
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

  /* Lift weight values — restore from Redux if available */
  const [liftValues, setLiftValues] = useState<Record<LiftCategory, number[]>>(
    () =>
      onboardingData?.liftValues ?? {
        classic: CLASSIC_LIFTS.map((l) => l.value),
        variation: VARIATION_LIFTS.map((l) => l.value),
        squat: SQUAT_LIFTS.map((l) => l.value),
        press: PRESS_LIFTS.map((l) => l.value),
      },
  );

  /* Accuracy — restore from Redux if available */
  const [accuracy, setAccuracy] = useState<AccuracyValue>(
    () => onboardingData?.accuracy ?? "Estimated",
  );

  /* Unit preference from screen 1 */
  const isLbs = onboardingData?.weightUnit === "LB";
  const unitLabel = isLbs ? "lbs" : "kg";
  const toDisplay = isLbs ? kgToLb : (v: number) => v;
  const toStorage = isLbs ? lbToKg : (v: number) => v;

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

  const handleValueChange = (
    category: LiftCategory,
    index: number,
    value: number,
  ) => {
    const storedValue = toStorage(value);
    setLiftValues((prev) => ({
      ...prev,
      [category]: prev[category].map((v, i) => (i === index ? storedValue : v)),
    }));
  };

  const getLiftKey = (lift: LiftIdentifier): string =>
    `${lift.category}_${lift.index}`;

  const pickVideo = async (lift: LiftIdentifier) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
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
      Alert.alert("Video Options", "Choose an action", actions);
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

  /* ── Validation — all lifts must have a value > 0 ── */
  const allLiftsFilled = Object.values(liftValues).every((cat) =>
    cat.every((v) => v > 0),
  );

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

  /* ── Render helpers ── */

  const renderLiftRow = (
    category: LiftCategory,
    lifts: { label: string; value: number }[],
    index: number,
    item: { label: string },
  ) => {
    const storedWeight = liftValues[category][index];
    const weight = toDisplay(storedWeight);
    const hasValue = storedWeight > 0;
    const key = getLiftKey({ category, index, label: item.label });
    const hasVideo = !!liftVideos[key];
    const isLast = index === lifts.length - 1;

    return (
      <View key={`${category}-${index}`}>
        <View style={styles.liftRow}>
          <Text
            style={[
              styles.liftName,
              { color: hasValue ? olyColors.text.primary : olyColors.text.secondary },
            ]}
          >
            {item.label}
          </Text>

          <View style={styles.liftRight}>
            {/* Video icon: only show in onboarding mode */}
            {!isSettings && (
              <Pressable
                onPress={() =>
                  showVideoOptions({ category, index, label: item.label })
                }
                hitSlop={olySpacing[12]}
                style={({ pressed }) => [hasVideo ? styles.videoIconActive : undefined, pressed && { opacity: 0.7 }]}
              >
                <Ionicons
                  name={hasVideo ? "videocam" : "videocam-outline"}
                  size={20}
                  color={
                    hasVideo
                      ? olyPalette.primary
                      : hasValue
                        ? olyColors.text.secondary
                        : olyColors.text.disabled
                  }
                />
              </Pressable>
            )}

            <TextInput
              style={[
                styles.weightInput,
                {
                  color: hasValue
                    ? olyColors.text.primary
                    : olyColors.text.secondary,
                },
              ]}
              value={weight === 0 ? "0" : weight.toString()}
              onChangeText={(text) => {
                const displayValue = parseInt(text) || 0;
                handleValueChange(category, index, displayValue);
              }}
              keyboardType="number-pad"
              maxLength={4}
              selectTextOnFocus
            />
            <Text
              style={[
                styles.unitLabel,
                {
                  color: hasValue
                    ? olyColors.text.secondary
                    : olyColors.text.disabled,
                },
              ]}
            >
              {unitLabel}
            </Text>
          </View>
        </View>

        {!isLast && <View style={styles.divider} />}
      </View>
    );
  };

  const renderCategory = (cat: {
    key: LiftCategory;
    title: string;
    lifts: { label: string; value: number }[];
  }) => (
    <View key={cat.key} style={styles.categoryBlock}>
      <Text style={styles.categoryTitle}>{cat.title}</Text>
      <View style={styles.liftCard}>
        {cat.lifts.map((item, index) =>
          renderLiftRow(cat.key, cat.lifts, index, item),
        )}
      </View>
    </View>
  );

  /* ── Render ── */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {!isSettings && (
        <View style={styles.titleBlock}>
          <Text style={styles.title} maxFontSizeMultiplier={1.2}>
            Current strength
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
            Used to guide training loads and progressions
          </Text>
        </View>
      )}

      <View style={styles.categoriesContainer}>
        {CATEGORIES.map(renderCategory)}
      </View>

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
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setAccuracy(option)}
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
    </ScrollView>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  titleBlock: { marginBottom: olySpacing[20] },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  subtitle: { ...olyTypography.body, color: olyColors.text.secondary, marginTop: olySpacing[4] },

  categoriesContainer: { gap: olySpacing[16] },
  categoryBlock: { gap: olySpacing[8] },
  categoryTitle: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },

  liftCard: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[16],
  },
  liftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: olySpacing[12],
    minHeight: olyLayout.minTouchTarget,
  },
  liftName: { ...olyTypography.body, fontFamily: olyFonts.medium, flex: 1 },
  liftRight: { flexDirection: "row", alignItems: "center", gap: olySpacing[12] },
  videoIconActive: {
    width: 32,
    height: 32,
    borderRadius: olyRadius.sm,
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  weightInput: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    minWidth: olySpacing[40],
    textAlign: "right",
    paddingHorizontal: olySpacing[4],
    paddingVertical: olySpacing[4],
  },
  unitLabel: { ...olyTypography.bodySmall },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: olyColors.border.default },

  accuracyBlock: { marginTop: olySpacing[24], gap: olySpacing[8] },
  accuracyTitle: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  accuracyRow: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  accuracyPill: {
    flex: 1,
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyPalette.card,
  },
  accuracyPillActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  accuracyPillText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "capitalize",
  },
  accuracyPillTextActive: { color: olyPalette.white },

  bottomButtons: { flexDirection: "row", gap: olySpacing[12], paddingTop: olySpacing[40], marginTop: "auto" as const },
  backButton: { flex: 1 },
  nextButton: { flex: 1 },

  loaderContainer: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: olyOverlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
