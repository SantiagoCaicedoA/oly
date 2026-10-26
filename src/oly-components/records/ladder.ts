/**
 * Record book maths: the bodyweight milestone ladder, weight class from
 * bodyweight, and the plausibility caps the edit sheet checks against.
 * Pure functions, no API.
 */
import { MEN_CLASSES, WOMEN_CLASSES, type Sex } from "@/constants/leaderboard-data";

export type LadderLift = "snatch" | "cj" | "back" | "front";

/** Multiples of bodyweight for levels 1 to 4. */
const LADDER: Record<Sex, Record<LadderLift, number[]>> = {
  M: {
    snatch: [0.5, 0.75, 1, 1.3],
    cj: [0.75, 1, 1.25, 1.6],
    back: [1, 1.5, 2, 2.5],
    front: [0.75, 1.25, 1.75, 2.1],
  },
  F: {
    snatch: [0.4, 0.6, 0.8, 1.05],
    cj: [0.5, 0.8, 1, 1.3],
    back: [0.75, 1.25, 1.6, 2],
    front: [0.6, 1, 1.4, 1.75],
  },
};

export const MAX_LEVEL = 4;

/** Olys each milestone pays, levels 1 to 4. Paid once, on a verified lift. */
export const LEVEL_OLYS = [100, 200, 400, 800];

export interface LevelInfo {
  /** Levels reached, 0 to 4. */
  level: number;
  /** Bar fill, 0 to 1 across all four levels. */
  pct: number;
  /** Kilos still needed for the next level, null at max level. */
  toNext: number | null;
  /** The four milestone weights in kg. */
  marks: number[];
  /** Bodyweight multiple of each milestone. */
  mults: number[];
}

export function levelFor(
  lift: LadderLift,
  kg: number,
  sex: Sex,
  bodyweightKg: number,
): LevelInfo | null {
  if (!(bodyweightKg > 0)) return null;
  const mults = LADDER[sex][lift];
  const marks = mults.map((m) => Math.round(m * bodyweightKg));
  const level = marks.filter((k) => kg >= k).length;
  if (level >= MAX_LEVEL) return { level, pct: 1, toNext: null, marks, mults };
  const prev = level === 0 ? 0 : marks[level - 1];
  const next = marks[level];
  const part = Math.max(0, (kg - prev) / (next - prev));
  return { level, pct: (level + part) / MAX_LEVEL, toNext: next - kg, marks, mults };
}

/** The class a bodyweight falls in, as the board labels it ("88", "+110"). */
export function classFor(sex: Sex, bodyweightKg: number): string {
  const list = sex === "F" ? WOMEN_CLASSES : MEN_CLASSES;
  return list.find((c) => !c.startsWith("+") && bodyweightKg <= Number(c)) ?? list[list.length - 1];
}

export function boardLabel(sex: Sex, cls: string): string {
  return `${sex === "F" ? "Women" : "Men"} ${cls} kg`;
}

/**
 * Rough world records per class [snatch, clean & jerk], rounded up a
 * little. Anything above needs a video. Only a sanity bound, not data.
 */
const WR: Record<string, [number, number]> = {
  "M60": [145, 175], "M65": [155, 188], "M71": [165, 200], "M79": [175, 208],
  "M88": [181, 220], "M94": [188, 232], "M110": [201, 242], "M+110": [226, 268],
  "F48": [97, 125], "F53": [103, 130], "F58": [111, 141], "F63": [118, 146],
  "F69": [123, 156], "F77": [128, 162], "F86": [133, 166], "F+86": [151, 188],
};

export function worldRecordCap(
  lift: "snatch" | "cj",
  sex: Sex,
  cls: string,
): number | null {
  const wr = WR[`${sex}${cls}`];
  return wr ? wr[lift === "snatch" ? 0 : 1] : null;
}

/** A jump bigger than this over the last number needs a video. */
export const MAX_JUMP_KG = 15;
