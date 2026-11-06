# GeoKiwi

Site de jogos de geografia em português, construído com **React + Vite + D3.js + TopoJSON**. Marca GeoKiwi com rodela de kiwi pixelada, verde kiwi, creme e castanho nos temas claro/escuro, fontes pixeladas locais, sete modos, seleção de vários continentes, partidas retomáveis e estatísticas no navegador.

## Executar

Requisitos: Node.js 22.12+ e pnpm 11.25.0.

```sh
corepack enable
pnpm install
pnpm dev
```

Abra o endereço mostrado no terminal. Para verificar e gerar a versão estática:

```sh
pnpm test
pnpm build
pnpm preview
```

O diretório `dist/` gerado pode ser servido em qualquer hospedagem estática na raiz do domínio. O projeto não requer backend, contas, chaves de API ou chamadas externas durante as partidas. Os recordes são locais ao navegador e à origem do site. Para hospedar em um subdiretório, ajuste o `base` do Vite e os caminhos absolutos dos assets.

## Passo 1 — Estrutura, dados e Home

```text
geoquest/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── flags/                 # bandeiras SVG locais
│   ├── fonts/                 # Press Start 2P + Space Grotesk e licenças
│   ├── licenses/              # Licenças dos dados e bandeiras
│   └── favicon.svg
├── src/
│   ├── main.jsx               # Inicialização do React
│   ├── App.jsx                # Navegação, recordes e áudio opcional
│   ├── styles.css             # Layout, mapa, feedback e responsividade
│   ├── themes.css             # Temas escuro / claro e contraste dos mapas
│   ├── progress.css           # Partidas guardadas e painel de estatísticas
│   ├── data/
│   │   ├── countries.json     # Estado central dos destinos
│   │   ├── capital-coordinates.json # Coordenadas e fonte de cada capital
│   │   ├── world.json         # TopoJSON Natural Earth 1:50m
│   │   ├── overrides.json     # Traduções e respostas alternativas
│   │   └── index.js           # GeoJSON, índices, regiões e modos
│   ├── components/
│   │   ├── Home.jsx           # Cards e seleção de região/dificuldade
│   │   ├── WorldMap.jsx       # Mapa plano com pan/zoom
│   │   ├── GlobeMap.jsx       # Esfera interativa e rotação
│   │   ├── MapViewControl.jsx # Seletor visível de mapa / globo
│   │   ├── ThemeControl.jsx   # Switch Claro / Escuro no cabeçalho
│   │   ├── CapitalPin.jsx     # Pin sem nome para as duas vistas
│   │   ├── KeepCorrectControl.jsx # Switch visível no menu e no jogo
│   │   ├── Game.jsx           # Jogo, avanço automático e resultado
│   │   ├── Statistics.jsx     # Países, capitais e comparação de continentes
│   │   ├── Icon.jsx           # Ícones SVG e globo pixelado
│   │   └── Modal.jsx          # Diálogos com foco e Escape nativos
│   └── lib/
│       ├── game.js            # Regras, reducer e localStorage
│       ├── activity.js        # Autosave, recuperação e agregação sem duplicações
│       ├── map.js             # Escolha da massa de terra para zoom
│       └── globe.js           # Projeção, rotação, visibilidade e câmera esférica
├── scripts/update-data.mjs    # Atualização explícita dos dados
└── tests/                     # Regras dos jogos e geometria do globo
```

Os destinos seguem o formato solicitado. Exemplo real:

```json
{
  "id": "076",
  "nome_pt": "Brasil",
  "nome_en": "Brazil",
  "capital": "Brasília",
  "continente": "americas",
  "bandeira_url": "/flags/br.svg",
  "coordenadas_centro": [-55, -10],
  "coordenadas_capital": [-47.92972, -15.77972]
}
```

Também estão disponíveis `iso2`, `iso3`, `aliases` e `capitais_aceitas`. As coordenadas usam a ordem GeoJSON/D3: **longitude, latitude**. O `id` é o código numérico ISO em três dígitos, preservando os zeros iniciais, para unir dados e geometria.

