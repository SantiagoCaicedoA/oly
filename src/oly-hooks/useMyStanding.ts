/**
 * useMyStanding — where the signed-in athlete sits on the board.
 *
 * One place that resolves standing, so the profile hero and the home
 * feed card can never disagree about it. Every screen that shows a rank
 * should call this rather than rebuilding the query chain.
 *
 * The resolution order matters and is not arbitrary:
 *  1. The athlete card is fetched class-less. The server returns the best
 *     verified entry wherever it actually lives.
 *  2. Rank then uses the server's weight class. The class derived from
 *     profile bodyweight is only the fallback, for a provisional athlete
 *     who has no verified entry yet.
 * Guessing a class from bodyweight when the server already knows one is
 * how an athlete ends up ranked on a board they are not on.
 *
 * NOTE: `app/(tabs)/profile.tsx` still carries its own copy of this
 * chain. It was left alone deliberately, to keep this change to the feed.
 * Collapsing it onto this hook is a small, safe follow-up.
 */

import {
  useGetAthleteCardQuery,
  useGetCurrentSeasonQuery,
  useGetMyRankQuery,
  useGetProfileQuery,
} from "@/store/api";
import type { BoardParams } from "@/types/api/leaderboard";
import { useMemo } from "react";

/* IWF 2025-06 class labels from bodyweight. Mirrors the backend's
   classTable. Kept in step with it by hand, which is a known risk. */
const MEN_BOUNDS: [number, string][] = [
  [60, "60"], [65, "65"], [71, "71"], [79, "79"], [88, "88"], [94, "94"], [110, "110"],
];
const WOMEN_BOUNDS: [number, string][] = [
  [48, "48"], [53, "53"], [58, "58"], [63, "63"], [69, "69"], [77, "77"], [86, "86"],
];

export function classFor(sex: "M" | "F", bw: number): string {
  const bounds = sex === "M" ? MEN_BOUNDS : WOMEN_BOUNDS;
  for (const [limit, label] of bounds) if (bw <= limit) return label;
  return sex === "M" ? "+110" : "+86";
}

export function useMyStanding() {
  const profileQ = useGetProfileQuery();
  const user = profileQ.data?.data;
  const profile = user?.profile;
  const myId: string | undefined = user?._id;

  const sex: "M" | "F" = profile?.sex === "Female" ? "F" : "M";

  const bwKg = useMemo(() => {
    const v = profile?.bodyweight_value;
    if (typeof v !== "number" || v <= 0) return null;
    return profile?.bodyweight_unit === "lbs" ? v * 0.453592 : v;
  }, [profile?.bodyweight_value, profile?.bodyweight_unit]);

  const seasonQ = useGetCurrentSeasonQuery();

  const cardQ = useGetAthleteCardQuery(
    { userId: myId as string, lift: "sinclair", scope: "season", sex, age: "open" },
    { skip: !myId },
  );

  const rankClass =
    cardQ.data?.athlete?.weightClass ?? (bwKg ? classFor(sex, bwKg) : null);

  const rankParams: BoardParams | null = rankClass
    ? { lift: "total", scope: "season", sex, age: "open", class: rankClass }
    : null;

  const rankQ = useGetMyRankQuery(rankParams as BoardParams, {
    skip: !rankParams || cardQ.isLoading,
  });

  return {
    me: rankQ.data?.me ?? null,
    season: rankQ.data?.season ?? seasonQ.data?.season ?? null,
    sex,
    /* True only while there is genuinely nothing to show yet. A settled
       query with no rank is not loading, it is an athlete with no rank. */
    isLoading: profileQ.isLoading || cardQ.isLoading || rankQ.isLoading,
  };
}
