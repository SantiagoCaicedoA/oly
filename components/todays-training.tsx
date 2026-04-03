import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { Exercise } from "@/store/reducer/trainingSlice";
import React from "react";
import { StyleSheet, View } from "react-native";
import TrainingDetail from "./training-detail";

interface TodaysTrainingProps {
  trainings: Exercise[];
  onPressItem?: (item: Exercise) => void;
}

export default function TodaysTraining({
  trainings,
  onPressItem,
}: TodaysTrainingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {trainings.map((item, index) => {
          const completedSets = item.sets
            ? item.sets.filter((s) => s.isComplete).length
            : 0;

          return (
            <TrainingDetail
              key={index}
              name={item.exercise_name}
              totalSets={item.no_of_set}
              reps={item.reps}
              weight={item.weight_lifted}
              rpmPercent={item.rpm_percent}
              time={item.time}
              completedSets={completedSets}
              exerciseSets={item.sets ?? []}
              onStartExercise={() => onPressItem?.(item)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: olySpacing[12],
  },
  list: {
    gap: olySpacing[8],
  },
});