`src/data/index.js` converte a topologia com `topojson.feature`, cria `byId` e centraliza `MODES`, `REGIONS` e `getPool`. Os jogos principais incluem países por defeito e permitem ativar territórios. É possível combinar continentes. As rondas de treino usam apenas respostas erradas e não substituem recordes dos percursos completos.

`Home.jsx` gera os quatro cards a partir de `MODES`. Cada card mantém sua própria região selecionada. A seleção atual determina o recorde exibido e a partida iniciada pelo botão **Jogar**. Os cartões mostram um título direto, uma indicação curta de clicar/escrever e um exemplo visual estático de pista → resposta, sem os parágrafos e etiquetas redundantes. `ModePreview.jsx` usa a forma real de Portugal e um pin de Lisboa para ilustrar cada ação; os botões das seis regiões permanecem iguais. Partidas guardadas apresentam apenas o progresso e as ações de retomar ou começar de novo. O switch **Manter acertos a verde** afeta os quatro jogos. A preferência fica salva no navegador e está disponível também na tela de jogo, podendo ser alterada sem reiniciar a partida.

## Passo 2 — Mapa interativo SVG

`WorldMap.jsx` usa `geoMercator` e `geoPath`, com a proporção normal dos mapas web. A mesma escala é usada nos dois eixos, sem comprimir a altura para forçar um retângulo 2:1. O enquadramento inicial considera os destinos entre 60° S e 84,5° N; os limites verticais da navegação são os limites polares de Mercator. A longitude não tem limite: o mundo repete-se horizontalmente e as cópias visíveis são recalculadas com uma margem de segurança, mantendo o oceano contínuo até depois de milhares de voltas. As cópias partilham IDs, respostas, verde e pin da capital; apenas a cópia central participa da navegação por Tab.

O mapa plano carrega progressivamente a geometria Natural Earth **1:10m**, em `public/maps/countries-10m.json`, com maior detalhe das costas e ilhas. O mapa 1:50m incluído no bundle continua disponível enquanto carrega ou se o ficheiro não estiver acessível. A geometria detalhada é memorizada durante a sessão. Carregá-la não altera a câmera, a pergunta ou a partida. `cleanFlatFeatures` valida todos os contornos esféricos: elimina os degenerados e orienta corretamente exteriores e buracos. Isto corrige três ilhas das Maldivas que pintavam o complemento da Terra e tapavam os continentes. Se a geometria detalhada de um país colapsar (Vaticano), usa a geometria válida 1:50m, conservando os IDs e a seleção. O globo mantém a geometria 1:50m e as suas otimizações anteriores. A grelha estende todos os meridianos até ±85,0511°, em vez de terminar as linhas secundárias em ±80°, cobrindo também a faixa superior e inferior da projeção. Não são usados serviços de mapas externos nem chaves de API durante as partidas.

Cada território é um `<path>` React independente, identificado por `data-country-id`, com as classes:

| Classe | Comportamento |
| --- | --- |
| `playable` | País elegível na região selecionada |
| `outside` | Fora da região; não recebe respostas |
| `target` | País destacado nos modos de digitação |
| `correct` | Feedback verde ou acerto persistente |
| `wrong` | Feedback vermelho temporário |

As fronteiras usam `vector-effect="non-scaling-stroke"` para manter a espessura durante o zoom. Microterritórios ganham marcadores adicionais de quatro pixels; o `<path>` original continua presente.

D3 controla somente a transformação do `<g>`: `zoom()` suporta arrastar, roda do mouse e pinch. Os botões chamam `scaleBy`; o botão de mira recentra a região selecionada. O React mantém as classes e os eventos dos países. As strings dos caminhos são memorizadas para evitar recalcular a geometria a cada movimento.

