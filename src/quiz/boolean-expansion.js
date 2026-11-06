import countries from '../data/countries.json' with {type:'json'};
import { countryClues } from '../data/country-clues.js';
import { explorationPlaces } from '../data/exploration-places.js';

const text=(pt,en)=>({pt,en});
const question=(id,topicId,category,prompt,explanation,sources,countryIds,value)=>({
  schemaVersion:1,id,topicId,revision:1,inputType:'TRUE_FALSE',category,
  prompt,explanation,sources,countryIds,checkedAt:'2026-11-06',answer:{value},
});
const clueAssertion=(id,clueId,value,pt,en,explanationPt,explanationEn)=>{
  const clue=countryClues.find(item=>item.id===clueId);
  if(!clue)throw new Error(`Missing source clue: ${clueId}`);
  return question(id,`clue:${clueId}`,clue.category,text(pt,en),text(explanationPt,explanationEn),[clue.source],clue.countryIds,value);
};

const countryByIso3=Object.fromEntries(countries.map(country=>[country.iso3,country]));
const landlockedSource={
  title:'Mledoze · Countries dataset (landlocked field)',
  url:'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
};
// These ten landlocked flags were read from the primary dataset on 2026-11-06.
// The wording alternates an inland status with a claim of a maritime coastline.
const landlockedAssertion=(iso3,claimsLandlocked,pt,en,explanationPt,explanationEn)=>{
  const country=countryByIso3[iso3];
  if(!country)throw new Error(`Missing country: ${iso3}`);
  const isLandlocked=true;
  return question(`tf-landlocked-${iso3.toLowerCase()}`,`landlocked:${iso3}`,'geography',text(pt,en),text(explanationPt,explanationEn),[landlockedSource],[country.id],claimsLandlocked===isLandlocked);
};

const cityById=Object.fromEntries(explorationPlaces.filter(place=>place.type==='city').map(place=>[place.id,place]));
const cityOfPt=city=>({'city-cairo':'do Cairo','city-cape-town':'da Cidade do Cabo'}[city.id]||`de ${city.name_pt}`);
const latitudeLabel=(latitude,locale)=>`${Math.abs(latitude).toFixed(3).replace('.',locale==='pt'?',':'.')}° ${latitude<0?'S':'N'}`;
const cityComparison=(slug,firstId,secondId,direction)=>{
  const first=cityById[firstId];
  const second=secondId?cityById[secondId]:null;
  if(!first||(secondId&&!second))throw new Error(`Missing comparison city: ${firstId} / ${secondId}`);
  const latitude=first.coordinates[1];
  const otherLatitude=second?second.coordinates[1]:0;
  const value=direction==='north'?latitude>otherLatitude:latitude<otherLatitude;
  const actualDirection=latitude>otherLatitude?'north':'south';
  const sources=[...new Map([first.source,second?.source].filter(Boolean).map(source=>[source.url,source])).values()];
  const countryIds=[...new Set([...first.countryIds,...(second?.countryIds||[])])];
  const directionPt=direction==='north'?'norte':'sul';
  const actualDirectionPt=actualDirection==='north'?'norte':'sul';
  const prompt=second
    ?text(`O ponto de referência ${cityOfPt(first)} no mapa fica mais a ${directionPt} do que o ${cityOfPt(second)}.`,`The map reference point for ${first.name_en} lies farther ${direction} than the one for ${second.name_en}.`)
    :text(`O ponto de referência ${cityOfPt(first)} no mapa fica a ${directionPt} do equador.`,`The map reference point for ${first.name_en} lies ${direction} of the equator.`);
  const explanation=second
    ?text(`${first.name_pt}: ${latitudeLabel(latitude,'pt')}; ${second.name_pt}: ${latitudeLabel(otherLatitude,'pt')}. O primeiro ponto fica mais a ${actualDirectionPt}.`,`${first.name_en}: ${latitudeLabel(latitude,'en')}; ${second.name_en}: ${latitudeLabel(otherLatitude,'en')}. The first point lies farther ${actualDirection}.`)
    :text(`A latitude do ponto ${cityOfPt(first)} é ${latitudeLabel(latitude,'pt')}, a ${actualDirectionPt} do equador.`,`The latitude of the ${first.name_en} point is ${latitudeLabel(latitude,'en')}, ${actualDirection} of the equator.`);
  return question(`tf-latitude-${slug}`,`latitude:${slug}`,'cities',prompt,explanation,sources,countryIds,value);
};

