import { Images } from "@/assets";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
import RateLift from "./rate-lift";
import ResetPresets from "./reset-preset";
import WeightAndRpe from "./weight-and-rpe";

const ActionSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const { colors } = useTheme();
  const [weight, setWeight] = useState(105);
  const [reps, setReps] = useState(3);
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const [rpe, setRpe] = useState(5);
  const [limitingFactor, setLimitingFactor] = useState("");
  const [wasMiss, setWasMiss] = useState(false);
  const [failLocation, setFailLocation] = useState("");
  const [missedWhere, setMissedWhere] = useState("");
  const styles = StyleSheet.create({
    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: scale(20),
      marginBottom: scale(12),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scale(6),
    },
    profile: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      marginRight: scale(10),
    },
    userInfo: {
      flex: 1,
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    userName: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    optionIcon: {
      width: scale(12),
      height: scale(15),
    },
    prescriptionContainer: {
      backgroundColor: colors.lightBlue,
      borderRadius: scale(15),
      borderWidth: scale(1),
      borderColor: colors.primary,
      paddingHorizontal: scale(12),
      paddingVertical: scale(8),
      gap: scale(5),
      marginTop: scale(15),
      marginBottom: scale(10),
    },
    prescriptionText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    coachText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.medium,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    weightRowContainer: {
      flexDirection: "row",
      gap: scale(8),
    },
    weight: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    unit: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(16),
    },
  });

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.text }}
    >
      <BottomSheetScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={Images.profile} style={styles.profile} />
          <View style={styles.userInfo}>
            <View
              style={{
                flexDirection: "row",
                gap: scale(7),
                alignItems: "center",
              }}
            >
              <Text style={styles.userName}>VIDEO UPLOADED </Text>
            </View>

            <Text style={styles.name}>PAUSE POWER SNATCH..</Text>
          </View>
          <TouchableOpacity>
            <Image
              source={Images.optionicon}
              style={styles.optionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.prescriptionContainer}>
          <Text style={styles.coachText}>COACHES PRESCRIPTION</Text>
          <Text style={styles.prescriptionText}>
            This rep should feel easy. Make sure up this point, your lifts look
            close to perfection.
          </Text>
          <View style={styles.weightRowContainer}>
            <Text style={styles.weight}>
              105 <Text style={styles.unit}>kg</Text>
            </Text>
            <Text style={styles.weight}>
              7-8 <Text style={styles.unit}>RPE</Text>
            </Text>
          </View>
        </View>
        <View style={{ gap: scale(12) }}>
          <WeightAndRpe
            weight={weight}
            onWeightChange={setWeight}
            reps={reps}
            onRepsChange={setReps}
          />
          <RateLift
            rpeValue={rpe}
            onRpeChange={setRpe}
            limitingFactor={limitingFactor}
            onLimitingFactorChange={setLimitingFactor}
          />
          <ResetPresets
            wasMiss={wasMiss}
            onWasMissChange={setWasMiss}
            failLocation={failLocation}
            onFailLocationChange={setFailLocation}
            missedWhere={missedWhere}
            onMissedWhereChange={setMissedWhere}
          />
          <CustomButton title="SAVE" />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default ActionSheet;