O mapa observa o espaço disponível com `ResizeObserver`. Ao entrar numa região, usa um enquadramento geográfico fixo do continente, sem incluir territórios ultramarinos ou toda a extensão asiática da Rússia na Europa. A projeção centra o Pacífico na Oceania e as Américas no seu próprio eixo. Nos jogos de clicar, o enquadramento e o zoom manual mantêm-se entre perguntas; o país seguinte não provoca um zoom-out. O globo também aproxima a Europa automaticamente. Nos modos 2 e 4, a câmera aproxima o país. No jogo 4, um pin pixelado sem nome marca `coordenadas_capital`; o nome do país aparece na pergunta, mas o da capital só é revelado depois da resposta. O pin mantém tamanho visual constante no zoom, acompanha o pan e participa do enquadramento da câmera para não ficar fora da tela. `focusGeometry` seleciona o polígono que contém seu centro ou a maior massa de terra; isso evita que territórios ultramarinos distantes impeçam um zoom útil. Todas as partes do país permanecem desenhadas e destacadas.

### Mapa plano e Globo 3D

O seletor **Mapa plano / Globo 3D** fica visível no menu e no topo da partida. `App.jsx` mantém a vista selecionada fora do estado da partida: trocar a vista remonta apenas o componente do mapa, preservando pergunta, respostas, pontuação e acertos. A preferência `mapView` é guardada em `geoquest.preferences.v1` sem sobrescrever `keepCorrect`.

`GlobeMap.jsx` usa a projeção esférica ortográfica de D3, com recorte de 90 graus. Cada país continua a ser um `<path>` clicável. A rotação altera a projeção das coordenadas geográficas; os países curvam-se com a esfera e deixam de aparecer quando passam ao hemisfério oculto. Iluminação, oceano, atmosfera e grelha reforçam a leitura da esfera.

- Arrastar com rato ou um dedo roda a esfera; longitude contínua e latitude limitada evitam inversões nos polos.
- Scroll, pinch de dois dedos e os botões + / − controlam o zoom. As setas do teclado rodam a esfera, + / − ampliam e Home recentra.
- Gestos de arrastar e pinch são distinguidos dos cliques, para não responder acidentalmente.
- Nos modos de digitação, a esfera vira-se para o país ou capital da pergunta. Nos modos de clicar, a orientação inicial depende apenas da região, preserva-se entre perguntas e nunca revela a resposta.
- Pins e marcadores de microterritórios têm um teste explícito de hemisfério; nunca atravessam visualmente a parte de trás da esfera.
- As classes de acerto/erro e a opção de manter o verde são as mesmas nas duas vistas. O pin da capital continua sem nome.
- Eventos de movimento são agrupados com `requestAnimationFrame`; durante o gesto, as costas usam geometria mais leve, mantendo todos os territórios e ilhas. A geometria completa 1:50m regressa quando o gesto termina. Cada contorno simplificado é validado pela área esférica e orientação: se a simplificação inverter uma ilha ou alterar demasiado a sua área, o contorno original é mantido. Isso impede países de preencherem o complemento da Terra, taparem os vizinhos ou pintarem a esfera inteira. Os realces de hover são suspensos durante a navegação.

### Temas e contraste

O cabeçalho tem um switch **Claro / Escuro**, disponível no menu e durante qualquer partida, também no telemóvel. O modo claro usa superfícies creme e bege, com acentos pastel de sálvia, azul, lavanda e pêssego. Os textos usam tons escuros para manter a leitura. Menus, controlos, formulários, diálogos, resultados e feedback acompanham o tema.

`themes.css` centraliza as cores de terra, fronteiras, oceanos e estados de resposta. No tema escuro, a terra é sálvia clara sobre mar azul profundo; a sombra da esfera foi reduzida para não ocultar os países nas bordas. No claro, o globo usa terra creme e oceanos azul acinzentado. O gradiente SVG lê variáveis CSS, pelo que o tema muda sem reiniciar a câmera nem a partida. O contraste de luminância entre terra e cada tom do mar é verificado automaticamente para evitar voltar à separação pouco legível da versão anterior.

