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

      borderColor: "transparent",
    },
    currentStep: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(16),
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: `${colors.primary}4D`,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 20,
    },
    neighborStep: {
      width: moderateScale(10),
      height: moderateScale(10),
      borderRadius: moderateScale(6),
      backgroundColor: `${colors.primary}4D`,
      borderWidth: 0.5,
      borderColor: colors.primary,
    },
  });

  return <View style={styles.container}>{renderSteps()}</View>;
};

export default ProgressBar;
