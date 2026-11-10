# GeoKiwi — insígnias de ranking

A direção escolhida é **A · Maturação**, com kiwi-fruta em pixel art.

## Hierarquia escolhida

1. Pedúnculo — pé castanho do fruto
2. Pedúnculo com folha — o mesmo pé com uma pequena folha verde
3. Kiwi Verde
4. Kiwi Maduro
5. Kiwi Amarelo — estrela
6. Kiwi Dourado — coroa e louros

## Arquivos

- `kiwi-rank-concepts-v1.png`: prancha inicial com três possibilidades de hierarquia.
- `kiwi-maturation-badges-v1.png`: referência anterior, com semente e rebento, arquivada.
- `kiwi-maturation-badges-v2.png`: versão atual, com pedúnculo e pedúnculo com folha nos primeiros dois níveis; seis insígnias sem texto.

A faixa atual mede 2172 × 724 px e contém seis células de 362 × 724 px, da esquerda para a direita. Essas células podem ser recortadas individualmente durante a implementação; preservar a transparência e usar redimensionamento por vizinho mais próximo para manter os pixels. A arte tem margem transparente em cada célula.

## Estado da implementação

Esta entrega define apenas a hierarquia visual e seus recursos gráficos. Nenhum ranking foi ativado no jogo. Não foram definidos pontos, experiência, limites entre níveis ou critérios de progressão. A aplicação não foi alterada por esta tarefa.

## Geração

Arte gerada com a ferramenta nativa imagegen, por edição da referência aprovada. Instrução: extrair e preservar a linha A de maturação, manter os seis emblemas de kiwi-fruta em pixel art, remover texto e fundo, produzir uma faixa PNG com transparência real e seis células igualmente espaçadas. O ajuste final manteve os desenhos e corrigiu margem e espaçamento.

Revisão v2: substituição dos dois primeiros motivos por um pedúnculo castanho e um pedúnculo com folha, sem semente, raízes ou solo. Os quatro níveis de kiwi mantêm a direção visual aprovada.
