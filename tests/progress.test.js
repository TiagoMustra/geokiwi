import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGame, gameReducer, feedbackDuration } from '../src/lib/game.js';
import { ACTIVITY_KEY, emptyActivity, checkpoint, readActivity, writeActivity, restoreGame, saveKey, summarizeStats } from '../src/lib/activity.js';
import { getRegionTransform, createFlatProjection } from '../src/lib/map.js';
import { getGlobeCamera } from '../src/lib/globe.js';
const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
const pool = region => countries.filter(c => region === 'mundo' || c.continente === region);
const make = (mode = 1, region = 'europa') => createGame({ mode, region, difficulty: 'dificil', includeTerritories: true, pool: pool(region), random: () => .4 });
const storage = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) }; };
function respond(game, correct = true) {
  const target = game.queue[game.index];
  return gameReducer(game, { type: correct ? 'ANSWER' : game.mode === 2 || game.mode === 4 ? 'SKIP' : 'ANSWER', value: correct ? [1, 3].includes(game.mode) ? target.id : game.mode === 2 ? target.nome_pt : target.capital : 'wrong' });
}

test('each mode resumes the same full shuffled queue, feedback, score and green preference', () => {
  for (const mode of [1, 2, 3, 4]) {
    let game = respond(make(mode));
    game = gameReducer(game, { type: 'NEXT' });
    game = respond(game, false);
    game = gameReducer(game, { type: 'SET_KEEP_CORRECT', value: true });
    const activity = checkpoint(emptyActivity(), game, 12345);
    const saved = activity.saves[saveKey(mode, 'europa', true)];
    const restored = restoreGame(saved, countries);
    assert.deepEqual(restored, game);
    assert.equal(saved.updatedAt, 12345);
    assert.equal(restored.answers.length, 2);
    assert.equal(restored.index, 1, 'pending feedback is not silently skipped');
    assert.equal(restored.score, 100);
    assert.equal(restored.keepCorrect, true);
    assert.equal(restored.difficulty, 'normal');
    const next = gameReducer(restored, { type: 'NEXT' });
    assert.equal(next.index, 2);
    assert.equal(next.queue[2].id, game.queue[2].id);
  }
});

test('autosave and statistics survive reload atomically; replayed checkpoints never count an answer twice', () => {
  const memory = storage();
  const game = respond(make());
  let activity = checkpoint(emptyActivity(), game);
  activity = checkpoint(activity, game);
  assert.equal(summarizeStats(activity, countries).attempts, 1);
  assert.equal(writeActivity(activity, memory), true);
  activity = readActivity(countries, memory);
  const restored = restoreGame(activity.saves['1:europa:territorios'], countries);
  activity = checkpoint(activity, restored);
  assert.equal(summarizeStats(activity, countries).attempts, 1);
  assert.equal(summarizeStats(activity, countries).correct, 1);
  assert.equal(activity.saves['1:europa:territorios'].answers.length, 1);
});

test('one saved run per game and region; a new run replaces only its own save and retains past statistics', () => {
  let activity = emptyActivity();
  for (const [mode, region] of [[1, 'europa'], [4, 'europa'], [1, 'asia']]) activity = checkpoint(activity, respond(make(mode, region)));
  assert.equal(Object.keys(activity.saves).length, 3);
  assert.equal(summarizeStats(activity, countries).attempts, 3);
  const fresh = make();
  activity = checkpoint(activity, fresh);
  assert.equal(activity.saves['1:europa:territorios'].id, fresh.id);
  assert.equal(activity.saves['1:europa:territorios'].answers.length, 0);
  assert.equal(Object.keys(activity.saves).length, 3);
  assert.equal(summarizeStats(activity, countries).attempts, 3);
});

test('complete runs remove the resume card and count the final answer and completion exactly once', () => {
  let game = make(4, 'oceania');
  let activity = checkpoint(emptyActivity(), game);
  for (let i = 0; i < game.queue.length; i++) {
    game = respond(game, i % 2 === 0);
    activity = checkpoint(activity, game);
    if (i === game.queue.length - 1) {
      const memory = storage(); writeActivity(activity, memory);
      activity = readActivity(countries, memory);
      game = restoreGame(activity.saves['4:oceania:territorios'], countries);
    }
    game = gameReducer(game, { type: 'NEXT' });
    activity = checkpoint(activity, game);
  }
  activity = checkpoint(activity, game);
  assert.equal(game.finished, true);
  assert.equal(activity.completed, 1);
  assert.equal(activity.saves['4:oceania:territorios'], undefined);
  assert.equal(summarizeStats(activity, countries).attempts, game.queue.length);
});

