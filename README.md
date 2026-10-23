# GEOQUEST

Site de jogos de geografia em português, construído com **React + Vite + D3.js + TopoJSON**. Tema escuro, fontes pixeladas locais, quatro modos, seis regiões e recordes no navegador.

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
│   ├── flags/                 # 230 bandeiras SVG locais
│   ├── fonts/                 # Press Start 2P + Space Grotesk e licenças
│   ├── licenses/              # Licenças dos dados e bandeiras
│   └── favicon.svg
├── src/
│   ├── main.jsx               # Inicialização do React
│   ├── App.jsx                # Navegação, recordes e áudio opcional
│   ├── styles.css             # Tema, mapa, feedback e responsividade
│   ├── data/
│   │   ├── countries.json     # Estado central dos destinos
│   │   ├── world.json         # TopoJSON Natural Earth 1:50m
│   │   ├── overrides.json     # Traduções e respostas alternativas
│   │   └── index.js           # GeoJSON, índices, regiões e modos
│   ├── components/
│   │   ├── Home.jsx           # Cards e seleção de região/dificuldade
│   │   ├── WorldMap.jsx       # Componente central do mapa
│   │   ├── Game.jsx           # Tela de jogo e resultado
│   │   ├── Icon.jsx           # Ícones SVG e globo pixelado
│   │   └── Modal.jsx          # Diálogos com foco e Escape nativos
│   └── lib/
│       ├── game.js            # Regras, reducer e localStorage
│       └── map.js             # Escolha da massa de terra para zoom
├── scripts/update-data.mjs    # Atualização explícita dos dados
└── tests/game.test.js         # Testes automatizados
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
  "coordenadas_centro": [-55, -10]
}
```

Também estão disponíveis `iso2`, `iso3`, `aliases` e `capitais_aceitas`. As coordenadas usam a ordem GeoJSON/D3: **longitude, latitude**. O `id` é o código numérico ISO em três dígitos, preservando os zeros iniciais, para unir dados e geometria.

`src/data/index.js` converte a topologia com `topojson.feature`, cria `byId` e centraliza `MODES`, `REGIONS` e `getPool`. O jogo inclui apenas destinos com geometria e capital disponíveis. Mundo Todo inclui países e territórios; a base contém 230 destinos: África 57, Ásia 49, Europa 50, Américas 51 e Oceania 23. A Antártida não participa. Alguns microestados sem geometria nesta escala não estão na seleção.

`Home.jsx` gera os quatro cards a partir de `MODES`. Cada card mantém sua própria região selecionada. A seleção atual determina o recorde exibido e a partida iniciada pelo botão **Jogar agora**. O controle Normal/Difícil afeta os jogos 1 e 3.

## Passo 2 — Mapa interativo SVG

`WorldMap.jsx` usa `geoNaturalEarth1` e `geoPath`. Cada território é um `<path>` React independente, identificado por `data-country-id`, com as classes:

| Classe | Comportamento |
| --- | --- |
| `playable` | País elegível na região selecionada |
| `outside` | Fora da região; não recebe respostas |
| `target` | País destacado nos modos de digitação |
| `correct` | Feedback verde ou acerto persistente |
| `wrong` | Feedback vermelho temporário |

As fronteiras usam `vector-effect="non-scaling-stroke"` para manter a espessura durante o zoom. Microterritórios ganham marcadores adicionais de quatro pixels; o `<path>` original continua presente.

D3 controla somente a transformação do `<g>`: `zoom()` suporta arrastar, roda do mouse e pinch. Os botões chamam `scaleBy`; o botão de mira restaura o mapa inteiro. O React mantém as classes e os eventos dos países. As strings dos caminhos são memorizadas para evitar recalcular a geometria a cada movimento.

O mapa observa o espaço disponível com `ResizeObserver`. Ao entrar em uma região, ajusta a câmera aos limites dela. Nos modos 2 e 4, a câmera aproxima o país. `focusGeometry` seleciona o polígono que contém seu centro ou a maior massa de terra; isso evita que territórios ultramarinos distantes impeçam um zoom útil. Todas as partes do país permanecem desenhadas e destacadas.

## Passo 3 — Lógica dos quatro modos

`lib/game.js` contém uma máquina de estados pura, utilizada por `useReducer` em `Game.jsx`. `makeQueue` embaralha os destinos com Fisher–Yates, sem repetição, e escolhe 15 perguntas. Capitais compartilhadas são excluídas do sorteio do jogo 3 para evitar perguntas ambíguas.

| Modo | Pergunta | Resposta e avaliação |
| --- | --- | --- |
| 1 — Ache o país | Nome em português + bandeira | Clique no mapa; compara o ID ao destino |
| 2 — Qual é o país? | País destacado e aproximado | Texto; compara com `aliases` |
| 3 — Siga a capital | Apenas a capital, sem bandeira | Clique no país; compara o ID |
| 4 — Qual é a capital? | País destacado e aproximado | Texto; compara com `capitais_aceitas` |

`ANSWER` aceita uma única tentativa por pergunta. Um acerto vale **100 pontos**, até 1.500 por partida. O reducer e um bloqueio imediato impedem pontuação duplicada por cliques rápidos ou Enter repetido. `NEXT` só avança após uma resposta. A próxima pergunta é iniciada pelo jogador, para dar tempo de ler o feedback.

No modo normal, os países acertados permanecem verdes. No difícil, o feedback dura 1,1 segundo e a cor original retorna. Erros sempre piscam em vermelho. Nos modos de digitação, o país continua identificado pelo destaque amarelo após o feedback.

`normalizeAnswer` remove acentos, pontuação, espaços e diferenças de maiúsculas. Nomes em português e inglês são aceitos. Capitais com múltiplas respostas válidas têm aliases explícitos; por exemplo, a África do Sul aceita Pretória, Cidade do Cabo e Bloemfontein. As equivalências estão nos dados, sem aceitar aproximações arbitrárias que confundam países distintos.

Ao concluir a partida, a tela mostra pontuação, acertos, melhor sequência, revisão das respostas e opção de jogar novamente.

### Recordes

Chave do armazenamento: `geoquest.highscores.v1`. Cada registro usa a composição:

```text
modo:região:dificuldade
1:europa:normal → 1200
1:europa:dificil → 900
```

Os modos 2 e 4 usam somente a chave `normal`, porque não possuem toggle de dificuldade. Um resultado inferior não substitui o recorde. Dados inválidos são descartados; se o navegador bloquear o armazenamento, o jogo continua e informa que o recorde ficará apenas na sessão. A tabela **Recordes** mostra todas as combinações.

## Atualizar os dados

Edite traduções ou equivalências em `src/data/overrides.json` e execute:

```sh
pnpm update:data
pnpm test
pnpm build
```

Esse comando precisa de internet e atualiza `countries.json`, `world.json` e as bandeiras locais. A atualização é explícita; uma partida nunca depende de uma API externa. A base distribuída é um snapshot de 23/10/2026. Guiné Equatorial usa Ciudad de la Paz; a Indonésia mantém Jacarta no snapshot. Mudanças de capitais e status territoriais devem ser revisadas nas próximas atualizações.

## Validação

**12 testes aprovados**, cobrindo integridade dos 230 destinos e bandeiras, seis regiões, quatro modos completos, uma tentativa por pergunta, pontuação, persistência, corrupção/bloqueio de armazenamento, respostas equivalentes e geometria em tamanhos móveis e desktop. O build de produção foi gerado com sucesso.

A revisão visual automatizada ficou pendente: a política de segurança da ferramenta de navegador bloqueou a abertura da prévia local. Os testes de geometria não substituem uma revisão visual ou testes de gestos em dispositivos reais.

## Fontes e licenças

- [World Atlas](https://github.com/topojson/world-atlas): TopoJSON de [Natural Earth](https://www.naturalearthdata.com/), escala 1:50m. Geometria Natural Earth em domínio público; licença do World Atlas incluída em `public/licenses`.
- [Mledoze Countries](https://github.com/mledoze/countries): nomes, capitais e regiões. Banco adaptado disponibilizado sob **Open Database License 1.0 (ODbL)**, com texto em `public/licenses/countries-ODbL.txt` e dados em `src/data/countries.json`.
- [Flag Icons](https://github.com/lipis/flag-icons): SVGs sob MIT, licença incluída.
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) e [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk): SIL Open Font License; arquivos e licenças em `public/fonts`.
- [D3 Zoom](https://d3js.org/d3-zoom): documentação da implementação de pan/zoom.
- [Governo da África do Sul](https://www.gov.za/south-africa-glance): capitais múltiplas.
- [Autoridade de Nusantara, julho de 2026](https://ikn.go.id/id/posts/pembangunan-tahap-ii-ikn-terus-berjalan-otorita-ikn-lakukan-evaluasi-berkala): cronograma de transição da capital indonésia.

Os créditos também estão acessíveis no rodapé do site. As fronteiras são cartográficas e podem incluir áreas disputadas; o jogo não pretende definir soberania.
