import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import {
  useCommentOnPostMutation,
  useDeleteCommentMutation,
  useGetCommentsQuery,
} from "@/store/api";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommentCard from "./comment-card";

interface CommentBottomSheetProps {
  postId: string;
}

const CommentBottomSheet = forwardRef<
  BottomSheetModal,
  CommentBottomSheetProps
>(({ postId }, ref) => {
  const [enabled, setEnabled] = useState(false);
  const snapPoints = useMemo(() => ["60%", "90%"], []);
  const commentInputRef = useRef<any>(null);
  const [commentText, setCommentText] = useState("");

  /* Reply state — ref mirrors state to avoid stale closures in callbacks */
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    userName: string;
  } | null>(null);
  const replyToRef = useRef<{ commentId: string; userName: string } | null>(null);

  const [commentOnPost, { isLoading: isSending }] =
    useCommentOnPostMutation();
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isFetching,
  } = useGetCommentsQuery({ postId }, { skip: !enabled });
  const [deleteComment] = useDeleteCommentMutation();

  const comments = commentsData?.data ?? [];
  const showLoading = enabled
    ? !commentsData || isLoadingComments || isFetching
    : true;

  const handleSendComment = async () => {
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
  };

  const handleReply = useCallback(
    (commentId: string, userName: string) => {
      replyToRef.current = { commentId, userName };
      setReplyTo({ commentId, userName });
      setCommentText("");
      setTimeout(() => commentInputRef.current?.focus(), 100);
    },
    [],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footer}>
          {replyTo && (
            <View style={styles.replyStrip}>
              <TouchableOpacity
                onPress={() => {
                  replyToRef.current = null;
                  setReplyTo(null);
                  setCommentText("");
                }}
                hitSlop={olySpacing[8]}
              >
                <Ionicons
                  name="close"
                  size={14}
                  color={olyColors.text.disabled}
                />
              </TouchableOpacity>
              <Text style={styles.replyStripText}>
                Replying to{" "}
                <Text style={styles.replyStripName}>@{replyTo.userName}</Text>
              </Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <BottomSheetTextInput
              style={styles.messageInput}
              placeholder={
                replyTo
                  ? `Reply to @${replyTo.userName}...`
                  : "Message"
              }
              placeholderTextColor={olyColors.text.disabled}
              value={commentText}
              onChangeText={setCommentText}
              ref={commentInputRef}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendComment}
              disabled={isSending}
              activeOpacity={0.7}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={olyPalette.white} />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={olyColors.text.onBrand}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [isSending, replyTo, commentText],
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
      enablePanDownToClose={true}
      enableDismissOnClose={true}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Comments</Text>

        {showLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={olyPalette.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No comments yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share your thoughts
            </Text>
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
});

export default CommentBottomSheet;

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: olyPalette.background,
    borderTopLeftRadius: olyRadius.lg,
    borderTopRightRadius: olyRadius.lg,
  },
  handle: {
    backgroundColor: olyColors.text.disabled,
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: 100,
  },

  /* Header */
  heading: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    textAlign: "center",
    paddingVertical: olySpacing[12],
  },

  /* Empty state */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: olySpacing[40],
    paddingHorizontal: olySpacing[20],
    gap: olySpacing[8],
  },
  emptyTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  emptyText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
  },

  /* Footer input */
  footer: {
    borderTopWidth: 1,
    borderTopColor: olyColors.border.default,
    backgroundColor: olyPalette.background,
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: Platform.OS === "ios" ? olySpacing[24] : olySpacing[12],
  },
  replyStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    paddingBottom: olySpacing[8],
  },
  replyStripText: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
  replyStripName: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
  },
  messageInput: {
    flex: 1,
    ...olyTypography.bodySmall,
    color: olyColors.text.primary,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
    maxHeight: 100,
  },
  sendButton: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Loading */
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: olySpacing[40],
  },
});
