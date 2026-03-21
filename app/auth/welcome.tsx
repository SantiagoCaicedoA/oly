/**
 * Welcome / Landing Screen
 *
 * First screen users see. Shows OLY logo, tagline,
 * Sign Up (gradient) and Log In (outlined) buttons.
 *
 * Figma: Login Screen (node 3591-1116)
 */

import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { olyColors, olyPalette } from '@/src/oly-theme/oly-colors';
import { olyTypography, olyLetterSpacing } from '@/src/oly-theme/oly-typography';
import { olySpacing } from '@/src/oly-theme/oly-spacing';
import { olyRadius } from '@/src/oly-theme/oly-radius';

/* ── gradients from Figma ───────────────────────────────── */

const BG_GRADIENT = {
  colors: ['#1A2533', '#0F1A24', '#1E3348', '#0C1620'],
  locations: [0, 0.3, 0.6, 1] as [number, number, number, number],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

const SIGNUP_GRADIENT = {
  colors: ['#0058CC', '#004AAD', '#003D8F'],
  locations: [0, 0.4, 1] as [number, number, number],
  start: { x: 0, y: 0.5 },
  end: { x: 1, y: 0.5 },
};

/* ── component ──────────────────────────────────────────── */

export default function Welcome() {
  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/sign-up');
  };

  const handleLogIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
  };

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />

      <LinearGradient
        colors={BG_GRADIENT.colors}
        locations={BG_GRADIENT.locations}
        start={BG_GRADIENT.start}
        end={BG_GRADIENT.end}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe}>
          {/* ── Logo + tagline (centered) ── */}
          <View style={styles.centerContent}>
            <Image
              source={require('@/assets/images/oly-logo.webp')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={styles.tagline}
              maxFontSizeMultiplier={1.5}
            >
              Programming that adapts to you
            </Text>
          </View>

          {/* ── Bottom buttons ── */}
          <View style={styles.bottomSection}>
            {/* Sign Up — gradient button */}
            <Pressable
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.buttonBase,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign up"
            >
              <LinearGradient
                colors={SIGNUP_GRADIENT.colors}
                locations={SIGNUP_GRADIENT.locations}
                start={SIGNUP_GRADIENT.start}
                end={SIGNUP_GRADIENT.end}
                style={styles.signUpGradient}
              >
                <Text style={styles.signUpText}>SIGN UP</Text>
              </LinearGradient>
            </Pressable>

            {/* Log In — outlined button */}
            <Pressable
              onPress={handleLogIn}
              style={({ pressed }) => [
                styles.buttonBase,
                styles.logInButton,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Log in"
            >
              <Text style={styles.logInText}>LOG IN</Text>
            </Pressable>

            {/* Terms */}
            <Text
              style={styles.termsText}
              maxFontSizeMultiplier={1.3}
            >
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

/* ── styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: olySpacing[16],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  tagline: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[16],
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: olySpacing[16],
    gap: olySpacing[12],
  },

  /* ── buttons ── */
  buttonBase: {
    width: '100%',
    borderRadius: olyRadius.lg,
    overflow: 'hidden',
  },
  signUpGradient: {
    height: 52,
    borderRadius: olyRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: olySpacing[16],
  },
  signUpText: {
    ...olyTypography.button,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: 'uppercase',
  },
  logInButton: {
    height: 54,
    backgroundColor: olyPalette.card,
    borderWidth: 1,
    borderColor: olyColors.button.disabled.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: olySpacing[16],
  },
  logInText: {
    ...olyTypography.button,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: 'uppercase',
  },

  /* ── terms ── */
  termsText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    textAlign: 'center',
    marginTop: olySpacing[8],
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: olyColors.text.secondary,
  },
});
