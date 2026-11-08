# Conhecimento geral: quiz dinâmico

O modo Conhecimento geral usa agora uma união discriminada por `inputType`. Os dados são serializáveis e independentes de React. A lógica de validação, as regras de pontuação e a persistência não vivem nos componentes.

## Ficheiros e responsabilidades

| Ficheiro | Responsabilidade |
| --- | --- |
| `src/quiz/types.ts` | Interfaces TypeScript: perguntas, entidades, unidades, coordenadas, respostas, eventos e contrato dos componentes |
| `src/quiz/questions.js` | Índice do banco: 436 perguntas elegíveis por idioma (468 registos, com variantes linguísticas de 32 perguntas de nomes), incluindo os sete tipos de input |
| `src/quiz/geography-expansion.js` | 30 listas de fronteiras, 40 distâncias e 49 novos pins com coordenadas verificadas |
| `src/quiz/history-expansion.js`, `number-expansion.js`, `boolean-expansion.js` | Novas perguntas bilingues com fontes e critérios documentados |
| `src/quiz/flag-expansion.js`, `name-expansion.js` | 12 perguntas de bandeiras e 32 critérios de iniciais/comprimento de nomes por idioma |
| `src/quiz/landmark-photos.js`, `src/components/quiz/QuestionPhoto.jsx` | 10 fotografias locais com autoria/licença e visualização ampliada |
| `src/quiz/flag-variants.js`, `continental-variants.js`, `world-variants.js` | Mais 94 perguntas: 30 de bandeiras, 32 continentais e 32 de números, datas, cidades e distâncias |
| `scripts/export-quiz.mjs` | Exporta o banco integral em Markdown/JSON durante o build, com soluções, explicações e fontes |
| `src/quiz/editorial-review.js` | Política de formatos, perguntas canónicas e atualização de slots guardados ainda sem resposta |
| `src/quiz/selection.js` | Prioridade a perguntas inéditas, variedade de tipos e reciclagem das vistas há mais tempo |
| `src/quiz/engine.js` | Parser numérico, quotas, limites, validação, avaliação e evolução imutável da partida |
| `src/quiz/storage.js` | Saves e recordes por rondas/dificuldade; reconstrução das respostas e migração da versão anterior |
| `src/quiz/presentation.js` | Nomes localizados dos tipos, soluções, dificuldade e erros |
| `src/components/quiz/QuestionInput.jsx` | Router dos sete tipos e componentes de input reutilizáveis |
| `src/components/CountryClueGame.jsx` | Orquestração: pergunta, input, mapa, feedback, avanço, resultados e reinício |
| `src/quiz/quiz.css` | UI compacta com os temas e estilo existentes |

Fluxo: **dados → `QuestionInput` → submissão → `submitQuiz` → feedback/progresso → checkpoint → próxima pergunta**. O componente nunca decide se uma resposta está correta. Uma submissão repetida durante o feedback não altera a pontuação.

## Contrato de uma pergunta

Todas têm `schemaVersion`, `id` estável, `revision`, `category`, `prompt` e `explanation` em PT/EN, `sources`, `checkedAt` e, quando aplicável, `referenceYear` e `countryIds`. `referenceYear` identifica a data dos dados de um censo ou ranking; `checkedAt` identifica quando a fonte foi verificada. `countryIds` é metadado geográfico e não define a resposta. O mapa só é apresentado nas perguntas de pin; os restantes formatos usam um fundo neutro para evitar pistas visuais.

Cada variante exige a sua própria solução, impossibilitando, por exemplo, um `TRUE_FALSE` com uma solução de coordenadas:

```ts
type QuizQuestion = TrueFalseQuestion | TextSingleQuestion | TextMultipleQuestion
  | NumberExactQuestion | TimelineQuestion | DistanceQuestion | MapPinpointQuestion;
```

