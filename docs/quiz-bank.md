# Banco Conhecimento geral — 6 de novembro de 2026

O banco disponibiliza **476 perguntas por idioma** (508 registos: o núcleo de 338, 42 perguntas novas de bandeiras, 32 critérios de nomes/letras com variantes separadas PT/EN, 32 variantes continentais e 32 variantes de números, datas, pins e distâncias). As variantes linguísticas não são somadas ao contador da interface. A causa da repetição anterior era a composição: 106 perguntas de texto, dois exemplares de cada um de quatro tipos e apenas um pin e uma distância. A seleção tentava incluir todos os tipos em cada run, repetindo necessariamente os grupos pequenos.

| Tipo | Antes | Agora |
| --- | ---: | ---: |
| `TEXT_SINGLE` | 106 | 126 |
| `TRUE_FALSE` | 2 | 53 |
| `NUMBER_EXACT` (aproximação) | 2 | 50 |
| `TEXT_MULTIPLE` | 2 | 100 |
| `SLIDER_TIMELINE` | 2 | 40 |
| `SLIDER_DISTANCE` | 1 | 49 |
| `MAP_PINPOINT` | 1 | 58 |
| **Total** | **116** | **476** |

## Expansão por continentes e variantes

Foram acrescentadas **94 perguntas** nesta atualização, sem alterar os IDs antigos:

- **30 de bandeiras:** cores e símbolos por continente, Cruzeiro do Sul, animais e brasões, bandeiras com desenhos distintos, estrelas/raios/faixas e pormenores de hasteamento. [Fontes e conjuntos completos](quiz-flag-variants-provenance.md).
- **32 continentais:** Equador (terra, incluindo ilhas), trópicos, países sem litoral, ilhas e lagos partilhados, Benelux, Bálticos e Ásia Central. Não se confundem águas territoriais com terra nem bacias hidrográficas com margens de lagos. [Proveniência](quiz-continental-provenance.md).
- **32 de outros formatos:** oito números, oito datas, oito pins de cidades e oito distâncias escolhidas. Os percursos incluem oceanos e quase antípodas; os números incluem canais, túneis, lagos, recifes e cataratas. [Proveniência](quiz-world-variants-provenance.md).

A lista integral é gerada em `public/downloads/conhecimento-geral.md` e `.json`, com PT/EN, respostas, explicações e fontes. `npm run build` regenera os dois ficheiros.

## Bandeiras e nomes/letras

- **12 novas perguntas de bandeiras**: oito grupos com critérios explícitos (estrelas, animais, armas, cruzes, cores e crescentes) e quatro pistas únicas. Conjuntos completos verificados contra bandeiras locais e fontes oficiais; ver [quiz-flags-provenance.md](quiz-flags-provenance.md).
- **32 perguntas de nomes por idioma**: iniciais em vários continentes, nomes de 4–8 letras e critérios como «países da Europa com mais de seis letras». Contam apenas países da lista principal e os nomes comuns do catálogo, sem espaços/hífens; o enunciado fixa a língua para que a resposta não mude ao trocar a interface.
- Em partidas novas de 10/20/30 rondas, reserva-se uma pergunta inédita de cada um destes dois grupos, se existir. A ordem é baralhada e as restantes perguntas continuam a misturar os sete tipos. Quando um grupo esgota, não se força uma repetição antes de esgotar outras perguntas inéditas.

## Novos conteúdos

