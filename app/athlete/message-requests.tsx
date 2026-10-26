import { OlyIcon } from "@/components/icons/OlyIcon";
import { RequestCard } from "@/src/oly-components/messages/RequestCard";
import { Glows } from "@/src/oly-components/shop/ShopKit";
import { useRequests } from "@/src/oly-mock/messages";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OlyScreenHeader } from "@/src/oly-components/organisms/OlyScreenHeader";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";

/**
 * Message requests as their own screen, for deep links (e.g. a push
 * notification). In the app, requests live in the inbox's Requests tab.
 * DATA IS MOCK (src/oly-mock/messages.ts).
 */
export default function MessageRequests() {
  const requests = useRequests();
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(110);
  return (
    <View style={styles.root}>
    <Glows variant="shop" />
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <OlyFloatingHeader onLayout={onHeaderLayout}>
      <OlyScreenHeader title="Requests" onBack={() => router.back()} />
      </OlyFloatingHeader>
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        contentContainerStyle={[styles.list, { paddingTop: headerH + olySpacing[8] }]}
        scrollIndicatorInsets={{ top: headerH }}
        ListEmptyComponent={<Text style={styles.empty}>{"No requests. You're all caught up."}</Text>}
        renderItem={({ item }) => <RequestCard r={item} />}
      />
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: olyColors.bg.page },
  screen: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...olyTypography.title1, fontFamily: olyFonts.bold, color: olyColors.text.primary },
  list: { paddingHorizontal: olyLayout.screenPadding, paddingBottom: olySpacing[32] },
  empty: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    marginTop: olySpacing[40],
  },
});
