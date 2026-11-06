const text = (pt, en) => ({ pt, en });
const unit = (id, pt, en) => ({ id, label: text(pt, en) });
const people = unit('people', 'habitantes', 'people');
const squareKilometres = unit('square-kilometres', 'km²', 'km²');
const kilometres = unit('kilometres', 'quilómetros', 'kilometres');
const metres = unit('metres', 'metros', 'metres');
const islands = unit('islands', 'ilhas', 'islands');
const source = (title, url) => ({ title, url });

// The historical NUMBER_EXACT type now receives proximity scoring in the engine.
// Keep the sourced target intact; no question asks the player for exact precision.
const number = (id, category, prompt, explanation, sources, countryIds, answerUnit, value, extra = {}) => ({
  schemaVersion: 1,
  id: `number-${id}`,
  revision: 1,
  category,
  prompt,
  explanation,
  sources,
  checkedAt: '2026-11-06',
  countryIds,
  inputType: 'NUMBER_EXACT',
  unit: answerUnit,
  bounds: { min: 0 },
  answer: { value, absoluteTolerance: 0 },
  ...extra,
});

const populationMetadata = source(
  'World Bank · Population, total (SP.POP.TOTL), definition',
  'https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SP.POP.TOTL',
);
const areaMetadata = source(
  'World Bank · Surface area (AG.SRF.TOTL.K2), definition',
  'https://databank.worldbank.org/metadataglossary/world-development-indicators/series/AG.SRF.TOTL.K2',
);
const formatPt = value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const formatEn = value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Snapshot of the World Bank API, WDI release lastupdated 2026-10-08.
// [ISO3, country ID, Portuguese genitive, English name, 2024 population]
const populations = [
  ['PRT', '620', 'de Portugal', 'Portugal', 10694681],
  ['BRA', '076', 'do Brasil', 'Brazil', 211998573],
  ['IND', '356', 'da Índia', 'India', 1450935791],
  ['CHN', '156', 'da China', 'China', 1408975000],
  ['USA', '840', 'dos Estados Unidos', 'the United States', 340003797],
  ['JPN', '392', 'do Japão', 'Japan', 123975371],
  ['NGA', '566', 'da Nigéria', 'Nigeria', 232679478],
  ['DEU', '276', 'da Alemanha', 'Germany', 83516593],
  ['NZL', '554', 'da Nova Zelândia', 'New Zealand', 5290000],
  ['CAN', '124', 'do Canadá', 'Canada', 41262329],
  ['IDN', '360', 'da Indonésia', 'Indonesia', 283487931],
  ['MEX', '484', 'do México', 'Mexico', 130861007],
];

// Canada is deliberately excluded: its API observation conflicted with StatCan.
// [ISO3, country ID, Portuguese genitive, English name, 2023 surface area in km²]
const areas = [
  ['PRT', '620', 'de Portugal', 'Portugal', 92230],
  ['BRA', '076', 'do Brasil', 'Brazil', 8510420],
  ['AUS', '036', 'da Austrália', 'Australia', 7741220],
  ['JPN', '392', 'do Japão', 'Japan', 377969.3],
  ['NZL', '554', 'da Nova Zelândia', 'New Zealand', 267710],
];

