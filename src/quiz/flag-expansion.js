import countries from '../data/countries.json' with {type:'json'};

const byIso=Object.fromEntries(countries.filter(country=>country.isCountry).map(country=>[country.iso3,country]));
const text=(pt,en)=>({pt,en});
const entity=iso=>{
  const country=byIso[iso];
  if(!country)throw Error(`Unsupported flag answer: ${iso}`);
  return {id:country.id,label:text(country.nome_pt,country.nome_en),aliases:country.aliases.filter(alias=>/[a-z0-9]/i.test(alias.normalize('NFD')))};
};
const source=(title,url)=>({title,url});
const flagCollection=source('flag-icons · National flag SVGs (publisher collection)','https://github.com/lipis/flag-icons/tree/main/flags/4x3');
const regions=source('United Nations Statistics Division · M49 geographic regions','https://unstats.un.org/unsd/methodology/m49/overview/');
const singapore=source('National Heritage Board of Singapore · National Flag','https://www.nhb.gov.sg/what-we-do/our-work/community-engagement/education/resources/national-symbols/national-flag');
const malaysia=source('Ministry of Foreign Affairs Malaysia · National Flag','https://www.kln.gov.my/web/usa_washington/history');
const brunei=source('Information Department of Brunei · Brunei in Brief 2018','https://www.information.gov.bn/Penerangan/Shared%20Documents/BIB2018_FINAL.pdf');

const question=(slug,inputType,isos,prompt,explanation,sources)=>({
  schemaVersion:1,id:`flags-${slug}`,revision:1,inputType,category:'flags',topicId:`flags:${slug}`,
  prompt,explanation,sources,checkedAt:'2026-11-06',countryIds:isos.map(iso=>byIso[iso].id),
  suggestionDomain:'countries',answer:{accepted:isos.map(entity)},
});

/** Complete, bounded sets; the engine asks for 1, half, or all answers by difficulty.
 * Scope, negative cases, SVG inspection and official sources: docs/quiz-flags-provenance.md.
 * National flags are used throughout; subnational flags and historical designs do not count. */
