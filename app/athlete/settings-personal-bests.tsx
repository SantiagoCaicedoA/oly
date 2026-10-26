/**
 * Personal records (settings) — the record book. A thin wrapper around
 * the onboarding strength screen in mode="settings", which draws the
 * verified total, the rank and milestone rows and the edit sheet, and
 * writes every edit into the onboarding slice. It does NOT talk to the
 * API, so this wrapper does four things:
 *
 *   1. seeds the slice from the server profile on open
 *   2. tells the screen which lifts are verified or in review, and the
 *      athlete's sex and bodyweight for the board and milestone ladder
 *   3. supplies the nav, title and Save button
 *   4. pushes the edits back as a partial strength_stats update
 *
 * The rank rule still holds. A lift that is already verified by video is
 * skipped when building the payload, so it can never be typed upward.
 */

import { olyAlert } from "@/src/oly-components/feedback/OlyAlert";
import OnboardingScreen2, {
  type RecordBookData,
} from "@/app/auth/onboarding/onboarding-screen2";
import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { Glass } from "@/src/oly-components/shop/ShopKit";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
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
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(160);
  const [helpOpen, setHelpOpen] = useState(false);

  const stats = profileQ.data?.data?.profile?.strength_stats;
  const accuracy = profileQ.data?.data?.profile?.strength_accuracy;

  // 1. Seed the slice from the server, once, so the screen opens on the
  //    saved values rather than whatever onboarding left behind.
  useEffect(() => {
    // gate on the request settling, not on stats existing: a user who
    // never filled this in still needs an empty, editable form.
    if (ready || profileQ.isLoading) return;
    const read = (section: keyof typeof ORDER) =>
      ORDER[section].map(
        (key) => Number(stats?.[section]?.[key]?.value ?? 0) || 0,
      );

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
  const pending: Record<string, number> = {};
  for (const l of liftsQ.data?.lifts ?? []) {
    if (l.status !== "live") continue;
    const k = l.liftType === "cleanjerk" ? "clean_jerk" : "snatch";
    const into = l.pendingReview ? pending : verified;
    into[k] = Math.max(into[k] ?? 0, l.weightKg);
  }

  const profile = profileQ.data?.data?.profile;
  const bw = Number(profile?.bodyweight_value) || 0;
  const records: RecordBookData = {
    verified,
    pending,
    sex: /^f/i.test(profile?.sex ?? "") ? "F" : "M",
    bodyweightKg: profile?.bodyweight_unit === "lbs" ? bw / 2.20462 : bw,
  };

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
      olyAlert("Saved", "Your records are up to date.");
    } catch (e: any) {
      olyAlert(
        "Could not save",
        e?.data?.message ?? "Something went wrong. Try again.",
      );
    }
  };

  const loading = profileQ.isLoading || liftsQ.isLoading;

  return (
    <OlyScreenWrapper padded={false}>
      {/* Nav + title float over the form, with a fade behind. */}
      <OlyFloatingHeader safeTop={false} onLayout={onHeaderLayout}>
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
            size={20}
            color={olyColors.text.primary as string}
          />
        </Pressable>
        <Text style={styles.navTitle}>PERSONAL RECORDS</Text>
        <View style={styles.navSpacer} />
      </View>
      {!(loading || !ready) && (
      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.title} maxFontSizeMultiplier={1.2}>
            Your record book
          </Text>
          <Pressable
            hitSlop={4}
            onPress={() => setHelpOpen(true)}
            style={({ pressed }) => pressed && styles.pressed}
            accessibilityRole="button"
            accessibilityLabel="How milestones work"
          >
            <Glass radius={olyRadius.full} style={styles.helpBtn}>
              <Text style={styles.helpText}>?</Text>
            </Glass>
          </Pressable>
        </View>
        <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
          Tap a number to update it. Verified lifts rank you.
        </Text>
      </View>
      )}
      </OlyFloatingHeader>

      {loading || !ready ? (
        <View style={[styles.loading, { paddingTop: headerH }]}>
          <ActivityIndicator color={olyPalette.white} />
        </View>
      ) : (
        <View style={styles.body}>
          <OnboardingScreen2
            mode="settings"
            topInset={headerH}
            records={records}
            milestonesOpen={helpOpen}
            onCloseMilestones={() => setHelpOpen(false)}
          />

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
    paddingVertical: olySpacing[8],
    minHeight: olyLayout.navBarHeight,
  },
  /* 40pt glass circle; hitSlop 8 takes the target to 56. */
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  navSpacer: { width: 40, height: 40 },
  navTitle: {
    ...olyTypography.label,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  body: {
    flex: 1,
    paddingHorizontal: olyLayout.screenPadding,
  },
  /* Lives in the floating header, so it pads itself. */
  titleBlock: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[16],
    paddingBottom: olySpacing[16],
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[12] },
  pressed: { opacity: 0.7 },
  helpBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  helpText: {
    ...olyTypography.body,
    fontSize: 17,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  title: {
    flex: 1,
    ...olyTypography.title1,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  saveBar: { paddingTop: olySpacing[12], paddingBottom: olySpacing[24] },
});
