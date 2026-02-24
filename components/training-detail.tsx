import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { getBarColor } from "@/utils/get-color";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
interface TrainingDetailProps {
  name: string;
  time: string;
  sets: string;
  onPress: () => void;
  percentage?: number;
}
export default function TrainingDetail({
  name,
  time,
  sets,
  onPress,
  percentage = 0,
}: TrainingDetailProps) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: scale(18),
      paddingVertical: scale(20),
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
      width: scale(10),
      height: scale(10),
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
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.rowContainer}>
        <View style={{ flexDirection: "row", gap: scale(8) }}>
          <View
            style={{
              height: scale(30),
              backgroundColor: getBarColor(percentage),
              width: scale(3),
            }}
          />
          <View>
            <Text style={styles.name}>{name}</Text>
            <View style={{ flexDirection: "row", gap: scale(5) }}>
              <Text style={styles.miniDetail}>{time}</Text>
              <Text style={styles.miniDetail}>{sets}</Text>
            </View>
          </View>
        </View>
        <Image
          source={Images.arrowforward}
          style={styles.arrowForward}
          tintColor={colors.text}
        />
      </View>
    </TouchableOpacity>
  );
}
