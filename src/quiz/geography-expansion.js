import countries from '../data/countries.json' with {type:'json'};
import { explorationPlaces } from '../data/exploration-places.js';
import borders from './borders-snapshot.json' with {type:'json'};
import { distanceKm } from './engine.js';
import { landmarkPhotoById } from './landmark-photos.js';

const byIso=Object.fromEntries(countries.map(c=>[c.iso3,c]));
const byId=Object.fromEntries(countries.map(c=>[c.id,c]));
const places=Object.fromEntries(explorationPlaces.map(p=>[p.id,p]));
const text=(pt,en)=>({pt,en});
const base=(id,inputType,category,prompt,explanation,source,countryIds,topicId=id)=>({
  schemaVersion:1,id,revision:1,inputType,category,prompt,explanation,sources:[source],countryIds,topicId,checkedAt:'2026-11-06',
});
const entity=c=>({id:c.id,label:text(c.nome_pt,c.nome_en),aliases:c.aliases.filter(alias=>/[a-z0-9]/i.test(alias.normalize('NFD')))});
const format=(n,locale)=>new Intl.NumberFormat(locale==='en'?'en-GB':'pt-PT').format(n);

/** Curated countries avoid overseas-border and recognition ambiguities. Snapshot is local. */
export const borderQuestions=borders.countries.map(item=>{
  const country=byIso[item.iso3],accepted=item.borders.map(iso=>byIso[iso]);
  if(!country||accepted.some(c=>!c?.isCountry))throw Error(`Unsupported border entity: ${item.iso3}`);
  return {
    ...base(`multiple-borders-${item.iso3.toLowerCase()}`,'TEXT_MULTIPLE','borders',
      text(`Nomeia os vizinhos terrestres deste país: ${country.nome_pt}.`,`Name the land neighbours of this country: ${country.nome_en}.`),
      text(`Fronteiras terrestres de ${country.nome_pt}: ${accepted.map(c=>c.nome_pt).join(', ')}. Fronteiras marítimas não contam.`,
        `Land neighbours of ${country.nome_en}: ${accepted.map(c=>c.nome_en).join(', ')}. Maritime borders do not count.`),
      borders.source,[country.id],`borders:${country.id}`),
    suggestionDomain:'countries',answer:{accepted:accepted.map(entity)},
  };
});

/** A finite curated route list: no arbitrary all-pairs multiplication of the bank. */
const routes=[
  ['london','paris'],['lisbon','london'],['rome','istanbul'],['paris','rome'],
  ['tokyo','seoul'],['tokyo','shanghai'],['shanghai','mumbai'],['mumbai','dubai'],
  ['dubai','cairo'],['cairo','istanbul'],['cape-town','johannesburg'],['nairobi','lagos'],
  ['lagos','cairo'],['marrakesh','paris'],['lisbon','marrakesh'],['singapore','bangkok'],
  ['singapore','sydney'],['sydney','auckland'],['new-york','los-angeles'],['los-angeles','san-francisco'],
  ['vancouver','new-york'],['mexico-city','los-angeles'],['rio','buenos-aires'],['lima','mexico-city'],
  ['lima','buenos-aires'],['london','new-york'],['paris','tokyo'],['cairo','cape-town'],
  ['seoul','singapore'],['vancouver','sydney'],['new-york','rio'],['dubai','singapore'],
  ['lisbon','rio'],['marrakesh','nairobi'],['amsterdam','london'],['rome','barcelona'],
  ['barcelona','lisbon'],['mexico-city','new-york'],['shanghai','vancouver'],['auckland','buenos-aires'],
];
export const distanceQuestions=routes.map(([from,to])=>{
  const a=places[`city-${from}`],b=places[`city-${to}`];
  const km=Math.round(distanceKm({lat:a.coordinates[1],lng:a.coordinates[0]},{lat:b.coordinates[1],lng:b.coordinates[0]}));
  return {
    ...base(`distance-${from}-${to}`,'SLIDER_DISTANCE','distance',
      text(`Que distância em linha reta separa ${a.name_pt} de ${b.name_pt}?`,`How far apart are ${a.name_en} and ${b.name_en}, as the crow flies?`),
      text(`Entre os centros das duas cidades são cerca de ${format(km,'pt')} km em grande círculo. Não é a distância por estrada.`,
        `The city centres are about ${format(km,'en')} km apart along a great circle. This is not the road distance.`),
      a.source,[...new Set([...a.countryIds,...b.countryIds])],`distance:${[from,to].sort().join(':')}`),
    answer:{km,toleranceKm:25},
  };
});

/** Reuse the verified point catalogue. Broad rivers/areas are intentionally excluded. */
export const pinpointQuestions=explorationPlaces.filter(p=>['city','peak','historic'].includes(p.type)&&p.id!=='peak-everest').map(place=>{
  const countriesPt=place.countryIds.map(id=>byId[id].nome_pt).join(' / ');
  const countriesEn=place.countryIds.map(id=>byId[id].nome_en).join(' / ');
  return {
    ...base(`pin-${place.id}`,'MAP_PINPOINT',place.type,
      text(`Coloca o pin: ${place.name_pt}${place.type==='historic'?'':` (${countriesPt})`}.`,`Place the pin: ${place.name_en}${place.type==='historic'?'':` (${countriesEn})`}.`),
      text(`Localização: ${place.name_pt} · ${countriesPt}. O alvo é ${place.type==='city'?'o centro da cidade':place.type==='peak'?'o cume':'o monumento'}.`,
        `Location: ${place.name_en} · ${countriesEn}. The target is ${place.type==='city'?'the city centre':place.type==='peak'?'the summit':'the monument'}.`),
      place.source,place.countryIds,`geo:${place.id}`),
    placeType:place.type==='historic'?'monument':place.type,
    ...(place.type==='historic'?{image:landmarkPhotoById[place.id]}:{}),
    answer:{point:{lat:place.coordinates[1],lng:place.coordinates[0]},toleranceKm:place.type==='city'?15:place.type==='peak'?10:5,decayKm:500},
  };
});

export const geographyExpansion=[...borderQuestions,...distanceQuestions,...pinpointQuestions];
