import { geoArea, geoContains, geoDistance } from 'd3';
import { makeQueue } from './game.js';
import { capitalPoints } from './extra-game.js';

const EARTH_KM = 6371.0088;
const TAU = Math.PI * 2;
const normalizedGeometries = new WeakMap();
export const EXPLORER_ROUNDS = [10, 20, 30];
export const normalizeExplorerRounds = value => EXPLORER_ROUNDS.includes(Number(value)) ? Number(value) : 10;
export const explorerSaveKey = rounds => `geokiwi.explorer.run.v1:${normalizeExplorerRounds(rounds)}`;
const recordKey = rounds => `geokiwi.explorer.record.v1:${normalizeExplorerRounds(rounds)}`;
const finitePoint = point => Array.isArray(point) && point.length >= 2 && point.slice(0, 2).every(Number.isFinite) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90;

/** D3 uses opposite exterior winding to RFC7946. Preserve holes and small land/sea areas. */
export function normalizeExplorerGeometry(geometry) {
  if (!geometry || typeof geometry !== 'object') return null;
  if (normalizedGeometries.has(geometry)) return normalizedGeometries.get(geometry);
  let normalized;
  const polygon = rings => rings.map((ring, index) => {
    const points = ring.map(point => [...point]);
    const area = geoArea({ type: 'Polygon', coordinates: [points] });
    if ((index === 0 && area > TAU) || (index > 0 && area < TAU)) points.reverse();
    return points;
  });
  if (geometry.type === 'Feature') normalized = { ...geometry, geometry: normalizeExplorerGeometry(geometry.geometry) };
  else if (geometry.type === 'FeatureCollection') normalized = { ...geometry, features: geometry.features.map(normalizeExplorerGeometry) };
  else if (geometry.type === 'GeometryCollection') normalized = { ...geometry, geometries: geometry.geometries.map(normalizeExplorerGeometry) };
  else if (geometry.type === 'Polygon') normalized = { ...geometry, coordinates: polygon(geometry.coordinates) };
  else if (geometry.type === 'MultiPolygon') normalized = { ...geometry, coordinates: geometry.coordinates.map(polygon) };
  else normalized = geometry;
  normalizedGeometries.set(geometry, normalized);
  return normalized;
}
const radians = value => value * Math.PI / 180;
const vector = ([lon, lat]) => [Math.cos(radians(lat)) * Math.cos(radians(lon)), Math.cos(radians(lat)) * Math.sin(radians(lon)), Math.sin(radians(lat))];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => Math.hypot(...a);
const unit = a => { const length = norm(a); return length > 1e-12 ? a.map(value => value / length) : null; };
const angle = (a, b) => Math.atan2(norm(cross(a, b)), Math.max(-1, Math.min(1, dot(a, b))));
const coordinate = a => [Math.atan2(a[1], a[0]) * 180 / Math.PI, Math.asin(Math.max(-1, Math.min(1, a[2]))) * 180 / Math.PI];