export const flagExpansion=[
  question('union-jack-oceania','TEXT_MULTIPLE',['AUS','FJI','NZL','TUV'],
    text('Nomeia países da Oceânia cuja bandeira nacional inclui a Union Jack, a bandeira do Reino Unido.',
      'Name countries in Oceania whose national flag includes the Union Jack, the flag of the United Kingdom.'),
    text('Austrália, Fiji, Nova Zelândia e Tuvalu incluem a Union Jack no canto superior junto à haste. Contam os países da lista principal do jogo.',
      'Australia, Fiji, New Zealand and Tuvalu include the Union Jack in the upper corner nearest the flagpole. Countries in the game’s main list count.'),
    [source('Australian Government · Elements of the Australian National Flag','https://www.pmc.gov.au/resources/australian-flags-booklet/part-1-australian-national-flag'),
      source('Fiji Ministry of Foreign Affairs · Fiji Flag','https://www.foreignaffairs.gov.fj/fiji-embassy-in-brussels-belgium/fiji-flag/'),
      source('Manatū Taonga · New Zealand flag','https://www.mch.govt.nz/our-work/flags-anthems-and-emblems/new-zealand-flag'),
      source('Tuvalu · National Flag Act, 2022 revised edition, Schedule 1','https://tuvalu-legislation.tv/cms/images/LEGISLATION/PRINCIPAL/1995/1995-0004/1995-0004_2.pdf')]),
  question('nordic-cross-europe','TEXT_MULTIPLE',['DNK','FIN','ISL','NOR','SWE'],
    text('Nomeia países europeus com uma cruz nórdica na bandeira: a cruz chega às quatro margens e está deslocada para a haste.',
      'Name European countries with a Nordic cross on their flag: the cross reaches all four edges and is shifted towards the flagpole.'),
    text('Dinamarca, Finlândia, Islândia, Noruega e Suécia usam a cruz nórdica. Bandeiras regionais, como as das Ilhas Faroé e de Åland, não contam como países.',
      'Denmark, Finland, Iceland, Norway and Sweden use the Nordic cross. Regional flags, such as those of the Faroe Islands and Åland, do not count as countries.'),
    [source('Nordic Council of Ministers · The Nordic flags','https://www.norden.org/en/information/nordic-flags')]),
  question('vertical-tricolours-europe','TEXT_MULTIPLE',['AND','BEL','FRA','IRL','ITA','MDA','ROU'],
    text('Nomeia países europeus cuja bandeira tem um fundo de três faixas verticais de três cores diferentes, ignorando os brasões.',
      'Name European countries whose flag has a background of three vertical bands in three different colours, ignoring coats of arms.'),
    text('Andorra, Bélgica, França, Irlanda, Itália, Moldávia e Roménia cumprem este padrão. Os brasões de Andorra e da Moldávia não alteram as três faixas do fundo.',
      'Andorra, Belgium, France, Ireland, Italy, Moldova and Romania fit this pattern. The coats of arms of Andorra and Moldova do not change the three background bands.'),
    [flagCollection]),
  question('stars-southeast-asia','TEXT_MULTIPLE',['MYS','MMR','PHL','SGP','TLS','VNM'],
    text('Nomeia países do Sudeste Asiático que têm pelo menos uma estrela na bandeira nacional.',
      'Name countries in Southeast Asia that have at least one star on their national flag.'),
    text('Malásia, Myanmar, Filipinas, Singapura, Timor-Leste e Vietname têm estrelas nas bandeiras. O sol das Filipinas é um símbolo separado das suas três estrelas.',
      'Malaysia, Myanmar, the Philippines, Singapore, Timor-Leste and Vietnam have stars on their flags. The Philippine sun is separate from its three stars.'),
    [singapore,malaysia,
      source('Philippines · Constitution, Article XVI, Section 1','https://officialgazette.gov.ph/constitutions/1987-constitution/'),
      source('Myanmar National Portal · National Symbols','https://myanmar.gov.mm/en/web/guest/national-symbols'),
      source('Government of Timor-Leste · National Symbols','https://timor-leste.gov.tl/?p=34&lang=en'),
      source('Government of Vietnam · National flag','https://vietnam.gov.vn/default.aspx?catname=national-flag-emblem-anthem-declaration-of-independence-68960'),regions,flagCollection]),
  question('stars-south-america','TEXT_MULTIPLE',['BRA','CHL','SUR','VEN'],
    text('Nomeia países da América do Sul com estrelas na bandeira nacional, sem contar estrelas dentro de brasões ou selos.',
      'Name South American countries with stars on their national flag, excluding stars inside coats of arms or seals.'),
    text('Brasil, Chile, Suriname e Venezuela têm estrelas fora de brasões ou selos. A estrela do selo do Paraguai e as estrelas do brasão boliviano ficam excluídas.',
      'Brazil, Chile, Suriname and Venezuela have stars outside coats of arms or seals. The star in Paraguay’s seal and the stars in Bolivia’s coat of arms are excluded.'),
    [source('Presidency of Brazil · Bandeira Nacional','https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/simbolos-nacionais/bandeira/bandeira-nacional'),
      source('Government of Chile · National symbols','https://www.gob.cl/nuestro-pais/'),
      source('Presidency of Suriname · Heritage Month (national flag star)','https://gov.sr/ministeries/kabinet-van-de-president/heritage-month-suriname/'),regions,flagCollection]),
  question('crescents-southeast-asia','TEXT_MULTIPLE',['BRN','MYS','SGP'],
    text('Nomeia países do Sudeste Asiático com uma lua crescente na bandeira nacional, incluindo a que aparece num brasão.',
      'Name countries in Southeast Asia with a crescent moon on their national flag, including one appearing in a coat of arms.'),
    text('Brunei, Malásia e Singapura têm uma lua crescente na bandeira. Em Brunei, o crescente integra o emblema nacional vermelho.',
      'Brunei, Malaysia and Singapore have a crescent moon on their flag. In Brunei, the crescent is part of the red national emblem.'),
    [brunei,malaysia,singapore,regions,flagCollection]),
  question('weapons-africa','TEXT_MULTIPLE',['AGO','KEN','MOZ','SWZ'],
    text('Nomeia países africanos com lanças, uma catana ou uma espingarda na bandeira nacional.',
      'Name African countries with spears, a machete or a rifle on their national flag.'),
    text('Angola tem uma catana, o Quénia e Eswatini têm lanças, e Moçambique tem uma espingarda. Contam os objetos representados na bandeira, independentemente do seu simbolismo.',
      'Angola has a machete, Kenya and Eswatini have spears, and Mozambique has a rifle. The objects shown on the flag count regardless of their symbolism.'),
    [source('Government of Luanda · National symbols of Angola','https://luanda.gov.ao/web/simbolos-nacionais'),
      source('Government of Kenya · Branding guidelines, national flag','https://trade.go.ke/sites/default/files/Guidelines/GoK%20Branding%20Guidelines.pdf'),
      source('Mozambique Ministry of Foreign Affairs · National Symbols','https://minec.gov.mz/simbolos-nacionais/'),
      source('Government of Eswatini · National Symbols','https://gov.sz/index.php/national-symbols'),flagCollection]),
  question('birds-africa','TEXT_MULTIPLE',['EGY','UGA','ZMB','ZWE'],
    text('Nomeia países africanos cuja bandeira nacional mostra uma ave inteira, incluindo aves estilizadas ou em brasões; penas isoladas não contam.',
      'Name African countries whose national flag shows a whole bird, including stylised birds or birds in coats of arms; individual feathers do not count.'),
    text('Egito, Uganda, Zâmbia e Zimbabwe representam aves nas bandeiras. A ave do Zimbabwe é uma figura estilizada; as penas na bandeira de Eswatini não são aves inteiras.',
      'Egypt, Uganda, Zambia and Zimbabwe depict birds on their flags. The Zimbabwe Bird is stylised; the feathers on Eswatini’s flag are not whole birds.'),
    [source('Presidency of Egypt · National Flag','https://www.presidency.eg/EN/%D9%85%D8%B5%D8%B1/%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA-%D8%A3%D8%B3%D8%A7%D8%B3%D9%8A%D8%A9/%D8%A7%D9%84%D8%B9%D9%84%D9%85-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%89/'),
      source('Government of Uganda · National flag and crested crane','https://nam.go.ug/useful-information'),
      source('National Assembly of Zambia · National Flag and Armorial Ensigns Act','https://www.parliament.gov.zm/sites/default/files/documents/acts/National%20Flag%20and%20Armorial%20Ensigns%20Act.pdf'),
      source('Zimbabwe Presidential Communications · National Symbols','https://deptcomms.org.zw/national-symbols/'),flagCollection]),
  question('guatemala-quetzal','TEXT_SINGLE',['GTM'],
    text('Que país tem um quetzal pousado sobre um pergaminho no brasão da sua bandeira azul e branca?',
      'Which country has a quetzal perched on a scroll in the coat of arms on its blue and white flag?'),
    text('É a Guatemala: o quetzal aparece sobre o pergaminho no brasão central. A pergunta refere-se à bandeira com brasão.',
      'It is Guatemala: the quetzal appears above the scroll in the central coat of arms. This question refers to the flag bearing the coat of arms.'),
    [source('Guatemala Ministry of Culture · La independencia: lecturas bicentenarias, national symbols','https://mcd.gob.gt/wp-content/uploads/2022/05/21-Enrique-Noriega-La-independencia-su-bicentenario-1821-2021-Lecturas-Bicentenarias.pdf'),flagCollection]),
  question('lebanon-cedar','TEXT_SINGLE',['LBN'],
    text('Que país tem um cedro verde no centro de uma bandeira com faixas horizontais vermelha, branca e vermelha?',
      'Which country has a green cedar in the centre of a flag with red, white and red horizontal bands?'),
    text('O Líbano tem um cedro verde na faixa branca central. O desenho está definido no artigo 5.º da Constituição libanesa.',
      'Lebanon has a green cedar in the central white band. The design is defined in Article 5 of the Lebanese Constitution.'),
    [source('Constitutional Council of Lebanon · Constitution, Article 5','https://cc.gov.lb/en/constitution-and-laws/constitution/fundamental-provisions/')]),
  question('malta-george-cross','TEXT_SINGLE',['MLT'],
    text('Que país tem a George Cross, com contorno vermelho, no canto branco da sua bandeira branca e vermelha?',
      'Which country has the George Cross, edged in red, in the white corner of its white and red flag?'),
    text('É Malta: a George Cross aparece na faixa branca, junto à haste. A bandeira tem duas faixas verticais, branca e vermelha.',
      'It is Malta: the George Cross appears on the white band next to the flagpole. The flag has two vertical bands, white and red.'),
    [source('Government of Malta · Flags, Symbols and their uses','https://www.gov.mt/en/About%20Malta/Pages/Flags-Symbols-and-their-use.aspx')]),
  question('kiribati-frigatebird','TEXT_SINGLE',['KIR'],
    text('Que país tem uma fragata dourada a voar sobre um sol nascente, acima de ondas azuis e brancas, na bandeira?',
      'Which country has a golden frigatebird flying over a rising sun, above blue and white waves, on its flag?'),
    text('É Kiribati: a fragata e o sol ocupam a metade vermelha superior da bandeira. Ondas azuis e brancas preenchem a metade inferior.',
      'It is Kiribati: the frigatebird and sun occupy the upper red half of the flag. Blue and white waves fill the lower half.'),
    [source('Kiribati · National Identity Act 1989, Schedule 1 (PacLII legislative text)','https://www.paclii.org/ki/legis/num_act/nia1989197.pdf'),flagCollection]),
];
