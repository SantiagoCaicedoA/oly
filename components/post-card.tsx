import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function PostCard() {
  const { colors } = useTheme();

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
    image: {
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
    <View style={styles.container}>
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
            <Text style={styles.name}>Athlete name</Text>
            <Text style={styles.time}>6m</Text>
          </View>

          <Text style={styles.userName}>@username</Text>
        </View>
        <Image source={Images.arrowforward} style={styles.arrowForward} />
      </View>

      <Text style={styles.caption}>
        Third complex rep out of four at 103 kg. Focused on staying smooth and
        consistent throughout the set.
      </Text>
      <Image source={Images.man} style={styles.image} resizeMode="cover" />
      <View style={styles.iconContainer}>
        <Image source={Images.like} style={styles.icon} />
        <Text style={styles.count}>12</Text>
        <Image source={Images.comment} style={styles.icon} />
        <Text style={styles.count}>3</Text>
      </View>
    </View>
  );
}
