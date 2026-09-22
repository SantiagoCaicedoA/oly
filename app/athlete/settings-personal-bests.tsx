/**
 * Personal records (settings) — a thin wrapper around the onboarding
 * strength screen, so the design stays identical to onboarding.
 *
 * OnboardingScreen2 already supports mode="settings": it hides its own
 * title block, the per-lift video pickers and the BACK/NEXT buttons, and
 * it writes edits into the onboarding slice. What it does NOT do is talk
 * to the API, so this wrapper does three things:
 *
 *   1. seeds the slice from the server profile on open
 *   2. supplies the nav, title and Save button
 *   3. pushes the edits back as a partial strength_stats update
 *
 * The rank rule still holds. A lift that is already verified by video is
 * skipped when building the payload, so it can never be typed upward.
 */

import OnboardingScreen2 from "@/app/auth/onboarding/onboarding-screen2";
import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import {
  useGetMyLiftsQuery,
  useGetProfileQuery,
  useSubmitProfileMutation,
} from "@/store/api";
import {
  saveOnboardingData,
  selectOnboardingData,
} from "@/store/reducer/onboardingSlice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/** Index order must match onboarding-screen2's lift constants exactly. */
const ORDER = {
  classic: ["snatch", "clean_jerk"],
  variation: ["power_snatch", "clean", "power_clean"],
  squat: ["back_squat", "front_squat", "overhead_squat"],
  // NOTE: screen2 lists Jerk BEFORE Power Jerk.
  press: ["strict_press", "push_press", "jerk", "power_jerk"],
} as const;

export default function SettingsPersonalBests() {
  const dispatch = useDispatch();
  const profileQ = useGetProfileQuery();
  const liftsQ = useGetMyLiftsQuery();
  const [submitProfile, submitState] = useSubmitProfileMutation();
  const onboardingData = useSelector(selectOnboardingData);
  const [ready, setReady] = useState(false);

  const stats = profileQ.data?.data?.profile?.strength_stats;
  const accuracy = profileQ.data?.data?.profile?.strength_accuracy;

  // 1. Seed the slice from the server, once, so the screen opens on the
  //    saved values rather than whatever onboarding left behind.
  useEffect(() => {
    // gate on the request settling, not on stats existing: a user who
    // never filled this in still needs an empty, editable form.
    if (ready || profileQ.isLoading) return;
    const read = (section: keyof typeof ORDER) =>
      ORDER[section].map((key) => Number(stats?.[section]?.[key]?.value ?? 0) || 0);

    dispatch(
      saveOnboardingData({
        liftValues: {
          classic: read("classic"),
          variation: read("variation"),
          squat: read("squat"),
          press: read("press"),
        },
        accuracy: accuracy ?? "Estimated",
      }),
    );
    setReady(true);
  }, [stats, accuracy, dispatch, ready, profileQ.isLoading]);

  // A lift counts as verified when it is live on the board and not in review.
  const verified: Record<string, number> = {};
  for (const l of liftsQ.data?.lifts ?? []) {
    if (l.status !== "live" || l.pendingReview) continue;
    const k = l.liftType === "cleanjerk" ? "clean_jerk" : "snatch";
    verified[k] = Math.max(verified[k] ?? 0, l.weightKg);
  }
  const hasVerified = Object.keys(verified).length > 0;

  const onSave = async () => {
    const lv = onboardingData?.liftValues;
    if (!lv) return;

    const stat = (n: any) => {
      const v = Number(n);
      const value = Number.isFinite(v) && v > 0 ? v : 0;
      return { value, checked: value > 0 };
    };

    const build = (section: keyof typeof ORDER) => {
      const out: Record<string, any> = {};
      ORDER[section].forEach((key, i) => {
        // never write a verified Olympic lift
        if (section === "classic" && verified[key] != null) return;
        out[key] = stat(lv?.[section]?.[i]);
      });
      return out;
    };

    const classic = build("classic");
    const payload: Record<string, any> = {
      strength_stats: {
        ...(Object.keys(classic).length ? { classic } : {}),
        variation: build("variation"),
        squat: build("squat"),
        press: build("press"),
      },
    };
    if (onboardingData?.accuracy) {
      payload.strength_accuracy = onboardingData.accuracy;
    }

    try {
      await submitProfile(payload as any).unwrap();
      Alert.alert("Saved", "Your records are up to date.");
    } catch (e: any) {
      Alert.alert(
        "Could not save",
        e?.data?.message ?? "Something went wrong. Try again.",
      );
    }
  };

  const loading = profileQ.isLoading || liftsQ.isLoading;

  return (
    <OlyScreenWrapper padded={false}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={olySpacing[8]}
          style={styles.navBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={olyColors.text.secondary as string}
          />
        </Pressable>
        <Text style={styles.navTitle}>PERSONAL RECORDS</Text>
        <View style={styles.navBtn} />
      </View>

      {loading || !ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={olyPalette.white} />
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2}>
              Current strength
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
              Fix anything you mistyped during onboarding.
            </Text>
          </View>

          {hasVerified ? (
            <View style={styles.lockNote}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={olyPalette.primary}
              />
              <Text style={styles.lockNoteText}>
                {Object.entries(verified)
                  .map(
                    ([k, v]) =>
                      `${k === "snatch" ? "Snatch" : "Clean & Jerk"} ${v}kg`,
                  )
                  .join(" · ")}{" "}
                is verified and stays as it is. Post a new video to change it.
              </Text>
            </View>
          ) : null}

          <OnboardingScreen2 mode="settings" />

          <View style={styles.saveBar}>
            <OlyButton
              label="SAVE CHANGES"
              variant="primary"
              onPress={onSave}
              loading={submitState.isLoading}
              fullWidth
            />
          </View>
        </View>
      )}
    </OlyScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    minHeight: olyLayout.navBarHeight,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  body: {
    flex: 1,
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[16],
  },
  titleBlock: { marginBottom: olySpacing[16] },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  lockNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: olySpacing[8],
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.lg,
    padding: olySpacing[12],
    marginBottom: olySpacing[16],
  },
  lockNoteText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    flex: 1,
  },
  saveBar: { paddingTop: olySpacing[12], paddingBottom: olySpacing[24] },
});
