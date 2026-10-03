import { OlyIcon } from "@/components/icons/OlyIcon";
import { SendSheet } from "@/src/oly-components/messages/SendSheet";
import {
  initials,
  markRead,
  sendMessages,
  useThread,
  type LiftRef,
  type Msg,
} from "@/src/oly-mock/messages";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
 * Chat.
 *
 * Design: canvas "Messages / Chat". A message that replies to a lift
 * carries a mini card of that lift above it ("Replied to your lift").
 * Lifts and camera-roll media arrive as large cards. The "+" opens
 * SendSheet.
 *
 * DATA IS MOCK (src/oly-mock/messages.ts). Block and report will live
 * behind the "..." button once there is a backend to send them to.
 */

const CARD_W = 184;
const CARD_H = 230;

function openLift(l: LiftRef) {
  if (l.postId) {
    router.push({ pathname: "/athlete/post-expanded", params: { post_id: l.postId } });
  }
}

function LiftCard({ lift, mine }: { lift: LiftRef; mine: boolean }) {
  return (
    <Pressable
      onPress={() => openLift(lift)}
      style={[styles.card, mine ? styles.cardMine : styles.cardTheirs]}
      accessibilityRole="button"
      accessibilityLabel={`${lift.kg} kilos, ${lift.lift}, ${lift.date}`}
    >
      {lift.thumbnailUrl ? (
        <Image source={{ uri: lift.thumbnailUrl }} style={StyleSheet.absoluteFill} />
      ) : null}
      <LinearGradient
        colors={olyColors.media.fade}
        style={styles.cardScrim}
        pointerEvents="none"
      />
      <View style={styles.play}>
        <OlyIcon name="play" size={14} color={olyColors.media.ink} />
      </View>
      <Text style={styles.cardKg}>
        {lift.kg}
        <Text style={styles.cardUnit}> kg</Text>
      </Text>
      <Text style={styles.cardMeta}>
        {lift.lift} · {lift.date}
      </Text>
    </Pressable>
  );
}

