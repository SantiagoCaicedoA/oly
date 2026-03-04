import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { useLikePostMutation, useUnLikePostMutation } from "@/store/api";
import { Typography } from "@/utils/custom-styles";
import { getRelativeTime } from "@/utils/time";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
import CommentBottomSheet from "./comment-bottom-sheet";

interface PostCardProps {
  post: {
    _id: string;
    video_url: string;
    opinion: string;
    lift_name: string;
    session_detail: any;
    createdAt: string;
    username: string;
    name: string;
    isLiked: boolean;
    commentCount: number;
    likeCount: number;
    country: string;
  };
  onPress?: (post_id: string) => void;
}

export default function PostCard({ post, onPress }: PostCardProps) {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnLikePostMutation();
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  useEffect(() => {
    setIsLiked(post.isLiked ?? false);
  }, [post.isLiked]);
  const handlePress = () => {
    if (onPress) {
      onPress(post._id);
    }
  };
  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
      try {
        await unlikePost(post._id).unwrap();
      } catch (error) {
        console.error("Unlike error:", error);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      try {
        await likePost(post._id).unwrap();
      } catch (error) {
        console.error("Like error:", error);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }
  };

  const handleCommentPress = () => {
    bottomSheetRef.current?.present();
  };

  const handleVideoPress = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: scale(12),
      borderColor: colors.text,
      borderWidth: 0.3,
      padding: scale(12),
      marginBottom: scale(15),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scale(6),
    },
    profile: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      marginRight: scale(10),
    },
    userInfo: {
      flex: 1,
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    userName: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    caption: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      marginBottom: scale(12),
    },
    video: {
      width: "100%",
      height: scale(400),
      borderRadius: scale(12),
    },
    icon: {
      width: scale(18),
      height: scale(18),
    },
    iconContainer: {
      flexDirection: "row",
      gap: scale(9),
      alignItems: "center",
      marginTop: scale(12),
    },
    count: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    arrowForward: {
      width: scale(7),
      height: scale(7),
    },
    time: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Image source={Images.profile} style={styles.profile} />
        <View style={styles.userInfo}>
          <View
            style={{
              flexDirection: "row",
              gap: scale(7),
              alignItems: "center",
            }}
          >
            <Text style={styles.name}>{post.username}</Text>
            <Text style={styles.time}>{getRelativeTime(post.createdAt)}</Text>
          </View>
          <Text style={styles.userName}>{post.country}</Text>
        </View>
        <Image source={Images.arrowforward} style={styles.arrowForward} />
      </View>
      {post.opinion && <Text style={styles.caption}>{post.opinion}</Text>}

      <TouchableOpacity onPress={handleVideoPress} activeOpacity={0.9}>
        <Video
          ref={videoRef}
          source={{ uri: post.video_url }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping
          useNativeControls={false}
        />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleLike}>
          <Image
            source={isLiked ? Images.likeicon : Images.like}
            style={styles.icon}
          />
        </TouchableOpacity>
        <Text style={styles.count}>{likeCount}</Text>

        <TouchableOpacity onPress={handleCommentPress}>
          <Image source={Images.comment} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.count}>{post.commentCount}</Text>
      </View>

      <CommentBottomSheet ref={bottomSheetRef} postId={post._id} />
    </TouchableOpacity>
  );
}
