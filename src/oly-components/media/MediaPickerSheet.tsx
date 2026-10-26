/**
 * MediaPickerSheet — choose from the camera roll in Oly's own style
 * instead of the white system picker.
 *
 * kind "video" (the default): lift videos, newest first, 4:5 tiles with
 * their length. Videos over `maxSeconds` are dimmed, and tapping one hands
 * off to the system picker, which can trim.
 * kind "photo": photos, newest first, square tiles. Used for the profile
 * picture.
 *
 * One pick, then Next. Same permission handling as the chat SendSheet: one
 * system prompt, "Add more" on limited access, Allow / Open Settings when
 * denied, and the header link always opens the system picker.
 */
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { Image as ExpoImage } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GAP = 3;
const TILE_W = (Dimensions.get("window").width - GAP * 2) / 3;
const TILE_H = TILE_W * 1.25;

/** Clip length as m:ss. */
export const fmtDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export type PickedMedia = { uri: string; durationSec: number };

type Props = {
  visible: boolean;
  kind?: "video" | "photo";
  maxSeconds?: number;
  onCancel: () => void;
  onPick: (m: PickedMedia) => void;
  /** System picker fallback: older items, no access, trimming or cropping. */
  onUseSystemPicker: () => void;
};

const COPY = {
  video: {
    title: "Choose a lift",
    all: "All videos",
    allowed: "Videos you allowed",
    empty: "No videos yet",
    emptyText: "Film a lift, then come back to post it.",
    ask: "Show your videos here",
    askText: "Allow access to pick a lift video, or choose from all your videos.",
  },
  photo: {
    title: "Choose a photo",
    all: "All photos",
    allowed: "Photos you allowed",
    empty: "No photos yet",
    emptyText: "Take a photo, then come back to add it.",
    ask: "Show your photos here",
    askText: "Allow access to pick a photo, or choose from all your photos.",
  },
} as const;

