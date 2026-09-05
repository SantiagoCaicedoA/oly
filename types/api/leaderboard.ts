/**
 * Leaderboard API types — mirror oly-backend's phase 1/2 responses exactly
 * (design doc §6). The Rank screen consumes these; no client-side ranking
 * math ever happens (the server's covered counts are the truth).
 */

export type ApiLift = "total" | "snatch" | "cleanjerk" | "sinclair";
export type ApiScope = "season" | "alltime";
export type ApiAge = "open" | "junior" | "masters";
export type ApiSex = "M" | "F";

export interface BoardParams {
  lift: ApiLift;
  scope: ApiScope;
  sex: ApiSex;
  age: ApiAge;
  /** Weight class label, omitted for sinclair (class-less board). */
  class?: string;
  /** IOC 3-letter code; omitted = world. */
  country?: string;
  limit?: number;
  cursor?: string;
}

export interface SeasonMeta {
  key: string;
  label: string;
  endsAt: string;
  status: "active" | "grace" | "closed";
}

export interface BoardRowUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  club: string | null;
  countryCode: string;
  sex: ApiSex;
  weightClass: string;
  /** Overlapping labels, e.g. ["open","junior"] — never a raw birth year. */
  ageCategories: string[];
}

export interface BoardRow {
  rank: number;
  user: BoardRowUser;
  /** The board metric's value (kg, or points for sinclair). */
  value: number;
  snatchKg: number | null;
  cleanKg: number | null;
  /** The bodyweight the displayed score actually used (§4.5). */
  bodyweightKg: number | null;
  sinclair: number | null;
  /** Visible "pending verification" badge (§5) — row ranks normally. */
  pendingReview: boolean;
  achievedAt: string | null;
}

export interface LeaderboardResponse {
  season: SeasonMeta | null;
  scope: ApiScope;
  entries: BoardRow[];
  nextCursor: string | null;
}

export interface MyRankResponse {
  season: SeasonMeta | null;
  me: {
    rank: number;
    /** true = onboarding 1RMs only — "you'd be #N, post a video to claim it" */
    provisional: boolean;
    value: number;
    snatchKg: number | null;
    cleanKg: number | null;
    sinclair: number | null;
    weightClass: string;
  } | null;
}

export interface FriendsBoardResponse {
  season: SeasonMeta | null;
  entries: BoardRow[];
}

export interface CurrentSeasonResponse {
  season: SeasonMeta | null;
}

export interface AthleteCardLift {
  liftType: "snatch" | "cleanjerk";
  weightKg: number;
  bodyweightKg: number;
  liftDate: string;
  videoUrl: string;
  pendingReview: boolean;
}

export interface AthleteCardResponse {
  season: SeasonMeta | null;
  athlete: {
    id: string;
    name: string;
    avatarUrl: string | null;
    club: string | null;
    countryCode: string;
    sex: ApiSex;
    weightClass: string;
    ageCategories: string[];
    following: boolean;
  };
  stats: {
    totalKg: number | null;
    bodyweightKg: number | null;
    sinclair: number | null;
    snatchKg: number | null;
    cleanKg: number | null;
  };
  videos: {
    snatch: AthleteCardLift | null;
    cleanjerk: AthleteCardLift | null;
  };
}

export interface SubmitLiftPayload {
  liftType: "snatch" | "cleanjerk";
  weightKg: number;
  bodyweightKg: number;
  liftDate: string; // ISO
  videoUrl: string;
  idemKey: string;
}

export interface SubmitLiftResponse {
  success: boolean;
  duplicate?: boolean;
  held: boolean;
  pendingReview: boolean;
  lift: {
    id: string;
    liftType: "snatch" | "cleanjerk";
    weightKg: number;
    bodyweightKg: number;
    liftDate: string;
    videoUrl: string;
    status: "live" | "held" | "suspended" | "removed";
    pendingReview: boolean;
  };
  ranks: {
    scopeKey: string;
    weightClass: string;
    lift: number;
    total?: number;
    totalWeightClass?: string;
  } | null;
}

/** Build the query string for board endpoints (sex is REQUIRED — the API 400s without it). */
export function boardQuery(p: BoardParams): string {
  const q = new URLSearchParams();
  q.set("lift", p.lift);
  q.set("scope", p.scope);
  q.set("sex", p.sex);
  q.set("age", p.age);
  if (p.lift !== "sinclair" && p.class) q.set("class", p.class);
  if (p.country) q.set("country", p.country);
  if (p.limit) q.set("limit", String(p.limit));
  if (p.cursor) q.set("cursor", p.cursor);
  return q.toString();
}
