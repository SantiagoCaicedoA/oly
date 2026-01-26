import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

type ActionButtonsRowProps = {
  primaryTitle?: string;
  secondaryTitle?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  primaryTitle = "Save",
  secondaryTitle = "Back",
  onPrimaryPress,
  onSecondaryPress,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: scale(5),
    },
    secondaryButton: {
      flex: 1,
      height: scale(33),
      borderRadius: scale(25),
      backgroundColor: colors.lightBlue,
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.primary,
      borderWidth: 0.5,
    },
    primaryButton: {
      flex: 1,
      height: scale(33),
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    secondaryText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    primaryText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.secondaryButton}
        activeOpacity={0.85}
        onPress={onSecondaryPress ?? router.back}
      >
        <Text style={styles.secondaryText}>{secondaryTitle.toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.9}
        onPress={onPrimaryPress}
      >
        <Text style={styles.primaryText}>{primaryTitle.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtonsRow;