A preferência `theme` é guardada em `geoquest.preferences.v1`, em conjunto com `mapView` e `keepCorrect`. `public/theme-init.js` aplica a preferência antes de carregar a interface para evitar um flash do tema errado. O estado de tema fica fora do reducer do jogo: mudar a aparência preserva perguntas, pontuação, respostas, cores e orientação atual do globo.

## Passo 3 — Lógica dos quatro modos

`lib/game.js` contém uma máquina de estados pura, utilizada por `useReducer` em `Game.jsx`. `makeQueue` embaralha **todos** os destinos da região com Fisher–Yates, sem repetição e sem limitar a 15 perguntas. Mundo Todo percorre os 230 destinos. O progresso usa o tamanho real da fila e a partida só termina depois do último destino. No jogo 3, capitais com nomes compartilhados, como Kingston, exibem a região como pista: assim nenhum destino precisa ser excluído.

| Modo | Pergunta | Resposta e avaliação |
| --- | --- | --- |
| 1 — Ache o país | Nome em português + bandeira | Clique no mapa; compara o ID ao destino |
| 2 — Qual é o país? | País destacado e aproximado | Texto; compara com `aliases` |
| 3 — Siga a capital | Apenas a capital, sem bandeira | Clique no país; compara o ID |
| 4 — Qual é a capital? | País identificado + pin sem nome na capital | Texto; compara com `capitais_aceitas` |

`ANSWER` aceita uma única tentativa por pergunta. Um acerto vale **100 pontos**. O máximo depende da região; no Mundo Todo são 23.000 pontos. O reducer e um bloqueio imediato impedem pontuação duplicada por cliques rápidos ou Enter repetido. Nos modos 2 e 4, o botão **Saltar** está disponível ao lado do input, mesmo vazio. A ação `SKIP` regista a pergunta como incorreta, atribui zero pontos, interrompe a sequência e apresenta a resposta correta com o mesmo feedback vermelho de um erro. O jogo avança automaticamente: 850 ms após um acerto e 2.300 ms após um erro ou salto. **Pausar** suspende o feedback para ler; **Continuar** retoma a contagem. A última solução permanece visível na pergunta seguinte. Abrir um diálogo ou ocultar o separador suspende o avanço. `NEXT` só avança após uma resposta ou salto, e os temporizadores são cancelados ao desmontar o jogo ou fazer pausa. Enter repetido e cliques duplos não permitem responder depois de revelar a solução.

Com **Manter acertos a verde** ligado, todos os países acertados permanecem verdes, incluindo os acertos anteriores ao momento de ligar a opção. Desligado, a cor original retorna ao avançar automaticamente; o destaque amarelo do alvo permanece nos modos de digitação. Erros sempre piscam em vermelho. O switch altera apenas a apresentação e preserva fila, progresso, pontuação e respostas. Se a ajuda visual for ligada em qualquer momento, a partida é classificada como assistida para os recordes, mesmo que a opção seja desligada depois.

`normalizeAnswer` remove acentos, pontuação, espaços e diferenças de maiúsculas. Nomes em português e inglês são aceitos. Capitais com múltiplas respostas válidas têm aliases explícitos; por exemplo, a África do Sul aceita Pretória, Cidade do Cabo e Bloemfontein. As equivalências estão nos dados, sem aceitar aproximações arbitrárias que confundam países distintos.

Ao concluir a partida, a tela mostra pontuação, acertos, melhor sequência, revisão das respostas e opção de jogar novamente.

### Interface de jogo

