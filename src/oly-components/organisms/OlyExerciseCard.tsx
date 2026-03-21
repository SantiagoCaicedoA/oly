/**
 * OlyExerciseCard — Organism
 *
 * Combines exercise header + set log rows into a complete exercise
 * logging block. This is the core UI for the workout screen.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

/* ── tokens ───────────────────────────────────────────────── */

const olyElevation = {
  level1: {
    backgroundColor: '#161F2C',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
};

const olyRadius = { lg: 12 };

const olySpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
};

const olyColors = {
  text: {
    primary: '#E2E8F0',
    secondary: 'rgba(226,232,240,0.60)',
  },
  intensity: {
    low: '#FACC15',
    mid: '#22C55E',
    high: '#3B82F6',
  },
  lift: {
    made: '#22C55E',
    missed: '#D24B4B',
  },
  border: {
    subtle: 'rgba(255,255,255,0.06)',
  },
};

const olyTypography = {
  title2: { fontFamily: 'Ubuntu-Medium', fontSize: 18, lineHeight: 24 },
  bodySmall: { fontFamily: 'Ubuntu-Regular', fontSize: 14, lineHeight: 20 },
  number: { fontFamily: 'Ubuntu-Medium', fontSize: 20, lineHeight: 24 },
  label: { fontFamily: 'Ubuntu-Medium', fontSize: 12, lineHeight: 16, letterSpacing: 0.8 },
};

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

/* ── column labels ────────────────────────────────────────── */

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
                { color: olyColors.text.secondary, marginTop: olySpacing.xs },
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
                  { color: olyColors.text.secondary, marginLeft: olySpacing.xs },
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
    padding: olySpacing.base,
  },
  header: {
    marginBottom: olySpacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: olySpacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: olyColors.border.subtle,
    marginVertical: olySpacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: olySpacing.sm,
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
    borderRadius: 9999,
  },
});
