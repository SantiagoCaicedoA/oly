import { Images } from "@/assets";
import AddExerciseCard from "@/components/add-exercise-card";
import SearchContainer from "@/components/search-container";
import SuggestedExerciseCard from "@/components/suggested-exercise-card";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
const suggestedExercises = [
  {
    id: "1",
    exerciseName: "Snatch",
    fitLabel: "EXERCISE FIT",
    explanation: "Focuses on your pull consistency for today’s volume",
  },
  {
    id: "2",
    exerciseName: "Clean & Jerk",
    fitLabel: "GREAT FIT",
    explanation: "Helps improve your turnover speed and stability",
  },
  {
    id: "3",
    exerciseName: "Back Squat",
    fitLabel: "GOOD FIT",
    explanation: "Builds leg strength for better drive and lockout",
  },
];
const aiCoachCards = [
  {
    exerciseName: "Snatch",
    detailLabel: "EXERCISE FIT",
  },
  {
    exerciseName: "Clean & Jerk",
    detailLabel: "GREAT FIT",
  },
];

const recentSearchCards = [
  {
    exerciseName: "Back Squat",
    detailLabel: "RECENT",
  },
  {
    exerciseName: "Front Squat",
    detailLabel: "RECENT",
  },
];

export default function AddExercise() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const { width } = Dimensions.get("window");
  const CARD_WIDTH = width * 0.7;
  const handleBackPress = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(10),
      position: "relative",
      backgroundColor: colors.headerBackground,
    },
    backButton: {
      position: "absolute",
      left: scale(15),
      width: scale(12),
      height: scale(12),
    },
    headerText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
      textAlign: "center",
    },
    suggestion: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image
            source={Images.arrowBack}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>

        <Text style={styles.headerText}>EXERCISE</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: scale(10) }}>
          <Text style={styles.suggestion}>AI COACH SUGGESTION</Text>
          <FlatList
            data={suggestedExercises}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SuggestedExerciseCard
                exerciseName={item.exerciseName}
                fitLabel={item.fitLabel}
                explanation={item.explanation}
                width={CARD_WIDTH}
              />
            )}
            contentContainerStyle={{ gap: scale(12) }}
          />
        </View>
        <View style={{ paddingRight: scale(20) }}>
          <SearchContainer value={query} onChangeText={setQuery} />
          <View style={{ marginTop: scale(18) }}>
            <AddExerciseCard
              title="RECENT SEARCHES"
              cards={recentSearchCards}
            />
            <AddExerciseCard title="AI COACH SUGGESTION" cards={aiCoachCards} />
            <AddExerciseCard title="AI COACH SUGGESTION" cards={aiCoachCards} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
