/** Each game belongs to exactly one main category. */
export const GAME_CATEGORIES = [
  { id: 'paises', name: 'Países', icon: 'globe', description: 'Encontra ou escreve o país', games: [1, 2], color: 'lime' },
  { id: 'capitais', name: 'Capitais', icon: 'city', description: 'Encontra, escreve ou aproxima', games: [3, 4, 6], color: 'purple' },
  { id: 'regionais', name: 'Outros modos', icon: 'map', description: 'Concelhos e estados', games: [5, 7], color: 'cyan' },
];
export const categoryHasGame = (category, gameId) => Boolean(category?.games.includes(gameId));
