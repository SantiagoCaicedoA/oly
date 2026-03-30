import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export const OlyAnalyticsIcon = ({ size = 20, color = "#9098A1" }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M15 16.6668V8.3335"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 16.6668V3.3335"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 16.6665V11.6665"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
