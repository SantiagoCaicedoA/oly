/**
 * VideoPickerSheet — choose a lift video from the camera roll, in Oly's
 * own style instead of the white system picker.
 *
 * Videos only, newest first, 4:5 tiles with their length. One pick, then
 * Next. Same permission handling as the chat SendSheet: one system prompt,
 * "Add more" on limited access, Allow / Open Settings when denied, and
 * "All videos" always opens the system picker.
 *
 * Videos over `maxSeconds` are dimmed. Tapping one hands off to the system
 * picker, which can trim, via `onNeedsTrim`.
 */
import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyLetterSpacing, olyTypography } from "@/src/oly-theme/oly-typography";
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

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export type PickedVideo = { uri: string; durationSec: number };

type Props = {
  visible: boolean;
  maxSeconds?: number;
  onCancel: () => void;
  onPick: (v: PickedVideo) => void;
  /** System picker fallback: older videos, no access, or trimming. */
  onUseSystemPicker: () => void;
};

export function VideoPickerSheet({
  visible,
  maxSeconds = 30,
  onCancel,
  onPick,
  onUseSystemPicker,
}: Props) {
  const [perm, requestPerm] = MediaLibrary.usePermissions();
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await MediaLibrary.getAssetsAsync({
        first: 90,
        mediaType: "video",
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setVideos(page.assets);
    } finally {
      setLoading(false);
    }
  }, []);

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
    const a = videos.find((v) => v.id === picked);
    if (!a) return;
    setBusy(true);
    try {
      const info = await MediaLibrary.getAssetInfoAsync(a);
      onPick({ uri: info.localUri ?? a.uri, durationSec: Math.round(a.duration) });
    } finally {
      setBusy(false);
    }
  };

  const tap = (a: MediaLibrary.Asset) => {
    if (a.duration > maxSeconds + 0.5) {
      onUseSystemPicker();
      return;
    }
    setPicked((p) => (p === a.id ? null : a.id));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <SafeAreaView style={styles.screen} edges={["bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={8} accessibilityRole="button">
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Choose a lift</Text>
          <Pressable onPress={onUseSystemPicker} hitSlop={8} accessibilityRole="button">
            <Text style={styles.link}>All videos</Text>
          </Pressable>
        </View>

        {perm?.granted ? (
          <>
            <View style={styles.sub}>
              <Text style={styles.subText}>
                {perm.accessPrivileges === "limited"
                  ? "Videos you allowed"
                  : `Recent videos · up to ${maxSeconds}s`}
              </Text>
              {perm.accessPrivileges === "limited" && (
                <Pressable onPress={() => MediaLibrary.presentPermissionsPickerAsync()} hitSlop={8}>
                  <Text style={styles.link}>Add more</Text>
                </Pressable>
              )}
            </View>
            {loading && videos.length === 0 ? (
              <View style={styles.state}>
                <ActivityIndicator color={olyColors.text.secondary} />
              </View>
            ) : videos.length === 0 ? (
              <View style={styles.state}>
                <OlyIcon name="play" size={28} color={olyColors.text.disabled} />
                <Text style={styles.stateTitle}>No videos yet</Text>
                <Text style={styles.stateText}>Film a lift, then come back to post it.</Text>
              </View>
            ) : (
              <FlatList
                data={videos}
                keyExtractor={(a) => a.id}
                numColumns={3}
                columnWrapperStyle={{ gap: GAP }}
                contentContainerStyle={{ gap: GAP, paddingBottom: 96 }}
                renderItem={({ item: a }) => {
                  const on = picked === a.id;
                  const tooLong = a.duration > maxSeconds + 0.5;
                  return (
                    <Pressable
                      onPress={() => tap(a)}
                      style={[styles.tile, tooLong && styles.tileLong]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`Video, ${fmt(a.duration)}${tooLong ? ", too long, opens trimming" : ""}`}
                    >
                      <ExpoImage
                        source={{ uri: a.uri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        recyclingKey={a.id}
                      />
                      {on && <View style={styles.tileOn} pointerEvents="none" />}
                      <View style={styles.dur}>
                        <Text style={styles.durText}>{tooLong ? `${fmt(a.duration)} · trim` : fmt(a.duration)}</Text>
                      </View>
                      {on ? (
                        <View style={styles.check}>
                          <OlyIcon name="check" size={14} color={olyColors.text.onAccent} />
                        </View>
                      ) : (
                        !tooLong && <View style={styles.ring} />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </>
        ) : perm ? (
          <View style={styles.state}>
            <Text style={styles.stateTitle}>Show your videos here</Text>
            <Text style={styles.stateText}>
              Allow access to pick a lift video, or choose from all your videos.
            </Text>
            <Pressable
              onPress={() => (perm.canAskAgain ? requestPerm() : Linking.openSettings())}
              style={styles.btn}
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>{perm.canAskAgain ? "ALLOW ACCESS" : "OPEN SETTINGS"}</Text>
            </Pressable>
          </View>
        ) : null}

        {perm?.granted && picked && (
          <View style={styles.footer}>
            <Pressable
              onPress={next}
              disabled={!picked || busy}
              style={[styles.btn, styles.btnWide, !picked && styles.btnOff]}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={olyColors.text.onAccent} />
              ) : (
                <Text style={[styles.btnText, !picked && styles.btnTextOff]}>NEXT</Text>
              )}
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[16],
    paddingBottom: olySpacing[12],
  },
  cancel: { ...olyTypography.body, color: olyColors.text.secondary },
  title: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  link: { ...olyTypography.bodySmall, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  sub: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[12],
  },
  subText: { ...olyTypography.caption, color: olyColors.text.secondary },
  tile: { width: TILE_W, height: TILE_H, backgroundColor: olyPalette.cardElevated, overflow: "hidden" },
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
  },
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
  },
  btnWide: { alignSelf: "stretch" },
  btnOff: { backgroundColor: olyColors.button.disabled.bg },
  btnText: { ...olyTypography.button, color: olyColors.text.onAccent, letterSpacing: olyLetterSpacing.uppercase },
  btnTextOff: { color: olyColors.button.disabled.text },
});
