import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { getRelativeTime } from "@/utils/time";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
interface CommentCardProps {
  comment: {
    _id: string;
    text: string;
    user: {
      username: string;
      profile_image?: string;
    };
    createdAt: string;
    likes_count: number;
    is_liked: boolean;
    replies?: any[];
  };
  postId: string;
}
export default function CommentCard({ comment, postId }: CommentCardProps) {
  const { colors } = useTheme();
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
  });

  return (
    <>
      <View style={styles.container}>
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
              <Text style={styles.text}>
                {getRelativeTime(comment.createdAt)}
              </Text>

              <Text style={styles.text}>1 like</Text>
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
}
