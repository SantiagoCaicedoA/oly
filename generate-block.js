/**
 * Generate a full 12-week block for two athletes to inspect the BIG PICTURE
 * of programming (thoughtful periodization vs. weekly improvising).
 *
 *  - Nationals athlete PEAKING: 12 accounts, meet date stepped 12 weeks out -> 1
 *    week out, so stitched together they form a 12-week peak block.
 *  - Beginner (1 yr, no meet): 12 straight generations, to see whether it
 *    progresses or just repeats.
 *
 * Runs against production, concurrency-limited. Writes block-data.json.
 * Run:  node generate-block.js
 */
const API = 'https://api.olytraining.com';
const fs = require('fs');
const path = require('path');
const S = (value) => ({ value, checked: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CONCURRENCY = 4;

async function call(method, p, body, token) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(API + p, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const txt = await res.text();
    let j; try { j = JSON.parse(txt); } catch { j = { raw: txt }; }
    return { status: res.status, json: j };
  } catch (e) {
    return { status: 0, json: { error: e.message } };
  } finally { clearTimeout(t); }
}

// Meet date N weeks from today, as YYYY-MM-DD.
function meetDate(weeksOut) {
  const d = new Date(Date.now() + weeksOut * 7 * 86400000);
  return d.toISOString().slice(0, 10);
}

// ---- Athlete templates ----
function nationalsProfile(weeksOut, tag) {
  return {
    display_name: 'Block Nats', user_name: `block_nats_${tag}`, country: 'Colombia', age: 26, sex: 'Male',
    experience_years: 8, height_cm: 178, bodyweight_value: 81, bodyweight_unit: 'kg', preferred_unit: 'metric',
    strength_accuracy: 'tested',
    strength_stats: {
      snatch: S(150), clean_jerk: S(185), power_snatch: S(120), clean: S(190), power_clean: S(150),
      jerk: S(188), back_squat: S(230), front_squat: S(200),
    },
    considerations: { has_limitations: false, affected_areas: [], triggers: [] },
    availability: { training_days_per_week: 5, session_duration: 100, preferred_rest_days: ['Thursday', 'Sunday'] },
    equipment: { optional: ['Squat Rack', 'Lifting Blocks', 'Pulling Blocks'] },
    training_preference: 'Balanced',
    performance_gaps: ['Receiving depth'],
    training_phase: 'in_training_block',
    recent_training_volume: 'heavy',
    competition: { preparing: true, name: 'Nationals', date: meetDate(weeksOut), weight_class: '81', target_total: 335 },
  };
}

function beginnerProfile(tag) {
  return {
    display_name: 'Block Beg', user_name: `block_beg_${tag}`, country: 'Colombia', age: 24, sex: 'Male',
    experience_years: 1, height_cm: 175, bodyweight_value: 75, bodyweight_unit: 'kg', preferred_unit: 'metric',
    strength_accuracy: 'tested',
    strength_stats: {
      snatch: S(65), clean_jerk: S(85), power_snatch: S(52), clean: S(88), power_clean: S(66),
      jerk: S(85), back_squat: S(115), front_squat: S(92),
    },
    considerations: { has_limitations: false, affected_areas: [], triggers: [] },
    availability: { training_days_per_week: 3, session_duration: 75, preferred_rest_days: ['Wednesday', 'Friday', 'Saturday', 'Sunday'] },
    equipment: { optional: ['Squat Rack'] },
    training_preference: 'Balanced',
    performance_gaps: ['Squat & leg strength'],
    training_phase: 'in_training_block',
    recent_training_volume: 'steady',
    competition: { preparing: false },
  };
}

async function pollWeek(token, tries = 45, delay = 3000) {
  for (let i = 0; i < tries; i++) {
    const wk = await call('GET', '/api/training/week', null, token);
    if (wk.json && wk.json.data) return wk.json.data;
    await sleep(delay);
  }
  return null;
}

async function generateFor(profile) {
  const tag = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const email = `block.${tag}@olytest.com`;
  const su = await call('POST', '/api/users', { name: profile.display_name, email, password: 'testpass123' });
  const token = su.json && su.json.token;
  if (!token) return { error: 'signup failed', detail: su.json };
  // profile carries a unique user_name per call
  profile.user_name = profile.user_name.replace(/_[^_]*$/, '') + '_' + tag;
  await call('PUT', '/api/profile', profile, token); // returns immediately, generates in background
  const week = await pollWeek(token);
  return week ? { data: week } : { error: 'week not generated in time' };
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let idx = 0;
  const runners = Array.from({ length: size }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

(async () => {
  // Build the job list. Nationals: weeks 1..12 => weeksOut 12..1.
  const jobs = [];
  for (let w = 1; w <= 12; w++) {
    const weeksOut = 13 - w;
    jobs.push({ athlete: 'nationals', week: w, weeks_out: weeksOut, profile: nationalsProfile(weeksOut, `w${w}`) });
  }
  for (let w = 1; w <= 12; w++) {
    jobs.push({ athlete: 'beginner', week: w, weeks_out: null, profile: beginnerProfile(`w${w}`) });
  }

  let done = 0;
  console.log(`Generating ${jobs.length} weeks (concurrency ${CONCURRENCY}). This takes a few minutes...`);
  const results = await pool(jobs, CONCURRENCY, async (job) => {
    const res = await generateFor(job.profile);
    done++;
    const ok = res && res.data ? 'ok' : 'FAIL';
    process.stdout.write(`  [${done}/${jobs.length}] ${job.athlete} week ${job.week} (${job.weeks_out ?? '-'} wks out): ${ok}\n`);
    return { athlete: job.athlete, week: job.week, weeks_out: job.weeks_out, meet_date: job.profile.competition?.date || null, ...res };
  });

  const out = {
    generated_at: new Date().toISOString(),
    nationals: results.filter((r) => r.athlete === 'nationals').sort((a, b) => a.week - b.week),
    beginner: results.filter((r) => r.athlete === 'beginner').sort((a, b) => a.week - b.week),
  };
  const outPath = path.join(__dirname, 'block-data.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  const okN = out.nationals.filter((r) => r.data).length;
  const okB = out.beginner.filter((r) => r.data).length;
  console.log(`\nDone. Nationals ${okN}/12, Beginner ${okB}/12 generated.`);
  console.log('Saved block-data.json in your oly folder.');
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
