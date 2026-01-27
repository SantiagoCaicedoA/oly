import Header from "@/components/header";
import LiftDetailsCard from "@/components/lift-details";
import ProgressBar from "@/components/progress-bar";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
interface OnboardingScreen2Values {
  accuracy: "Tested" | "Estimated" | "Unsure";
  olympic_lifts: boolean[];
  squats: boolean[];
}

export default function OnboardingScreen2() {
  const { colors } = useTheme();
  const { showSuccess, showError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentFormData, setCurrentFormData] =
    useState<OnboardingScreen2Values | null>(null);
  const dispatch = useDispatch();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<OnboardingScreen2Values>({
    defaultValues: {
      accuracy: "Tested",
      olympic_lifts: [false, false, false, false, false, false],
      squats: [false, false],
    },
  });

  const pickVideo = async (formData: OnboardingScreen2Values) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your media library",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setIsUploading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setSelectedVideo(result.assets[0].uri);
        setCurrentFormData(formData);
        setShowSuccessModal(true);
      } catch (error) {
        showError("Failed to upload video");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveVideo = () => {
    if (currentFormData && selectedVideo) {
      dispatch(
        saveOnboardingData({
          ...currentFormData,
          video: selectedVideo,
        }),
      );

      setShowSuccessModal(false);
      showSuccess("Video saved successfully!");
      router.push("/auth/onboarding/onboarding-screen3");
    }
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setShowSuccessModal(false);
    showSuccess("Video removed!");
  };

  const showVideoOptions = (formData: OnboardingScreen2Values) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Add Video"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickVideo(formData);
          }
        },
      );
    } else {
      Alert.alert("Video Options", "Choose an action", [
        { text: "Cancel", style: "cancel" },
        { text: "Add Video", onPress: () => pickVideo(formData) },
      ]);
    }
  };

  const onSubmit = (data: OnboardingScreen2Values) => {
    const hasOlympicSelection = data.olympic_lifts.some(
      (lift) => lift === true,
    );
    const hasSquatSelection = data.squats.some((squat) => squat === true);

    if (!hasOlympicSelection && !hasSquatSelection) {
      showError("Please choose one lift before proceeding");
      return;
    }

    if (!selectedVideo) {
      showVideoOptions(data);
    } else {
      dispatch(
        saveOnboardingData({
          ...data,
          video: selectedVideo,
        }),
      );
      router.push("/auth/onboarding/onboarding-screen3");
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: scale(60),
      paddingHorizontal: scale(20),
    },
    formGroup: {
      marginVertical: scale(20),
      gap: scale(12),
    },
    loaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: scale(12),
      padding: scale(24),
      width: "85%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: scale(18),
      fontWeight: "600",
      color: colors.text,
      marginBottom: scale(12),
    },
    modalMessage: {
      fontSize: scale(14),
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: scale(24),
    },
    modalButtonsRow: {
      flexDirection: "row",
      gap: scale(12),
      width: "100%",
    },
    modalButton: {
      flex: 1,
      paddingVertical: scale(12),
      borderRadius: scale(8),
      alignItems: "center",
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    removeButton: {
      backgroundColor: colors.error || "#ff4444",
    },
    buttonText: {
      color: "#fff",
      fontSize: scale(14),
      fontWeight: "600",
    },
  });
  return (
    <View style={styles.container}>
      <ProgressBar totalSteps={7} currentStep={2} />

      <Header
        mainText="Current strength"
        subText="Used to guide training loads and progression."
      />

      <View style={styles.formGroup}>
        <Controller
          control={control}
          name="olympic_lifts"
          render={({ field: { value, onChange } }) => (
            <LiftDetailsCard
              title="Olympic Lifts"
              items={[
                { label: "Snatch", value: 123 },
                { label: "Power Snatch", value: 118 },
                { label: "Clean & Jerk", value: 155 },
                { label: "Clean", value: 160 },
                { label: "Power Clean", value: 155 },
                { label: "Jerk", value: 168 },
              ]}
              checkedValues={value}
              onToggle={(index) => {
                const updated = [...value];
                updated[index] = !updated[index];
                onChange(updated);
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="squats"
          render={({ field: { value, onChange } }) => (
            <LiftDetailsCard
              title="Squats"
              items={[
                { label: "Back Squat", value: 210 },
                { label: "Front Squat", value: 190 },
              ]}
              checkedValues={value}
              onToggle={(index) => {
                const updated = [...value];
                updated[index] = !updated[index];
                onChange(updated);
              }}
            />
          )}
        />

        {/* 👇 SAME CONTROLLER PATTERN */}
        <Controller
          control={control}
          name="accuracy"
          render={({ field: { value, onChange } }) => (
            <SegmentedSelector
              title="HOW ACCURATE ARE THESE NUMBERS?"
              selectedValue={value}
              onChange={onChange}
              options={[
                { label: "Tested", value: "Tested" },
                { label: "Estimated", value: "Estimated" },
                { label: "Unsure", value: "Unsure" },
              ]}
              segments={3}
            />
          )}
        />
      </View>
      <ActionButtonsRow onPrimaryPress={handleSubmit(onSubmit)} />
      {isUploading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#fff"} />
        </View>
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Video Uploaded Successfully!</Text>
            <Text style={styles.modalMessage}>
              Would you like to save this video or upload a different one?
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.removeButton]}
                onPress={handleRemoveVideo}
              >
                <Text style={styles.buttonText}>Remove Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveVideo}
              >
                <Text style={styles.buttonText}>Save & Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
