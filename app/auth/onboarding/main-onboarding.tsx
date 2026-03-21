import { OlyProgressDots } from "@/src/oly-components/atoms/OlyProgressDots";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import OnboardingScreen1 from "./onboarding-screen1";
import OnboardingScreen2 from "./onboarding-screen2";
import OnboardingScreen3 from "./onboarding-screen3";
import OnboardingScreen4 from "./onboarding-screen4";
import OnboardingScreen5 from "./onboarding-screen5";
import OnboardingScreen6 from "./onboarding-screen6";
import OnboardingScreen7 from "./onboarding-screen7";

export default function MainOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { name, email } = useLocalSearchParams<{
    name?: string;
    email?: string;
  }>();

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
        return (
          <OnboardingScreen1
            onComplete={goToNextStep}
            name={name}
            email={email}
          />
        );
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
    <OlyScreenWrapper>
      <View style={styles.dotsContainer}>
        {/* OlyProgressDots is 0-indexed, currentStep is 1-indexed */}
        <OlyProgressDots totalSteps={7} currentStep={currentStep - 1} />
      </View>
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </OlyScreenWrapper>
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    marginTop: olySpacing[16],
    marginBottom: olySpacing[20],
  },
  content: {
    flex: 1,
  },
});
