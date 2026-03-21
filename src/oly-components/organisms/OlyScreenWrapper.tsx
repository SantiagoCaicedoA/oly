/**
 * OlyScreenWrapper — Organism
 *
 * Full-screen gradient background + SafeAreaView wrapper.
 * Every screen in the app should be wrapped with this component.
 *
 * Usage:
 *   <OlyScreenWrapper>
 *     <OlyNavBar title="Workout" />
 *     <ScrollView>…</ScrollView>
 *   </OlyScreenWrapper>
 *
 * Tokens used:
 *   olyGradient        → background gradient colors + stops
 *   olyLayout          → screenPadding (16px)
 *   olyColors.bg.base  → fallback if gradient fails
 */

import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

/* ── tokens ───────────────────────────────────────────────── */

const olyGradient = {
  colors: ['#0D1117', '#111922', '#0D1117'] as const,
  locations: [0, 0.5, 1] as [number, number, number],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

const olyLayout = {
  screenPadding: 16,
};

const olyColorsBg = {
  base: '#0D1117',
};

/* ── types ────────────────────────────────────────────────── */

interface OlyScreenWrapperProps {
  children: React.ReactNode;
  /** Add horizontal screen padding (default: true) */
  padded?: boolean;
  /** Extra style applied to the inner content container */
  style?: ViewStyle;
  /** Light or dark status bar (default: 'light') */
  statusBarStyle?: 'light' | 'dark';
}

/* ── component ────────────────────────────────────────────── */

export const OlyScreenWrapper: React.FC<OlyScreenWrapperProps> = ({
  children,
  padded = true,
  style,
  statusBarStyle = 'light',
}) => {
  return (
    <LinearGradient
      colors={[...olyGradient.colors]}
      locations={[...olyGradient.locations]}
      start={olyGradient.start}
      end={olyGradient.end}
      style={styles.gradient}
    >
      <StatusBar
        barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.safe}>
        <View
          style={[
            styles.content,
            padded && { paddingHorizontal: olyLayout.screenPadding },
            style,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OlyScreenWrapper;

/* ── styles ───────────────────────────────────────────────── */

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: olyColorsBg.base,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
