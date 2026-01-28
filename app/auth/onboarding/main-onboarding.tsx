import ProgressBar from "@/components/progress-bar";
import { useTheme } from "@/context/theme-context";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import OnboardingScreen1 from "./onboarding-screen1";
import OnboardingScreen2 from "./onboarding-screen2";
import OnboardingScreen3 from "./onboarding-screen3";
import OnboardingScreen4 from "./onboarding-screen4";
import OnboardingScreen5 from "./onboarding-screen5";
import OnboardingScreen6 from "./onboarding-screen6";
import OnboardingScreen7 from "./onboarding-screen7";

export default function MainOnboarding() {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: scale(60),
      paddingHorizontal: scale(20),
      paddingBottom: scale(30),
    },
  });

  const goToNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleFinishOnboarding = () => {
    router.push("/auth/onboarding/onboarding-screen8");
  };
  const renderScreen = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingScreen1 onComplete={goToNextStep} />;
      case 2:
        return (
          <OnboardingScreen2 onBack={goToPrevStep} onComplete={goToNextStep} />
        );
      case 3:
        return (
          <OnboardingScreen3 onBack={goToPrevStep} onComplete={goToNextStep} />
        );
      case 4:
        return (
          <OnboardingScreen4 onBack={goToPrevStep} onComplete={goToNextStep} />
        );
      case 5:
        return (
          <OnboardingScreen5 onBack={goToPrevStep} onComplete={goToNextStep} />
        );
      case 6:
        return (
          <OnboardingScreen6 onBack={goToPrevStep} onComplete={goToNextStep} />
        );
      case 7:
        return (
          <OnboardingScreen7
            onBack={goToPrevStep}
            onComplete={handleFinishOnboarding}
          />
        );
      default:
        return <OnboardingScreen1 onComplete={goToNextStep} />;
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar totalSteps={7} currentStep={currentStep} />
      {renderScreen()}
    </View>
  );
}
