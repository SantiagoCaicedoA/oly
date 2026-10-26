/**
 * OlyScreenHeader — the one header every screen uses.
 *
 * The Messages header: a 28px bold title on the left. Screens you open from
 * somewhere else add the glass back button (a 40px glass circle with a thin
 * chevron, from the Notifications design on the canvas) before the title. `right` holds at most one quiet action.
 *
 * Put it inside OlyFloatingHeader so the list fades under it.
 */
import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Glass } from "@/src/oly-components/shop/ShopKit";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";

export function OlyScreenHeader({
  title,
  onBack,
  right,
  style,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, onBack && styles.rowWithBack, style]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Glass radius={olyRadius.full} style={styles.backCircle}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke={olyColors.text.primary}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Glass>
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

export default OlyScreenHeader;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
    minHeight: olyLayout.minTouchTarget + olySpacing[20],
  },
  rowWithBack: { paddingLeft: olySpacing[12] },
  // 44px touch box around a 40px circle, so the circle's edge lines up
  // with the screen padding.
  back: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    marginRight: olySpacing[8],
  },
  backCircle: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.6 },
  title: {
    ...olyTypography.title1,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
    flex: 1,
  },
  right: { marginLeft: olySpacing[12] },
});
