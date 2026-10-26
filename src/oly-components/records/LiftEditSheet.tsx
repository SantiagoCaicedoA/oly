/**
 * Edit one record (approach A): the lift name in small caps, the
 * leaderboard chip for Snatch and C&J, one big number with a cursor and a
 * thin blue underline, the "On record" line, one quiet note and two
 * buttons. The sheet decides which case applies:
 *
 *   needs a video  above the class world record, or more than 15 kg over
 *                  the last number. Red number, no save.
 *   locked         under a verified lift. Keep it, or report a mistake.
 *   above verified saves as self-reported, the board spot stays.
 *   self-reported  saves straight away (squats offer a video first).
 *
 * It never talks to the API. onSave hands the new kilos back to the
 * screen, and the screen's Save button sends them.
 */
import { OlyIcon } from "@/components/icons/OlyIcon";
import { useToast } from "@/context/toast-context";
import {
  GlassButton,
  PrimaryButton,
  SHEET_SIDE,
  SheetBackdrop,
  SheetGrabber,
  SheetSurface,
} from "@/src/oly-components/shop/ShopKit";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MAX_JUMP_KG } from "./ladder";

export type RecordKind = "board" | "squat" | "variation";

export interface LiftEditTarget {
  name: string;
  kind: RecordKind;
  /** The value in the form when the sheet opened, kg. */
  currentKg: number;
  /** Verified on the board, kg. */
  verifiedKg?: number;
  /** A higher lift waiting on review, kg. */
  pendingKg?: number;
  /** World record for the class, kg. */
  capKg?: number | null;
  /** "88 kg", for the world record copy. */
  classLabel?: string;
}

type Mode = "same" | "warn" | "lock" | "above" | "free";