| `inputType` | Solução e configuração | UI |
| --- | --- | --- |
| `TRUE_FALSE` | `answer.value: boolean` | Dois botões; `false` é uma resposta válida |
| `TEXT_SINGLE` | `answer.accepted: TextEntity[]`, `suggestionDomain` | Input com autocomplete opcional; basta uma entidade aceite |
| `TEXT_MULTIPLE` | Conjunto completo em `answer.accepted`, `suggestionDomain` | Input, contador, barra e lista dos nomes descobertos |
| `NUMBER_EXACT` | `answer.value`, `absoluteTolerance`, `unit`, `bounds` opcional | Texto numérico, unidade adjacente e pré-visualização expandida |
| `SLIDER_TIMELINE` | `range.min/max/step`, `answer.year/toleranceYears` | Slider e escrita manual sincronizados |
| `SLIDER_DISTANCE` | `answer.km/toleranceKm` | Slider de 0 a 20 037 km e escrita manual |
| `MAP_PINPOINT` | `answer.point/toleranceKm/decayKm` | Mapa físico, escolha de pin e confirmação; devolve `{lat, lng}` |

As entidades têm um ID único, nomes PT/EN e aliases. A resposta é comparada sem distinguir maiúsculas, acentos, espaços ou pontuação. Um alias de outra língua continua a representar a mesma entidade: não conta duas vezes. O autocomplete percorre o domínio completo de países/cidades disponível, nunca apenas as soluções da pergunta. Clicar numa sugestão submete imediatamente; teclado com setas, Enter e Escape também funciona.

## Dificuldade e progresso

`EASY`: 1 elemento. `MEDIUM`: `Math.ceil(total / 2)`. `HARD`: todos. Num conjunto de cinco países, as quotas são 1 / 3 / 5. Num conjunto de dois, são 1 / 1 / 2. A dificuldade altera apenas a quota de `TEXT_MULTIPLE`, conforme o requisito; fica fixa durante a partida e visível na pergunta. Saves e recordes distinguem rondas e dificuldade.

A UI diz «Acertaste X de Y», em que Y é a quota atual, e mostra também o total de soluções possíveis. Elementos errados ou repetidos não terminam a lista: dão uma mensagem e permitem continuar. A lista termina ao atingir a quota ou ao saltar. Saltar dá zero pontos, mantém os elementos já encontrados para revisão e revela a solução completa.

## Números, unidades e limites

- `10k = 10 000`, `10M = 10 000 000`, `10b = 10 000 000 000`; B tem sempre o significado de mil milhões nas duas línguas.
- Com sufixo, são aceites vírgula ou ponto decimal: `2,5M` e `2.5M`. Sem sufixo, respeita-se a separação de milhares da língua: `267.570` em PT e `267,570` em EN. Espaços de milhares corretamente agrupados funcionam em ambas.
- Texto restante (`10km`, `12abc`), valores não finitos ou agrupamentos inválidos são rejeitados. A unidade aparece fora do input, sem exigir que o utilizador a escreva.
- O identificador histórico `NUMBER_EXACT` mantém-se por compatibilidade, mas a pontuação é agora por proximidade, sem exigir números exatos. Alturas em metros usam este tipo com unidade metros. O slider de distância tem sempre km, evitando confundir escalas.
- A distância máxima de 20 037 km corresponde aproximadamente a meia circunferência terrestre, a escala pedida para distâncias entre pontos da superfície.
- O máximo temporal é `min(range.max, ano atual)`, ou diretamente o ano atual se `range.max = 'CURRENT_YEAR'`. Em 2026 o limite é 2026, avançando automaticamente no futuro. Ambos os inputs respeitam os mesmos limites, incluindo a escrita manual.
- Os anos são inteiros: negativos significam a.C./BCE; o ano zero é excluído. Não se transforma uma entrada fora dos limites num valor silenciosamente corrigido.

## Mapas e pontuação

O pin usa o mapa físico existente, sem realce de países ao passar o rato, com rios, lagos, relevo e movimento/zoom. A coordenada de domínio é `{lat, lng}`; só o adaptador usa `[lng, lat]` de MapLibre/GeoJSON. A solução e a ligação ao palpite aparecem depois de confirmar ou saltar.

Nomes, booleanos e listas dão 100 pontos ao acertar e 0 ao falhar. Números e sliders dão 0–100 por proximidade, usando o erro absoluto na unidade da pergunta. A curva é `round(100 × max(0, 1 − (erro − margem100) / (erroZero − margem100))²)`. Dentro da margem, recebe 100; fora dela, a pontuação fica limitada a 99 até cair a zero.

