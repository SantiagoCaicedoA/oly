import Header from "@/components/header";
import LiftDetailsCard from "@/components/lift-details";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useUploadAthleteVideoMutation } from "@/store/api";
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
  press: boolean[];
  variations: boolean[];
}

type LiftCategory = "olympic" | "squat" | "press" | "variation";

interface LiftIdentifier {
  category: LiftCategory;
  index: number;
  label: string;
}

const OLYMPIC_LIFTS = [
  { label: "Snatch", value: 0 },
  { label: "Clean & Jerk", value: 0 },
];

const SQUAT_LIFTS = [
  { label: "Back Squat", value: 0 },
  { label: "Front Squat", value: 0 },
  { label: "Overhead Squat", value: 0 },
];

const PRESS_LIFTS = [
  { label: "Strict Press", value: 0 },
  { label: "Push Press", value: 0 },
  { label: "Power Jerk", value: 0 },
  { label: "Jerk", value: 0 },
];

const VARIATION_LIFTS = [
  { label: "Power Snatch", value: 0 },
  { label: "Clean", value: 0 },
  { label: "Power Clean", value: 0 },
];

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
  const [liftValues, setLiftValues] = useState({
    olympic: OLYMPIC_LIFTS.map((lift) => lift.value),
    squat: SQUAT_LIFTS.map((lift) => lift.value),
    press: PRESS_LIFTS.map((lift) => lift.value),
    variation: VARIATION_LIFTS.map((lift) => lift.value),
  });
  const [uploadAthleteVideo, { isLoading: isUploadingToApi }] =
    useUploadAthleteVideoMutation();
  const handleValueChange = (
    category: LiftCategory,
    index: number,
    value: number,
  ) => {
    setLiftValues((prev) => ({
      ...prev,
      [category]: prev[category].map((v, i) => (i === index ? value : v)),
    }));
  };
  const { control, handleSubmit, watch, setValue } =
    useForm<OnboardingScreen2Values>({
      defaultValues: {
        accuracy: "Tested",
        olympic_lifts: [false, false],
        squats: [false, false, false],
        press: [false, false, false, false],
        variations: [false, false, false],
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

  const handleContinue = async () => {
    if (currentLift) {
      const key = getLiftKey(currentLift);
      const videoUri = liftVideos[key];

      if (videoUri) {
        try {
          const formData = new FormData();
          formData.append("video", {
            uri: videoUri,
            type: "video/mp4",
            name: `${currentLift.label.replace(/\s+/g, "_")}.mp4`,
          } as any);

          const result = await uploadAthleteVideo(formData).unwrap();
          console.log("mmmm", result);

          showSuccess("Video uploaded successfully!");
        } catch (error) {
          console.error("Failed to upload video:", error);
          showError("Failed to upload video");
        }
      }
    }

    setShowSuccessModal(false);
    setCurrentLift(null);
  };

  const handleRemoveVideo = () => {
    if (currentLift) {
      const key = getLiftKey(currentLift);
      setLiftVideos((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      let fieldName: keyof OnboardingScreen2Values;
      switch (currentLift.category) {
        case "olympic":
          fieldName = "olympic_lifts";
          break;
        case "squat":
          fieldName = "squats";
          break;
        case "press":
          fieldName = "press";
          break;
        case "variation":
          fieldName = "variations";
          break;
      }

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
      let label: string;
      switch (category) {
        case "olympic":
          label = OLYMPIC_LIFTS[index].label;
          break;
        case "squat":
          label = SQUAT_LIFTS[index].label;
          break;
        case "press":
          label = PRESS_LIFTS[index].label;
          break;
        case "variation":
          label = VARIATION_LIFTS[index].label;
          break;
      }
      showVideoOptions({ category, index, label });
    }
  };

  const onSubmit = (data: OnboardingScreen2Values) => {
    console.log("999999", data);

    const hasOlympicSelection = data.olympic_lifts.some((lift) => lift);
    const hasSquatSelection = data.squats.some((squat) => squat);
    const hasPressSelection = data.press.some((press) => press);
    const hasVariationSelection = data.variations.some(
      (variation) => variation,
    );
    if (
      !hasOlympicSelection &&
      !hasSquatSelection &&
      !hasPressSelection &&
      !hasVariationSelection
    ) {
      showError("Please choose one lift before proceeding");
      return;
    }

    const missingVideos: string[] = [];

    data.olympic_lifts.forEach((isSelected, index) => {
      if (isSelected && !liftVideos[`olympic_${index}`]) {
        missingVideos.push(OLYMPIC_LIFTS[index].label);
      }
    });

    data.squats.forEach((isSelected, index) => {
      if (isSelected && !liftVideos[`squat_${index}`]) {
        missingVideos.push(SQUAT_LIFTS[index].label);
      }
    });

    data.press.forEach((isSelected, index) => {
      if (isSelected && !liftVideos[`press_${index}`]) {
        missingVideos.push(PRESS_LIFTS[index].label);
      }
    });

    data.variations.forEach((isSelected, index) => {
      if (isSelected && !liftVideos[`variation_${index}`]) {
        missingVideos.push(VARIATION_LIFTS[index].label);
      }
    });

    if (missingVideos.length > 0) {
      showError(`Please add video for: ${missingVideos.join(", ")}`);
      return;
    }

    const missingWeights: string[] = [];

    data.olympic_lifts.forEach((isSelected, index) => {
      if (isSelected && liftValues.olympic[index] === 0) {
        missingWeights.push(OLYMPIC_LIFTS[index].label);
      }
    });

    data.squats.forEach((isSelected, index) => {
      if (isSelected && liftValues.squat[index] === 0) {
        missingWeights.push(SQUAT_LIFTS[index].label);
      }
    });

    data.press.forEach((isSelected, index) => {
      if (isSelected && liftValues.press[index] === 0) {
        missingWeights.push(PRESS_LIFTS[index].label);
      }
    });

    data.variations.forEach((isSelected, index) => {
      if (isSelected && liftValues.variation[index] === 0) {
        missingWeights.push(VARIATION_LIFTS[index].label);
      }
    });

    if (missingWeights.length > 0) {
      showError(`Please add weight for: ${missingWeights.join(", ")}`);
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
    disabledButton: {
      opacity: 0.5,
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
              title="Classic"
              items={OLYMPIC_LIFTS.map((lift, i) => ({
                ...lift,
                value: liftValues.olympic[i],
              }))}
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
              onValueChange={(index, val) =>
                handleValueChange("olympic", index, val)
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
              items={SQUAT_LIFTS.map((lift, i) => ({
                ...lift,
                value: liftValues.squat[i],
              }))}
              checkedValues={value}
              onToggle={(index) =>
                handleLiftToggle("squat", index, value[index], onChange, value)
              }
              onValueChange={(index, val) =>
                handleValueChange("squat", index, val)
              }
            />
          )}
        />
        <Controller
          control={control}
          name="press"
          render={({ field: { value, onChange } }) => (
            <LiftDetailsCard
              title="Press"
              items={PRESS_LIFTS.map((lift, i) => ({
                ...lift,
                value: liftValues.press[i],
              }))}
              checkedValues={value}
              onToggle={(index) =>
                handleLiftToggle("press", index, value[index], onChange, value)
              }
              onValueChange={(index, val) =>
                handleValueChange("press", index, val)
              }
            />
          )}
        />
        <Controller
          control={control}
          name="variations"
          render={({ field: { value, onChange } }) => (
            <LiftDetailsCard
              title="Variation"
              items={VARIATION_LIFTS.map((lift, i) => ({
                ...lift,
                value: liftValues.variation[i],
              }))}
              checkedValues={value}
              onToggle={(index) =>
                handleLiftToggle(
                  "variation",
                  index,
                  value[index],
                  onChange,
                  value,
                )
              }
              onValueChange={(index, val) =>
                handleValueChange("variation", index, val)
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
          <ActivityIndicator size="large" color={colors.primary} />
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
                style={[
                  styles.modalButton,
                  styles.removeButton,
                  isUploadingToApi && styles.disabledButton,
                ]}
                onPress={handleRemoveVideo}
                disabled={isUploadingToApi}
              >
                <Text style={styles.buttonText}>Remove Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  isUploadingToApi && styles.disabledButton,
                ]}
                onPress={handleContinue}
                disabled={isUploadingToApi}
              >
                {isUploadingToApi ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: scale(8),
                    }}
                  >
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
