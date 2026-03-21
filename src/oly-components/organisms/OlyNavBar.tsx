/**
 * OlyNavBar — Organism
 *
 * Top navigation bar for all screens. Supports:
 *   - Back button (left, flush with screen edge)
 *   - Centered title OR custom center element (e.g. logo image)
 *   - Optional right action (icon or text button)
 *
 * Default chevron color: olyPalette.white (#E2E8F0)
 * Override with `tintColor` prop if needed.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { olyColors, olyPalette } from '@/src/oly-theme/oly-colors';
import { olySpacing } from '@/src/oly-theme/oly-spacing';

/* ── layout constants ─────────────────────────────────────── */

const NAV_BAR_HEIGHT = 56;
const MIN_TOUCH = 44;
const SIDE_WIDTH = 48;

/* ── types ────────────────────────────────────────────────── */

interface OlyNavBarProps {
  title?: string;
  /** Custom center element (e.g. logo Image). Takes precedence over title. */
  centerElement?: React.ReactNode;
  onBack?: () => void;
  /** Override the default chevron / action color */
  tintColor?: string;
  rightLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRight?: () => void;
}

/* ── component ────────────────────────────────────────────── */

export const OlyNavBar: React.FC<OlyNavBarProps> = ({
  title,
  centerElement,
  onBack,
  tintColor = olyPalette.white,
  rightLabel,
  rightIcon,
  onRight,
}) => {
  return (
    <View style={styles.container} accessibilityRole="toolbar">
      {/* Left side */}
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.touchTarget}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={tintColor}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Center */}
      <View style={styles.center}>
        {centerElement ? (
          centerElement
        ) : title ? (
          <Text
            style={{
              fontFamily: 'Ubuntu-Medium',
              fontSize: 18,
              lineHeight: 24,
              color: olyColors.text.primary,
            }}
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
          >
            {title}
          </Text>
        ) : null}
      </View>

      {/* Right side */}
      <View style={[styles.side, styles.rightSide]}>
        {(rightLabel || rightIcon) && onRight ? (
          <Pressable
            onPress={onRight}
            style={styles.touchTarget}
            accessibilityRole="button"
            accessibilityLabel={rightLabel || 'Action'}
            hitSlop={8}
          >
            {rightIcon ? (
              <Ionicons
                name={rightIcon}
                size={24}
                color={tintColor}
              />
            ) : (
              <Text
                style={{
                  fontFamily: 'Ubuntu-Medium',
                  fontSize: 14,
                  lineHeight: 20,
                  letterSpacing: 0.4,
                  color: tintColor,
                  textTransform: 'uppercase',
                }}
                maxFontSizeMultiplier={1.2}
              >
                {rightLabel}
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default OlyNavBar;

/* ── styles ───────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    height: NAV_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  touchTarget: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
