import { capitalName } from '../i18n/locale.js';
import { normalizeAnswer } from './game.js';

/** Prefix completion only: never inspect the target or prioritize its answer. */
export function getNameSuggestions(pool, mode, query, limit = 6, locale = 'pt') {
  const prefix = normalizeAnswer(query.trim());
  if (!prefix || ![2, 4].includes(mode)) return [];
  const found = new Map();
  for (const country of pool) {
    const names = mode === 4 ? [capitalName(country, locale), country.capital, ...country.capitais_aceitas] : locale === 'en' ? [country.nome_en, country.nome_pt] : [country.nome_pt, country.nome_en];
    for (let index = 0; index < names.length; index++) {
      const name = names[index];
      if (!name || !normalizeAnswer(name).startsWith(prefix)) continue;
      const key = mode === 4 ? normalizeAnswer(name) : country.id;
      const candidate = { key, value: name, label: name, priority: index === 0 ? 0 : 1 };
      const previous = found.get(key);
      if (!previous || candidate.priority < previous.priority) found.set(key, candidate);
      if (mode === 2) break;
    }
  }
  return [...found.values()].sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label, locale, { sensitivity: 'base' }))
    .slice(0, limit).map(({ priority, ...item }) => item);
}

export function nextSuggestionIndex(index, key, count) {
  if (!count) return -1;
  if (key === 'ArrowDown') return (index + 1) % count;
  if (key === 'ArrowUp') return index <= 0 ? count - 1 : index - 1;
  return index;
}