/** Closest point on the shorter great-circle arc, including antimeridian crossings. */
export function nearestExplorerSegment(guess, start, end) {
  const p = vector(guess), a = vector(start), b = vector(end);
  let best = angle(p, a) <= angle(p, b) ? a : b;
  let bestAngle = angle(p, best);
  const normal = unit(cross(a, b));
  if (normal) {
    const projected = unit(p.map((value, index) => value - dot(p, normal) * normal[index]));
    if (projected) {
      const length = angle(a, b);
      for (const candidate of [projected, projected.map(value => -value)]) {
        if (angle(a, candidate) + angle(candidate, b) <= length + 1e-8) {
          const distance = angle(p, candidate);
          if (distance < bestAngle) { best = candidate; bestAngle = distance; }
        }
      }
    }
  }
  return { distance: bestAngle * EARTH_KM, coordinates: coordinate(best) };
}
function visitLines(geometry, visit, visitPoint) {
  if (!geometry) return;
  if (geometry.type === 'Feature') return visitLines(geometry.geometry, visit, visitPoint);
  if (geometry.type === 'FeatureCollection') return geometry.features.forEach(feature => visitLines(feature, visit, visitPoint));
  if (geometry.type === 'GeometryCollection') return geometry.geometries.forEach(item => visitLines(item, visit, visitPoint));
  if (geometry.type === 'Point') return visitPoint(geometry.coordinates);
  if (geometry.type === 'MultiPoint') return geometry.coordinates.forEach(visitPoint);
  if (geometry.type === 'LineString') return visit(geometry.coordinates);
  if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') return geometry.coordinates.forEach(visit);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.forEach(polygon => polygon.forEach(visit));
}
function containsArea(geometry, point) {
  if (!geometry) return false;
  if (geometry.type === 'Feature') return containsArea(geometry.geometry, point);
  if (geometry.type === 'FeatureCollection') return geometry.features.some(feature => containsArea(feature, point));
  if (geometry.type === 'GeometryCollection') return geometry.geometries.some(item => containsArea(item, point));
  return ['Polygon', 'MultiPolygon'].includes(geometry.type) && geoContains(geometry, point);
}
export function nearestExplorerPlace(guess, place) {
  if (!finitePoint(guess) || !finitePoint(place?.coordinates)) return null;
  const geometry = normalizeExplorerGeometry(place.geometry);
  if (containsArea(geometry, guess)) return { distance: 0, coordinates: [...guess], inside: true };
  let nearest = geometry ? { distance: Infinity, coordinates: null, inside: false } : { distance: geoDistance(guess, place.coordinates) * EARTH_KM, coordinates: [...place.coordinates], inside: false };
  const consider = candidate => { if (candidate.distance < nearest.distance) nearest = { ...candidate, inside: false }; };
  visitLines(geometry, line => {
    if (line.length === 1 && finitePoint(line[0])) consider({ distance: geoDistance(guess, line[0]) * EARTH_KM, coordinates: [...line[0]] });
    for (let i = 1; i < line.length; i++) if (finitePoint(line[i - 1]) && finitePoint(line[i])) consider(nearestExplorerSegment(guess, line[i - 1], line[i]));
  }, point => { if (finitePoint(point)) consider({ distance: geoDistance(guess, point) * EARTH_KM, coordinates: [...point] }); });
  return Number.isFinite(nearest.distance) ? nearest : { distance: geoDistance(guess, place.coordinates) * EARTH_KM, coordinates: [...place.coordinates], inside: false };
}
export function scoreExplorerGuess(guess, clickedCountryId, place) {
  const nearest = nearestExplorerPlace(guess, place);
  if (!nearest) return null;
  const tolerance = Math.max(0, Math.min(50, Number(place.toleranceKm) || 0));
  const distance = Math.max(0, nearest.distance - tolerance);
  const restricted = ['city', 'peak', 'historic'].includes(place.type) && place.countryIds?.length > 0;
  const inCountry = !restricted || place.countryIds.includes(clickedCountryId) || (clickedCountryId == null && nearest.distance <= 5);
  const decay = Number.isFinite(place.scoringScaleKm) && place.scoringScaleKm > 0 ? place.scoringScaleKm : 500;
  const points = decay === 500 ? capitalPoints(distance, inCountry) : Math.min(inCountry ? 100 : 25, Math.max(0, Math.round(100 * Math.exp(-distance / decay))));
  return { distance, rawDistance: nearest.distance, nearestCoordinates: nearest.coordinates, inside: nearest.inside, toleranceKm: tolerance, inCountry, restricted, points, correct: inCountry && distance <= 100 };
}

