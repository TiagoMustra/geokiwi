export const CONTINENTS = ['africa', 'asia', 'europa', 'americas', 'oceania'];
export function regionIncludes(region, continent) { return region === 'mundo' || region.split('+').includes(continent); }
export function toggleRegion(region, next) {
  const chosen = region === 'mundo' ? [] : region.split('+');
  const result = chosen.includes(next) ? chosen.filter(x => x !== next) : [...chosen, next];
  return result.length ? CONTINENTS.filter(x => result.includes(x)).join('+') : 'mundo';
}
export function validRegion(region) {
  return region === 'mundo' || (typeof region === 'string' && region.length > 0 && region === CONTINENTS.filter(x => region.split('+').includes(x)).join('+'));
}
