import countries from '../data/countries.json' with {type:'json'};

const byIso=Object.fromEntries(countries.filter(c=>c.isCountry).map(c=>[c.iso3,c]));
const text=(pt,en)=>({pt,en});
const source=(title,url)=>({title,url});
const naturalEarth=source('Natural Earth v5.1.2 · Admin 0 countries (latitude intersections)','https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson');
const latitude=source('NOAA · What is latitude?','https://oceanservice.noaa.gov/facts/latitude.html');
const rolas=source('São Tomé e Príncipe official tourism · An Island Paradise','https://turismo.gov.st/en/pourquoi-sao-tome-et-principe/nature/island-paradise');
const landlocked=source('Mledoze / Countries · landlocked field','https://raw.githubusercontent.com/mledoze/countries/master/countries.json');
const lldcs=source('United Nations · About Landlocked Developing Countries','https://www.un.org/en/landlocked/about-landlocked-developing-countries');
const borneo=source('NASA Marshall Space Flight Center · Borneo from space','https://www.flickr.com/photos/nasamarshall/14556034397');
const newGuinea=source('NASA Earth Observatory · Forest Change on New Ireland','https://science.nasa.gov/earth/earth-observatory/forest-change-on-new-ireland-papua-new-guinea-8842/');
const hispaniola=source('NASA MODIS · Haiti and Dominican Republic','https://modis.gsfc.nasa.gov/gallery/individual.php?db_date=2016-02-07');
const tierra=source('European Space Agency · Tierra del Fuego by Sentinel-1D','https://www.esa.int/ESA_Multimedia/Images/2025/11/Tierra_del_Fuego_by_Sentinel-1D');
const victoria=source('Kenya Water Resources Authority · Lake Victoria South Basin','https://wra.go.ke/lake-victoria-south-basin-area/');
const tanganyika=source('Lake Tanganyika Authority · Contracting Countries','https://lta-alt.org/en/contracting-countries/');
const titicaca=source('UNESCO · Lake Titicaca (Peruvian tentative-list submission)','https://whc.unesco.org/en/tentativelists/5080/');
const malawi=source('FAO · Source book for inland fishery resources of Africa, Lake Malawi/Nyasa','https://www.fao.org/4/t0473e/T0473E05.htm');
const benelux=source('Government of the Netherlands · Economic alliances in Europe','https://business.gov.nl/coming-to-the-netherlands/living-in-the-netherlands/economic-alliances-in-europe/');
const baltic=source('Latvian Ministry of Foreign Affairs · Co-operation among the Baltic States','https://www.mfa.gov.lv/en/co-operation-among-baltic-states');
const m49=source('United Nations Statistics Division · M49 geographic regions','https://unstats.un.org/unsd/methodology/m49/overview/');
const gambia=source('Government of The Gambia · About The Gambia','https://gambia.gov.gm/about/');
const lesotho=source('World Bank · Lesotho Systematic Country Diagnostic','https://documents.worldbank.org/curated/en/371421468188678379/pdf/97812-CAS-P152099-IDA-SecM2015-0141-IFC-SecM2015-0055-PUBLIC-disclosed-7-2-15.pdf');
const entity=iso=>{const c=byIso[iso];if(!c)throw Error(`Unknown continental answer ${iso}`);return {id:c.id,label:text(c.nome_pt,c.nome_en),aliases:c.aliases.filter(a=>/[a-z0-9]/i.test(a.normalize('NFD')))};};
const base=(slug,inputType,topicId,prompt,explanation,sources,isos=[])=>({schemaVersion:1,id:`continental-${slug}`,revision:1,inputType,category:'geography',topicId,prompt,explanation,sources,checkedAt:'2026-11-06',countryIds:isos.map(iso=>byIso[iso].id)});
const list=(slug,topicId,isos,prompt,explanation,sources)=>({...base(slug,'TEXT_MULTIPLE',topicId,prompt,explanation,sources,isos),suggestionDomain:'countries',answer:{accepted:isos.map(entity)}});
const single=(slug,topicId,iso,prompt,explanation,sources)=>({...base(slug,'TEXT_SINGLE',topicId,prompt,explanation,sources,[iso]),suggestionDomain:'countries',answer:{accepted:[entity(iso)]}});
const tf=(slug,topicId,value,prompt,explanation,sources,isos=[])=>({...base(slug,'TRUE_FALSE',topicId,prompt,explanation,sources,isos),answer:{value}});
const number=(slug,topicId,value,prompt,explanation,sources)=>({...base(slug,'NUMBER_EXACT',topicId,prompt,explanation,sources),unit:{id:'countries',label:text('países','countries')},bounds:{min:0,max:200},answer:{value,absoluteTolerance:0}});

