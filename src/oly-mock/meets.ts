/**
 * Mock meets, so the meet picker and the Competition settings cards look
 * full while there is no meets endpoint. Dates are relative to today so
 * every countdown stays positive. Turn off with SHOW_MOCK_MEETS = false:
 * the picker then only offers "Request it", and the settings cards that
 * need history (weight trend, verified total, past meets) hide.
 *
 * TODO(api): replace with GET /meets, the athlete's bodyweight log,
 * verified total and meet results.
 */

export const SHOW_MOCK_MEETS = true;

export type MeetCountry = "CA" | "CO";

export interface Meet {
  id: string;
  name: string;
  /** ISO YYYY-MM-DD */
  date: string;
  /** "Calgary, AB" */
  city: string;
  /** Sanctioning federation, "AWA". Empty for a requested meet. */
  fed: string;
  country?: MeetCountry;
  /** Close to the athlete. Mock stand-in for a location check. */
  near?: boolean;
  /** Friends going */
  friends?: number;
  /** Requested by the athlete, waiting for approval */
  pending?: boolean;
}

export interface PastMeet {
  name: string;
  /** "Jun 2026" */
  when: string;
  cls: string;
  total: number;
  place: string;
}

const isoIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const MEETS: Meet[] = [
  { id: "valhalla-open", name: "Valhalla Open", date: isoIn(40), city: "Calgary, AB", fed: "AWA", country: "CA", near: true, friends: 4 },
  { id: "copa-valle", name: "Copa Valle de Pesas", date: isoIn(45), city: "Cali, VAC", fed: "FCP", country: "CO", friends: 2 },
  { id: "edmonton-fall", name: "Edmonton Fall Classic", date: isoIn(48), city: "Edmonton, AB", fed: "AWA", country: "CA", near: true },
  { id: "prairie-cup", name: "Prairie Barbell Cup", date: isoIn(55), city: "Regina, SK", fed: "SWA", country: "CA" },
  { id: "junior-nats", name: "Canadian Junior Nationals", date: isoIn(62), city: "Toronto, ON", fed: "CWFHC", country: "CA" },
  { id: "winter-open", name: "Winter Open", date: isoIn(69), city: "Vancouver, BC", fed: "BCWA", country: "CA" },
  { id: "abierto-antioquia", name: "Abierto de Antioquia", date: isoIn(90), city: "Medellín, ANT", fed: "FCP", country: "CO" },
  { id: "valhalla-spring", name: "Valhalla Spring Open", date: isoIn(195), city: "Calgary, AB", fed: "AWA", country: "CA", near: true },
];

export const mockMeets = (): Meet[] => (SHOW_MOCK_MEETS ? MEETS : []);

/**
 * Recent bodyweights, oldest first, as kg above the class limit. Offsets
 * rather than absolutes so the trend fits whatever class the athlete is in.
 */
const BW_OVER_LIMIT = [1.4, 1.2, 1.3, 1.0, 0.9, 0.75, 0.6];

export const mockBodyweightTrend = (limitKg: number): number[] =>
  SHOW_MOCK_MEETS ? BW_OVER_LIMIT.map((o) => Math.round((limitKg + o) * 10) / 10) : [];

export const MOCK_WEIGHED_DAYS_AGO: number = 2;
export const MOCK_PACE_KG_WEEK: number = -0.15;

/** Verified total and the rank reaching the target total would give. */
export const mockVerified = (): { total: number; rankAtTarget: number } | null =>
  SHOW_MOCK_MEETS ? { total: 268, rankAtTarget: 2 } : null;

export const mockPastMeets = (): PastMeet[] =>
  SHOW_MOCK_MEETS
    ? [
        { name: "Alberta Provincials", when: "Jun 2026", cls: "88 kg", total: 262, place: "2nd place" },
        { name: "Calgary Winter Classic", when: "Feb 2026", cls: "88 kg", total: 251, place: "4th place" },
      ]
    : [];

/** What meet day pays. TODO(api): read from the rewards config. */
export const MEET_PAYS: { title: string; sub: string; olys: number }[] = [
  { title: "Meet day", sub: "Result plus every attempt on video", olys: 400 },
  { title: "Meet PR", sub: "Snatch, C&J or total", olys: 150 },
  { title: "Check in at the venue", sub: "Opens on meet day", olys: 50 },
];
