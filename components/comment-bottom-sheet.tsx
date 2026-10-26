import { OlyIcon } from "@/components/icons/OlyIcon";
import {
  GorhomSheetBackdrop,
  GorhomSheetBackground,
  gorhomSheet,
} from "@/src/oly-components/shop/GorhomSheet";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import {
  useCommentOnPostMutation,
  useGetCommentsQuery,
} from "@/store/api";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import CommentCard from "./comment-card";

/**
 * Comments sheet, opened from a post.
 *
 * The shared glass sheet (GorhomSheet): a bold title with a count chip, a glass close
 * circle, and a dark inset composer with a glowing send button.
 */

interface CommentBottomSheetProps {
  postId: string;
}

const CommentBottomSheet = forwardRef<BottomSheetModal, CommentBottomSheetProps>(
  ({ postId }, ref) => {
    const insets = useSafeAreaInsets();
    const { dismiss } = useBottomSheetModal();
    const [enabled, setEnabled] = useState(false);
    const snapPoints = useMemo(() => ["60%", "90%"], []);
    const commentInputRef = useRef<any>(null);
    const [commentText, setCommentText] = useState("");

    /* Reply state; the ref mirrors it to avoid stale closures in callbacks */
    const [replyTo, setReplyTo] = useState<{ commentId: string; userName: string } | null>(null);
    const replyToRef = useRef<{ commentId: string; userName: string } | null>(null);

    const [commentOnPost, { isLoading: isSending }] = useCommentOnPostMutation();
    const {
      data: commentsData,
      isLoading: isLoadingComments,
      isFetching,
    } = useGetCommentsQuery({ postId }, { skip: !enabled });

    const comments = commentsData?.data ?? [];
    const showLoading = enabled ? !commentsData || isLoadingComments || isFetching : true;
    const canSend = commentText.trim().length > 0 && !isSending;

    const handleSendComment = useCallback(async () => {
      if (!commentText.trim()) return;
      try {
        await commentOnPost({
          postId,
          text: commentText,
          parentComment: replyToRef.current?.commentId ?? null,
        }).unwrap();
        setCommentText("");
        replyToRef.current = null;
        setReplyTo(null);
      } catch (error) {
        console.error("Comment error:", error);
      }
    }, [commentText, commentOnPost, postId]);

    const handleReply = useCallback((commentId: string, userName: string) => {
      replyToRef.current = { commentId, userName };
      setReplyTo({ commentId, userName });
      setCommentText("");
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }, []);

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View style={[styles.footer, { paddingBottom: insets.bottom + olySpacing[8] }]}>
            {replyTo && (
              <View style={styles.replyStrip}>
                <Text style={styles.replyStripText}>
                  Replying to <Text style={styles.replyStripName}>@{replyTo.userName}</Text>
                </Text>
                <Pressable
                  onPress={() => {
                    replyToRef.current = null;
                    setReplyTo(null);
                    setCommentText("");
                  }}
                  hitSlop={olySpacing[8]}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel reply"
                >
                  <OlyIcon name="close" size={16} color={olyColors.text.secondary} />
                </Pressable>
              </View>
            )}
            <View style={styles.inputRow}>
              <BottomSheetTextInput
                style={styles.input}
                placeholder={replyTo ? `Reply to @${replyTo.userName}` : "Add a comment"}
                placeholderTextColor={olyColors.text.disabled}
                value={commentText}
                onChangeText={setCommentText}
                ref={commentInputRef}
                multiline
              />
              <Pressable
                style={[styles.sendBtn, !canSend && styles.sendBtnOff]}
                onPress={handleSendComment}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel="Send"
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={olyColors.text.onAccent} />
                ) : (
                  <Svg width={18} height={18} viewBox="0 0 24 24">
                    <Path
                      d="M12 19V5M6 11l6-6 6 6"
                      fill="none"
                      stroke={canSend ? olyColors.text.onAccent : olyColors.text.disabled}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </Pressable>
            </View>
          </View>
        </BottomSheetFooter>
      ),
      [isSending, replyTo, commentText, canSend, insets.bottom, handleSendComment],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        onChange={(index) => {
          if (index >= 0) setEnabled(true);
          else {
            setEnabled(false);
            replyToRef.current = null;
            setReplyTo(null);
            setCommentText("");
          }
        }}
        enableDynamicSizing={false}
        snapPoints={snapPoints}
        style={gorhomSheet.inset}
        backgroundComponent={GorhomSheetBackground}
        handleIndicatorStyle={gorhomSheet.handle}
        backdropComponent={GorhomSheetBackdrop}
        footerComponent={renderFooter}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enablePanDownToClose
        enableDismissOnClose
      >
        <View style={styles.head}>
          <Text style={styles.title}>
            Comments
          </Text>
          {comments.length > 0 && (
            <View style={styles.countChip}>
              <Text style={styles.count}>{comments.length}</Text>
            </View>
          )}
          <View style={styles.flex} />
          <Pressable hitSlop={4}
            onPress={() => dismiss()}
            style={styles.close}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <OlyIcon name="close" size={16} color={olyColors.text.primary} />
          </Pressable>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {showLoading ? (
            <View style={styles.state}>
              <ActivityIndicator size="small" color={olyColors.text.secondary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.state}>
              <View style={styles.stateIcon}>
                <OlyIcon name="messages" size={24} color={olyColors.text.primary} />
              </View>
              <Text style={styles.stateTitle}>No comments yet</Text>
              <Text style={styles.stateText}>Be the first to say something about this lift.</Text>
            </View>
          ) : (
            comments.map((comment: any) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                postId={postId}
                onReply={handleReply}
              />
            ))
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

CommentBottomSheet.displayName = "CommentBottomSheet";
export default CommentBottomSheet;

const styles = StyleSheet.create({
  flex: { flex: 1 },

  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    paddingHorizontal: olySpacing[20],
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
  },
  title: { fontFamily: olyFonts.bold, fontSize: 20, lineHeight: 26, color: olyColors.text.primary },
  countChip: {
    paddingHorizontal: olySpacing[8],
    paddingVertical: 2,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
  },
  count: { fontFamily: olyFonts.bold, fontSize: 12, color: olyColors.text.primary },
  close: {
    width: 36,
    height: 36,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: olySpacing[20],
    paddingBottom: 120,
  },

  state: {
    alignItems: "center",
    paddingTop: 48,
    gap: 6,
  },
  stateIcon: {
    width: 56,
    height: 56,
    borderRadius: olyRadius.full,
    marginBottom: olySpacing[8],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.glass.accentFill,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
    ...olyGlow.lg,
  },
  stateTitle: { fontFamily: olyFonts.bold, fontSize: 17, color: olyColors.text.primary },
  stateText: { fontFamily: olyFonts.regular, fontSize: 14, color: olyColors.text.secondary, textAlign: "center" },

  footer: {
    paddingHorizontal: olySpacing[16],
    paddingTop: 10,
    backgroundColor: olyColors.bg.card,
    borderBottomLeftRadius: olyRadius.sheet,
    borderBottomRightRadius: olyRadius.sheet,
  },
  replyStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olySpacing[4],
    paddingBottom: olySpacing[8],
  },
  replyStripText: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.disabled },
  replyStripName: { fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: olySpacing[8] },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 18,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[12],
    borderRadius: olyRadius.xl,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    fontFamily: olyFonts.regular,
    fontSize: 15,
    color: olyColors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
    ...olyGlow.md,
  },
  sendBtnOff: {
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    shadowOpacity: 0,
  },
});
