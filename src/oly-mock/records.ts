/**
 * Mock board positions for the record book. The API has no per-lift rank,
 * no gap to the next spot and no rank for the verified total yet, so the
 * record book reads them off the mock board in leaderboard.ts.
 * Turn off with SHOW_MOCK_RECORDS = false: the rank chips and gaps hide.
 *
 * TODO(api): replace with the athlete's real rank per board.
 */
import type { Sex } from "@/constants/leaderboard-data";
import { mockBoard } from "@/src/oly-mock/leaderboard";

export const SHOW_MOCK_RECORDS = true;

export interface MockRank {
  rank: number;
  /** Kilos to the spot above, null at #1. */
  gapKg: number | null;
}

export function mockRank(
  lift: "snatch" | "cleanjerk" | "total",
  kg: number,
  sex: Sex,
  cls: string,
): MockRank | null {
  if (!SHOW_MOCK_RECORDS || !(kg > 0)) return null;
  const above = mockBoard({ lift, scope: "season", sex, age: "open", class: cls })
    .map((r) => r.value)
    .filter((v) => v > kg);
  if (!above.length) return { rank: 1, gapKg: null };
  return { rank: above.length + 1, gapKg: Math.min(...above) - kg };
}
