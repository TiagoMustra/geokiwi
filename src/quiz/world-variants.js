import { explorationPlaces } from '../data/exploration-places.js';
import { distanceKm } from './engine.js';

const text=(pt,en)=>({pt,en});
const source=(title,url)=>({title,url});
const base=(slug,inputType,category,prompt,explanation,sources,countryIds=[],topicId=`world:${slug}`)=>({
  schemaVersion:1,id:`world-${slug}`,revision:1,inputType,category,topicId,prompt,explanation,sources,countryIds,checkedAt:'2026-11-06',
});
const unit=(id,pt,en)=>({id,label:text(pt,en)});
const km=unit('kilometres','quilómetros','kilometres'),m=unit('metres','metros','metres');
const number=(slug,prompt,explanation,sources,countryIds,answerUnit,value,extra={})=>({
  ...base(slug,'NUMBER_EXACT','dimensions',prompt,explanation,sources,countryIds),unit:answerUnit,bounds:{min:0},answer:{value,absoluteTolerance:0},...extra,
});
const timeline=(slug,year,min,prompt,explanation,sources,countryIds=[],topicId)=>({
  ...base(slug,'SLIDER_TIMELINE','history',prompt,explanation,sources,countryIds,topicId),range:{min,max:'CURRENT_YEAR',step:1},answer:{year,toleranceYears:0},
});

const numericalVariants=[
  number('panama-canal-length',text('Aproximadamente quantos quilómetros tem o Canal do Panamá entre os dois oceanos?', 'Approximately how many kilometres long is the Panama Canal between the two oceans?'),
    text('A Autoridade do Canal do Panamá descreve a via interoceânica como tendo aproximadamente 80 km.', 'The Panama Canal Authority describes the interoceanic waterway as approximately 80 km long.'),
    [source('Panama Canal Authority · How the canal works','https://pancanal.com/en/history-of-the-panama-canal/')],['591'],km,80),
  number('suez-canal-length-2015',text('Que comprimento total, em quilómetros, indica a Autoridade do Canal do Suez para a configuração de 2015?', 'What overall length, in kilometres, does the Suez Canal Authority give for the canal’s 2015 configuration?'),
    text('A tabela oficial regista 193,30 km em 2015; o canal original de 1869 era mais curto.', 'The official table records 193.30 km in 2015; the original canal of 1869 was shorter.'),
    [source('Suez Canal Authority · Canal Characteristics','https://www.suezcanal.gov.eg/English/About/SuezCanal/Pages/CanalCharacteristics.aspx')],['818'],km,193.3,{referenceYear:2015}),
  number('channel-tunnel-length',text('Quantos quilómetros tem o Túnel da Mancha no total, incluindo os troços sob terra?', 'How many kilometres long is the Channel Tunnel in total, including its sections under land?'),
    text('A Getlink indica 50,5 km no total. O comprimento da parte submarina é menor do que o comprimento de todo o túnel.', 'Getlink gives a total length of 50.5 km. The undersea section is shorter than the complete tunnel.'),
    [source('Getlink · The Channel Tunnel infrastructure','https://www.getlinkgroup.com/en/our-group/eurotunnel/channel-tunnel/')],['826','250'],km,50.5,{topicId:'world:channel-tunnel'}),
  number('baikal-depth',text('Qual é a profundidade máxima medida do lago Baikal, em metros, segundo o levantamento batimétrico INTAS?', 'What is Lake Baikal’s maximum sounded depth, in metres, according to the INTAS bathymetry project?'),
    text('O projeto batimétrico INTAS indica 1 642 m no ponto mais profundo da bacia central do Baikal.', 'The INTAS bathymetry project gives 1,642 m for the deepest point in Baikal’s central basin.'),
    [source('Limnological Institute · INTAS Project 99-1669, Morphometric Data','https://www.lin.irk.ru/intas_eng/morphometry.htm')],['643'],m,1642),
  number('titicaca-altitude',text('Aproximadamente a quantos metros acima do nível do mar fica o lago Titicaca?', 'Approximately how many metres above sea level is Lake Titicaca?'),
    text('O SERNANP apresenta o lago e a sua reserva a cerca de 3 810 m de altitude; o nível da água varia.', 'SERNANP describes the lake and its reserve at about 3,810 m elevation; the water level varies.'),
    [source('SERNANP · Titicaca National Reserve','https://visitaareasnaturales.sernanp.gob.pe/en/anps/titicaca-national-reserve/')],['604','068'],m,3810),
  number('great-barrier-reef-length',text('Ao longo de aproximadamente quantos quilómetros da costa australiana se estende a Grande Barreira de Coral?', 'Along approximately how many kilometres of Australia’s coast does the Great Barrier Reef extend?'),
    text('A Reef Authority descreve o sistema como estendendo-se por cerca de 2 300 km ao longo da costa nordeste da Austrália.', 'The Reef Authority describes the system as extending for about 2,300 km along Australia’s north-east coast.'),
    [source('Great Barrier Reef Marine Park Authority · Our story','https://www.gbrmpa.gov.au/about-us/our-story')],['036'],km,2300),
  number('victoria-falls-width',text('Aproximadamente quantos metros de largura têm as Cataratas Vitória, de uma margem à outra?', 'Approximately how many metres wide are Victoria Falls, from bank to bank?'),
    text('O Ministério do Turismo da Zâmbia indica aproximadamente 1 708 m de largura para as cataratas do Zambeze.', 'Zambia’s Ministry of Tourism gives an approximate width of 1,708 m for the falls on the Zambezi.'),
    [source('Zambia Ministry of Tourism · Victoria Falls overview','https://www.mot.gov.zm/wp-content/uploads/2024/06/About-the-Ministry.pdf')],['894','716'],m,1708),
  number('bering-strait-width',text('Aproximadamente quantos quilómetros de largura tem o estreito de Bering entre a Rússia e o Alasca?', 'Approximately how many kilometres wide is the Bering Strait between Russia and Alaska?'),
    text('O grupo Multiscale Ocean Dynamics da UC San Diego descreve o estreito como tendo cerca de 85 km de largura.', 'UC San Diego’s Multiscale Ocean Dynamics group describes the strait as about 85 km wide.'),
    [source('UC San Diego · Multiscale Ocean Dynamics, Bering Strait','https://www.mod.ucsd.edu/bering-strait')],['643','840'],km,85),
];

