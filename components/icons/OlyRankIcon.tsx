import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export const OlyRankIcon = ({ size = 20, color = "#9098A1" }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M18.3334 10H15L12.5 17.5L7.50002 2.5L5.00002 10H1.66669"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
