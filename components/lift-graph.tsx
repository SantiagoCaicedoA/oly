import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
interface LiftGraphProps {
  liftName: string;
}
export default function LiftGraph({ liftName }: LiftGraphProps) {
  const { colors } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  const handleOutsidePress = () => {
    if (showOptions) {
      setShowOptions(false);
    }
  };
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
      marginBottom: scale(8),
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
    optionsWrapper: {
      position: "relative",
    },
    dropdownText: {
      color: colors.text,
      fontSize: Typography.fontSize.md,
    },
    dropdown: {
      position: "absolute",
      top: scale(25),
      right: 0,
      backgroundColor: colors.surface,
      paddingHorizontal: scale(14),
      paddingVertical: scale(10),
      borderRadius: scale(8),
      minWidth: scale(120),
      zIndex: 999,
      elevation: 8,
      alignItems: "center",
    },
    wrapper: {
      flex: 0,
    },
  });
  return (
    <Pressable style={styles.wrapper} onPress={handleOutsidePress}>
      <>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>{liftName}</Text>
        </View>

        <View style={styles.graphContainer}>
          <Image
            source={Images.bargraph}
            style={styles.graph}
            resizeMode="contain"
          />
        </View>
      </>
    </Pressable>
  );
}
