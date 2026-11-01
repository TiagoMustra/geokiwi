import { english } from './catalog.js';
import { countryTranslations, capitalTranslations } from './geography.js';
export const LOCALE_KEY = 'geokiwi.locale.v1';
export function readLocale(storage) {
  try { return (storage ?? globalThis.localStorage).getItem(LOCALE_KEY) === 'en' ? 'en' : 'pt'; }
  catch { return 'pt'; }
}
export function saveLocale(locale, storage) {
  try { (storage ?? globalThis.localStorage).setItem(LOCALE_KEY, locale === 'en' ? 'en' : 'pt'); } catch { /* The switch still works for this session. */ }
}
export const countryName = (country, locale = 'pt') => locale === 'en' ? country.nome_en || country.nome_pt : country.nome_pt;
export const capitalName = (country, locale = 'pt') => locale === 'en' ? capitalTranslations[country.capital] || country.capital : country.capital;
const dictionary = { ...capitalTranslations, ...countryTranslations, ...english };
const escape = text => [...text].map(char => '^$.*+?()[]{}|\\'.includes(char) ? '\\' + char : char).join('');
const keys = Object.keys(dictionary).filter(key => dictionary[key] !== key).sort((a,b) => b.length-a.length);
const tokenPattern = new RegExp(String.raw`(?<![\p{L}\p{N}])(${keys.map(escape).join('|')})(?![\p{L}\p{N}])`, 'gu');
/** Called while React renders text and labels, never by scanning or mutating the DOM. */
export function translate(text, locale = 'pt') {
  if (typeof text !== 'string' || !text) return text;
  if (locale !== 'en') return text === 'CONTINUAR JOGANDO' ? 'CONTINUAR A JOGAR' : text;
  const trimmed = text.trim();
  if (dictionary[trimmed] !== undefined) return text.replace(trimmed, dictionary[trimmed]);
  const patterns = [
    [/^Repetir só os (\d+) que falhaste$/, 'Repeat only the $1 you missed'],
    [/^REVISAR AS (\d+) RESPOSTAS$/, 'REVIEW ALL $1 ANSWERS'],
    [/^Região do jogo (\d+)$/, 'Region for game $1'],
    [/^Jogo (\d+)$/, 'Game $1'],
    [/^Bandeira de (.+)$/, (_, name) => `Flag of ${translate(name,'en')}`],
    [/^Jogos de (.+)$/, (_, name) => `${translate(name,'en')} games`],
    [/^Categorias de jogos$/, 'Game categories'],
  ];
  for(const [pattern,replacement] of patterns) if(pattern.test(trimmed)) return text.replace(trimmed, trimmed.replace(pattern,replacement));
  return text.replace(tokenPattern, match => dictionary[match]);
}
