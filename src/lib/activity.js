import { gameReducer } from './game.js';

export const ACTIVITY_KEY = 'geoquest.activity.v1';
export const saveKey = (mode, region, includeTerritories) => `${mode}:${region}${typeof includeTerritories === 'boolean' ? includeTerritories ? ':territorios' : ':paises' : ''}`;
const validKey = key => /^[1-4]:(mundo|africa|asia|europa|americas|oceania)(:(paises|territorios))?$/.test(key);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const count = value => Number.isSafeInteger(value) && value >= 0;
export const emptyActivity = () => ({ version: 1, saves: {}, stats: {}, runs: {}, completed: 0, bestStreak: 0 });

export function serializeGame(game, now = Date.now()) {
  return { id: game.id, mode: game.mode, region: game.region, startedAt: game.startedAt, updatedAt: now,
    keepCorrect: game.keepCorrect, usedMapHints: game.usedMapHints,
    ...(game.legacyQueue || typeof game.includeTerritories !== 'boolean' ? {} : { includeTerritories: game.includeTerritories }),
    queue: game.queue.map(country => country.id), index: game.index,
    answers: game.answers.map(a => ({ id: a.country.id, value: a.value, skipped: a.skipped })) };
}

/** Rebuild from trusted data and the reducer, never from a stored score. */
export function restoreGame(snapshot, countries) {
  if (!object(snapshot) || !validKey(saveKey(snapshot.mode, snapshot.region))
    || typeof snapshot.id !== 'string' || snapshot.id.length > 100
    || !Array.isArray(snapshot.queue) || !Array.isArray(snapshot.answers)) return null;
  const legacy = typeof snapshot.includeTerritories !== 'boolean';
  const pool = countries.filter(c => (snapshot.region === 'mundo' || c.continente === snapshot.region) && (legacy ? !['383', '798'].includes(c.id) : snapshot.includeTerritories || c.isCountry));
  const lookup = Object.fromEntries(pool.map(c => [c.id, c]));
  if (snapshot.queue.length !== pool.length || new Set(snapshot.queue).size !== pool.length
    || snapshot.queue.some(id => !lookup[id]) || snapshot.answers.length > pool.length
    || !Number.isInteger(snapshot.index) || snapshot.index < 0 || snapshot.index >= pool.length
    || ![snapshot.index, snapshot.index + 1].includes(snapshot.answers.length)) return null;
  const keepCorrect = snapshot.keepCorrect !== false;
  const usedMapHints = keepCorrect || snapshot.usedMapHints !== false;
  let game = { id: snapshot.id, startedAt: Number.isFinite(snapshot.startedAt) ? snapshot.startedAt : Date.now(),
    mode: snapshot.mode, region: snapshot.region, includeTerritories: legacy || snapshot.includeTerritories, ...(legacy ? { legacyQueue: true } : {}), keepCorrect, usedMapHints,
    difficulty: usedMapHints ? 'normal' : 'dificil', queue: snapshot.queue.map(id => lookup[id]),
    index: 0, answers: [], score: 0, streak: 0, bestStreak: 0, finished: false };
  for (let i = 0; i < snapshot.answers.length; i++) {
    const answer = snapshot.answers[i];
    if (!object(answer) || answer.id !== game.queue[i].id || typeof answer.value !== 'string'
      || answer.value.length > 500 || (answer.skipped && ![2, 4].includes(game.mode))) return null;
    game = gameReducer(game, { type: answer.skipped ? 'SKIP' : 'ANSWER', value: answer.value });
    if (i < snapshot.index) game = gameReducer(game, { type: 'NEXT' });
  }
  return game;
}

