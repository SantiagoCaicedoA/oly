/**
 * OlyNavBar — Organism
 *
 * Top navigation bar for all screens. Supports:
 *   - Back button (left)
 *   - Centered title
 *   - Optional right action (icon or text button)
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/* ── tokens ───────────────────────────────────────────────── */

const olyLayout = {
  navBarHeight: 56,
  screenPadding: 16,
  minTouchTarget: 44,
};

const olyColors = {
  text: {
    primary: '#E2E8F0',
  },
  button: {
    primary: '#3B82F6',
  },
};

const olyTypography = {
  title2: { fontFamily: 'Ubuntu-Medium', fontSize: 18, lineHeight: 24 },
  button: { fontFamily: 'Ubuntu-Medium', fontSize: 14, lineHeight: 20, letterSpacing: 0.4 },
};

/* ── types ────────────────────────────────────────────────── */

interface OlyNavBarProps {
  title?: string;
  onBack?: () => void;
  rightLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRight?: () => void;
}

/* ── component ────────────────────────────────────────────── */

export const OlyNavBar: React.FC<OlyNavBarProps> = ({
  title,
  onBack,
  rightLabel,
  rightIcon,
  onRight,
}) => {
  return (
    <View style={styles.container} accessibilityRole="toolbar">
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
              color={olyColors.button.primary}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        {title ? (
          <Text
            style={[olyTypography.title2, { color: olyColors.text.primary }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
          >
            {title}
          </Text>
        ) : null}
      </View>

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
                color={olyColors.button.primary}
              />
            ) : (
              <Text
                style={[
                  olyTypography.button,
                  { color: olyColors.button.primary, textTransform: 'uppercase' },
                ]}
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
    height: olyLayout.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: olyLayout.screenPadding,
  },
  side: {
    width: 56,
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
    minWidth: olyLayout.minTouchTarget,
    minHeight: olyLayout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
