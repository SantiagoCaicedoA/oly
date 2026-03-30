/**
 * OlyScreenWrapper — Organism
 *
 * Full-screen gradient background + SafeAreaView wrapper.
 * Every screen in the app should be wrapped with this component.
 *
 * Imports gradient from theme tokens to stay in sync.
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
import { olyGradient } from '@/src/oly-theme/oly-colors';
import { olyLayout } from '@/src/oly-theme/oly-spacing';

interface OlyScreenWrapperProps {
  children: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
  statusBarStyle?: 'light' | 'dark';
}

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

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: olyGradient.colors[2],
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