Por defeito, contagens/alturas permitem 2% de erro para 100 pontos e dão zero a partir de um erro igual ao valor-alvo (mínimo de uma unidade). Para a CN Tower: 550 m → 100, 500 m → 85, 400 m → 54, 200 m → 14, 0 m → 0. `267k` é uma aproximação válida dos 267 570 do levantamento sueco e recebe 100. Nas datas, a escala é absoluta: ano correto → 100, desvio de um ano → 96, de dez anos → 64, de cinquenta anos → 0. Evita-se aplicar uma percentagem ao número do ano. Distâncias usam a tolerância em km da pergunta e uma escala zero de pelo menos 250 km. `scoring.fullCreditError/zeroCreditError` permite configurar as duas margens por pergunta, sempre em unidades absolutas.

O pin conserva a fórmula: 100 dentro da tolerância e, fora dela, `round(100 × exp(-distânciaKm / decayKm))`, limitado a 0–100. Não existe penalização por país diferente nestas perguntas genéricas; o jogo separado de capitais mantém as suas regras. Nos sliders, o palpite mantém-se visível e a resposta correta aparece marcada na própria barra após responder ou saltar. Os botões de verdadeiro/falso são neutros antes de responder.

O feedback permanece visível em acertos, aproximações, erros ou saltos até o utilizador clicar no cartão da resposta. Não há temporizador nem botão de pausa neste modo. O ecrã final dá destaque aos pontos e mostra a média por ronda; este modo só oferece jogar novamente ou voltar ao menu, sem revisão nem treino dos erros.

## Persistência e compatibilidade

`localStorage` continua a guardar tudo neste navegador. Não foi acrescentado servidor, base de dados ou conta. Chaves: `geokiwi.geoguru.saves.v2` e `geokiwi.geoguru.records.v2`, com slots `10:EASY`, `20:MEDIUM`, etc. `scoringVersion: 3` identifica a pontuação por aproximação. O progresso e a pontuação são reconstruídos a partir dos eventos; partidas anteriores conservam a ordem e os palpites e recebem a nova pontuação ao retomar. Os recordes existentes mantêm-se. IDs desconhecidos, revisões incompatíveis e eventos impossíveis não são retomados.

O histórico `geokiwi.geoguru.history.v1` guarda apenas IDs de perguntas efetivamente apresentadas, por ordem de visualização, sem reservar o resto da fila. É partilhado entre dificuldades e quantidades de rondas neste navegador. `createNewQuiz` evita repetir perguntas vistas enquanto existirem inéditas suficientes; se restarem poucas, usa todas antes de reciclar antigas. Um tipo esgotado não força a repetição das suas perguntas. Formatos diferentes sobre o mesmo facto usam `topicId` para evitar a mesma matéria duas vezes numa partida quando há alternativas. Partidas novas de pelo menos 10 rondas incluem uma pergunta inédita de bandeiras e uma de nomes/letras, enquanto houver alguma em cada grupo; estes destaques nunca forçam repetições. A ordem final é baralhada. Retomar continua a conservar a fila guardada; reiniciar ou jogar de novo usa a nova seleção. Ver [quiz-bank.md](quiz-bank.md) para contagens e proveniência.

As partidas antigas de texto são adaptadas como Easy, com a mesma ordem e respostas. O save antigo só é removido depois de o novo checkpoint ter sido guardado com sucesso. Os recordes antigos continuam na sua chave original; não são misturados com o novo banco de quizzes mistos.

## Pistas visuais e língua dos nomes

Os pins identificam o tipo de alvo (`placeType`: cidade, cume ou monumento). Os dez monumentos têm fotografias locais, sem bandeiras visíveis na inspeção, que podem ser ampliadas num diálogo; o avanço fica bloqueado enquanto o diálogo está aberto. O nome do país só é mostrado na solução. A mira fixa foi removida do mapa partilhado. Autoria, licença e origem acompanham cada foto, com lista completa em `public/licenses/landmark-photos.txt`.

As perguntas de nomes têm `nameLanguage` fixo, não inferido do idioma atual: contam os nomes comuns do catálogo do jogo nessa língua, sem espaços/hífens e com acentos normalizados. As duas traduções do enunciado deixam explícita essa língua. Trocar PT/EN durante uma partida mantém os mesmos critérios e respostas. Uma partida nova só seleciona a variante de nomes do idioma escolhido. Bandeiras usam conjuntos completos e finitos e as quotas habituais de dificuldade.

## Acrescentar perguntas