Durante a partida, o mapa ocupa 100% da área útil do ecrã. A navegação geral é ocultada. A pergunta (nome do país ou capital, consoante o jogo) fica num cartão flutuante central; nos modos de escrita, usa uma faixa compacta sem título redundante e com um campo de resposta curto; pontos e ronda ficam num pequeno painel à esquerda. Os controlos de mapa/globo e o switch de acertos a verde permanecem visíveis à direita. Nos modos 2 e 4, o switch **Sugestões de nomes** fica junto de **Manter acertos a verde**. Ao escrever, apresenta até seis nomes começados pelo prefixo, sem distinguir acentos ou maiúsculas. A lista respeita a região, é ordenada alfabeticamente e não consulta o alvo da pergunta. Nos países, aceita português e inglês; nas capitais, inclui nomes alternativos aceites e elimina duplicados, sem associar capitais a países. Clicar numa opção ou selecioná-la com setas e Enter preenche o campo; Enter seguinte ou o botão confirma a resposta. Escape fecha a lista. Desligar a ajuda preserva o texto e a partida. A preferência `suggestions` é guardada em `geoquest.preferences.v1`, independentemente do tema, vista e verde. Tema, som e estatísticas ficam nas opções. Não há barras independentes de metadados, pergunta ou opções a reduzir a altura do mapa.

Depois da resposta, o país ou capital é identificado por uma etiqueta na sua posição geográfica. Antes de responder, a etiqueta permanece oculta; no jogo 4 mantém-se apenas o pin sem nome. As etiquetas seguem o pan, repetem-se com o mundo e mantêm tamanho constante durante o zoom; no globo são ocultadas no hemisfério de trás. O feedback inferior é compacto e continua a avançar automaticamente, com pausa opcional. Sair, abrir opções ou ocultar o separador suspende esse avanço. O mapa mantém o mesmo tamanho nos dois temas e em ecrãs pequenos.

### Recordes

A marca mudou de GEOQUEST para GeoKiwi. As chaves locais `geoquest.*` e o endereço publicado foram mantidos para conservar partidas, estatísticas, recordes e preferências existentes.

Chave dos percursos completos: `geoquest.highscores.v2`. Os antigos recordes de 15 perguntas permanecem intactos em `v1`, sem serem comparados ao novo formato. A preferência do switch usa `geoquest.preferences.v1`. Cada registro usa a composição:

```text
modo:região:dificuldade
1:europa:normal → 1200
1:europa:dificil → 900
```

Nos quatro modos, `normal` identifica partidas com ajuda visual e `dificil` identifica partidas em que o verde permanente nunca foi ligado. Um resultado inferior não substitui o recorde. Dados inválidos são descartados; se o navegador bloquear o armazenamento, o jogo continua e informa que o recorde ficará apenas na sessão. A tabela **Recordes** mostra todas as combinações.

### Progresso guardado e estatísticas

`geoquest.activity.v1` contém partidas e estatísticas num único documento localStorage. Cada combinação de jogo e região tem uma partida guardada, com o identificador da sessão, a fila completa de IDs, respostas, posição e estado do verde. A gravação acontece ao começar e após cada resposta, avanço ou alteração do verde. **Guardar e sair** volta ao menu; o cartão seleciona a região da partida guardada mais recente e oferece **Retomar partida** e **Começar novo jogo**. Substituir uma partida exige a escolha explícita no diálogo e mantém estatísticas e recordes.

`restoreGame` valida os destinos contra a base atual e reconstrói a pontuação pelo reducer. A fila nunca é baralhada de novo. Se a página fechar durante o feedback, a resposta é mostrada ao retomar antes de avançar. A última pergunta pode ser retomada para concluir o resultado. Partidas incompatíveis com a base atual são ignoradas sem descartar as estatísticas válidas.

`checkpoint` regista apenas respostas ainda não agregadas, usando um ledger por identificador de partida. Gravação, estatísticas e marcador de processamento são persistidos juntos, prevenindo duplicações no StrictMode, ao retomar ou ao concluir a última pergunta. Ao terminar, remove apenas a partida correspondente e incrementa os percursos completos uma vez.

A aba **Estatísticas** mostra respostas, taxa de acerto, destinos únicos, percursos completos, melhor sequência global, barras por continente e listas dos dez destinos mais difíceis e mais fortes. Os filtros separam países (jogos 1/2), capitais (3/4) ou um jogo específico. Saltos contam como erros e são também mostrados separadamente. As comparações de melhor/pior continente exigem três tentativas por continente e mostram a dimensão da amostra; continentes sem tentativas não são tratados como 0%. Os dados anteriores não são inventados a partir dos recordes: a recolha começa nesta atualização.

