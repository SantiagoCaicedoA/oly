import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyTypography, olyFonts } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Messages — PLACEHOLDER.
 *
 * The tab exists so the bar has its final shape. The feature does not.
 * There is no messages endpoint in `store/api.ts` and no thread model
 * on the backend. Building this screen means building direct messages:
 * threads, participants, read state, and push.
 *
 * When that lands, replace this file. The empty state below is the
 * design system's States / EmptyState, so the shape is already right.
 */
export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.state}>
        <OlyIcon name="messages" size={32} color={olyColors.text.disabled} />
        <Text style={styles.stateTitle}>Messages are coming</Text>
        <Text style={styles.stateBody}>
          Talk to the athletes you follow without leaving Oly.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  header: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[12],
    justifyContent: "center",
    minHeight: olyLayout.navBarHeight,
  },
  title: { ...olyTypography.number, color: olyColors.text.primary },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: olySpacing[32],
    gap: olySpacing[8],
  },
  stateTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    marginTop: olySpacing[8],
  },
  stateBody: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
  },
});
