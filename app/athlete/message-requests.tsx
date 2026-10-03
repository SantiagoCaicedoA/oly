import { OlyIcon } from "@/components/icons/OlyIcon";
import { RequestCard } from "@/src/oly-components/messages/RequestCard";
import { useRequests } from "@/src/oly-mock/messages";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Message requests as their own screen, for deep links (e.g. a push
 * notification). In the app, requests live in the inbox's Requests tab.
 * DATA IS MOCK (src/oly-mock/messages.ts).
 */
export default function MessageRequests() {
  const requests = useRequests();
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <OlyIcon name="back" size={24} color={olyColors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Requests</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{"No requests. You're all caught up."}</Text>}
        renderItem={({ item }) => <RequestCard r={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
    paddingLeft: olySpacing[4],
    paddingVertical: 6,
  },
  iconBtn: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: olyFonts.medium, fontSize: 20, lineHeight: 26, color: olyColors.text.primary },
  list: { paddingHorizontal: olyLayout.screenPadding, paddingTop: olySpacing[8], paddingBottom: olySpacing[32] },
  empty: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    marginTop: olySpacing[40],
  },
});