Os dados são locais a este navegador e origem, sem sincronização entre dispositivos; limpar os dados do navegador apaga-os. Se o armazenamento estiver bloqueado ou sem espaço, a aplicação informa que só conserva o progresso na sessão atual e continua a funcionar em memória.

## Atualizar os dados

Edite traduções ou equivalências em `src/data/overrides.json` e execute:

```sh
pnpm update:data
pnpm test
pnpm build
```

Esse comando precisa de internet e atualiza `countries.json`, `world.json`, `public/maps/countries-10m.json` e as bandeiras locais. As coordenadas verificadas das capitais são mescladas a partir de `capital-coordinates.json`, que registra o nome, o par longitude/latitude e a URL GeoNames de cada local. Ao mudar a capital ou acrescentar um destino, atualize também esse arquivo; o script interrompe se faltar uma coordenada verificada, em vez de usar o centro do país como pin. A atualização é explícita; uma partida nunca depende de uma API externa. A base distribuída é um snapshot de 23/10/2026. Guiné Equatorial usa Ciudad de la Paz; a Indonésia mantém Jacarta no snapshot. Mudanças de capitais e status territoriais devem ser revisadas nas próximas atualizações.

## Validação

**62 testes aprovados**, cobrindo integridade dos 230 destinos e bandeiras, coordenadas das capitais, seis regiões, quatro modos com os 230 destinos completos, ausência de limite de 15, ordem aleatória sem repetição, switch durante a partida, preferência persistida, separação dos recordes antigos, pontuações acima de 1.500, uma tentativa por pergunta, corrupção/bloqueio de armazenamento e geometria em tamanhos móveis e desktop. Os testes adicionais verificam Saltar nos dois modos de digitação, bloqueio de respostas duplicadas, fim da partida após o último salto, orientação e área de todas as ilhas simplificadas e ausência de preenchimentos excessivos durante drag/zoom. Os testes do globo verificam rotação completa, limites de zoom, recorte do hemisfério, todos os destinos visíveis, as 230 capitais centradas, geometria de movimento e preferências independentes. Os testes de tema cobrem persistência independente das outras preferências, armazenamento bloqueado, aplicação antes do arranque e separação visual entre terra e mar nas duas paletas. Os testes da projeção verificam as proporções de Mercator, escala local igual nos dois eixos, meridianos verticais, paralelos horizontais e as 230 capitais dentro dos limites projetados. Testam ainda milhares de voltas para ambos os lados em diferentes zooms, sem bordas vazias, geometria detalhada finita nos cortes do Pacífico, todos os IDs jogáveis presentes e carregamento com cache e recuperação de falhas. Os novos testes verificam recuperação das quatro modalidades sem mudar a fila, gravação atómica e deduplicação após recarregar, isolamento de jogos/regiões, saltos nas estatísticas de capitais, remoção da partida concluída, armazenamento corrompido/bloqueado e enquadramento europeu em ecrãs pequenos e grandes. Mais 17 verificações de renderização React cobrem Home com partida guardada, quatro jogos nas duas vistas, feedback automático e estatísticas. Os testes de regressão validam a área e orientação de todos os contornos detalhados, a correção das Maldivas, o fallback do Vaticano e a preservação dos 230 IDs jogáveis. A renderização React verifica os quatro jogos e as duas vistas com pergunta flutuante, resposta geográfica apenas depois de responder e ausência da barra antiga de perguntas. Os testes de sugestões verificam o estreitamento s → sa → santa luc, acentos, região, ordenação independente do alvo, nomes ingleses/capitais aceites, teclado e preferência persistida; os da grelha verificam os meridianos até ao limite polar. O build de produção foi gerado com sucesso.

A revisão visual automatizada ficou pendente: a política de segurança da ferramenta de navegador bloqueou a abertura da prévia local. Os testes de geometria não substituem uma revisão visual ou testes de gestos em dispositivos reais.

