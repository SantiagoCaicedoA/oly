/**
 * The shared sheet look (ShopKit's SheetBackdrop and SheetSurface) for
 * @gorhom/bottom-sheet. Pass these to a BottomSheetModal along with
 * style={gorhomSheet.inset} and handleIndicatorStyle={gorhomSheet.handle}.
 */
import { SHEET_GRABBER, SHEET_SIDE, SheetBackdrop, SheetSurface } from "@/src/oly-components/shop/ShopKit";
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import React from "react";
import { StyleSheet, View } from "react-native";

/** Blurred scrim that fades in with the sheet. Tapping it closes. */
export function GorhomSheetBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={1}
      style={[props.style, gorhomSheet.clear]}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <SheetBackdrop />
      </View>
    </BottomSheetBackdrop>
  );
}

/** The glass sheet body behind the content. */
export function GorhomSheetBackground({ style }: BottomSheetBackgroundProps) {
  return <SheetSurface style={style} />;
}

export const gorhomSheet = StyleSheet.create({
  /** Floats the sheet SHEET_SIDE from the screen edges. */
  inset: { marginHorizontal: SHEET_SIDE },
  /** The grabber, same as SheetGrabber. */
  handle: SHEET_GRABBER,
  clear: { backgroundColor: "transparent" },
});
