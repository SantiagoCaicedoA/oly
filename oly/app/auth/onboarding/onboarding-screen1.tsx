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
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
] as const;

/* ── DOB picker data ──────────────────────────────────── */

const MONTHS = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
] as const;

const MONTH_SHORT: Record<string, string> = {
  "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr",
  "5": "May", "6": "Jun", "7": "Jul", "8": "Aug",
  "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

const getDaysInMonth = (month: number, year: number): number => {
  if (!month || month < 1 || month > 12) return 31;
  return new Date(year || 2000, month, 0).getDate();
};

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen1({
  onComplete,
  name: initialName,
  email,
}: OnboardingScreen1Props) {
  const dispatch = useDispatch();
  const { showError } = useToast();
  const [profileImage, setProfileImage] = React.useState<string>("");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [dobModalField, setDobModalField] = useState<"day" | "month" | "year" | null>(null);
  const [uploadProfileImage, { isLoading: isUploading }] =
    useUploadProfileImageMutation();
  const user = useSelector((state: RootState) => state.auth.token);

  /* ── Form ── */
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingScreen1Values>({
    resolver: yupResolver(onboardingScreen1Schema) as any,
    defaultValues: {
      name: "",
      user_name: "",
      country: "",
      dobDay: "",
      dobMonth: "",
      dobYear: "",
      sex: "male",
      weight: "",
      weightUnit: "KG",
      height: "",
      height_unit: "cm",
      weightliftingExposure: "",
    },
  });

  /* ── Prefill name from sign-up ── */
  useEffect(() => {
    if (initialName) {
      setValue("name", initialName);
    }
  }, [initialName, setValue]);

  /* ── Show first validation error ── */
  useEffect(() => {
    const keys = Object.keys(errors) as (keyof OnboardingScreen1Values)[];
    if (keys.length > 0) {
      const firstError = errors[keys[0]]?.message;
      if (firstError) showError(firstError);
    }
  }, [errors]);

  /* ── Image picker ── */
  const handleImagePress = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Gallery", onPress: handleChooseFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

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
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  /* ── Submit ── */
  const onSubmit = async (data: OnboardingScreen1Values) => {
    // Upload profile image if selected
    if (profileImage) {
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: profileImage,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any);

        await uploadProfileImage(formData).unwrap();
      } catch (error) {
        console.error("Failed to upload image:", error);
        return;
      }
    }

    // Calculate age from DOB for backwards compat with API payload
    let age = "";
    if (data.dobDay && data.dobMonth && data.dobYear) {
      const birthDate = new Date(
        parseInt(data.dobYear),
        parseInt(data.dobMonth) - 1,
        parseInt(data.dobDay),
      );
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }
      age = calculatedAge.toString();
    }

    // Map exposure to experience years for API compat
    const experienceMap: Record<string, string> = {
      new: "0",
      developing: "1",
      experienced: "3",
      competitive: "5",
    };

    dispatch(
      saveOnboardingData({
        ...data,
        age,
        experience: experienceMap[data.weightliftingExposure] || "0",
        measurement_system:
          data.weightUnit === "KG" ? "Metric" : "Imperial",
      }),
    );

    if (onComplete) {
      onComplete();
    }
  };

  /* ── Watched values ── */
  const weightUnit = watch("weightUnit");
  const heightUnit = watch("height_unit");
  const selectedExposure = watch("weightliftingExposure");
  const selectedSex = watch("sex");
  const dobDay = watch("dobDay");
  const dobMonth = watch("dobMonth");
  const dobYear = watch("dobYear");

  /* ── DOB picker options (dynamic) ── */
  const dayOptions = useMemo(() => {
    const maxDays = getDaysInMonth(
      parseInt(dobMonth) || 0,
      parseInt(dobYear) || 2000,
    );
    return Array.from({ length: maxDays }, (_, i) => (i + 1).toString());
  }, [dobMonth, dobYear]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: 101 },
      (_, i) => (currentYear - 10 - i).toString(),
    );
  }, []);

  /* Reset day if it exceeds max for selected month/year */
  useEffect(() => {
    if (dobDay && dobMonth) {
      const maxDays = getDaysInMonth(
        parseInt(dobMonth),
        parseInt(dobYear) || 2000,
      );
      if (parseInt(dobDay) > maxDays) {
        setValue("dobDay", "");
      }
    }
  }, [dobMonth, dobYear, dobDay, setValue]);

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={Keyboard.dismiss}>
            {/* ── Title ── */}
            <View style={styles.titleBlock}>
              <Text style={styles.title} maxFontSizeMultiplier={1.2}>
                Athlete profile
              </Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
                Used to set up your training profile
              </Text>
            </View>

            {/* ── Profile Photo ── */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleImagePress}
              activeOpacity={0.7}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person-outline"
                    size={48}
                    color={olyColors.text.disabled}
                  />
                </View>
              )}
              {/* Blue + badge */}
              <View style={styles.avatarBadge}>
                <Ionicons name="add" size={16} color={olyPalette.white} />
              </View>
              <Text style={styles.avatarLabel}>Add profile photo</Text>
            </TouchableOpacity>

            {/* ── Fields ── */}
            <View style={styles.fieldContainer}>
              {/* Full Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <OlyFormField
                    label="FULL NAME"
                    placeholder="Your name"
                    value={value}
                    onChangeText={onChange}
                    error={errors.name?.message}
                  />
                )}
              />

              {/* Username */}
              <Controller
                control={control}
                name="user_name"
                render={({ field: { onChange, value } }) => (
                  <OlyFormField
                    label="USERNAME"
                    placeholder="username"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    error={errors.user_name?.message}
                  />
                )}
              />

              {/* Country */}
              <Controller
                control={control}
                name="country"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text style={styles.fieldLabel}>COUNTRY</Text>
                    <TouchableOpacity
                      style={styles.countrySelector}
                      onPress={() => {
                        setCountrySearch(value || "");
                        setShowCountryModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.countrySelectorText,
                          !value && styles.countrySelectorPlaceholder,
                        ]}
                      >
                        {value || "Select your country"}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={olyColors.text.secondary}
                      />
                    </TouchableOpacity>
                    {errors.country?.message && (
                      <Text style={styles.errorText}>
                        {errors.country.message}
                      </Text>
                    )}

                    {/* Country search modal */}
                    <Modal
                      visible={showCountryModal}
                      transparent
                      animationType="slide"
                      onRequestClose={() => setShowCountryModal(false)}
                    >
                      <View style={styles.countryModalOverlay}>
                        <View style={styles.countryModalContent}>
                          {/* Search bar */}
                          <View style={styles.countrySearchRow}>
                            <Ionicons
                              name="search"
                              size={18}
                              color={olyColors.text.secondary}
                            />
                            <TextInput
                              style={styles.countrySearchInput}
                              placeholder="Search countries..."
                              placeholderTextColor={olyColors.text.disabled}
                              value={countrySearch}
                              onChangeText={setCountrySearch}
                              autoFocus
                              autoCorrect={false}
                            />
                            <TouchableOpacity
                              onPress={() => setShowCountryModal(false)}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Ionicons
                                name="close"
                                size={22}
                                color={olyColors.text.secondary}
                              />
                            </TouchableOpacity>
                          </View>

                          {/* Country list */}
                          <FlatList
                            data={COUNTRIES.filter((c) =>
                              c.toLowerCase().includes(countrySearch.toLowerCase()),
                            )}
                            keyExtractor={(item) => item}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => {
                              const isSelected = value === item;
                              return (
                                <TouchableOpacity
                                  style={[
                                    styles.countryItem,
                                    isSelected && styles.countryItemSelected,
                                  ]}
                                  onPress={() => {
                                    onChange(item);
                                    setShowCountryModal(false);
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.countryItemText,
                                      isSelected && styles.countryItemTextSelected,
                                    ]}
                                  >
                                    {item}
                                  </Text>
                                  {isSelected && (
                                    <Ionicons
                                      name="checkmark"
                                      size={18}
                                      color={olyPalette.primary}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            }}
                            ListEmptyComponent={
                              <View style={styles.countryEmptyState}>
                                <Text style={styles.countryEmptyText}>
                                  No countries found
                                </Text>
                              </View>
                            }
                          />
                        </View>
                      </View>
                    </Modal>
                  </View>
                )}
              />

              {/* Date of Birth — dropdown pickers */}
              <View>
                <Text style={styles.fieldLabel}>DATE OF BIRTH</Text>
                <View style={styles.dobRow}>
                  {/* Day */}
                  <TouchableOpacity
                    style={styles.dobField}
                    onPress={() => setDobModalField("day")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dobDisplayText,
                        !dobDay && styles.dobPlaceholder,
                      ]}
                    >
                      {dobDay || "DD"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={olyColors.text.secondary}
                    />
                  </TouchableOpacity>

                  {/* Month */}
                  <TouchableOpacity
                    style={[styles.dobField, { flex: 1.5 }]}
                    onPress={() => setDobModalField("month")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dobDisplayText,
                        !dobMonth && styles.dobPlaceholder,
                      ]}
                    >
                      {dobMonth ? MONTH_SHORT[dobMonth] : "Month"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={olyColors.text.secondary}
                    />
                  </TouchableOpacity>

                  {/* Year */}
                  <TouchableOpacity
                    style={[styles.dobField, styles.dobFieldYear]}
                    onPress={() => setDobModalField("year")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dobDisplayText,
                        !dobYear && styles.dobPlaceholder,
                      ]}
                    >
                      {dobYear || "YYYY"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={olyColors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
                {(errors.dobDay?.message ||
                  errors.dobMonth?.message ||
                  errors.dobYear?.message) && (
                  <Text style={styles.errorText}>
                    {errors.dobDay?.message ||
                      errors.dobMonth?.message ||
                      errors.dobYear?.message}
                  </Text>
                )}
              </View>

              {/* Sex */}
              <View>
                <Text style={styles.fieldLabel}>SEX</Text>
                <View style={styles.segmentRow}>
                  {(["male", "female", "other"] as const).map((option) => {
                    const isActive = selectedSex === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.segmentButton,
                          isActive && styles.segmentButtonActive,
                        ]}
                        onPress={() => setValue("sex", option)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            isActive && styles.segmentTextActive,
                          ]}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Bodyweight */}
              <View>
                <Text style={styles.fieldLabel}>BODYWEIGHT</Text>
                <View style={styles.unitInputRow}>
                  <Controller
                    control={control}
                    name="weight"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.unitInput}
                        placeholder="0"
                        placeholderTextColor={olyColors.text.disabled}
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  <View style={styles.unitToggle}>
                    {(["KG", "LB"] as const).map((unit) => {
                      const isActive = weightUnit === unit;
                      return (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitToggleButton,
                            isActive && styles.unitToggleButtonActive,
                          ]}
                          onPress={() => setValue("weightUnit", unit)}
                        >
                          <Text
                            style={[
                              styles.unitToggleText,
                              isActive && styles.unitToggleTextActive,
                            ]}
                          >
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                {errors.weight?.message && (
                  <Text style={styles.errorText}>{errors.weight.message}</Text>
                )}
              </View>

              {/* Height */}
              <View>
                <Text style={styles.fieldLabel}>HEIGHT</Text>
                <View style={styles.unitInputRow}>
                  <Controller
                    control={control}
                    name="height"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.unitInput}
                        placeholder="0"
                        placeholderTextColor={olyColors.text.disabled}
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  <View style={styles.unitToggle}>
                    {(["cm", "ft"] as const).map((unit) => {
                      const isActive = heightUnit === unit;
                      return (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitToggleButton,
                            isActive && styles.unitToggleButtonActive,
                          ]}
                          onPress={() => setValue("height_unit", unit)}
                        >
                          <Text
                            style={[
                              styles.unitToggleText,
                              isActive && styles.unitToggleTextActive,
                            ]}
                          >
                            {unit.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Weightlifting Exposure */}
              <View>
                <Text style={styles.fieldLabel}>WEIGHTLIFTING EXPOSURE</Text>
                <View style={styles.exposureGrid}>
                  {EXPOSURE_OPTIONS.map((option) => {
                    const isActive = selectedExposure === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.exposureCard,
                          isActive && styles.exposureCardActive,
                        ]}
                        onPress={() =>
                          setValue("weightliftingExposure", option.value)
                        }
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.exposureTitle,
                            isActive && styles.exposureTitleActive,
                          ]}
                        >
                          {option.title}
                        </Text>
                        <Text
                          style={[
                            styles.exposureSubtitle,
                            isActive && styles.exposureSubtitleActive,
                          ]}
                        >
                          {option.subtitle}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.weightliftingExposure?.message && (
                  <Text style={styles.errorText}>
                    {errors.weightliftingExposure.message}
                  </Text>
                )}
              </View>
            </View>
          </Pressable>

          {/* ── Bottom CTA ── */}
          <View style={styles.bottomCta}>
            <OlyButton
              label={isUploading ? "Saving..." : "NEXT"}
              onPress={handleSubmit(onSubmit)}
              disabled={isUploading}
              loading={isUploading}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isUploading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={olyColors.button.primary.bg}
          />
        </View>
      )}

      {/* ── DOB Picker Modal ── */}
      <Modal
        visible={dobModalField !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDobModalField(null)}
      >
        <View style={styles.countryModalOverlay}>
          <View style={styles.countryModalContent}>
            {/* Header */}
            <View style={styles.dobModalHeader}>
              <Text style={styles.dobModalTitle}>
                {dobModalField === "day"
                  ? "Select Day"
                  : dobModalField === "month"
                    ? "Select Month"
                    : "Select Year"}
              </Text>
              <TouchableOpacity
                onPress={() => setDobModalField(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={olyColors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Options list */}
            <FlatList
              data={
                dobModalField === "day"
                  ? dayOptions
                  : dobModalField === "month"
                    ? MONTHS
                    : yearOptions
              }
              keyExtractor={(item) =>
                typeof item === "string" ? item : item.value
              }
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const itemValue =
                  typeof item === "string" ? item : item.value;
                const itemLabel =
                  typeof item === "string" ? item : item.label;
                const currentValue =
                  dobModalField === "day"
                    ? dobDay
                    : dobModalField === "month"
                      ? dobMonth
                      : dobYear;
                const isSelected = currentValue === itemValue;

                return (
                  <TouchableOpacity
                    style={[
                      styles.countryItem,
                      isSelected && styles.countryItemSelected,
                    ]}
                    onPress={() => {
                      if (dobModalField === "day")
                        setValue("dobDay", itemValue);
                      else if (dobModalField === "month")
                        setValue("dobMonth", itemValue);
                      else if (dobModalField === "year")
                        setValue("dobYear", itemValue);
                      setDobModalField(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.countryItemText,
                        isSelected && styles.countryItemTextSelected,
                      ]}
                    >
                      {itemLabel}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={olyPalette.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: olySpacing[32],
  },

  /* ── Title ── */
  titleBlock: {
    marginBottom: olySpacing[20],
  },
  title: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
  },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  /* ── Avatar ── */
  avatarContainer: {
    alignItems: "center",
    marginBottom: olySpacing[24],
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: olyColors.text.disabled,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: olyPalette.primary,
  },
  avatarBadge: {
    position: "absolute",
    top: 68,
    right: "38%",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: olyPalette.card,
  },
  avatarLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[8],
  },

  /* ── Fields ── */
  fieldContainer: {
    gap: olySpacing[20],
  },
  fieldLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },

  /* ── Date of Birth (dropdown pickers) ── */
  dobRow: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  dobField: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: olyPalette.cardElevated,
    paddingHorizontal: olySpacing[12],
  },
  dobFieldYear: {
    flex: 1.3,
  },
  dobDisplayText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  dobPlaceholder: {
    color: olyColors.text.disabled,
  },
  dobModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
    borderBottomWidth: 0.5,
    borderBottomColor: olyColors.border.default,
  },
  dobModalTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },

  /* ── Sex Selector ── */
  segmentRow: {
    flexDirection: "row",
    gap: olySpacing[8],
  },
  segmentButton: {
    flex: 1,
    height: 44,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: olyPalette.primary,
    borderColor: olyPalette.primary,
  },
  segmentText: {
    ...olyTypography.bodySmall,
    fontFamily: "Ubuntu-Medium",
    color: olyColors.text.secondary,
    textTransform: "uppercase",
  },
  segmentTextActive: {
    color: olyPalette.white,
  },

  /* ── Unit Input (Bodyweight / Height) ── */
  unitInputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: olyPalette.cardElevated,
    paddingHorizontal: olySpacing[16],
  },
  unitInput: {
    flex: 1,
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.sm,
    padding: 2,
  },
  unitToggleButton: {
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
    borderRadius: olyRadius.sm,
  },
  unitToggleButtonActive: {
    backgroundColor: olyPalette.primary,
  },
  unitToggleText: {
    ...olyTypography.caption,
    fontFamily: "Ubuntu-Medium",
    color: olyColors.text.secondary,
  },
  unitToggleTextActive: {
    color: olyPalette.white,
  },

  /* ── Exposure Grid ── */
  exposureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[12],
  },
  exposureCard: {
    width: "47%",
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: "transparent",
    paddingVertical: olySpacing[16],
    paddingHorizontal: olySpacing[12],
  },
  exposureCardActive: {
    backgroundColor: olyPalette.primary,
    borderColor: olyPalette.primary,
  },
  exposureTitle: {
    ...olyTypography.body,
    fontFamily: "Ubuntu-Medium",
    color: olyColors.text.primary,
    marginBottom: olySpacing[4],
  },
  exposureTitleActive: {
    color: olyPalette.white,
  },
  exposureSubtitle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    lineHeight: 18,
  },
  exposureSubtitleActive: {
    color: olyColors.text.secondary,
  },

  /* ── Country Selector ── */
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: olyPalette.cardElevated,
    paddingHorizontal: olySpacing[16],
  },
  countrySelectorText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    flex: 1,
  },
  countrySelectorPlaceholder: {
    color: olyColors.text.disabled,
  },
  countryModalOverlay: {
    flex: 1,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "flex-end",
  },
  countryModalContent: {
    backgroundColor: olyPalette.card,
    borderTopLeftRadius: olyRadius.lg,
    borderTopRightRadius: olyRadius.lg,
    maxHeight: "70%",
    paddingBottom: olySpacing[32],
  },
  countrySearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
    borderBottomWidth: 0.5,
    borderBottomColor: olyColors.border.default,
  },
  countrySearchInput: {
    flex: 1,
    ...olyTypography.body,
    color: olyColors.text.primary,
    paddingVertical: olySpacing[4],
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: olySpacing[12],
    paddingHorizontal: olySpacing[16],
    minHeight: 44,
  },
  countryItemSelected: {
    backgroundColor: olyPalette.cardElevated,
  },
  countryItemText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  countryItemTextSelected: {
    color: olyPalette.white,
    fontFamily: olyFonts.medium,
  },
  countryEmptyState: {
    padding: olySpacing[24],
    alignItems: "center",
  },
  countryEmptyText: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },

  /* ── Error ── */
  errorText: {
    ...olyTypography.caption,
    color: olyPalette.red,
    marginTop: olySpacing[4],
  },

  /* ── Bottom CTA ── */
  bottomCta: {
    paddingTop: olySpacing[32],
  },

  /* ── Loader ── */
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});