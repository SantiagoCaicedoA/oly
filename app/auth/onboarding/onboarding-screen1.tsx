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
import { olyColors, olyPalette, olyGradient } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useToast } from "@/context/toast-context";
import { useUploadProfileImageMutation, useLazyCheckUsernameQuery } from "@/store/api";
import { saveOnboardingData, selectOnboardingData } from "@/store/reducer/onboardingSlice";
import { onboardingScreen1Schema } from "@/utils/validation-schemas";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  mode?: "onboarding" | "settings";
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

/* ── DOB picker data ──────────────────────────────────── */

const MONTHS = [
  { value: "1", short: "Jan", long: "January", num: "01" },
  { value: "2", short: "Feb", long: "February", num: "02" },
  { value: "3", short: "Mar", long: "March", num: "03" },
  { value: "4", short: "Apr", long: "April", num: "04" },
  { value: "5", short: "May", long: "May", num: "05" },
  { value: "6", short: "Jun", long: "June", num: "06" },
  { value: "7", short: "Jul", long: "July", num: "07" },
  { value: "8", short: "Aug", long: "August", num: "08" },
  { value: "9", short: "Sep", long: "September", num: "09" },
  { value: "10", short: "Oct", long: "October", num: "10" },
  { value: "11", short: "Nov", long: "November", num: "11" },
  { value: "12", short: "Dec", long: "December", num: "12" },
];

const currentYear = new Date().getFullYear();
const MIN_AGE = 10;
const MAX_AGE = 110;
const YEARS = Array.from(
  { length: MAX_AGE - MIN_AGE + 1 },
  (_, i) => String(currentYear - MIN_AGE - i)
);

function getDaysInMonth(month: string, year: string): number {
  if (!month) return 31;
  const m = parseInt(month, 10);
  const y = year ? parseInt(year, 10) : 2000; // default leap year if no year
  return new Date(y, m, 0).getDate();
}

function getMonthShort(value: string): string {
  const m = MONTHS.find((mo) => mo.value === value);
  return m ? m.short : "";
}

/* ── Main Component ────────────────────────────────────── */

