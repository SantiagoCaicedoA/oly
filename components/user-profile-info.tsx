import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function UserProfileInfo() {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: scale(15),
    },
    imageContainer: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(40),
    },
    image: {
      width: scale(60),
      height: scale(60),
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    userName: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    followers: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    count: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    bio: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    roleContainer: {
      paddingHorizontal: scale(15),
      paddingVertical: scale(2),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(12),
    },
    roleText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },

    contentWrapper: {
      gap: scale(10),
      flex: 1,
    },
    nameBlock: {
      gap: scale(5),
    },
    nameRow: {
      flexDirection: "row",
      gap: scale(15),
    },
    statsRow: {
      flexDirection: "row",
      gap: scale(15),
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View>
          <Image source={Images.profile} style={styles.image} />
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Oscar Figueroa</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.roleText}>Athlete</Text>
              </View>
            </View>

            <Text style={styles.userName}>@oscar.figueroa</Text>
          </View>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.followers}>FOLLOWERS</Text>
              <Text style={styles.count}>112</Text>
            </View>
            <View>
              <Text style={styles.followers}>FOLLOWING</Text>
              <Text style={styles.count}>112</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.bio}>
        Olympic gold medalist in weightlifting. Passionate about fitness and
        inspiring others.
      </Text>
    </>
  );
}