const historicalVariants=[
  timeline('channel-tunnel-inauguration',1994,1800,text('Em que ano foi inaugurado o Túnel da Mancha, ligando por ferrovia a Grã-Bretanha à Europa continental?', 'In which year was the Channel Tunnel inaugurated, linking Great Britain to continental Europe by rail?'),
    text('A inauguração ocorreu em 6 de maio de 1994. Os vários serviços comerciais começaram em datas posteriores desse ano.', 'The inauguration took place on 6 May 1994. The different commercial services began later that year.'),
    [source('Getlink · HM Queen Elizabeth II and the opening of the Tunnel','https://www.getlinkgroup.com/en/queen-elizabeth/')],['826','250'],'world:channel-tunnel'),
  timeline('yellowstone-established',1872,1700,text('Em que ano foi criado por lei o Parque Nacional de Yellowstone?', 'In which year was Yellowstone National Park established by law?'),
    text('A lei foi assinada em 1 de março de 1872. O National Park Service identifica Yellowstone como o primeiro parque nacional.', 'The act was signed on 1 March 1872. The National Park Service identifies Yellowstone as the first national park.'),
    [source('US National Park Service · Birth of a National Park','https://www.nps.gov/yell/learn/historyculture/yellowstoneestablishment.htm')],['840']),
  timeline('world-heritage-convention',1972,1900,text('Em que ano a UNESCO adotou a Convenção do Património Mundial, que une a proteção do património cultural e natural?', 'In which year did UNESCO adopt the World Heritage Convention, combining cultural and natural heritage protection?'),
    text('A Convenção foi adotada em 16 de novembro de 1972 e entrou em vigor em 1975.', 'The Convention was adopted on 16 November 1972 and entered into force in 1975.'),
    [source('UNESCO World Heritage Centre · The World Heritage Convention','https://whc.unesco.org/en/convention')]),
  timeline('singapore-independence',1965,1900,text('Em que ano Singapura se tornou um Estado independente, separando-se da Malásia?', 'In which year did Singapore become an independent state, separating from Malaysia?'),
    text('Singapura tornou-se independente em 9 de agosto de 1965, após ter integrado a Malásia durante dois anos.', 'Singapore became independent on 9 August 1965, after being part of Malaysia for two years.'),
    [source('Singapore Ministry of Foreign Affairs · Histories and Milestones','https://www.mfa.gov.sg/about-mfa/histories-and-milestones/')],['702']),
  timeline('brasilia-inauguration',1960,1800,text('Em que ano foi inaugurada Brasília, substituindo o Rio de Janeiro como capital do Brasil?', 'In which year was Brasília inaugurated, replacing Rio de Janeiro as Brazil’s capital?'),
    text('Brasília foi inaugurada em 21 de abril de 1960. A nova capital levou o centro político do país para o interior.', 'Brasília was inaugurated on 21 April 1960. The new capital moved the country’s political centre inland.'),
    [source('Senado Federal · Brasília 50 anos, cronologia','https://www.senado.gov.br/noticias/especiais/brasilia50anos/not02.asp')],['076']),
  timeline('gotthard-base-inauguration',2016,1900,text('Em que ano foi inaugurado o túnel ferroviário de base do São Gotardo, sob os Alpes suíços?', 'In which year was the Gotthard Base railway tunnel inaugurated beneath the Swiss Alps?'),
    text('A cerimónia de inauguração ocorreu em 1 de junho de 2016, na Suíça.', 'The opening ceremony took place on 1 June 2016, in Switzerland.'),
    [source('Canton Graubünden · Der Gotthard-Basistunnel ist eröffnet','https://www.gr.ch/DE/institutionen/verwaltung/diem/aev/aktuelles/aktuelles/Seiten/160606_gotthardtunnel.aspx')],['756']),
  timeline('amundsen-south-pole',1911,1800,text('Em que ano a expedição de Roald Amundsen chegou ao Polo Sul geográfico?', 'In which year did Roald Amundsen’s expedition reach the geographic South Pole?'),
    text('Amundsen e quatro companheiros chegaram em 14 de dezembro de 1911. O grupo de Scott alcançou o polo no mês seguinte.', 'Amundsen and four companions arrived on 14 December 1911. Scott’s party reached the pole the following month.'),
    [source('Fram Museum · The Third Fram Expedition 1910–1914','https://frammuseum.no/en/polar-history/expeditions/the-third-fram-expedition-1910-1914/')],['578']),
  timeline('vasco-da-gama-calicut',1498,1000,text('Em que ano a frota de Vasco da Gama chegou a Calecute, na primeira viagem marítima de Portugal à Índia pelo cabo da Boa Esperança?', 'In which year did Vasco da Gama’s fleet reach Calicut on the first sea voyage from Portugal to India via the Cape of Good Hope?'),
    text('A frota chegou a Calecute em 20 de maio de 1498. A viagem tinha começado em Lisboa em julho de 1497.', 'The fleet reached Calicut on 20 May 1498. The voyage had begun in Lisbon in July 1497.'),
    [source('Marinha Portuguesa · Dia da Marinha','https://www.marinha.pt/pt/a-marinha/simbolos-tradicoes/Paginas/dia-da-marinha.aspx')],['620','356']),
];

