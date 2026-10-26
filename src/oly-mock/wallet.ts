/**
 * Wallet — MOCK DATA, in memory only.
 *
 * There is no Olys backend yet. This module stands in for one so the Shop
 * tab and the Wallet screen can be built and tested on a phone. Everything
 * resets when the app reloads. When the real endpoints land, swap these
 * hooks for RTK Query and keep the shapes.
 *
 * Rules this mirrors: 200 Olys = $1 CAD, Olys come mostly from verified
 * lifts, they are spent only on the Oly store as codes, and they can never
 * be bought or cashed out.
 */
import { useSyncExternalStore } from "react";

export const OLYS_PER_DOLLAR = 200;

export type Quest = { id: string; title: string; detail: string; reward: number; done: number; total: number };

/** Anything that can be redeemed: store credit, shipping, or a piece of gear. */
export type Reward = {
  id: string;
  title: string;
  /** Short headline on the ticket, e.g. "$5 off". */
  value: string;
  /** One line under it on the ticket. */
  note: string;
  /** One line on the redeem sheet and in lists. */
  detail: string;
  cost: number;
};

export type Gear = { id: string; name: string; priceCad: number; isNew?: boolean };

export type Code = {
  code: string;
  title: string;
  value: string;
  note: string;
  date: string;
  used: boolean;
  fresh?: boolean;
};

export type ActivityKind = "in" | "out" | "pending";
export type Activity = { id: string; label: string; sub: string; amount: number; kind: ActivityKind; group: string };

export const QUESTS: Quest[] = [
  { id: "q1", title: "Post 2 verified lifts", detail: "This week", reward: 50, done: 1, total: 2 },
  { id: "q2", title: "Hit a snatch PR", detail: "4 kg to go", reward: 400, done: 0, total: 1 },
  { id: "q3", title: "Weigh in at the Valhalla Open", detail: "Saturday, Calgary", reward: 250, done: 0, total: 1 },
];

export const VOUCHERS: Reward[] = [
  { id: "v5", title: "$5 store credit", value: "$5 off", note: "Any order on the Oly store", detail: "Any order", cost: 1000 },
  { id: "ship", title: "Free shipping", value: "Free shipping", note: "Canada, US and Colombia", detail: "CA, US, CO", cost: 1500 },
  { id: "v20", title: "$20 store credit", value: "$20 off", note: "Any order on the Oly store", detail: "Any order", cost: 4000 },
];

export const GEAR: Gear[] = [
  { id: "socks", name: "Oly Socks", priceCad: 15 },
  { id: "cap", name: "Oly Cap", priceCad: 25 },
  { id: "tee", name: "Halterofilia Tee", priceCad: 35, isNew: true },
  { id: "hoodie", name: "Oly Hoodie", priceCad: 60 },
];

export const FRIENDS = [
  { id: "f1", initials: "CO", name: "Camilo Ortiz", olys: 620 },
  { id: "me", initials: "MH", name: "You", olys: 410 },
  { id: "f2", initials: "VO", name: "Valentina Ospina", olys: 380 },
  { id: "f3", initials: "LG", name: "Laura Gómez", olys: 170 },
];

export const FRIEND_PULSE = { name: "Laura Gómez", text: "earned +400 for a snatch PR", time: "2m" };

/** Olys earned per period, oldest first. The last entry is the current one. */
export const EARNINGS = {
  "4W": { labels: ["Sep 8", "Sep 15", "Sep 22", "Sep 29"], values: [260, 380, 220, 410], every: 1, unit: "week" },
  "8W": {
    labels: ["Aug 11", "Aug 18", "Aug 25", "Sep 1", "Sep 8", "Sep 15", "Sep 22", "Sep 29"],
    values: [180, 240, 90, 310, 260, 380, 220, 410],
    every: 2,
    unit: "week",
  },
  "6M": { labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], values: [880, 1150, 980, 1320, 1300, 410], every: 1, unit: "month" },
} as const;
export type Range = keyof typeof EARNINGS;
export const WEEKLY = EARNINGS["8W"].values;

export const NEXT_DROP = {
  name: "Drop 01",
  blurb: "The bilingual tee and the first Oly hoodie.",
  endsAt: Date.now() + ((4 * 24 + 18) * 60 + 32) * 60 * 1000,
};

/** Weekly challenge pinned to the top of the home feed. */
export const CHALLENGE = {
  title: "Hit 90% of your snatch for 3 singles",
  daysLeft: 3,
  reward: 200,
  done: 2,
  goal: 3,
  faces: ["ML", "DR", "AP"],
  joined: "Mara, Diego and 41 others are in",
};

