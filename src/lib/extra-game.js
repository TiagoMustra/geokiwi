import { geoDistance, geoContains } from 'd3';
export function capitalDistance(guess, capital) { return geoDistance(guess, capital) * 6371.0088; }
// 100 at the capital, around 82 at 100 km, and 14 at 1,000 km.
// A different country (or the sea) caps the award at 25 points.
export function capitalPoints(distance, inCountry = true) {
  const score = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-Math.max(0, distance) / 500))));
  return inCountry ? score : Math.min(25, score);
}
export function scoreCapitalGuess(distance, clickedCountryId, targetId) {
  const inCountry = clickedCountryId === targetId || (clickedCountryId == null && distance <= 5);
  return { inCountry, points: capitalPoints(distance, inCountry), correct: inCountry && distance <= 100 };
}

/** Retain the queue and guesses when migrating the old 5,000-point scale. */
export function migrateCapitalGame(saved, countries, features) {
  if (saved.scoringVersion === 2) return saved;
  const byId = Object.fromEntries(countries.map(country => [country.id, country]));
  const answers = saved.answers.map(answer => {
    const country = byId[answer.id];
    if (!country || !Array.isArray(answer.guess)) return answer;
    const distance = capitalDistance(answer.guess, country.coordenadas_capital);
    const inCountry = features.some(f => f.id === country.id && geoContains(f, answer.guess)) || distance <= 5;
    return { ...answer, distance, inCountry, points: capitalPoints(distance, inCountry), correct: inCountry && distance <= 100 };
  });
  return { ...saved, answers, score: answers.reduce((sum, answer) => sum + (answer.points || 0), 0), scoringVersion: 2 };
}
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

/** Preserve records from before the capital map stopped showing green countries. */
export function readCapitalRecord(scope, storage) {
  return Math.max(...['sem-verde','normal','dificil'].map(setting => readExtraRecord('capitais', `${scope}:${setting}:v2`, storage)));
}
