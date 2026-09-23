import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyTypography, olyFonts } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Search — PLACEHOLDER.
 *
 * The tab exists so the bar has its final shape. The feature does not.
 * There is no search endpoint in `store/api.ts`. Building this screen
 * needs at minimum a user lookup, and probably a lift lookup too.
 *
 * When that lands, replace this file. The empty state below is the
 * design system's States / EmptyState, so the shape is already right.
 */
export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>
      <View style={styles.state}>
        <OlyIcon name="search" size={32} color={olyColors.text.disabled} />
        <Text style={styles.stateTitle}>Search is coming</Text>
        <Text style={styles.stateBody}>
          Find athletes, clubs and lifts across the whole board.
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
