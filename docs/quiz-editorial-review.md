# Revisão editorial — verdadeiro/falso

**53 perguntas revistas: 5 mantidas, 7 convertidas e 41 retiradas.**

Uma pergunta V/F mantém-se quando testa uma relação ou um equívoco que vale a pena discutir. Afirmações que apenas revelam um país, número ou ano são convertidas quando existe um formato melhor. Se a pista já existe, mantém-se a versão canónica e retira-se a repetição. Não se acrescentam perguntas apenas para compensar a redução do contador.

## Casos principais

- Berlim e Torre Eiffel: só as timelines existentes; deixam de aparecer perguntas V/F sobre os mesmos anos.
- Kiribati: fica uma única identificação do país, sem a pista da capital Tarawa e sem afirmar exclusividade mundial incluindo territórios ultramarinos.
- Namibe: mantém-se V/F sobre o nevoeiro como fonte principal de água.
- Union Flag: nova timeline de 1801, em vez de confirmar/negar um ano inventado.
- Bandeiras: Bangladesh, Jamaica, Filipinas, Paraguai e Lesoto passam a identificação do país.
- Capricórnio na Oceânia: identificação da Austrália.
- Litoral: dez afirmações individuais dão lugar às listas continentais, acrescentando a lista europeia completa de 15 países.
- Países duplamente encravados: uma lista completa de dois países; a dificuldade passa a aplicar a quota correta.
- Latitude: só se mantêm as comparações Nova Iorque/Roma e Londres/Vancouver, sem o texto técnico «ponto de referência no mapa». Retiram-se os casos triviais e a comparação Cidade do Cabo/Sydney dependente de poucos quilómetros.

## Fontes revalidadas

