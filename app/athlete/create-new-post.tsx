import { Images } from "@/assets";
import PostVisibility from "@/components/post-visibility";
import SessionDetail from "@/components/session-detail";
import CustomInput from "@/constants/custom-input";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useCreateNewPostMutation } from "@/store/api";
import { RootState } from "@/store/store";
import { Typography } from "@/utils/custom-styles";
import { getFirstError } from "@/utils/get-error";
import { createPostSchema } from "@/utils/validation-schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";
import { InferType } from "yup";

type CreatePostFormValues = InferType<typeof createPostSchema>;
type PostVisibilityType = "public" | "private";
const LIFT_NAME_OPTIONS = [
  "Snatch",
  "Clean & Jerk",
  "Power Snatch",
  "Clean",
  "Power Clean",
  "Back Squat",
  "Front Squat",
  "Overhead Squat",
  "Strict Press",
  "Push Press",
  "Power jerk",
  "Jerk",
  "Clean Pull",
];
export default function CreateNewPost() {
  const { colors } = useTheme();
  const [visibility, setVisibility] =
    React.useState<PostVisibilityType>("public");
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const user = useSelector((state: RootState) => state.auth.user);

  const { showSuccess, showError } = useToast();
  const [createPost, { isLoading }] = useCreateNewPostMutation();
  const { weight, exerciseName, intent, context } = useLocalSearchParams<{
    weight: string;
    exerciseName: string;
    intent: string;
    context: string;
  }>();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: yupResolver(createPostSchema),
    defaultValues: {
      video: "",
      liftName: "",
      opinion: "",
      loadLifted: "0",
      contextEnabled: false,
      contextValue: "",
      intentEnabled: false,
      intentValue: "",
      effortEnabled: false,
      effortRating: 0,
    },
  });
  useEffect(() => {
    if (exerciseName) {
      if (!LIFT_NAME_OPTIONS.includes(exerciseName)) {
        LIFT_NAME_OPTIONS.push(exerciseName);
      }

      setSelectedOpt(exerciseName);
      setValue("liftName", exerciseName);
    }

    if (weight) {
      setValue("loadLifted", String(weight));
    }

    if (intent && watch("intentEnabled")) {
      setValue("intentValue", intent);
    }
  }, [exerciseName, weight, intent, context, watch("intentEnabled")]);
  useEffect(() => {
    const firstError = getFirstError(errors);
    if (firstError) {
      showError(firstError);
    }
  }, [errors]);
  const handleBackPress = () => {
    router.back();
  };

  const onSubmit = async (data: CreatePostFormValues) => {
    if (!videoUri) {
      alert("Please select a video");
      return;
    }

    const formData = new FormData();

    formData.append("video", {
      uri: videoUri,
      type: "video/mp4",
      name: "post-video.mp4",
    } as any);
    if (thumbnailUri) {
      formData.append("thumbnail", {
        uri: thumbnailUri,
        type: "image/jpeg",
        name: "thumbnail.jpg",
      } as any);
    }
    const session_detail: any = {
      lifted_kg: Number(data.loadLifted),

      context: data.contextEnabled,
      context_value: data.contextEnabled
        ? data.contextValue || context || ""
        : "",
    };

    if (data.effortEnabled) {
      session_detail.isEffort = true;
      session_detail.effort_value = data.effortRating;
    }

    if (data.intentEnabled) {
      session_detail.isIntent = true;
      session_detail.intent_opt = data.intentValue || intent || "";
    }

    const payload = {
      lift_name: selectedOpt,
      opinion: data.opinion,
      session_detail,

      is_public: visibility === "public",
      is_private: visibility === "private",
      username: user?.username,
      name: user?.name,
    };

    formData.append("data", JSON.stringify(payload));

    try {
      const result = await createPost({ formData }).unwrap();

      alert("Post created successfully!");
      router.back();
    } catch (error: any) {
      console.error("Full error:", JSON.stringify(error, null, 2));
      if (error?.data?.errors) {
        console.error(
          "Error details:",
          JSON.stringify(error.data.errors, null, 2),
        );
      }
      alert("Failed to create post");
    }
  };
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Permission needed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLoadingMedia(true);

      const uri = result.assets[0].uri;
      setVideoUri(uri);
      setValue("video", uri);

      try {
        const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(uri, {
          time: 1000,
        });
        setThumbnailUri(thumb);
      } catch (e) {
        console.log("Thumbnail error:", e);
      } finally {
        setLoadingMedia(false);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(12),
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
    imgContainer: {
      borderRadius: scale(15),
      borderColor: colors.textSecondary,
      borderWidth: scale(0.3),
      alignItems: "center",
      justifyContent: "center",
      height: scale(200),
      width: scale(200),
    },
    emptyContainer: {
      borderStyle: "dashed",
      borderWidth: 1.5,
      borderColor: colors.textSecondary,
      backgroundColor: colors.surface,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.sm,
      textAlign: "center",
      marginTop: scale(10),
    },
    plusIcon: {
      width: scale(30),
      height: scale(30),
      tintColor: colors.text,
    },

    playIcon: {
      position: "absolute",
      width: scale(50),
      height: scale(50),
      tintColor: "#fff",
      opacity: 0.8,
    },
    liftTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(5),
    },
    chip: {
      paddingHorizontal: scale(10),
      paddingVertical: scale(5),
      borderRadius: scale(24),
      borderWidth: scale(1),
      borderColor: colors.primary,
      backgroundColor: colors.lightBlue,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: Typography.fontSize.base,
      fontWeight: "500",
      color: colors.text,
    },
    chipTextSelected: {
      color: colors.text,
    },
    loaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
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

        <Text style={styles.headerText}>NEW POST</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <TouchableOpacity
            style={[
              styles.imgContainer,
              !thumbnailUri && styles.emptyContainer,
            ]}
            onPress={pickVideo}
            activeOpacity={0.7}
          >
            {loadingMedia ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : thumbnailUri ? (
              <View style={[styles.imgContainer]}>
                <Image
                  source={{ uri: thumbnailUri }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: scale(15),
                  }}
                />
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Image source={Images.uploadicon} style={styles.plusIcon} />
                <Text style={styles.emptyText}>Upload Media</Text>
                <Text style={styles.emptyText}>Video only</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ gap: scale(5) }}>
          <Text style={styles.liftTitle}>LIFT NAME</Text>
          <View style={styles.chipsContainer}>
            {LIFT_NAME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  selectedOpt === opt && styles.chipSelected,
                ]}
                onPress={() => {
                  setSelectedOpt(opt);
                  setValue("liftName", opt);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedOpt === opt && styles.chipTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Controller
          control={control}
          name="opinion"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="OPINION"
              placeholder="Missed behind, felt slow off the floor, shoulder tight but we're still grinding baby"
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />

        <SessionDetail
          loadLifted={watch("loadLifted")}
          onLoadLiftedChange={(value: string) =>
            setValue("loadLifted", value, { shouldDirty: true })
          }
          contextEnabled={watch("contextEnabled")}
          onContextEnabledChange={(value: boolean) =>
            setValue("contextEnabled", value, { shouldDirty: true })
          }
          contextValue={watch("contextValue")}
          onContextValueChange={(value: string) =>
            setValue("contextValue", value, { shouldDirty: true })
          }
          intentEnabled={watch("intentEnabled")}
          onIntentEnabledChange={(value: boolean) =>
            setValue("intentEnabled", value, { shouldDirty: true })
          }
          intentValue={watch("intentValue")}
          onIntentValueChange={(value: string) =>
            setValue("intentValue", value, { shouldDirty: true })
          }
          effortEnabled={watch("effortEnabled")}
          onEffortEnabledChange={(value: boolean) =>
            setValue("effortEnabled", value, { shouldDirty: true })
          }
          effortRating={watch("effortRating")}
          onEffortRatingChange={(value: number) =>
            setValue("effortRating", value, { shouldDirty: true })
          }
        />
        <View style={{ gap: scale(6) }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: Typography.fontSize.md,
              fontWeight: Typography.fontWeight.normal,
            }}
          >
            POST VISIBILITY
          </Text>

          <PostVisibility
            title="JUST ME"
            description="Saved privately"
            checked={visibility === "private"}
            onToggle={() => setVisibility("private")}
            icon={Images.privateicon}
          />

          <PostVisibility
            title="PUBLIC"
            description="Shared th your friends"
            checked={visibility === "public"}
            onToggle={() => setVisibility("public")}
            icon={Images.publicicon}
          />
        </View>
        <ActionButtonsRow
          onPrimaryPress={handleSubmit(onSubmit)}
          primaryTitle={isLoading ? "CREATING..." : "POST"}
          secondaryTitle="CANCEL"
        />
      </ScrollView>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}
