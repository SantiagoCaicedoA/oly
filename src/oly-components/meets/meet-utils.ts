/**
 * Small helpers shared by the meet picker and the Competition screen:
 * date formatting, the meet's second line, and the weight class derived
 * from bodyweight.
 */
import { MEN_CLASSES, WOMEN_CLASSES, type Sex } from "@/constants/leaderboard-data";
import { boardLabel, classFor } from "@/src/oly-components/records/ladder";
import { mockMeets, type Meet } from "@/src/oly-mock/meets";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** ISO YYYY-MM-DD to a local Date at midnight. */
export function dateFromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** The slice keeps the date as three unpadded strings. */
export function isoFromParts(y?: string, m?: string, d?: string): string {
  if (!y || !m || !d) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** "Nov 14" */
export function fmtMeetDay(iso: string): string {
  const d = dateFromIso(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** "Sat, Dec 20" */
export function fmtLongDay(d: Date): string {
  return `${DAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((dateFromIso(iso).getTime() - now.getTime()) / 86400000);
}

/** "Nov 14 · Calgary, AB · AWA", or the pending line for a requested meet. */
export function meetSubline(m: Meet): string {
  const parts = [fmtMeetDay(m.date)];
  if (m.city) parts.push(m.city);
  if (m.pending) parts.push("usually approved within a day");
  else if (m.fed) parts.push(m.fed);
  return parts.join(" · ");
}

/**
 * The meet behind the saved name and date. The server stores only those
 * two, so match them against the list; a meet not in it still shows by
 * name and date.
 */
export function resolveMeet(stored: Meet | null | undefined, name: string, iso: string): Meet | null {
  if (!name?.trim() || !iso) return null;
  if (stored && stored.name === name && stored.date === iso) return stored;
  const known = mockMeets().find((m) => m.name === name && m.date === iso);
  return known ?? { id: `saved-${iso}`, name, date: iso, city: "", fed: "" };
}

export const LB_TO_KG = 0.453592;

/** The slice stores sex as free text; anything starting with F is women. */
const sexOf = (sex?: string): Sex => (/^f/i.test(sex ?? "") ? "F" : "M");

/** The weight classes for that sex, lightest first. */
export const classesFor = (sex?: string) => (sexOf(sex) === "F" ? WOMEN_CLASSES : MEN_CLASSES);

/** Lightest class the bodyweight fits, "+110" above the top one. */
export function deriveWeightClass(sex?: string, weight?: string, unit?: string): string {
  const raw = parseFloat(weight ?? "");
  if (!raw) return "";
  return classFor(sexOf(sex), unit === "LB" ? raw * LB_TO_KG : raw);
}

/** "Men 88 kg" */
export function classLabel(sex: string | undefined, cls: string): string {
  return boardLabel(sexOf(sex), cls);
}

/** The class ceiling in kg, null for a "+" class. */
export function classLimit(cls: string): number | null {
  if (!cls || cls.startsWith("+")) return null;
  const n = Number(cls);
  return Number.isFinite(n) && n > 0 ? n : null;
}
