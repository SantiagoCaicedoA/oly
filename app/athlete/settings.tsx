/**
 * Settings — account and preferences.
 *
 * Reached from My Profile (top right). This is the single place a user
 * corrects anything they entered during onboarding.
 *
 * Rows whose screens are not built yet are marked "Soon" and do not
 * navigate, so nothing dead-links while we build them out.
 */

import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { OlySettingsRow } from "@/src/oly-components/molecules/OlySettingsRow";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import { api, useDeleteAccountMutation } from "@/store/api";
import { logout } from "@/store/reducer/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

type SettingsRowDef = {
  label: string;
  icon: string;
  /** Route to push. Omit while the screen does not exist yet. */
  route?: string;
  /** Short hint shown on the right. */
  hint?: string;
};

// Account rows. Every one of these corrects something from onboarding.
const ACCOUNT_ROWS: SettingsRowDef[] = [
  {
    label: "Profile",
    icon: "person-outline",
    route: "/athlete/settings-user-info",
  },
  {
    label: "Competition",
    icon: "podium-outline",
    route: "/athlete/settings-competition",
  },
  {
    label: "Personal records",
    icon: "barbell-outline",
    route: "/athlete/settings-personal-bests",
  },
  { label: "Notifications", icon: "notifications-outline", hint: "Soon" },
  { label: "Privacy", icon: "lock-closed-outline", hint: "Soon" },
];

export default function Settings() {
  const dispatch = useDispatch();
  const [deleteAccount, deleteState] = useDeleteAccountMutation();

  const onLogout = () => {
    Alert.alert("Log out", "You'll need to sign in again.", [
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
    Alert.alert(
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
            Alert.alert(
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
                      Alert.alert(
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
      {/* nav */}
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

        <Text style={styles.navTitle}>SETTINGS</Text>

        {/* spacer keeps the title optically centred */}
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          {ACCOUNT_ROWS.map((row, i) => (
            <View key={row.label}>
              {i > 0 ? <View style={styles.divider} /> : null}
              <OlySettingsRow
                label={row.label}
                icon={row.icon}
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
            icon="log-out-outline"
            showChevron={false}
            onPress={onLogout}
          />
          <View style={styles.divider} />
          <OlySettingsRow
            label={deleteState.isLoading ? "Deleting…" : "Delete account"}
            icon="trash-outline"
            showChevron={false}
            onPress={deleteState.isLoading ? undefined : onDeleteAccount}
            style={styles.destructiveRow}
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
  scroll: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[24],
    paddingBottom: olySpacing[40],
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olyLayout.sectionHeaderGap,
  },
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
    marginBottom: olySpacing[24],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: olyColors.border.default,
  },
  destructiveRow: { opacity: 1 },
  rowDisabled: {
    opacity: 0.55,
  },
  footnote: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    paddingHorizontal: olySpacing[4],
  },
});
