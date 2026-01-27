import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

type SegmentOption = {
  label: string;
  value: string;
};

type SegmentedSelectorProps = {
  title: string;
  options: SegmentOption[];
  selectedValue: string | string[];
  onChange: (value: string | string[]) => void;
  segments?: number;
  allowMultiple?: boolean;
};

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const SegmentedSelector: React.FC<SegmentedSelectorProps> = ({
  title,
  options,
  selectedValue,
  onChange,
  segments,
  allowMultiple = false,
}) => {
  const { colors } = useTheme();

  const displayedOptions = segments ? options.slice(0, segments) : options;

  const handleSelect = (value: string) => {
    if (allowMultiple) {
      const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
      if (currentValues.includes(value)) {
        onChange(currentValues.filter((v) => v !== value));
      } else {
        onChange([...currentValues, value]);
      }
    } else {
      onChange(value);
    }
  };

  const isActive = (value: string) => {
    if (allowMultiple) {
      return Array.isArray(selectedValue) && selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  const styles = StyleSheet.create({
    title: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      marginBottom: scale(4),
    },
    container: {
      borderRadius: scale(10),
      padding: scale(4),
      borderColor: colors.primary,
      borderWidth: 0.5,
      backgroundColor: colors.lightBlue,
    },
    row: {
      flexDirection: "row",
      marginBottom: scale(8),
    },
    segment: {
      flex: 1,
      paddingVertical: scale(12),
      borderRadius: scale(10),
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: scale(4),
    },
    label: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });

  const containerStyle =
    displayedOptions.length > 3
      ? {
          backgroundColor: "transparent",
          borderWidth: 0,
          borderColor: "transparent",
          padding: 0,
          borderRadius: 0,
        }
      : styles.container;

  if (displayedOptions.length <= 3) {
    return (
      <View>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {title.toUpperCase()}
        </Text>

        <View style={[containerStyle, { flexDirection: "row" }]}>
          {displayedOptions.map((option) => {
            const active = isActive(option.value);

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.segment,
                  {
                    backgroundColor: active ? colors.primary : colors.lightBlue,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelect(option.value)}
              >
                <Text
                  style={[
                    styles.label,
                    { color: active ? colors.text : colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  const chunkedOptions = chunkArray(displayedOptions, 2);

  return (
    <View>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {title.toUpperCase()}
      </Text>

      <View style={containerStyle}>
        {chunkedOptions.map((rowOptions, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[
              styles.row,
              rowIndex === chunkedOptions.length - 1
                ? { marginBottom: 0 }
                : undefined,
            ]}
          >
            {rowOptions.map((option, index) => {
              const active = isActive(option.value);

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.lightBlue,
                    },
                    index === 0 ? { marginLeft: 0 } : {},
                    index === rowOptions.length - 1 ? { marginRight: 0 } : {},
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.label,
                      { color: active ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default SegmentedSelector;
