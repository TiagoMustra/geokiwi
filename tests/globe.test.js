import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoPath } from 'd3';
import { feature } from 'topojson-client';
import { clampGlobeZoom, createGlobeProjection, getGlobeCamera, globePointVisible, globeRadius, rotateGlobe, simplifyGlobeFeatures } from '../src/lib/globe.js';
import { readKeepCorrect, saveKeepCorrect, readMapView, saveMapView } from '../src/lib/game.js';

const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
const topology = JSON.parse(readFileSync(new URL('../src/data/world.json', import.meta.url)));
const features = feature(topology, topology.objects.countries).features.filter(f => f.id !== '010');
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
};

test('flat / globe choice persists without overwriting the independent green preference', () => {
  const memory = storage();
  assert.equal(readMapView(memory), 'flat');
  saveKeepCorrect(false, memory);
  saveMapView('globe', memory);
  assert.equal(readKeepCorrect(memory), false);
  assert.equal(readMapView(memory), 'globe');
  saveKeepCorrect(true, memory);
  assert.equal(readMapView(memory), 'globe');
  saveMapView('flat', memory);
  assert.equal(readKeepCorrect(memory), true);
  assert.equal(readMapView(memory), 'flat');
});

test('invalid or blocked browser storage safely defaults to the flat view', () => {
  for (const value of ['null', '[]', '{bad', '{"mapView":"anything"}']) assert.equal(readMapView({ getItem: () => value }), 'flat');
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readMapView(blocked), 'flat');
  assert.doesNotThrow(() => saveMapView('globe', blocked));
});

test('the globe clips the hidden hemisphere, including invisible capital and micro-country markers', () => {
  const projection = createGlobeProjection(1100, 590, { rotation: [0, 0, 0], zoom: 1 });
  assert.equal(globePointVisible([0, 0], projection), true);
  assert.equal(globePointVisible([180, 0], projection), false);
  assert.equal(globePointVisible([-180, 0], projection), false);
  assert.equal(globePointVisible([90, 0], projection), false);
  const hidden = { type: 'Polygon', coordinates: [[[170, -5], [170, 5], [175, 5], [175, -5], [170, -5]]] };
  assert.equal(geoPath(projection)(hidden), null);
  projection.rotate([-180, 0, 0]);
  assert.equal(globePointVisible([180, 0], projection), true);
  assert.ok(geoPath(projection)(hidden));
});

test('dragging rotates spherical coordinates through a full revolution with bounded latitude', () => {
  const radius = globeRadius(1100, 590);
  const start = { rotation: [0, 0, 0], zoom: 1 };
  const moved = rotateGlobe(start, Math.PI * radius / 2, 0, radius);
  assert.ok(Math.abs(moved.rotation[0] - 90) < 1e-8);
  const back = rotateGlobe(moved, Math.PI * radius * 1.5, 0, radius);
  assert.ok(Math.abs(back.rotation[0]) < 1e-8);
  assert.equal(rotateGlobe(start, 0, 100000, radius).rotation[1], -89.99);
  assert.equal(rotateGlobe(start, 0, -100000, radius).rotation[1], 89.99);
  assert.deepEqual(start.rotation, [0, 0, 0]);
  const close = rotateGlobe({ ...start, zoom: 10 }, 40, 0, radius);
  assert.ok(close.rotation[0] < rotateGlobe(start, 40, 0, radius).rotation[0]);
});

test('wheel / pinch and button zoom respect practical limits', () => {
  assert.equal(clampGlobeZoom(0), 0.8);
  assert.equal(clampGlobeZoom(1000), 120);
  assert.equal(clampGlobeZoom(2.4), 2.4);
});

test('click-mode starting cameras depend on region, never on the country answer', () => {
  for (const region of ['mundo', 'africa', 'asia', 'europa', 'americas', 'oceania']) {
    const options = { width: 1100, height: 590, region, typed: false, features };
    assert.deepEqual(getGlobeCamera({ ...options, target: countries[0] }), getGlobeCamera({ ...options, target: countries[100] }));
  }
});

test('all 230 capital targets face the player and project to the center on mobile and desktop', () => {
  for (const [width, height] of [[375, 300], [1100, 590]]) {
    for (const target of countries) {
      const camera = getGlobeCamera({ width, height, target, typed: true, showCapitalPin: true, features });
      const projection = createGlobeProjection(width, height, camera);
      assert.ok(globePointVisible(target.coordenadas_capital, projection), target.nome_pt);
      const [x, y] = projection(target.coordenadas_capital);
      assert.ok(Math.abs(x - width / 2) < 1e-6 && Math.abs(y - height / 2) < 1e-6, target.nome_pt);
      assert.ok(camera.zoom >= 1 && camera.zoom <= 100);
    }
  }
});

test('every country can be exposed on the globe and all rendered paths stay finite', () => {
  for (const target of countries) {
    const camera = getGlobeCamera({ width: 1100, height: 590, target, typed: true, features });
    const projection = createGlobeProjection(1100, 590, camera);
    const paths = features.filter(f => f.id === target.id).map(f => geoPath(projection)(f)).filter(Boolean);
    assert.ok(paths.length, `Country must be visible: ${target.nome_pt}`);
    assert.ok(paths.every(path => !path.includes('NaN')), target.nome_pt);
  }
});

test('motion geometry keeps every territory, polygon and valid closed ring', () => {
  const simplified = simplifyGlobeFeatures(features);
  assert.deepEqual(simplified.map(f => f.id), features.map(f => f.id));
  let fullPoints = 0, motionPoints = 0;
  for (let i = 0; i < features.length; i++) {
    const original = features[i].geometry;
    const next = simplified[i].geometry;
    const originalPolygons = original.type === 'MultiPolygon' ? original.coordinates : [original.coordinates];
    const nextPolygons = next.type === 'MultiPolygon' ? next.coordinates : [next.coordinates];
    assert.equal(nextPolygons.length, originalPolygons.length);
    originalPolygons.forEach((polygon, j) => {
      assert.equal(nextPolygons[j].length, polygon.length);
      polygon.forEach((ring, k) => {
        const reduced = nextPolygons[j][k];
        assert.ok(reduced.length >= 4);
        assert.deepEqual(reduced[0], reduced[reduced.length - 1]);
        fullPoints += ring.length; motionPoints += reduced.length;
      });
    });
  }
  assert.ok(motionPoints < fullPoints * 0.7, 'dragging should process substantially fewer coastline points');
});
