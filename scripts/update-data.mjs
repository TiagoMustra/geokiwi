import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { feature } from 'topojson-client';

// This script runs only during maintenance. The deployed game uses local files.
const root = new URL('../', import.meta.url);
const overrides = JSON.parse(await readFile(new URL('src/data/overrides.json', root), 'utf8'));
const capitals = JSON.parse(await readFile(new URL('src/data/capital-coordinates.json', root), 'utf8'));
const urls = {
  topology: 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json',
  countries: 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
  detailed: 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json',
};
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}
const [topology, raw, detailed] = await Promise.all(Object.values(urls).map(async url => (await download(url)).json()));
const regionIds = { Africa: 'africa', Asia: 'asia', Europe: 'europa', Americas: 'americas', Oceania: 'oceania' };
for (const map of [topology, detailed]) map.objects.countries.geometries.forEach(geometry => {
  if (geometry.properties.name === 'Kosovo') geometry.id = '383';
});
const available = new Set(topology.objects.countries.geometries.map(geometry => geometry.id).filter(Boolean));
const countries = raw.filter(country => (available.has(country.ccn3) || ['UNK', 'TUV'].includes(country.cca3)) && country.capital?.length && regionIds[country.region]).map(country => {
  const code = country.cca3;
  const nome_pt = overrides.countryNames?.[code] || country.translations.por?.common || country.name.common;
  const capital = overrides.capitals[code] || country.capital[0];
  if (!capitals[code]?.coordinates) throw new Error(`Missing verified capital coordinates for ${code}. Update capital-coordinates.json first.`);
  return {
    id: code === 'UNK' ? '383' : country.ccn3,
    isCountry: Boolean(country.independent) || ['UNK', 'PSE', 'TWN'].includes(code),
    iso2: country.cca2.toLowerCase(),
    iso3: code,
    nome_pt,
    nome_en: country.name.common,
    capital,
    continente: regionIds[country.region],
    bandeira_url: `/flags/${country.cca2.toLowerCase()}.svg`,
    coordenadas_centro: [country.latlng[1], country.latlng[0]],
    coordenadas_capital: capitals[code].coordinates,
    aliases: [...new Set([nome_pt, country.name.common, country.name.official, ...country.altSpellings, ...overrides.countryAliases[code] || []])],
    capitais_aceitas: [...new Set([capital, ...country.capital, ...overrides.capitalAliases[code] || []])],
  };
});
if (countries.length < 200) throw new Error('Data validation failed: fewer than 200 playable destinations.');
await mkdir(new URL('public/flags/', root), { recursive: true });
await mkdir(new URL('public/maps/', root), { recursive: true });
// Download in batches to avoid flooding the flag provider.
for (let i = 0; i < countries.length; i += 8) {
  await Promise.all(countries.slice(i, i + 8).map(async country => {
    const response = await download(`https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${country.iso2}.svg`);
    await writeFile(new URL(`public${country.bandeira_url}`, root), await response.text());
  }));
}
const flagSvgs = Object.fromEntries(await Promise.all(countries.map(async country => [country.iso2, await readFile(new URL(`public${country.bandeira_url}`, root), 'utf8')])));
await Promise.all([
  writeFile(new URL('src/data/flag-svgs.json', root), JSON.stringify(flagSvgs)),
  writeFile(new URL('src/data/countries.json', root), JSON.stringify(countries)),
  writeFile(new URL('src/data/world.json', root), JSON.stringify(topology)),
  writeFile(new URL('src/data/extra-geometries.json', root), JSON.stringify(feature(detailed, detailed.objects.countries).features.filter(item => item.id === '798'))),
  writeFile(new URL('public/maps/countries-10m.json', root), JSON.stringify(detailed)),
]);
console.log(`Updated ${countries.length} destinations, their geometry and flags. Run pnpm test and pnpm build.`);
