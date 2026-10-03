/**
 * OlyAlert — Oly's own confirm / alert dialog, replacing the white system
 * Alert.alert everywhere.
 *
 * Same call shape as Alert.alert:
 *   olyAlert("Discard this post?", "Your video won't be saved.", [
 *     { text: "Keep editing", style: "cancel" },
 *     { text: "Discard", style: "destructive", onPress: () => ... },
 *   ]);
 *
 * Mount <OlyAlertHost /> once at the app root. One dialog at a time; a new
 * call replaces whatever is showing.
 *
 * Look: level 1 card, radius 12, title + message, pill buttons. Cancel is
 * the quiet level 2 pill, destructive is the red fill, anything else is the
 * brand fill. Two buttons sit side by side, three or more stack.
 */
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type OlyAlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type AlertState = { title: string; message?: string; buttons: OlyAlertButton[] } | null;

let show: ((s: AlertState) => void) | null = null;

export function olyAlert(title: string, message?: string, buttons?: OlyAlertButton[]) {
  const list = buttons && buttons.length ? buttons : [{ text: "OK" }];
  if (!show) {
    // Host not mounted (should not happen): fail safe by running nothing.
    console.warn("OlyAlertHost is not mounted");
    return;
  }
  if (list.some((b) => b.style === "destructive")) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }
  show({ title, message, buttons: list });
}

export function OlyAlertHost() {
  const [state, setState] = useState<AlertState>(null);

  useEffect(() => {
    show = setState;
    return () => {
      show = null;
    };
  }, []);

  const close = (b?: OlyAlertButton) => {
    setState(null);
    // Run after the dialog is gone so a follow-up navigation or alert works.
    if (b?.onPress) setTimeout(b.onPress, 180);
  };

  const cancelBtn = state?.buttons.find((b) => b.style === "cancel");
  const row = (state?.buttons.length ?? 0) <= 2;
  /* Cancel sits first (left, or top when stacked), like iOS. */
  const ordered = state
    ? [...state.buttons].sort((a, b) => (a.style === "cancel" ? -1 : b.style === "cancel" ? 1 : 0))
    : [];

  return (
    <Modal
      visible={!!state}
      transparent
      animationType="fade"
      onRequestClose={() => close(cancelBtn)}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => cancelBtn && close(cancelBtn)}
        accessibilityLabel="Dismiss"
      >
        <Pressable style={styles.card} onPress={() => {}} accessibilityRole="alert">
          <Text style={styles.title}>{state?.title}</Text>
          {!!state?.message && <Text style={styles.message}>{state.message}</Text>}
          <View style={[styles.buttons, row ? styles.buttonsRow : styles.buttonsCol]}>
            {ordered.map((b) => {
              const kind = b.style ?? "default";
              return (
                <Pressable
                  key={b.text}
                  onPress={() => close(b)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.btn,
                    row && styles.btnFlex,
                    kind === "cancel" && styles.btnCancel,
                    kind === "destructive" && styles.btnDestructive,
                    kind === "default" && styles.btnDefault,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.btnText, kind === "cancel" && styles.btnTextCancel]}>
                    {b.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: olyColors.bg.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: olySpacing[32],
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: olyColors.border.hairline,
    padding: olySpacing[20],
  },
  title: {
    ...olyTypography.body,
    fontFamily: olyFonts.bold,
    fontSize: 18,
    lineHeight: 22,
    color: olyColors.text.primary,
  },
  message: {
    ...olyTypography.bodySmall,
    lineHeight: 20,
    color: olyColors.text.secondary,
    marginTop: olySpacing[8],
  },
  buttons: { marginTop: olySpacing[20], gap: olySpacing[8] },
  buttonsRow: { flexDirection: "row" },
  buttonsCol: { flexDirection: "column" },
  btn: {
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  btnFlex: { flex: 1 },
  btnCancel: { backgroundColor: olyPalette.cardElevated },
  btnDestructive: { backgroundColor: olyColors.button.destructive.bg },
  btnDefault: { backgroundColor: olyColors.button.primary.bg },
  btnText: { ...olyTypography.label, color: olyColors.text.onAccent },
  btnTextCancel: { color: olyColors.text.primary },
});
