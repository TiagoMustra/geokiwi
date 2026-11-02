import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoArea, geoContains } from 'd3';
import { explorationPlaces } from '../src/data/exploration-places.js';

const countryIds = new Set(JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url))).map(country => country.id));
const polygon = coordinates => geoArea({ type: 'Polygon', coordinates }) > 2 * Math.PI ? coordinates.map(ring => [...ring].reverse()) : coordinates;
const normalise = geometry => geometry.type === 'Polygon' ? { ...geometry, coordinates: polygon(geometry.coordinates) } : geometry.type === 'MultiPolygon' ? { ...geometry, coordinates: geometry.coordinates.map(polygon) } : geometry;
const finiteCoordinates = coordinates => typeof coordinates[0] === 'number' ? coordinates.length === 2 && coordinates.every(Number.isFinite) && Math.abs(coordinates[0]) <= 180 && Math.abs(coordinates[1]) <= 90 : coordinates.length > 0 && coordinates.every(finiteCoordinates);

test('exploration has a worldwide bilingual catalogue with sourced points and complete natural-feature geometries', () => {
  assert.ok(explorationPlaces.length >= 80);
  assert.equal(new Set(explorationPlaces.map(place => place.id)).size, explorationPlaces.length);
  assert.deepEqual(new Set(explorationPlaces.map(place => place.type)), new Set(['city', 'peak', 'historic', 'lake', 'sea', 'bay', 'desert', 'mountain', 'river']));
  for (const place of explorationPlaces) {
    assert.ok(place.name_pt && place.name_en && place.description_pt && place.description_en, place.id);
    assert.ok(finiteCoordinates(place.coordinates), place.id);
    assert.ok(place.countryIds.every(id => countryIds.has(id)), place.id);
    assert.equal(new URL(place.source.url).protocol, 'https:', place.id);
    assert.ok(place.toleranceKm >= 0 && place.scoringScaleKm > 0, place.id);
    if (['lake', 'sea', 'bay', 'desert', 'mountain', 'river'].includes(place.type)) {
      assert.ok(place.geometry, `${place.id} must score the feature, not just its label point`);
      assert.ok(finiteCoordinates(place.geometry.coordinates), place.id);
      if (place.type === 'river') assert.ok(['LineString', 'MultiLineString'].includes(place.geometry.type));
      else {
        assert.ok(['Polygon', 'MultiPolygon'].includes(place.geometry.type));
        const geometry = normalise(place.geometry);
        assert.ok(geoArea(geometry) > 0 && geoArea(geometry) < 2 * Math.PI, place.id);
        assert.ok(geoContains(geometry, place.coordinates), `${place.id}: reveal reference must lie inside its area`);
        const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
        for (const rings of polygons) for (const ring of rings) {
          assert.ok(ring.length >= 4, place.id);
          assert.deepEqual(ring[0], ring.at(-1), `${place.id}: closed source ring`);
        }
      }
    }
  }
});

test('well-known area targets contain their real interiors and reject distant unrelated places', () => {
  for (const [id, inside, outside] of [
    ['sea-mediterranean', [18, 35], [2.35, 48.85]],
    ['lake-superior', [-87, 47.5], [-120, 40]],
    ['desert-sahara', [15, 23], [15, 50]],
  ]) {
    const geometry = normalise(explorationPlaces.find(place => place.id === id).geometry);
    assert.ok(geoContains(geometry, inside), id);
    assert.ok(!geoContains(geometry, outside), id);
  }
});