// Geometry.coordinates from Natural Earth v5.1.2 (not the auxiliary label coordinates).
const naturalEarth=source('Natural Earth v5.1.2 · Populated places, point geometry','https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_populated_places_simple.geojson');
export const worldVariantCities=[
  {id:'city-reykjavik',pt:'Reiquiavique',en:'Reykjavík',countryPt:'Islândia',countryEn:'Iceland',countryId:'352',lng:-21.936546,lat:64.143459},
  {id:'city-quito',pt:'Quito',en:'Quito',countryPt:'Equador',countryEn:'Ecuador',countryId:'218',lng:-78.501997,lat:-0.213042},
  {id:'city-ushuaia',pt:'Ushuaia',en:'Ushuaia',countryPt:'Argentina',countryEn:'Argentina',countryId:'032',lng:-68.310001,lat:-54.790003},
  {id:'city-honolulu',pt:'Honolulu',en:'Honolulu',countryPt:'Estados Unidos',countryEn:'United States',countryId:'840',lng:-157.858301,lat:21.303429},
  {id:'city-santiago',pt:'Santiago',en:'Santiago',countryPt:'Chile',countryEn:'Chile',countryId:'152',lng:-70.650504,lat:-33.440205},
  {id:'city-kathmandu',pt:'Catmandu',en:'Kathmandu',countryPt:'Nepal',countryEn:'Nepal',countryId:'524',lng:85.314696,lat:27.718638},
  {id:'city-wellington',pt:'Wellington',en:'Wellington',countryPt:'Nova Zelândia',countryEn:'New Zealand',countryId:'554',lng:174.777201,lat:-41.292068},
  {id:'city-oslo',pt:'Oslo',en:'Oslo',countryPt:'Noruega',countryEn:'Norway',countryId:'578',lng:10.748033,lat:59.918636},
];
const cityPins=worldVariantCities.map(city=>({
  ...base(`pin-${city.id}`,'MAP_PINPOINT','city',text(`Coloca o pin no centro de ${city.pt} (${city.countryPt}).`,`Place the pin in central ${city.en} (${city.countryEn}).`),
    text(`Localização: ${city.pt} · ${city.countryPt}. O ponto representa o centro da cidade no catálogo Natural Earth.`,`Location: ${city.en} · ${city.countryEn}. The point represents the city centre in the Natural Earth catalogue.`),[naturalEarth],[city.countryId],`geo:${city.id}`),
  placeType:'city',answer:{point:{lat:city.lat,lng:city.lng},toleranceKm:15,decayKm:500},
}));
const existingCities=explorationPlaces.filter(p=>p.type==='city').map(p=>({id:p.id,pt:p.name_pt,en:p.name_en,countryIds:p.countryIds,lng:p.coordinates[0],lat:p.coordinates[1]}));
const cities=Object.fromEntries([...existingCities,...worldVariantCities,{id:'city-lhasa',pt:'Lassa',en:'Lhasa',countryId:'156',lng:91.10001,lat:29.645024},{id:'city-madrid',pt:'Madrid',en:'Madrid',countryId:'724',lng:-3.685297,lat:40.401972}].map(c=>[c.id,c]));
// Selected geographical contrasts, rather than a combinatorial all-pairs bank.
const routes=[
  ['quito','singapore',text('Quito e Singapura ficam quase em lados opostos da Terra. Que distância em linha reta separa os seus centros?', 'Quito and Singapore are almost on opposite sides of Earth. How far apart are their centres, as the crow flies?')],
  ['wellington','madrid',text('Wellington e Madrid ficam perto de ser antípodas. Quantos quilómetros separam os seus centros em linha reta?', 'Wellington and Madrid are close to being antipodes. How many kilometres separate their centres, as the crow flies?')],
  ['ushuaia','cape-town',text('Atravessando o Atlântico Sul, que distância em linha reta separa Ushuaia da Cidade do Cabo?', 'Across the South Atlantic, how far apart are Ushuaia and Cape Town, as the crow flies?')],
  ['honolulu','tokyo',text('Através do Pacífico, quantos quilómetros separam Honolulu de Tóquio em linha reta?', 'Across the Pacific, how many kilometres separate Honolulu and Tokyo, as the crow flies?')],
  ['reykjavik','oslo',text('Que distância em linha reta separa as capitais da Islândia e da Noruega: Reiquiavique e Oslo?', 'How far apart are Iceland’s and Norway’s capitals, Reykjavík and Oslo, as the crow flies?')],
  ['santiago','buenos-aires',text('Entre as capitais do Chile e da Argentina, que distância em linha reta separa Santiago de Buenos Aires?', 'Between the capitals of Chile and Argentina, how far apart are Santiago and Buenos Aires, as the crow flies?')],
  ['kathmandu','lhasa',text('Atravessando a região dos Himalaias, que distância em linha reta separa Catmandu de Lassa?', 'Across the Himalayan region, how far apart are Kathmandu and Lhasa, as the crow flies?')],
  ['lisbon','reykjavik',text('Ao longo do Atlântico Norte, quantos quilómetros separam Lisboa de Reiquiavique em linha reta?', 'Along the North Atlantic, how many kilometres separate Lisbon and Reykjavík, as the crow flies?')],
];
const cityDistances=routes.map(([from,to,prompt])=>{
  const a=cities[`city-${from}`],b=cities[`city-${to}`],value=Math.round(distanceKm(a,b));
  return {...base(`distance-${from}-${to}`,'SLIDER_DISTANCE','distance',prompt,
    text(`Os centros de ${a.pt} e ${b.pt} ficam a cerca de ${value.toLocaleString('pt-PT')} km em grande círculo; não se mede a estrada nem o percurso de um voo.`,`The centres of ${a.en} and ${b.en} are about ${value.toLocaleString('en-GB')} km apart along a great circle; road and flight routes are not measured.`),
    [naturalEarth],[...new Set([...(a.countryIds||[a.countryId]),...(b.countryIds||[b.countryId])])],`distance:${[from,to].sort().join(':')}`),answer:{km:value,toleranceKm:25}};
});

export const worldVariants=[...numericalVariants,...historicalVariants,...cityPins,...cityDistances];
