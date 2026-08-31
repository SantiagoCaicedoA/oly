/**
 * Dummy leaderboard data for testing the Rank screen.
 * Shapes mirror the planned backend API so swapping in real data is mechanical.
 */

export type LiftKey = "total" | "sn" | "cj" | "sinclair";
export type AgeCategory = "junior" | "senior" | "masters";
export type Sex = "M" | "F";

export type Athlete = {
  id: number;
  name: string;
  club: string;
  country: string; // IOC-style code, e.g. "COL"
  sex: Sex;
  wclass: string; // weight class in kg, e.g. "81"
  age: AgeCategory;
  sn: number; // snatch PR (kg)
  cj: number; // clean & jerk PR (kg)
  bw: number; // bodyweight at lift (kg)
  friend: boolean; // does the current user follow them
};

export const YOU = {
  id: -1,
  name: "Santiago Caicedo",
  club: "Halterofilia Bogotá",
  country: "COL",
  sex: "M" as Sex,
  wclass: "81",
  age: "senior" as AgeCategory,
  sn: 95,
  cj: 117,
  bw: 80.4,
};

export const ATHLETES: Athlete[] = [
  { id: 1,  name: "Andrés Rojas",    club: "Club Antioquia",      country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 96,  cj: 118, bw: 80.9, friend: true  },
  { id: 2,  name: "Camilo Herrera",  club: "Valle Oro",           country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 118, cj: 148, bw: 80.7, friend: false },
  { id: 3,  name: "Jhon Valencia",   club: "Cali Lifting",        country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 114, cj: 143, bw: 80.2, friend: false },
  { id: 4,  name: "Mateo Quintero",  club: "Bogotá Barbell",      country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 112, cj: 141, bw: 79.8, friend: true  },
  { id: 5,  name: "Luis Cárdenas",   club: "Medellín WL",         country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 108, cj: 136, bw: 80.9, friend: false },
  { id: 6,  name: "Kevin Palacios",  club: "Chocó Power",         country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 106, cj: 132, bw: 80.5, friend: false },
  { id: 7,  name: "Óscar Mena",      club: "Club Antioquia",      country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 103, cj: 129, bw: 79.2, friend: true  },
  { id: 8,  name: "Julián Torres",   club: "Santander Strong",    country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 100, cj: 124, bw: 80.8, friend: false },
  { id: 9,  name: "David Muñoz",     club: "Halterofilia Bogotá", country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 97,  cj: 117, bw: 80.1, friend: true  },
  { id: 10, name: "Sebastián Ríos",  club: "Cali Lifting",        country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 92,  cj: 115, bw: 80.6, friend: false },
  { id: 11, name: "Felipe Guzmán",   club: "Eje Cafetero WL",     country: "COL", sex: "M", wclass: "81", age: "senior",  sn: 90,  cj: 111, bw: 79.9, friend: false },
  { id: 12, name: "Tomás Agudelo",   club: "Medellín WL",         country: "COL", sex: "M", wclass: "81", age: "junior",  sn: 101, cj: 126, bw: 80.3, friend: false },
  { id: 13, name: "Samuel Ortiz",    club: "Bogotá Barbell",      country: "COL", sex: "M", wclass: "81", age: "junior",  sn: 94,  cj: 119, bw: 79.5, friend: true  },
  { id: 14, name: "Ricardo Pineda",  club: "Valle Oro",           country: "COL", sex: "M", wclass: "81", age: "masters", sn: 85,  cj: 105, bw: 80.0, friend: false },
  { id: 15, name: "Hernán Salazar",  club: "Cali Lifting",        country: "COL", sex: "M", wclass: "81", age: "masters", sn: 78,  cj: 98,  bw: 80.7, friend: false },
  { id: 16, name: "Diego Fuentes",   club: "Lima Lifters",        country: "PER", sex: "M", wclass: "81", age: "senior",  sn: 116, cj: 144, bw: 80.4, friend: false },
  { id: 17, name: "Marco Silva",     club: "São Paulo LPO",       country: "BRA", sex: "M", wclass: "81", age: "senior",  sn: 110, cj: 139, bw: 80.8, friend: false },
  { id: 18, name: "José Guerrero",   club: "Quito Fuerza",        country: "ECU", sex: "M", wclass: "81", age: "senior",  sn: 105, cj: 131, bw: 79.6, friend: false },
  { id: 19, name: "Valentina Cruz",  club: "Bogotá Barbell",      country: "COL", sex: "F", wclass: "59", age: "senior",  sn: 82,  cj: 102, bw: 58.8, friend: true  },
  { id: 20, name: "Mariana López",   club: "Cali Lifting",        country: "COL", sex: "F", wclass: "59", age: "senior",  sn: 78,  cj: 97,  bw: 58.5, friend: false },
  { id: 21, name: "Sofía Restrepo",  club: "Medellín WL",         country: "COL", sex: "F", wclass: "59", age: "senior",  sn: 74,  cj: 93,  bw: 58.9, friend: false },
  { id: 22, name: "Isabella Vargas", club: "Valle Oro",           country: "COL", sex: "F", wclass: "64", age: "senior",  sn: 80,  cj: 100, bw: 63.7, friend: false },
];

export const MEN_CLASSES = ["60", "65", "71", "79", "81", "88", "94", "110", "+110"];
export const WOMEN_CLASSES = ["48", "53", "58", "59", "63", "64", "69", "77", "+77"];

/** Sinclair-style pound-for-pound score (illustrative coefficients for the mock). */
export function sinclair(a: { sn: number; cj: number; bw: number; sex: Sex }): number {
  const total = a.sn + a.cj;
  const b = a.sex === "M" ? 193.609 : 153.757;
  const c = a.sex === "M" ? 0.722762521 : 0.787004341;
  if (a.bw >= b) return total;
  const x = Math.log10(a.bw / b);
  return total * Math.pow(10, c * x * x);
}

const DATES = ["Jun 14", "Jun 27", "Jul 6", "Jul 12", "Jul 21", "Jul 30", "Aug 3", "Aug 8"];
export const prDate = (id: number, salt: number) => DATES[(id * 3 + salt) % DATES.length];

export const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
