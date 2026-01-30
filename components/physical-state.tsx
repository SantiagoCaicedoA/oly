import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";

interface PhysicalStateProps {
  muscleSoreness: number;
  onMuscleSorenessChange: (value: number) => void;
  soreAreas: string[];
  onSoreAreasChange: (areas: string[]) => void;
  specificArea: string;
  onSpecificAreaChange: (area: string) => void;
  areaIntensities: { [key: string]: number };
  onAreaIntensityChange: (area: string, value: number) => void;
}

interface AreaSliderProps {
  area: string;
  value: number;
  onChange: (value: number) => void;
  isLast: boolean;
}

const AreaSlider: React.FC<AreaSliderProps> = ({
  area,
  value,
  onChange,
  isLast,
}) => {
  const { colors } = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (locationX: number): number => {
    const percentage = Math.max(0, Math.min(1, locationX / barWidth));
    return Math.round(percentage * 10);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      const newValue = calculateValue(evt.nativeEvent.locationX);
      onChange(newValue);
    },
    onPanResponderMove: (evt) => {
      const newValue = calculateValue(evt.nativeEvent.locationX);
      onChange(newValue);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
    onPanResponderTerminate: () => {
      setIsDragging(false);
    },
  });

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const fillPercentage = (value / 10) * 100;

  return (
    <View style={{ marginBottom: isLast ? 0 : scale(16) }}>
      <View style={sliderStyles.labelContainer}>
        <Text style={[sliderStyles.label, { color: colors.textSecondary }]}>
          {area}
        </Text>
        <Text style={[sliderStyles.value, { color: colors.text }]}>
          {value}/10
        </Text>
      </View>

      <View
        style={sliderStyles.barWrapper}
        onLayout={onBarLayout}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            sliderStyles.barBackground,
            {
              borderWidth: scale(0.3),
              borderColor: colors.textSecondary,
            },
          ]}
        >
          <View
            style={[
              sliderStyles.barFill,
              {
                width: `${fillPercentage}%`,
                backgroundColor: colors.text,
              },
            ]}
          />
        </View>

        <View
          style={[
            sliderStyles.thumb,
            {
              left: `${fillPercentage}%`,
              backgroundColor: colors.text,
              transform: [{ translateX: -8 }, { scale: isDragging ? 1.2 : 1 }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const PhysicalState: React.FC<PhysicalStateProps> = ({
  muscleSoreness,
  onMuscleSorenessChange,
  soreAreas,
  onSoreAreasChange,
  specificArea,
  onSpecificAreaChange,
  areaIntensities,
  onAreaIntensityChange,
}) => {
  const { colors } = useTheme();

  const predefinedAreas = ["LOWER BACK", "SHOULDER"];

  const toggleArea = (area: string) => {
    if (soreAreas.includes(area)) {
      onSoreAreasChange(soreAreas.filter((a) => a !== area));
    } else {
      onSoreAreasChange([...soreAreas, area]);
    }
  };

  const removeArea = (area: string) => {
    onSoreAreasChange(soreAreas.filter((a) => a !== area));
  };

  const addSpecificArea = () => {
    if (specificArea.trim() && !soreAreas.includes(specificArea.trim())) {
      onSoreAreasChange([...soreAreas, specificArea.trim()]);
      onSpecificAreaChange("");
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.text,
      borderRadius: scale(12),
      borderWidth: scale(0.3),
      paddingHorizontal: scale(20),
      paddingBottom: scale(20),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: scale(20),
      marginBottom: scale(7),
    },
    title: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    mainLabel: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
      marginBottom: scale(16),
    },
    score: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(12),
      marginBottom: scale(24),
    },
    gridItem: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(12),
      borderWidth: scale(2),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.lightBlue,
    },
    gridNumber: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.medium,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
      marginBottom: scale(12),
    },
    pillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(10),
      marginBottom: scale(16),
    },
    pill: {
      paddingHorizontal: scale(20),
      paddingVertical: scale(12),
      borderRadius: scale(25),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    pillText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
    },
    removeButton: {
      width: scale(16),
      height: scale(16),
      borderRadius: scale(8),
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    removeText: {
      fontSize: Typography.fontSize.sm,
      color: colors.text,
      lineHeight: scale(16),
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: scale(25),
      paddingHorizontal: scale(20),
      paddingVertical: scale(14),
      fontSize: Typography.fontSize.base,
      color: colors.textSecondary,
      marginBottom: scale(20),
      borderWidth: scale(0.3),
      borderColor: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PHYSICAL STATE</Text>
        <Text style={styles.score}>{muscleSoreness}/10</Text>
      </View>

      <Text style={styles.mainLabel}>Muscle soreness</Text>

      <View style={styles.gridContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.gridItem,
              {
                backgroundColor:
                  muscleSoreness === num ? colors.primary : colors.lightBlue,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => onMuscleSorenessChange(num)}
          >
            <Text
              style={[
                styles.gridNumber,
                {
                  color:
                    muscleSoreness === num ? colors.text : colors.textSecondary,
                },
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Sore areas</Text>

      <View style={styles.pillsContainer}>
        {predefinedAreas.map((area) => (
          <TouchableOpacity
            key={area}
            style={[
              styles.pill,
              {
                backgroundColor: soreAreas.includes(area)
                  ? colors.primary
                  : colors.surface,
                borderWidth: scale(2),
                borderColor: colors.primary,
              },
            ]}
            onPress={() => toggleArea(area)}
          >
            <Text style={styles.pillText}>{area}</Text>
            {soreAreas.includes(area) && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeArea(area)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
        {soreAreas
          .filter((area) => !predefinedAreas.includes(area))
          .map((area) => (
            <View
              key={area}
              style={[
                styles.pill,
                {
                  backgroundColor: colors.primary,
                  borderWidth: scale(2),
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.pillText}>{area}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeArea(area)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Specific area..."
        placeholderTextColor={colors.textSecondary}
        value={specificArea}
        onChangeText={onSpecificAreaChange}
        onSubmitEditing={addSpecificArea}
        returnKeyType="done"
      />

      {soreAreas.map((area, index) => (
        <AreaSlider
          key={area}
          area={area}
          value={areaIntensities[area] || 5}
          onChange={(value) => onAreaIntensityChange(area, value)}
          isLast={index === soreAreas.length - 1}
        />
      ))}
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(12),
  },
  label: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    marginLeft: scale(8),
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  barWrapper: {
    minHeight: scale(20),
    justifyContent: "center",
    position: "relative",
  },
  barBackground: {
    height: scale(8),
    borderRadius: scale(4),
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  barFill: {
    height: "100%",
    borderRadius: scale(4),
  },
  thumb: {
    position: "absolute",
    width: scale(16),
    height: scale(16),
    borderRadius: scale(12),
    top: "50%",
    marginTop: scale(-8),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default PhysicalState;
