import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { geoPath } from 'd3';
import { feature } from 'topojson-client';
import { createGame, gameReducer, makeQueue, matchesAnswer, normalizeAnswer, readScores, saveScore, scoreKey, readKeepCorrect, saveKeepCorrect } from '../src/lib/game.js';
import { focusGeometry, createFlatProjection } from '../src/lib/map.js';

const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
const topology = JSON.parse(readFileSync(new URL('../src/data/world.json', import.meta.url)));
const brazil = countries.find(c => c.iso3 === 'BRA');
const china = countries.find(c => c.iso3 === 'CHN');
const memoryStorage = initial => {
  let value = initial || '{}';
  return { getItem: () => value, setItem: (key, next) => { value = next; } };
};

test('country database has 200+ destinations, all required fields, geometry and local flags', () => {
  assert.ok(countries.length > 200);
  const ids = new Set(topology.objects.countries.geometries.map(f => f.id));
  assert.equal(new Set(countries.map(c => c.id)).size, countries.length);
  for (const country of countries) {
    assert.ok(ids.has(country.id), `Missing geometry: ${country.nome_pt}`);
    for (const field of ['id', 'nome_pt', 'nome_en', 'capital', 'continente', 'bandeira_url']) assert.ok(country[field]);
    assert.equal(country.coordenadas_centro.length, 2);
    assert.ok(country.coordenadas_centro.every(Number.isFinite));
    assert.equal(country.coordenadas_capital.length, 2);
    assert.ok(country.coordenadas_capital.every(Number.isFinite));
    assert.ok(Math.abs(country.coordenadas_capital[0]) <= 180);
    assert.ok(Math.abs(country.coordenadas_capital[1]) <= 90);
    assert.ok(existsSync(new URL(`../public${country.bandeira_url}`, import.meta.url)));
    assert.ok(matchesAnswer(country, 2, country.nome_pt));
    assert.ok(matchesAnswer(country, 2, country.nome_en));
    assert.ok(matchesAnswer(country, 4, country.capital));
  }
});

test('every mode visits ALL destinations of the selected region once, without a 15-question limit', () => {
  for (const region of ['mundo', 'africa', 'asia', 'europa', 'americas', 'oceania']) {
    const pool = countries.filter(c => region === 'mundo' || c.continente === region);
    for (const mode of [1, 2, 3, 4]) {
      const queue = makeQueue(pool, mode);
      assert.equal(queue.length, pool.length, `${region} / ${mode}`);
      assert.equal(new Set(queue.map(c => c.id)).size, pool.length);
      assert.deepEqual(new Set(queue.map(c => c.id)), new Set(pool.map(c => c.id)));
      assert.ok(queue.every(c => region === 'mundo' || c.continente === region));
    }
  }
});

test('capital-to-country also includes destinations with shared capital names', () => {
  const duplicate = [{ id: '1', capital: 'Kingston' }, { id: '2', capital: 'Kingston' }, { id: '3', capital: 'Brasília' }];
  assert.deepEqual(new Set(makeQueue(duplicate, 3).map(c => c.id)), new Set(['1', '2', '3']));
});

test('the queue is randomized, does not mutate the dataset and contains the complete world', () => {
  const original = countries.map(c => c.id);
  const first = makeQueue(countries, 1, () => 0.1).map(c => c.id);
  const second = makeQueue(countries, 1, () => 0.8).map(c => c.id);
  assert.notDeepEqual(first, original);
  assert.notDeepEqual(first, second);
  assert.deepEqual(countries.map(c => c.id), original);
  assert.equal(first.length, 230);
});

test('answers accept Portuguese, English, accents, punctuation and registered variants', () => {
  assert.equal(normalizeAnswer('  Brasília!  '), 'brasilia');
  assert.ok(matchesAnswer(brazil, 2, 'Brazil'));
  assert.ok(matchesAnswer(brazil, 2, ' BRASIL '));
  assert.ok(matchesAnswer(brazil, 4, 'brasilia'));
  assert.ok(matchesAnswer(china, 4, 'Beijing'));
  assert.ok(matchesAnswer(china, 4, 'Pequim'));
  assert.ok(!matchesAnswer(china, 4, 'Shanghai'));
  assert.ok(!matchesAnswer(brazil, 2, ''));
});

