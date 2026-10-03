import {
  FOLLOWING,
  initials,
  threadFor,
  useThreads,
  type Person,
} from "@/src/oly-mock/messages";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyLetterSpacing, olyTypography } from "@/src/oly-theme/oly-typography";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

/**
 * New message: pick who to write to.
 *
 * Design: canvas "Messages / New message". Search, a Recent row of
 * avatars, then the people you follow with their rank. Tapping anyone
 * opens (or starts) the conversation.
 *
 * DATA IS MOCK (src/oly-mock/messages.ts).
 */
export default function NewMessage() {
  const threads = useThreads();
  const [q, setQ] = useState("");

  const recent = useMemo(
    () =>
      threads
        .filter((t) => t.messages.length > 0)
        .slice(0, 5)
        .map((t) => ({ id: t.id, name: t.name, handle: t.handle, club: t.club }) as Person),
    [threads],
  );

  const people = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FOLLOWING;
    return FOLLOWING.filter(
      (p) => p.name.toLowerCase().includes(s) || p.handle.toLowerCase().includes(s),
    );
  }, [q]);

  const open = (p: Person) => {
    const id = threadFor(p);
    router.replace({ pathname: "/athlete/chat", params: { id } });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>New message</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.search}>
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke={olyColors.text.secondary} strokeWidth={1.8} />
          <Path d="M15.5 15.5 21 21" stroke={olyColors.text.secondary} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search athletes"
          placeholderTextColor={olyColors.text.disabled}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={people}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          !q && recent.length > 0 ? (
            <View>
              <Text style={styles.section}>RECENT</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentRow}
              >
                {recent.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => open(p)}
                    style={styles.recentItem}
                    accessibilityRole="button"
                    accessibilityLabel={p.name}
                  >
                    <View style={styles.recentAvatar}>
                      <Text style={styles.recentInitials}>{initials(p.name)}</Text>
                    </View>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {p.name.split(" ")[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.section}>PEOPLE YOU FOLLOW</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<Text style={styles.empty}>{`No athletes match "${q}"`}</Text>}
        renderItem={({ item: p }) => (
          <Pressable
            onPress={() => open(p)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(p.name)}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.sub} numberOfLines={1}>
                @{p.handle} · {p.club}
              </Text>
            </View>
            {!!p.rank && <Text style={styles.rank}>{p.rank}</Text>}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[12],
  },
  cancel: { ...olyTypography.body, color: olyColors.text.secondary },
  title: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  spacer: { width: 52 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: olyLayout.screenPadding,
    marginTop: olySpacing[4],
    marginBottom: olySpacing[20],
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
  },
  searchInput: { ...olyTypography.body, flex: 1, color: olyColors.text.primary },
  section: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    paddingHorizontal: olyLayout.screenPadding,
    marginBottom: olySpacing[8],
  },
  recentRow: { gap: olySpacing[16], paddingHorizontal: olyLayout.screenPadding, paddingBottom: olySpacing[20] },
  recentItem: { width: 64, alignItems: "center", gap: 6 },
  recentAvatar: {
    width: 56,
    height: 56,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  recentInitials: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  recentName: { ...olyTypography.caption, color: olyColors.text.secondary },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...olyTypography.label, color: olyColors.text.secondary },
  rowText: { flex: 1, minWidth: 0 },
  name: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  sub: { ...olyTypography.caption, color: olyColors.text.secondary },
  rank: { ...olyTypography.caption, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  empty: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    marginTop: olySpacing[32],
  },
});
