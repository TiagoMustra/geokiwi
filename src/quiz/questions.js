import countries from '../data/countries.json' with {type:'json'};
import { countryClues } from '../data/country-clues.js';
import { explorationPlaces } from '../data/exploration-places.js';
import { distanceKm } from './engine.js';
import { geographyExpansion } from './geography-expansion.js';
import { historyExpansion } from './history-expansion.js';
import { numberExpansion } from './number-expansion.js';
import { booleanExpansion } from './boolean-expansion.js';
import { flagExpansion } from './flag-expansion.js';
import { nameExpansion } from './name-expansion.js';

const countryById=Object.fromEntries(countries.map(c=>[c.id,c]));
export const countryEntity=id=>{
  const c=countryById[id];
  return {id,label:{pt:c.nome_pt,en:c.nome_en},aliases:[...c.aliases].filter(alias=>/[a-z0-9]/i.test(alias.normalize('NFD')))};
};
const text=(pt,en)=>({pt,en});
const common=(id,category,prompt,explanation,source,countryIds=[])=>({schemaVersion:1,id,revision:1,category,prompt,explanation,sources:[source],countryIds,checkedAt:'2026-11-06'});
const eiffel={title:'Société d’Exploitation de la Tour Eiffel · History',url:'https://www.toureiffel.paris/en/the-monument/history'};
const berlin={title:'Berlin.de · Opening and fall of the Berlin Wall',url:'https://www.berlin.de/en/history/8482274-8619314-opening-and-fall-of-the-berlin-wall.en.html'};
const sourceClue=id=>countryClues.find(q=>q.id===id);

/** Existing questions become single-answer entities without changing their IDs or aliases. */
export const legacyQuestions=countryClues.map(q=>({
  schemaVersion:1,id:q.id,revision:1,inputType:'TEXT_SINGLE',category:q.category,topicId:`clue:${q.id}`,
  prompt:text(q.pt,q.en),explanation:text(q.explanation_pt,q.explanation_en),sources:[q.source],checkedAt:q.checkedAt,
  countryIds:q.countryIds,suggestionDomain:'countries',answer:{accepted:q.countryIds.map(countryEntity)},
}));
const sharedList=(id,originalId,pt,en)=>{
  const q=sourceClue(originalId);
  return {...common(id,'geography',text(pt,en),text(q.explanation_pt,q.explanation_en),q.source,q.countryIds),inputType:'TEXT_MULTIPLE',suggestionDomain:'countries',answer:{accepted:q.countryIds.map(countryEntity)}};
};
const lisbon=explorationPlaces.find(p=>p.id==='city-lisbon');
const paris=explorationPlaces.find(p=>p.id==='city-paris');
const cityDistance=Math.round(distanceKm({lat:lisbon.coordinates[1],lng:lisbon.coordinates[0]},{lat:paris.coordinates[1],lng:paris.coordinates[0]}));
const everest=explorationPlaces.find(p=>p.id==='peak-everest');

