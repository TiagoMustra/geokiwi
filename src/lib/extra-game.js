import { geoDistance } from 'd3';
export function capitalDistance(guess, capital) { return geoDistance(guess, capital) * 6371.0088; }
export function capitalPoints(distance) { return Math.round(5000 * Math.exp(-Math.max(0, distance) / 2000)); }
export function extraKey(kind, region = 'mundo') { return `geokiwi.extra.v1:${kind}:${region}`; }
export function readExtra(kind, region = 'mundo', storage) {
  try { const value = JSON.parse((storage ?? globalThis.localStorage).getItem(extraKey(kind, region)) || 'null'); return value && Array.isArray(value.queue) && Array.isArray(value.answers) ? value : null; } catch { return null; }
}
export function writeExtra(kind, region, game, storage) {
  try { (storage ?? globalThis.localStorage).setItem(extraKey(kind, region), JSON.stringify(game)); return true; } catch { return false; }
}
export function removeExtra(kind, region, storage) { try { (storage ?? globalThis.localStorage).removeItem(extraKey(kind, region)); } catch {} }

export function readExtraRecord(kind, scope, storage) { try { return Number((storage ?? globalThis.localStorage).getItem(`geokiwi.extra.record:${kind}:${scope}`)) || 0; } catch { return 0; } }
export function saveExtraRecord(kind, scope, score, storage) { try { (storage ?? globalThis.localStorage).setItem(`geokiwi.extra.record:${kind}:${scope}`, String(Math.max(readExtraRecord(kind,scope,storage),score))); } catch {} }
