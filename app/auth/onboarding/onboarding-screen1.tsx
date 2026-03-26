/**
 * Onboarding Screen 1 — Athlete Profile (Redesigned v2)
 *
 * Fields: profile photo, full name, username, country, DOB (DD/MM/YYYY),
 * sex selector, bodyweight (KG/LB), height (CM/FT),
 * weightlifting exposure (4-card grid).
 *
 * Abdul's onboarding data flow is unchanged — dispatches to
 * onboardingSlice, image upload via useUploadProfileImageMutation.
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useToast } from "@/context/toast-context";
import { useUploadProfileImageMutation } from "@/store/api";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import { RootState } from "@/store/store";
import { onboardingScreen1Schema } from "@/utils/validation-schemas";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen1Values {
  name: string;
  user_name: string;
  country: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  sex: string;
  weight: string;
  weightUnit: "KG" | "LB";
  height: string;
  height_unit: "cm" | "ft";
  weightliftingExposure: string;
}

interface OnboardingScreen1Props {
  onComplete?: () => void;
  name?: string;
  email?: string;
}

/* ── Exposure card data ────────────────────────────────── */

const EXPOSURE_OPTIONS = [
  {
    value: "new",
    title: "New",
    subtitle: "Just starting or CrossFit background",
  },
  {
    value: "developing",
    title: "Developing",
    subtitle: "1-2 years, learning the lifts",
  },
  {
    value: "experienced",
    title: "Experienced",
    subtitle: "3+ years, consistent training",
  },
  {
    value: "competitive",
    title: "Competitive",
    subtitle: "Active or past competition",
  },
] as const;

/* ── Country list (ISO 3166-1) ─────────────────────────── */

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Wallis and Futuna", "Western Sahara",
  "Yemen", "Zambia", "Zimbabwe",
] as const;

/* ── Main Component ────────────────────────────────────── */

