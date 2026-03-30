import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export const OlyWorkoutIcon = ({ size = 20, color = "#9098A1" }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M15.8333 3.3335H4.16667C3.24619 3.3335 2.5 4.07969 2.5 5.00016V16.6668C2.5 17.5873 3.24619 18.3335 4.16667 18.3335H15.8333C16.7538 18.3335 17.5 17.5873 17.5 16.6668V5.00016C17.5 4.07969 16.7538 3.3335 15.8333 3.3335Z"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.3333 1.6665V4.99984"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.66669 1.6665V4.99984"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.5 8.3335H17.5"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
