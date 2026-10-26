import { OlyIcon } from "@/components/icons/OlyIcon";
import { RequestCard } from "@/src/oly-components/messages/RequestCard";
import {
  initials,
  previewOf,
  useRequests,
  useThreads,
  type Thread,
} from "@/src/oly-mock/messages";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { Glass, Glows, kit } from "@/src/oly-components/shop/ShopKit";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
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
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(150);

  const open = (t: Thread) =>
    router.push({ pathname: "/athlete/chat", params: { id: t.id } });

  return (
    <View style={styles.root}>
    <Glows variant="shop" />
    <View style={styles.screen}>
      {/* Title + tabs float over the list, with a fade behind. */}
      <OlyFloatingHeader onLayout={onHeaderLayout}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Pressable hitSlop={4}
          onPress={() => router.push("/athlete/new-message")}
          style={({ pressed }) => pressed && kit.pressed}
          accessibilityRole="button"
          accessibilityLabel="New message"
        >
          <Glass radius={olyRadius.full} style={styles.compose}>
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
          </Glass>
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
      </OlyFloatingHeader>

      {tab === "requests" ? (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={[styles.reqList, { paddingTop: headerH }]}
          scrollIndicatorInsets={{ top: headerH }}
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
        contentContainerStyle={[styles.list, { paddingTop: headerH }]}
        scrollIndicatorInsets={{ top: headerH }}
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
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: olyColors.bg.page },
  screen: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
  },
  title: { ...olyTypography.title1, fontFamily: olyFonts.bold, color: olyColors.text.primary, flex: 1 },
  compose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingBottom: 120 },
  tabs: {
    flexDirection: "row",
    gap: olySpacing[24],
    marginHorizontal: olyLayout.screenPadding,
    marginBottom: olySpacing[8],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: olyColors.glass.rule,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: olyLayout.minTouchTarget,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabOn: { borderBottomColor: olyColors.glass.glow },
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
    ...olyGlow.md,
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
    backgroundColor: olyColors.glass.raised,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
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
    ...olyGlow.sm,
  },
});
