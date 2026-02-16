import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import { Typography } from "@/utils/custom-styles";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";

interface OnboardingScreen3Props {
  onBack?: () => void;
  onComplete?: () => void;
}

interface OnboardingScreen3Values {
  limitation: boolean;
  affected_area: string[];
  selected_affected_area: string;
  impact: string;
  when_to_show: string[];
}

const WHEN_TO_SHOW_OPTIONS: Record<
  string,
  Array<{ label: string; value: string }>
> = {
  "Lower back": [
    { label: "Over head position", value: "Over head position" },
    { label: "Snatch catch", value: "Snatch catch" },
    { label: "Jerk lockout", value: "Jerk lockout" },
    { label: "High OH volume", value: "High OH volume" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Knees: [
    { label: "High-volume squats", value: "High-volume squats" },
    { label: "Bottom of squat", value: "Bottom of squat" },
    { label: "Rebound out", value: "Rebound out" },
    { label: "Slow eccentrics", value: "Slow eccentrics" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Shoulders: [
    { label: "Front rack position", value: "Front rack position" },
    { label: "Snatch position", value: "Snatch position" },
    { label: "Long sessions", value: "Long sessions" },
    { label: "High OH volume", value: "High OH volume" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Wrists: [
    { label: "During pulls", value: "During pulls" },
    { label: "During squats", value: "During squats" },
    { label: "Over head", value: "Over head" },
    { label: "Catch", value: "Catch" },
    { label: "After training", value: "After training" },
    { label: "Inconsistent", value: "Inconsistent" },
  ],
  Hips: [
    { label: "High-volume squats", value: "High-volume squats" },
    { label: "Bottom of squat", value: "Bottom of squat" },
    { label: "Limited warm-up", value: "Limited warm-up" },
    { label: "After sitting", value: "After sitting" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Ankles: [
    { label: "Bottom of squat", value: "Bottom of squat" },
    { label: "Rebound stress", value: "Rebound stress" },
    { label: "Deep squats", value: "Deep squats" },
    { label: "Foot transition", value: "Foot transition" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
};

export default function OnboardingScreen3({
  onBack,
  onComplete,
}: OnboardingScreen3Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { showError } = useToast();
  const onSubmit = (data: OnboardingScreen3Values) => {
    if (
      data.limitation &&
      data.affected_area.length > 0 &&
      !data.selected_affected_area
    ) {
      showError("Please select an affected area");
      return;
    }
    const sanitizedData =
      data.limitation === false
        ? {
            ...data,
            affected_area: [],
            selected_affected_area: "",
            impact: "",
            when_to_show: [],
          }
        : data;

    dispatch(saveOnboardingData(sanitizedData));

    if (onComplete) {
      onComplete();
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingScreen3Values>({
    defaultValues: {
      limitation: true,
      affected_area: ["Lower back"],
      selected_affected_area: "Lower back",
      impact: "Moderate",
      when_to_show: [],
    },
  });

  const limitationValue = useWatch({
    control,
    name: "limitation",
  });

  const affectedAreaValue = useWatch({
    control,
    name: "affected_area",
  });

  const selectedAffectedAreaValue = useWatch({
    control,
    name: "selected_affected_area",
  });

  const mappedAffectedAreaOptions = useMemo(() => {
    return (affectedAreaValue || []).map((area) => ({
      label: area,
      value: area,
    }));
  }, [affectedAreaValue]);

  const whenToShowOptions = useMemo(() => {
    if (!selectedAffectedAreaValue) {
      return [];
    }
    return WHEN_TO_SHOW_OPTIONS[selectedAffectedAreaValue] || [];
  }, [selectedAffectedAreaValue]);
  useEffect(() => {
    if (!limitationValue) {
      setValue("affected_area", []);
      setValue("selected_affected_area", "");
      setValue("impact", "");
      setValue("when_to_show", []);
    } else {
      setValue("affected_area", ["Lower back"]);
      setValue("selected_affected_area", "Lower back");
      setValue("impact", "Moderate");
    }
  }, [limitationValue, setValue]);

  useEffect(() => {
    if (affectedAreaValue && affectedAreaValue.length > 0) {
      if (!affectedAreaValue.includes(selectedAffectedAreaValue)) {
        setValue("selected_affected_area", affectedAreaValue[0]);

        setValue("when_to_show", []);
      }
    } else {
      setValue("selected_affected_area", "");
      setValue("when_to_show", []);
    }
  }, [affectedAreaValue, selectedAffectedAreaValue, setValue]);

  useEffect(() => {
    setValue("when_to_show", []);
  }, [selectedAffectedAreaValue, setValue]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {},
    formGroup: {
      marginVertical: scale(20),
      gap: scale(20),
      marginBottom: scale(50),
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
    },
    chip: {
      paddingHorizontal: scale(7),
      paddingVertical: scale(3),
      borderRadius: scale(24),
      borderWidth: 1,
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
  });

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          mainText="Training considerations"
          subText="Used to modify training when needed."
        />

        <View style={styles.formGroup}>
          <Controller
            control={control}
            name="limitation"
            render={({ field: { onChange, value } }) => (
              <SegmentedSelector
                title="Training Limitations"
                options={[
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
                ]}
                selectedValue={String(value)}
                onChange={(v) => onChange(v === "true")}
                segments={2}
              />
            )}
          />

          {limitationValue === true && (
            <>
              <Controller
                control={control}
                name="affected_area"
                render={({ field: { onChange, value } }) => (
                  <SegmentedSelector
                    title="Affected Areas"
                    options={[
                      { label: "Lower back", value: "Lower back" },
                      { label: "Knees", value: "Knees" },
                      { label: "Shoulders", value: "Shoulders" },
                      { label: "Wrists", value: "Wrists" },
                      { label: "Hips", value: "Hips" },
                      { label: "Ankles", value: "Ankles" },
                    ]}
                    selectedValue={value || []}
                    onChange={onChange}
                    segments={6}
                    allowMultiple
                  />
                )}
              />

              {mappedAffectedAreaOptions.length > 0 && (
                <Controller
                  control={control}
                  name="selected_affected_area"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.chipsContainer}>
                      {mappedAffectedAreaOptions.map((option) => {
                        const isSelected = value === option.value;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.chip,
                              isSelected && styles.chipSelected,
                            ]}
                            onPress={() => onChange(option.value)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && styles.chipTextSelected,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                />
              )}

              <Controller
                control={control}
                name="impact"
                render={({ field: { onChange, value } }) => (
                  <SegmentedSelector
                    title="Current Impact"
                    options={[
                      { label: "Mild", value: "Mild" },
                      { label: "Moderate", value: "Moderate" },
                      { label: "High", value: "High" },
                    ]}
                    selectedValue={value}
                    onChange={onChange}
                    segments={3}
                  />
                )}
              />

              {whenToShowOptions.length > 0 && (
                <Controller
                  control={control}
                  name="when_to_show"
                  render={({ field: { onChange, value } }) => (
                    <SegmentedSelector
                      title="When does it show up"
                      options={whenToShowOptions}
                      selectedValue={value || []}
                      onChange={onChange}
                      segments={6}
                      allowMultiple
                    />
                  )}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
      <ActionButtonsRow
        onPrimaryPress={handleSubmit(onSubmit)}
        onSecondaryPress={onBack}
      />
    </>
  );
}
