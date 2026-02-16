import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
interface CoachNoteProps {
  coach_note: string;
  key_cues: string[];
}
export default function CoachNote({ coach_note, key_cues }: CoachNoteProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: scale(0.3),
      borderColor: colors.text,
      padding: scale(12),
      borderRadius: scale(6),
      marginTop: scale(6),
    },
    heading: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scale(6),
    },
    profile: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      marginRight: scale(10),
    },
    userInfo: {
      flex: 1,
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    userName: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    caption: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      marginBottom: scale(12),
    },
    keyContainer: {
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(6),
      paddingHorizontal: scale(13),
      paddingVertical: scale(10),
    },
    dotContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
    },
    keyCues: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    dot: {
      backgroundColor: colors.primary,
      width: scale(5),
      height: scale(5),
      borderRadius: scale(5),
    },
    point: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: scale(12),
    },
    talkButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: scale(10),
      paddingVertical: scale(5),
      borderRadius: scale(20),
    },
    buttonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    scale: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
  });
  return (
    <View>
      <Text style={styles.heading}>COACH NOTE</Text>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={Images.profile} style={styles.profile} />
          <View style={styles.userInfo}>
            <View
              style={{
                flexDirection: "row",
                gap: scale(7),
                alignItems: "center",
              }}
            >
              <Text style={styles.name}>Roger Waters</Text>
            </View>

            <Text style={styles.userName}>Coach</Text>
          </View>
        </View>
        <Text style={styles.caption}>{coach_note}</Text>
        <View style={styles.keyContainer}>
          <Text style={styles.keyCues}>KEY CUES</Text>
          <View style={{ padding: scale(6), gap: scale(5) }}>
            {key_cues.map((cue, index) => (
              <View key={index} style={styles.dotContainer}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.point}>{cue}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={{ gap: scale(2) }}>
            <Text style={styles.scale}>Need to scale?</Text>
            <Text style={styles.point}>Felling sluggish today?</Text>
          </View>
          <TouchableOpacity style={styles.talkButton}>
            <Text style={styles.buttonText}>TALK TO COACH</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
