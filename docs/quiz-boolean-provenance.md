# Procedência das afirmações de verdadeiro/falso

`src/quiz/boolean-expansion.js` exporta 40 perguntas bilingues: 20 verdadeiras e 20 falsas. Todas têm `schemaVersion: 1`, `revision: 1`, `checkedAt: 2026-11-06`, fontes e explicações em português e inglês.

## Adaptações de pistas existentes: 20 perguntas

As afirmações reutilizam o objeto `source`, a categoria e os IDs de países da respetiva pista em `src/data/country-clues.js`. Essas pistas registam a verificação das fontes primárias em 2026-11-02. A nova data regista a conferência desta adaptação contra os dados existentes, sem indicar uma nova consulta das páginas originais.

Pistas usadas: `bandeira-nepal`, `dragao-branco`, `quatro-estrelas-vermelhas`, `bandeira-quadrada-suica`, `folha-onze-pontas`, `grand-canyon`, `galapagos`, `uluru`, `moai`, `machu-picchu`, `petra`, `angkor`, `serengeti`, `lesoto-altitude`, `quatro-hemisferios`, `deserto-nevoeiro`, `duplamente-encravado`, `canal-dois-oceanos`, `everest-partilhado` e `tres-cruzes`.

Cada adaptação tem `topicId: clue:<id-original>` para poder ser agrupada com a pergunta original numa seleção sem repetição de factos. As afirmações falsas trocam um detalhe confirmado pela pista; a explicação repõe o facto correto. Os textos são adaptações editoriais dos dados locais, sem transcrição de prosa das páginas citadas.

## Países sem litoral: 10 perguntas

Fonte primária: [Mledoze · Countries dataset](https://raw.githubusercontent.com/mledoze/countries/master/countries.json), cópia fornecida em `/private/tmp/geokiwi-quiz-countries.json` e consultada em 2026-11-06. O campo `landlocked` é `true` nos dez registos usados: `BOL`, `PRY`, `CHE`, `AUT`, `MNG`, `NPL`, `LSO`, `UZB`, `LIE` e `NER`. Os IDs numéricos do produto são resolvidos pelos códigos ISO3 em `src/data/countries.json`.

Cinco afirmações dizem que o país não tem litoral marítimo; cinco alegam uma costa marítima. «Litoral marítimo» evita confundir rios ou lagos com acesso ao mar. Não se derivam alegações sobre navegação fluvial, fronteiras ou antigos territórios a partir deste campo. A condição de duplamente encravado do Listenstaine pertence separadamente à pista original, com a fonte UNDP dessa pista.

## Comparações de latitude: 10 perguntas

Fonte primária herdada dos lugares: [Natural Earth v5.1.2 · Populated places](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_10m_populated_places_simple.geojson). Usam-se os pontos de `src/data/exploration-places.js`; a latitude é `coordinates[1]`. A resposta é calculada quando o módulo é carregado: uma latitude maior fica mais a norte e uma latitude menor fica mais a sul; o equador tem latitude zero. As fontes de ambos os pontos são preservadas e deduplicadas por URL.

| Afirmação | Latitudes de origem | Resposta |
| --- | --- | --- |
| Nova Iorque a sul de Roma | 40.721562; 41.897902 | Verdadeiro |
| Londres a norte de Vancouver | 51.501941; 49.275362 | Verdadeiro |
| Tóquio a norte de Paris | 35.686963; 48.858092 | Falso |
| Cairo a norte de Dubai | 30.051906; 25.214912 | Verdadeiro |
| Singapura a sul do equador | 1.294979; 0 | Falso |
| Nairobi a sul do equador | -1.281401; 0 | Verdadeiro |
| Cidade do Cabo a sul de Sydney | -33.918065; -33.871373 | Verdadeiro |
| Buenos Aires a norte da Cidade do Cabo | -34.610715; -33.918065 | Falso |
| Mumbai a norte de Xangai | 19.068408; 31.218398 | Falso |
| Marraquexe a norte de Londres | 31.631939; 51.501941 | Falso |

As perguntas referem explicitamente os pontos de referência no mapa, evitando alegações sobre toda a área administrativa das cidades. Esta distinção é especialmente relevante para Cidade do Cabo e Sydney, cujos pontos diferem por apenas cerca de 0.047° de latitude. As explicações mostram latitudes arredondadas a três casas; a decisão usa os valores completos.

## Precisões preservadas

- A afirmação suíça refere-se à bandeira nacional; a explicação distingue a versão marítima.
- A afirmação do Serengeti refere-se ao parque nacional, não a todo o ecossistema transfronteiriço.
- A afirmação sobre o nevoeiro refere-se ao Mar de Areia do Namibe, sem generalizar a todos os desertos.
- Os quatro hemisférios de Kiribati seguem a formulação da pista existente, com referência ao equador e ao meridiano de 180°.
