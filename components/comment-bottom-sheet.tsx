import { TabBarContext } from "@/app/(tabs)/_layout";
import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import {
  useCommentOnPostMutation,
  useDeleteCommentMutation,
  useGetCommentsQuery,
} from "@/store/api";
import { Typography } from "@/utils/custom-styles";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import CommentCard from "./comment-card";
interface CommentBottomSheetProps {
  postId: string;
}
const CommentBottomSheet = forwardRef<
  BottomSheetModal,
  CommentBottomSheetProps
>(({ postId }, ref) => {
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const { hideTabBar, showTabBar } = useContext(TabBarContext);
  const commentInputRef = useRef<any>(null);
  const commentText = useRef("");

  const [commentOnPost, { isLoading }] = useCommentOnPostMutation();
  const { data: commentsData } = useGetCommentsQuery(
    { postId },
    { skip: !enabled },
  );
  const [deleteComment] = useDeleteCommentMutation();
  useEffect(() => {
    if (commentsData) {
    }
  }, [commentsData]);

  const comments = commentsData?.data ?? [];
  const handleSendComment = async () => {
    if (!commentText.current.trim()) return;
    try {
      await commentOnPost({ postId, text: commentText.current }).unwrap();
      commentText.current = "";
      commentInputRef.current?.clear();
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const styles = StyleSheet.create({
    contentContainer: {
      paddingHorizontal: scale(10),
      paddingBottom: scale(80),
    },
    footer: {
      borderTopColor: colors.text,
      borderTopWidth: scale(1),
      backgroundColor: colors.headerBackground,
      paddingHorizontal: scale(10),
      paddingVertical: scale(20),
      paddingBottom: Platform.OS === "ios" ? scale(10) : scale(10),
    },
    messageContainer: {
      flex: 1,
      borderColor: colors.text,
      borderWidth: scale(1),
      borderRadius: scale(15),
      padding: scale(15),
      color: colors.text,
    },
    sendIcon: {
      width: scale(20),
      height: scale(20),
    },
    sendContainer: {
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(25),
      alignItems: "center",
      justifyContent: "center",
      padding: scale(12),
    },
    commentHeading: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
      textAlign: "center",
      marginVertical: scale(10),
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(40),
      paddingHorizontal: scale(20),
    },
    emptyTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      marginBottom: scale(8),
    },
    emptyText: {
      fontSize: Typography.fontSize.md,
      textAlign: "center",
    },
    loaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      borderRadius: scale(15),
      backgroundColor: "rgba(0, 0, 0, 0.35)",
    },
  });
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No comments yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Be the first to share your thoughts
      </Text>
    </View>
  );
  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footer}>
          <View
            style={{
              flexDirection: "row",
              gap: scale(5),
              alignItems: "center",
            }}
          >
            <BottomSheetTextInput
              style={styles.messageContainer}
              placeholder="Message"
              placeholderTextColor={colors.textSecondary}
              onChangeText={(text) => {
                commentText.current = text;
              }}
              ref={commentInputRef}
              multiline
            />

            <TouchableOpacity
              style={styles.sendContainer}
              onPress={handleSendComment}
              disabled={isLoading}
            >
              <Image source={Images.send} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [colors, isLoading],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      onChange={(index) => {
        if (index >= 0) setEnabled(true);
        else setEnabled(false);
      }}
      enableDynamicSizing={false}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.text }}
      footerComponent={renderFooter}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose={true}
      enableDismissOnClose={true}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <>
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          <Text style={styles.commentHeading}>Comments</Text>
          {comments.length === 0
            ? renderEmptyState()
            : comments.map((comment: any) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  postId={postId}
                />
              ))}
        </>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default CommentBottomSheet;
