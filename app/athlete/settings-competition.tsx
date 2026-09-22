/**
 * Competition (settings) — wrapper around the onboarding competition
 * screen, same approach as Personal records.
 *
 * Seeds the onboarding slice from the server, renders OnboardingScreen6
 * in settings mode, and pushes the result back as a partial update.
 *
 * weight_class matters beyond prep: it is the class shown against a
 * provisional board entry, so a wrong value here puts an athlete on the
 * wrong board until a verified lift sets it from real bodyweight.
 */

import OnboardingScreen6 from "@/app/auth/onboarding/onboarding-screen6";
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

export default function SettingsCompetition() {
  const dispatch = useDispatch();
  const profileQ = useGetProfileQuery();
  const [submitProfile, submitState] = useSubmitProfileMutation();
  const onboardingData = useSelector(selectOnboardingData);
  const [ready, setReady] = useState(false);

  const comp = profileQ.data?.data?.profile?.competition;

  // Seed once from the server. ISO 'YYYY-MM-DD' splits into the three
  // picker fields; months are stored unpadded in the slice ("1".."12").
  useEffect(() => {
    if (ready || !profileQ.data) return;

    let compYear = "";
    let compMonth = "";
    let compDay = "";
    const iso = typeof comp?.date === "string" ? comp.date : "";
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      compYear = m[1];
      compMonth = String(Number(m[2]));
      compDay = String(Number(m[3]));
    }

    dispatch(
      saveOnboardingData({
        preparing_for_competition: !!comp?.preparing,
        competition_name: comp?.name ?? "",
        compYear,
        compMonth,
        compDay,
        weight_class: comp?.weight_class ?? "",
        target_total:
          comp?.target_total != null ? String(comp.target_total) : "",
      }),
    );
    setReady(true);
  }, [profileQ.data, comp, dispatch]);

  const onSave = async () => {
    const d = onboardingData ?? {};

    const competition = d.preparing_for_competition
      ? {
          preparing: true,
          name: d.competition_name ?? "",
          date:
            d.compYear && d.compMonth && d.compDay
              ? `${d.compYear}-${String(d.compMonth).padStart(2, "0")}-${String(
                  d.compDay,
                ).padStart(2, "0")}`
              : undefined,
          weight_class: d.weight_class || undefined,
          target_total: d.target_total
            ? parseFloat(d.target_total)
            : undefined,
        }
      : { preparing: false };

    try {
      await submitProfile({ competition } as any).unwrap();
      Alert.alert("Saved", "Competition details updated.");
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
        <Text style={styles.navTitle}>COMPETITION</Text>
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
              Competition
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
              Your weight class decides which board you appear on.
            </Text>
          </View>

          <OnboardingScreen6 mode="settings" />

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
