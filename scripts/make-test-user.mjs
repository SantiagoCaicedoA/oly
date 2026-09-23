#!/usr/bin/env node
/**
 * make-test-user — create a fully onboarded test athlete in one command.
 *
 *   node scripts/make-test-user.mjs
 *   node scripts/make-test-user.mjs --sex F --bw 62 --snatch 88 --cj 108
 *   node scripts/make-test-user.mjs --email me+t3@example.com --no-lifts
 *
 * Signing up by hand means eight onboarding screens every time you delete
 * an account. This posts the same three calls the app posts:
 *
 *   1. POST /api/users     the account
 *   2. POST /api/profile   the onboarding payload, shaped exactly as
 *                          onboarding-screen8.tsx builds it
 *   3. POST /api/lifts     one snatch and one clean & jerk, so the athlete
 *                          holds a VERIFIED rank rather than a provisional
 *                          one. Skip with --no-lifts to test the
 *                          "CLAIM YOUR SPOT" state instead.
 *
 * It reads API_URL from .env.dev, so it hits whatever the app hits.
 * It prints the email and password at the end. Nothing is stored.
 */

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function env(key) {
  for (const file of [".env.dev", ".env"]) {
    try {
      const line = readFileSync(join(ROOT, file), "utf8")
        .split("\n")
        .find((l) => l.startsWith(`${key}=`));
      if (line) return line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "");
    } catch {}
  }
  return null;
}

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const API = (flag("api", env("API_URL")) || "").replace(/\/$/, "");
if (!API) {
  console.error("No API_URL. Put it in .env.dev or pass --api https://...");
  process.exit(1);
}

const stamp = Date.now().toString(36);
const SEX = (flag("sex", "M") || "M").toUpperCase() === "F" ? "F" : "M";
const BW = Number(flag("bw", SEX === "M" ? 93 : 62));
const SNATCH = Number(flag("snatch", SEX === "M" ? 118 : 82));
const CJ = Number(flag("cj", SEX === "M" ? 150 : 102));

const EMAIL = flag("email", `oly.test+${stamp}@example.com`);
const PASSWORD = flag("password", "TestPass123!");
const NAME = flag("name", SEX === "M" ? "Test Athlete" : "Test Athleta");
const USERNAME = flag("username", `test_${stamp}`);

async function call(path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    console.error(`\n✗ ${path} → ${res.status}`);
    console.error(JSON.stringify(json, null, 2).slice(0, 1200));
    process.exit(1);
  }
  return json;
}

const stat = (value, checked = true) => ({ value, checked });

console.log(`API      ${API}`);
console.log(`account  ${EMAIL}`);

/* ── 1. the account ─────────────────────────────────────────── */
const signup = await call("/api/users", {
  name: NAME,
  email: EMAIL,
  password: PASSWORD,
});
const token = signup.token;
const userId = signup.data?._id;
if (!token) {
  console.error("Signed up but got no token back. Response:", signup);
  process.exit(1);
}
console.log(`✓ account created   ${userId}`);

/* ── 2. onboarding ──────────────────────────────────────────── */
/* Field for field what onboarding-screen8.tsx assembles. The values that
   matter for rank are sex, bodyweight, and the two classic lifts. The
   rest is filler the backend expects to be present. */
await call(
  "/api/profile",
  {
    display_name: NAME,
    user_name: USERNAME,
    country: flag("country", "CAN"),
    age: Number(flag("age", 26)),
    sex: SEX,
    experience_years: 4,
    height_cm: SEX === "M" ? 178 : 165,
    bodyweight_value: BW,
    bodyweight_unit: "kg",
    preferred_unit: "kg",
    strength_stats: {
      snatch: stat(SNATCH),
      power_snatch: stat(Math.round(SNATCH * 0.85)),
      clean_jerk: stat(CJ),
      clean: stat(Math.round(CJ * 1.04)),
      power_clean: stat(Math.round(CJ * 0.85)),
      jerk: stat(Math.round(CJ * 1.02)),
      back_squat: stat(Math.round(CJ * 1.35)),
      front_squat: stat(Math.round(CJ * 1.18)),
    },
    strength_accuracy: "tested",
    considerations: {
      has_limitations: false,
      affected_areas: [],
      status: "",
      impact_level: "",
      triggers: [],
    },
    availability: {
      training_days_per_week: 5,
      session_duration: 90,
      preferred_rest_days: ["Sunday"],
    },
    equipment: { optional: [] },
    training_preference: "balanced",
    performance_gaps: [],
    recovery_profile: "",
    training_phase: "general",
    recent_training_volume: "moderate",
    competition: { preparing: false },
  },
  token,
);
console.log(`✓ onboarded         ${SEX} · ${BW} kg · snatch ${SNATCH} · C&J ${CJ}`);

/* ── 3. verified lifts ──────────────────────────────────────── */
if (has("no-lifts")) {
  console.log("· lifts skipped     rank will read PROVISIONAL (unclaimed)");
} else {
  const today = new Date().toISOString();
  const video = flag(
    "video",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  );
  for (const [liftType, weightKg] of [
    ["snatch", SNATCH],
    ["cleanjerk", CJ],
  ]) {
    const r = await call(
      "/api/lifts",
      {
        liftType,
        weightKg,
        bodyweightKg: BW,
        liftDate: today,
        videoUrl: video,
        idemKey: randomUUID(),
      },
      token,
    );
    const note = r.held
      ? "held"
      : r.lift?.pendingReview || r.pendingReview
        ? "pending review"
        : "live";
    console.log(`✓ ${liftType.padEnd(9)}${weightKg} kg · ${note}`);
  }
  console.log(`  total             ${SNATCH + CJ} kg`);
}

console.log(`
──────────────────────────────────────────────
  email     ${EMAIL}
  password  ${PASSWORD}
  username  ${USERNAME}
──────────────────────────────────────────────
Sign in with those in the app.

To see SEASON LEADER you have to be #1 on your board
(${SEX === "M" ? "Men" : "Women"} ${BW} kg, total). If someone
already sits above you, run this again with a bigger total:

  node scripts/make-test-user.mjs --snatch ${SNATCH + 40} --cj ${CJ + 40}
`);