function MediaCard({ uri, video, mine }: { uri: string; video: boolean; mine: boolean }) {
  return (
    <View style={[styles.card, mine ? styles.cardMine : styles.cardTheirs]}>
      {video ? (
        <Video
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          isMuted
        />
      ) : (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
}

function Bubble({ m }: { m: Msg }) {
  const mine = m.from === "me";
  if (m.kind === "lift") return <LiftCard lift={m.lift} mine={mine} />;
  if (m.kind === "media")
    return <MediaCard uri={m.uri} video={m.mediaType === "video"} mine={mine} />;
  return (
    <View style={[styles.group, mine ? styles.groupMine : styles.groupTheirs]}>
      {m.reply && (
        <>
          <Text style={styles.replyLabel}>Replied to your lift</Text>
          <Pressable onPress={() => openLift(m.reply!)} style={styles.reply}>
            <View style={styles.replyThumb}>
              <OlyIcon name="play" size={12} color={olyColors.text.secondary} />
            </View>
            <View>
              <Text style={styles.replyKg}>{m.reply.kg} kg</Text>
              <Text style={styles.replyMeta}>
                {m.reply.lift} · {m.reply.date}
              </Text>
            </View>
          </Pressable>
        </>
      )}
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{m.text}</Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = useThread(id);
  const [draft, setDraft] = useState("");
  const [sheet, setSheet] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) markRead(id);
  }, [id]);

  if (!thread) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.missing}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  const sendText = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessages(thread.id, [{ kind: "text", text }]);
    setDraft("");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <OlyIcon name="back" size={24} color={olyColors.text.primary} />
        </Pressable>
        <View style={styles.headAvatar}>
          <Text style={styles.headAvatarText}>{initials(thread.name)}</Text>
        </View>
        <View style={styles.headText}>
          <Text style={styles.headName} numberOfLines={1}>
            {thread.name}
          </Text>
          <Text style={styles.headSub} numberOfLines={1}>
            @{thread.handle} · {thread.club}
          </Text>
        </View>
        <Pressable style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="More">
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Circle cx={5} cy={12} r={1.6} fill={olyColors.text.primary} />
            <Circle cx={12} cy={12} r={1.6} fill={olyColors.text.primary} />
            <Circle cx={19} cy={12} r={1.6} fill={olyColors.text.primary} />
          </Svg>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.thread}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {thread.messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <Pressable
            onPress={() => setSheet(true)}
            style={styles.plus}
            accessibilityRole="button"
            accessibilityLabel="Send a lift, photo or video"
          >
            <OlyIcon name="plus" size={20} color={olyColors.text.primary} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={olyColors.text.disabled}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={sendText}
            disabled={!draft.trim()}
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnOff]}
            accessibilityRole="button"
            accessibilityLabel="Send"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M12 19V5M6 11l6-6 6 6"
                fill="none"
                stroke={draft.trim() ? olyColors.text.onAccent : olyColors.text.disabled}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <SendSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onSendLift={(lift, note) =>
          sendMessages(thread.id, [
            { kind: "lift", lift },
            ...(note ? [{ kind: "text" as const, text: note }] : []),
          ])
        }
        onSendMedia={(items, note) =>
          sendMessages(thread.id, [
            ...items.map((i) => ({ kind: "media" as const, ...i })),
            ...(note ? [{ kind: "text" as const, text: note }] : []),
          ])
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  missing: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    textAlign: "center",
    marginTop: olySpacing[40],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: olySpacing[4],
    paddingRight: olySpacing[12],
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: olyColors.border.hairline,
  },
  iconBtn: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  headAvatar: {
    width: 36,
    height: 36,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  headAvatarText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  headText: { flex: 1, minWidth: 0 },
  headName: { ...olyTypography.body, fontFamily: olyFonts.bold, color: olyColors.text.primary },
  headSub: { ...olyTypography.caption, color: olyColors.text.secondary },
  thread: {
    padding: olyLayout.screenPadding,
    gap: 6,
  },
  group: { maxWidth: "78%", gap: olySpacing[4] },
  groupMine: { alignSelf: "flex-end" },
  groupTheirs: { alignSelf: "flex-start" },
  replyLabel: { ...olyTypography.caption, color: olyColors.text.disabled },
  reply: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: olySpacing[12],
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.hairline,
  },
  replyThumb: {
    width: 40,
    height: 50,
    borderRadius: 6,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  replyKg: { ...olyTypography.bodySmall, fontFamily: olyFonts.bold, color: olyColors.text.primary },
  replyMeta: { ...olyTypography.caption, color: olyColors.text.secondary },
  bubble: { paddingVertical: 10, paddingHorizontal: 14 },
  bubbleMine: {
    backgroundColor: olyPalette.primaryPressed,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: olyPalette.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
  },
  bubbleText: { ...olyTypography.body, color: olyColors.text.primary },
  bubbleTextMine: { color: olyColors.text.onAccent },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: olyPalette.cardElevated,
    justifyContent: "flex-end",
    paddingHorizontal: olySpacing[12],
    paddingBottom: 10,
  },
  cardMine: { alignSelf: "flex-end", borderTopRightRadius: 6 },
  cardTheirs: { alignSelf: "flex-start", borderTopLeftRadius: 6 },
  cardScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" },
  play: {
    position: "absolute",
    top: CARD_H / 2 - 20,
    left: CARD_W / 2 - 20,
    width: 40,
    height: 40,
    paddingLeft: 2,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.media.chip,
    borderWidth: 1,
    borderColor: olyColors.media.track,
    alignItems: "center",
    justifyContent: "center",
  },
  cardKg: {
    fontFamily: olyFonts.bold,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.8,
    color: olyColors.text.primary,
  },
  cardUnit: { ...olyTypography.caption, color: olyColors.media.inkSoft },
  cardMeta: { ...olyTypography.caption, color: olyColors.media.inkSoft },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: olySpacing[8],
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[8],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: olyColors.border.hairline,
  },
  plus: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    ...olyTypography.body,
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: olySpacing[16],
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    color: olyColors.text.primary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnOff: { backgroundColor: olyColors.button.disabled.bg },
});
