/**
 * OlyNavBar — Organism
 *
 * Top navigation bar. Back button flush-left (no padding).
 * Supports centered title OR custom center element (e.g. logo).
 * Optional right action.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { olyColors, olyPalette } from '@/src/oly-theme/oly-colors';

const NAV_BAR_HEIGHT = 56;
const MIN_TOUCH = 44;

interface OlyNavBarProps {
  title?: string;
  centerElement?: React.ReactNode;
  onBack?: () => void;
  tintColor?: string;
  rightLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRight?: () => void;
}

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
      {/* Left — back button, flush to left edge */}
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, right: 16 }}
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

      {/* Right */}
      <View style={[styles.side, styles.rightSide]}>
        {(rightLabel || rightIcon) && onRight ? (
          <Pressable
            onPress={onRight}
            style={styles.rightButton}
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

const styles = StyleSheet.create({
  container: {
    height: NAV_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    // NO padding — back button must be flush with screen edge
  },
  side: {
    width: MIN_TOUCH,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    alignItems: 'flex-start',   // chevron hugs the left edge
  },
  rightButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