export function MediaPickerSheet({
  visible,
  kind = "video",
  maxSeconds = 30,
  onCancel,
  onPick,
  onUseSystemPicker,
}: Props) {
  const [perm, requestPerm] = MediaLibrary.usePermissions();
  const [items, setItems] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await MediaLibrary.getAssetsAsync({
        first: 90,
        mediaType: kind,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setItems(page.assets);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    if (!visible || !perm) return;
    if (perm.granted) load();
    else if (perm.status === "undetermined") requestPerm();
  }, [visible, perm, load, requestPerm]);

  useEffect(() => {
    if (!visible || !perm?.granted) return;
    const sub = MediaLibrary.addListener(() => load());
    return () => sub.remove();
  }, [visible, perm?.granted, load]);

  useEffect(() => {
    if (!visible) setPicked(null);
  }, [visible]);

  const next = async () => {
    const a = items.find((v) => v.id === picked);
    if (!a) return;
    setBusy(true);
    try {
      const info = await MediaLibrary.getAssetInfoAsync(a);
      onPick({ uri: info.localUri ?? a.uri, durationSec: Math.round(a.duration) });
    } finally {
      setBusy(false);
    }
  };

  const isVideo = kind === "video";
  const copy = COPY[kind];

  const tap = (a: MediaLibrary.Asset) => {
    if (isVideo && a.duration > maxSeconds + 0.5) {
      onUseSystemPicker();
      return;
    }
    setPicked((p) => (p === a.id ? null : a.id));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <SafeAreaView style={styles.screen} edges={["bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={12} accessibilityRole="button">
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>{copy.title}</Text>
          <Pressable onPress={onUseSystemPicker} hitSlop={8} accessibilityRole="button">
            <Text style={styles.link}>{copy.all}</Text>
          </Pressable>
        </View>

        {perm?.granted ? (
          <>
            <View style={styles.sub}>
              <Text style={styles.subText}>
                {perm.accessPrivileges === "limited"
                  ? copy.allowed
                  : isVideo
                    ? `Recent videos · up to ${maxSeconds}s`
                    : "Recent photos"}
              </Text>
              {perm.accessPrivileges === "limited" && (
                <Pressable onPress={() => MediaLibrary.presentPermissionsPickerAsync()} hitSlop={8}>
                  <Text style={styles.link}>Add more</Text>
                </Pressable>
              )}
            </View>
            {loading && items.length === 0 ? (
              <View style={styles.state}>
                <ActivityIndicator color={olyColors.text.secondary} />
              </View>
            ) : items.length === 0 ? (
              <View style={styles.state}>
                <OlyIcon name={isVideo ? "play" : "profile"} size={28} color={olyColors.text.disabled} />
                <Text style={styles.stateTitle}>{copy.empty}</Text>
                <Text style={styles.stateText}>{copy.emptyText}</Text>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(a) => a.id}
                numColumns={3}
                columnWrapperStyle={{ gap: GAP }}
                contentContainerStyle={{ gap: GAP, paddingBottom: 96 }}
                renderItem={({ item: a }) => {
                  const on = picked === a.id;
                  const tooLong = isVideo && a.duration > maxSeconds + 0.5;
                  return (
                    <Pressable
                      onPress={() => tap(a)}
                      style={[styles.tile, !isVideo && styles.tileSquare, tooLong && styles.tileLong]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={
                        isVideo
                          ? `Video, ${fmtDuration(a.duration)}${tooLong ? ", too long, opens trimming" : ""}`
                          : "Photo"
                      }
                    >
                      <ExpoImage
                        source={{ uri: a.uri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        recyclingKey={a.id}
                      />
                      {on && <View style={styles.tileOn} pointerEvents="none" />}
                      {isVideo && (
                        <View style={styles.dur}>
                          <Text style={styles.durText}>{tooLong ? `${fmtDuration(a.duration)} · trim` : fmtDuration(a.duration)}</Text>
                        </View>
                      )}
                      {on ? (
                        <View style={tileMarks.check}>
                          <OlyIcon name="check" size={14} color={olyColors.text.onAccent} />
                        </View>
                      ) : (
                        !tooLong && <View style={tileMarks.ring} />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </>
        ) : perm ? (
          <View style={styles.state}>
            <Text style={styles.stateTitle}>{copy.ask}</Text>
            <Text style={styles.stateText}>{copy.askText}</Text>
            <Pressable
              onPress={() => (perm.canAskAgain ? requestPerm() : Linking.openSettings())}
              style={styles.btn}
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>{perm.canAskAgain ? "Allow access" : "Open settings"}</Text>
            </Pressable>
          </View>
        ) : null}

        {perm?.granted && picked && (
          <View style={styles.footer}>
            <Pressable
              onPress={next}
              disabled={busy}
              style={[styles.btn, styles.btnWide]}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={olyColors.text.onAccent} />
              ) : (
                <Text style={styles.btnText}>Next</Text>
              )}
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.card },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[16],
    paddingBottom: olySpacing[12],
  },
  cancel: { ...olyTypography.body, color: olyColors.text.secondary },
  title: { ...olyTypography.body, fontSize: 17, fontFamily: olyFonts.bold, color: olyColors.text.primary },
  link: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    paddingHorizontal: olySpacing[12],
    paddingVertical: 6,
    borderRadius: olyRadius.full,
    overflow: "hidden",
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  sub: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[12],
  },
  subText: { ...olyTypography.caption, color: olyColors.text.secondary },
  tile: { width: TILE_W, height: TILE_H, backgroundColor: olyPalette.cardElevated, overflow: "hidden" },
  tileSquare: { height: TILE_W },
  tileLong: { opacity: 0.45 },
  tileOn: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: olyColors.accent,
  },
  dur: {
    position: "absolute",
    left: 6,
    bottom: 5,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.media.chip,
  },
  durText: { ...olyTypography.caption, fontFamily: olyFonts.medium, color: olyColors.media.ink },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
    paddingHorizontal: olySpacing[32],
  },
  stateTitle: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  stateText: { ...olyTypography.bodySmall, color: olyColors.text.secondary, textAlign: "center" },
  footer: {
    position: "absolute",
    left: olyLayout.screenPadding,
    right: olyLayout.screenPadding,
    bottom: olySpacing[32],
  },
  btn: {
    minHeight: 48,
    paddingHorizontal: olySpacing[24],
    marginTop: olySpacing[8],
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
    ...olyGlow.md,
  },
  btnWide: { alignSelf: "stretch" },
  btnText: { ...olyTypography.button, fontFamily: olyFonts.bold, color: olyColors.text.onAccent },
});

/** Selection marks in a picker tile's top corner, shared with SendSheet. */
export const tileMarks = StyleSheet.create({
  /** Picked: a glowing blue disc holding a check or a number. */
  check: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...olyGlow.sm,
  },
  /** Not picked: an empty ring. */
  ring: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: olyRadius.full,
    borderWidth: 1.5,
    borderColor: olyColors.media.ring,
    backgroundColor: olyColors.media.chipFaint,
  },
});