test('country and capital metrics separate correctly; skipped capitals are errors for the target country', () => {
  const countryGame = respond(make(1));
  const capitalGame = respond(make(4), false);
  let activity = checkpoint(emptyActivity(), countryGame);
  activity = checkpoint(activity, capitalGame);
  const all = summarizeStats(activity, countries);
  const geography = summarizeStats(activity, countries, 'countries');
  const capitals = summarizeStats(activity, countries, 'capitals');
  assert.equal(all.attempts, 2); assert.equal(all.correct, 1); assert.equal(all.skips, 1);
  assert.equal(geography.attempts, 1); assert.equal(geography.correct, 1);
  assert.equal(capitals.attempts, 1); assert.equal(capitals.correct, 0); assert.equal(capitals.skips, 1);
  assert.equal(capitals.weakest[0].country.id, capitalGame.queue[0].id);
  assert.equal(capitals.continents.find(c => c.id === 'europa').accuracy, 0);
  assert.equal(capitals.continents.find(c => c.id === 'asia').accuracy, null);
  assert.equal(summarizeStats(activity, countries, '2').attempts, 0);
});

test('corrupt or incompatible saves are ignored; score is recomputed from verified answers', () => {
  const memory = storage();
  const game = respond(make());
  const good = checkpoint(emptyActivity(), game).saves['1:europa:territorios'];
  for (const patch of [{ queue: ['bad'] }, { index: 10000 }, { mode: 8 }, { answers: [{ id: 'bad', value: 'bad' }] }, { queue: good.queue.map(() => good.queue[0]) }]) assert.equal(restoreGame({ ...good, ...patch }, countries), null);
  assert.equal(restoreGame({ ...good, score: 999999 }, countries).score, 100);
  memory.setItem(ACTIVITY_KEY, '{broken'); assert.deepEqual(readActivity(countries, memory), emptyActivity());
  memory.setItem(ACTIVITY_KEY, JSON.stringify({ version: 1, saves: { '1:europa:territorios': { ...good, queue: ['bad'] } }, stats: { '1:000': { attempts: 1, correct: 1, skips: 0 } } }));
  assert.deepEqual(readActivity(countries, memory), emptyActivity());
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('quota'); } };
  assert.deepEqual(readActivity(countries, blocked), emptyActivity());
  assert.equal(writeActivity(checkpoint(emptyActivity(), game), blocked), false);
});

test('European framing fills the map without Russia or overseas France forcing a global zoom', () => {
  for (const [width, height] of [[375, 360], [1360, 600]]) {
    const projection = createFlatProjection(width, height, 'europa');
    const transform = getRegionTransform('europa', projection, width, height);
    assert.ok(transform.k > 1.5, 'Europe starts zoomed in');
    for (const point of [[-9, 39], [2, 47], [25, 60], [-19, 65], [33, 35]]) {
      const [x, y] = transform.apply(projection(point));
      assert.ok(x >= 0 && x <= width && y >= 0 && y <= height, `${point} fits ${width}x${height}`);
    }
    const guiana = transform.apply(projection([-53, 4]));
    assert.ok(guiana[0] < 0 || guiana[1] > height);
    for (const region of ['africa', 'asia', 'americas', 'oceania']) {
      const p = createFlatProjection(width, height, region);
      const t = getRegionTransform(region, p, width, height);
      assert.ok([t.k, t.x, t.y].every(Number.isFinite));
    }
  }
});

test('automatic feedback is brief for successes, readable for errors and pauses are a UI choice', () => {
  assert.equal(feedbackDuration({ correct: true }), 850);
  assert.equal(feedbackDuration({ correct: false }), 2300);
  assert.equal(feedbackDuration({ correct: false, skipped: true }), 2300);
  const game = respond(make());
  assert.equal(gameReducer(game, { type: 'NEXT' }).index, 1);
  assert.equal(gameReducer(gameReducer(game, { type: 'NEXT' }), { type: 'NEXT' }).index, 1, 'a repeated timer cannot skip an unanswered question');
  assert.ok(getGlobeCamera({ width: 1360, height: 600, region: 'europa' }).zoom > 1);
});
