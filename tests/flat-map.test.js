import test from 'node:test';
import assert from 'node:assert/strict';
import { geoPath, zoom, zoomIdentity } from 'd3';
import { feature } from 'topojson-client';
import { readFileSync } from 'node:fs';
import { createFlatProjection, getWorldCopies, microCountryFeatures } from '../src/lib/map.js';
import { mapPoliticalFeature } from '../src/lib/catalog.js';

test('small-country markers do not add a second marker for a large parent country', () => {
  const topology = JSON.parse(readFileSync(new URL('../src/data/world.json', import.meta.url)));
  const extra = JSON.parse(readFileSync(new URL('../src/data/extra-geometries.json', import.meta.url)));
  const land = [...feature(topology, topology.objects.countries).features, ...extra].map((item,index) => mapPoliticalFeature({...item,id:item.id?String(item.id).padStart(3,'0'):`unmapped-${index}`}));
  const ids = microCountryFeatures(land).map(item => item.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(!ids.includes('036'), 'Australian island parts must not add a marker in central Australia');
  for (const id of ['336','492','674','798']) assert.ok(ids.includes(id), id);
});

const close = (a, b) => assert.ok(Math.abs(a - b) < 0.00001, `${a} should equal ${b}`);

test('the flat world uses Mercator proportions with straight meridians and parallels', () => {
  for (const [width, height] of [[375, 360], [768, 500], [1360, 600]]) {
    for (const region of ['mundo', 'europa', 'africa', 'asia', 'americas', 'oceania']) {
      const projection = createFlatProjection(width, height, region);
      const [[left, top], [right, bottom]] = geoPath(projection).bounds({ type: 'Sphere' });
      close((right - left) / (bottom - top), 1);
      const equatorStep = projection([0, 0])[1] - projection([0, 1])[1];
      const longitudeStep = projection([1, 0])[0] - projection([0, 0])[0];
      assert.ok(Math.abs(equatorStep / longitudeStep - 1) < .001, 'equal horizontal/vertical local scale, no stretched rectangle');
      for (const longitude of [-160, -60, 0, 60, 160]) {
        const x = projection([longitude, 0])[0];
        for (const latitude of [-84, -70, -30, 30, 70, 84]) close(projection([longitude, latitude])[0], x);
      }
      for (const latitude of [-84, -70, 0, 70, 84]) {
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


test('horizontal wrapping covers the entire viewport after unlimited pan and zoom, without blank edges', () => {
  for (const [width, height] of [[375, 360], [1360, 400], [2560, 600]]) {
    const projection = createFlatProjection(width, height);
    const period = 2 * Math.PI * projection.scale();
    const left = projection.translate()[0] - period / 2;
    for (const k of [.8, 1, 2, 75, 120]) {
      for (const direction of [-1, 1]) {
        for (const turns of [0, 1, 20, 10000]) {
          let transform = zoomIdentity.translate(direction * turns * period * k + 17, 0).scale(k);
          const originalX = transform.x;
          const cy = projection.translate()[1];
          transform = zoom().constrain()(transform, [[0, 0], [width, height]], [[-Infinity, cy - period / 2], [Infinity, cy + period / 2]]);
          close(transform.x, originalX);
          assert.ok([transform.x, transform.y, transform.k].every(Number.isFinite));
          const copies = getWorldCopies(transform, projection, width);
          assert.ok(transform.applyX(left + copies.first * period) <= 0);
          assert.ok(transform.applyX(left + (copies.last + 1) * period) >= width);
          assert.ok(copies.primary >= copies.first && copies.primary <= copies.last);
          assert.ok(copies.last - copies.first + 1 <= Math.ceil(width / (period * k)) + 4, 'render only nearby worlds');
          close(transform.applyX(left + period), transform.applyX(left) + period * k);
        }
      }
    }
  }
});

test('high-detail geometry includes every playable ID and stays finite across world seams', () => {
  const topology = JSON.parse(readFileSync(new URL('../public/maps/countries-10m.json', import.meta.url)));
  const coarse = JSON.parse(readFileSync(new URL('../src/data/world.json', import.meta.url)));
  const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
  const land = feature(topology, topology.objects.countries).features;
  const ids = new Set(land.map(f => f.id));
  for (const country of countries) assert.ok(ids.has(country.id), country.nome_pt);
  assert.ok(topology.arcs.flat().length > coarse.arcs.flat().length * 3, 'retain finer coastal detail');
  for (const region of ['mundo', 'americas', 'oceania']) {
    const path = geoPath(createFlatProjection(1360, 600, region));
    for (const f of land) {
      const d = path(f);
      assert.ok(d && !/NaN|Infinity/.test(d), f.properties.name);
      assert.ok(path.bounds(f).flat().every(Number.isFinite), f.properties.name);
    }
  }
});

test('detailed map loading retries failures, caches successful data and preserves country IDs', async () => {
  const { loadDetailedWorld } = await import('../src/lib/flat-detail.js');
  const originalFetch = globalThis.fetch;
  let requests = 0;
  try {
    globalThis.fetch = async () => { requests++; return { ok: false }; };
    await assert.rejects(loadDetailedWorld());
    const topology = JSON.parse(readFileSync(new URL('../public/maps/countries-10m.json', import.meta.url)));
    globalThis.fetch = async url => { requests++; assert.equal(url, '/maps/countries-10m.json'); return { ok: true, json: async () => topology }; };
    const first = loadDetailedWorld(), second = loadDetailedWorld();
    assert.equal(first, second, 'one download for simultaneous map instances');
    const land = await first;
    assert.equal(await loadDetailedWorld(), land, 'reuse detail when switching views');
    assert.equal(requests, 2);
    assert.ok(land.some(f => f.id === '383'), 'Kosovo keeps its playable ID');
    assert.equal(new Set(land.map(f => f.key)).size, land.length);
  } finally { globalThis.fetch = originalFetch; }
});
