/**
 * Settings — account and preferences.
 *
 * Reached from My Profile (top right). This is the single place a user
 * corrects anything they entered during onboarding.
 *
 * Rows whose screens are not built yet are marked "Soon" and do not
 * navigate, so nothing dead-links while we build them out.
 */

import { olyAlert } from "@/src/oly-components/feedback/OlyAlert";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { OlyScreenHeader } from "@/src/oly-components/organisms/OlyScreenHeader";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
import { OlySettingsRow } from "@/src/oly-components/molecules/OlySettingsRow";
import type { GlyphName } from "@/src/oly-components/atoms/OlyGlyph";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import { api, useDeleteAccountMutation } from "@/store/api";
import { logout } from "@/store/reducer/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";

type SettingsRowDef = {
  label: string;
  glyph: GlyphName;
  /** Route to push. Omit while the screen does not exist yet. */
  route?: string;
  /** Short hint shown on the right. */
  hint?: string;
};

// Account rows. Every one of these corrects something from onboarding.
const ACCOUNT_ROWS: SettingsRowDef[] = [
  {
    label: "Profile",
    glyph: "person",
    route: "/athlete/settings-user-info",
  },
  {
    label: "Competition",
    glyph: "meet",
    route: "/athlete/settings-competition",
  },
  {
    label: "Personal records",
    // Personal records are what place you on the board, so they wear its icon.
    glyph: "rank",
    route: "/athlete/settings-personal-bests",
  },
  { label: "Notifications", glyph: "bell", route: "/athlete/settings-notifications" },
  { label: "Privacy", glyph: "lock", hint: "Soon" },
];

export default function Settings() {
  const dispatch = useDispatch();
  const [deleteAccount, deleteState] = useDeleteAccountMutation();
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(72);

  const onLogout = () => {
    olyAlert("Log out", "You'll need to sign in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          dispatch(api.util.resetApiState());
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const signOutLocally = () => {
    dispatch(logout());
    dispatch(api.util.resetApiState());
    router.replace("/auth/login");
  };

  // Two steps on purpose. The first explains what survives, the second is
  // the point of no return.
  const onDeleteAccount = () => {
    olyAlert(
      "Delete account",
      "Your name, username, photo and email are removed. Your lifts stay on " +
        "the board as \u201cFormer athlete\u201d so results other lifters " +
        "earned against you remain correct.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () =>
            olyAlert(
              "This cannot be undone",
              "Delete your account permanently?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount().unwrap();
                      signOutLocally();
                    } catch (e: any) {
                      olyAlert(
                        "Could not delete",
                        e?.data?.message ?? "Something went wrong. Try again.",
                      );
                    }
                  },
                },
              ],
            ),
        },
      ],
    );
  };

  return (
    <OlyScreenWrapper padded={false}>
      {/* nav: floats over the list, with a fade behind */}
      <OlyFloatingHeader safeTop={false} onLayout={onHeaderLayout}>
      <OlyScreenHeader title="Settings" onBack={() => router.back()} />
      </OlyFloatingHeader>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: headerH + olySpacing[8] }]}
        scrollIndicatorInsets={{ top: headerH }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          {ACCOUNT_ROWS.map((row, i) => (
            <View key={row.label}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <OlySettingsRow
                label={row.label}
                glyph={row.glyph}
                value={row.hint}
                showChevron={!!row.route}
                onPress={
                  row.route ? () => router.push(row.route as any) : undefined
                }
                style={!row.route ? styles.rowDisabled : undefined}
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <OlySettingsRow
            label="Log out"
            glyph="out"
            showChevron={false}
            onPress={onLogout}
          />
          <View style={styles.divider} />
          <OlySettingsRow
            label={deleteState.isLoading ? "Deleting…" : "Delete account"}
            glyph="trash"
            showChevron={false}
            onPress={deleteState.isLoading ? undefined : onDeleteAccount}
            destructive
          />
        </View>

        <Text style={styles.footnote}>
          Editing a personal record updates your provisional ranking only.
          Verified lifts change when you post a new video.
        </Text>
      </ScrollView>
    </OlyScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  scroll: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[40],
  },
  sectionLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: olySpacing[24],
    marginBottom: olyLayout.sectionHeaderGap,
  },
  card: {
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    borderRadius: olyRadius.tile,
    overflow: "hidden",
    marginBottom: olySpacing[12],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: olyColors.glass.rule,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  footnote: {
    ...olyTypography.caption,
    color: olyColors.text.hint,
    paddingHorizontal: olySpacing[4],
    marginTop: olySpacing[12],
  },
});