- [UNDP Climate — Kiribati](https://undp-climate.exposure.co/the-ocean-is-our-store-keeper): artigo aberto, confirma um país insular cujo arquipélago ocupa quatro hemisférios. O antigo perfil UNCTAD e o PDF integral devolveram 403 nesta revisão; não se tratou um excerto indexado como leitura integral.
- [UNESCO — Namib Sand Sea](https://whc.unesco.org/en/list/1430/): confirma que o nevoeiro é a fonte principal de água do sítio.
- [Royal Family — Union Jack](https://www.royal.uk/union-jack): confirma o desenho atual adotado em 1801.
- [Mledoze — Countries](https://raw.githubusercontent.com/mledoze/countries/master/countries.json): conjunto europeu sem litoral cruzado com os países/continentes do jogo. São 15, incluindo Kosovo (`UNK`, ID `383`).
- [Natural Earth v5.1.2](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson): entre os 14 países da Oceânia, só os polígonos australianos atravessam −23,4° e −23,436°; ilhas separadas foram verificadas individualmente.
- As fontes oficiais das cinco bandeiras são as mesmas da verificação documentada em quiz-flag-variants-provenance.md. Não foram acrescentadas alegações de exclusividade mundial.

## Decisão por pergunta

| ID antigo | Decisão | Destino ativo |
| --- | --- | --- |
| `tf-namib-fog` | Manter V/F | `tf-namib-fog` |
| `tf-latitude-new-york-south-rome` | Manter V/F | `tf-latitude-new-york-south-rome` |
| `tf-latitude-london-north-vancouver` | Manter V/F | `tf-latitude-london-north-vancouver` |
| `continental-equatorial-guinea-land` | Manter V/F | `continental-equatorial-guinea-land` |
| `continental-maldives-equator-land` | Manter V/F | `continental-maldives-equator-land` |
| `tf-eiffel-century` | Retirar: versão já existente | `timeline-eiffel` |
| `tf-berlin-1991` | Retirar: versão já existente | `timeline-berlin` |
| `tf-nepal-rectangle` | Retirar: versão já existente | `bandeira-nepal` |
| `tf-bhutan-swan` | Retirar: versão já existente | `dragao-branco` |
| `tf-new-zealand-blue-stars` | Retirar: versão já existente | `quatro-estrelas-vermelhas` |
| `tf-swiss-square-flag` | Retirar: versão já existente | `bandeira-quadrada-suica` |
| `tf-canada-maple-points` | Retirar: versão já existente | `folha-onze-pontas` |
| `tf-grand-canyon-mississippi` | Retirar: versão já existente | `grand-canyon` |
| `tf-galapagos-ecuador` | Retirar: versão já existente | `galapagos` |
| `tf-uluru-new-zealand` | Retirar: versão já existente | `uluru` |
| `tf-rapa-nui-chile` | Retirar: versão já existente | `moai` |
| `tf-machu-picchu-mexico` | Retirar: versão já existente | `machu-picchu` |
| `tf-petra-jordan` | Retirar: versão já existente | `petra` |
| `tf-angkor-cambodia` | Retirar: versão já existente | `angkor` |
| `tf-serengeti-kenya` | Retirar: versão já existente | `serengeti` |
| `tf-lesotho-altitude` | Retirar: versão já existente | `lesoto-altitude` |
| `tf-kiribati-hemispheres` | Retirar: versão já existente | `quatro-hemisferios` |
| `tf-panama-indian-ocean` | Retirar: versão já existente | `canal-dois-oceanos` |
| `tf-everest-only-nepal` | Retirar: versão já existente | `multiple-everest` |
| `tf-liechtenstein-doubly-landlocked` | Retirar: versão já existente | `multiple-doubly-landlocked` |
| `tf-union-flag-1901` | Converter | `timeline-union-flag` |
| `tf-landlocked-bol` | Consolidar em lista | `continental-landlocked-south-america` |
| `tf-landlocked-pry` | Consolidar em lista | `continental-landlocked-south-america` |
| `tf-landlocked-che` | Consolidar em lista | `continental-landlocked-europe` |
| `tf-landlocked-aut` | Consolidar em lista | `continental-landlocked-europe` |
| `tf-landlocked-mng` | Consolidar em lista | `continental-landlocked-asia` |
| `tf-landlocked-npl` | Consolidar em lista | `continental-landlocked-asia` |
| `tf-landlocked-lso` | Consolidar em lista | `continental-landlocked-africa` |
| `tf-landlocked-uzb` | Consolidar em lista | `continental-landlocked-asia` |
| `tf-landlocked-lie` | Consolidar em lista | `continental-landlocked-europe` |
| `tf-landlocked-ner` | Consolidar em lista | `continental-landlocked-africa` |
| `tf-latitude-tokyo-north-paris` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `tf-latitude-cairo-north-dubai` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `tf-latitude-singapore-south-equator` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `tf-latitude-nairobi-south-equator` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `tf-latitude-cape-town-south-sydney` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `tf-latitude-buenos-aires-north-cape-town` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `tf-latitude-mumbai-north-shanghai` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `tf-latitude-marrakesh-north-london` | Retirar: comparação fraca | Outra pergunta inédita ao retomar |
| `continental-australia-capricorn` | Converter | `country-capricorn-oceania` |
| `continental-borneo-three-countries` | Retirar: versão já existente | `continental-island-borneo` |
| `continental-india-cancer` | Retirar: versão já existente | `continental-cancer-asia` |
| `continental-malawi-ocean-coast` | Retirar: versão já existente | `continental-landlocked-africa` |
| `flagsv-bangladesh-disc-centred` | Converter | `country-flag-bangladesh` |
| `flagsv-jamaica-red-colour` | Converter | `country-flag-jamaica` |
| `flagsv-philippines-peacetime-order` | Converter | `country-flag-philippines` |
| `flagsv-paraguay-two-sides` | Converter | `country-flag-paraguay` |
| `flagsv-lesotho-mokorotlo` | Converter | `country-flag-lesotho` |

## Partidas e histórico

As perguntas retiradas continuam apenas no índice histórico que valida respostas antigas; não entram em novas partidas, no contador nem nas exportações. Ao retomar, as respostas já dadas e os pontos mantêm-se. Só os slots ainda sem resposta são substituídos, com IDs únicos e escolhas determinísticas; duas perguntas que apontam para a mesma versão canónica não criam duplicados. Quando a canónica já está na fila, usa-se outra pergunta, preferindo inéditas. O histórico antigo é convertido para IDs canónicos para não reintroduzir o mesmo facto noutra forma.

Banco ativo após a revisão: **436 perguntas por idioma, 468 registos**. Os sete tipos continuam suportados.

- TRUE_FALSE: 5
- TEXT_SINGLE: 131
- TEXT_MULTIPLE: 102
- NUMBER_EXACT: 50
- MAP_PINPOINT: 58
- SLIDER_TIMELINE: 41
- SLIDER_DISTANCE: 49

## Verificação

- 160 testes passaram, incluindo as 53 decisões editoriais, ausência de IDs retirados no banco ativo, respostas das novas perguntas, quotas das listas, histórico canónico e migração de partidas com pontos.
- Contratos TypeScript e build de produção passaram.
- Brave isolado, 1360×900 e 375×812: uma partida antiga com Berlim já respondido mantém 100 pontos, passa Kiribati para escrita e chega a 200 depois da resposta correta. A pergunta seguinte é a identificação do Paraguai.
- A antiga pergunta V/F da Union Flag retoma como slider; 1801 recebe 100 pontos e aparece marcado na barra.
- A pergunta científica do Namibe mantém os dois botões V/F. As perguntas de texto não apresentam mapa.
- Exportações HTTP contêm 468 registos ativos, 436 elegíveis por idioma e só 5 V/F; os dois IDs dos exemplos retirados não aparecem no MD. Não ocorreram exceções JavaScript nos fluxos verificados.
