import { Images } from "@/assets";
import SuggestedExerciseCard from "@/components/suggested-exercise-card";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

export default function AddExercise() {
  const { colors } = useTheme();
  const handleBackPress = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(10),
      position: "relative",
      backgroundColor: colors.headerBackground,
    },
    backButton: {
      position: "absolute",
      left: scale(15),
      width: scale(12),
      height: scale(12),
    },
    headerText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
      textAlign: "center",
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image
            source={Images.arrowBack}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>

        <Text style={styles.headerText}>EXERCISE</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SuggestedExerciseCard />
      </ScrollView>
    </SafeAreaView>
  );
}
