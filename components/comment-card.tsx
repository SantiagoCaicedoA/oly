import {
  olyTypography,
  olyFonts,
  olyLetterSpacing,
} from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import {
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} from "@/store/api";
import { RootState } from "@/store/store";
import { getRelativeTime } from "@/utils/time";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

/* ── Constants ──────────────────────────────────────── */
const AVATAR_SIZE = 32;
const REPLY_AVATAR_SIZE = 24;

export interface CommentData {
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
  replies?: CommentData[];
}

interface CommentCardProps {
  comment: CommentData;
  postId: string;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string, userName: string) => void;
  isReply?: boolean;
}

/* Derive a consistent color from a string (username) */
const AVATAR_COLORS = [
  olyPalette.primary,
  "rgba(0, 74, 173, 0.7)",
  "rgba(100, 130, 180, 0.8)",
  "rgba(75, 110, 160, 0.9)",
  "rgba(50, 90, 150, 0.8)",
  "rgba(0, 74, 173, 0.5)",
];

function getAvatarColor(name?: string): string {
  if (!name) return olyPalette.primary;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

export default function CommentCard({
  comment,
  postId,
  onDelete,
  onReply,
  isReply = false,
}: CommentCardProps) {
  const loggedInUserId = useSelector(
    (state: RootState) => state.auth.user?._id,
  );
  const isOwner = loggedInUserId === comment.user._id;
  const [deleteComment, { isLoading: isDeleting }] =
    useDeleteCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();

  const [optimisticLiked, setOptimisticLiked] = useState(comment.is_liked ?? false);
  const [optimisticCount, setOptimisticCount] = useState(comment.likes_count ?? 0);

  const handleDelete = async () => {
    try {
      await deleteComment({ postId, commentId: comment._id }).unwrap();
      onDelete?.(comment._id);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleLike = async () => {
    const wasLiked = optimisticLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    try {
      if (wasLiked) {
        await unlikeComment({ postId, commentId: comment._id }).unwrap();
      } else {
        await likeComment({ postId, commentId: comment._id }).unwrap();
      }
    } catch (error: any) {
      const msg = error?.data?.message ?? "";
      const isAlreadyLiked = msg === "You already liked this comment";
      const isNotLiked = msg === "You have not liked this comment";
      if (!isAlreadyLiked && !isNotLiked) {
        setOptimisticLiked(wasLiked);
        setOptimisticCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      }
    }
  };

  const avatarSize = isReply ? REPLY_AVATAR_SIZE : AVATAR_SIZE;

  const displayText = comment.text;

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteAction, { opacity: isDeleting ? 0.5 : 1 }]}
      onPress={handleDelete}
      disabled={isDeleting}
      activeOpacity={0.7}
    >
      {isDeleting ? (
        <ActivityIndicator size="small" color={olyPalette.white} />
      ) : (
        <Text style={styles.deleteText}>Delete</Text>
      )}
    </TouchableOpacity>
  );

  const content = (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: getAvatarColor(comment.user.name),
            width: avatarSize,
            height: avatarSize,
          },
        ]}
      >
        <Text style={[styles.avatarText, isReply && styles.replyAvatarText]}>
          {getInitials(comment.user.name)}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name + Comment inline */}
        <Text style={[styles.commentLine, isReply && styles.replyCommentLine]}>
          <Text style={styles.userName}>@{comment.user.name} </Text>
          <Text style={[styles.commentText, isReply && styles.replyCommentText]}>
            {displayText}
          </Text>
        </Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {getRelativeTime(comment.createdAt)}
          </Text>
          {optimisticCount > 0 && (
            <Text style={styles.metaText}>
              {optimisticCount}{" "}
              {optimisticCount === 1 ? "like" : "likes"}
            </Text>
          )}
          {!isReply && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onReply?.(comment._id, comment.user.name)}
            >
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Like button */}
      <TouchableOpacity style={styles.likeButton} onPress={handleLike} activeOpacity={0.7}>
        <Ionicons
          name={optimisticLiked ? "heart" : "heart-outline"}
          size={isReply ? 14 : 16}
          color={
            optimisticLiked ? olyPalette.white : olyColors.text.disabled
          }
        />
      </TouchableOpacity>
    </View>
  );

  const replies = comment.replies ?? [];

  return (
    <View style={!isReply ? styles.parentWrapper : undefined}>
      {isOwner ? (
        <Swipeable renderRightActions={renderRightActions}>
          {content}
        </Swipeable>
      ) : (
        content
      )}

      {/* Nested replies */}
      {!isReply && replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {replies.map((reply: CommentData) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              postId={postId}
              onDelete={onDelete}
              onReply={onReply}
              isReply
            />
          ))}
        </View>
      )}
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* Parent comment wrapper */
  parentWrapper: {
    paddingBottom: olySpacing[4],
    marginBottom: olySpacing[4],
  },

  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: olySpacing[12],
    gap: olySpacing[12],
  },
  replyContainer: {
    paddingVertical: olySpacing[8],
    gap: olySpacing[8],
  },

  /* Avatar */
  avatar: {
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
  },
  replyAvatarText: {
    fontSize: olyTypography.caption.fontSize,
    lineHeight: olyTypography.caption.lineHeight,
  },

  /* Content */
  content: {
    flex: 1,
    gap: olySpacing[4],
  },
  commentLine: {
    ...olyTypography.bodySmall,
    color: olyColors.text.primary,
    lineHeight: 20,
  },
  userName: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  commentText: {
    fontFamily: olyFonts.regular,
    color: olyColors.text.secondary,
  },
  replyCommentLine: {
    ...olyTypography.caption,
    lineHeight: 18,
  },
  replyCommentText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Meta */
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
  },
  metaText: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
  replyText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },

  /* Like */
  likeButton: {
    paddingTop: olySpacing[4],
  },

  /* Replies */
  repliesContainer: {
    marginLeft: AVATAR_SIZE + olySpacing[12],
    borderLeftWidth: 1,
    borderLeftColor: olyColors.border.default,
    paddingLeft: olySpacing[12],
  },

  /* Delete action */
  deleteAction: {
    backgroundColor: olyPalette.red,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: olyRadius.lg,
    marginLeft: olySpacing[8],
  },
  deleteText: {
    ...olyTypography.label,
    color: olyPalette.white,
  },
});
