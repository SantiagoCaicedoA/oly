import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Marketplace — PLACEHOLDER.
 *
 * The tab exists so the bar has its final shape. The plan: the app is the
 * wallet, points come mostly from verified lifts, and they are spent on the
 * Oly Shopify store as discount codes or store credit. None of that is
 * built yet.
 */
export default function MarketplaceScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
      </View>
      <View style={styles.state}>
        <OlyIcon name="shop" size={32} color={olyColors.text.disabled} />
        <Text style={styles.stateTitle}>The Oly shop is coming</Text>
        <Text style={styles.stateBody}>
          Earn points from verified lifts and spend them on Oly gear.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  header: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
  },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
    paddingHorizontal: olySpacing[32],
    paddingBottom: olySpacing[40],
  },
  stateTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    marginTop: olySpacing[4],
  },
  stateBody: {
    ...olyTypography.bodySmall,
    lineHeight: 20,
    color: olyColors.text.secondary,
    textAlign: "center",
  },
});
