import { olyColors } from "@/src/oly-theme/oly-colors";
import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

/**
 * Oly Icon — the closed set.
 *
 * Design system: Core / Icon, and the Iconography rules.
 *
 * Fourteen glyphs and no more. Five navigation, nine structural.
 * Anything not on this list is a word. Adding one is a decision,
 * not a convenience, and it gets recorded in the design system first.
 *
 * Drawing spec: 24 grid, 1.5 stroke, round caps and joins, corner
 * radius 1 on a shape. Ink is inherited from a semantic token.
 *
 * Outline when inactive, filled when active. Search has no filled
 * variant, because a filled magnifier reads as a lollipop, so its
 * active state is the same outline at a 2.2 stroke.
 *
 * NEVER pass a brand blue colour. Blue is 1.60:1 on level 1 and
 * cannot be seen. Blue marks state by filling a shape behind the
 * icon, never by colouring the glyph itself.
 */

export type OlyIconName =
  // navigation
  | "home"
  | "rank"
  | "messages"
  | "search"
  | "profile"
  // structural
  | "chevron"
  | "back"
  | "plus"
  | "minus"
  | "close"
  | "check"
  | "play"
  | "heart"
  | "bell";

type Shape =
  | { kind: "path"; d: string }
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx: number }
  | { kind: "circle"; cx: number; cy: number; r: number };

const p = (d: string): Shape => ({ kind: "path", d });
const r = (
  x: number,
  y: number,
  w: number,
  h: number,
  rx = 1,
): Shape => ({ kind: "rect", x, y, w, h, rx });
const c = (cx: number, cy: number, rad: number): Shape => ({
  kind: "circle",
  cx,
  cy,
  r: rad,
});

const OUTLINE: Record<OlyIconName, Shape[]> = {
  home: [
    p("M3 10 L12 3 L21 10 V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"),
    p("M9.5 21V14h5v7"),
  ],
  /* Inset by half the set's 1.5 stroke, so the stroke's OUTER edge lands
     exactly on the filled shape's edge. Both states then occupy the same
     footprint, nothing shifts when you tap, and the 1.6 gap between bars
     survives instead of being eaten by the line. Drawn rx is 0.4, which
     reads as 1.15 once the stroke is added, matching the filled corner. */
  rank: [
    r(3.65, 10.45, 3.5, 9.4, 0.4),
    r(10.26, 4.99, 3.48, 14.86, 0.4),
    r(16.84, 12.27, 3.5, 7.58, 0.4),
  ],
  messages: [p("M5.4 4.6h13.2a2.9 2.9 0 0 1 2.9 2.9v6.2a2.9 2.9 0 0 1-2.9 2.9h-7.3l-4.4 3.5v-3.5H5.4a2.9 2.9 0 0 1-2.9-2.9V7.5a2.9 2.9 0 0 1 2.9-2.9Z")],
  search: [c(10.5, 10.5, 6.5), p("M15.5 15.5 21 21")],
  profile: [c(12, 8, 3.75), p("M4.5 20.5a7.5 7.5 0 0 1 15 0")],

  chevron: [p("M9 5l7 7-7 7")],
  back: [p("M15 19l-7-7 7-7")],
  plus: [p("M12 6v12M6 12h12")],
  minus: [p("M5 12h14")],
  close: [p("M6 6l12 12M18 6L6 18")],
  check: [p("M5 13l4 4L19 7")],
  play: [p("M8 5.5v13l11-6.5z")],
  heart: [
    p(
      "M12 20.5S3.5 15.1 3.5 9.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.5 2.1c0 5.7-8.5 11.1-8.5 11.1Z",
    ),
  ],
  bell: [p("M6 16V10a6 6 0 1 1 12 0v6l1.5 2h-15zM10 20a2 2 0 0 0 4 0")],
};

/* Only the glyphs that survive being filled. Search is deliberately absent. */
const FILLED: Partial<Record<OlyIconName, Shape[]>> = {
  home: [p("M2.4 9.7 12 2.2l9.6 7.5V19a2.6 2.6 0 0 1-2.6 2.6h-4.2V14h-5.6v7.6H5A2.6 2.6 0 0 1 2.4 19Z")],
  rank: [r(2.9, 9.7, 5.0, 10.9, 1.15),
    r(9.51, 4.24, 4.98, 16.36, 1.15),
    r(16.09, 11.52, 5.0, 9.08, 1.15),],
  messages: [p("M5.4 4.6h13.2a2.9 2.9 0 0 1 2.9 2.9v6.2a2.9 2.9 0 0 1-2.9 2.9h-7.3l-4.4 3.5v-3.5H5.4a2.9 2.9 0 0 1-2.9-2.9V7.5a2.9 2.9 0 0 1 2.9-2.9Z")],
  profile: [c(12, 8, 4.1), p("M4.2 21.3a7.8 7.8 0 0 1 15.6 0Z")],
  heart: [
    p(
      "M12 20.5S3.5 15.1 3.5 9.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.5 2.1c0 5.7-8.5 11.1-8.5 11.1Z",
    ),
  ],
  play: [p("M8 5.5v13l11-6.5z")],
};

/* The glyphs drawn as an area even when inactive. */
const ALWAYS_SOLID: OlyIconName[] = ["play"];

export type OlyIconProps = {
  name: OlyIconName;
  /** icon-sm 20, icon-md 24, icon-lg 32. Default 24. */
  size?: number;
  /** A semantic token. Never a brand blue. */
  color?: string;
  filled?: boolean;
};

export function OlyIcon({
  name,
  size = 24,
  color = olyColors.text.secondary,
  filled = false,
}: OlyIconProps) {
  /* `filled ? ... : undefined`, not `filled && ...`. A `&&` yields
     `false`, and `??` does not fall back on `false`, only on null. */
  const solidVariant = filled ? FILLED[name] : undefined;
  const shapes: Shape[] = solidVariant ?? OUTLINE[name];
  const isSolid = !!solidVariant || ALWAYS_SOLID.includes(name);

  /* Search keeps its outline when active and thickens instead. */
  const strokeWidth = name === "search" && filled ? 2.2 : 1.5;

  const paint = isSolid
    ? { fill: color, stroke: "none" as const, strokeWidth: 0 }
    : {
        fill: "none" as const,
        stroke: color,
        strokeWidth,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
      };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shapes.map((s, i) => {
        if (s.kind === "rect") {
          return (
            <Rect
              key={i}
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx={s.rx}
              {...paint}
            />
          );
        }
        if (s.kind === "circle") {
          return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...paint} />;
        }
        return <Path key={i} d={s.d} {...paint} />;
      })}
    </Svg>
  );
}

export default OlyIcon;
