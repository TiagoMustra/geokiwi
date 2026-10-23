import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { geoNaturalEarth1, geoPath } from 'd3';
import { feature } from 'topojson-client';
import { createGame, gameReducer, makeQueue, matchesAnswer, normalizeAnswer, readScores, saveScore, scoreKey } from '../src/lib/game.js';
import { focusGeometry } from '../src/lib/map.js';

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
    assert.ok(existsSync(new URL(`../public${country.bandeira_url}`, import.meta.url)));
    assert.ok(matchesAnswer(country, 2, country.nome_pt));
    assert.ok(matchesAnswer(country, 2, country.nome_en));
    assert.ok(matchesAnswer(country, 4, country.capital));
  }
});

test('every continent has enough destinations for 15 distinct questions in all modes', () => {
  for (const region of ['mundo', 'africa', 'asia', 'europa', 'americas', 'oceania']) {
    const pool = countries.filter(c => region === 'mundo' || c.continente === region);
    for (const mode of [1, 2, 3, 4]) {
      const queue = makeQueue(pool, mode);
      assert.equal(queue.length, 15, `${region} / ${mode}`);
      assert.equal(new Set(queue.map(c => c.id)).size, 15);
      assert.ok(queue.every(c => region === 'mundo' || c.continente === region));
    }
  }
});

test('capital-to-country removes ambiguous prompts', () => {
  const duplicate = [{ id: '1', capital: 'Kingston' }, { id: '2', capital: 'Kingston' }, { id: '3', capital: 'Brasília' }];
  assert.deepEqual(makeQueue(duplicate, 3).map(c => c.id), ['3']);
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

for (const mode of [1, 2, 3, 4]) {
  test(`mode ${mode}: correct and incorrect answers, single attempt, progression and final score`, () => {
    let game = createGame({ mode, region: 'mundo', difficulty: 'normal', pool: countries });
    assert.equal(gameReducer(game, { type: 'NEXT' }), game, 'cannot skip an unanswered round');
    for (let i = 0; i < 15; i++) {
      const country = game.queue[i];
      const correct = i % 2 === 0;
      const value = correct ? ([1, 3].includes(mode) ? country.id : mode === 2 ? country.nome_en : country.capital) : 'wrong';
      game = gameReducer(game, { type: 'ANSWER', value });
      assert.equal(game.answers[i].correct, correct);
      const duplicate = gameReducer(game, { type: 'ANSWER', value });
      assert.equal(duplicate, game, 'double clicks / repeated Enter cannot score twice');
      game = gameReducer(game, { type: 'NEXT' });
    }
    assert.ok(game.finished);
    assert.equal(game.score, 800);
    assert.equal(game.answers.length, 15);
    assert.equal(gameReducer(game, { type: 'ANSWER', value: 'anything' }), game);
  });
}

test('high scores persist only improvements and are isolated by mode, region and applicable difficulty', () => {
  const storage = memoryStorage();
  const game = { mode: 1, region: 'europa', difficulty: 'normal', score: 900 };
  let { scores, persisted } = saveScore({}, game, storage);
  assert.ok(persisted);
  ({ scores } = saveScore(scores, { ...game, score: 200 }, storage));
  assert.equal(scores['1:europa:normal'], 900);
  assert.equal(readScores(storage)['1:europa:normal'], 900);
  ({ scores } = saveScore(scores, { ...game, difficulty: 'dificil', score: 300 }, storage));
  assert.equal(scores['1:europa:dificil'], 300);
  assert.equal(scores['1:europa:normal'], 900);
  assert.notEqual(scoreKey(1, 'asia', 'normal'), scoreKey(1, 'europa', 'normal'));
  assert.equal(scoreKey(2, 'mundo', 'dificil'), scoreKey(2, 'mundo', 'normal'));
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
    const projection = geoNaturalEarth1().fitExtent([[20, 30], [width - 20, height - 30]], { type: 'FeatureCollection', features });
    const path = geoPath(projection);
    for (const f of features) {
      assert.ok(path(f) && !path(f).includes('NaN'), `Invalid path ${f.id}`);
      assert.ok(path.bounds(f).flat().every(Number.isFinite));
    }
  }
});

test('automatic zoom focuses a finite main landmass for every destination including overseas territories', () => {
  const features = feature(topology, topology.objects.countries).features;
  const path = geoPath(geoNaturalEarth1());
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
