import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import {
  useCommentOnPostMutation,
  useGetCommentsQuery,
} from "@/store/api";
import {
  BottomSheetBackdrop,
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
 * Same family as the chat SendSheet: level 1 surface, left-aligned title
 * with a close circle, and the chat composer at the bottom (pill input,
 * round send button with the up arrow, disabled until there is text).
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

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      [],
    );

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
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        backdropComponent={renderBackdrop}
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
            {comments.length > 0 && <Text style={styles.count}>  {comments.length}</Text>}
          </Text>
          <Pressable
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
              <OlyIcon name="messages" size={28} color={olyColors.text.disabled} />
              <Text style={styles.stateTitle}>No comments yet</Text>
              <Text style={styles.stateText}>Start the conversation.</Text>
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
  sheetBg: {
    backgroundColor: olyPalette.card,
    borderTopLeftRadius: olyRadius.lg,
    borderTopRightRadius: olyRadius.lg,
  },
  handle: { backgroundColor: olyColors.text.disabled, width: 36 },

  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[4],
    paddingBottom: olySpacing[12],
  },
  title: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  count: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
  close: {
    width: 32,
    height: 32,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: 120,
  },

  state: {
    alignItems: "center",
    paddingTop: olySpacing[32],
    gap: olySpacing[8],
  },
  stateTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    marginTop: olySpacing[4],
  },
  stateText: { ...olyTypography.bodySmall, color: olyColors.text.secondary },

  footer: {
    backgroundColor: olyPalette.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: olyColors.border.hairline,
    paddingHorizontal: olySpacing[12],
    paddingTop: olySpacing[8],
  },
  replyStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olySpacing[4],
    paddingBottom: olySpacing[8],
  },
  replyStripText: { ...olyTypography.caption, color: olyColors.text.disabled },
  replyStripName: { fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: olySpacing[8] },
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
