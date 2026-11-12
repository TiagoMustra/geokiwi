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

O perfil apresenta as seis insígnias e a progressão por sequência diária atual: 1–7, 8–14, 15–21, 22–28, 29–35 e 36+ dias. A imagem original é usada como sprite CSS, preservando os ficheiros de conceito.

Zero dias não atribui rank. As conclusões vêm de uma tabela protegida no Supabase; o navegador não pode criá-las. O desafio diário ainda não está disponível, por isso a progressão está preparada e os perfis continuam sem dias ganhos.