export default function LiftEditSheet({
  target,
  onClose,
  onSave,
  onAddVideo,
  unit,
  toDisplay,
  toStorage,
}: {
  target: LiftEditTarget | null;
  onClose: () => void;
  onSave: (kg: number) => void;
  /** Opens the post screen for this number. Nothing is saved until it posts. */
  onAddVideo: (kg: number) => void;
  unit: string;
  toDisplay: (kg: number) => number;
  toStorage: (v: number) => number;
}) {
  const insets = useSafeAreaInsets();
  const { showInfo } = useToast();
  const input = useRef<TextInput>(null);
  const [text, setText] = useState("");
  const blink = useRef(new Animated.Value(1)).current;

  const open = !!target;
  useEffect(() => {
    if (!target) return;
    setText(target.currentKg > 0 ? String(toDisplay(target.currentKg)) : "");
  }, [target, toDisplay]);

  useEffect(() => {
    if (!open) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 0,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [open, blink]);

  if (!target) return null;

  const { name, kind, currentKg, verifiedKg, pendingKg, capKg, classLabel } =
    target;
  const typed = parseInt(text, 10) || 0;
  const kg = toStorage(typed);
  const base = Math.max(currentKg, verifiedKg ?? 0);
  const fmt = (k: number) => `${toDisplay(k)} ${unit}`;

  const mode: Mode =
    (capKg != null && kg > capKg) || (base > 0 && kg - base > MAX_JUMP_KG)
      ? "warn"
      : verifiedKg != null && kg < verifiedKg
        ? "lock"
        : typed === toDisplay(currentKg)
          ? "same"
          : verifiedKg != null && kg > verifiedKg
            ? "above"
            : "free";

  const record =
    verifiedKg != null
      ? `On the board ${fmt(verifiedKg)} · ${pendingKg ? `${fmt(pendingKg)} in review` : "verified"}`
      : pendingKg
        ? `${fmt(pendingKg)} in review`
        : currentKg > 0
          ? `On record ${fmt(currentKg)} · no video`
          : "Nothing on record yet";

  const save = () => {
    onSave(kg);
    onClose();
  };
  const addVideo = () => {
    onClose();
    onAddVideo(kg);
  };
  const changeNumber = () => {
    setText(currentKg > 0 ? String(toDisplay(currentKg)) : "");
    input.current?.focus();
  };
  const report = () => {
    onClose();
    // TODO(api): send the verified lift's video back for review
    showInfo("We'll take another look at that video.", "Thanks for telling us");
  };

  let note: {
    icon?: "lock-closed-outline" | "alert-circle-outline";
    title?: string;
    text: string;
  } | null;
  let primary: { label: string; onPress: () => void };
  let secondary: { label: string; onPress: () => void } | null = null;

  switch (mode) {
    case "warn":
      note = {
        icon: "alert-circle-outline",
        title: "This one needs a video",
        text: `Anything above the ${classLabel ?? "class"} world record, or a big jump over your last lift, can't be saved without one.`,
      };
      primary = { label: "Add a video", onPress: addVideo };
      secondary = { label: "Change the number", onPress: changeNumber };
      break;
    case "lock":
      note = {
        icon: "lock-closed-outline",
        title: "A verified lift can't go down",
        text: `${toDisplay(verifiedKg!)} is on video, so it stays. If the plates in that video were wrong, report it and we'll recheck.`,
      };
      primary = { label: `Keep ${fmt(verifiedKg!)}`, onPress: onClose };
      secondary = { label: "Report a mistake", onPress: report };
      break;
    case "same":
      note = null;
      primary = { label: "Done", onPress: onClose };
      break;
    case "above":
      note = {
        text: `Saved without a video, your board spot stays at ${toDisplay(verifiedKg!)}. Add one and you move up after review.`,
      };
      primary = { label: "Add video", onPress: addVideo };
      secondary = { label: "Save without video", onPress: save };
      break;
    default:
      if (kind === "variation") {
        note = {
          text: "Variations guide your training loads. They don't rank you.",
        };
        primary = { label: `Save ${fmt(kg)}`, onPress: save };
        secondary = { label: "Add a video", onPress: addVideo };
      } else {
        note = {
          text:
            kind === "board"
              ? "Counts toward your level.\nAdd a video to get on the leaderboard."
              : "Counts toward your level.\nAdd a video to verify it and earn milestone olys.",
        };
        primary = { label: "Add video", onPress: addVideo };
        secondary = { label: "Save without video", onPress: save };
      }
  }

  const red = mode === "warn";

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SheetBackdrop onPress={onClose} />
        <View style={s.wrap} pointerEvents="box-none">
          <SheetSurface>
            <Pressable
              style={[
                s.sheet,
                { paddingBottom: insets.bottom + olySpacing[12] },
              ]}
              onPress={() => input.current?.focus()}
            >
              <SheetGrabber />

              <View style={s.head}>
                <Text style={s.liftName}>{name.toUpperCase()}</Text>
                {kind === "board" ? (
                  <View style={s.boardChip}>
                    <OlyIcon
                      name="rank"
                      filled
                      size={12}
                      color={olyColors.accent}
                    />
                    <Text style={s.boardChipText}>Leaderboard</Text>
                  </View>
                ) : null}
              </View>

              <View style={s.numberRow}>
                <Text
                  style={[s.number, red && s.numberRed, !text && s.numberEmpty]}
                  maxFontSizeMultiplier={1}
                >
                  {text || "0"}
                </Text>
                <Animated.View style={[s.cursor, { opacity: blink }]} />
                <Text style={s.unit}>{unit}</Text>
                <TextInput
                  ref={input}
                  value={text}
                  onChangeText={(t) => setText(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={4}
                  autoFocus
                  caretHidden
                  style={s.hiddenInput}
                  accessibilityLabel={`${name} in ${unit}`}
                />
              </View>
              <View style={[s.underline, red && s.underlineRed]} />
              <Text style={s.record}>{record}</Text>

              {note ? (
                note.title ? (
                  <View style={s.rule}>
                    <Ionicons
                      name={note.icon!}
                      size={20}
                      color={red ? olyColors.text.error : olyColors.accent}
                    />
                    <View style={s.flex}>
                      <Text style={s.ruleTitle}>{note.title}</Text>
                      <Text style={s.ruleText}>{note.text}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={s.quiet}>{note.text}</Text>
                )
              ) : (
                <View style={s.noNote} />
              )}

              <PrimaryButton label={primary.label} onPress={primary.onPress} />
              {secondary ? (
                <GlassButton
                  label={secondary.label}
                  onPress={secondary.onPress}
                  style={s.second}
                />
              ) : null}
            </Pressable>
          </SheetSurface>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flex: 1, justifyContent: "flex-end", paddingHorizontal: SHEET_SIDE },
  sheet: {
    paddingHorizontal: olySpacing[16],
    paddingTop: 10,
  },
  head: { alignItems: "center", gap: olySpacing[8] },
  liftName: {
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.medium,
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
  },
  boardChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
  },
  boardChipText: {
    ...olyTypography.caption,
    fontSize: 11,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 26,
  },
  number: {
    fontFamily: olyFonts.bold,
    fontSize: 84,
    lineHeight: 92,
    letterSpacing: -3.5,
    color: olyColors.text.primary,
  },
  numberRed: { color: olyColors.text.error },
  numberEmpty: { color: olyColors.text.disabled },
  cursor: {
    width: 3,
    height: 64,
    borderRadius: 2,
    backgroundColor: olyColors.accent,
  },
  unit: {
    fontFamily: olyFonts.medium,
    fontSize: 20,
    alignSelf: "flex-end",
    marginBottom: 14,
    color: olyColors.text.secondary,
  },
  hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
  underline: {
    alignSelf: "center",
    width: 140,
    height: 2,
    marginTop: 14,
    borderRadius: 1,
    backgroundColor: olyColors.accent,
    ...olyGlow.sm,
  },
  underlineRed: { backgroundColor: olyColors.text.error, shadowOpacity: 0 },
  record: {
    ...olyTypography.bodySmall,
    marginTop: 14,
    textAlign: "center",
    color: olyColors.text.secondary,
  },
  quiet: {
    ...olyTypography.caption,
    fontSize: 13,
    lineHeight: 19,
    marginTop: olySpacing[40],
    marginBottom: 22,
    marginHorizontal: olySpacing[4],
    textAlign: "center",
    color: olyColors.text.hint,
  },
  noNote: { height: 40 },
  rule: {
    flexDirection: "row",
    gap: olySpacing[12],
    marginTop: 30,
    marginBottom: 22,
    marginHorizontal: olySpacing[4],
  },
  ruleTitle: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  ruleText: {
    ...olyTypography.caption,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
    color: olyColors.text.secondary,
  },
  second: { marginTop: 10 },
});