/** Forty bilingual assertions: 20 clue adaptations, 10 inland countries, 10 latitude comparisons.
 * Every helper returns a complete serializable QuizQuestion; latitude answers use the source data.
 * @type {import('./types').QuizQuestion[]}
 */
export const booleanExpansion=[
  clueAssertion('tf-nepal-rectangle','bandeira-nepal',false,
    'A bandeira nacional do Nepal é retangular.',
    'Nepal’s national flag is rectangular.',
    'A bandeira do Nepal é formada por dois galhardetes triangulares, com contorno azul.',
    'Nepal’s flag consists of two triangular pennants with blue borders.'),
  clueAssertion('tf-bhutan-swan','dragao-branco',false,
    'A bandeira do Butão mostra um cisne branco.',
    'Bhutan’s flag shows a white swan.',
    'A figura branca é um dragão, sobre as metades amarela e laranja da bandeira.',
    'The white figure is a dragon, across the flag’s yellow and orange halves.'),
  clueAssertion('tf-new-zealand-blue-stars','quatro-estrelas-vermelhas',false,
    'As quatro estrelas da bandeira da Nova Zelândia são azuis com contorno branco.',
    'The four stars on New Zealand’s flag are blue with white borders.',
    'As estrelas são vermelhas com contorno branco e representam o Cruzeiro do Sul.',
    'The stars are red with white borders and represent the Southern Cross.'),
  clueAssertion('tf-swiss-square-flag','bandeira-quadrada-suica',true,
    'A bandeira nacional suíça é quadrada.',
    'Switzerland’s national flag is square.',
    'A bandeira nacional tem formato quadrado; a versão marítima é retangular.',
    'The national flag is square; its maritime version is rectangular.'),
  clueAssertion('tf-canada-maple-points','folha-onze-pontas',true,
    'A folha de ácer na bandeira do Canadá tem onze pontas.',
    'The maple leaf on Canada’s flag has eleven points.',
    'A bandeira usa uma folha vermelha estilizada de onze pontas, reconhecível mesmo à distância.',
    'The flag uses a stylised red eleven-point leaf that remains recognisable at a distance.'),
  clueAssertion('tf-grand-canyon-mississippi','grand-canyon',false,
    'Foi o rio Mississippi que escavou o Grand Canyon, no Arizona.',
    'The Mississippi River carved the Grand Canyon in Arizona.',
    'O rio que escavou o Grand Canyon é o Colorado; as suas paredes expõem uma longa história geológica.',
    'The Colorado River carved the Grand Canyon; its walls expose a long geological record.'),
  clueAssertion('tf-galapagos-ecuador','galapagos',true,
    'As ilhas Galápagos pertencem ao Equador.',
    'The Galápagos Islands belong to Ecuador.',
    'O arquipélago equatoriano abriga espécies singulares, como tartarugas gigantes e iguanas.',
    'The Ecuadorian archipelago supports distinctive species such as giant tortoises and iguanas.'),
  clueAssertion('tf-uluru-new-zealand','uluru',false,
    'Uluru fica na Nova Zelândia.',
    'Uluru is in New Zealand.',
    'Uluru fica no centro da Austrália, numa paisagem de planícies arenosas vermelhas.',
    'Uluru stands in central Australia, in a landscape of red sandy plains.'),
  clueAssertion('tf-rapa-nui-chile','moai',true,
    'Rapa Nui, conhecida pelos moai, faz parte do Chile.',
    'Rapa Nui, known for its moai, is part of Chile.',
    'A ilha chilena, também chamada Ilha da Páscoa, conserva uma paisagem cultural de origem polinésia.',
    'The Chilean island, also called Easter Island, preserves a cultural landscape of Polynesian origin.'),
  clueAssertion('tf-machu-picchu-mexico','machu-picchu',false,
    'Machu Picchu fica no México.',
    'Machu Picchu is in Mexico.',
    'A cidade inca fica no Peru, nos Andes, a cerca de 2 430 metros de altitude.',
    'The Inca city is in Peru’s Andes, around 2,430 metres above sea level.'),
  clueAssertion('tf-petra-jordan','petra',true,
    'Petra, a cidade nabateia parcialmente esculpida na rocha, fica na Jordânia.',
    'Petra, the Nabataean city partly carved into rock, is in Jordan.',
    'O sítio jordano foi um centro de caravanas entre o mar Vermelho e o mar Morto.',
    'The Jordanian site was a caravan centre between the Red Sea and the Dead Sea.'),
  clueAssertion('tf-angkor-cambodia','angkor',true,
    'Angkor Wat fica no Camboja.',
    'Angkor Wat is in Cambodia.',
    'Angkor, no Camboja, reúne templos e antigas cidades do Império Khmer.',
    'Angkor in Cambodia includes temples and former cities of the Khmer Empire.'),
  clueAssertion('tf-serengeti-kenya','serengeti',false,
    'O Parque Nacional do Serengeti fica no Quénia.',
    'Serengeti National Park is in Kenya.',
    'O parque nacional fica na Tanzânia e é conhecido pelas migrações de grandes manadas.',
    'The national park is in Tanzania and is known for migrations of large herds.'),
  clueAssertion('tf-lesotho-altitude','lesoto-altitude',true,
    'Todo o território do Lesoto fica acima dos mil metros de altitude.',
    'All of Lesotho’s territory lies above one thousand metres in elevation.',
    'Até o ponto mais baixo deste reino montanhoso fica a cerca de 1 400 metros de altitude.',
    'Even the lowest point of this mountainous kingdom is around 1,400 metres above sea level.'),
  clueAssertion('tf-kiribati-hemispheres','quatro-hemisferios',true,
    'Kiribati tem ilhas nos quatro hemisférios.',
    'Kiribati has islands in all four hemispheres.',
    'As ilhas distribuem-se a norte e sul do equador e a leste e oeste do meridiano de 180°.',
    'The islands lie north and south of the equator and east and west of the 180° meridian.'),
  clueAssertion('tf-namib-fog','deserto-nevoeiro',true,
    'O nevoeiro é a principal fonte de água no Mar de Areia do Namibe.',
    'Fog is the main source of water in the Namib Sand Sea.',
    'Nesta paisagem de dunas costeiras, o nevoeiro ajuda a sustentar seres vivos adaptados à escassez de água.',
    'In this coastal dune landscape, fog helps sustain organisms adapted to scarce water.'),
  clueAssertion('tf-liechtenstein-doubly-landlocked','duplamente-encravado',true,
    'O Listenstaine é um país sem litoral cujos vizinhos também não têm acesso direto ao oceano.',
    'Liechtenstein is landlocked and all its neighbours are also landlocked.',
    'É um país duplamente encravado: para chegar ao oceano é preciso atravessar pelo menos dois países.',
    'It is doubly landlocked: reaching the ocean requires crossing at least two countries.'),
  clueAssertion('tf-panama-indian-ocean','canal-dois-oceanos',false,
    'O Canal do Panamá liga o oceano Atlântico ao oceano Índico.',
    'The Panama Canal links the Atlantic Ocean to the Indian Ocean.',
    'O canal permite a passagem entre o Atlântico e o Pacífico, usando eclusas para elevar os navios.',
    'The canal connects the Atlantic and Pacific, using locks to raise ships.'),
  clueAssertion('tf-everest-only-nepal','everest-partilhado',false,
    'O cume do Evereste fica inteiramente no Nepal, sem tocar uma fronteira internacional.',
    'Everest’s summit lies entirely within Nepal, without touching an international border.',
    'A fronteira entre o Nepal e a China passa pelo Evereste.',
    'The Nepal–China border passes through Everest.'),
  clueAssertion('tf-union-flag-1901','tres-cruzes',false,
    'O desenho atual da Union Flag britânica data de 1901.',
    'The current design of Britain’s Union Flag dates from 1901.',
    'A versão atual data de 1801 e combina as cruzes de São Jorge, Santo André e São Patrício.',
    'The current version dates from 1801 and combines the crosses of St George, St Andrew and St Patrick.'),

  landlockedAssertion('BOL',true,
    'A Bolívia é um país sem litoral marítimo.',
    'Bolivia is a landlocked country.',
    'A Bolívia não tem costa marítima.',
    'Bolivia has no maritime coastline.'),
  landlockedAssertion('PRY',false,
    'O Paraguai tem uma costa marítima.',
    'Paraguay has a maritime coastline.',
    'O Paraguai é um país sem litoral marítimo.',
    'Paraguay is landlocked and has no maritime coastline.'),
  landlockedAssertion('CHE',true,
    'A Suíça não tem litoral marítimo.',
    'Switzerland has no maritime coastline.',
    'A Suíça é um país sem litoral marítimo.',
    'Switzerland is a landlocked country.'),
  landlockedAssertion('AUT',false,
    'A Áustria tem uma costa marítima.',
    'Austria has a maritime coastline.',
    'A Áustria é um país sem litoral marítimo.',
    'Austria is landlocked and has no maritime coastline.'),
  landlockedAssertion('MNG',true,
    'A Mongólia é um país sem litoral marítimo.',
    'Mongolia is a landlocked country.',
    'A Mongólia não tem costa marítima.',
    'Mongolia has no maritime coastline.'),
  landlockedAssertion('NPL',false,
    'O Nepal tem uma costa marítima.',
    'Nepal has a maritime coastline.',
    'O Nepal é um país sem litoral marítimo.',
    'Nepal is landlocked and has no maritime coastline.'),
  landlockedAssertion('LSO',true,
    'O Lesoto não tem litoral marítimo.',
    'Lesotho has no maritime coastline.',
    'O Lesoto é um país sem litoral marítimo.',
    'Lesotho is a landlocked country.'),
  landlockedAssertion('UZB',false,
    'O Usbequistão tem uma costa marítima.',
    'Uzbekistan has a maritime coastline.',
    'O Usbequistão é um país sem litoral marítimo.',
    'Uzbekistan is landlocked and has no maritime coastline.'),
  landlockedAssertion('LIE',true,
    'O Listenstaine é um país sem litoral marítimo.',
    'Liechtenstein is a landlocked country.',
    'O Listenstaine não tem costa marítima.',
    'Liechtenstein has no maritime coastline.'),
  landlockedAssertion('NER',false,
    'O Níger tem uma costa marítima.',
    'Niger has a maritime coastline.',
    'O Níger é um país sem litoral marítimo.',
    'Niger is landlocked and has no maritime coastline.'),

  cityComparison('new-york-south-rome','city-new-york','city-rome','south'),
  cityComparison('london-north-vancouver','city-london','city-vancouver','north'),
  cityComparison('tokyo-north-paris','city-tokyo','city-paris','north'),
  cityComparison('cairo-north-dubai','city-cairo','city-dubai','north'),
  cityComparison('singapore-south-equator','city-singapore',null,'south'),
  cityComparison('nairobi-south-equator','city-nairobi',null,'south'),
  cityComparison('cape-town-south-sydney','city-cape-town','city-sydney','south'),
  cityComparison('buenos-aires-north-cape-town','city-buenos-aires','city-cape-town','north'),
  cityComparison('mumbai-north-shanghai','city-mumbai','city-shanghai','north'),
  cityComparison('marrakesh-north-london','city-marrakesh','city-london','north'),
];
