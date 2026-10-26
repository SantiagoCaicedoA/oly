import { olyAlert } from "@/src/oly-components/feedback/OlyAlert";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { SHEET_SIDE, SheetBackdrop, SheetGrabber, SheetSurface } from "@/src/oly-components/shop/ShopKit";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import {
  useFollowAthleteMutation,
  useGetFollowStatusQuery,
  useUnfollowAthleteMutation,
} from "@/store/api";
import { useToast } from "@/context/toast-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * The "..." menu on a post. Glass sheet with the actions that make sense
 * for whose post it is.
 *
 * Live: share, copy link, follow and unfollow.
 * MOCK until the backend has endpoints: report, block, not interested and
 * delete. They confirm, show a toast and do nothing else. Search this file
 * for TODO(api) when the endpoints exist.
 */

const REASONS = [
  "Wrong weight or lift",
  "Edited or fake video",
  "Not my lift / impersonation",
  "Spam",
  "Harassment or hate",
  "Something else",
];

type Props = {
  open: boolean;
  onClose: () => void;
  postId: string;
  authorId?: string;
  authorName: string;
  isMine: boolean;
};

export default function PostMenu({ open, onClose, postId, authorId, authorName, isMine }: Props) {
  const insets = useSafeAreaInsets();
  const { showSuccess } = useToast();
  const [step, setStep] = useState<"menu" | "report">("menu");
  const first = authorName.split(" ")[0];
  const link = `https://olytraining.com/post/${postId}`;

  const statusQ = useGetFollowStatusQuery(authorId as string, { skip: !authorId || isMine || !open });
  const [follow] = useFollowAthleteMutation();
  const [unfollow] = useUnfollowAthleteMutation();
  const [followLocal, setFollowLocal] = useState<boolean | null>(null);
  const following = followLocal ?? statusQ.data?.data?.isFollowing ?? false;

  const close = () => {
    onClose();
    setTimeout(() => setStep("menu"), 250);
  };

  const run = (fn: () => void) => () => {
    Haptics.selectionAsync();
    close();
    setTimeout(fn, 300);
  };

  const toggleFollow = async () => {
    if (!authorId) return;
    const next = !following;
    setFollowLocal(next);
    try {
      await (next ? follow(authorId) : unfollow(authorId)).unwrap();
      showSuccess(next ? `Following ${first}` : `Unfollowed ${first}`, "");
    } catch {
      setFollowLocal(!next);
    }
  };

  const report = (reason: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    close();
    // TODO(api): POST /posts/:id/report { reason }
    setTimeout(() => showSuccess("Thanks for telling us", `We'll review this post. Reason: ${reason}`), 300);
  };

  const block = () =>
    olyAlert(`Block ${first}?`, `${first} won't be able to see your posts or message you. They won't be told.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: () => {
          // TODO(api): POST /users/:id/block
          showSuccess(`${first} is blocked`, "");
          router.back();
        },
      },
    ]);

  const remove = () =>
    olyAlert("Delete this post?", "It comes off the feed and your profile. A ranked lift stays on the board.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // TODO(api): DELETE /posts/:id
          showSuccess("Post deleted", "");
          router.back();
        },
      },
    ]);

  const rows: { icon: any; label: string; onPress: () => void; danger?: boolean }[] = [
    { icon: "paper-plane-outline", label: "Share post", onPress: run(() => Share.share({ message: link }).catch(() => {})) },
    {
      icon: "link-outline",
      label: "Copy link",
      onPress: run(async () => {
        await Clipboard.setStringAsync(link);
        showSuccess("Link copied", "");
      }),
    },
  ];
  if (isMine) {
    rows.push({ icon: "trash-outline", label: "Delete post", onPress: run(remove), danger: true });
  } else {
    if (authorId) {
      rows.push({
        icon: following ? "person-remove-outline" : "person-add-outline",
        label: following ? `Unfollow ${first}` : `Follow ${first}`,
        onPress: run(toggleFollow),
      });
    }
    rows.push({
      icon: "eye-off-outline",
      label: "Not interested",
      // TODO(api): POST /feed/hide { postId }
      onPress: run(() => showSuccess("Got it", "You'll see fewer posts like this")),
    });
    rows.push({ icon: "flag-outline", label: "Report post", onPress: () => setStep("report"), danger: true });
    rows.push({ icon: "ban-outline", label: `Block ${first}`, onPress: run(block), danger: true });
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <SheetBackdrop onPress={close} />
      <SheetSurface style={[s.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <SheetGrabber />
          {step === "menu" ? (
            <View style={s.group}>
              {rows.map((r, i) => (
                <Pressable
                  key={r.label}
                  onPress={r.onPress}
                  style={({ pressed }) => [s.row, i > 0 && s.rule, pressed && s.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={r.label}
                >
                  <Ionicons name={r.icon} size={20} color={r.danger ? olyColors.text.error : olyColors.text.primary} />
                  <Text style={[s.rowText, r.danger && s.danger]}>{r.label}</Text>
                  {r.label === "Report post" && (
                    <Ionicons name="chevron-forward" size={16} color={olyColors.text.secondary} />
                  )}
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              <View style={s.reportHead}>
                <Pressable onPress={() => setStep("menu")} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
                  <Ionicons name="chevron-back" size={20} color={olyColors.text.primary} />
                </Pressable>
                <Text style={s.title}>Why are you reporting this?</Text>
              </View>
              <Text style={s.sub}>Your report is anonymous. Lifts on the board get a second look.</Text>
              <View style={s.group}>
                {REASONS.map((r, i) => (
                  <Pressable
                    key={r}
                    onPress={() => report(r)}
                    style={({ pressed }) => [s.row, i > 0 && s.rule, pressed && s.pressed]}
                  >
                    <Text style={s.rowText}>{r}</Text>
                    <Ionicons name="chevron-forward" size={16} color={olyColors.text.secondary} />
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <Pressable onPress={close} style={({ pressed }) => [s.cancel, pressed && s.pressed]}>
            <Text style={s.cancelText}>Cancel</Text>
          </Pressable>
      </SheetSurface>
    </Modal>
  );
}

const s = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: SHEET_SIDE,
    right: SHEET_SIDE,
    bottom: 0,
    paddingHorizontal: olySpacing[16],
    paddingTop: 10,
  },
  group: {
    borderRadius: olyRadius.tile,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: olySpacing[16], minHeight: 54 },
  rule: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  pressed: { backgroundColor: olyColors.glass.card },
  rowText: { flex: 1, fontFamily: olyFonts.medium, fontSize: 15, color: olyColors.text.primary },
  danger: { color: olyColors.text.error },
  reportHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontFamily: olyFonts.bold, fontSize: 18, color: olyColors.text.primary },
  sub: { marginTop: 6, marginBottom: 14, fontFamily: olyFonts.regular, fontSize: 13, lineHeight: 18, color: olyColors.text.secondary },
  cancel: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.glass.control,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  cancelText: { fontFamily: olyFonts.medium, fontSize: 16, color: olyPalette.white },
});
