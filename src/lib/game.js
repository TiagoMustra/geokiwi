import { getGameStorage } from '../auth/game-storage.js';
import { validRegion } from './regions.js';
/** Rules shared by all four game modes. No UI or network dependencies. */
export const POINTS = 100;

export function normalizeAnswer(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function matchesAnswer(country, mode, value) {
  const normalized = normalizeAnswer(value);
  if (!normalized) return false;
  const accepted = mode === 4 ? country.capitais_aceitas : country.aliases;
  return accepted.some(answer => normalizeAnswer(answer) === normalized);
}

export function makeQueue(pool, mode, random = Math.random) {
  // Every destination appears exactly once. The input database stays untouched.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createGame({ mode, region, difficulty, keepCorrect, pool, random, includeTerritories, practice = false }) {
  const remember = keepCorrect ?? difficulty !== 'dificil';
  return { id: globalThis.crypto?.randomUUID?.() || `run-${Date.now()}-${Math.random().toString(36).slice(2)}`, startedAt: Date.now(), mode, region, ...(practice ? { practice: true } : {}), ...(typeof includeTerritories === 'boolean' ? { includeTerritories } : {}), keepCorrect: remember, usedMapHints: remember, difficulty: remember ? 'normal' : 'dificil', queue: makeQueue(pool, mode, random), index: 0, answers: [], score: 0, streak: 0, bestStreak: 0, finished: false };
}

export function gameReducer(state, action) {
  if (action.type === 'SET_KEEP_CORRECT') {
    if (state.finished) return state;
    // Enabling visual help once keeps this attempt in the assisted category.
    const usedMapHints = state.usedMapHints || action.value;
    return { ...state, keepCorrect: Boolean(action.value), usedMapHints, difficulty: usedMapHints ? 'normal' : 'dificil' };
  }
  if (action.type === 'ANSWER' || action.type === 'SKIP') {
    if (state.finished || state.answers.length > state.index) return state;
    const skipped = action.type === 'SKIP';
    if (skipped && state.mode !== 2 && state.mode !== 4) return state;
    const value = skipped ? '' : action.value;
    const correct = !skipped && (state.mode === 1 || state.mode === 3
      ? value === state.queue[state.index].id
      : matchesAnswer(state.queue[state.index], state.mode, value));
    const streak = correct ? state.streak + 1 : 0;
    return { ...state, score: state.score + (correct ? POINTS : 0), streak, bestStreak: Math.max(streak, state.bestStreak), answers: [...state.answers, { country: state.queue[state.index], correct, value, skipped }] };
  }
  if (action.type === 'NEXT') {
    if (state.answers.length <= state.index || state.finished) return state;
    if (state.index + 1 === state.queue.length) return { ...state, finished: true };
    return { ...state, index: state.index + 1 };
  }
  return state;
}

export function scoreKey(mode, region, difficulty, includeTerritories) {
  return `${mode}:${region}:${difficulty}${typeof includeTerritories === 'boolean' ? includeTerritories ? ':territorios' : ':paises' : ''}`;
}

function validScoreKey(key) { const [mode, region, difficulty, scope, ...extra] = key.split(':'); return /^[1-4]$/.test(mode) && validRegion(region) && ['normal','dificil'].includes(difficulty) && !extra.length && (scope === undefined || ['paises','territorios'].includes(scope)); }

// Full-region runs have separate records from the legacy 15-question format.
const STORAGE_KEY = 'geoquest.highscores.v2';
export function readScores(storage) {
  try {
    storage ??= getGameStorage();
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([key, value]) => validScoreKey(key) && Number.isSafeInteger(value) && value >= 0 && value % POINTS === 0));
  } catch { return {}; }
}

export function saveScore(scores, game, storage) {
  const key = scoreKey(game.mode, game.region, game.difficulty, game.legacyQueue ? undefined : game.includeTerritories);
  const updated = { ...scores, [key]: Math.max(scores[key] || 0, game.score) };
  let persisted = true;
  try { (storage ?? getGameStorage()).setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { persisted = false; }
  return { scores: updated, persisted };
}

const PREFERENCES_KEY = 'geoquest.preferences.v1';
function readPreferences(storage) {
  const value = JSON.parse((storage ?? globalThis.localStorage).getItem(PREFERENCES_KEY) || '{}');
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function savePreferences(patch, storage) {
  try {
    let previous = {};
    try { previous = readPreferences(storage); } catch { /* Repair invalid stored JSON. */ }
    (storage ?? globalThis.localStorage).setItem(PREFERENCES_KEY, JSON.stringify({ ...previous, ...patch }));
  } catch { /* Preferences remain usable in this session if storage is blocked. */ }
}
export function readKeepCorrect(storage) {
  try { return readPreferences(storage).keepCorrect !== false; }
  catch { return true; }
}
export function saveKeepCorrect(value, storage) {
  savePreferences({ keepCorrect: Boolean(value) }, storage);
}
export function readMapView(storage) {
  try { return readPreferences(storage).mapView === 'globe' ? 'globe' : 'flat'; }
  catch { return 'flat'; }
}
export function saveMapView(value, storage) {
  savePreferences({ mapView: value === 'globe' ? 'globe' : 'flat' }, storage);
}
export function readTheme(storage) {
  try { return readPreferences(storage).theme === 'light' ? 'light' : 'dark'; }
  catch { return 'dark'; }
}
export function saveTheme(value, storage) {
  savePreferences({ theme: value === 'light' ? 'light' : 'dark' }, storage);
}

// Enough time to read errors; successful answers keep the game moving.
export const feedbackDuration = result => result.correct ? 850 : 3500;

export function readSuggestions(storage) {
  try { return readPreferences(storage).suggestions !== false; }
  catch { return true; }
}
export function saveSuggestions(value, storage) {
  savePreferences({ suggestions: Boolean(value) }, storage);
}

export function readIncludeTerritories(storage) {
  try { return readPreferences(storage).includeTerritories === true; } catch { return false; }
}
export function saveIncludeTerritories(value, storage) { savePreferences({ includeTerritories: Boolean(value) }, storage); }