/** @type {import('./types').QuizQuestion[]} */
export const numberExpansion = [
  ...populations.map(([iso, countryId, ptName, enName, value]) => number(
    `population-${iso.toLowerCase()}-2024`, 'population',
    text(`Segundo o Banco Mundial, qual era a população estimada ${ptName} em 2024?`, `According to the World Bank, what was the estimated population of ${enName} in 2024?`),
    text(`Estimativa para meados de 2024: ${formatPt(value)} habitantes; não é uma contagem censitária.`, `Mid-2024 estimate: ${formatEn(value)} people; this is not a census count.`),
    [source(`World Bank · ${iso} population, 2024`, `https://api.worldbank.org/v2/country/${iso}/indicator/SP.POP.TOTL?date=2024&format=json`), populationMetadata],
    [countryId], people, value, { referenceYear: 2024 },
  )),
  ...areas.map(([iso, countryId, ptName, enName, value]) => number(
    `surface-area-${iso.toLowerCase()}-2023`, 'dimensions',
    text(`Segundo o Banco Mundial, qual era a superfície total ${ptName} em 2023, em km²?`, `According to the World Bank, what was the total surface area of ${enName} in 2023, in km²?`),
    text(`O indicador regista ${value.toLocaleString('pt-PT')} km² e inclui águas interiores e algumas águas costeiras.`, `The indicator records ${value.toLocaleString('en-GB')} km², including inland water and some coastal waterways.`),
    [source(`World Bank · ${iso} surface area, 2023`, `https://api.worldbank.org/v2/country/${iso}/indicator/AG.SRF.TOTL.K2?date=2023&format=json`), areaMetadata],
    [countryId], squareKilometres, value, { referenceYear: 2023 },
  )),
  number(
    'surface-area-canada', 'dimensions',
    text('Qual é a área total do Canadá, incluindo terra e água doce, segundo a Statistics Canada?', 'What is Canada’s total area, including land and freshwater, according to Statistics Canada?'),
    text('A Statistics Canada indica 9 984 670 km² para o total de terra e água doce.', 'Statistics Canada gives 9,984,670 km² for land and freshwater combined.'),
    [source('Statistics Canada · Canada Year Book 2012, Geography', 'https://www150.statcan.gc.ca/n1/pub/11-402-x/2012000/chap/geo/geo-eng.htm'), source('Statistics Canada · Land and freshwater area table', 'https://epe.lac-bac.gc.ca/100/205/301/statcan/canada_e-book-ef/05-01-21/www.statcan.ca/english/Pgdb/phys01.htm?nodisclaimer=1')],
    ['124'], squareKilometres, 9984670,
  ),
  number(
    'earth-moon-distance', 'distance',
    text('Qual é a distância média entre a Terra e a Lua, em quilómetros?', 'What is the average distance between Earth and the Moon, in kilometres?'),
    text('A NASA indica uma distância média de 384 400 km; a distância varia ao longo da órbita.', 'NASA gives an average distance of 384,400 km; the distance changes over the orbit.'),
    [source('NASA Science · Moon Facts, Size and Distance', 'https://science.nasa.gov/moon/facts/')],
    [], kilometres, 384400,
  ),
  number(
    'earth-equatorial-circumference', 'dimensions',
    text('Quantos quilómetros mede uma volta à Terra pelo equador?', 'How many kilometres is one trip around Earth along the equator?'),
    text('A circunferência equatorial da Terra é de cerca de 40 075 km.', 'Earth’s equatorial circumference is about 40,075 km.'),
    [source('NASA · Interesting Fact of the Month 2020, Earth’s rotation', 'https://www.nasa.gov/space-science-and-astrobiology-at-ames/interesting-fact-of-the-month-current/interesting-fact-of-the-month-2020/'), source('NASA · Moon and Earth Comparison Worksheet, page 44', 'https://www.nasa.gov/pdf/475486main_HEP_I_MS_6.pdf')],
    [], kilometres, 40075,
  ),
  number(
    'grand-canyon-length', 'dimensions',
    text('Segundo o National Park Service, quantos quilómetros tem o Grand Canyon ao longo do rio, de Lees Ferry às Grand Wash Cliffs?', 'According to the National Park Service, how many kilometres does the Grand Canyon stretch along the river from Lees Ferry to the Grand Wash Cliffs?'),
    text('A página de perguntas frequentes do NPS mede esse percurso em 446 km, ou 277 milhas fluviais.', 'The NPS FAQ measures this route as 446 km, or 277 river miles.'),
    [source('National Park Service · Grand Canyon FAQ, How big is it?', 'https://www.nps.gov/grca/faqs.htm')],
    ['840'], kilometres, 446,
  ),
  number(
    'eiffel-tower-height-2022', 'dimensions',
    text('Que altura total passou a ter a Torre Eiffel após a instalação da antena de março de 2022?', 'What total height did the Eiffel Tower reach after its antenna was installed in March 2022?'),
    text('A nova antena elevou a Torre Eiffel a 330 metros em 15 de março de 2022.', 'The new antenna brought the Eiffel Tower to 330 metres on 15 March 2022.'),
    [source('Société d’Exploitation de la Tour Eiffel · From 300 to 330 meters', 'https://www.toureiffel.paris/en/news/history-and-culture/300-330-meters-story-towers-height')],
    ['250'], metres, 330, { referenceYear: 2022 },
  ),
  number(
    'burj-khalifa-height', 'dimensions',
    text('Qual é a altura arquitetónica do Burj Khalifa, no Dubai, em metros?', 'What is the architectural height of the Burj Khalifa in Dubai, in metres?'),
    text('A altura arquitetónica é de 828 metros, incluindo a agulha; a medição até à ponta técnica é diferente.', 'The architectural height is 828 metres, including the spire; the measurement to the technical tip is different.'),
    [source('Council on Vertical Urbanism · The Skyscraper Center, Burj Khalifa', 'https://www.skyscrapercenter.com/building/burj-khalifa/3-2')],
    ['784'], metres, 828,
  ),
  number(
    'tokyo-skytree-height', 'dimensions',
    text('Qual é a altura total da Tokyo Skytree, em metros?', 'What is the total height of Tokyo Skytree, in metres?'),
    text('A altura total da Tokyo Skytree é de 634 metros.', 'Tokyo Skytree’s total height is 634 metres.'),
    [source('Tokyo Skytree · Official specifications', 'https://www.tokyo-skytree.jp/about/spec/')],
    ['392'], metres, 634,
  ),
  number(
    'golden-gate-main-span', 'dimensions',
    text('Quantos metros mede o vão principal da Golden Gate Bridge, entre as duas torres?', 'How many metres is the Golden Gate Bridge’s main span, between its two towers?'),
    text('O vão principal mede 1 280 metros; corresponde à distância entre as duas torres.', 'The main span measures 1,280 metres, the distance between the two towers.'),
    [source('Golden Gate Bridge Highway and Transportation District · Design & Construction Stats', 'https://www.goldengate.org/bridge/history-research/statistics-data/design-construction-stats/')],
    ['840'], metres, 1280,
  ),
  number(
    'kilimanjaro-elevation', 'dimensions',
    text('Qual é a altitude do ponto mais alto do Kilimanjaro, em metros acima do nível do mar?', 'What is the elevation of Kilimanjaro’s highest point, in metres above sea level?'),
    text('A UNESCO indica 5 895 metros para o cume do Kilimanjaro, na Tanzânia.', 'UNESCO gives 5,895 metres for the summit of Kilimanjaro in Tanzania.'),
    [source('UNESCO World Heritage Centre · Kilimanjaro National Park', 'https://whc.unesco.org/en/list/403/')],
    ['834'], metres, 5895,
  ),
  number(
    'mount-fuji-elevation', 'dimensions',
    text('Qual é a altitude do monte Fuji, em metros acima do nível do mar?', 'What is Mount Fuji’s elevation, in metres above sea level?'),
    text('O monte Fuji atinge aproximadamente 3 776 metros, segundo a UNESCO.', 'Mount Fuji reaches approximately 3,776 metres, according to UNESCO.'),
    [source('UNESCO World Heritage Centre · Fujisan', 'https://whc.unesco.org/en/list/1418/')],
    ['392'], metres, 3776,
  ),
  number(
    'denali-elevation', 'dimensions',
    text('Qual é a altitude do Denali, também chamado Mount McKinley, em metros acima do nível do mar?', 'What is the elevation of Denali, also called Mount McKinley, in metres above sea level?'),
    text('O cume mais alto atinge cerca de 6 190 metros, segundo o National Park Service.', 'The highest summit reaches about 6,190 metres, according to the National Park Service.'),
    [source('National Park Service · Denali Park Road, Mile 11 Pullout', 'https://www.nps.gov/places/dena-mile-11.htm')],
    ['840'], metres, 6190,
  ),
  number(
    'canadian-provinces', 'geography',
    text('Quantas províncias tem o Canadá, sem contar os territórios?', 'How many provinces does Canada have, excluding its territories?'),
    text('O Canadá tem 10 províncias e, separadamente, três territórios.', 'Canada has 10 provinces and, separately, three territories.'),
    [source('Government of Canada · Provinces and territories', 'https://www.canada.ca/en/intergovernmental-affairs/services/provinces-territories.html')],
    ['124'], unit('provinces', 'províncias', 'provinces'), 10,
  ),
  number(
    'swiss-cantons', 'geography',
    text('Quantos cantões constituem a Suíça?', 'How many cantons make up Switzerland?'),
    text('A Suíça é constituída por 26 cantões.', 'Switzerland consists of 26 cantons.'),
    [source('Swiss Federal Department of Foreign Affairs · Federalism', 'https://www.aboutswitzerland.eda.admin.ch/en/federalism')],
    ['756'], unit('cantons', 'cantões', 'cantons'), 26,
  ),
  number(
    'japan-islands-2023', 'geography',
    text('Quantas ilhas contou a autoridade cartográfica do Japão na contagem divulgada em 2023?', 'How many islands did Japan’s mapping authority count in the results released in 2023?'),
    text('A GSI contou 14 125 ilhas com base no mapa de janeiro de 2022 e nos seus critérios de contagem; excluiu as ilhas em lagos.', 'GSI counted 14,125 islands using the January 2022 map and its counting criteria; islands in lakes were excluded.'),
    [source('Geospatial Information Authority of Japan · Number of islands', 'https://www.gsi.go.jp/kihonjohochousa/islands_index.html'), source('Geospatial Information Authority of Japan · 28 February 2023 announcement', 'https://svd1-web1.gsi.go.jp/kihonjohochousa/pressrelease20230228.html')],
    ['392'], islands, 14125, { referenceYear: 2022 },
  ),
  number(
    'philippines-islands', 'geography',
    text('Quantas ilhas têm as Filipinas, segundo o seu Departamento de Turismo?', 'How many islands do the Philippines have, according to their Department of Tourism?'),
    text('O Departamento de Turismo das Filipinas divulga um total de 7 641 ilhas.', 'The Philippine Department of Tourism gives a total of 7,641 islands.'),
    [source('Philippine Department of Tourism · Island Hopping', 'https://www.tourism.gov.ph/article/island-hopping-0-21/')],
    ['608'], islands, 7641,
  ),
  number(
    'fiji-islands', 'geography',
    text('Quantas ilhas tem Fiji, segundo o guia oficial Tourism Fiji?', 'How many islands does Fiji have, according to the official Tourism Fiji guide?'),
    text('O guia Discover Fiji da Tourism Fiji apresenta o arquipélago como um conjunto de 333 ilhas.', 'Tourism Fiji’s Discover Fiji guide describes the archipelago as a group of 333 islands.'),
    [source('Tourism Fiji · Discover Fiji', 'https://www.fiji.travel/things-to-know/destination-guide/discover-fiji')],
    ['242'], islands, 333,
  ),
];
