import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import SegmentedSelector from "./segmented-selector";

interface MetricItem {
  title?: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  segmentedSelector?: {
    title: string;
    options: Array<{ label: string; value: string }>;
    selectedValue: string;
    onChange: (value: string | string[]) => void;
    segments: number;
  };
}

interface RecoveryMetricsProps {
  title: string;
  metrics: MetricItem[];
}

const RecoveryMetrics: React.FC<RecoveryMetricsProps> = ({
  title,
  metrics,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: title ? colors.text : "transparent",
          borderRadius: scale(12),
          borderWidth: scale(0.3),
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.normal,
            color: colors.textSecondary,
          },
        ]}
      >
        {title}
      </Text>

      {metrics.map((metric, index) => (
        <MetricBar
          key={index}
          title={metric.title}
          label={metric.label}
          value={metric.value}
          onChange={metric.onChange}
          segmentedSelector={metric.segmentedSelector}
        />
      ))}
    </View>
  );
};

interface MetricBarProps {
  title?: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  segmentedSelector?: {
    title: string;
    options: Array<{ label: string; value: string }>;
    selectedValue: string;
    onChange: (value: string | string[]) => void;
    segments: number;
  };
}

const MetricBar: React.FC<MetricBarProps> = ({
  title,
  label,
  value,
  onChange,
  segmentedSelector,
}) => {
  const { colors } = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const barPageX = useRef(0);
  const barWidthRef = useRef(0);

  const calculateValue = (pageX: number): number => {
    const locationX = pageX - barPageX.current;
    const percentage = Math.max(
      0,
      Math.min(1, locationX / barWidthRef.current),
    );
    return Math.round(percentage * 10);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      const newValue = calculateValue(evt.nativeEvent.pageX);
      onChange(newValue);
    },
    onPanResponderMove: (evt) => {
      const newValue = calculateValue(evt.nativeEvent.pageX);
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
    const { width } = event.nativeEvent.layout;
    setBarWidth(width);
    barWidthRef.current = width;
  };

  const fillPercentage = (value / 10) * 100;

  return (
    <View style={styles.metricContainer}>
      {title && (
        <Text
          style={[
            styles.title,
            {
              fontSize: Typography.fontSize.base,
              fontWeight: Typography.fontWeight.normal,
              color: colors.textSecondary,
            },
          ]}
        >
          {title}
        </Text>
      )}
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            {
              fontSize: Typography.fontSize.md,
              fontWeight: Typography.fontWeight.medium,
              color: colors.text,
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.value,
            {
              fontSize: Typography.fontSize.md,
              fontWeight: Typography.fontWeight.medium,
              color: colors.text,
            },
          ]}
        >
          {value}/10
        </Text>
      </View>

      <View
        style={styles.barWrapper}
        onLayout={(event) => {
          onBarLayout(event);
        }}
        ref={(ref) => {
          if (ref) {
            ref.measure((_x, _y, _width, _height, pageX) => {
              barPageX.current = pageX;
            });
          }
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.barBackground,
            {
              borderWidth: scale(0.3),
              borderColor: colors.textSecondary,
            },
          ]}
        >
          <View
            style={[
              styles.barFill,
              {
                width: `${fillPercentage}%`,
                backgroundColor: colors.text,
              },
            ]}
          />
        </View>

        <View
          style={[
            styles.thumb,
            {
              left: `${fillPercentage}%`,
              backgroundColor: colors.text,
              transform: [{ translateX: -12 }, { scale: isDragging ? 1.2 : 1 }],
            },
          ]}
        />
      </View>

      {segmentedSelector && (
        <View style={{ marginTop: scale(15) }}>
          <SegmentedSelector
            title={segmentedSelector.title}
            options={segmentedSelector.options}
            selectedValue={segmentedSelector.selectedValue}
            onChange={segmentedSelector.onChange}
            segments={segmentedSelector.segments}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(20),
    paddingTop: 0,
  },
  title: {
    marginBottom: scale(7),
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingTop: scale(20),
  },
  metricContainer: {},
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(12),
  },
  label: {
    flex: 1,
  },
  value: {
    marginLeft: scale(8),
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

export default RecoveryMetrics;
