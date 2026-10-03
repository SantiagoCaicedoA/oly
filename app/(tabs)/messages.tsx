import { OlyIcon } from "@/components/icons/OlyIcon";
import { RequestCard } from "@/src/oly-components/messages/RequestCard";
import {
  initials,
  previewOf,
  useRequests,
  useThreads,
  type Thread,
} from "@/src/oly-mock/messages";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

/**
 * Messages inbox.
 *
 * Design: canvas "Messages / Inbox". Requests row, then conversations,
 * newest first. A conversation whose last message is a lift shows a small
 * play mark before its preview.
 *
 * DATA IS MOCK (src/oly-mock/messages.ts) until the messaging backend
 * exists. Requests is a static row for the same reason.
 */
export default function MessagesScreen() {
  const threads = useThreads();
  const requests = useRequests();
  const [tab, setTab] = useState<"chats" | "requests">("chats");

  const open = (t: Thread) =>
    router.push({ pathname: "/athlete/chat", params: { id: t.id } });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Pressable
          onPress={() => router.push("/athlete/new-message")}
          style={styles.compose}
          accessibilityRole="button"
          accessibilityLabel="New message"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"
              fill="none"
              stroke={olyColors.text.primary}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>

      {/* Chats | Requests. Underline tabs: quiet, and requests stay one tap away. */}
      <View style={styles.tabs}>
        {(["chats", "requests"] as const).map((t) => {
          const on = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, on && styles.tabOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>
                {t === "chats" ? "Chats" : "Requests"}
              </Text>
              {t === "requests" && requests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{requests.length}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {tab === "requests" ? (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.reqList}
          ListHeaderComponent={
            requests.length ? (
              <Text style={styles.reqIntro}>
                {"From people you don't follow. They won't know you've seen it until you accept."}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <OlyIcon name="messages" size={28} color={olyColors.text.disabled} />
              <Text style={styles.emptyTitle}>No requests</Text>
              <Text style={styles.emptyText}>{"You're all caught up."}</Text>
            </View>
          }
          ListFooterComponent={
            <Text style={styles.reqFooter}>Choose who can message you in Settings · Privacy</Text>
          }
          renderItem={({ item }) => <RequestCard r={item} />}
        />
      ) : (
      <FlatList
        data={threads}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: t }) => {
          const p = previewOf(t);
          const tint = t.unread ? olyColors.text.primary : olyColors.text.secondary;
          return (
            <Pressable
              onPress={() => open(t)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel={`${t.name}, ${p.text}`}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(t.name)}</Text>
              </View>
              <View style={styles.rowMain}>
                <View style={styles.rowTop}>
                  <Text
                    style={[styles.name, t.unread && styles.nameUnread]}
                    numberOfLines={1}
                  >
                    {t.name}
                  </Text>
                  <Text style={styles.time}>{t.time}</Text>
                </View>
                <View style={styles.rowBottom}>
                  {p.isLift && <OlyIcon name="play" size={12} color={tint} />}
                  <Text style={[styles.preview, { color: tint }]} numberOfLines={1}>
                    {p.text}
                  </Text>
                  {t.unread && <View style={styles.dot} />}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
  },
  title: { ...olyTypography.title1, color: olyColors.text.primary, flex: 1 },
  compose: {
    width: 38,
    height: 38,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingBottom: olySpacing[24] },
  tabs: {
    flexDirection: "row",
    gap: olySpacing[24],
    marginHorizontal: olyLayout.screenPadding,
    marginBottom: olySpacing[8],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: olyColors.border.hairline,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: olyLayout.minTouchTarget,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabOn: { borderBottomColor: olyColors.text.primary },
  tabText: { ...olyTypography.label, color: olyColors.text.secondary },
  tabTextOn: { color: olyColors.text.primary },
  reqList: { paddingHorizontal: olyLayout.screenPadding, paddingBottom: olySpacing[32] },
  reqIntro: {
    ...olyTypography.bodySmall,
    lineHeight: 20,
    color: olyColors.text.secondary,
    marginTop: olySpacing[8],
    marginBottom: olySpacing[16],
  },
  reqFooter: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    textAlign: "center",
    marginTop: olySpacing[16],
  },
  empty: { alignItems: "center", gap: olySpacing[8], paddingTop: olySpacing[40] },
  emptyTitle: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  emptyText: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.bold,
    color: olyColors.text.onAccent,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[12],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: "row", alignItems: "baseline", gap: olySpacing[8] },
  name: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    flex: 1,
  },
  nameUnread: { fontFamily: olyFonts.bold },
  time: { ...olyTypography.caption, color: olyColors.text.disabled },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  preview: { ...olyTypography.bodySmall, flex: 1 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
  },
});