for (const mode of [2, 4]) {
  test(`typing mode ${mode}: Skip reveals an incorrect answer with zero points and no required input`, () => {
    let game = createGame({ mode, region: 'mundo', difficulty: 'normal', pool: countries.slice(0, 3) });
    const first = game.queue[0];
    game = gameReducer(game, { type: 'ANSWER', value: mode === 2 ? first.nome_pt : first.capital });
    game = gameReducer(game, { type: 'NEXT' });
    assert.equal(game.streak, 1);
    const target = game.queue[game.index];
    // A skip must stay incorrect even if a valid partial/complete answer is present.
    game = gameReducer(game, { type: 'SKIP', value: mode === 2 ? target.nome_pt : target.capital });
    assert.equal(game.score, 100);
    assert.equal(game.streak, 0);
    assert.equal(game.bestStreak, 1);
    assert.equal(game.answers.length, 2);
    assert.deepEqual(game.answers[1], { country: target, correct: false, skipped: true, value: '' });
    assert.ok(game.answers[1].country.nome_pt && game.answers[1].country.capital, 'correct answer is available for feedback');
    assert.equal(gameReducer(game, { type: 'SKIP' }), game, 'cannot skip the same question twice');
    assert.equal(gameReducer(game, { type: 'ANSWER', value: target.capital }), game, 'cannot submit after skipping');
    game = gameReducer(game, { type: 'NEXT' });
    assert.equal(game.index, 2);
    game = gameReducer(game, { type: 'SKIP' });
    assert.equal(game.answers.length, 3);
    game = gameReducer(game, { type: 'NEXT' });
    assert.equal(game.finished, true);
    assert.equal(game.score, 100);
    assert.equal(gameReducer(game, { type: 'SKIP' }), game);
  });
}

test('Skip is restricted to the two typing modes', () => {
  for (const mode of [1, 3]) {
    const game = createGame({ mode, region: 'mundo', difficulty: 'normal', pool: countries });
    assert.equal(gameReducer(game, { type: 'SKIP' }), game);
  }
});

for (const mode of [1, 2, 3, 4]) {
  test(`mode ${mode}: correct and incorrect answers, single attempt, progression and final score`, () => {
    let game = createGame({ mode, region: 'mundo', difficulty: 'normal', pool: countries });
    assert.equal(gameReducer(game, { type: 'NEXT' }), game, 'cannot skip an unanswered round');
    for (let i = 0; i < countries.length; i++) {
      const country = game.queue[i];
      const correct = i % 2 === 0;
      const value = correct ? ([1, 3].includes(mode) ? country.id : mode === 2 ? country.nome_en : country.capital) : 'wrong';
      game = gameReducer(game, { type: 'ANSWER', value });
      assert.equal(game.answers[i].correct, correct);
      const duplicate = gameReducer(game, { type: 'ANSWER', value });
      assert.equal(duplicate, game, 'double clicks / repeated Enter cannot score twice');
      game = gameReducer(game, { type: 'NEXT' });
      if (i < countries.length - 1) assert.equal(game.finished, false, `must not finish at destination ${i + 1}`);
    }
    assert.ok(game.finished);
    assert.equal(game.score, Math.ceil(countries.length / 2) * 100);
    assert.equal(game.answers.length, countries.length);
    assert.equal(gameReducer(game, { type: 'ANSWER', value: 'anything' }), game);
  });
}

test('high scores above 1,500 persist, retain improvements and distinguish visual help in all four modes', () => {
  const storage = memoryStorage();
  const game = { mode: 1, region: 'europa', difficulty: 'normal', score: 4900 };
  let { scores, persisted } = saveScore({}, game, storage);
  assert.ok(persisted);
  ({ scores } = saveScore(scores, { ...game, score: 200 }, storage));
  assert.equal(scores['1:europa:normal'], 4900);
  assert.equal(readScores(storage)['1:europa:normal'], 4900);
  ({ scores } = saveScore(scores, { ...game, difficulty: 'dificil', score: 300 }, storage));
  assert.equal(scores['1:europa:dificil'], 300);
  assert.equal(scores['1:europa:normal'], 4900);
  assert.notEqual(scoreKey(1, 'asia', 'normal'), scoreKey(1, 'europa', 'normal'));
  for (const mode of [1, 2, 3, 4]) assert.notEqual(scoreKey(mode, 'mundo', 'dificil'), scoreKey(mode, 'mundo', 'normal'));
  saveScore({}, { ...game, region: 'mundo', score: 23000 }, storage);
  assert.equal(readScores(storage)['1:mundo:normal'], 23000);
});

for (const mode of [1, 2, 3, 4]) {
  test(`mode ${mode}: changing the green setting preserves the current question, score and all previous answers`, () => {
    let game = createGame({ mode, region: 'mundo', difficulty: 'dificil', pool: countries });
    assert.equal(game.keepCorrect, false);
    const target = game.queue[0];
    const value = mode === 1 || mode === 3 ? target.id : mode === 2 ? target.nome_pt : target.capital;
    game = gameReducer(game, { type: 'ANSWER', value });
    const before = game;
    game = gameReducer(game, { type: 'SET_KEEP_CORRECT', value: true });
    assert.equal(game.keepCorrect, true);
    assert.equal(game.answers, before.answers);
    assert.equal(game.queue, before.queue);
    assert.equal(game.index, before.index);
    assert.equal(game.score, 100);
    game = gameReducer(game, { type: 'SET_KEEP_CORRECT', value: false });
    assert.equal(game.keepCorrect, false);
    assert.equal(game.answers[0].correct, true);
    assert.equal(game.difficulty, 'normal', 'visual hints cannot be relabeled as an unassisted record');
    game = gameReducer(game, { type: 'NEXT' });
    assert.equal(game.index, 1);
  });
}

