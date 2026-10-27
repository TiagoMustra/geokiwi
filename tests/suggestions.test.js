import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getNameSuggestions, nextSuggestionIndex } from '../src/lib/suggestions.js';
import { matchesAnswer, readSuggestions, saveSuggestions, readTheme, saveTheme, readMapView, saveMapView, readKeepCorrect, saveKeepCorrect } from '../src/lib/game.js';
import { createFlatGraticule, createFlatProjection } from '../src/lib/map.js';
import { geoPath } from 'd3';
const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
const memory = () => { const map = new Map(); return { getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, value) }; };

test('completion narrows s → sa → santa luc, accepting accents and spacing', () => {
  for (const query of ['s', 'sa', 'santa luc']) {
    const suggestions = getNameSuggestions(countries, 2, query, 230);
    assert.ok(suggestions.length > 0);
    assert.ok(suggestions.some(item => item.label === 'Santa Lúcia'));
  }
  assert.deepEqual(getNameSuggestions(countries, 2, ' santa lúC '), getNameSuggestions(countries, 2, 'santa luc'));
  assert.ok(getNameSuggestions(countries, 2, 's', 230).length > getNameSuggestions(countries, 2, 'sa', 230).length);
  assert.equal(getNameSuggestions(countries, 2, 'santa luc')[0].value, 'Santa Lúcia');
  assert.equal(getNameSuggestions(countries, 2, '').length, 0);
  assert.equal(getNameSuggestions(countries, 2, '    ').length, 0);
});

test('completion respects the region, is target-independent and does not mutate shuffled queues', () => {
  const europe = countries.filter(c => c.continente === 'europa');
  const before = JSON.stringify(europe);
  const suggestions = getNameSuggestions(europe, 2, 's', 230);
  assert.ok(suggestions.length > 1);
  assert.ok(suggestions.every(item => europe.some(country => matchesAnswer(country, 2, item.value))));
  assert.deepEqual(getNameSuggestions(europe, 2, 's'), getNameSuggestions([...europe].reverse(), 2, 's'));
  assert.equal(JSON.stringify(europe), before);
  assert.ok(!suggestions.some(item => item.value === 'Santa Lúcia'));
  assert.equal(getNameSuggestions(countries, 1, 's').length, 0);
  assert.equal(getNameSuggestions(countries, 3, 's').length, 0);
});

test('suggested Portuguese, English and capital names are valid answers with no duplicate capitals or answer associations', () => {
  const english = getNameSuggestions(countries, 2, 'south', 230);
  assert.ok(english.some(item => item.value === 'South Africa'));
  for (const item of english) assert.ok(countries.some(country => matchesAnswer(country, 2, item.value)));
  const capitals = getNameSuggestions(countries, 4, 'king', 230);
  assert.ok(capitals.some(item => item.value === 'Kingston'));
  assert.equal(capitals.filter(item => item.value === 'Kingston').length, 1);
  for (const item of capitals) {
    assert.deepEqual(Object.keys(item).sort(), ['key', 'label', 'value']);
    assert.ok(countries.some(country => matchesAnswer(country, 4, item.value)));
  }
  assert.ok(getNameSuggestions(countries, 2, 's').length <= 6);
});

test('keyboard navigation wraps through suggestions without changing the typed answer', () => {
  assert.equal(nextSuggestionIndex(-1, 'ArrowDown', 4), 0);
  assert.equal(nextSuggestionIndex(-1, 'ArrowUp', 4), 3);
  assert.equal(nextSuggestionIndex(3, 'ArrowDown', 4), 0);
  assert.equal(nextSuggestionIndex(0, 'ArrowUp', 4), 3);
  assert.equal(nextSuggestionIndex(1, 'Escape', 4), 1);
  assert.equal(nextSuggestionIndex(0, 'ArrowDown', 0), -1);
});

test('suggestions can be toggled and persist independently of the map, green and theme preferences', () => {
  const storage = memory();
  assert.equal(readSuggestions(storage), true);
  saveTheme('light', storage); saveMapView('globe', storage); saveKeepCorrect(false, storage);
  saveSuggestions(false, storage);
  assert.equal(readSuggestions(storage), false);
  assert.equal(readTheme(storage), 'light'); assert.equal(readMapView(storage), 'globe'); assert.equal(readKeepCorrect(storage), false);
  saveTheme('dark', storage); saveMapView('flat', storage); saveKeepCorrect(true, storage);
  assert.equal(readSuggestions(storage), false);
  saveSuggestions(true, storage); assert.equal(readSuggestions(storage), true);
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readSuggestions(blocked), true);
  assert.doesNotThrow(() => saveSuggestions(false, blocked));
});

test('every grid meridian reaches the Mercator cap instead of stopping at 80°', () => {
  const grid = createFlatGraticule();
  const meridians = grid.coordinates.filter(line => line.every(point => Math.abs(point[0] - line[0][0]) < 1e-8));
  assert.ok(meridians.length >= 35);
  const atTen = meridians.find(line => Math.abs(line[0][0] - 10) < 1e-8);
  assert.ok(atTen);
  assert.ok(Math.min(...atTen.map(point => point[1])) < -85);
  assert.ok(Math.max(...atTen.map(point => point[1])) > 85);
  for (const [width, height] of [[375, 812], [1360, 900]]) {
    const projection = createFlatProjection(width, height);
    const top = geoPath(projection).bounds({ type: 'Sphere' })[0][1];
    assert.ok(Math.abs(projection(atTen.at(-1))[1] - top) < .001, 'minor lines reach the very top of the projected world');
    assert.ok(!/NaN|Infinity/.test(geoPath(projection)(grid)));
  }
});