/** Complete bounded groups. Latitude questions count land, not territorial waters.
 * São Tomé's tiny Ilhéu das Rolas is a verified addition to the generalized map.
 * See docs/quiz-continental-provenance.md for boundary and source details. */
export const continentalVariants=[
  list('equator-land-world','latitude:equator-land',['ECU','COL','BRA','STP','GAB','COG','COD','UGA','KEN','SOM','IDN'],
    text('Nomeia países onde a linha do Equador atravessa terra, incluindo ilhas; só águas territoriais não contam.','Name countries where the Equator crosses land, including islands; territorial waters alone do not count.'),
    text('São onze: três nas Américas, sete em África e a Indonésia. São Tomé e Príncipe conta pelo Ilhéu das Rolas; Maldivas e Kiribati não têm terra sobre a linha.',
      'There are eleven: three in the Americas, seven in Africa, and Indonesia. São Tomé and Príncipe qualifies through Ilhéu das Rolas; the Maldives and Kiribati have no land on the line.'),[naturalEarth,rolas,latitude]),
  list('equator-land-africa','latitude:equator-land',['STP','GAB','COG','COD','UGA','KEN','SOM'],
    text('Nomeia países africanos atravessados pelo Equador em terra, incluindo ilhas.','Name African countries whose land, including islands, is crossed by the Equator.'),
    text('São Tomé e Príncipe, Gabão, os dois Congos, Uganda, Quénia e Somália. Apesar do nome, a Guiné Equatorial não tem terra sobre a linha.',
      'São Tomé and Príncipe, Gabon, both Congos, Uganda, Kenya, and Somalia qualify. Despite its name, Equatorial Guinea has no land on the line.'),[naturalEarth,rolas,latitude]),
  list('equator-land-americas','latitude:equator-land',['ECU','COL','BRA'],
    text('Nomeia países das Américas onde a linha do Equador atravessa terra.','Name countries in the Americas where the Equator crosses land.'),
    text('Equador, Colômbia e Brasil são os três países americanos atravessados pela linha dos 0° de latitude.','Ecuador, Colombia, and Brazil are the three American countries crossed by the line of 0° latitude.'),[naturalEarth,latitude]),
  list('capricorn-africa','latitude:capricorn-africa',['NAM','BWA','ZAF','MOZ','MDG'],
    text('Nomeia países africanos atravessados em terra pelo trópico de Capricórnio, a cerca de 23,4° S.','Name African countries crossed on land by the Tropic of Capricorn, at about 23.4° S.'),
    text('A linha atravessa Namíbia, Botswana, África do Sul, Moçambique e Madagáscar. É o limite sul da zona tropical.','The line crosses Namibia, Botswana, South Africa, Mozambique, and Madagascar. It marks the southern edge of the tropics.'),[naturalEarth,latitude]),
  list('capricorn-americas','latitude:capricorn-americas',['CHL','ARG','PRY','BRA'],
    text('Nomeia países das Américas atravessados em terra pelo trópico de Capricórnio.','Name countries in the Americas crossed on land by the Tropic of Capricorn.'),
    text('Chile, Argentina, Paraguai e Brasil são atravessados por este paralelo do hemisfério sul.','Chile, Argentina, Paraguay, and Brazil are crossed by this Southern Hemisphere parallel.'),[naturalEarth,latitude]),
  list('cancer-asia','latitude:cancer-asia',['SAU','ARE','OMN','IND','BGD','MMR','CHN','TWN'],
    text('Nomeia países da lista principal do jogo na Ásia atravessados em terra pelo trópico de Câncer.','Name countries in the game’s main Asian list crossed on land by the Tropic of Cancer.'),
    text('Arábia Saudita, Emirados Árabes Unidos, Omã, Índia, Bangladesh, Myanmar, China e Taiwan/Ilha Formosa. A linha fica a cerca de 23,4° N.','Saudi Arabia, the UAE, Oman, India, Bangladesh, Myanmar, China, and Taiwan qualify. The line lies at about 23.4° N.'),[naturalEarth,latitude]),
  list('landlocked-africa','landlocked:africa',['BDI','BFA','BWA','CAF','ETH','LSO','MLI','MWI','NER','RWA','SSD','SWZ','TCD','UGA','ZMB','ZWE'],
    text('Nomeia países de África sem litoral oceânico; ter margem num lago não conta como acesso ao mar.','Name African countries without an ocean coastline; a lakeshore does not count as access to the sea.'),
    text('África tem dezasseis países sem litoral oceânico. Lagos como o Malawi, Vitória e Tanganica não lhes dão uma costa marítima.','Africa has sixteen countries without an ocean coastline. Lakes such as Malawi, Victoria, and Tanganyika do not give them a maritime coast.'),[lldcs,landlocked]),
  list('landlocked-asia','landlocked:asia',['AFG','ARM','AZE','BTN','KAZ','KGZ','LAO','MNG','NPL','TJK','TKM','UZB'],
    text('Nomeia países da Ásia, segundo a divisão do jogo, sem litoral oceânico; o mar Cáspio não conta como oceano.','Name countries in the game’s Asian region with no ocean coastline; the Caspian Sea does not count as an ocean.'),
    text('São doze, incluindo os países sem litoral da Ásia Central e o Azerbaijão. O Cáspio é uma massa de água interior, sem saída natural para o oceano.','There are twelve, including Central Asia’s landlocked countries and Azerbaijan. The Caspian is an inland waterbody without a natural outlet to the ocean.'),[landlocked,lldcs]),
  list('landlocked-south-america','landlocked:south-america',['BOL','PRY'],
    text('Nomeia os países da América do Sul que não têm litoral marítimo.','Name the South American countries with no maritime coastline.'),
    text('Bolívia e Paraguai são os únicos países sul-americanos sem costa marítima, embora tenham acesso a rotas fluviais.','Bolivia and Paraguay are South America’s only landlocked countries, although they have access to river routes.'),[lldcs,landlocked]),
  list('island-borneo','island:borneo',['BRN','MYS','IDN'],
    text('Nomeia os países que partilham a ilha do Bornéu.','Name the countries that share the island of Borneo.'),
    text('O Bornéu é partilhado pela Indonésia, Malásia e Brunei. É a maior ilha da Ásia.','Borneo is shared by Indonesia, Malaysia, and Brunei. It is Asia’s largest island.'),[borneo]),
  list('island-new-guinea','island:new-guinea',['IDN','PNG'],
    text('Nomeia os países que partilham a ilha da Nova Guiné.','Name the countries that share the island of New Guinea.'),
    text('A parte ocidental pertence à Indonésia; a oriental pertence à Papua Nova Guiné. O país e a ilha não são a mesma coisa.','The western part belongs to Indonesia; the eastern part belongs to Papua New Guinea. The country and the island are not the same thing.'),[newGuinea]),
  list('island-hispaniola','island:hispaniola',['HTI','DOM'],
    text('Nomeia os países que partilham a ilha de Hispaniola, nas Caraíbas.','Name the countries that share the Caribbean island of Hispaniola.'),
    text('O Haiti ocupa a parte ocidental e a República Dominicana a parte oriental de Hispaniola.','Haiti occupies western Hispaniola, and the Dominican Republic occupies the eastern part.'),[hispaniola]),
  list('island-tierra-del-fuego','island:tierra-del-fuego',['CHL','ARG'],
    text('Nomeia os países que partilham a Ilha Grande da Terra do Fogo, a sul do estreito de Magalhães.','Name the countries that share Isla Grande de Tierra del Fuego, south of the Strait of Magellan.'),
    text('A ilha tem uma parte chilena a oeste e uma parte argentina a leste. O estreito separa-a do continente sul-americano.','The island has a Chilean part in the west and an Argentine part in the east. The strait separates it from mainland South America.'),[tierra]),
  list('lake-victoria-shores','lake:victoria-shores',['KEN','UGA','TZA'],
    text('Nomeia os países que têm margem no lago Vitória, em África.','Name the countries with a shore on Lake Victoria in Africa.'),
    text('Quénia, Uganda e Tanzânia têm margem no lago. Burundi e Ruanda pertencem à bacia hidrográfica, mas não têm costa no próprio lago.','Kenya, Uganda, and Tanzania have a lakeshore. Burundi and Rwanda are in the drainage basin but have no shore on the lake itself.'),[victoria]),
  list('lake-tanganyika-shores','lake:tanganyika-shores',['BDI','COD','TZA','ZMB'],
    text('Nomeia os países que têm margem no lago Tanganica.','Name the countries with a shore on Lake Tanganyika.'),
    text('Burundi, República Democrática do Congo, Tanzânia e Zâmbia partilham as margens. O Ruanda não chega à margem deste lago.','Burundi, DR Congo, Tanzania, and Zambia share its shores. Rwanda does not reach this lake’s shoreline.'),[tanganyika]),
  list('lake-titicaca-shores','lake:titicaca-shores',['BOL','PER'],
    text('Nomeia os países que partilham o lago Titicaca, nos Andes.','Name the countries that share Lake Titicaca in the Andes.'),
    text('O Titicaca estende-se entre o Peru e a Bolívia, a cerca de 3 810 metros de altitude.','Titicaca lies between Peru and Bolivia, at roughly 3,810 metres above sea level.'),[titicaca]),
  list('lake-malawi-shores','lake:malawi-shores',['MWI','MOZ','TZA'],
    text('Nomeia os países com povoações na margem do lago Malawi, também chamado Niassa ou Nyasa; a disputa da fronteira na água não altera a margem.','Name the countries with settlements on the shore of Lake Malawi, also called Niassa or Nyasa; the disputed water boundary does not change the shoreline.'),
    text('Malawi, Moçambique e Tanzânia têm povoações na margem. A pergunta trata da margem geográfica, sem decidir a fronteira disputada nas águas.','Malawi, Mozambique, and Tanzania have lakeside settlements. The question concerns the geographic shore, without deciding the disputed boundary in the water.'),[malawi]),
  list('benelux','region:benelux',['BEL','NLD','LUX'],
    text('Nomeia os países cujos nomes formam a sigla Benelux.','Name the countries whose names form the word Benelux.'),
    text('Benelux junta Bélgica, Países Baixos e Luxemburgo. A designação também identifica a sua união de cooperação.','Benelux combines Belgium, the Netherlands, and Luxembourg. The name also identifies their cooperation union.'),[benelux]),
  list('baltic-states','region:baltic-states',['EST','LVA','LTU'],
    text('Nomeia os três Estados Bálticos; não se trata de todos os países com costa no mar Báltico.','Name the three Baltic States; this does not mean every country with a Baltic Sea coast.'),
    text('Os Estados Bálticos são Estónia, Letónia e Lituânia. Suécia, Polónia e outros vizinhos do mar Báltico não fazem parte deste grupo.','The Baltic States are Estonia, Latvia, and Lithuania. Sweden, Poland, and other Baltic Sea neighbours are not part of this group.'),[baltic]),
  list('central-asia-m49','region:central-asia',['KAZ','KGZ','TJK','TKM','UZB'],
    text('Nomeia os países da sub-região Ásia Central definida pela ONU.','Name the countries in the UN-defined subregion of Central Asia.'),
    text('Cazaquistão, Quirguistão, Tajiquistão, Turquemenistão e Usbequistão formam a Ásia Central na classificação M49 da ONU.','Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan, and Uzbekistan form Central Asia in the UN M49 classification.'),[m49]),
  single('rolas-country','latitude:equator-land','STP',
    text('Em que país africano podes atravessar a linha do Equador a pé no Ilhéu das Rolas?','In which African country can you walk across the Equator on Ilhéu das Rolas?'),
    text('O ilhéu pertence a São Tomé e Príncipe. A passagem do Equador é assinalada por um padrão e um mapa em mosaico.','The islet belongs to São Tomé and Príncipe. A marker and mosaic map identify the Equator crossing.'),[rolas]),
  single('asian-equator-land','latitude:equator-land','IDN',
    text('Qual é o único país da Ásia cuja terra é atravessada pela linha do Equador, sem contar apenas águas territoriais?','Which is the only Asian country whose land is crossed by the Equator, without counting territorial waters alone?'),
    text('É a Indonésia: a linha atravessa várias ilhas, incluindo Sumatra e Bornéu. Não atravessa terra das Maldivas.','It is Indonesia: the line crosses several islands, including Sumatra and Borneo. It does not cross land in the Maldives.'),[naturalEarth,latitude]),
  single('lesotho-enclave','enclave:lesotho','LSO',
    text('Que reino africano está totalmente rodeado pela África do Sul, sem litoral?','Which African kingdom is completely surrounded by South Africa and has no coastline?'),
    text('É o Lesoto, um país independente totalmente cercado pela África do Sul.','It is Lesotho, an independent country completely enclosed by South Africa.'),[lesotho]),
  single('gambia-senegal','enclave:gambia','GMB',
    text('Que país africano é rodeado pelo Senegal em três lados e se abre para o Atlântico no quarto?','Which African country is enclosed by Senegal on three sides and opens onto the Atlantic on the fourth?'),
    text('É a Gâmbia, um país estreito que acompanha o rio Gâmbia desde o interior até ao Atlântico.','It is The Gambia, a narrow country following the Gambia River from inland to the Atlantic.'),[gambia]),
  tf('equatorial-guinea-land','latitude:equatorial-guinea',false,
    text('A linha do Equador atravessa terra da Guiné Equatorial.','The Equator crosses land in Equatorial Guinea.'),
    text('Falso. A parte continental e Bioko ficam a norte, enquanto Annobón fica a sul; a linha passa entre essas terras.','False. The mainland and Bioko lie north, while Annobón lies south; the line passes between those land areas.'),[naturalEarth,latitude],['GNQ']),
  tf('maldives-equator-land','latitude:equator-land',false,
    text('A linha do Equador atravessa terra de pelo menos uma ilha das Maldivas.','The Equator crosses land on at least one island in the Maldives.'),
    text('Falso. Há ilhas maldivas nos dois hemisférios, mas nenhuma terra do arquipélago toca a linha do Equador.','False. Maldivian islands lie in both hemispheres, but none of the archipelago’s land touches the Equator.'),[naturalEarth,latitude],['MDV']),
  tf('australia-capricorn','latitude:capricorn-australia',true,
    text('O trópico de Capricórnio atravessa o território continental da Austrália.','The Tropic of Capricorn crosses mainland Australia.'),
    text('Verdadeiro. O paralelo situado a cerca de 23,4° S atravessa a Austrália de oeste para leste.','True. The parallel at about 23.4° S crosses Australia from west to east.'),[naturalEarth,latitude],['AUS']),
  tf('borneo-three-countries','island:borneo',true,
    text('A ilha do Bornéu é partilhada por três países.','The island of Borneo is shared by three countries.'),
    text('Verdadeiro: Brunei, Malásia e Indonésia têm território nesta grande ilha asiática.','True: Brunei, Malaysia, and Indonesia have territory on this large Asian island.'),[borneo],['BRN','MYS','IDN']),
  tf('malawi-ocean-coast','landlocked:malawi',false,
    text('O Malawi tem litoral oceânico, porque o lago com o seu nome se liga ao mar por rios.','Malawi has an ocean coastline because the lake bearing its name connects to the sea through rivers.'),
    text('Falso. O Malawi não tem litoral oceânico. Uma ligação fluvial até ao mar não transforma a margem de um lago em costa marítima.','False. Malawi is landlocked. A river connection to the sea does not turn a lakeshore into an ocean coastline.'),[landlocked],['MWI']),
  tf('india-cancer','latitude:cancer-asia',true,
    text('O trópico de Câncer atravessa a Índia.','The Tropic of Cancer crosses India.'),
    text('Verdadeiro. Este paralelo do hemisfério norte atravessa a Índia a cerca de 23,4° N.','True. This Northern Hemisphere parallel crosses India at about 23.4° N.'),[naturalEarth,latitude],['IND']),
  number('equator-land-count','latitude:equator-land',11,
    text('Quantos países têm terra atravessada pela linha do Equador, incluindo ilhas e excluindo passagens só por águas territoriais?','How many countries have land crossed by the Equator, including islands but excluding crossings through territorial waters alone?'),
    text('São onze países. São Tomé e Príncipe conta pelo Ilhéu das Rolas; Maldivas e Kiribati não entram nesta contagem de terra.','There are eleven countries. São Tomé and Príncipe qualifies through Ilhéu das Rolas; the Maldives and Kiribati are excluded from this land-only count.'),[naturalEarth,rolas,latitude]),
  number('borneo-country-count','island:borneo',3,
    text('Quantos países partilham a ilha do Bornéu?','How many countries share the island of Borneo?'),
    text('Três: Indonésia, Malásia e Brunei.','Three: Indonesia, Malaysia, and Brunei.'),[borneo]),
];
