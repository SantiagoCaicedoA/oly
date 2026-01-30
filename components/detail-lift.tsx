import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";

interface DetailLiftProps {
  icon: ImageSourcePropType;
  label: string;
  value: number | string;
  unit?: string;
}

const DetailLift: React.FC<DetailLiftProps> = ({
  icon,
  label,
  value,
  unit,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: scale(12),
      borderWidth: 0.3,
      borderColor: colors.text,
      paddingHorizontal: scale(12),
      paddingVertical: scale(15),
    },
    icon: {
      width: scale(18),
      height: scale(18),
    },
    row: {
      flexDirection: "row",
      gap: scale(7),
      alignItems: "center",
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    label: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    value: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    unit: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.row}>
          <Image source={icon} style={styles.icon} />
          <Text style={styles.label}>{label.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: scale(3) }}>
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
      </View>
    </View>
  );
};

export default DetailLift;