## Fontes e licenças

- [World Atlas](https://github.com/topojson/world-atlas): TopoJSON de [Natural Earth](https://www.naturalearthdata.com/), escalas 1:10m (plano) e 1:50m (globo). Geometria Natural Earth em domínio público; licença do World Atlas incluída em `public/licenses`.
- [Mledoze Countries](https://github.com/mledoze/countries): nomes, capitais e regiões. Banco adaptado disponibilizado sob **Open Database License 1.0 (ODbL)**, com texto em `public/licenses/countries-ODbL.txt` e dados em `src/data/countries.json`.
- [GeoNames](https://www.geonames.org/): coordenadas das capitais, selecionadas do conjunto [cities500](https://download.geonames.org/export/dump/). **CC BY 4.0**. Atribuição em `public/licenses/GeoNames-ATTRIBUTION.txt` e fonte individual de cada cidade em `src/data/capital-coordinates.json`.
- [Flag Icons](https://github.com/lipis/flag-icons): SVGs sob MIT, licença incluída.
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) e [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk): SIL Open Font License; arquivos e licenças em `public/fonts`.
- [D3 Zoom](https://d3js.org/d3-zoom): documentação da implementação de pan/zoom.
- [Governo da África do Sul](https://www.gov.za/south-africa-glance): capitais múltiplas.
- [Autoridade de Nusantara, julho de 2026](https://ikn.go.id/id/posts/pembangunan-tahap-ii-ikn-terus-berjalan-otorita-ikn-lakukan-evaluasi-berkala): cronograma de transição da capital indonésia.

Os créditos também estão acessíveis no rodapé do site. As fronteiras são cartográficas e podem incluir áreas disputadas; o jogo não pretende definir soberania.

## Modos adicionais e fontes dos limites

- Concelhos de Portugal: opção para percorrer os 308 ou praticar todos os concelhos de um distrito; cada seleção tem progresso e recorde próprios. Ao errar, a resposta correta aparece a amarelo. Dados: 308 geometrias da Carta Administrativa Oficial de Portugal, Direção-Geral do Território, [versão GeoJSON](https://github.com/nmota/caop_GeoJSON), simplificada para o jogo; [CAOP](https://www.dgterritorio.gov.pt/atividades/cartografia/cartografia-tematica/caop), CC BY 4.0. A versão fornecida pelo repositório é histórica; não foi verificada como CAOP 2025.
- Estados dos EUA: 50 estados, fonte [US Atlas](https://github.com/topojson/us-atlas), derivada do US Census Bureau, domínio público.
- Aproximação de capitais: distância geodésica em quilómetros; pontos = arredondar(100 × exp(-distância / 500)), com máximo de 25 fora do país. Acima de 100 km ou fora do país, a capital entra no treino final.
- Os modos adicionais guardam a partida e os recordes localmente, por modo, região e ajuda visual. O painel de estatísticas existente acompanha os quatro modos de países e capitais por nome.
- As bandeiras são incorporadas em `src/data/flag-svgs.json`, evitando uma requisição por pergunta.

## Cloudflare Pages e domínio geokiwi.pt

O modo Fun facts foi refatorado para um quiz dinâmico de sete tipos com dificuldade Easy/Medium/Hard. Contratos TypeScript, componentes, regras numéricas, exemplos e persistência estão descritos em [docs/geoguru.md](docs/geoguru.md).

Preparação pronta em `wrangler.toml`, com os comandos `cloudflare:login`, `cloudflare:create`, `cloudflare:deploy` e `cloudflare:package`. O script de embalagem gera um ZIP só com os ficheiros estáticos. O guia [docs/PUBLICAR-CLOUDFLARE.md](docs/PUBLICAR-CLOUDFLARE.md) explica o upload, o domínio e onde os dados são guardados. A publicação numa conta Cloudflare requer o login do proprietário; preparar o código não cria a conta nem regista o domínio.
