/**
 * Reproduce the two bugs with a controlled account (snatch 125, squat-strength gap,
 * lagging front squat). Saves my-profile.json + my-week.json for inspection.
 * Run:  node repro.js
 */
const API = 'https://api.olytraining.com';
const fs = require('fs');
const path = require('path');
const S = (value, checked = true) => ({ value, checked });

async function call(method, p, body, token) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 180000);
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
  } finally { clearTimeout(t); }
}

const stamp = Date.now();
const signup = { name: 'Santi Repro', email: `santi.repro.${stamp}@olytest.com`, password: 'testpass123' };
const profile = {
  display_name: 'Santi Repro', user_name: `santi_repro_${stamp}`, country: 'Colombia', age: 28, sex: 'Male',
  experience_years: 4, height_cm: 172, bodyweight_value: 75, bodyweight_unit: 'kg', preferred_unit: 'metric',
  strength_accuracy: 'tested',
  strength_stats: {
    snatch: S(125), clean_jerk: S(155), power_snatch: S(100), clean: S(160), power_clean: S(130),
    jerk: S(157), back_squat: S(185), front_squat: S(145),
  },
  considerations: { has_limitations: false, affected_areas: [], triggers: [] },
  availability: { training_days_per_week: 3, session_duration: 75, preferred_rest_days: ['Wednesday', 'Saturday', 'Sunday'] },
  equipment: { optional: ['Squat Rack', 'Lifting Blocks'] },
  training_preference: 'Balanced',
  performance_gaps: ['Squat & leg strength', 'Receiving depth'],
  training_phase: 'in_training_block',
  recent_training_volume: 'steady',
  competition: { preparing: true, name: 'Nationals', date: '2026-10-24', weight_class: '73', target_total: 285 },
};

(async () => {
  process.stdout.write('signing up... ');
  const su = await call('POST', '/api/users', signup);
  const token = su.json.token;
  if (!token) { console.log('FAILED:', su.status, JSON.stringify(su.json)); return; }
  process.stdout.write('onboarding + generating (up to a minute)... ');
  const put = await call('PUT', '/api/profile', profile, token);
  process.stdout.write('done.\n');
  const prof = await call('GET', '/api/profile', null, token);
  const wk = await call('GET', '/api/training/week', null, token);
  fs.writeFileSync(path.join(__dirname, 'my-profile.json'), JSON.stringify(prof.json && prof.json.data, null, 2));
  fs.writeFileSync(path.join(__dirname, 'my-week.json'), JSON.stringify(wk.json && (wk.json.data || wk.json), null, 2));
  console.log('msg:', put.json && put.json.message);
  console.log('Saved my-profile.json and my-week.json in your oly folder.');
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
