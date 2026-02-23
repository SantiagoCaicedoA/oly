import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
interface TalkToCoachProp {
  coach_note?: string;
}
export default function TalkToCoach({ coach_note }: TalkToCoachProp) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: scale(12),
      borderWidth: scale(0.3),
      borderColor: colors.textSecondary,
      paddingVertical: scale(22),
      paddingHorizontal: scale(10),
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: scale(15),
    },
    talkButton: {
      backgroundColor: colors.primary,
      paddingVertical: scale(10),
      borderRadius: scale(20),
      alignItems: "center",
      justifyContent: "center",
      maxWidth: scale(150),
      marginTop: scale(10),
    },
    buttonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    contextContainer: {
      flex: 1,
      gap: scale(5),
    },

    img: {
      width: scale(100),
      height: "100%",
      resizeMode: "contain",
    },

    note: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.medium,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    detail: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      textAlign: "left",
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.contextContainer}>
          <Text style={styles.note}>COACH'S NOTE</Text>
          <Text style={styles.detail}>{coach_note}</Text>
          <TouchableOpacity style={styles.talkButton}>
            <Text style={styles.buttonText}>TALK TO COACH</Text>
          </TouchableOpacity>
        </View>
        <Image source={Images.liftpic} style={styles.img} />
      </View>
    </View>
  );
}
