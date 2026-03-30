import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export const OlyHomeIcon = ({ size = 20, color = "#E2E8F0" }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M2.5 7.49984L10 1.6665L17.5 7.49984V16.6665C17.5 17.1085 17.3244 17.5325 17.0118 17.845C16.6993 18.1576 16.2754 18.3332 15.8333 18.3332H4.16667C3.72464 18.3332 3.30072 18.1576 2.98816 17.845C2.67559 17.5325 2.5 17.1085 2.5 16.6665V7.49984Z"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.5 18.3333V10H12.5V18.3333"
      stroke={color}
      strokeWidth={1.41667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
