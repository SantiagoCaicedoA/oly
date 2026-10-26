/**
 * Competition (settings) — wrapper around the onboarding competition
 * screen, same approach as Personal records.
 *
 * Seeds the onboarding slice from the server, renders OnboardingScreen6
 * in settings mode, and pushes the result back as a partial update.
 * The picked meet arrives as competition_name plus the date fields, so
 * the payload is unchanged. Sex and bodyweight are seeded only so the
 * screen can show the weight class; they are not sent from here.
 *
 * weight_class matters beyond prep: it is the class shown against a
 * provisional board entry, so a wrong value here puts an athlete on the
 * wrong board until a verified lift sets it from real bodyweight.
 */

import { olyAlert } from "@/src/oly-components/feedback/OlyAlert";
import OnboardingScreen6 from "@/app/auth/onboarding/onboarding-screen6";
import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
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
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(160);

  const p = profileQ.data?.data?.profile;
  const comp = p?.competition;

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
        sex: p?.sex ?? "",
        weight: p?.bodyweight_value != null ? String(p.bodyweight_value) : "",
        weightUnit: p?.bodyweight_unit === "lbs" ? "LB" : "KG",
      }),
    );
    setReady(true);
  }, [profileQ.data, p, comp, dispatch]);

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
          target_total: d.target_total ? parseFloat(d.target_total) : undefined,
        }
      : { preparing: false };

    try {
      await submitProfile({ competition } as any).unwrap();
      olyAlert("Saved", "Competition details updated.");
    } catch (e: any) {
      olyAlert(
        "Could not save",
        e?.data?.message ?? "Something went wrong. Try again.",
      );
    }
  };

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
        <Text style={styles.navTitle}>COMPETITION</Text>
        <View style={styles.navSpacer} />
      </View>
      {!(profileQ.isLoading || !ready) && (
      <View style={styles.titleBlock}>
        <Text style={styles.title} maxFontSizeMultiplier={1.2}>
          Your next meet
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
          Countdown, weight class and what the day pays.
        </Text>
      </View>
      )}
      </OlyFloatingHeader>

      {profileQ.isLoading || !ready ? (
        <View style={[styles.loading, { paddingTop: headerH }]}>
          <ActivityIndicator color={olyPalette.white} />
        </View>
      ) : (
        <View style={styles.body}>
          <OnboardingScreen6 mode="settings" topInset={headerH} />

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
  title: {
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
