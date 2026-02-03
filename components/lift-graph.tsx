import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function LiftGraph() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
    },
    optionIcon: {
      width: scale(12),
      height: scale(15),
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",

      justifyContent: "space-between",
    },
    heading: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      lineHeight: Typography.lineHeight.normal,
      color: colors.text,
      width: scale(200),
    },
    graphContainer: {
      backgroundColor: colors.surface,
      paddingHorizontal: scale(25),
      borderRadius: scale(12),
      borderColor: colors.textSecondary,
      borderWidth: scale(0.3),
      paddingVertical: scale(15),
    },
    graph: {
      width: "100%",
      height: scale(140),
    },
  });
  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>
          Pause Power Snatch + Hang Power Snatch (1+1)
        </Text>
        <TouchableOpacity>
          <Image
            source={Images.optionicon}
            style={styles.optionIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.graphContainer}>
        <Image
          source={Images.bargraph}
          style={styles.graph}
          resizeMode="contain"
        />
      </View>
    </>
  );
}