/** A small, sourced launch set exercises every renderer; extend this bank, not the UI. */
export const starterQuestions=[
  {...common('tf-eiffel-century','history',text('A Torre Eiffel foi inaugurada no século XIX.','The Eiffel Tower was inaugurated in the 19th century.'),text('Verdadeiro: foi inaugurada em 31 de março de 1889.','True: it was inaugurated on 31 March 1889.'),eiffel,['250']),inputType:'TRUE_FALSE',topicId:'eiffel:inauguration',answer:{value:true}},
  {...common('tf-berlin-1991','history',text('O Muro de Berlim caiu em 1991.','The Berlin Wall fell in 1991.'),text('Falso: a queda do Muro de Berlim é assinalada a 9 de novembro de 1989.','False: the fall of the Berlin Wall is marked on 9 November 1989.'),berlin,['276']),inputType:'TRUE_FALSE',topicId:'berlin-wall:fall',answer:{value:false}},
  {...common('number-swedish-islands','geography',text('Quantas ilhas contou a Statistics Sweden no levantamento de 2013?','How many islands did Statistics Sweden count in its 2013 survey?'),text('O levantamento contou 267 570 ilhas, incluindo ilhas muito pequenas e ilhas em lagos.','The survey counted 267,570 islands, including very small islands and islands in lakes.'),{title:'Statistics Sweden · Coast, shores and islands in Sweden 2013',url:'https://www.scb.se/en/finding-statistics/statistics-by-subject-area/housing-construction-and-building/land-use/land-use-in-proximity-to-shoreline/pong/statistical-news/coast-shores-and-islands-in-sweden-2013'},['752']),inputType:'NUMBER_EXACT',referenceYear:2013,unit:{id:'islands',label:text('ilhas','islands')},bounds:{min:0},answer:{value:267570,absoluteTolerance:0}},
  {...common('number-cn-tower','dimensions',text('Qual é a altura total da CN Tower, em Toronto?','What is the total height of Toronto’s CN Tower?'),text('A altura total da torre é de 553,33 metros, medida até à ponta.','The tower’s total height is 553.33 metres, measured to its tip.'),{title:'CN Tower · Builder design brief',url:'https://www.cntower.ca/media/2231/download?inline='},['124']),inputType:'NUMBER_EXACT',unit:{id:'metres',label:text('metros','metres')},bounds:{min:0,max:10000},answer:{value:553.33,absoluteTolerance:0}},
  sharedList('multiple-caspian','caspio-partilhado','Nomeia países com costa no mar Cáspio.','Name countries with a Caspian Sea coastline.'),
  sharedList('multiple-everest','everest-partilhado','Nomeia os países que partilham a fronteira no Evereste.','Name the countries sharing the border at Everest.'),
  {...common('timeline-berlin','history',text('Em que ano caiu o Muro de Berlim?','In which year did the Berlin Wall fall?'),text('A queda do Muro de Berlim é assinalada a 9 de novembro de 1989; a reunificação alemã aconteceu em 1990.','The fall of the Berlin Wall is marked on 9 November 1989; German reunification followed in 1990.'),berlin,['276']),inputType:'SLIDER_TIMELINE',topicId:'berlin-wall:fall',range:{min:1900,max:'CURRENT_YEAR',step:1},answer:{year:1989,toleranceYears:0}},
  {...common('timeline-eiffel','history',text('Em que ano foi inaugurada a Torre Eiffel?','In which year was the Eiffel Tower inaugurated?'),text('Foi inaugurada em 1889, após uma construção iniciada em 1887.' ,'It was inaugurated in 1889, following construction that began in 1887.'),eiffel,['250']),inputType:'SLIDER_TIMELINE',topicId:'eiffel:inauguration',range:{min:1700,max:'CURRENT_YEAR',step:1},answer:{year:1889,toleranceYears:0}},
  {...common('distance-lisbon-paris','distance',text('Quantos quilómetros separam Lisboa de Paris, em linha reta?','How many kilometres separate Lisbon and Paris, as the crow flies?'),text(`A distância de grande círculo entre os centros é de cerca de ${cityDistance} km; não é a distância por estrada.`,`The great-circle distance between the city centres is about ${cityDistance} km; this is not the road distance.`),{title:'Natural Earth · Populated places (coordinates; great-circle calculation)',url:lisbon.source.url},['620','250']),inputType:'SLIDER_DISTANCE',answer:{km:cityDistance,toleranceKm:25}},
  {...common('pinpoint-everest','geography',text('Coloca o pin no cume do Evereste.','Place the pin on the summit of Everest.'),text('O cume situa-se na fronteira entre o Nepal e a China, na cordilheira dos Himalaias.','The summit lies on the Nepal–China border in the Himalayas.'),everest.source,['524','156']),inputType:'MAP_PINPOINT',placeType:'peak',answer:{point:{lat:everest.coordinates[1],lng:everest.coordinates[0]},toleranceKm:25,decayKm:500}},
  {...common('text-city-eiffel','cities',text('Em que cidade fica a Torre Eiffel?','Which city is home to the Eiffel Tower?'),text('A Torre Eiffel fica em Paris, junto ao Sena.','The Eiffel Tower stands in Paris, beside the Seine.'),eiffel,['250']),inputType:'TEXT_SINGLE',suggestionDomain:'cities',answer:{accepted:[{id:'city-paris',label:text('Paris','Paris'),aliases:[]}]}},
];
export const dynamicQuestions=[...starterQuestions,...geographyExpansion,...historyExpansion,...numberExpansion,...booleanExpansion,...flagExpansion,...nameExpansion];
/** @type {import('./types').QuizQuestion[]} */
export const quizQuestions=[...legacyQuestions,...dynamicQuestions];
export const quizQuestionById=Object.fromEntries(quizQuestions.map(q=>[q.id,q]));
export const getQuizPool=(locale='pt')=>quizQuestions.filter(q=>!q.nameLanguage||q.nameLanguage===(locale==='en'?'en':'pt'));

// Suggestions use the complete entity domain, never the hidden answer list.
export const suggestionEntities={
  countries:countries.filter(c=>c.isCountry).map(c=>countryEntity(c.id)),
  cities:explorationPlaces.filter(p=>p.type==='city').map(p=>({id:p.id,label:text(p.name_pt,p.name_en),aliases:[]})),
  none:[],
};
