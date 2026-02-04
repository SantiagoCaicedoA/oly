import { Images } from "@/assets";
import ActionSheet from "@/components/action-sheet";
import ExerciseSection from "@/components/exercise-section";
import LiftGraph from "@/components/lift-graph";
import SetDetail from "@/components/set-detail";
import TalkToCoach from "@/components/talk-to-coach";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

export default function TrainingExercise() {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleAddSet = () => {
    bottomSheetRef.current?.present();
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
    footer: {
      borderTopColor: colors.text,
      borderTopWidth: scale(0.6),
      flexDirection: "row",
      paddingHorizontal: scale(12),
      alignItems: "center",
      justifyContent: "space-between",
    },
    icon: {
      width: scale(30),
      height: scale(12),
      resizeMode: "contain",
    },
    timerContainer: {
      borderColor: colors.text,
      borderWidth: scale(0.5),
      borderRadius: scale(15),
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-evenly",
      paddingVertical: scale(12),
      paddingHorizontal: scale(15),
    },
    divider: {
      height: scale(15),

      borderColor: colors.text,
      borderWidth: scale(0.3),
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Image
                source={Images.arrowBack}
                style={{ width: "100%", height: "100%" }}
              />
            </TouchableOpacity>

            <Text style={styles.headerText}>LIFT</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ExerciseSection />
            <LiftGraph />
            <TalkToCoach />
            <SetDetail />
            <SetDetail />
            <SetDetail />
            <SetDetail />
            <CustomButton title="ADD SET" onPress={handleAddSet} />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity>
              <Image source={Images.arrowBack} style={styles.icon} />
              <Text>BACK</Text>
            </TouchableOpacity>
            <View style={styles.timerContainer}>
              <Image source={Images.alarmicon} style={styles.icon} />
              <Text>START</Text>
              <View style={styles.divider}></View>
              <TouchableOpacity>
                <Image source={Images.arrowBack} style={styles.icon} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Image source={Images.arrowforward} style={styles.icon} />
              <Text>NEXT</Text>
            </TouchableOpacity>
          </View>
          <ActionSheet ref={bottomSheetRef} />
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
