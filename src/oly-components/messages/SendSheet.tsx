/**
 * SendSheet — the "+" in a chat.
 *
 * Two tabs. "Oly lifts" is the athlete's own posts as 4:5 tiles (weight and
 * lift name), pick one to send it as a lift card. "Camera roll" shows the
 * phone's recent photos and videos right in the sheet (expo-media-library),
 * several at once. Limited access gets an "Add more" link, no access gets
 * Allow / Open Settings, and "All photos" always opens the system picker.
 *
 * Design: canvas "Messages / Send sheet".
 */
import type { LiftRef } from "@/src/oly-mock/messages";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import { OlyIcon } from "@/components/icons/OlyIcon";
import { useGetMyPostsQuery } from "@/store/api";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GAP = 6;
const TILE_W = (Dimensions.get("window").width - olyLayout.screenPadding * 2 - GAP * 2) / 3;
const TILE_H = TILE_W * 1.25;
const ROLL_GAP = 4;
const ROLL_W = (Dimensions.get("window").width - olyLayout.screenPadding * 2 - ROLL_GAP * 2) / 3;

const dur = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Shown when the athlete has no posts yet, so the tab can still be tested. */
const SAMPLE_LIFTS: LiftRef[] = [
  { kg: 150, lift: "Clean & Jerk", date: "Sep 27" },
  { kg: 120, lift: "Snatch", date: "Sep 27" },
  { kg: 190, lift: "Back Squat", date: "Sep 24" },
  { kg: 147, lift: "Clean & Jerk", date: "Sep 13" },
  { kg: 100, lift: "Power Snatch", date: "Sep 10" },
  { kg: 140, lift: "Clean & Jerk", date: "May 10" },
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

type Props = {
  visible: boolean;
  onClose: () => void;
  onSendLift: (lift: LiftRef, note: string) => void;
  onSendMedia: (
    items: { uri: string; mediaType: "image" | "video" }[],
    note: string,
  ) => void;
};

export function SendSheet({ visible, onClose, onSendLift, onSendMedia }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"lifts" | "roll">("lifts");
  const [picked, setPicked] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const postsQ = useGetMyPostsQuery({ page: 1, limit: 24 });
  const [perm, requestPerm] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);

  const loadAssets = useCallback(async () => {
    const page = await MediaLibrary.getAssetsAsync({
      first: 60,
      mediaType: ["photo", "video"],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });
    setAssets(page.assets);
  }, []);

  /* First visit to the tab asks once; after that the grid just loads. */
  useEffect(() => {
    if (!visible || tab !== "roll" || !perm) return;
    if (perm.granted) loadAssets();
    else if (perm.status === "undetermined") requestPerm();
  }, [visible, tab, perm, loadAssets, requestPerm]);

  /* Limited access: refresh when the athlete adds photos to the selection. */
  useEffect(() => {
    if (!perm?.granted) return;
    const sub = MediaLibrary.addListener(() => loadAssets());
    return () => sub.remove();
  }, [perm?.granted, loadAssets]);

  const lifts: LiftRef[] = useMemo(() => {
    const posts = postsQ.data?.data ?? [];
    const real = posts
      .filter((p) => p.session_detail?.lifted_kg)
      .map((p) => ({
        kg: Number(p.session_detail!.lifted_kg),
        lift: p.lift_name || "Lift",
        date: fmt(p.createdAt),
        postId: p._id,
        videoUrl: p.video_url,
        thumbnailUrl: (p as any).thumbnail_url,
      }));
    return real.length ? real : SAMPLE_LIFTS;
  }, [postsQ.data]);

  const reset = () => {
    setPicked(null);
    setChosen([]);
    setNote("");
    setTab("lifts");
  };
  const close = () => {
    reset();
    onClose();
  };

  const sendLift = () => {
    if (picked == null) return;
    onSendLift(lifts[picked], note.trim());
    close();
  };

  const openRoll = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.length) return;
    onSendMedia(
      res.assets.map((a) => ({
        uri: a.uri,
        mediaType: a.type === "video" ? "video" : "image",
      })),
      note.trim(),
    );
    close();
  };

  const toggleAsset = (id: string) =>
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const sendRoll = async () => {
    const picks = chosen
      .map((id) => assets.find((a) => a.id === id))
      .filter(Boolean) as MediaLibrary.Asset[];
    const items = await Promise.all(
      picks.map(async (a) => {
        const info = await MediaLibrary.getAssetInfoAsync(a);
        return {
          uri: info.localUri ?? a.uri,
          mediaType: (a.mediaType === "video" ? "video" : "image") as "image" | "video",
        };
      }),
    );
    onSendMedia(items, note.trim());
    close();
  };

  const rollLabel = (() => {
    const picks = chosen.map((id) => assets.find((a) => a.id === id)).filter(Boolean);
    const v = picks.filter((a) => a!.mediaType === "video").length;
    const ph = picks.length - v;
    const parts = [
      v ? `${v} VIDEO${v > 1 ? "S" : ""}` : "",
      ph ? `${ph} PHOTO${ph > 1 ? "S" : ""}` : "",
    ].filter(Boolean);
    return parts.length ? `SEND · ${parts.join(", ")}` : "PICK PHOTOS OR VIDEOS";
  })();

  const sel = picked != null ? lifts[picked] : null;
  const short = (l: string) => (l === "Clean & Jerk" ? "C&J" : l);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + olySpacing[8] }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <Text style={styles.title}>Send</Text>
          <Pressable
            onPress={close}
            style={styles.close}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <OlyIcon name="close" size={16} color={olyColors.text.primary} />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(["lifts", "roll"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabOn]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
                {t === "lifts" ? "Oly lifts" : "Camera roll"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "lifts" ? (
          <ScrollView style={styles.gridScroll} contentContainerStyle={styles.grid}>
            {lifts.map((l, i) => {
              const on = picked === i;
              return (
                <Pressable
                  key={`${l.postId ?? "s"}${i}`}
                  onPress={() => setPicked(on ? null : i)}
                  style={[styles.tile, on && styles.tileOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${l.kg} kilos, ${l.lift}`}
                >
                  {l.thumbnailUrl ? (
                    <Image source={{ uri: l.thumbnailUrl }} style={StyleSheet.absoluteFill} />
                  ) : null}
                  <LinearGradient
                    colors={olyColors.media.fade}
                    style={styles.scrim}
                    pointerEvents="none"
                  />
                  {on && (
                    <View style={styles.check}>
                      <OlyIcon name="check" size={14} color={olyColors.text.onAccent} />
                    </View>
                  )}
                  <Text style={styles.tileKg}>
                    {l.kg}
                    <Text style={styles.tileUnit}> kg</Text>
                  </Text>
                  <Text style={styles.tileLift} numberOfLines={1}>
                    {l.lift}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View>
            {perm?.granted ? (
              <>
                <View style={styles.rollHead}>
                  <Text style={styles.rollHint} numberOfLines={1}>
                    {perm.accessPrivileges === "limited" ? "Photos you allowed" : "Recent"}
                  </Text>
                  {perm.accessPrivileges === "limited" && (
                    <Pressable
                      onPress={() => MediaLibrary.presentPermissionsPickerAsync()}
                      hitSlop={8}
                    >
                      <Text style={styles.rollLink}>Add more</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={openRoll} hitSlop={8}>
                    <Text style={styles.rollLink}>All photos</Text>
                  </Pressable>
                </View>
                <ScrollView style={styles.rollScroll} contentContainerStyle={styles.rollGrid}>
                  {assets.map((a) => {
                    const n = chosen.indexOf(a.id);
                    const on = n >= 0;
                    return (
                      <Pressable
                        key={a.id}
                        onPress={() => toggleAsset(a.id)}
                        style={[styles.rollTile, on && styles.tileOn]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={a.mediaType === "video" ? "Video" : "Photo"}
                      >
                        <ExpoImage
                          source={{ uri: a.uri }}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                          recyclingKey={a.id}
                        />
                        {a.mediaType === "video" && (
                          <View style={styles.dur}>
                            <OlyIcon name="play" size={10} color={olyColors.media.ink} />
                            <Text style={styles.durText}>{dur(a.duration)}</Text>
                          </View>
                        )}
                        {on ? (
                          <View style={styles.num}>
                            <Text style={styles.numText}>{n + 1}</Text>
                          </View>
                        ) : (
                          <View style={styles.ring} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : perm ? (
              <View style={styles.roll}>
                <Text style={styles.rollText}>
                  Allow access to your photos to see them here, or pick from
                  all your photos.
                </Text>
                <Pressable
                  onPress={() => (perm.canAskAgain ? requestPerm() : Linking.openSettings())}
                  style={styles.rollBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.rollBtnText}>
                    {perm.canAskAgain ? "Allow access" : "Open Settings"}
                  </Text>
                </Pressable>
                <Pressable onPress={openRoll} hitSlop={8}>
                  <Text style={styles.rollLink}>All photos</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a message"
          placeholderTextColor={olyColors.text.disabled}
          style={styles.input}
        />
        {tab === "roll" && perm?.granted && (
          <Pressable
            onPress={sendRoll}
            disabled={!chosen.length}
            style={[styles.send, !chosen.length && styles.sendOff]}
            accessibilityRole="button"
          >
            <Text style={[styles.sendText, !chosen.length && styles.sendTextOff]}>
              {rollLabel}
            </Text>
          </Pressable>
        )}
        {tab === "lifts" && (
          <Pressable
            onPress={sendLift}
            disabled={!sel}
            style={[styles.send, !sel && styles.sendOff]}
            accessibilityRole="button"
          >
            <Text style={[styles.sendText, !sel && styles.sendTextOff]}>
              {sel ? `SEND · ${sel.kg} KG ${short(sel.lift).toUpperCase()}` : "PICK A LIFT"}
            </Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: olyColors.bg.overlay },
  sheet: {
    backgroundColor: olyPalette.card,
    borderTopLeftRadius: olyRadius.lg,
    borderTopRightRadius: olyRadius.lg,
    paddingTop: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: olyRadius.sm,
    backgroundColor: olyColors.text.disabled,
    marginBottom: olySpacing[16],
  },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  close: {
    width: 32,
    height: 32,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    padding: olySpacing[4],
    marginTop: olySpacing[12],
    marginBottom: olySpacing[16],
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.background,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tabOn: { backgroundColor: olyPalette.primary },
  tabText: { ...olyTypography.label, color: olyColors.text.secondary },
  tabTextOn: { color: olyColors.text.onAccent },
  gridScroll: { maxHeight: TILE_H * 2 + GAP + 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  tile: {
    width: TILE_W,
    height: TILE_H,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: olyPalette.cardElevated,
    justifyContent: "flex-end",
    paddingHorizontal: olySpacing[8],
    paddingBottom: 6,
  },
  tileOn: { borderWidth: 2, borderColor: olyColors.accent },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "50%" },
  check: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tileKg: {
    fontFamily: olyFonts.bold,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.4,
    color: olyColors.text.primary,
  },
  tileUnit: { ...olyTypography.caption, color: olyColors.media.inkMuted },
  tileLift: { ...olyTypography.caption, color: olyColors.media.inkMuted },
  rollHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[16],
    marginBottom: olySpacing[8] + 2,
  },
  rollHint: { ...olyTypography.caption, color: olyColors.text.secondary, flex: 1 },
  rollLink: { ...olyTypography.caption, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  rollScroll: { maxHeight: ROLL_W * 2 + ROLL_GAP + 2 },
  rollGrid: { flexDirection: "row", flexWrap: "wrap", gap: ROLL_GAP },
  rollTile: {
    width: ROLL_W,
    height: ROLL_W,
    borderRadius: olySpacing[8],
    overflow: "hidden",
    backgroundColor: olyPalette.cardElevated,
  },
  dur: {
    position: "absolute",
    right: 6,
    bottom: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  durText: { ...olyTypography.caption, fontFamily: olyFonts.medium, color: olyColors.media.ink },
  num: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: { ...olyTypography.caption, fontFamily: olyFonts.bold, color: olyColors.text.onAccent },
  ring: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: olyRadius.full,
    borderWidth: 1.5,
    borderColor: olyColors.media.ring,
    backgroundColor: olyColors.media.chipFaint,
  },
  roll: {
    alignItems: "center",
    gap: olySpacing[12],
    paddingVertical: olySpacing[24],
  },
  rollText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    maxWidth: 260,
  },
  rollBtn: {
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[24],
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  rollBtnText: { ...olyTypography.label, color: olyColors.text.onAccent },
  input: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    minHeight: olyLayout.minTouchTarget,
    marginTop: olySpacing[20],
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  send: {
    minHeight: 48,
    marginTop: olySpacing[8] + 2,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendOff: { backgroundColor: olyColors.button.disabled.bg },
  sendText: {
    ...olyTypography.button,
    color: olyColors.text.onAccent,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  sendTextOff: { color: olyColors.button.disabled.text },
});