test('green preference is saved and restored, including when browser storage is blocked', () => {
  const storage = memoryStorage();
  assert.equal(readKeepCorrect(storage), true);
  saveKeepCorrect(false, storage);
  assert.equal(readKeepCorrect(storage), false);
  saveKeepCorrect(true, storage);
  assert.equal(readKeepCorrect(storage), true);
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readKeepCorrect(blocked), true);
  assert.doesNotThrow(() => saveKeepCorrect(false, blocked));
});

test('full-region records use a separate storage namespace from legacy 15-question records', () => {
  const entries = new Map([['geoquest.highscores.v1', '{"1:mundo:normal":1500}']]);
  const storage = { getItem: key => entries.get(key), setItem: (key, value) => entries.set(key, value) };
  assert.deepEqual(readScores(storage), {});
  saveScore({}, { mode: 1, region: 'mundo', difficulty: 'normal', score: 23000 }, storage);
  assert.equal(readScores(storage)['1:mundo:normal'], 23000);
  assert.equal(entries.get('geoquest.highscores.v1'), '{"1:mundo:normal":1500}');
});

test('capital pins use city coordinates rather than country centers, including multi-capital countries', () => {
  assert.deepEqual(brazil.coordenadas_capital, [-47.92972, -15.77972]);
  assert.notDeepEqual(brazil.coordenadas_capital, brazil.coordenadas_centro);
  const pretoria = countries.find(c => c.iso3 === 'ZAF').coordenadas_capital;
  assert.ok(Math.abs(pretoria[0] - 28.19) < 0.05 && Math.abs(pretoria[1] + 25.75) < 0.05);
  const ciudad = countries.find(c => c.iso3 === 'GNQ').coordenadas_capital;
  assert.ok(Math.abs(ciudad[0] - 10.82) < 0.05 && Math.abs(ciudad[1] - 1.59) < 0.05);
  const coordinates = JSON.parse(readFileSync(new URL('../src/data/capital-coordinates.json', import.meta.url)));
  for (const country of countries) {
    assert.deepEqual(country.coordenadas_capital, coordinates[country.iso3].coordinates);
    assert.ok(coordinates[country.iso3].source.startsWith('https://www.geonames.org/'));
  }
});

test('blocked or malformed localStorage does not break the app', () => {
  assert.deepEqual(readScores(memoryStorage('{bad json')), {});
  assert.deepEqual(readScores(memoryStorage('null')), {});
  assert.deepEqual(readScores(memoryStorage('{"1:mundo:normal":"999","evil":1500}')), {});
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.deepEqual(readScores(blocked), {});
  const result = saveScore({}, { mode: 1, region: 'mundo', difficulty: 'normal', score: 100 }, blocked);
  assert.equal(result.persisted, false);
  assert.equal(result.scores['1:mundo:normal'], 100);
});

test('SVG geography produces finite paths and zoom bounds at mobile and desktop sizes', () => {
  const features = feature(topology, topology.objects.countries).features.filter(f => f.id !== '010');
  for (const [width, height] of [[375, 360], [768, 500], [1360, 600]]) {
    const projection = createFlatProjection(width, height);
    const path = geoPath(projection);
    for (const f of features) {
      assert.ok(path(f) && !path(f).includes('NaN'), `Invalid path ${f.id}`);
      assert.ok(path.bounds(f).flat().every(Number.isFinite));
    }
  }
});

test('automatic zoom focuses a finite main landmass for every destination including overseas territories', () => {
  const features = feature(topology, topology.objects.countries).features;
  const path = geoPath(createFlatProjection(1100, 590));
  for (const country of countries) {
    const geometry = focusGeometry(features.filter(f => f.id === country.id), country.coordenadas_centro);
    assert.ok(geometry, country.nome_pt);
    assert.ok(path.bounds(geometry).flat().every(Number.isFinite), country.nome_pt);
  }
  const france = countries.find(c => c.iso3 === 'FRA');
  const focus = focusGeometry(features.filter(f => f.id === france.id), france.coordenadas_centro);
  const [[x0], [x1]] = path.bounds(focus);
  assert.ok(x1 - x0 < 100, 'France must zoom to metropolitan France instead of distant overseas landmasses');
});
