/** Selected new entries from the user's 171-fact file; primary sources checked 2026-11-02.
 * Repetitions stay in the original catalogue; undated rankings and unconfirmed figures are not imported.
 */
const sources={
  names:{title:'Zespri — The Chinese gooseberry',url:'https://www.zespri.com/en-AU/blogdetail/whats-in-a-name-the-chinese-gooseberry'},
  teara:{title:'Te Ara',url:'https://teara.govt.nz/en/kiwifruit/print'},
  nzkgi:{title:'New Zealand Kiwifruit Growers',url:'https://www.nzkgi.org.nz/history/'},
  wisconsin:{title:'University of Wisconsin–Madison',url:'https://hort.extension.wisc.edu/articles/kiwifruit-actinidia-spp/'},
  rhs:{title:'Szczepan Marczyński — The Garden / RHS',url:'https://www.clematis.com.pl/download/new_zeal_fruitfulness.pdf'},
  osu:{title:'Oregon State University',url:'https://extension.oregonstate.edu/food/preservation/preserving-kiwifruit'},
  results:{title:'Zespri — Results 2025/26',url:'https://www.zespri.com/en-NZ/publications/newsroomdetail/2025-26-financial-results'},
  psa:{title:'University of Waikato — Science Learning Hub',url:'https://www.sciencelearn.org.nz/interactive_timeline/10-kiwifruit-and-psa-a-timeline'},
  portugalPsa:{title:'Revista de Ciências Agrárias',url:'https://revistas.rcaap.pt/rca/article/view/16915'},
  portugal:{title:'Agrogarante — Análise Setorial 2023',url:'https://www.agrogarante.pt/fotos/noticias/divulgacao_setorial_kiwi_26699205364c4d9e3a1020.pdf'},
};
// Original file number, stable ID, category, source, PT, EN, period (when needed).
const rows=[
 [3,'fraser-sister','geography','names','Isabel Fraser trouxe as sementes de kiwi depois de visitar a irmã numa missão no vale do Yangtze.','Isabel Fraser brought kiwifruit seeds back after visiting her sister at a mission in the Yangtze Valley.'],
 [4,'allison','geography','teara','As sementes trazidas por Isabel Fraser foram entregues ao agricultor Alexander Allison, em Whanganui.','The seeds Isabel Fraser brought back were given to farmer Alexander Allison in Whanganui.'],
 [8,'hayward-1928','fruit','nzkgi','A associação neozelandesa de produtores data de 1928 a criação da cultivar Hayward por Hayward Wright.','New Zealand’s growers association dates Hayward Wright’s development of the Hayward cultivar to 1928.'],
 [10,'export-standard','geography','teara','No final dos anos 1960, a Hayward já era a variedade padrão do comércio de kiwi para exportação.','By the late 1960s, Hayward had become the standard cultivar in the kiwifruit export trade.'],
 [11,'hayward-world','fruit','nzkgi','Segundo a NZKGI, a Hayward continua a ser a variedade de kiwi verde mais cultivada no mundo.','According to NZKGI, Hayward remains the world’s most widely grown green kiwifruit cultivar.'],
 [13,'importer-rename','geography','nzkgi','Foi um importador americano que pediu um nome mais comercial para a antiga «groselha chinesa».','A US importer asked for a more marketable name for the fruit formerly called “Chinese gooseberry”.'],
 [17,'growers-1994','geography','nzkgi','A associação New Zealand Kiwifruit Growers Incorporated foi criada em 1994 para representar os produtores.','New Zealand Kiwifruit Growers Incorporated was established in 1994 to represent growers.'],
 [17,'zespri-1997','geography','nzkgi','A Zespri International foi fundada em 1997, após a reestruturação do organismo de comercialização do kiwi neozelandês.','Zespri International was founded in 1997 after New Zealand’s kiwifruit marketing organisation was restructured.'],
 [20,'old-fruit-names','fruit','names','Pêssego-macaco, pera-de-videira e baga-de-madeira são alguns dos antigos nomes populares chineses do kiwi.','Monkey peach, vine pear and wood berry are among kiwifruit’s old Chinese popular names.'],
 [21,'mihoutao','fruit','names','O nome chinês mihoutao está ligado à expressão «fruto dos macacos».','The Chinese name mihoutao is linked to the expression “macaque fruit”.'],
 [23,'hairy-berry','fruit','names','Antes de se popularizar como kiwi, o fruto também ganhou a alcunha inglesa «hairy berry»: baga peluda.','Before kiwifruit became the usual name, the fruit also earned the nickname “hairy berry”.'],
 [25,'strange-fruit','geography','teara','Em Taiwan e Hong Kong, popularizou-se um nome do kiwi que significa aproximadamente «fruta estranha».','In Taiwan and Hong Kong, a name roughly meaning “strange fruit” became popular for kiwifruit.'],
 [16,'botanical-1984','fruit','teara','Em 1984, os botânicos passaram a chamar Actinidia deliciosa ao kiwi verde, distinguindo-o do kiwi amarelo.','In 1984, botanists renamed green kiwifruit Actinidia deliciosa, distinguishing it from yellow-fleshed kiwifruit.'],
 [31,'four-females','fruit','wisconsin','Uma planta masculina de kiwi pode fornecer pólen suficiente para quatro plantas femininas.','One male kiwifruit vine can supply enough pollen for four female vines.'],
 [35,'pollen-window','fruit','wisconsin','As flores femininas podem aceitar pólen até nove dias após abrirem; o pólen masculino dura apenas cerca de três.','Female flowers may accept pollen for nine days after opening; male pollen lasts only about three.'],
 [36,'five-flowers','fruit','wisconsin','Na polinização manual, uma única flor masculina de kiwi pode servir até cinco flores femininas.','During hand pollination, a single male kiwifruit flower can serve up to five female flowers.'],
 [47,'lemon-flowers','fruit','rhs','As flores da Actinidia kolomikta podem ter um ligeiro perfume a limão.','Actinidia kolomikta flowers can have a faint lemon scent.'],
 [62,'gelatin','fruit','osu','O kiwi cru pode impedir uma sobremesa de gelatina de solidificar, devido às suas enzimas que decompõem proteínas.','Raw kiwifruit can stop a gelatin dessert from setting because its enzymes break down proteins.'],
 [132,'sales-2025-26','geography','results','Em 2025/26, a Zespri vendeu 248,1 milhões de tabuleiros de kiwi, com receitas de 5,9 mil milhões de dólares neozelandeses.','In 2025/26, Zespri sold 248.1 million kiwifruit trays, earning NZ$5.9 billion in fruit sales.','2025/26'],
 [134,'growers-2025','geography','results','Na campanha de 2025, os pagamentos da Zespri por fruta e serviços neozelandeses atingiram 3,56 mil milhões de dólares neozelandeses.','For the 2025 season, Zespri’s New Zealand fruit and service payments reached NZ$3.56 billion.','2025'],
 [135,'outside-nz-2025','geography','results','Dos kiwis vendidos pela Zespri em 2025/26, 32,3 milhões de tabuleiros foram produzidos fora da Nova Zelândia.','Of the kiwifruit Zespri sold in 2025/26, 32.3 million trays were grown outside New Zealand.','2025/26'],
 [96,'nz-regions','geography','results','Bay of Plenty, Northland, East Coast, Nelson e Waikato estão entre as regiões produtoras de kiwi neozelandesas.','Bay of Plenty, Northland, East Coast, Nelson and Waikato are among New Zealand’s kiwifruit-growing regions.'],
 [106,'psa-italy','geography','psa','A doença Psa foi identificada em pomares de kiwi do norte de Itália em 1992.','Psa disease was identified in northern Italian kiwifruit orchards in 1992.'],
 [141,'psa-te-puke','geography','psa','A Psa foi detetada pela primeira vez na Nova Zelândia num pomar de Te Puke, em novembro de 2010.','Psa was first detected in New Zealand at a Te Puke orchard in November 2010.'],
 [144,'gold3-tolerant','fruit','psa','Em 2012, a tolerância da Gold3 à Psa ajudou a acelerar a sua comercialização como kiwi SunGold.','In 2012, Gold3’s tolerance to Psa helped fast-track its commercialisation as SunGold kiwifruit.'],
 [145,'gold3-hectares','geography','psa','Em 2012, foram disponibilizados aos produtores mais de 2.000 hectares de plantas Gold3, numa resposta à crise da Psa.','In 2012, more than 2,000 hectares of Gold3 plants were released to growers in response to the Psa crisis.'],
 [150,'psa-portugal','geography','portugalPsa','Em Portugal, a Psa foi detetada pela primeira vez em 2010, na região de Entre Douro e Minho.','In Portugal, Psa was first detected in 2010 in the Entre Douro e Minho region.'],
 [157,'portugal-area-2021','geography','portugal','Em 2021, Entre Douro e Minho reunia 73,1% da área portuguesa de kiwi; a Beira Litoral, 25,5%.','In 2021, Entre Douro e Minho held 73.1% of Portugal’s kiwifruit area; Beira Litoral held 25.5%.','2021'],
 [160,'portugal-hayward','geography','portugal','A Hayward era a cultivar de kiwi mais comum em Portugal na análise setorial publicada em 2023.','Hayward was Portugal’s most common kiwifruit cultivar in the sector analysis published in 2023.','2023'],
 [165,'spain-exports-2021','geography','portugal','Em 2021, Espanha recebeu 78% das exportações portuguesas de kiwi.','In 2021, Spain received 78% of Portugal’s kiwifruit exports.','2021'],
];
export const userKiwiFacts=rows.map(([number,id,category,key,pt,en,period])=>({id:`user-${id}`,category,pt,en,source:sources[key],period,checkedAt:'2026-11-02',fromUserFile:{name:'geokiwi_funfactos_kiwi.txt',number}}));
