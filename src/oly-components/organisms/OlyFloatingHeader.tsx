/**
 * OlyFloatingHeader — Organism
 *
 * A top bar that floats over scrolling content. A fade from the page colour
 * sits behind it, so content dissolves under the header instead of being
 * cut by a hard line.
 *
 * Usage:
 *   const { headerH, onLayout } = useFloatingHeader();
 *   <View style={{ flex: 1 }}>
 *     <ScrollView
 *       contentContainerStyle={{ paddingTop: headerH + spacing }}
 *       scrollIndicatorInsets={{ top: headerH }}
 *     />
 *     <OlyFloatingHeader onLayout={onLayout}>{header}</OlyFloatingHeader>
 *   </View>
 *
 * The parent must be a positioned container (any View) that also holds the
 * list. Render the header AFTER the list so it stacks above it.
 * With a RefreshControl, pass `progressViewOffset={headerH}`.
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { olyColors } from '@/src/oly-theme/oly-colors';

/** Measured header height. `initial` avoids a jump on the first frame. */
export function useFloatingHeader(initial = 0) {
  const [headerH, setHeaderH] = useState(initial);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderH(e.nativeEvent.layout.height);
  }, []);
  return { headerH, onLayout };
}

interface OlyFloatingHeaderProps {
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  /** Pad for the status bar. Pass false when a parent (e.g. SafeAreaView) already does. */
  safeTop?: boolean;
  /** How far the fade bleeds below the header. */
  fadeBleed?: number;
  style?: StyleProp<ViewStyle>;
}

export const OlyFloatingHeader: React.FC<OlyFloatingHeaderProps> = ({
  children,
  onLayout,
  safeTop = true,
  fadeBleed = 28,
  style,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.wrap, safeTop && { paddingTop: insets.top }, style]}
      onLayout={onLayout}
    >
      <LinearGradient
        colors={olyColors.glass.fadeHeader}
        locations={olyColors.glass.fadeHeaderLocations}
        // Inside a SafeAreaView the header starts under the status bar, so
        // the fade reaches up behind it too. Otherwise its top edge shows as
        // a hard line against the page glow.
        style={[styles.fade, { top: safeTop ? 0 : -insets.top, bottom: -fadeBleed }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
};

export default OlyFloatingHeader;

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  fade: { position: 'absolute', left: 0, right: 0 },
});
