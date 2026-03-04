import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { useDeleteCommentMutation } from "@/store/api";
import { RootState } from "@/store/store";
import { Typography } from "@/utils/custom-styles";
import { getRelativeTime } from "@/utils/time";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";
interface CommentCardProps {
  comment: {
    _id: string;
    text: string;
    user: {
      _id: string;
      name: string;
      profile_image?: string;
    };
    createdAt: string;
    likes_count: number;
    is_liked: boolean;
    replies?: any[];
  };
  postId: string;
  onDelete?: (commentId: string) => void;
}
export default function CommentCard({
  comment,
  postId,
  onDelete,
}: CommentCardProps) {
  const { colors } = useTheme();
  const loggedInUserId = useSelector(
    (state: RootState) => state.auth.user?._id,
  );
  const isOwner = loggedInUserId === comment.user._id;
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const handleDelete = async () => {
    try {
      await deleteComment({ postId, commentId: comment._id }).unwrap();
      onDelete?.(comment._id);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteContainer, { opacity: isDeleting ? 0.5 : 1 }]}
      onPress={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <Text style={styles.deleteText}>Delete</Text>
      )}
    </TouchableOpacity>
  );
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: scale(10),
    },
    profileIcon: {
      width: scale(25),
      height: scale(25),
    },
    rowContainer: {
      flexDirection: "row",
      gap: scale(6),
      alignItems: "center",
    },
    userName: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    comment: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    text: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    likeIcon: {
      width: scale(18),
      height: scale(18),
    },
    replyContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginLeft: scale(20),
      padding: scale(10),
    },
    commentHeading: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
      textAlign: "center",
      marginVertical: scale(10),
    },
    deleteText: {
      color: colors.text,
      fontWeight: Typography.fontWeight.bold,
    },
    deleteContainer: {
      backgroundColor: colors.red,
      justifyContent: "center",
      alignItems: "center",
      width: scale(80),
      borderRadius: scale(8),
    },
  });
  const content = (
    <>
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Image source={Images.profile} style={styles.profileIcon} />
          <View>
            <Text style={styles.userName}>{comment.user.name}</Text>
            <View
              style={{
                flexDirection: "row",
                gap: scale(12),
                marginTop: scale(6),
              }}
            >
              <Text style={styles.text}>
                {getRelativeTime(comment.createdAt)}
              </Text>

              <Text style={styles.text}>like</Text>
            </View>
          </View>
          <View>
            <Text style={styles.comment}>{comment.text}</Text>
            <TouchableOpacity style={{ marginTop: scale(6) }}>
              <Text style={styles.text}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* <TouchableOpacity>
          <Image source={Images.like} style={styles.likeIcon} />
        </TouchableOpacity> */}
      </View>
      {/* reply part */}
      {/* <View style={styles.replyContainer}>
        <View style={styles.rowContainer}>
          <Image source={Images.profile} style={styles.profileIcon} />
          <View>
            <Text style={styles.userName}>@username</Text>
            <View
              style={{
                flexDirection: "row",
                gap: scale(12),
                marginTop: scale(6),
              }}
            >
              <Text style={styles.text}>2h</Text>
              <Text style={styles.text}>1 like</Text>
            </View>
          </View>
          <View>
            <Text style={styles.comment}>Thanks brother</Text>
            <TouchableOpacity style={{ marginTop: scale(6) }}>
              <Text style={styles.text}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity>
          <Image source={Images.like} style={styles.likeIcon} />
        </TouchableOpacity>
      </View> */}
    </>
  );
  return isOwner ? (
    <Swipeable renderRightActions={renderRightActions}>{content}</Swipeable>
  ) : (
    content
  );
}
