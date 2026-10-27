import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoArea, geoContains, geoPath } from 'd3';
import { cleanCountryGeometry, cleanFlatFeatures } from '../src/lib/geometry.js';
import { createFlatProjection } from '../src/lib/map.js';

const topology = JSON.parse(readFileSync(new URL('../public/maps/countries-10m.json', import.meta.url)));
const raw = feature(topology, topology.objects.countries).features;
const coarseTopology = JSON.parse(readFileSync(new URL('../src/data/world.json', import.meta.url)));
const coarse = feature(coarseTopology, coarseTopology.objects.countries).features;
const clean = cleanFlatFeatures(raw, coarse);
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8);

test('Maldives cannot paint the rest of the world or hide continental countries', () => {
  const broken = raw.find(f => f.id === '462');
  const fixed = clean.find(f => f.id === '462');
  assert.ok(geoArea(broken) > 4 * Math.PI, 'exercise the actual bad source geometry');
  assert.ok(geoArea(fixed) > 0 && geoArea(fixed) < .00001);
  for (const point of [[-9.1, 38.7], [2.3, 48.8], [-47.9, -15.8], [-77, 39], [0, 0]]) assert.equal(geoContains(fixed, point), false);
  const projection = createFlatProjection(1360, 600);
  const path = geoPath(projection), period = projection.scale() * 2 * Math.PI;
  assert.ok(path.area(fixed) < period * period * .00001, 'a tiny island country must not fill the screen');
});

test('all cleaned exteriors have small spherical area, holes keep opposite winding and geometry stays finite', () => {
  const path = geoPath(createFlatProjection(1360, 600));
  for (const f of clean) {
    assert.ok(geoArea(f) >= 0 && geoArea(f) < Math.PI * 2, f.properties.name);
    for (const polygon of f.geometry.coordinates) {
      polygon.forEach((ring, index) => {
        const area = geoArea({ type: 'Polygon', coordinates: [ring] });
        assert.ok(index === 0 ? area < Math.PI * 2 : area > Math.PI * 2, f.properties.name);
        assert.deepEqual(ring[0], ring.at(-1));
      });
    }
    if (!f.geometry.coordinates.length) {
      assert.ok(geoArea(raw.find(original => original.id === f.id)) < 1e-13, `${f.properties.name}: only collapsed geometry can be empty`);
    } else assert.ok(path(f) && !/NaN|Infinity/.test(path(f)), f.properties.name);
  }
});

test('ring repair preserves valid countries and does not mutate the data or game IDs', () => {
  const source = raw.find(f => f.id === '620');
  const before = JSON.stringify(source);
  const fixed = cleanCountryGeometry(source);
  close(geoArea(source), geoArea(fixed));
  assert.equal(JSON.stringify(source), before);
  assert.equal(fixed.id, source.id);
  const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
  const ids = new Set(clean.map(f => f.id));
  for (const country of countries) {
    assert.ok(ids.has(country.id));
    assert.ok(geoArea(clean.find(f => f.id === country.id)) > 0, `${country.nome_pt}: retain every playable country`);
  }
});

test('collapsed rings are removed and a reversed exterior is repaired', () => {
  const base = { type: 'Feature', id: 'test', geometry: { type: 'Polygon', coordinates: [[[0,0],[0,1],[1,1],[1,0],[0,0]]] } };
  const fixed = cleanCountryGeometry(base);
  const reversed = cleanCountryGeometry({ ...base, geometry: { ...base.geometry, coordinates: [[...base.geometry.coordinates[0]].reverse()] } });
  close(geoArea(fixed), geoArea(reversed));
  const collapsed = cleanCountryGeometry({ ...base, geometry: { type: 'MultiPolygon', coordinates: [base.geometry.coordinates, [[[2,2],[2,2],[2,2],[2,2]]]] } });
  assert.equal(collapsed.geometry.coordinates.length, 1);
});


test('Vatican uses its valid fallback shape when high-detail quantization collapses it', () => {
  const fixed = clean.find(f => f.id === '336');
  assert.equal(fixed.id, '336');
  assert.ok(geoArea(fixed) > 0);
  close(geoArea(fixed), geoArea(coarse.find(f => f.id === '336')));
});
