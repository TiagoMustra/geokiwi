/** Each game belongs to exactly one main category. */
export const GAME_CATEGORIES = [
  { id: 'paises', name: 'Países', icon: 'globe', description: 'Encontra ou escreve o país', games: [1, 2], color: 'lime' },
  { id: 'capitais', name: 'Capitais', icon: 'city', description: 'Encontra, escreve ou aproxima', games: [3, 4, 6], color: 'orange' },
  { id: 'regionais', name: 'Outros modos', icon: 'map', description: 'Mapas, estádios e lugares', games: [5, 7, 8, 10], color: 'cyan' },
  { id: 'desafios', name: 'Desafios', icon: 'book', description: 'Conhecimento geral', games: [9], color: 'purple' },
];
export const categoryHasGame = (category, gameId) => Boolean(category?.games.includes(gameId));
