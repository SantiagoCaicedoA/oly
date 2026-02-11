import CounterInput from "@/components/counter-input";
import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import WeightInput from "@/components/weight-input";
import CustomInput from "@/constants/custom-input";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useUploadProfileImageMutation } from "@/store/api";

import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";
interface OnboardingScreen1Values {
  name: string;
  user_name: string;
  country: string;
  age: string;
  weight: string;
  weightUnit: "KG" | "LB";
  experience: string;
  sex: string;
  height: string;
  height_unit: "cm" | "ft";
  measurement_system: "Metric" | "Imperial";
  bio: string;
}
interface OnboardingScreen1Props {
  onComplete?: () => void;
  name?: string;
  email?: string;
}
export default function OnboardingScreen1({
  onComplete,
  name,
  email,
}: OnboardingScreen1Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = React.useState<string>("");
  const [uploadProfileImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const user = useSelector((state: RootState) => state.auth.user);

  console.log("user:", user);
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: OnboardingScreen1Values) => {
    // if (!userId) {
    //   Alert.alert("Error", "User ID not found. Please sign in again.", [
    //     {
    //       text: "OK",
    //       onPress: () => router.push("/auth/signin"),
    //     },
    //   ]);
    //   return;
    // }
    if (profileImage) {
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: profileImage,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any);

        const result = await uploadProfileImage(formData).unwrap();
      } catch (error) {
        console.error("Failed to upload image:", error);

        return;
      }
    }

    dispatch(saveOnboardingData(data));

    if (onComplete) {
      onComplete();
    } else {
      router.push("/auth/onboarding/onboarding-screen2");
    }
  };
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingScreen1Values>({
    defaultValues: {
      name: "",
      country: "",
      age: "",
      weight: "",
      weightUnit: "KG",
      experience: "",
      sex: "male",
      height: "",
      measurement_system: "Metric",
      bio: "",
      height_unit: "cm",
      user_name: "",
    },
  });
  useEffect(() => {
    if (name) {
      setValue("name", name);
    }
  }, [name, setValue]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {},
    formGroup: {
      marginVertical: scale(20),
      gap: scale(7),
      marginBottom: scale(50),
    },
    profileImageContainer: {
      alignItems: "center",
      marginVertical: scale(20),
    },
    profileImagePreview: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      borderWidth: 2,
      borderColor: colors.primary,
      marginBottom: scale(12),
    },
    profileImagePlaceholder: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: colors.textSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(12),
    },

    imageButtonsRow: {
      flexDirection: "row",
      gap: scale(10),
      width: "100%",
    },
    imageButtonSecondary: {
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      flex: 1,
      borderWidth: scale(1),
    },
    imageButton: {
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      paddingVertical: scale(10),
      paddingHorizontal: scale(20),
      borderRadius: scale(8),
      flex: 1,
      alignItems: "center",
    },
    imageButtonText: {
      color: "#fff",
      fontWeight: "600",
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
  });
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          mainText="Athlete profile"
          subText="Used to set up your training profile"
        />
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImagePreview}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="camera" size={50} color={colors.textSecondary} />
            </View>
          )}

          <View style={styles.imageButtonsRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleChooseFromGallery}
            >
              <Text style={styles.imageButtonText}>Choose Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageButton, styles.imageButtonSecondary]}
              onPress={handleTakePhoto}
            >
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Write a short bio..."
                label="ABOUT YOU"
                onChangeText={onChange}
                value={value}
                error={errors.bio?.message}
                multiline
              />
            )}
          />
          <Controller
            control={control}
            name="user_name"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Your name"
                label="USER NAME"
                onChangeText={onChange}
                value={value}
                error={errors.user_name?.message}
                autoCapitalize="none"
              />
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Your name"
                label="FULL NAME"
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Select your country"
                label="YOUR COUNTRY"
                onChangeText={onChange}
                value={value}
                error={errors.country?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="age"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="AGE"
                placeholder="Years"
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                error={errors.country?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="measurement_system"
            render={({ field: { onChange, value } }) => (
              <WeightInput
                label="UNITS"
                value={value}
                onChangeText={onChange}
                unit={watch("measurement_system")}
                onUnitChange={(unit: string) =>
                  setValue("measurement_system", unit as "Metric" | "Imperial")
                }
                error={errors.measurement_system?.message}
                units={["Metric", "Imperial"]}
              />
            )}
          />
          <Controller
            control={control}
            name="weight"
            render={({ field: { onChange, value } }) => (
              <WeightInput
                label="BODY WEIGHT"
                value={value}
                onChangeText={onChange}
                unit={watch("weightUnit")}
                onUnitChange={(unit: string) =>
                  setValue("weightUnit", unit as "KG" | "LB")
                }
                error={errors.weight?.message}
                units={["KG", "LB"]}
                allowManualInput={true}
              />
            )}
          />
          <Controller
            control={control}
            name="height"
            render={({ field: { onChange, value } }) => (
              <WeightInput
                label="HEIGHT"
                value={value}
                onChangeText={onChange}
                unit={watch("height_unit")}
                onUnitChange={(unit: string) =>
                  setValue("height_unit", unit as "cm" | "ft")
                }
                error={errors.height?.message}
                units={["cm", "ft"]}
                allowManualInput={true}
              />
            )}
          />

          <Controller
            control={control}
            name="experience"
            render={({ field: { onChange, value } }) => (
              <CounterInput
                label="EXPERIENCE"
                value={value}
                onChangeText={onChange}
                //  suffix="YEARS"
                error={errors.experience?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="sex"
            render={({ field: { onChange, value } }) => (
              <SegmentedSelector
                title="SEX"
                selectedValue={value}
                onChange={onChange}
                options={[
                  { label: "Female", value: "female" },
                  { label: "Male", value: "male" },
                  { label: "Other", value: "other" },
                ]}
              />
            )}
          />
        </View>

        <ActionButtonsRow
          onPrimaryPress={handleSubmit(onSubmit)}
          primaryTitle={isUploading ? "Saving..." : "Save"}
        />
        {isUploading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
