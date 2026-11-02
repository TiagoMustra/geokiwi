import { feature } from 'topojson-client';
import countries from './countries.json' with { type: 'json' };
import topology from './world.json';
import extra from './extra-geometries.json';
import { regionIncludes } from '../lib/regions.js';
import { mapPoliticalFeature } from '../lib/catalog.js';

export { countries };
export const byId = Object.fromEntries(countries.map(country => [country.id, country]));
export const features = [...feature(topology, topology.objects.countries).features, ...extra]
  .filter(country => country.id !== '010')
  .map((country, index) => mapPoliticalFeature({ ...country, id: country.id ? String(country.id).padStart(3, '0') : `unmapped-${index}`, key: `land-${index}` }));

export const REGIONS = [
  { id: 'mundo', name: 'Mundo Todo', short: 'Mundo', icon: 'globe' },
  { id: 'africa', name: 'África' },
  { id: 'asia', name: 'Ásia' },
  { id: 'europa', name: 'Europa' },
  { id: 'americas', name: 'Américas' },
  { id: 'oceania', name: 'Oceania' },
].map(region => ({ ...region, count: countries.filter(c => region.id === 'mundo' || c.continente === region.id).length }));

export const MODES = [
  { id: 1, title: 'Ache o país', label: 'NOME + BANDEIRA', description: 'Uma bandeira. Um nome. Você sabe onde fica?', action: 'Clique no mapa', icon: 'pin', color: 'lime', input: false },
  { id: 2, title: 'Qual é o país?', label: 'FRONTEIRAS + ZOOM', description: 'Reconheça o território e digite o nome do país.', action: 'Digite o país', icon: 'keyboard', color: 'cyan', input: true },
  { id: 3, title: 'Siga a capital', label: 'CAPITAL → PAÍS', description: 'A capital é a pista. Encontre o país no mapa.', action: 'Clique no mapa', icon: 'flag', color: 'purple', input: false },
  { id: 4, title: 'Qual é a capital?', label: 'TERRITÓRIO → CAPITAL', description: 'Observe o país em destaque e nomeie sua capital.', action: 'Digite a capital', icon: 'city', color: 'orange', input: true },
];

export function getPool(region = 'mundo', includeTerritories = false) {
  return countries.filter(country => (includeTerritories || country.isCountry) && regionIncludes(region, country.continente));
}
