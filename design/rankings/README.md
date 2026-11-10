# GeoKiwi — insígnias de ranking

A direção escolhida é **A · Maturação**, com kiwi-fruta em pixel art.

## Hierarquia escolhida

1. Semente
2. Rebento
3. Kiwi Verde
4. Kiwi Maduro
5. Kiwi Amarelo — estrela
6. Kiwi Dourado — coroa e louros

## Arquivos

- `kiwi-rank-concepts-v1.png`: prancha inicial com três possibilidades de hierarquia.
- `kiwi-maturation-badges-v1.png`: faixa reutilizável da direção escolhida, PNG RGBA transparente de 2172 × 724 px, seis insígnias sem texto.

A faixa contém seis células iguais de 362 × 724 px, da esquerda para a direita, com origem em x = 0, 362, 724, 1086, 1448 e 1810. Essas células podem ser recortadas individualmente durante a implementação; preservar a transparência e usar redimensionamento por vizinho mais próximo para manter os pixels. A arte tem margem transparente em cada célula.

## Estado da implementação

Esta entrega define apenas a hierarquia visual e seus recursos gráficos. Nenhum ranking foi ativado no jogo. Não foram definidos pontos, experiência, limites entre níveis ou critérios de progressão. A aplicação não foi alterada por esta tarefa.

## Geração

Arte gerada com a ferramenta nativa imagegen, por edição da referência aprovada. Instrução: extrair e preservar a linha A de maturação, manter os seis emblemas de kiwi-fruta em pixel art, remover texto e fundo, produzir uma faixa PNG com transparência real e seis células igualmente espaçadas. O ajuste final manteve os desenhos e corrigiu margem e espaçamento.
