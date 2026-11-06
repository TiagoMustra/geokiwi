import countries from '../data/countries.json' with {type:'json'};
import { normalizeAnswer } from '../lib/game.js';

export const countryLetters=(country,locale='pt')=>normalizeAnswer(locale==='en'?country.nome_en:country.nome_pt).replace(/[0-9]/g,'');
const text=(pt,en)=>({pt,en});
const source={title:'Mledoze / Countries · common country names',url:'https://github.com/mledoze/countries'};
const regions={
  mundo:text('',''),europa:text(' da Europa',' in Europe'),africa:text(' de África',' in Africa'),
  americas:text(' das Américas',' in the Americas'),oceania:text(' da Oceania',' in Oceania'),
};
const definitions=[
  ...['A','B','C','M','N','P','S','T'].map(letter=>({id:`initial-world-${letter.toLowerCase()}`,region:'mundo',letter})),
  ...['A','B','E','P','S'].map(letter=>({id:`initial-europe-${letter.toLowerCase()}`,region:'europa',letter})),
  ...['B','C'].map(letter=>({id:`initial-americas-${letter.toLowerCase()}`,region:'americas',letter})),
  ...['M','S'].map(letter=>({id:`initial-africa-${letter.toLowerCase()}`,region:'africa',letter})),
  ...[4,5,6,7,8].map(length=>({id:`length-world-${length}`,region:'mundo',length})),
  ...[5,6,7,8].map(length=>({id:`length-europe-${length}`,region:'europa',length})),
  ...[5,6,7].map(length=>({id:`length-africa-${length}`,region:'africa',length})),
  {id:'length-europe-over-6',region:'europa',moreThan:6},
  {id:'length-americas-over-8',region:'americas',moreThan:8},
  {id:'length-oceania-5',region:'oceania',length:5},
];
const entity=c=>({id:c.id,label:text(c.nome_pt,c.nome_en),aliases:c.aliases.filter(a=>normalizeAnswer(a))});
const matches=(country,definition,locale)=>{
  const letters=countryLetters(country,locale);
  return definition.letter?letters.startsWith(definition.letter.toLowerCase())
    :definition.moreThan!==undefined?letters.length>definition.moreThan:letters.length===definition.length;
};
const makeQuestion=(definition,nameLanguage)=>{
  const accepted=countries.filter(c=>c.isCountry&&(definition.region==='mundo'||c.continente===definition.region)&&matches(c,definition,nameLanguage));
  if(!accepted.length)return null;
  const ptLanguage=nameLanguage==='pt'?'português':'inglês',enLanguage=nameLanguage==='pt'?'Portuguese':'English';
  const scope=regions[definition.region];
  const pt=definition.letter?`Nomeia países${scope.pt} cujo nome em ${ptLanguage} começa pela letra ${definition.letter}.`
    :definition.moreThan!==undefined?`Nomeia países${scope.pt} com mais de ${definition.moreThan} letras no nome em ${ptLanguage}.`
      :`Nomeia países${scope.pt} com ${definition.length} letras no nome em ${ptLanguage}.`;
  const en=definition.letter?`Name countries${scope.en} whose ${enLanguage} names begin with ${definition.letter}.`
    :definition.moreThan!==undefined?`Name countries${scope.en} with more than ${definition.moreThan} letters in their ${enLanguage} names.`
      :`Name countries${scope.en} with ${definition.length} letters in their ${enLanguage} names.`;
  return {
    schemaVersion:1,id:`names-${nameLanguage}-${definition.id}`,revision:1,inputType:'TEXT_MULTIPLE',category:'names',topicId:`names:${definition.id}`,nameLanguage,
    prompt:text(pt,en),explanation:text(`São aceites ${accepted.length} países pelos seus nomes habituais em ${ptLanguage}. Espaços e hífens não contam como letras; os acentos não mudam a inicial.`,
      `${accepted.length} countries qualify by their common ${enLanguage} names. Spaces and hyphens do not count as letters; accents do not change the initial.`),
    sources:[source],checkedAt:'2026-11-06',suggestionDomain:'countries',answer:{accepted:accepted.map(entity)},
  };
};
// Fixed per-question reference language keeps the answer set stable if the UI is switched.
export const nameExpansion=['pt','en'].flatMap(locale=>definitions.map(d=>makeQuestion(d,locale)).filter(Boolean));