export default function OnboardingScreen1({
  onComplete,
  name: authName,
  mode = "onboarding",
}: OnboardingScreen1Props) {
  const isSettings = mode === "settings";
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [uploadProfileImage] = useUploadProfileImageMutation();
  const onboardingData = useSelector(
    selectOnboardingData
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    onboardingData?.photo_url || null
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [sexModalVisible, setSexModalVisible] = useState(false);
  const [heightInches, setHeightInches] = useState(
    onboardingData?.heightInches || ""
  );
  const [dobModalVisible, setDobModalVisible] = useState(false);
  // Temp scroll indices for the wheel picker (committed on Confirm)
  const [tempDay, setTempDay] = useState(0);
  const [tempMonth, setTempMonth] = useState(0);
  const [tempYear, setTempYear] = useState(0);
  const dayListRef = useRef<FlatList>(null);
  const monthListRef = useRef<FlatList>(null);
  const yearListRef = useRef<FlatList>(null);

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
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<OnboardingScreen1Values>({
    resolver: yupResolver(onboardingScreen1Schema),
    mode: "onChange",
    defaultValues: {
      name: authName || onboardingData?.name || "",
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

  /* ── Live username availability (Instagram-style, debounced) ── */
  const [triggerCheckUsername] = useLazyCheckUsernameQuery();
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const usernameValue = watchedValues.user_name;
  useEffect(() => {
    const handle = (usernameValue || "").trim().toLowerCase();
    // Only call the API once the handle passes basic format (yup shows format errors)
    if (handle.length < 3 || !/^[a-z0-9._]+$/.test(handle)) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const res = await triggerCheckUsername(handle).unwrap();
        setUsernameStatus(res.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [usernameValue, triggerCheckUsername]);

  /* Auto-save on back (settings mode) */
  const navigationRef = useNavigation();
  const getValuesRef = useRef(getValues);
  getValuesRef.current = getValues;

  useEffect(() => {
    if (!isSettings) return;
    const unsubscribe = navigationRef.addListener("beforeRemove", () => {
      const values = getValuesRef.current();
      dispatch(
        saveOnboardingData({
          ...onboardingData,
          ...values,
          heightInches: values.height_unit === "ft" ? heightInches : undefined,
        }),
      );
    });
    return unsubscribe;
  }, [navigationRef, isSettings, dispatch, onboardingData, heightInches]);

  // DOB wheel picker data
  const DOB_ITEM_HEIGHT = olyLayout.minTouchTarget;
  const DOB_VISIBLE_ITEMS = 5;

  const dayItems = useMemo(() => {
    const max = getDaysInMonth(
      String(tempMonth + 1),
      YEARS[tempYear] || ""
    );
    return Array.from({ length: max }, (_, i) => String(i + 1));
  }, [tempMonth, tempYear]);

  const monthItems = MONTHS.map((m) => m.short);
  const yearItems = YEARS;

  // Open DOB modal — seed temp values from form
  const openDobModal = useCallback(() => {
    const m = watchedValues.dobMonth
      ? parseInt(watchedValues.dobMonth, 10) - 1
      : 0;
    const d = watchedValues.dobDay
      ? parseInt(watchedValues.dobDay, 10) - 1
      : 0;
    const y = watchedValues.dobYear
      ? YEARS.indexOf(watchedValues.dobYear)
      : 20; // default ~30 years old
    setTempMonth(Math.max(0, m));
    setTempDay(Math.max(0, d));
    setTempYear(Math.max(0, y));
    setDobModalVisible(true);
    // Scroll to positions after modal renders
    setTimeout(() => {
      dayListRef.current?.scrollToOffset({
        offset: Math.max(0, d) * DOB_ITEM_HEIGHT,
        animated: false,
      });
      monthListRef.current?.scrollToOffset({
        offset: Math.max(0, m) * DOB_ITEM_HEIGHT,
        animated: false,
      });
      yearListRef.current?.scrollToOffset({
        offset: Math.max(0, y) * DOB_ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, [watchedValues.dobDay, watchedValues.dobMonth, watchedValues.dobYear]);

  // Confirm DOB selection
  const confirmDob = useCallback(() => {
    const selectedDay = String(tempDay + 1);
    const selectedMonth = String(tempMonth + 1);
    const selectedYear = yearItems[tempYear] || YEARS[0];
    setValue("dobDay", selectedDay, { shouldValidate: true });
    setValue("dobMonth", selectedMonth, { shouldValidate: true });
    setValue("dobYear", selectedYear, { shouldValidate: true });
    setDobModalVisible(false);
  }, [tempDay, tempMonth, tempYear, setValue, yearItems]);

  // Handle scroll end for wheel columns
  const handleWheelScroll = useCallback(
    (setter: (i: number) => void, maxIndex: number) =>
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / DOB_ITEM_HEIGHT);
        setter(Math.max(0, Math.min(index, maxIndex)));
      },
    []
  );

  // Clamp day if month/year change makes it invalid
  useEffect(() => {
    if (tempDay >= dayItems.length) {
      setTempDay(dayItems.length - 1);
    }
  }, [dayItems.length, tempDay]);

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
    dispatch(
      saveOnboardingData({
        ...onboardingData,
        ...data,
        heightInches: data.height_unit === "ft" ? heightInches : undefined,
      })
    );
    if (onComplete) {
      onComplete();
    }
  };

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Title Block */}
          {!isSettings && (
          <View style={styles.titleBlock}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2}>
              Athlete profile
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
              Used to set up your training profile
            </Text>
          </View>
          )}

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
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons
                    name="person-outline"
                    size={56}
                    color={olyColors.text.secondary}
                  />
                </View>
              )}
              {/* Blue + badge */}
              <View style={styles.addBadge}>
                <Ionicons name="add" size={20} color={olyPalette.white} />
              </View>
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
              Add profile photo
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
              <View style={styles.fieldContainer}>
                <OlyFormField
                  label="Username"
                  placeholder="Enter your username"
                  value={value}
                  onChangeText={(t) => onChange(t.toLowerCase())}
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={
                    errors.user_name?.message ||
                    (usernameStatus === "taken"
                      ? "That username is already taken"
                      : undefined)
                  }
                />
                {!errors.user_name?.message &&
                  usernameStatus === "checking" && (
                    <Text style={styles.usernameHintChecking}>
                      Checking availability…
                    </Text>
                  )}
                {!errors.user_name?.message &&
                  usernameStatus === "available" && (
                    <Text style={styles.usernameHintAvailable}>
                      ✓ Username available
                    </Text>
                  )}
              </View>
            )}
          />

          {/* Country Dropdown */}
          <Controller
            control={control}
            name="country"
            render={({ field: { value, onChange } }) => (
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
                      !value && styles.dropdownPlaceholder,
                    ]}
                  >
                    {value || "Select a country"}
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

                {/* Country Selection Modal */}
                <Modal
                  visible={countryModalVisible}
                  animationType="slide"
                  onRequestClose={() => setCountryModalVisible(false)}
                >
                  <View style={[styles.modalBg, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() => {
                            onChange(item);
                            setCountryModalVisible(false);
                            setCountrySearch("");
                          }}
                          style={({ pressed }) => [
                            styles.countryItem,
                            pressed && { backgroundColor: olyPalette.card },
                          ]}
                        >
                          <Text style={styles.countryItemText}>{item}</Text>
                        </Pressable>
                      )}
                    />
                  </View>
                </Modal>
              </View>
            )}
          />

          {/* DOB Section — single dropdown trigger */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>DATE OF BIRTH</Text>
            <Pressable
              onPress={openDobModal}
              style={({ pressed }) => [
                styles.dropdownButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !(watchedValues.dobDay && watchedValues.dobMonth && watchedValues.dobYear) &&
                    styles.dropdownPlaceholder,
                ]}
              >
                {watchedValues.dobDay && watchedValues.dobMonth && watchedValues.dobYear
                  ? `${getMonthShort(watchedValues.dobMonth)} ${watchedValues.dobDay}, ${watchedValues.dobYear}`
                  : "Select date of birth"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={olyColors.text.secondary}
              />
            </Pressable>
          </View>

          {/* DOB Scroll Wheel Modal */}
          <Modal
            visible={dobModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setDobModalVisible(false)}
          >
            <View style={styles.dobOverlay}>
              {/* Tap overlay to dismiss */}
              <Pressable
                style={styles.dobOverlayTap}
                onPress={() => setDobModalVisible(false)}
              />
              <View style={styles.dobSheet}>
                {/* Handle */}
                <View style={styles.dobHandle} />

                {/* Header */}
                <View style={styles.dobSheetHeader}>
                  <Text style={styles.dobSheetTitle}>DATE OF BIRTH</Text>
                  <Pressable
                    onPress={() => setDobModalVisible(false)}
                    hitSlop={olySpacing[12]}
                  >
                    <View style={styles.dobCloseBtn}>
                      <Ionicons name="close" size={18} color={olyColors.text.secondary} />
                    </View>
                  </Pressable>
                </View>

                {/* Column labels */}
                <View style={styles.wheelLabels}>
                  <Text style={styles.wheelLabel}>Day</Text>
                  <Text style={styles.wheelLabel}>Month</Text>
                  <Text style={styles.wheelLabel}>Year</Text>
                </View>

                {/* 3-column scroll wheels */}
                <View style={styles.wheelContainer}>
                  {/* Selection highlight band */}
                  <View style={styles.wheelHighlight} pointerEvents="none" />

                  {/* Wheels */}
                  <View style={styles.wheelRow}>
                    {/* Day wheel */}
                    <FlatList
                      ref={dayListRef}
                      data={dayItems}
                      keyExtractor={(item) => `d-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={DOB_ITEM_HEIGHT}
                      decelerationRate="fast"
                      nestedScrollEnabled
                      bounces={false}
                      style={styles.wheelColumn}
                      contentContainerStyle={{
                        paddingVertical: DOB_ITEM_HEIGHT * 2,
                      }}
                      getItemLayout={(_, index) => ({
                        length: DOB_ITEM_HEIGHT,
                        offset: DOB_ITEM_HEIGHT * index,
                        index,
                      })}
                      onMomentumScrollEnd={handleWheelScroll(
                        setTempDay,
                        dayItems.length - 1
                      )}
                      renderItem={({ item, index }) => (
                        <View
                          style={[
                            styles.wheelItem,
                            { height: DOB_ITEM_HEIGHT },
                          ]}
                        >
                          <Text
                            style={[
                              styles.wheelItemText,
                              index === tempDay && styles.wheelItemTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      )}
                    />

                    {/* Month wheel */}
                    <FlatList
                      ref={monthListRef}
                      data={monthItems}
                      keyExtractor={(item) => `m-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={DOB_ITEM_HEIGHT}
                      decelerationRate="fast"
                      nestedScrollEnabled
                      bounces={false}
                      style={styles.wheelColumn}
                      contentContainerStyle={{
                        paddingVertical: DOB_ITEM_HEIGHT * 2,
                      }}
                      getItemLayout={(_, index) => ({
                        length: DOB_ITEM_HEIGHT,
                        offset: DOB_ITEM_HEIGHT * index,
                        index,
                      })}
                      onMomentumScrollEnd={handleWheelScroll(
                        setTempMonth,
                        monthItems.length - 1
                      )}
                      renderItem={({ item, index }) => (
                        <View
                          style={[
                            styles.wheelItem,
                            { height: DOB_ITEM_HEIGHT },
                          ]}
                        >
                          <Text
                            style={[
                              styles.wheelItemText,
                              index === tempMonth && styles.wheelItemTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      )}
                    />

                    {/* Year wheel */}
                    <FlatList
                      ref={yearListRef}
                      data={yearItems}
                      keyExtractor={(item) => `y-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={DOB_ITEM_HEIGHT}
                      decelerationRate="fast"
                      nestedScrollEnabled
                      bounces={false}
                      style={styles.wheelColumn}
                      contentContainerStyle={{
                        paddingVertical: DOB_ITEM_HEIGHT * 2,
                      }}
                      getItemLayout={(_, index) => ({
                        length: DOB_ITEM_HEIGHT,
                        offset: DOB_ITEM_HEIGHT * index,
                        index,
                      })}
                      onMomentumScrollEnd={handleWheelScroll(
                        setTempYear,
                        yearItems.length - 1
                      )}
                      renderItem={({ item, index }) => (
                        <View
                          style={[
                            styles.wheelItem,
                            { height: DOB_ITEM_HEIGHT },
                          ]}
                        >
                          <Text
                            style={[
                              styles.wheelItemText,
                              index === tempYear && styles.wheelItemTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                </View>

                {/* Confirm button */}
                <View style={styles.dobConfirmContainer}>
                  <OlyButton
                    label="Confirm"
                    onPress={confirmDob}
                    variant="primary"
                    fullWidth
                  />
                </View>
              </View>
            </View>
          </Modal>

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
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>BODY METRICS</Text>
            <View style={styles.metricsRow}>
              {/* Weight */}
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Weight</Text>
                <Controller
                  control={control}
                  name="weight"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      style={styles.metricInput}
                      placeholder="0"
                      value={value}
                      onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
                      keyboardType="number-pad"
                      maxLength={3}
                      placeholderTextColor={olyColors.text.disabled}
                      textAlign="center"
                    />
                  )}
                />
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
                            styles.unitPill,
                            value === unit && styles.unitPillActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.unitPillText,
                              value === unit && styles.unitPillTextActive,
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

              {/* Height */}
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Height</Text>
                <Controller
                  control={control}
                  name="height"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.heightInputRow}>
                      {watchedValues.height_unit === "ft" ? (
                        <>
                          <TextInput
                            style={styles.ftInput}
                            placeholder="5"
                            value={value}
                            onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
                            keyboardType="number-pad"
                            maxLength={1}
                            placeholderTextColor={olyColors.text.disabled}
                            textAlign="center"
                          />
                          <Text style={styles.ftSeparator}>'</Text>
                          <TextInput
                            style={styles.ftInput}
                            placeholder="11"
                            value={heightInches}
                            onChangeText={(t) => setHeightInches(t.replace(/[^0-9]/g, ""))}
                            keyboardType="number-pad"
                            maxLength={2}
                            placeholderTextColor={olyColors.text.disabled}
                            textAlign="center"
                          />
                          <Text style={styles.ftSeparator}>"</Text>
                        </>
                      ) : (
                        <TextInput
                          style={styles.metricInput}
                          placeholder="0"
                          value={value}
                          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
                          keyboardType="number-pad"
                          maxLength={3}
                          placeholderTextColor={olyColors.text.disabled}
                          textAlign="center"
                        />
                      )}
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="height_unit"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.unitToggle}>
                      {["CM", "FT"].map((unit) => (
                        <Pressable
                          key={unit}
                          onPress={() => onChange(unit.toLowerCase() as "cm" | "ft")}
                          style={[
                            styles.unitPill,
                            value === unit.toLowerCase() && styles.unitPillActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.unitPillText,
                              value === unit.toLowerCase() && styles.unitPillTextActive,
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
            </View>
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
          {!isSettings && (
            <OlyButton
              label="Continue"
              onPress={() => {
                // Always save current values to Redux (even if invalid)
                const values = getValues();
                dispatch(
                  saveOnboardingData({
                    ...onboardingData,
                    ...values,
                    heightInches: values.height_unit === "ft" ? heightInches : undefined,
                  })
                );
                // Only navigate if valid
                handleSubmit(handleSubmitForm)();
              }}
              disabled={
                !isValid ||
                usernameStatus === "checking" ||
                usernameStatus === "taken"
              }
              style={styles.submitButton}
              fullWidth
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: olyColors.bg.app,
  },
  titleBlock: { marginBottom: olySpacing[20] },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: olySpacing[24],
  },
  profileImageButton: {
    position: "relative",
    marginBottom: olySpacing[12],
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: olyColors.border.default,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.bg.app,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  addBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
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
    marginTop: olySpacing[24],
  },
  usernameHintChecking: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  usernameHintAvailable: {
    ...olyTypography.caption,
    color: olyPalette.green,
    marginTop: olySpacing[4],
  },
  label: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olySpacing[16],
    minHeight: olyLayout.inputHeight,
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
  },
  dropdownButtonText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  dropdownPlaceholder: {
    color: olyColors.text.disabled,
  },
  modalBg: {
    flex: 1,
    backgroundColor: olyGradient.colors[2],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: olyColors.border.default,
  },
  modalCloseButton: {
    ...olyTypography.body,
    color: olyPalette.white,
  },
  modalTitle: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  searchInput: {
    ...olyTypography.body,
    marginHorizontal: olySpacing[16],
    marginTop: olySpacing[16],
    marginBottom: olySpacing[8],
    paddingHorizontal: olySpacing[16],
    minHeight: olyLayout.inputHeight,
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
    color: olyColors.text.primary,
  },
  countryItem: {
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: olyColors.border.default,
  },
  countryItemText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  // DOB bottom sheet overlay
  dobOverlay: {
    flex: 1,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "flex-end" as const,
  },
  dobOverlayTap: {
    flex: 1,
  },
  dobSheet: {
    backgroundColor: olyPalette.card,
    borderTopLeftRadius: olyRadius.lg,
    borderTopRightRadius: olyRadius.lg,
    paddingBottom: olySpacing[32],
  },
  dobHandle: {
    width: olySpacing[32],
    height: olySpacing[4],
    borderRadius: olyRadius.sm,
    backgroundColor: olyColors.border.default,
    alignSelf: "center" as const,
    marginTop: olySpacing[8],
  },
  dobSheetHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
  },
  dobSheetTitle: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase" as const,
  },
  dobCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: olyPalette.card,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  // Wheel picker
  wheelContainer: {
    position: "relative" as const,
    height: olyLayout.minTouchTarget * 5,
    marginHorizontal: olySpacing[16],
    overflow: "hidden" as const,
  },
  wheelHighlight: {
    position: "absolute" as const,
    top: olyLayout.minTouchTarget * 2,
    left: 0,
    right: 0,
    height: olyLayout.minTouchTarget,
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.lg,
    zIndex: 1,
  },
  wheelLabels: {
    flexDirection: "row" as const,
    paddingHorizontal: olySpacing[16],
    marginBottom: olySpacing[8],
  },
  wheelLabel: {
    flex: 1,
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  wheelRow: {
    flexDirection: "row" as const,
    flex: 1,
  },
  wheelColumn: {
    flex: 1,
  },
  wheelItem: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  wheelItemText: {
    ...olyTypography.body,
    color: olyColors.text.disabled,
    textAlign: "center" as const,
  },
  wheelItemTextActive: {
    color: olyColors.text.primary,
    fontFamily: olyFonts.medium,
  },
  dobConfirmContainer: {
    paddingHorizontal: olySpacing[16],
    marginTop: olySpacing[24],
  },
  sexSelector: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  sexButton: {
    flex: 1,
    minHeight: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sexButtonActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  sexButtonText: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    textTransform: "capitalize" as const,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  sexButtonTextActive: {
    color: olyPalette.white,
  },
  metricsRow: {
    flexDirection: "row" as const,
    gap: olySpacing[12],
  },
  metricCard: {
    flex: 1,
    padding: olySpacing[16],
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    alignItems: "center" as const,
  },
  metricTitle: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginBottom: olySpacing[8],
    textTransform: "uppercase" as const,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  metricInput: {
    ...olyTypography.display,
    color: olyColors.text.primary,
    minHeight: 48,
    width: "100%" as any,
    textAlign: "center" as const,
    padding: 0,
  },
  heightInputRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    justifyContent: "center" as const,
    width: "100%" as any,
  },
  ftInput: {
    ...olyTypography.display,
    color: olyColors.text.primary,
    minHeight: 48,
    width: 36,
    textAlign: "center" as const,
    padding: 0,
  },
  ftSeparator: {
    ...olyTypography.title2,
    color: olyColors.text.disabled,
  },
  unitToggle: {
    flexDirection: "row" as const,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    padding: olySpacing[4],
    marginTop: olySpacing[8],
  },
  unitPill: {
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[4],
    borderRadius: olyRadius.full,
  },
  unitPillActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  unitPillText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    textTransform: "capitalize" as const,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  unitPillTextActive: {
    color: olyPalette.white,
  },
  inputError: {
    borderColor: olyColors.border.error,
  },
  errorText: {
    ...olyTypography.caption,
    color: olyColors.text.error,
    marginTop: olySpacing[4],
  },
  exposureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[12],
  },
  exposureCard: {
    width: "48%",
    padding: olySpacing[16],
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
  },
  exposureCardActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  exposureTitle: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    marginBottom: olySpacing[4],
  },
  exposureSubtitle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  submitButton: {
    marginTop: olySpacing[40],
  },
});
