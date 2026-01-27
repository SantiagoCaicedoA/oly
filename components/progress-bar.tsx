import { useTheme } from "@/context/theme-context";
import React from "react";
import { StyleSheet, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  totalSteps,
  currentStep,
}) => {
  const { colors } = useTheme();

  const renderSteps = () => {
    const steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      let stepStyle;

      if (i === currentStep) {
        stepStyle = styles.currentStep;
      } else {
        stepStyle = styles.neighborStep;
      }

      steps.push(<View key={i} style={[styles.step, stepStyle]} />);
    }
    return steps;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(20),
      marginBottom: moderateScale(20),
    },
    step: {
      width: moderateScale(10),
      height: moderateScale(10),
      borderRadius: moderateScale(6),
      marginHorizontal: moderateScale(8),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    currentStep: {
      width: moderateScale(16),
      height: moderateScale(16),
      borderRadius: moderateScale(8),
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    neighborStep: {
      width: moderateScale(10),
      height: moderateScale(10),
      borderRadius: moderateScale(6),
      backgroundColor: colors.lightBlue,
      borderWidth: 2,
      borderColor: colors.primary,
    },
  });

  return <View style={styles.container}>{renderSteps()}</View>;
};

export default ProgressBar;
