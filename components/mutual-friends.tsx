import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function MutualFriends() {
  const { colors } = useTheme();
  const onArrowPress = () => {};
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: scale(0.3),
      borderColor: colors.text,
      padding: scale(12),
      borderRadius: scale(6),
      marginTop: scale(6),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    heading: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
    text: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
      flex: 1,
      flexWrap: "wrap",
    },
    image: {
      width: scale(30),
      height: scale(30),
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginRight: scale(3),
    },
    arrowForward: {
      width: scale(10),
      height: scale(10),
    },
  });
  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>MUTUAL FRIENDS</Text>
        <TouchableOpacity onPress={onArrowPress}>
          <Image source={Images.arrowforward} style={styles.arrowForward} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={{ flexDirection: "row" }}>
          {[1, 2, 3].map((_, index) => (
            <Image
              key={index}
              source={Images.profile}
              style={[styles.image, index !== 0 && { marginLeft: -scale(10) }]}
            />
          ))}
        </View>

        <Text style={styles.text}>
          Followed by Luis Mosquers and 12 others you know
        </Text>
      </View>
    </View>
  );
}