/**
 * Tiers count every oly ever earned (lifetime), so spending never drops
 * one. Thresholds from the Rewards Program Spec; names are placeholders.
 */
export const TIERS = [
  { at: 0, perk: "Earn and redeem olys" },
  { at: 2500, perk: "Profile badge, 24h early drops" },
  { at: 10000, perk: "Members colorway, +10% on logs" },
  { at: 25000, perk: "Free tee, priority comp entry" },
  { at: 50000, perk: "A tee never sold, name on the wall" },
];

/** Where a lifetime total sits: tier index (0 based), the next tier and the fill toward it. */
export function tierFor(lifetime: number) {
  let index = 0;
  TIERS.forEach((t, i) => {
    if (lifetime >= t.at) index = i;
  });
  const next = TIERS[index + 1] ?? null;
  return {
    index,
    next,
    toNext: next ? next.at - lifetime : null,
    pct: next ? (lifetime - TIERS[index].at) / (next.at - TIERS[index].at) : 1,
  };
}

export const ACTIVITY_GROUPS = ["TODAY", "THIS WEEK", "SEPTEMBER"];

export const gearReward = (g: Gear): Reward => ({
  id: g.id,
  title: g.name,
  value: g.name,
  note: "Claim it on the Oly store",
  detail: `$${g.priceCad} on the Oly store`,
  cost: g.priceCad * OLYS_PER_DOLLAR,
});
export const costOf = (g: Gear) => g.priceCad * OLYS_PER_DOLLAR;
export const toCad = (olys: number) => (olys / OLYS_PER_DOLLAR).toFixed(2);
export const fmt = (n: number) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const signed = (n: number) => (n < 0 ? "−" : "+") + fmt(n);

type State = {
  balance: number;
  pending: number;
  lifetime: number;
  /** The most recent change, shown as "+120 just now". */
  lastChange: number;
  /** Bumps on every change so the balance can play its "+120" moment once. */
  changeId: number;
  notify: boolean;
  codes: Code[];
  activity: Activity[];
};

let state: State = {
  balance: 3450,
  pending: 240,
  lifetime: 12840,
  lastChange: 120,
  changeId: 1,
  notify: false,
  codes: [
    { code: "OLY-4FJ9", title: "$5 store credit", value: "$5 off", note: "Any order on the Oly store", date: "Oct 2", used: false },
    { code: "OLY-7KQ2", title: "$5 store credit", value: "$5 off", note: "Any order", date: "Sep 20", used: true },
  ],
  activity: [
    { id: "a1", label: "95 kg snatch PR", sub: "Verifying, about 72h", amount: 240, kind: "pending", group: "TODAY" },
    { id: "a2", label: "120 kg clean & jerk", sub: "Verified lift · Oct 1", amount: 120, kind: "in", group: "THIS WEEK" },
    { id: "a3", label: "Weekly challenge", sub: "2 verified lifts · Sep 30", amount: 50, kind: "in", group: "THIS WEEK" },
    { id: "a4", label: "105 kg snatch", sub: "Verified lift · Sep 29", amount: 120, kind: "in", group: "THIS WEEK" },
    { id: "a5", label: "95 kg snatch", sub: "PR bonus · Sep 24", amount: 400, kind: "in", group: "SEPTEMBER" },
    { id: "a6", label: "$5 store credit", sub: "Redeemed · Sep 20", amount: -1000, kind: "out", group: "SEPTEMBER" },
    { id: "a7", label: "Valhalla Open", sub: "Meet weigh-in · Sep 14", amount: 250, kind: "in", group: "SEPTEMBER" },
  ],
};

const listeners = new Set<() => void>();
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useWallet = () => useSyncExternalStore(subscribe, () => state);

export const toggleNotify = () => set({ notify: !state.notify });

/** Spends Olys and returns the new code, or null when the balance is short. */
export function redeem(r: Reward): Code | null {
  if (state.balance < r.cost) return null;
  const code: Code = {
    code: "OLY-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    title: r.title,
    value: r.value,
    note: r.note,
    date: "Today",
    used: false,
    fresh: true,
  };
  set({
    balance: state.balance - r.cost,
    lastChange: -r.cost,
    changeId: state.changeId + 1,
    codes: [code, ...state.codes.map((c) => ({ ...c, fresh: false }))],
    activity: [
      { id: String(Date.now()), label: r.title, sub: "Redeemed · Today", amount: -r.cost, kind: "out", group: "TODAY" },
      ...state.activity,
    ],
  });
  return code;
}
