export const DAILY_RANKS = [
  { id: 'peduncle', minDays: 1, pt: 'Pedúnculo', en: 'Stalk' },
  { id: 'leafy-peduncle', minDays: 8, pt: 'Pedúnculo com folha', en: 'Leafy Stalk' },
  { id: 'green', minDays: 15, pt: 'Kiwi Verde', en: 'Green Kiwi' },
  { id: 'ripe', minDays: 22, pt: 'Kiwi Maduro', en: 'Ripe Kiwi' },
  { id: 'yellow', minDays: 29, pt: 'Kiwi Amarelo', en: 'Yellow Kiwi' },
  { id: 'golden', minDays: 36, pt: 'Kiwi Dourado', en: 'Golden Kiwi' },
];

export function dailyRankProgress(days) {
  const streak = Number.isSafeInteger(days) && days > 0 ? days : 0;
  const index = DAILY_RANKS.findLastIndex(rank => streak >= rank.minDays);
  const rank = DAILY_RANKS[index] || null;
  const next = DAILY_RANKS[index + 1] || null;
  const progress = next ? (streak - (rank?.minDays || 0)) / (next.minDays - (rank?.minDays || 0)) : 1;
  return { streak, rank, index, next, remaining: next ? next.minDays - streak : 0, progress };
}
