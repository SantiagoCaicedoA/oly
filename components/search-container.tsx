import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { scale } from "react-native-size-matters";

type SearchContainerProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
};

export default function SearchContainer({
  value,
  onChangeText,
  placeholder = "Search exercises...",
  style,
}: SearchContainerProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: scale(0.4),
      borderColor: colors.text,
      borderRadius: scale(25),
      paddingHorizontal: scale(16),
      paddingVertical: scale(15),
    },
    input: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text}
        style={styles.input}
      />
    </View>
  );
}
