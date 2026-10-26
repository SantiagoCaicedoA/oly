import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SegmentOption = {
  label: string;
  value: string;
};

type SegmentedSelectorProps = {
  title?: string;
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

  const containerStyle =
    displayedOptions.length > 3 ? styles.grid : styles.container;

  if (displayedOptions.length <= 3) {
    return (
      <View>
        {title ? <Text style={styles.title}>{title.toUpperCase()}</Text> : null}

        <View style={[containerStyle, { flexDirection: "row" }]}>
          {displayedOptions.map((option) => {
            const active = isActive(option.value);

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.segment, active && styles.segmentActive]}
                activeOpacity={0.8}
                onPress={() => handleSelect(option.value)}
              >
                <Text style={[styles.label, active && styles.labelActive]}>
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
      {title ? <Text style={styles.title}>{title.toUpperCase()}</Text> : null}

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
                    styles.chip,
                    active && styles.chipActive,
                    index === 0 ? { marginLeft: 0 } : {},
                    index === rowOptions.length - 1 ? { marginRight: 0 } : {},
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[styles.label, active && styles.labelActive]}>
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

const styles = StyleSheet.create({
  title: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: olySpacing[8],
  },
  /* Up to three options: one glass pill track. */
  container: {
    borderRadius: olyRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    backgroundColor: olyColors.glass.card,
  },
  /* More than three: a two-column grid of chips, no track. */
  grid: {
    padding: 0,
  },
  row: {
    flexDirection: "row",
    marginBottom: olySpacing[8],
  },
  segment: {
    flex: 1,
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[12],
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: olyColors.glass.selected,
  },
  chip: {
    flex: 1,
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    backgroundColor: olyColors.glass.card,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: olySpacing[4],
  },
  chipActive: {
    backgroundColor: olyColors.glass.accentFill,
    borderColor: olyColors.glass.accentBorder,
  },
  label: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  labelActive: {
    color: olyColors.text.primary,
  },
});

export default SegmentedSelector;
