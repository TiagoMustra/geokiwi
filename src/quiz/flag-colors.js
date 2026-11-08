import countries from '../data/countries.json' with {type:'json'};
const byIso=Object.fromEntries(countries.filter(c=>c.isCountry).map(c=>[c.iso3,c]));
const text=(pt,en)=>({pt,en});
const regions={europa:text('da Europa','in Europe'),africa:text('de África','in Africa'),asia:text('da Ásia','in Asia'),americas:text('das Américas','in the Americas'),oceania:text('da Oceânia','in Oceania')};
const colors={red:text('vermelho','red'),white:text('branco','white'),blue:text('azul','blue'),green:text('verde','green'),yellow:text('amarelo','yellow'),black:text('preto','black')};
// Complete answer sets for the stated scope. Exclude coats/seals, retain backing panels.
// Gold counts as yellow, maroon as red, orange remains a distinct colour.
export const flagColorDefinitions=[
  ['europa',['red','white','blue'],false,'CZE FRA GBR HRV ISL LUX NLD NOR RUS SRB SVK SVN'],
  ['africa',['green','yellow','red'],false,'BEN BFA CAF CMR COG COM ERI ETH GHA GIN GNB MLI MOZ MRT MUS NAM SEN SSD STP SYC TGO ZAF ZWE'],
  ['oceania',['red','white','blue'],false,'AUS FJI KIR NZL TUV WSM'],
  ['americas',['red','white','blue'],false,'ATG BLZ CHL CRI CUB DOM HTI PAN PRY USA VEN'],
  ['asia',['red','white'],false,'ARE AZE BHR GEO IDN IRN IRQ JOR JPN KHM KOR KWT LAO LBN MDV MMR MYS NPL OMN PHL PRK PSE QAT SGP SYR THA TJK TKM TLS TUR TWN UZB YEM'],
  ['asia',['green','white'],false,'ARE AZE IND IRN IRQ JOR KWT LBN MDV MMR OMN PAK PSE SAU SYR TJK TKM UZB'],
  ['africa',['blue','white'],false,'BWA CAF COM CPV DJI GMB GNQ LBR LSO NAM SLE SOM SSD SWZ SYC ZAF'],
  ['africa',['green','yellow','blue'],false,'CAF COM ERI ETH GAB MUS NAM RWA SSD SYC TZA ZAF'],
  ['africa',['red','black','white'],false,'EGY KEN LBY MOZ SDN SSD SWZ UGA ZAF ZWE'],
  ['europa',['blue','white'],true,'FIN GRC SMR'],
  ['europa',['blue','yellow'],true,'SWE UKR'],
  ['europa',['black','red','yellow'],true,'BEL DEU'],
  ['europa',['red','yellow'],true,'ESP MKD MNE'],
  ['europa',['red','green','white'],true,'BGR BLR HUN ITA'],
  ['europa',['blue','yellow','red'],true,'AND LIE MDA ROU'],
  ['asia',['red','white'],true,'BHR GEO IDN JPN QAT SGP TUR'],
  ['asia',['red','white','blue'],true,'KHM LAO NPL PRK THA TWN'],
  ['asia',['red','yellow'],true,'CHN KGZ VNM'],
  ['asia',['red','green','white'],true,'IRN LBN OMN'],
  ['americas',['blue','white'],true,'GTM HND NIC SLV'],
  ['americas',['red','white'],true,'CAN PER'],
  ['americas',['blue','black','yellow'],true,'BHS BRB'],
  ['americas',['red','green'],false,'BOL DMA GRD GUY KNA MEX SUR'],
  ['oceania',['blue','yellow'],false,'KIR NRU PLW SLB TUV'],
  ['oceania',['blue','white'],false,'AUS FJI FSM KIR MHL NRU NZL SLB TUV WSM'],
  ['oceania',['red','yellow'],false,'KIR PNG TUV VUT'],
];
const list=(items,locale)=>new Intl.ListFormat(locale==='pt'?'pt-PT':'en-GB',{style:'long',type:'conjunction'}).format(items);
export const flagColorQuestions=flagColorDefinitions.map(([region,palette,only,isoString])=>{
  const isos=isoString.split(' '),cs=isos.map(iso=>{
    const c=byIso[iso];if(!c||c.continente!==region)throw Error(`Invalid flag colour scope: ${iso}`);return c;
  });
  const colorText=locale=>list(palette.map(color=>colors[color][locale]),locale);
  return {schemaVersion:1,id:`flag-colors-${region}-${palette.join('-')}-${only?'only':'contains'}`,revision:1,inputType:'TEXT_MULTIPLE',category:'flags',topicId:`flag-colors:${region}:${[...palette].sort().join('-')}:${only?'only':'contains'}`,
    prompt:text(`Nomeia países ${regions[region].pt} cuja bandeira tem ${only?'apenas ':''}${colorText('pt')}. ${only?'':'Pode ter outras cores. '}Ignora brasões, selos e contornos finos; inclui os tons das cores indicadas.`,
      `Name countries ${regions[region].en} whose flag has ${only?'only ':''}${colorText('en')}. ${only?'':'Other colours are allowed. '}Ignore coats of arms, seals and fine outlines; include shades of the named colours.`),
    explanation:text(`Contam ${list(cs.map(c=>c.nome_pt),'pt')}. Incluem-se os painéis de fundo e símbolos fora dos brasões; dourado conta como amarelo e bordô como vermelho, mas laranja é distinto.`,
      `Accepted: ${list(cs.map(c=>c.nome_en),'en')}. Background panels and symbols outside coats of arms count; gold counts as yellow and maroon as red, but orange is distinct.`),
    sources:[{title:'UN Vienna Protocol · National flags supplied by Permanent Missions',url:'https://www.unvienna.org/uploads/protocol/res/generic-information_html/A-Z_Flags_external.pdf'},
      {title:'flag-icons · National flag SVG collection',url:'https://github.com/lipis/flag-icons/tree/main/flags/4x3'},
      ...(isos.includes('SYR')?[{title:'Syrian Ministry of Culture · Current flag',url:'https://events.moc.gov.sy/en/about-flag'}]:[]),
      ...(isos.includes('KHM')?[{title:'Cambodian Embassy · Official flag colour specifications',url:'https://asean.org/wp-content/uploads/2020/10/flagspec_Cambodia-Flag-specifications.pdf'}]:[]),
      ...(isos.includes('QAT')?[{title:'Qatar Amiri Diwan · Flag colours',url:'https://www.diwan.gov.qa/en/about-qatar'}]:[])],checkedAt:'2026-11-09',countryIds:cs.map(c=>c.id),suggestionDomain:'countries',
    answer:{accepted:cs.map(c=>({id:c.id,label:text(c.nome_pt,c.nome_en),aliases:c.aliases.filter(alias=>/[a-z0-9]/i.test(alias.normalize('NFD')))}))},
  };
});