export function readActivity(countries, storage) {
  const activity = emptyActivity();
  try {
    const value = JSON.parse((storage ?? globalThis.localStorage).getItem(ACTIVITY_KEY) || 'null');
    if (!object(value) || value.version !== 1) return activity;
    const ids = new Set(countries.map(c => c.id));
    for (const [key, stat] of Object.entries(object(value.stats) ? value.stats : {})) {
      const [mode, id] = key.split(':');
      if (!/^[1-4]$/.test(mode) || !ids.has(id) || !object(stat)
        || !['attempts', 'correct', 'skips'].every(k => count(stat[k]))
        || stat.correct + stat.skips > stat.attempts) continue;
      activity.stats[key] = { attempts: stat.attempts, correct: stat.correct, skips: stat.skips };
    }
    for (const [id, run] of Object.entries(object(value.runs) ? value.runs : {})) {
      if (id.length <= 100 && object(run) && count(run.answers) && run.answers <= countries.length)
        activity.runs[id] = { answers: run.answers, complete: run.complete === true };
    }
    for (const [key, snapshot] of Object.entries(object(value.saves) ? value.saves : {})) {
      if (validKey(key) && key === saveKey(snapshot?.mode, snapshot?.region, snapshot?.includeTerritories) && restoreGame(snapshot, countries)) activity.saves[key] = snapshot;
    }
    activity.completed = count(value.completed) ? value.completed : 0;
    activity.bestStreak = count(value.bestStreak) ? value.bestStreak : 0;
    return activity;
  } catch { return activity; }
}

/** Save and aggregate atomically. The run ledger prevents double counting when
 * React effects replay, feedback is resumed or the last question is restored. */
export function checkpoint(previous, game, now = Date.now()) {
  const activity = { ...previous, saves: { ...previous.saves }, stats: { ...previous.stats }, runs: { ...previous.runs } };
  const recorded = activity.runs[game.id] || { answers: 0, complete: false };
  for (const answer of game.answers.slice(recorded.answers)) {
    const key = `${game.mode}:${answer.country.id}`;
    const old = activity.stats[key] || { attempts: 0, correct: 0, skips: 0 };
    activity.stats[key] = { attempts: old.attempts + 1, correct: old.correct + Number(answer.correct), skips: old.skips + Number(answer.skipped) };
  }
  activity.runs[game.id] = { answers: Math.max(recorded.answers, game.answers.length), complete: recorded.complete || game.finished };
  activity.bestStreak = Math.max(activity.bestStreak, game.bestStreak);
  const key = saveKey(game.mode, game.region, game.legacyQueue ? undefined : game.includeTerritories);
  if (game.finished) {
    if (!recorded.complete) activity.completed++;
    if (activity.saves[key]?.id === game.id) delete activity.saves[key];
  } else if (!recorded.complete) activity.saves[key] = serializeGame(game, now);
  return activity;
}

export function writeActivity(activity, storage) {
  try { (storage ?? globalThis.localStorage).setItem(ACTIVITY_KEY, JSON.stringify(activity)); return true; }
  catch { return false; }
}

export function summarizeStats(activity, countries, filter = 'all') {
  const rows = countries.map(country => ({ country, attempts: 0, correct: 0, skips: 0 }));
  const byId = Object.fromEntries(rows.map(row => [row.country.id, row]));
  for (const [key, stat] of Object.entries(activity.stats)) {
    const [mode, id] = key.split(':');
    const included = filter === 'all' || filter === mode || (filter === 'countries' && ['1', '2'].includes(mode)) || (filter === 'capitals' && ['3', '4'].includes(mode));
    if (!included || !byId[id]) continue;
    for (const field of ['attempts', 'correct', 'skips']) byId[id][field] += stat[field];
  }
  const played = rows.filter(row => row.attempts);
  const totals = played.reduce((sum, row) => ({ attempts: sum.attempts + row.attempts, correct: sum.correct + row.correct, skips: sum.skips + row.skips }), { attempts: 0, correct: 0, skips: 0 });
  const continents = [...new Set(countries.map(c => c.continente))].map(id => {
    const members = played.filter(row => row.country.continente === id);
    const attempts = members.reduce((sum, row) => sum + row.attempts, 0);
    const correct = members.reduce((sum, row) => sum + row.correct, 0);
    return { id, attempts, correct, accuracy: attempts ? correct / attempts : null };
  });
  return { ...totals, coverage: played.length, rows: played, continents,
    weakest: played.filter(row => row.attempts > row.correct).sort((a, b) => a.correct / a.attempts - b.correct / b.attempts || b.attempts - b.correct - (a.attempts - a.correct)),
    strongest: played.filter(row => row.correct).sort((a, b) => b.correct / b.attempts - a.correct / a.attempts || b.correct - a.correct) };
}
