/**
 * Mock leaderboard rows, so the Rank tab looks full while real boards are
 * still sparse. Merged under the real rows in rank.tsx and re-ranked by
 * value. Turn off with SHOW_MOCK_BOARD = false: the board shows only real
 * rows.
 *
 * TODO(api): drop once the real boards are full.
 */
import type { BoardParams, BoardRow } from "@/types/api/leaderboard";

export const SHOW_MOCK_BOARD = true;

/** ISO timestamp `d` days before now. Shared by the mock files. */
export const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const PEOPLE: [string, string | null, string][] = [
  ["Mateo Rojas", "Liga de Bogotá", "COL"],
  ["Diego Restrepo", "Club Halteras Cali", "COL"],
  ["Santiago Mejía", "Valle Weightlifting", "COL"],
  ["Andrés Pardo", "Liga Antioquia", "COL"],
  ["Juan Pablo Ortiz", "Club Titanes", "COL"],
  ["Camilo Herrera", "Liga de Bogotá", "COL"],
  ["Sebastián Gil", "Barbell Medellín", "COL"],
  ["Nicolás Duarte", "Club Halteras Cali", "COL"],
  ["Felipe Cárdenas", "Liga Santander", "COL"],
  ["Daniel Ospina", "Valle Weightlifting", "COL"],
  ["Tomás Arango", "Club Titanes", "COL"],
  ["Julián Moreno", "Barbell Medellín", "COL"],
  ["Esteban Vargas", "Liga Antioquia", "COL"],
  ["Miguel Ángel Ruiz", "Liga de Bogotá", "COL"],
  ["Samuel Castaño", "Club Halteras Cali", "COL"],
  ["David Quintero", "Liga Santander", "COL"],
  ["Alejandro Peña", "Valle Weightlifting", "COL"],
  ["Luis Fernando Gómez", null, "COL"],
];

const WOMEN: [string, string | null, string][] = [
  ["Valentina Ríos", "Liga de Bogotá", "COL"],
  ["Mariana López", "Club Halteras Cali", "COL"],
  ["Daniela Torres", "Valle Weightlifting", "COL"],
  ["Laura Sánchez", "Liga Antioquia", "COL"],
  ["Sofía Ramírez", "Barbell Medellín", "COL"],
  ["Isabella Cruz", "Club Titanes", "COL"],
  ["Gabriela Mora", "Liga Santander", "COL"],
  ["Natalia Pineda", "Liga de Bogotá", "COL"],
  ["Camila Suárez", "Club Halteras Cali", "COL"],
  ["Paula Jiménez", "Valle Weightlifting", "COL"],
  ["Juliana Rincón", "Barbell Medellín", "COL"],
  ["Ana María Vélez", "Liga Antioquia", "COL"],
];

export function mockBoard(p: BoardParams): BoardRow[] {
  const men = p.sex !== "F";
  const people = men ? PEOPLE : WOMEN;
  const cls = Number(p.class ?? (men ? 88 : 69));
  // Rough top snatch for the class, then each athlete a little behind.
  const topSn = men ? 0.62 * cls + 92 : 0.6 * cls + 48;
  return people.map(([name, club, cc], i) => {
    const sn = Math.round(topSn - i * (men ? 3.5 : 2.5) - (i % 3));
    const cj = Math.round(sn * 1.22 + (i % 2 ? 2 : 0));
    const bw = Math.round((cls - 1.5 - (i % 4) * 0.8) * 10) / 10;
    const total = sn + cj;
    const sinclair = Math.round(total * (men ? 1.18 : 1.24) * 10) / 10;
    const value =
      p.lift === "snatch" ? sn : p.lift === "cleanjerk" ? cj : p.lift === "sinclair" ? sinclair : total;
    return {
      rank: i + 1,
      user: {
        id: `mock-${men ? "m" : "w"}-${i}`,
        name,
        avatarUrl: null,
        club: club ?? null,
        countryCode: cc,
        sex: men ? "M" : "F",
        weightClass: String(p.class ?? cls),
        ageCategories: i % 5 === 3 ? ["open", "junior"] : i % 6 === 5 ? ["open", "masters"] : ["open"],
      },
      value,
      snatchKg: sn,
      cleanKg: cj,
      bodyweightKg: bw,
      sinclair,
      pendingReview: i === 7,
      achievedAt: daysAgo((i + 2) * 3),
    } as BoardRow;
  });
}

/** Real rows first, then mock rows, sorted by value and re-ranked. */
export function withMockRows(real: BoardRow[], p: BoardParams): BoardRow[] {
  if (!SHOW_MOCK_BOARD || real.length >= 15) return real;
  const all = [...real, ...mockBoard(p)].sort((a, b) => b.value - a.value);
  return all.map((r, i) => ({ ...r, rank: i + 1 }));
}
