/**
 * Messages — MOCK DATA, in memory only.
 *
 * There is no messaging backend yet. This module stands in for one so the
 * inbox and chat screens can be built and tested on a phone. Everything
 * here resets when the app reloads. When the real endpoints land, replace
 * this file with RTK Query calls and keep the same shapes.
 */
import { useSyncExternalStore } from "react";

export type LiftRef = {
  kg: number;
  lift: string;
  date: string;
  /** A real post id opens post-expanded; mock lifts have none. */
  postId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
};

export type Msg =
  | { id: string; from: "me" | "them"; kind: "text"; text: string; reply?: LiftRef }
  | { id: string; from: "me" | "them"; kind: "lift"; lift: LiftRef }
  | {
      id: string;
      from: "me" | "them";
      kind: "media";
      uri: string;
      mediaType: "image" | "video";
    };

export type Thread = {
  id: string;
  name: string;
  handle: string;
  club: string;
  time: string;
  unread: boolean;
  messages: Msg[];
};

let seq = 0;
const id = () => `m${Date.now()}${seq++}`;

let threads: Thread[] = [
  {
    id: "camilo",
    name: "Camilo Ortiz",
    handle: "camiloortiz",
    club: "Halteras Cali",
    time: "2m",
    unread: true,
    messages: [
      {
        id: "c1",
        from: "them",
        kind: "text",
        text: "That turnover though. What did you change?",
        reply: { kg: 150, lift: "Clean & Jerk", date: "Sep 27" },
      },
    ],
  },
  {
    id: "valentina",
    name: "Valentina Ospina",
    handle: "valeospina",
    club: "Liga Valle",
    time: "1h",
    unread: true,
    messages: [
      { id: "v1", from: "them", kind: "text", text: "Opener for Saturday, thoughts?" },
      { id: "v2", from: "them", kind: "lift", lift: { kg: 105, lift: "Clean & Jerk", date: "Oct 1" } },
    ],
  },
  {
    id: "julian",
    name: "Julián Rentería",
    handle: "julianr",
    club: "Liga Valle",
    time: "3h",
    unread: false,
    messages: [
      { id: "j1", from: "me", kind: "text", text: "Are you lifting at provincials?" },
      { id: "j2", from: "them", kind: "text", text: "Yes, 89 session. See you at provincials" },
    ],
  },
  {
    id: "laura",
    name: "Laura Gómez",
    handle: "lauragomez",
    club: "Independent",
    time: "Yesterday",
    unread: false,
    messages: [
      { id: "l1", from: "them", kind: "text", text: "How did the snatch day go?" },
      { id: "l2", from: "me", kind: "lift", lift: { kg: 120, lift: "Snatch", date: "Sep 27" } },
      { id: "l3", from: "them", kind: "text", text: "Clean. That's a PR right?" },
      { id: "l4", from: "me", kind: "text", text: "Yeah, 2 kg over my old best" },
    ],
  },
  {
    id: "diego",
    name: "Diego Arango",
    handle: "diegoarango",
    club: "Halteras Cali",
    time: "Mon",
    unread: false,
    messages: [
      { id: "d1", from: "them", kind: "text", text: "Haha no way, 5 kg PR on a Tuesday" },
    ],
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useThreads(): Thread[] {
  return useSyncExternalStore(subscribe, () => threads);
}

export function useThread(threadId?: string): Thread | undefined {
  const all = useThreads();
  return all.find((t) => t.id === threadId);
}

function update(threadId: string, fn: (t: Thread) => Thread) {
  threads = threads.map((t) => (t.id === threadId ? fn(t) : t));
  emit();
}

export function markRead(threadId: string) {
  const t = threads.find((x) => x.id === threadId);
  if (t?.unread) update(threadId, (x) => ({ ...x, unread: false }));
}

type NewMsg =
  | { kind: "text"; text: string }
  | { kind: "lift"; lift: LiftRef }
  | { kind: "media"; uri: string; mediaType: "image" | "video" };

export function sendMessages(threadId: string, msgs: NewMsg[]) {
  if (!msgs.length) return;
  const t = threads.find((x) => x.id === threadId);
  if (!t) return;
  const added = msgs.map((m) => ({ ...m, id: id(), from: "me" as const })) as Msg[];
  const next: Thread = { ...t, time: "now", unread: false, messages: [...t.messages, ...added] };
  // Most recent conversation moves to the top of the inbox.
  threads = [next, ...threads.filter((x) => x.id !== threadId)];
  emit();
}

/** The inbox preview line for a thread. */
export function previewOf(t: Thread): { text: string; isLift: boolean } {
  const m = t.messages[t.messages.length - 1];
  if (!m) return { text: "New conversation", isLift: false };
  const who = m.from === "me" ? "You sent" : "Sent";
  if (m.kind === "lift") {
    const short = m.lift.lift === "Clean & Jerk" ? "C&J" : m.lift.lift;
    return { text: `${who} a lift · ${m.lift.kg} kg ${short}`, isLift: true };
  }
  if (m.kind === "media") {
    return { text: `${who} a ${m.mediaType === "video" ? "video" : "photo"}`, isLift: false };
  }
  return { text: m.from === "me" ? `You: ${m.text}` : m.text, isLift: false };
}

export function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

/* ── Requests ─────────────────────────────────────────────────────────
   Messages from people the athlete does not follow. Accepting moves the
   conversation into the inbox; deleting or blocking drops it. MOCK. */

export type Request = {
  id: string;
  name: string;
  handle: string;
  club: string;
  context: string;
  ranked: boolean;
  time: string;
  text: string;
};

let requests: Request[] = [
  {
    id: "natalia",
    name: "Natalia Cárdenas",
    handle: "nataliac",
    club: "Liga Antioquia",
    context: "#3 Women 63 kg · Liga Antioquia",
    ranked: true,
    time: "20m",
    text: "Hey! Saw your C&J on the board. Are you lifting at provincials? Would love to train together one day.",
  },
  {
    id: "tomas",
    name: "Tomás Bernal",
    handle: "tomasbernal",
    club: "Independent",
    context: "Independent · COL",
    ranked: false,
    time: "2d",
    text: "What shoes are those in your snatch video?",
  },
];

export function useRequests(): Request[] {
  return useSyncExternalStore(subscribe, () => requests);
}

export function acceptRequest(reqId: string): string | null {
  const r = requests.find((x) => x.id === reqId);
  if (!r) return null;
  requests = requests.filter((x) => x.id !== reqId);
  const thread: Thread = {
    id: r.id,
    name: r.name,
    handle: r.handle,
    club: r.club,
    time: r.time,
    unread: false,
    messages: [{ id: `${r.id}-1`, from: "them", kind: "text", text: r.text }],
  };
  threads = [thread, ...threads.filter((t) => t.id !== r.id)];
  emit();
  return thread.id;
}

export function removeRequest(reqId: string) {
  requests = requests.filter((x) => x.id !== reqId);
  emit();
}

/* ── People you follow (for New message) ─────────────────────────── */

export type Person = { id: string; name: string; handle: string; club: string; rank?: string };

export const FOLLOWING: Person[] = [
  { id: "andres", name: "Andrés Mosquera", handle: "andresm", club: "Liga Valle", rank: "#4" },
  { id: "camilo", name: "Camilo Ortiz", handle: "camiloortiz", club: "Halteras Cali", rank: "#3" },
  { id: "diego", name: "Diego Arango", handle: "diegoarango", club: "Halteras Cali", rank: "#6" },
  { id: "julian", name: "Julián Rentería", handle: "julianr", club: "Liga Valle", rank: "#1" },
  { id: "laura", name: "Laura Gómez", handle: "lauragomez", club: "Independent" },
  { id: "valentina", name: "Valentina Ospina", handle: "valeospina", club: "Liga Valle", rank: "#2" },
  { id: "sebastian", name: "Sebastián Ruiz", handle: "sebasruiz", club: "Independent", rank: "#5" },
];

/** Opens the existing conversation with someone, or starts an empty one. */
export function threadFor(p: Person): string {
  if (!threads.some((t) => t.id === p.id)) {
    threads = [
      { id: p.id, name: p.name, handle: p.handle, club: p.club, time: "now", unread: false, messages: [] },
      ...threads,
    ];
    emit();
  }
  return p.id;
}
