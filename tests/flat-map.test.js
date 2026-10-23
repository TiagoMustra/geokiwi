import test from 'node:test';
import assert from 'node:assert/strict';
import { geoPath } from 'd3';
import { readFileSync } from 'node:fs';
import { createFlatProjection } from '../src/lib/map.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 0.00001, `${a} should equal ${b}`);

test('the flat world is a complete 2:1 rectangle with straight meridians and parallels', () => {
  for (const [width, height] of [[375, 360], [768, 500], [1360, 600]]) {
    for (const region of ['mundo', 'europa', 'africa', 'asia', 'americas', 'oceania']) {
      const projection = createFlatProjection(width, height, region);
      const [[left, top], [right, bottom]] = geoPath(projection).bounds({ type: 'Sphere' });
      close((right - left) / (bottom - top), 2);
      assert.ok(left >= 19.99 && right <= width - 19.99 && top >= 29.99 && bottom <= height - 29.99);
      for (const longitude of [-160, -60, 0, 60, 160]) {
        const x = projection([longitude, 0])[0];
        for (const latitude of [-89, -70, -30, 30, 70, 89]) close(projection([longitude, latitude])[0], x);
      }
      for (const latitude of [-89, -70, 0, 70, 89]) {
        const y = projection([0, latitude])[1];
        for (const longitude of [-179, -90, 90, 179]) close(projection([longitude, latitude])[1], y);
      }
    }
  }
});

test('every capital projects inside the rectangular world, also with Pacific and American centering', () => {
  const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
  for (const region of ['mundo', 'americas', 'oceania']) {
    const projection = createFlatProjection(1100, 590, region);
    const [[left, top], [right, bottom]] = geoPath(projection).bounds({ type: 'Sphere' });
    for (const country of countries) {
      const [x, y] = projection(country.coordenadas_capital);
      assert.ok(Number.isFinite(x) && Number.isFinite(y), country.nome_pt);
      assert.ok(x >= left && x <= right && y >= top && y <= bottom, country.nome_pt);
    }
  }
});
