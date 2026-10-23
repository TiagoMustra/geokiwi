/** Rules shared by all four game modes. No UI or network dependencies. */
export const ROUND_LENGTH = 15;
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
  // A capital shared by two destinations must not produce an ambiguous prompt.
  const capitalCounts = new Map();
  pool.forEach(country => {
    const key = normalizeAnswer(country.capital);
    capitalCounts.set(key, (capitalCounts.get(key) ?? 0) + 1);
  });
  const eligible = pool.filter(country => mode !== 3 || capitalCounts.get(normalizeAnswer(country.capital)) === 1);
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, ROUND_LENGTH);
}

export function createGame({ mode, region, difficulty, pool, random }) {
  return { mode, region, difficulty, queue: makeQueue(pool, mode, random), index: 0, answers: [], score: 0, streak: 0, bestStreak: 0, finished: false };
}

export function gameReducer(state, action) {
  if (action.type === 'ANSWER') {
    if (state.finished || state.answers.length > state.index) return state;
    const correct = state.mode === 1 || state.mode === 3
      ? action.value === state.queue[state.index].id
      : matchesAnswer(state.queue[state.index], state.mode, action.value);
    const streak = correct ? state.streak + 1 : 0;
    return { ...state, score: state.score + (correct ? POINTS : 0), streak, bestStreak: Math.max(streak, state.bestStreak), answers: [...state.answers, { country: state.queue[state.index], correct, value: action.value }] };
  }
  if (action.type === 'NEXT') {
    if (state.answers.length <= state.index || state.finished) return state;
    if (state.index + 1 === state.queue.length) return { ...state, finished: true };
    return { ...state, index: state.index + 1 };
  }
  return state;
}

export function scoreKey(mode, region, difficulty) {
  return `${mode}:${region}:${mode === 1 || mode === 3 ? difficulty : 'normal'}`;
}

const STORAGE_KEY = 'geoquest.highscores.v1';
export function readScores(storage) {
  try {
    storage ??= globalThis.localStorage;
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([key, value]) => /^[1-4]:(mundo|africa|asia|europa|americas|oceania):(normal|dificil)$/.test(key) && Number.isFinite(value) && value >= 0 && value <= ROUND_LENGTH * POINTS));
  } catch { return {}; }
}

export function saveScore(scores, game, storage) {
  const key = scoreKey(game.mode, game.region, game.difficulty);
  const updated = { ...scores, [key]: Math.max(scores[key] || 0, game.score) };
  let persisted = true;
  try { (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { persisted = false; }
  return { scores: updated, persisted };
}
