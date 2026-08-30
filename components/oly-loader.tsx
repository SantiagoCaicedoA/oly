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

const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * Tuned in the design prototype (values are in the logo's 512x512 space):
 * the light bar enters at the bottom-left corner immediately, crosses the
 * wordmark in ~1s, exits fully (no residue in the bottom-right), then
 * rests ~1s before the next sweep.
 */
const SWEEP_MS = 1000;
const HOLD_MS = 1000;
const X_FROM = -296;
const X_TO = 620;
const Y_FROM = 90;
const Y_TO = -158;

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
    y: Y_FROM + (Y_TO - Y_FROM) * t.value,
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
        <AnimatedG animatedProps={animatedProps}>
          <G transform="rotate(38 141 256)">
            <Rect x="0" y="-307" width="282" height="1126" fill="url(#olyGlint)" />
          </G>
        </AnimatedG>
      </G>
    </Svg>
  );
}
