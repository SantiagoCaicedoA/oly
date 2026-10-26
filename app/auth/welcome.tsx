/**
 * Welcome / Landing Screen
 *
 * First screen users see. Shows OLY logo, tagline,
 * Sign Up (primary, glowing) and Log In (glass) buttons.
 *
 * Figma: Login Screen (node 3591-1116)
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, Keyframe, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { olyColors, olyPalette } from '@/src/oly-theme/oly-colors';
import { olyFonts, olyTypography, olyLetterSpacing } from '@/src/oly-theme/oly-typography';
import { olyLayout, olySpacing } from '@/src/oly-theme/oly-spacing';
import { olyRadius } from '@/src/oly-theme/oly-radius';
import { olyGlow } from '@/src/oly-theme/oly-elevation';
import { Glows } from '@/src/oly-components/shop/ShopKit';

/* ── entrance animations ──────────────────────────────── */

const logoEntering = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.92 }] },
  100: { opacity: 1, transform: [{ scale: 1 }] },
}).duration(700);

/* ── component ──────────────────────────────────────────── */

export default function Welcome() {
  const reduceMotion = useReducedMotion();

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

      <View style={styles.root}>
        <Glows variant="shop" />
        <SafeAreaView style={styles.safe}>
          {/* ── Logo + tagline (centered) ── */}
          <View style={styles.centerContent}>
            <Animated.Image
              entering={reduceMotion ? undefined : logoEntering}
              source={require('@/assets/images/oly-logo.webp')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Animated.Text
              entering={reduceMotion ? undefined : FadeIn.duration(500).delay(300)}
              style={styles.tagline}
              maxFontSizeMultiplier={1.5}
            >
              Programming that adapts to you
            </Animated.Text>
          </View>

          {/* ── Bottom buttons ── */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.duration(500).delay(500)}
            style={styles.bottomSection}
          >
            {/* Sign Up — primary button */}
            <Pressable
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.buttonBase,
                styles.signUpButton,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign up"
            >
              <Text style={styles.signUpText}>SIGN UP</Text>
            </Pressable>

            {/* Log In — glass button */}
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
          </Animated.View>
        </SafeAreaView>
      </View>
    </>
  );
}

/* ── styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: olyColors.bg.page,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: olyLayout.screenPadding,
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
    height: olyLayout.inputHeight,
    borderRadius: olyRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: olySpacing[16],
  },
  signUpButton: {
    backgroundColor: olyPalette.primary,
    ...olyGlow.md,
  },
  signUpText: {
    ...olyTypography.button,
    fontFamily: olyFonts.bold,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: 'uppercase',
  },
  logInButton: {
    backgroundColor: olyColors.glass.control,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  logInText: {
    ...olyTypography.button,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
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
