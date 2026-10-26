/**
 * OlyCoin — the olys currency mark.
 *
 * Design "A. Oly coin" on the canvas: a metallic blue face with a raised
 * inner ring, the oly wordmark struck flat in white, and a ridged blue rim
 * like the edge of a real coin. Drawn in one SVG so it stays sharp at any
 * size. No shadows on the wordmark, on purpose: they read as blur.
 */
import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { OLY_LOGO_PATH } from "@/constants/oly-logo";
import { olyCoin, olyColors, olyPalette } from "@/src/oly-theme/oly-colors";

const RIDGES = Array.from({ length: 90 }, (_, i) => {
  const a = (i / 90) * Math.PI * 2;
  return {
    x1: 50 + Math.cos(a) * 45.5,
    y1: 50 + Math.sin(a) * 45.5,
    x2: 50 + Math.cos(a) * 50,
    y2: 50 + Math.sin(a) * 50,
    light: i % 2 === 0,
  };
});

/** The wordmark fills 36% of the coin, inside the inner ring. */
const MARK = 36;
const MARK_SCALE = MARK / 512;

export function OlyCoin({ size = 44 }: { size?: number }) {
  // Gradient ids must be unique per size, or two coins share one paint.
  const id = `olycoin${size}`;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        shadowColor: olyPalette.primary,
        shadowOpacity: 0.5,
        shadowRadius: size / 4,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={`${id}rim`} x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor={olyCoin.rim[0]} />
            <Stop offset="0.35" stopColor={olyCoin.rim[1]} />
            <Stop offset="0.65" stopColor={olyCoin.rim[2]} />
            <Stop offset="1" stopColor={olyCoin.rim[3]} />
          </LinearGradient>
          <RadialGradient id={`${id}face`} cx="0.3" cy="0.22" r="0.95">
            <Stop offset="0" stopColor={olyCoin.face[0]} />
            <Stop offset="0.38" stopColor={olyCoin.face[1]} />
            <Stop offset="0.72" stopColor={olyCoin.face[2]} />
            <Stop offset="1" stopColor={olyCoin.face[3]} />
          </RadialGradient>
          <RadialGradient id={`${id}shine`} cx="0.5" cy="0.5" r="0.5">
            <Stop
              offset="0"
              stopColor={olyColors.media.ink}
              stopOpacity={0.28}
            />
            <Stop offset="1" stopColor={olyColors.media.ink} stopOpacity={0} />
          </RadialGradient>
          <ClipPath id={`${id}clip`}>
            <Circle cx={50} cy={50} r={41} />
          </ClipPath>
        </Defs>

        {/* Rim, with fine ridges like a minted edge */}
        <Circle cx={50} cy={50} r={50} fill={`url(#${id}rim)`} />
        {RIDGES.map((r, i) => (
          <Line
            key={i}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={r.light ? olyColors.media.ink : olyPalette.black}
            strokeOpacity={0.12}
            strokeWidth={1.4}
          />
        ))}

        {/* Face */}
        <Circle cx={50} cy={50} r={41} fill={`url(#${id}face)`} />
        <G clipPath={`url(#${id}clip)`}>
          <Ellipse
            cx={30}
            cy={18}
            rx={36}
            ry={24}
            fill={`url(#${id}shine)`}
            transform="rotate(-20 30 18)"
          />
          {/* Inner shadow where the face meets the rim */}
          <Circle
            cx={50}
            cy={50}
            r={41}
            fill="none"
            stroke={olyPalette.black}
            strokeOpacity={0.35}
            strokeWidth={4}
          />
        </G>

        {/* Raised inner ring */}
        <Circle
          cx={50}
          cy={50}
          r={34.5}
          fill="none"
          stroke={olyColors.media.ink}
          strokeOpacity={0.22}
          strokeWidth={3}
        />

        {/* Wordmark, flat and sharp */}
        <G
          transform={`translate(${50 - MARK / 2} ${50 - MARK / 2}) scale(${MARK_SCALE})`}
        >
          <Path d={OLY_LOGO_PATH} fill={olyColors.media.ink} />
        </G>
      </Svg>
    </View>
  );
}

export default OlyCoin;
