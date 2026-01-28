import Header from "@/components/header";
import LiftDetailsCard from "@/components/lift-details";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
interface OnboardingScreen2Props {
  onBack?: () => void;
  onComplete?: () => void;
}
interface OnboardingScreen2Values {
  accuracy: "Tested" | "Estimated" | "Unsure";
  olympic_lifts: boolean[];
  squats: boolean[];
}

type LiftCategory = "olympic" | "squat";

interface LiftIdentifier {
  category: LiftCategory;
  index: number;
  label: string;
}

const OLYMPIC_LIFTS = [
  "Snatch",
  "Power Snatch",
  "Clean & Jerk",
  "Clean",
  "Power Clean",
  "Jerk",
];

const SQUAT_LIFTS = ["Back Squat", "Front Squat"];

export default function OnboardingScreen2({
  onComplete,
  onBack,
}: OnboardingScreen2Props) {
  const { colors } = useTheme();
  const { showSuccess, showError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [liftVideos, setLiftVideos] = useState<Record<string, string>>({});
  const [currentLift, setCurrentLift] = useState<LiftIdentifier | null>(null);
  const dispatch = useDispatch();

  const { control, handleSubmit, watch, setValue } =
    useForm<OnboardingScreen2Values>({
      defaultValues: {
        accuracy: "Tested",
        olympic_lifts: [false, false, false, false, false, false],
        squats: [false, false],
      },
    });

  const getLiftKey = (lift: LiftIdentifier): string => {
    return `${lift.category}_${lift.index}`;
  };

  const pickVideo = async (lift: LiftIdentifier) => {
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
      setCurrentLift(lift);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const key = getLiftKey(lift);
        setLiftVideos((prev) => ({
          ...prev,
          [key]: result.assets[0].uri,
        }));
        setShowSuccessModal(true);
      } catch (error) {
        showError("Failed to upload video");
        setCurrentLift(null);
      } finally {
        setIsUploading(false);
      }
    } else {
      setCurrentLift(null);
    }
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    setCurrentLift(null);
    showSuccess("Video saved!");
  };

  const handleRemoveVideo = () => {
    if (currentLift) {
      const key = getLiftKey(currentLift);
      setLiftVideos((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      const fieldName =
        currentLift.category === "olympic" ? "olympic_lifts" : "squats";
      const currentValues = watch(fieldName);
      const updated = [...currentValues];
      updated[currentLift.index] = false;
      setValue(fieldName, updated);
    }
    setShowSuccessModal(false);
    setCurrentLift(null);
    showSuccess("Video removed!");
  };

  const showVideoOptions = (lift: LiftIdentifier) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Add Video"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickVideo(lift);
          }
        },
      );
    } else {
      Alert.alert("Video Options", "Choose an action", [
        { text: "Cancel", style: "cancel" },
        { text: "Add Video", onPress: () => pickVideo(lift) },
      ]);
    }
  };

  const handleLiftToggle = (
    category: LiftCategory,
    index: number,
    isChecked: boolean,
    onChange: (value: boolean[]) => void,
    currentValues: boolean[],
  ) => {
    if (isChecked) {
      const key = `${category}_${index}`;
      if (liftVideos[key]) {
        return;
      }
    }
    const updated = [...currentValues];
    updated[index] = !updated[index];
    onChange(updated);

    if (!isChecked) {
      const label =
        category === "olympic" ? OLYMPIC_LIFTS[index] : SQUAT_LIFTS[index];
      showVideoOptions({ category, index, label });
    }
  };

  const onSubmit = (data: OnboardingScreen2Values) => {
    const hasOlympicSelection = data.olympic_lifts.some((lift) => lift);
    const hasSquatSelection = data.squats.some((squat) => squat);

    if (!hasOlympicSelection && !hasSquatSelection) {
      showError("Please choose one lift before proceeding");
      return;
    }

    const missingVideos: string[] = [];

    data.olympic_lifts.forEach((isSelected, index) => {
      if (isSelected && !liftVideos[`olympic_${index}`]) {
        missingVideos.push(OLYMPIC_LIFTS[index]);
      }
    });

    data.squats.forEach((isSelected, index) => {
      if (isSelected && !liftVideos[`squat_${index}`]) {
        missingVideos.push(SQUAT_LIFTS[index]);
      }
    });

    if (missingVideos.length > 0) {
      showError(`Please add video for: ${missingVideos.join(", ")}`);
      return;
    }

    dispatch(
      saveOnboardingData({
        ...data,
        liftVideos,
      }),
    );

    if (onComplete) {
      onComplete();
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {},
    formGroup: {
      marginVertical: scale(20),
      gap: scale(12),
      marginBottom: scale(50),
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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
              onToggle={(index) =>
                handleLiftToggle(
                  "olympic",
                  index,
                  value[index],
                  onChange,
                  value,
                )
              }
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
              onToggle={(index) =>
                handleLiftToggle("squat", index, value[index], onChange, value)
              }
            />
          )}
        />

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

      <ActionButtonsRow
        onPrimaryPress={handleSubmit(onSubmit)}
        onSecondaryPress={onBack}
      />

      {isUploading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#fff"} />
        </View>
      )}

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
                onPress={handleContinue}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
