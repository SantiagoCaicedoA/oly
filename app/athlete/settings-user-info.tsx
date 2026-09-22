/**
 * Profile (settings) — wrapper around the onboarding identity screen.
 *
 * Same approach as Personal records and Competition: seed the onboarding
 * slice from the server, render OnboardingScreen1 in settings mode, push
 * the result back as a partial update.
 *
 * Date of birth does not round-trip. The backend keeps birth_year and a
 * derived age, not a full date, because IWF age categories work off birth
 * year. In settings mode screen1 therefore asks for the year only.
 */

import OnboardingScreen1 from "@/app/auth/onboarding/onboarding-screen1";
import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import { useGetProfileQuery, useSubmitProfileMutation } from "@/store/api";
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

// Mirrors screen8's experienceMap, inverted.
const EXPERIENCE_TO_YEARS: Record<string, number> = {
  new: 0,
  developing: 1,
  experienced: 4,
  competitive: 6,
};
const yearsToExposure = (y: number | undefined) => {
  if (y == null) return "";
  if (y >= 6) return "competitive";
  if (y >= 4) return "experienced";
  if (y >= 1) return "developing";
  return "new";
};

export default function SettingsUserInfo() {
  const dispatch = useDispatch();
  const profileQ = useGetProfileQuery();
  const [submitProfile, submitState] = useSubmitProfileMutation();
  const onboardingData = useSelector(selectOnboardingData);
  const [ready, setReady] = useState(false);

  const user = profileQ.data?.data;
  const p = user?.profile;

  useEffect(() => {
    if (ready || !user) return;

    dispatch(
      saveOnboardingData({
        name: p?.display_name ?? "",
        user_name: user?.username ?? "",
        country: p?.country ?? "",
        sex: p?.sex ?? "",
        dobYear: p?.birth_year != null ? String(p.birth_year) : "",
        // day and month are not stored; settings edits the year only
        dobDay: "",
        dobMonth: "",
        weight: p?.bodyweight_value != null ? String(p.bodyweight_value) : "",
        weightUnit: p?.bodyweight_unit === "lbs" ? "LB" : "KG",
        height: p?.height_cm != null ? String(p.height_cm) : "",
        height_unit: "cm",
        weightliftingExposure: yearsToExposure(p?.experience_years),
      }),
    );
    setReady(true);
  }, [user, p, dispatch]);

  const onSave = async () => {
    const d = onboardingData ?? {};

    const birthYear = d.dobYear ? parseInt(String(d.dobYear), 10) : undefined;
    const age =
      birthYear && Number.isFinite(birthYear)
        ? new Date().getFullYear() - birthYear
        : undefined;

    const payload: Record<string, any> = {
      display_name: d.name || undefined,
      user_name: d.user_name || undefined,
      country: d.country || undefined,
      sex: d.sex || undefined,
      birth_year: birthYear,
      age,
      height_cm: d.height ? parseFloat(d.height) : undefined,
      bodyweight_value: d.weight ? parseFloat(d.weight) : undefined,
      bodyweight_unit: d.weightUnit === "LB" ? "lbs" : "kg",
      preferred_unit: d.weightUnit === "LB" ? "imperial" : "metric",
      experience_years:
        EXPERIENCE_TO_YEARS[d.weightliftingExposure] ?? undefined,
    };
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );

    try {
      await submitProfile(payload as any).unwrap();
      Alert.alert("Saved", "Your profile is up to date.");
    } catch (e: any) {
      Alert.alert(
        "Could not save",
        e?.data?.message ?? "Something went wrong. Try again.",
      );
    }
  };

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
        <Text style={styles.navTitle}>PROFILE</Text>
        <View style={styles.navBtn} />
      </View>

      {profileQ.isLoading || !ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={olyPalette.white} />
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2}>
              Your details
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
              Bodyweight and country decide where you sit on the board.
            </Text>
          </View>

          <OnboardingScreen1 mode="settings" />

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
  saveBar: { paddingTop: olySpacing[12], paddingBottom: olySpacing[24] },
});
