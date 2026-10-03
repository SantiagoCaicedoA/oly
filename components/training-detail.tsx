import {
  olyTypography,
  olyFonts,
  olyLetterSpacing,
} from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { ExerciseSet } from "@/store/reducer/trainingSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

/* Enable LayoutAnimation on Android */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TrainingDetailProps {
  name: string;
  totalSets: number;
  reps: number | null;
  weight: number | null;
  rpmPercent: number | null;
  time: string;
  completedSets?: number;
  exerciseSets?: ExerciseSet[];
  onStartExercise: () => void;
}

export default function TrainingDetail({
  name,
  totalSets,
  reps,
  weight,
  rpmPercent,
  time,
  completedSets = 0,
  exerciseSets = [],
  onStartExercise,
}: TrainingDetailProps) {
  const [expanded, setExpanded] = useState(false);

  /* Build subtitle: "3 sets · 15 min rest" */
  const parts: string[] = [];
  if (totalSets) parts.push(`${totalSets} sets`);
  if (time) parts.push(`${time} rest`);
  const subtitle = parts.join(" · ");

  const isDone = completedSets >= totalSets && totalSets > 0;
  const isInProgress = completedSets > 0 && completedSets < totalSets;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, "easeInEaseOut", "opacity")
    );
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>
      {/* Header row — always visible */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.exerciseName, isDone && styles.textDone]}>
            {name}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Completion dots */}
        {totalSets > 0 && (
          <View style={styles.dotsRow}>
            {Array.from({ length: totalSets }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < completedSets && styles.dotFilled,
                  isDone && styles.dotDone,
                ]}
              />
            ))}
          </View>
        )}

        {/* Chevron */}
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={olyColors.text.disabled}
        />
      </TouchableOpacity>

      {/* Expanded preview */}
      {expanded && (
        <View style={styles.preview}>
          {/* Divider */}
          <View style={styles.divider} />

          {/* Set rows — clean text only */}
          <View style={styles.setList}>
            {exerciseSets.map((set, i) => (
              <View
                key={i}
                style={[
                  styles.setRow,
                  set.isComplete && styles.setRowComplete,
                ]}
              >
                <Text
                  style={[
                    styles.setLabel,
                    set.isComplete && styles.setLabelDone,
                  ]}
                >
                  SET {i + 1}
                </Text>
                <Text
                  style={[
                    styles.setWeight,
                    set.isComplete && styles.setWeightDone,
                  ]}
                >
                  {set.weight != null
                    ? `${set.weight} kg × ${set.reps ?? "—"}`
                    : `${set.reps ?? "—"} reps`}
                </Text>
                <Text
                  style={[
                    styles.setPercent,
                    set.isComplete && styles.setPercentDone,
                  ]}
                >
                  {set.rpm_percent}%
                </Text>
              </View>
            ))}
          </View>

          {/* Start Exercise CTA */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={onStartExercise}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>START EXERCISE</Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={olyColors.text.primary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...olyElevation.level1,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  cardDone: {
    opacity: 0.5,
  },

  /* Header row */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: olySpacing[16],
    paddingRight: olySpacing[16],
    paddingLeft: olySpacing[12],
    gap: olySpacing[12],
  },

  /* Content */
  content: {
    flex: 1,
    gap: olySpacing[4],
  },
  exerciseName: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  textDone: {
    textDecorationLine: "line-through",
    color: olyColors.text.secondary,
  },
  subtitle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Completion dots */
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.border.default,
  },
  dotFilled: {
    backgroundColor: olyPalette.primary,
  },
  dotDone: {
    backgroundColor: olyColors.lift.made,
  },

  /* Expanded preview */
  preview: {
    paddingHorizontal: olyLayout.cardPadding,
    paddingBottom: olyLayout.cardPadding,
    gap: olySpacing[12],
  },
  divider: {
    height: 1,
    backgroundColor: olyColors.border.default,
  },

  /* Set rows — clean text, no cards */
  setList: {
    gap: 0,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: olySpacing[8],
    paddingHorizontal: olySpacing[4],
    gap: olySpacing[12],
    borderBottomWidth: 1,
    borderBottomColor: olyColors.border.default,
  },
  setRowComplete: {
    opacity: 0.5,
  },
  setLabel: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    width: 40,
  },
  setLabelDone: {
    color: olyColors.text.disabled,
  },
  setWeight: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    flex: 1,
  },
  setWeightDone: {
    color: olyColors.text.secondary,
  },
  setPercent: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  setPercentDone: {
    color: olyColors.text.disabled,
  },

  /* Start Exercise CTA — outlined, secondary to "Start Workout" */
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: olyColors.border.default,
    borderRadius: olyRadius.full,
    paddingVertical: olySpacing[12],
    marginTop: olySpacing[4],
  },
  startButtonText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
});
