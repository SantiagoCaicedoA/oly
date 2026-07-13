/**
 * Block-engine live test. Creates an account, completes onboarding (5 days, rest
 * Sat/Sun, tested maxes, no competition), then reads the generated week — which now
 * comes from the deterministic BLOCK ENGINE (a new athlete starts Base Season week 1).
 * Verifies: real block-based sessions + loads, and a coach note that names the real
 * plan (Base Season, week 1).  Run:  node block-engine-test.js
 */
const API = 'https://api.olytraining.com';
const S = (value) => ({ value, checked: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  } catch (e) { return { status: 0, json: { error: e.message } }; }
  finally { clearTimeout(t); }
}

const stamp = Date.now();
const profile = {
  display_name: 'Block Test', user_name: `block_test_${stamp}`, country: 'Colombia', age: 27, sex: 'Male',
  experience_years: 5, height_cm: 175, bodyweight_value: 81, bodyweight_unit: 'kg', preferred_unit: 'metric',
  strength_accuracy: 'tested',
  strength_stats: {
    snatch: S(125), clean_jerk: S(155), power_snatch: S(100), clean: S(158), power_clean: S(128),
    jerk: S(157), back_squat: S(185), front_squat: S(150),
  },
  considerations: { has_limitations: false, affected_areas: [], triggers: [] },
  availability: { training_days_per_week: 5, session_duration: 90, preferred_rest_days: ['Saturday', 'Sunday'] },
  equipment: { optional: ['Squat Rack', 'Lifting Blocks', 'Pulling Blocks'] },
  training_preference: 'Balanced',
  performance_gaps: ['Receiving depth'],
  training_phase: 'in_training_block',
  recent_training_volume: 'steady',
  competition: { preparing: false },
};

async function pollWeek(token, tries = 40) {
  for (let i = 0; i < tries; i++) {
    const wk = await call('GET', '/api/training/week', null, token);
    if (wk.json && wk.json.data) return wk.json.data;
    await sleep(3000);
  }
  return null;
}

(async () => {
  process.stdout.write('signing up... ');
  const su = await call('POST', '/api/users', { name: profile.display_name, email: `block.${stamp}@olytest.com`, password: 'testpass123' });
  const token = su.json && su.json.token;
  if (!token) return console.log('FAILED:', su.status, JSON.stringify(su.json));
  process.stdout.write('onboarding + generating (block engine)... ');
  const put = await call('PUT', '/api/profile', profile, token);
  process.stdout.write('done.\n');
  console.log('msg:', put.json && put.json.message);

  const week = await pollWeek(token);
  if (!week) return console.log('No week generated (check server logs).');

  const days = week.days || week;
  console.log('\n=== GENERATED WEEK (should be Base Season, week 1 — high-volume base) ===');
  for (const name of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
    const d = days[name];
    if (!d) continue;
    if (d.type === 'rest') { console.log(`\n${name.toUpperCase()} — rest`); continue; }
    console.log(`\n${name.toUpperCase()}`);
    console.log('  coach note:', d.coach_note);
    console.log('  cues:', (d.key_cues || []).join(' · '));
    for (const ex of d.exercises || []) {
      const top = Math.max(0, ...(ex.sets || []).map((s) => s.weight || 0));
      console.log(`   - ${ex.exercise_name}: ${ex.sets.length}×${ex.sets[0] ? ex.sets[0].reps : '?'}  top ${top}kg`);
    }
  }
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
