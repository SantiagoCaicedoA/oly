import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function VolumeIntensity() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: scale(0.3),
      borderColor: colors.text,
      padding: scale(12),
      borderRadius: scale(6),
    },
    graph: {
      width: scale(100),
    },
  });
  return (
    <View>
      <Text>THIS WEEK VOLUME VS INTENSITY</Text>
      <View style={styles.container}>
        <Text>Peaking block: High intensity</Text>
        <Image source={Images.graph} style={styles.graph} />
      </View>
    </View>
  );
}