1. Escolher uma variante de `QuizQuestion` em `types.ts`.
2. Acrescentar o objeto ao banco, com nomes/explicações nas duas línguas e fonte que sustente a formulação exata.
3. Em listas, definir um conjunto finito e completo, com IDs e aliases sem ambiguidades.
4. Em números/rankings, indicar ano, critério, unidade e tolerância. «População de Coimbra» deve distinguir município/cidade e data. «Idiomas oficiais da Índia» deve distinguir União, estados e línguas previstas na Constituição.
5. Incrementar `revision` quando a resposta ou o significado mudar e executar os testes. Não é necessário alterar o router para uma pergunta de um dos sete tipos.

Exemplo de lista pequena:

```js
{
  schemaVersion: 1,
  id: 'multiple-everest',
  revision: 1,
  inputType: 'TEXT_MULTIPLE',
  category: 'geography',
  prompt: {pt: 'Nomeia os países que partilham a fronteira no Evereste.', en: 'Name the countries sharing the border at Everest.'},
  explanation: {pt: 'O cume fica na fronteira entre o Nepal e a China.', en: 'The summit lies on the Nepal–China border.'},
  sources: [{title: 'NASA · Himalayas', url: 'https://eol.jsc.nasa.gov/Collections/EarthObservatory/articles/AnAstronautsViewoftheHimalayas.htm'}],
  checkedAt: '2026-11-06',
  countryIds: ['524', '156'],
  suggestionDomain: 'countries',
  answer: {accepted: [countryEntity('524'), countryEntity('156')]},
}
```

O banco de arranque não pretende converter todos os exemplos de negócio em perguntas verificadas. Questões abertas como «cidades com la no nome», áreas como desertos e afirmações ambíguas precisam primeiro de um universo/critério explícito. O pin atual tem alvo pontual; não aceita automaticamente toda a área de um deserto. Os tipos são uma base para armazenamento em JSON/SQL futuramente: `id`, `revision` e `inputType` podem ser colunas indexadas, com o restante conteúdo em JSON. Atualmente o banco está no código estático, portanto as soluções podem ser inspecionadas no navegador.

## Verificação

`npm test` cobre os sete tipos, quotas ímpares, aliases repetidos, sufixos numéricos, proximidade em diferentes escalas, anos, posição dos marcadores, limites manuais, coordenadas, pontuação única, migração e retoma parcial. A identidade do formulário localizado é estável quando a pré-visualização numérica aparece, evitando recriar o input e perder foco após o primeiro dígito. `npm run build` compila a UI. `types.ts` é um contrato TypeScript sem dependências React; o resto do projeto continua em JavaScript/JSX.

## Exportar e encontrar o modo

`npm run quiz:export` gera `public/downloads/conhecimento-geral.md` e `.json`. O build atualiza ambos para evitar exportações desatualizadas. A versão Markdown é descarregável no cartão. Inclui todos os 468 registos ativos e explicita que só 436 são elegíveis por idioma. Não muda os saves/recordes existentes.

O cartão chama-se «Conhecimento geral» / «General knowledge» e mantém-se em Desafios. «Explora o mundo» passou para Outros modos, com os concelhos e estados. Os nove cartões usam `GameCardHeading` e o mesmo sistema pixel art/tamanho/tipografia; os botões de regiões, rondas e dificuldades mantêm as suas funções.

## Curadoria de formatos

A revisão dos 53 V/F mantém cinco relações/equívocos com interesse próprio, converte sete e retira 41 repetidos ou fracos. A pergunta científica do Namibe continua V/F; Kiribati é identificação de país e Berlim fica só na timeline. O contador e as exportações usam apenas perguntas ativas. `quizQuestionById` mantém objetos arquivados para reconstruir eventos antigos. A atualização de uma partida substitui só perguntas retiradas ainda sem resposta, sem alterar pontos/respostas e sem criar IDs repetidos. O histórico converte os IDs antigos para a versão canónica. Ver `quiz-editorial-review.md`.

## Feedback e avanço manual

Cada resposta concluída mostra os pontos ganhos numa animação ascendente, do vermelho (poucos pontos) ao verde (100 pontos), e mantém o valor no cartão da solução. O quiz não avança por tempo: clica no cartão da resposta, ou ativa o seu botão com Enter/Espaço, para continuar. Os links das fontes abrem sem avançar a ronda.

As perguntas sobre os próprios nomes (categoria `names` ou `nameLanguage`) nunca oferecem autocomplete, mesmo com as sugestões ativadas. A opção continua disponível nas restantes perguntas de escrita.