export function createExplorerGame({ places, rounds = 10, ids = null, practice = false, random = Math.random }) {
  const count = normalizeExplorerRounds(rounds);
  const available = [...new Set((ids || places.map(place => place.id)).filter(id => places.some(place => place.id === id)))];
  const queue = makeQueue(available, 8, random).slice(0, practice ? Math.min(available.length, count) : count);
  return { version: 1, rounds: count, id: globalThis.crypto?.randomUUID?.() || `explore-${Date.now()}`, startedAt: Date.now(), queue, index: 0, answers: [], score: 0, finished: false, practice };
}
export function answerExplorerGame(game, guess, clickedCountryId, places) {
  if (!game || game.finished || game.answers.length > game.index) return game;
  const place = places.find(item => item.id === game.queue[game.index]);
  const result = scoreExplorerGuess(guess, clickedCountryId, place);
  if (!result) return game;
  const answer = { id: place.id, guess: [...guess], clickedCountryId: clickedCountryId || null, ...result, skipped: false };
  return { ...game, score: game.score + result.points, answers: [...game.answers, answer] };
}
export function skipExplorerGame(game, places) {
  if (!game || game.finished || game.answers.length > game.index) return game;
  const place = places.find(item => item.id === game.queue[game.index]);
  if (!place) return game;
  return { ...game, answers: [...game.answers, { id: place.id, guess: null, clickedCountryId: null, distance: null, rawDistance: null, nearestCoordinates: nearestExplorerPlace(place.coordinates, place).coordinates, points: 0, correct: false, inCountry: false, skipped: true }] };
}
export function advanceExplorerGame(game) {
  if (!game || game.finished || game.answers.length <= game.index) return game;
  return game.index + 1 >= game.queue.length ? { ...game, finished: true } : { ...game, index: game.index + 1 };
}
function validSnapshot(saved, rounds) {
  return saved?.version === 1 && saved.rounds === normalizeExplorerRounds(rounds) && !saved.finished && Array.isArray(saved.queue) && saved.queue.length > 0 && saved.queue.length <= saved.rounds && (saved.practice || saved.queue.length === saved.rounds) && new Set(saved.queue).size === saved.queue.length && saved.queue.every(id => typeof id === 'string') && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < saved.queue.length && Array.isArray(saved.answers) && [saved.index, saved.index + 1].includes(saved.answers.length);
}
export function restoreExplorerGame(saved, places, rounds = saved?.rounds) {
  if (!validSnapshot(saved, rounds)) return null;
  const ids = new Set(places.map(place => place.id));
  if (!saved.queue.every(id => ids.has(id))) return null;
  let game = { ...saved, score: 0, answers: [] };
  for (let i = 0; i < saved.answers.length; i++) {
    const answer = saved.answers[i];
    if (answer?.id !== saved.queue[i] || (!answer.skipped && !finitePoint(answer.guess))) return null;
    game.index = i;
    game = answer.skipped ? skipExplorerGame(game, places) : answerExplorerGame(game, answer.guess, answer.clickedCountryId, places);
  }
  return { ...game, index: saved.index };
}
export function readExplorerSave(rounds = 10, storage) {
  try { const saved = JSON.parse((storage ?? globalThis.localStorage).getItem(explorerSaveKey(rounds)) || 'null'); return validSnapshot(saved, rounds) ? saved : null; } catch { return null; }
}
export function writeExplorerSave(game, storage) {
  try { (storage ?? globalThis.localStorage).setItem(explorerSaveKey(game.rounds), JSON.stringify(game)); return true; } catch { return false; }
}
export function clearExplorerSave(rounds = 10, storage) { try { (storage ?? globalThis.localStorage).removeItem(explorerSaveKey(rounds)); } catch {} }
export function readExplorerRecord(rounds = 10, storage) { try { const score = Number((storage ?? globalThis.localStorage).getItem(recordKey(rounds))); return Number.isFinite(score) && score >= 0 && score <= normalizeExplorerRounds(rounds) * 100 ? score : 0; } catch { return 0; } }
export function saveExplorerRecord(rounds, score, storage) {
  try { (storage ?? globalThis.localStorage).setItem(recordKey(rounds), String(Math.max(readExplorerRecord(rounds, storage), Math.max(0, Math.min(normalizeExplorerRounds(rounds) * 100, score))))); } catch {}
}
