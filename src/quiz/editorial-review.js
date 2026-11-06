import countries from '../data/countries.json' with {type:'json'};

const text=(pt,en)=>({pt,en});
const countryEntity=id=>{const country=countries.find(c=>c.id===id);if(!country?.isCountry)throw Error(`Unknown country ${id}`);return {id,label:text(country.nome_pt,country.nome_en),aliases:country.aliases.filter(alias=>/[a-z0-9]/i.test(alias.normalize('NFD')))};};
const retirement=(replacementId,reason='duplicate')=>({replacementId,reason});

/** Active content policy. Archived objects remain available only for old answer events.
 * Every replacement names an existing canonical question or one explicit conversion below. */
export const quizRetirements={
  'tf-eiffel-century':retirement('timeline-eiffel'),
  'tf-berlin-1991':retirement('timeline-berlin'),
  ...Object.fromEntries([
    ['tf-nepal-rectangle','bandeira-nepal'],['tf-bhutan-swan','dragao-branco'],
    ['tf-new-zealand-blue-stars','quatro-estrelas-vermelhas'],['tf-swiss-square-flag','bandeira-quadrada-suica'],
    ['tf-canada-maple-points','folha-onze-pontas'],['tf-grand-canyon-mississippi','grand-canyon'],
    ['tf-galapagos-ecuador','galapagos'],['tf-uluru-new-zealand','uluru'],['tf-rapa-nui-chile','moai'],
    ['tf-machu-picchu-mexico','machu-picchu'],['tf-petra-jordan','petra'],['tf-angkor-cambodia','angkor'],
    ['tf-serengeti-kenya','serengeti'],['tf-lesotho-altitude','lesoto-altitude'],
    ['tf-kiribati-hemispheres','quatro-hemisferios'],['tf-panama-indian-ocean','canal-dois-oceanos'],
    ['tf-everest-only-nepal','multiple-everest'],
  ].map(([id,replacement])=>[id,retirement(replacement)])),
  'tf-liechtenstein-doubly-landlocked':retirement('multiple-doubly-landlocked'),
  'duplamente-encravado':retirement('multiple-doubly-landlocked','format'),
  'tf-union-flag-1901':retirement('timeline-union-flag','format'),
  ...Object.fromEntries([
    ['bol','continental-landlocked-south-america'],['pry','continental-landlocked-south-america'],
    ['che','continental-landlocked-europe'],['aut','continental-landlocked-europe'],
    ['mng','continental-landlocked-asia'],['npl','continental-landlocked-asia'],
    ['lso','continental-landlocked-africa'],['uzb','continental-landlocked-asia'],
    ['lie','continental-landlocked-europe'],['ner','continental-landlocked-africa'],
  ].map(([iso,replacement])=>[`tf-landlocked-${iso}`,retirement(replacement,'consolidated')])),
  ...Object.fromEntries([
    'tokyo-north-paris','cairo-north-dubai','singapore-south-equator','nairobi-south-equator',
    'cape-town-south-sydney','buenos-aires-north-cape-town','mumbai-north-shanghai','marrakesh-north-london',
  ].map(slug=>[`tf-latitude-${slug}`,retirement(null,'low-value')])),
  'continental-australia-capricorn':retirement('country-capricorn-oceania','format'),
  'continental-borneo-three-countries':retirement('continental-island-borneo'),
  'continental-india-cancer':retirement('continental-cancer-asia'),
  'continental-malawi-ocean-coast':retirement('continental-landlocked-africa'),
  'flagsv-bangladesh-disc-centred':retirement('country-flag-bangladesh','format'),
  'flagsv-jamaica-red-colour':retirement('country-flag-jamaica','format'),
  'flagsv-philippines-peacetime-order':retirement('country-flag-philippines','format'),
  'flagsv-paraguay-two-sides':retirement('country-flag-paraguay','format'),
  'flagsv-lesotho-mokorotlo':retirement('country-flag-lesotho','format'),
};