export function OnboardingScreen1({
  onComplete,
}: OnboardingScreen1Props) {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [uploadProfileImage] = useUploadProfileImageMutation();
  const onboardingData = useSelector(
    (state: RootState) => state.onboarding.currentData
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    onboardingData?.photo_url || null
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [sexModalVisible, setSexModalVisible] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    return COUNTRIES.filter((country) =>
      country.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<OnboardingScreen1Values>({
    resolver: yupResolver(onboardingScreen1Schema),
    mode: "onChange",
    defaultValues: {
      name: onboardingData?.name || "",
      user_name: onboardingData?.user_name || "",
      country: onboardingData?.country || "",
      dobDay: onboardingData?.dobDay || "",
      dobMonth: onboardingData?.dobMonth || "",
      dobYear: onboardingData?.dobYear || "",
      sex: onboardingData?.sex || "",
      weight: onboardingData?.weight || "",
      weightUnit: onboardingData?.weightUnit || "KG",
      height: onboardingData?.height || "",
      height_unit: onboardingData?.height_unit || "cm",
      weightliftingExposure: onboardingData?.weightliftingExposure || "",
    },
  });

  const watchedValues = watch();

  const handleImagePick = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access camera roll is required", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setImageLoading(true);
        try {
          const uploadResult = await uploadProfileImage({
            uri: selectedAsset.uri,
          }).unwrap();

          setProfileImage(uploadResult.photo_url);
          dispatch(
            saveOnboardingData({
              ...onboardingData,
              photo_url: uploadResult.photo_url,
            })
          );
          showToast("Profile image updated", "success");
        } catch (error) {
          showToast("Failed to upload image", "error");
        } finally {
          setImageLoading(false);
        }
      }
    } catch (error) {
      showToast("Error picking image", "error");
    }
  };

  const handleSubmitForm = (data: OnboardingScreen1Values) => {
    dispatch(saveOnboardingData({ ...onboardingData, ...data }));
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: true,
          title: "Athlete Profile",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Image Section */}
          <View style={styles.profileImageContainer}>
            <Pressable
              onPress={handleImagePick}
              disabled={imageLoading}
              style={({ pressed }) => [
                styles.profileImageButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={80}
                  color={olyColors.text.secondary}
                />
              )}
              {imageLoading && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator
                    size="large"
                    color={olyColors.text.primary}
                  />
                </View>
              )}
            </Pressable>
            <Text style={styles.profileImageLabel}>
              {profileImage ? "Change Photo" : "Add Photo"}
            </Text>
          </View>

          {/* Name Field */}
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <OlyFormField
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                containerStyle={styles.fieldContainer}
              />
            )}
          />

          {/* Username Field */}
          <Controller
            control={control}
            name="user_name"
            render={({ field: { value, onChange } }) => (
              <OlyFormField
                label="Username"
                placeholder="Enter your username"
                value={value}
                onChangeText={onChange}
                error={errors.user_name?.message}
                containerStyle={styles.fieldContainer}
              />
            )}
          />

          {/* Country Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Country</Text>
            <Pressable
              onPress={() => setCountryModalVisible(true)}
              style={({ pressed }) => [
                styles.dropdownButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !watchedValues.country && styles.dropdownPlaceholder,
                ]}
              >
                {watchedValues.country || "Select a country"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={olyColors.text.secondary}
              />
            </Pressable>
            {errors.country && (
              <Text style={styles.errorText}>{errors.country.message}</Text>
            )}
          </View>

          {/* Country Selection Modal */}
          <Modal
            visible={countryModalVisible}
            animationType="slide"
            onRequestClose={() => setCountryModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setCountryModalVisible(false)}>
                  <Text style={styles.modalCloseButton}>Done</Text>
                </Pressable>
                <Text style={styles.modalTitle}>Select Country</Text>
                <View style={{ width: 40 }} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search countries..."
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholderTextColor={olyColors.text.secondary}
              />
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      // We need access to the form control's setValue
                      // This will be handled differently
                      setCountryModalVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.countryItem,
                      pressed && { backgroundColor: olyColors.bg.secondary },
                    ]}
                  >
                    <Text style={styles.countryItemText}>{item}</Text>
                  </Pressable>
                )}
              />
            </View>
          </Modal>

          {/* DOB Section */}
          <View style={styles.dobContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.dobFields}>
              <Controller
                control={control}
                name="dobDay"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.dobFieldWrapper}>
                    <TextInput
                      style={[
                        styles.dobInput,
                        errors.dobDay && styles.dobInputError,
                      ]}
                      placeholder="DD"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholderTextColor={olyColors.text.secondary}
                    />
                    {errors.dobDay && (
                      <Text style={styles.dobErrorText}>
                        {errors.dobDay.message}
                      </Text>
                    )}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="dobMonth"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.dobFieldWrapper}>
                    <TextInput
                      style={[
                        styles.dobInput,
                        errors.dobMonth && styles.dobInputError,
                      ]}
                      placeholder="MM"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholderTextColor={olyColors.text.secondary}
                    />
                    {errors.dobMonth && (
                      <Text style={styles.dobErrorText}>
                        {errors.dobMonth.message}
                      </Text>
                    )}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="dobYear"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.dobFieldWrapper}>
                    <TextInput
                      style={[
                        styles.dobInput,
                        errors.dobYear && styles.dobInputError,
                      ]}
                      placeholder="YYYY"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      maxLength={4}
                      placeholderTextColor={olyColors.text.secondary}
                    />
                    {errors.dobYear && (
                      <Text style={styles.dobErrorText}>
                        {errors.dobYear.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
          </View>

          {/* Sex Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Biological Sex</Text>
            <View style={styles.sexSelector}>
              {["Male", "Female", "Other"].map((sex) => (
                <Controller
                  key={sex}
                  control={control}
                  name="sex"
                  render={({ field: { value, onChange } }) => (
                    <Pressable
                      onPress={() => onChange(sex)}
                      style={[
                        styles.sexButton,
                        value === sex && styles.sexButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sexButtonText,
                          value === sex && styles.sexButtonTextActive,
                        ]}
                      >
                        {sex}
                      </Text>
                    </Pressable>
                  )}
                />
              ))}
            </View>
            {errors.sex && (
              <Text style={styles.errorText}>{errors.sex.message}</Text>
            )}
          </View>

          {/* Body Metrics Section */}
          <Text style={styles.sectionLabel}>BODY METRICS</Text>

          {/* Weight Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricLabelContainer}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Controller
                control={control}
                name="weightUnit"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.unitToggle}>
                    {["KG", "LB"].map((unit) => (
                      <Pressable
                        key={unit}
                        onPress={() => onChange(unit as "KG" | "LB")}
                        style={[
                          styles.unitButton,
                          value === unit && styles.unitButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.unitButtonText,
                            value === unit && styles.unitButtonTextActive,
                          ]}
                        >
                          {unit}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
            </View>
            <Controller
              control={control}
              name="weight"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={[styles.metricInput, errors.weight && styles.inputError]}
                  placeholder="Enter weight"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                  placeholderTextColor={olyColors.text.secondary}
                />
              )}
            />
            {errors.weight && (
              <Text style={styles.errorText}>{errors.weight.message}</Text>
            )}
          </View>

          {/* Height Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricLabelContainer}>
              <Text style={styles.metricLabel}>Height</Text>
              <Controller
                control={control}
                name="height_unit"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.unitToggle}>
                    {["cm", "ft"].map((unit) => (
                      <Pressable
                        key={unit}
                        onPress={() => onChange(unit as "cm" | "ft")}
                        style={[
                          styles.unitButton,
                          value === unit && styles.unitButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.unitButtonText,
                            value === unit && styles.unitButtonTextActive,
                          ]}
                        >
                          {unit}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
            </View>
            <Controller
              control={control}
              name="height"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={[styles.metricInput, errors.height && styles.inputError]}
                  placeholder="Enter height"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                  placeholderTextColor={olyColors.text.secondary}
                />
              )}
            />
            {errors.height && (
              <Text style={styles.errorText}>{errors.height.message}</Text>
            )}
          </View>

          {/* Weightlifting Exposure */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Weightlifting Exposure</Text>
            <Controller
              control={control}
              name="weightliftingExposure"
              render={({ field: { value, onChange } }) => (
                <View style={styles.exposureGrid}>
                  {EXPOSURE_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => onChange(option.value)}
                      style={[
                        styles.exposureCard,
                        value === option.value && styles.exposureCardActive,
                      ]}
                    >
                      <Text style={styles.exposureTitle}>{option.title}</Text>
                      <Text style={styles.exposureSubtitle}>
                        {option.subtitle}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
            {errors.weightliftingExposure && (
              <Text style={styles.errorText}>
                {errors.weightliftingExposure.message}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <OlyButton
            title="Continue"
            onPress={handleSubmit(handleSubmitForm)}
            disabled={!isValid}
            containerStyle={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: olyColors.bg.primary,
  },
  scrollContent: {
    paddingHorizontal: olySpacing.lg,
    paddingBottom: olySpacing.xl,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: olySpacing.lg,
  },
  profileImageButton: {
    position: "relative",
    marginBottom: olySpacing.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  profileImageLabel: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },
  fieldContainer: {
    marginBottom: olySpacing.lg,
  },
  label: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    marginBottom: olySpacing.sm,
  },
  sectionLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing.lg,
    marginBottom: olySpacing.md,
    letterSpacing: olyLetterSpacing.wide,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olySpacing.md,
    paddingVertical: olySpacing.md,
    borderRadius: olyRadius.md,
    backgroundColor: olyColors.bg.secondary,
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  dropdownButtonText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  dropdownPlaceholder: {
    color: olyColors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: olyColors.bg.primary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: olySpacing.lg,
    paddingVertical: olySpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: olyColors.border.default,
  },
  modalCloseButton: {
    ...olyTypography.body,
    color: olyColors.link,
  },
  modalTitle: {
    ...olyTypography.h3,
    color: olyColors.text.primary,
  },
  searchInput: {
    ...olyTypography.body,
    marginHorizontal: olySpacing.lg,
    marginVertical: olySpacing.md,
    paddingHorizontal: olySpacing.md,
    paddingVertical: olySpacing.sm,
    borderRadius: olyRadius.md,
    backgroundColor: olyColors.bg.secondary,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    color: olyColors.text.primary,
  },
  countryItem: {
    paddingHorizontal: olySpacing.lg,
    paddingVertical: olySpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: olyColors.border.default,
  },
  countryItemText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  dobContainer: {
    marginBottom: olySpacing.lg,
  },
  dobFields: {
    flexDirection: "row",
    gap: olySpacing.sm,
  },
  dobFieldWrapper: {
    flex: 1,
  },
  dobInput: {
    ...olyTypography.body,
    paddingHorizontal: olySpacing.md,
    paddingVertical: olySpacing.md,
    borderRadius: olyRadius.md,
    backgroundColor: olyColors.bg.secondary,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    color: olyColors.text.primary,
    textAlign: "center",
  },
  dobInputError: {
    borderColor: olyColors.feedback.error,
  },
  dobErrorText: {
    ...olyTypography.caption,
    color: olyColors.feedback.error,
    marginTop: olySpacing.xs,
  },
  sexSelector: {
    flexDirection: "row",
    gap: olySpacing.sm,
  },
  sexButton: {
    flex: 1,
    paddingVertical: olySpacing.md,
    borderRadius: olyRadius.md,
    backgroundColor: olyColors.bg.secondary,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    alignItems: "center",
  },
  sexButtonActive: {
    backgroundColor: olyColors.primary,
    borderColor: olyColors.primary,
  },
  sexButtonText: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
  },
  sexButtonTextActive: {
    color: olyColors.text.inverse,
  },
  metricCard: {
    padding: olySpacing.md,
    marginBottom: olySpacing.lg,
    backgroundColor: olyColors.bg.secondary,
    borderRadius: olyRadius.md,
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  metricLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: olySpacing.md,
  },
  metricLabel: {
    ...olyTypography.label,
    color: olyColors.text.primary,
  },
  unitToggle: {
    flexDirection: "row",
    gap: olySpacing.xs,
  },
  unitButton: {
    paddingHorizontal: olySpacing.sm,
    paddingVertical: olySpacing.xs,
    borderRadius: olyRadius.sm,
    backgroundColor: olyColors.bg.primary,
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  unitButtonActive: {
    backgroundColor: olyColors.primary,
    borderColor: olyColors.primary,
  },
  unitButtonText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  unitButtonTextActive: {
    color: olyColors.text.inverse,
  },
  metricInput: {
    ...olyTypography.body,
    paddingHorizontal: olySpacing.md,
    paddingVertical: olySpacing.md,
    borderRadius: olyRadius.md,
    backgroundColor: olyColors.bg.primary,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    color: olyColors.text.primary,
  },
  inputError: {
    borderColor: olyColors.feedback.error,
  },
  errorText: {
    ...olyTypography.caption,
    color: olyColors.feedback.error,
    marginTop: olySpacing.xs,
  },
  exposureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing.sm,
  },
  exposureCard: {
    width: "48%",
    padding: olySpacing.md,
    backgroundColor: olyColors.bg.secondary,
    borderRadius: olyRadius.md,
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  exposureCardActive: {
    backgroundColor: olyColors.primary,
    borderColor: olyColors.primary,
  },
  exposureTitle: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    marginBottom: olySpacing.xs,
  },
  exposureSubtitle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  submitButton: {
    marginTop: olySpacing.lg,
  },
});