- **30 listas de fronteiras**: Panamá, Portugal, Alemanha, Áustria, Suíça, Bélgica, Luxemburgo, Polónia, Chéquia, Eslováquia, Hungria, Eslovénia, Chile, Peru, Argentina, Uruguai, Paraguai, Bolívia, Equador, Colômbia, Costa Rica, Guatemala, México, Estados Unidos, Mongólia, Nepal, Butão, Essuatíni, Haiti e Timor-Leste.
- **40 distâncias**: pares escolhidos entre cidades de todos os continentes habitados, calculados em grande círculo a partir das coordenadas locais. Não é uma multiplicação de todos os pares possíveis para inflacionar o contador.
- **49 pins novos**: 30 cidades, 9 cumes e 10 monumentos, além do Evereste já existente. Só são usados alvos pontuais: não se representa um rio ou deserto inteiro com um centro arbitrário.
- **30 datas**: ciência, instituições, tratados, marcos históricos e inaugurações. Ver [quiz-history-provenance.md](quiz-history-provenance.md).
- **33 números**: populações com ano de referência, áreas, alturas, comprimentos e contagens de ilhas. A observação incoerente de área do Canadá no World Bank foi excluída e substituída pela Statistics Canada. Ver [quiz-numbers-provenance.md](quiz-numbers-provenance.md).
- **40 verdadeiro/falso**: 20 adaptações de pistas já verificadas, 10 sobre acesso ao mar e 10 comparações de latitude calculadas a partir das coordenadas. Exatamente 20 verdadeiras e 20 falsas nesta expansão. Ver [quiz-boolean-provenance.md](quiz-boolean-provenance.md).

As duas perguntas de Berlim agora dizem **queda/caiu** e **fall/fell**, mantendo 1989 como solução temporal e 1991 como afirmação falsa. Os IDs e a revisão mantêm-se porque a resposta não mudou; partidas guardadas continuam válidas.

## Dados geográficos

`borders-snapshot.json` guarda apenas os 30 conjuntos usados, extraídos de [Mledoze / Countries](https://raw.githubusercontent.com/mledoze/countries/master/countries.json) em 2026-11-06. SHA-256 da resposta original: `0d92fb23b43ae080bd439f5dc5d61a8845395fdd0af1479b433c59fe079bd6fd`. Os países foram escolhidos para evitar conjuntos ambíguos de fronteiras ultramarinas ou estatutos disputados; todos os vizinhos aceites são países da lista principal do jogo. Não há chamadas ao fornecedor durante a partida.

Os dez monumentos têm fotografias locais ampliáveis, sem bandeiras visíveis na inspeção. O enunciado omite o país e o cabeçalho identifica «Monumento»; outros pins mostram «Cidade» ou «Cume». Ver [landmark-photos-a.md](landmark-photos-a.md), [landmark-photos-b.md](landmark-photos-b.md) e a lista pública de créditos em `public/licenses/landmark-photos.txt`.

Os pins e distâncias reutilizam o catálogo local em `exploration-places.js`, com pontos Natural Earth 5.1.2 e Wikidata. A distância usa raio médio 6371,0088 km e é arredondada ao quilómetro. As coordenadas e os pares são verificados nos testes.

## Seleção e persistência

1. As perguntas sem histórico têm prioridade global.
2. Dentro dessa prioridade, alternam-se os tipos disponíveis e evita-se repetir o mesmo `topicId` na run.
3. Se um tipo não tiver perguntas inéditas, os outros tipos continuam a fornecer novidades.
4. Só depois de usar as inéditas disponíveis se reciclam perguntas antigas; dentro de cada tipo, as menos recentes vêm primeiro.
5. O histórico é atualizado ao apresentar cada pergunta, não ao gerar toda a fila. Guardar/retomar mantém o progresso, e reiniciar/jogar de novo consulta o histórico.

O histórico é local, partilhado entre dificuldades e rondas, e cresce até ao tamanho do banco. Bloqueio ou corrupção de armazenamento não impede jogar. Novas perguntas acrescentadas ao banco entram automaticamente como inéditas. Não se promete ausência de repetição entre navegadores diferentes, nem se altera silenciosamente uma partida que o utilizador escolheu retomar.

## Verificação

Os testes validam os 508 registos e os bancos elegíveis de 476 perguntas por idioma, as sete coberturas de input, unicidade dos IDs e prompts nas duas línguas, países válidos, fontes, diferenças de definição, pares de cidades, conjuntos de fronteiras e a seleção de partidas sucessivas de 10 perguntas sem repetir nenhum ID enquanto houver perguntas inéditas. O ciclo seguinte inclui todas as inéditas restantes antes de reciclar. Há também regressão específica para o antigo caso de um único pin esgotado, migração de histórico, armazenamento bloqueado e formulação de Berlim.
