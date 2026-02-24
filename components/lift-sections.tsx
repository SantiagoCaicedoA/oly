import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

type LiftDetail = {
  liftName: string;
  weight: number;
};

type LiftSectionsProps = {
  title: string;
  liftDetails: LiftDetail[];
  onArrowPress?: () => void;
};

export default function LiftSections({
  title,
  liftDetails,
  onArrowPress,
}: LiftSectionsProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    heading: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
    container: {
      backgroundColor: colors.surface,
      borderWidth: scale(0.3),
      borderColor: colors.text,
      padding: scale(12),
      borderRadius: scale(6),
      marginTop: scale(6),
    },
    rowContainer: {
      flexDirection: "row",
      gap: scale(5),
    },
    thumbnail: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(10),
      backgroundColor: "white",
    },
    liftName: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    liftDetail: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
    arrowForward: {
      width: scale(10),
      height: scale(10),
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginRight: scale(3),
    },
    liftInfo: {
      gap: scale(5),
    },
  });

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{title}</Text>
        <TouchableOpacity onPress={onArrowPress}>
          <Image source={Images.arrowforward} style={styles.arrowForward} />
        </TouchableOpacity>
      </View>

      {liftDetails.map((detail, index) => (
        <View key={index} style={styles.container}>
          <View style={styles.rowContainer}>
            <View style={styles.thumbnail} />
            <View style={styles.liftInfo}>
              <Text style={styles.liftName}>{detail.liftName}</Text>
              <Text style={styles.liftDetail}>{detail.weight}kg x 1rep</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
