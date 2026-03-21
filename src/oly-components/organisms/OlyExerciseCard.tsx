/**
 * OlyExerciseCard — Organism
 *
 * Combines exercise header + set log rows into a complete exercise
 * logging block. This is the core UI for the workout screen.
 *
 * Now imports from the theme system instead of hardcoding tokens.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { olyColors } from '@/src/oly-theme/oly-colors';
import { olyTypography } from '@/src/oly-theme/oly-typography';
import { olySpacing } from '@/src/oly-theme/oly-spacing';
import { olyRadius } from '@/src/oly-theme/oly-radius';
import { olyElevation } from '@/src/oly-theme/oly-elevation';

/* ── types ────────────────────────────────────────────────── */

export interface SetData {
  setNumber: number;
  reps: number;
  weight: number;
  unit?: string;
  percentage?: number;
  made: boolean;
}

interface OlyExerciseCardProps {
  exerciseName: string;
  prescription?: string;
  intensity?: 'low' | 'mid' | 'high';
  sets: SetData[];
  onToggleMake?: (setIndex: number) => void;
}

/* ── column labels ──────────────────────────────────────── */

const COLUMNS = ['SET', 'REPS', 'WEIGHT', '', ''] as const;

/* ── component ────────────────────────────────────────────── */

export const OlyExerciseCard: React.FC<OlyExerciseCardProps> = ({
  exerciseName,
  prescription,
  intensity = 'mid',
  sets,
  onToggleMake,
}) => {
  const handleToggle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleMake?.(index);
  };

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View
        style={[
          styles.intensityBar,
          { backgroundColor: olyColors.intensity[intensity] },
        ]}
      />

      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Text
            style={[olyTypography.title2, { color: olyColors.text.primary }]}
            accessibilityRole="header"
            maxFontSizeMultiplier={1.2}
          >
            {exerciseName}
          </Text>
          {prescription ? (
            <Text
              style={[
                olyTypography.bodySmall,
                { color: olyColors.text.secondary, marginTop: olySpacing[4] },
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {prescription}
            </Text>
          ) : null}
        </View>

        <View style={styles.row}>
          {COLUMNS.map((label, i) => (
            <View
              key={i}
              style={[
                i === 0 && styles.setCol,
                i === 1 && styles.repsCol,
                i === 2 && styles.weightCol,
                i === 3 && styles.pctCol,
                i === 4 && styles.badgeCol,
              ]}
            >
              {label ? (
                <Text
                  style={[
                    olyTypography.label,
                    { color: olyColors.text.secondary, textTransform: 'uppercase' },
                  ]}
                  maxFontSizeMultiplier={1.2}
                >
                  {label}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {sets.map((set, index) => (
          <Pressable
            key={set.setNumber}
            style={styles.setRow}
            onPress={() => handleToggle(index)}
            accessibilityRole="button"
            accessibilityLabel={`Set ${set.setNumber}, ${set.reps} reps at ${set.weight} ${set.unit || 'kg'}, ${set.made ? 'made' : 'missed'}`}
          >
            <View style={styles.setCol}>
              <Text
                style={[olyTypography.label, { color: olyColors.text.secondary }]}
                maxFontSizeMultiplier={1.2}
              >
                {set.setNumber}
              </Text>
            </View>

            <View style={styles.repsCol}>
              <Text
                style={[olyTypography.number, { color: olyColors.text.primary }]}
                maxFontSizeMultiplier={1.2}
              >
                {set.reps}
              </Text>
            </View>

            <View style={styles.weightCol}>
              <Text
                style={[olyTypography.number, { color: olyColors.text.primary }]}
                maxFontSizeMultiplier={1.2}
              >
                {set.weight}
              </Text>
              <Text
                style={[
                  olyTypography.label,
                  { color: olyColors.text.secondary, marginLeft: olySpacing[4] },
                ]}
                maxFontSizeMultiplier={1.2}
              >
                {set.unit || 'kg'}
              </Text>
            </View>

            {set.percentage != null && (
              <View style={styles.pctCol}>
                <Text
                  style={[olyTypography.bodySmall, { color: olyColors.text.secondary }]}
                  maxFontSizeMultiplier={1.2}
                >
                  {set.percentage}%
                </Text>
              </View>
            )}

            <View style={styles.badgeCol}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: set.made
                      ? olyColors.lift.made
                      : olyColors.lift.missed,
                  },
                ]}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default OlyExerciseCard;

/* ── styles ───────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    ...olyElevation.level1,
    borderRadius: olyRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  intensityBar: {
    width: 4,
    borderTopLeftRadius: olyRadius.lg,
    borderBottomLeftRadius: olyRadius.lg,
  },
  cardContent: {
    flex: 1,
    padding: olySpacing[16],
  },
  header: {
    marginBottom: olySpacing[12],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: olySpacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: olyColors.border.default,
    marginVertical: olySpacing[8],
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: olySpacing[8],
  },
  setCol: {
    width: 40,
  },
  repsCol: {
    width: 56,
  },
  weightCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pctCol: {
    width: 48,
    alignItems: 'flex-end',
  },
  badgeCol: {
    width: 32,
    alignItems: 'center',
  },
  badge: {
    width: 12,
    height: 12,
    borderRadius: olyRadius.full,
  },
});
