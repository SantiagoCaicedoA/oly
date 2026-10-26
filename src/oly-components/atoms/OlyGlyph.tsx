/**
 * OlyGlyph — the line icons used in settings rows and glass circles.
 * One stroke weight, one 24px grid. The rank bars are the Rank tab's own.
 */
import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Glass } from "@/src/oly-components/shop/ShopKit";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";

export type GlyphName =
  | "person"
  | "meet"
  | "rank"
  | "bell"
  | "lock"
  | "out"
  | "trash"
  | "chat"
  | "moon";

export function OlyGlyph({
  name,
  size = 18,
  color = olyColors.text.primary as string,
}: {
  name: GlyphName;
  size?: number;
  color?: string;
}) {
  const p = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "person" && (
        <>
          <Circle cx={12} cy={8} r={3.75} {...p} />
          <Path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" {...p} />
        </>
      )}
      {name === "meet" && (
        <>
          <Rect x={4} y={5} width={16} height={15} rx={2.5} {...p} />
          <Path d="M4 10h16M9 3v4M15 3v4" {...p} />
        </>
      )}
      {name === "rank" && (
        <>
          <Rect x={3.65} y={10.45} width={3.5} height={9.4} rx={0.4} {...p} />
          <Rect x={10.26} y={4.99} width={3.48} height={14.86} rx={0.4} {...p} />
          <Rect x={16.84} y={12.27} width={3.5} height={7.58} rx={0.4} {...p} />
        </>
      )}
      {name === "bell" && (
        <>
          <Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z" {...p} />
          <Path d="M10 20.5a2 2 0 0 0 4 0" {...p} />
        </>
      )}
      {name === "lock" && (
        <>
          <Rect x={5} y={10.5} width={14} height={10} rx={2.5} {...p} />
          <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...p} />
        </>
      )}
      {name === "out" && <Path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" {...p} />}
      {name === "trash" && <Path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" {...p} />}
      {name === "chat" && (
        <Path d="M5.4 4.6h13.2a2.9 2.9 0 0 1 2.9 2.9v6.2a2.9 2.9 0 0 1-2.9 2.9h-7.3l-4.4 3.5v-3.5H5.4a2.9 2.9 0 0 1-2.9-2.9V7.5a2.9 2.9 0 0 1 2.9-2.9Z" {...p} />
      )}
      {name === "moon" && <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" {...p} />}
    </Svg>
  );
}

/** The 36px glass circle a glyph sits in. Red ring for destructive rows. */
export function GlyphCircle({ name, destructive }: { name: GlyphName; destructive?: boolean }) {
  return (
    <Glass
      radius={olyRadius.full}
      borderColor={destructive ? "rgba(242, 145, 139, 0.35)" : olyColors.glass.border}
      style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
    >
      <OlyGlyph name={name} color={destructive ? olyPalette.redInk : (olyColors.text.primary as string)} />
    </Glass>
  );
}

export default OlyGlyph;
