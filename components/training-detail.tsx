import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function TrainingDetail() {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: scale(15),
      paddingVertical: scale(10),
      backgroundColor: colors.surface,
      borderRadius: scale(12),
      borderWidth: scale(0.3),
      borderColor: colors.textSecondary,
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    arrowForward: {
      width: scale(7),
      height: scale(7),
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    miniDetail: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.light,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
  });
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={{ flexDirection: "row", gap: scale(8) }}>
          <View
            style={{ height: 35, backgroundColor: colors.primary, width: 3 }}
          ></View>
          <View>
            <Text style={styles.name}>Mobility & Warmup</Text>
            <View style={{ flexDirection: "row", gap: scale(2) }}>
              <Text style={styles.miniDetail}>15 min</Text>
              <Text style={styles.miniDetail}>15 min</Text>
            </View>
          </View>
        </View>
        <Image source={Images.arrowforward} style={styles.arrowForward} />
      </View>
    </TouchableOpacity>
  );
}
