/**
 * Profile, MOCK DATA for the redesigned profile until the API has it:
 * the posting streak, the badge shelf, the athletes either side of you on
 * the season board, and how many lifters your size you outscore.
 * Turn off with SHOW_MOCK_PROFILE = false: the streak, rival, earned and
 * locked badges and the pound for pound bar hide.
 *
 * TODO(api): streak, earned badges, board neighbours and percentile.
 */
import type { Sex } from "@/constants/leaderboard-data";
import { daysAgo, mockBoard } from "@/src/oly-mock/leaderboard";
import type { BoardRow } from "@/types/api/leaderboard";

export const SHOW_MOCK_PROFILE = true;

/** Weeks in a row with at least one posted lift. TODO(api) */
export const MOCK_STREAK = SHOW_MOCK_PROFILE ? 6 : null;

/** Places gained on the season board in the last 30 days. TODO(api) */
export const MOCK_RANK_MOVE = SHOW_MOCK_PROFILE ? 3 : null;

export interface MockBadge {
  /** The numeral on the hex. */
  value: string;
  title: string;
  sub: string;
}

/** TODO(api): the athlete's earned badges. */
export const MOCK_EARNED_BADGES: MockBadge[] = SHOW_MOCK_PROFILE
  ? [
      { value: "3", title: "Meet days", sub: "3 meets" },
      { value: "1×", title: "1× snatch", sub: "12% have it" },
      { value: "#9", title: "Season 1", sub: "Men 94 kg" },
      { value: "01", title: "First verified", sub: "Jan 2026" },
    ]
  : [];

/** TODO(api): badges still to earn. */
export const MOCK_LOCKED_BADGES: string[] = SHOW_MOCK_PROFILE
  ? ["2× squat", "Top 5", "Podium"]
  : [];

export interface Neighbours {
  /** The athlete one place above, null at the top. */
  above: BoardRow | null;
  /** The athlete one place below, null at the bottom. */
  below: BoardRow | null;
  /** Up to two athletes either side, best first, for the season sheet. */
  above2: BoardRow[];
  below2: BoardRow[];
  /** The total that sits at #5, null when the board is shorter. */
  top5: number | null;
}

/** The rows either side of a total on the mock season board. TODO(api) */
export function mockNeighbours(
  totalKg: number,
  sex: Sex,
  cls: string,
): Neighbours | null {
  if (!SHOW_MOCK_PROFILE || !(totalKg > 0)) return null;
  const rows = mockBoard({ lift: "total", scope: "season", sex, age: "open", class: cls });
  const up = rows.filter((r) => r.value > totalKg).sort((a, b) => a.value - b.value);
  const down = rows.filter((r) => r.value < totalKg).sort((a, b) => b.value - a.value);
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  return {
    above: up[0] ?? null,
    below: down[0] ?? null,
    above2: up.slice(0, 2).reverse(),
    below2: down.slice(0, 2),
    top5: sorted[4]?.value ?? null,
  };
}

/** Share of the class a Sinclair beats on the mock board, 0 to 100. TODO(api) */
export function mockBeatPct(sinclair: number, sex: Sex, cls: string): number | null {
  if (!SHOW_MOCK_PROFILE || !(sinclair > 0)) return null;
  const rows = mockBoard({ lift: "sinclair", scope: "season", sex, age: "open", class: cls });
  return Math.round((rows.filter((r) => r.value < sinclair).length / rows.length) * 100);
}

/* ─── Filler for an empty profile, so the redesign can be tested ─── */

const MOCK_GRID: [string, number, boolean][] = [
  ["Snatch", 118, true], ["Clean & Jerk", 150, true], ["Back Squat", 175, false],
  ["Snatch", 115, false], ["Clean & Jerk", 145, false], ["Front Squat", 123, false],
  ["Snatch", 110, false], ["Clean & Jerk", 140, false], ["Back Squat", 165, false],
  ["Snatch", 105, false], ["Clean & Jerk", 135, false], ["Front Squat", 118, false],
];

/** TODO(api): only shown when the real posts list is empty. */
export const MOCK_POSTS = SHOW_MOCK_PROFILE
  ? MOCK_GRID.map(([lift, kg, pr], i) => ({
      _id: `mock-post-${i}`,
      lift_name: lift,
      isPR: pr,
      thumbnail_url: null as string | null,
      session_detail: { lifted_kg: kg },
      createdAt: daysAgo(i * 4 + 2),
    }))
  : [];

/** TODO(api): only shown when the real follow counts are empty. */
export const MOCK_COUNTS = SHOW_MOCK_PROFILE ? { followers: 128, following: 96 } : null;

/** TODO(api): only shown when the athlete has no rank yet. */
export const MOCK_ME = SHOW_MOCK_PROFILE
  ? { rank: 9, provisional: false, value: 268, snatchKg: 118, cleanKg: 150, sinclair: 339, weightClass: "94" }
  : null;

/** TODO(api): verified history behind the total line and the badges. */
export const MOCK_LIFTS = SHOW_MOCK_PROFILE
  ? [
      [248, 110, 138, 250], [250, 110, 140, 200], [255, 112, 143, 150],
      [258, 113, 145, 110], [262, 115, 147, 70], [268, 118, 150, 6],
    ].flatMap(([, sn, cj, d], i) => [
      { id: `mock-sn-${i}`, liftType: "snatch" as const, weightKg: sn, bodyweightKg: 92, liftDate: daysAgo(d), videoUrl: "", status: "live" as const, pendingReview: false, createdAt: daysAgo(d) },
      { id: `mock-cj-${i}`, liftType: "cleanjerk" as const, weightKg: cj, bodyweightKg: 92, liftDate: daysAgo(d), videoUrl: "", status: "live" as const, pendingReview: false, createdAt: daysAgo(d) },
    ])
  : [];

/** TODO(api): squat bests when the profile has none. */
export const MOCK_SQUATS = SHOW_MOCK_PROFILE ? { back: 175, front: 123 } : null;
