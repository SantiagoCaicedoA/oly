/**
 * RequestCard — one message request: who, their board context, the
 * message, then Delete / Accept (44 tall). Block / Report sits behind the
 * "..." in the corner, far from the main buttons.
 */
import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyAlert } from "@/src/oly-components/feedback/OlyAlert";
import {
  acceptRequest,
  initials,
  removeRequest,
  type Request,
} from "@/src/oly-mock/messages";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export function RequestCard({ r }: { r: Request }) {
  const accept = () => {
    const id = acceptRequest(r.id);
    if (id) router.push({ pathname: "/athlete/chat", params: { id } });
  };

  const more = () =>
    olyAlert(r.name, undefined, [
      { text: "Block", style: "destructive", onPress: () => removeRequest(r.id) },
      { text: "Report", style: "destructive", onPress: () => removeRequest(r.id) },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(r.name)}</Text>
        </View>
        <View style={styles.headText}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {r.name}
            </Text>
            <Text style={styles.time}>{r.time}</Text>
          </View>
          <View style={styles.contextRow}>
            {r.ranked && <OlyIcon name="rank" size={12} filled color={olyColors.text.secondary} />}
            <Text style={styles.context} numberOfLines={1}>
              {r.context}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={more}
          style={styles.more}
          accessibilityRole="button"
          accessibilityLabel="Block or report"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Circle cx={5} cy={12} r={1.7} fill={olyColors.text.secondary} />
            <Circle cx={12} cy={12} r={1.7} fill={olyColors.text.secondary} />
            <Circle cx={19} cy={12} r={1.7} fill={olyColors.text.secondary} />
          </Svg>
        </Pressable>
      </View>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{r.text}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => removeRequest(r.id)}
          style={({ pressed }) => [styles.btn, styles.btnQuiet, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Delete</Text>
        </Pressable>
        <Pressable
          onPress={accept}
          style={({ pressed }) => [styles.btn, styles.btnBrand, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={[styles.btnText, styles.btnTextBrand]}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olySpacing[16],
    marginBottom: olySpacing[12],
  },
  head: { flexDirection: "row", alignItems: "center", gap: olySpacing[12] },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...olyTypography.label, color: olyColors.text.secondary },
  headText: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "baseline", gap: olySpacing[8] },
  name: { ...olyTypography.body, fontFamily: olyFonts.bold, color: olyColors.text.primary, flex: 1 },
  time: { ...olyTypography.caption, color: olyColors.text.disabled },
  contextRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  context: { ...olyTypography.caption, color: olyColors.text.secondary, flexShrink: 1 },
  more: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    marginVertical: -10,
    marginRight: -12,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    marginTop: olySpacing[12],
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: olyPalette.cardElevated,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
  },
  bubbleText: { ...olyTypography.bodySmall, lineHeight: 20, color: olyColors.text.primary },
  actions: { flexDirection: "row", gap: olySpacing[12], marginTop: olySpacing[16] },
  btn: {
    flex: 1,
    minHeight: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  btnQuiet: { backgroundColor: olyPalette.cardElevated },
  btnBrand: { backgroundColor: olyPalette.primary },
  pressed: { opacity: 0.8 },
  btnText: { ...olyTypography.label, color: olyColors.text.primary },
  btnTextBrand: { color: olyColors.text.onAccent },
});
