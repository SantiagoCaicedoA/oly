import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: olySpacing[8],
  },
  secondaryButton: {
    flex: 1,
    height: olyLayout.inputHeight,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.bg.activeHighlight,
    alignItems: "center",
    justifyContent: "center",
    borderColor: olyColors.border.brandUnselected,
    borderWidth: 1,
  },
  primaryButton: {
    flex: 1,
    height: olyLayout.inputHeight,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.button.primary.bg,
  },
  secondaryText: {
    ...olyTypography.button,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  primaryText: {
    ...olyTypography.button,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
});

export default ActionButtonsRow;
