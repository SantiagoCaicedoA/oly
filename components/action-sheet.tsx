import { useTheme } from "@/context/theme-context";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { scale } from "react-native-size-matters";

const ActionSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const { colors } = useTheme();

  const snapPoints = useMemo(() => ["50%", "90%"], []);

  const styles = StyleSheet.create({
    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: scale(20),
    },
  });

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.text }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={{ color: colors.text }}>
          Your bottom sheet content here
        </Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default ActionSheet;