export function curateQuizQuestions(authored){
  const bank=Object.fromEntries(authored.map(q=>[q.id,q]));
  const original=id=>{if(!bank[id])throw Error(`Missing editorial source: ${id}`);return bank[id];};
  const cleanExplanation=value=>value.replace(/^(Verdadeiro|Falso|True|False)[.:]?\s*/,'').replace(/^./,first=>first.toUpperCase());
  const countryQuestion=(oldId,id,pt,en)=>{
    const q=original(oldId);
    return {...q,id,revision:1,inputType:'TEXT_SINGLE',prompt:text(pt,en),suggestionDomain:'countries',
      explanation:text(cleanExplanation(q.explanation.pt),cleanExplanation(q.explanation.en)),
      answer:{accepted:q.countryIds.map(countryEntity)}};
  };
  const union=original('tf-union-flag-1901'),doubly=original('duplamente-encravado');
  const europeanIds=['020','040','112','756','203','348','383','438','442','498','807','674','688','703','336'];
  const additions=[
    {...union,id:'timeline-union-flag',revision:1,inputType:'SLIDER_TIMELINE',topicId:'union-flag:current-design',
      prompt:text('Em que ano foi adotado o desenho atual da Union Flag do Reino Unido, com a inclusão da cruz de São Patrício?',
        'In which year was the current design of the United Kingdom’s Union Flag adopted, with the addition of St Patrick’s cross?'),
      range:{min:1600,max:'CURRENT_YEAR',step:1},answer:{year:1801,toleranceYears:0}},
    {...doubly,id:'multiple-doubly-landlocked',revision:1,inputType:'TEXT_MULTIPLE',
      prompt:text('Nomeia os países sem litoral cujos vizinhos também não têm acesso direto ao oceano.',
        'Name the landlocked countries whose neighbours also have no direct access to the ocean.')},
    {schemaVersion:1,id:'continental-landlocked-europe',revision:1,inputType:'TEXT_MULTIPLE',category:'geography',topicId:'landlocked:europe',
      prompt:text('Nomeia países da Europa, segundo a divisão do jogo, que não têm costa marítima.',
        'Name countries in the game’s European region that have no maritime coastline.'),
      explanation:text('São quinze no catálogo principal, incluindo os pequenos Estados e o Kosovo. Ter margem num lago ou ligação fluvial ao oceano não equivale a ter costa marítima.',
        'There are fifteen in the main catalogue, including the small states and Kosovo. A lakeshore or river connection to the ocean is not a maritime coastline.'),
      sources:[{title:'Mledoze / Countries · landlocked field',url:'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'}],
      checkedAt:'2026-11-06',countryIds:europeanIds,suggestionDomain:'countries',answer:{accepted:europeanIds.map(countryEntity)}},
    countryQuestion('continental-australia-capricorn','country-capricorn-oceania',
      'Que país da Oceânia tem terra atravessada pelo trópico de Capricórnio?',
      'Which country in Oceania has land crossed by the Tropic of Capricorn?'),
    countryQuestion('flagsv-bangladesh-disc-centred','country-flag-bangladesh',
      'Que país asiático tem um disco vermelho deslocado para a haste sobre o fundo verde da sua bandeira?',
      'Which Asian country has a red disc shifted towards the hoist on the green field of its flag?'),
    countryQuestion('flagsv-jamaica-red-colour','country-flag-jamaica',
      'Que país das Caraíbas tem uma bandeira preta, verde e dourada, sem vermelho, branco nem azul?',
      'Which Caribbean country has a black, green and gold flag, with no red, white or blue?'),
    countryQuestion('flagsv-philippines-peacetime-order','country-flag-philippines',
      'Que país assinala tempo de guerra hasteando a sua bandeira horizontal com a faixa vermelha por cima da azul?',
      'Which country signals wartime by flying its flag horizontally with the red stripe above the blue stripe?'),
    countryQuestion('flagsv-paraguay-two-sides','country-flag-paraguay',
      'Que país sul-americano tem selos diferentes na frente e no verso da sua bandeira: uma estrela de um lado e um leão do outro?',
      'Which South American country has different seals on the front and back of its flag: a star on one side and a lion on the other?'),
    countryQuestion('flagsv-lesotho-mokorotlo','country-flag-lesotho',
      'Que país africano tem um chapéu tradicional basotho no centro da sua bandeira azul, branca e verde?',
      'Which African country has a traditional Basotho hat at the centre of its blue, white and green flag?'),
  ];
  for(const id of Object.keys(quizRetirements))original(id);
  const promptEdits={
    'tf-latitude-new-york-south-rome':text('Comparando os centros das cidades, Nova Iorque fica mais a sul do que Roma.','Comparing the city centres, New York lies farther south than Rome.'),
    'tf-latitude-london-north-vancouver':text('Comparando os centros das cidades, Londres fica mais a norte do que Vancouver.','Comparing the city centres, London lies farther north than Vancouver.'),
  };
  const active=authored.filter(q=>!Object.hasOwn(quizRetirements,q.id)).map(q=>promptEdits[q.id]?{...q,prompt:promptEdits[q.id]}:q).concat(additions);
  const activeIds=new Set(active.map(q=>q.id));
  for(const {replacementId} of Object.values(quizRetirements))if(replacementId&&!activeIds.has(replacementId))throw Error(`Inactive editorial replacement: ${replacementId}`);
  return active;
}

/** Preserve completed events. Only unanswered retired slots receive deterministic,
 * unique active questions; reloads cannot turn a saved boolean into a text answer. */
export function upgradeQuizQueue(game,bank,activeQuestions,recentQuestionIds=[]){
  const pending=game.queue.map((id,index)=>index>=game.index&&!game.answers[index]&&Object.hasOwn(quizRetirements,id));
  if(!pending.some(Boolean))return game;
  const questionTopic=q=>q.topicId||q.id;
  const protectedIds=new Set(game.queue.filter((_,index)=>!pending[index]));
  const topics=new Set([...protectedIds].map(id=>questionTopic(bank[id])));
  const locale=[...game.events].reverse().find(e=>e.locale)?.locale||game.queue.map(id=>bank[id]?.nameLanguage).find(Boolean)||'pt';
  const candidates=activeQuestions.filter(q=>!q.nameLanguage||q.nameLanguage===locale);
  let seed=0;for(const char of game.id)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
  const history=new Set(recentQuestionIds);
  const pool=candidates.slice(seed%candidates.length).concat(candidates.slice(0,seed%candidates.length));
  const queue=game.queue.map((id,index)=>{
    if(!pending[index])return id;
    const replacement=bank[quizRetirements[id].replacementId];
    const fits=q=>q&&!protectedIds.has(q.id)&&!topics.has(questionTopic(q));
    const selected=fits(replacement)?replacement:pool.find(q=>fits(q)&&!history.has(q.id))||pool.find(fits)||pool.find(q=>!protectedIds.has(q.id));
    if(!selected)throw Error('No unique question available for a retired quiz slot');
    protectedIds.add(selected.id);topics.add(questionTopic(selected));return selected.id;
  });
  return {...game,queue,revisions:Object.fromEntries(queue.map(id=>[id,bank[id].revision]))};
}
