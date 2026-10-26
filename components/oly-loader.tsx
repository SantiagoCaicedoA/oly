import { OLY_LOGO_PATH, OLY_LOGO_VIEWBOX } from "@/constants/oly-logo";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * The light bar crosses the wordmark in ~1.6s, exits fully, then rests ~1s
 * before the next sweep.
 *
 * Why the bar's own x is animated: react-native-svg ignores animated x/y on
 * a <G>. The bar sits inside a group rotated 38deg, so moving its x slides it diagonally across the
 * logo. X_FROM and X_TO put it fully off the 512x512 logo on both ends
 * (the logo spans -269..450 along the rotated axis, the bar is 282 wide).
 */
export const SWEEP_MS = 1600;
export const HOLD_MS = 1000;
const X_FROM = -420;
const X_TO = 600;

type Props = {
  size?: number;
};

export default function OlyLoader({ size = 110 }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: SWEEP_MS,
          easing: Easing.bezier(0.3, 0.1, 0.7, 0.9),
        }),
        withTiming(1, { duration: HOLD_MS }), // breath between flashes
        withTiming(0, { duration: 1 }) // reset to the corner instantly
      ),
      -1,
      false
    );
  }, [t]);

  const animatedProps = useAnimatedProps(() => ({
    x: X_FROM + (X_TO - X_FROM) * t.value,
  }));

  return (
    <Svg width={size} height={size} viewBox={OLY_LOGO_VIEWBOX}>
      <Defs>
        <ClipPath id="olyLogoClip">
          <Path d={OLY_LOGO_PATH} />
        </ClipPath>
        <LinearGradient id="olyGlint" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <Stop offset="0.35" stopColor="#ffffff" stopOpacity="0.55" />
          <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="0.65" stopColor="#ffffff" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <G clipPath="url(#olyLogoClip)">
        {/* resting logo, dim */}
        <Rect width="512" height="512" fill="rgba(226,232,240,0.16)" />
        {/* the glint: a band of light travelling bottom-left -> top-right */}
        <G transform="rotate(38 141 256)">
          <AnimatedRect
            animatedProps={animatedProps}
            y={-307}
            width={282}
            height={1126}
            fill="url(#olyGlint)"
          />
        </G>
      </G>
    </Svg>
  );
}
