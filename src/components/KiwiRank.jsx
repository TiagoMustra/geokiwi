import { DAILY_RANKS, dailyRankProgress } from '../lib/daily-ranks.js';
import { useLocale } from '../i18n/LocaleContext.jsx';

export function RankBadge({ rank, size = 56 }) {
  const index = DAILY_RANKS.findIndex(item => item.id === rank?.id);
  if (index < 0) return null;
  return <span className="kiwi-rank-badge" aria-hidden="true" style={{ width: size, height: size, backgroundPosition: `${index * 20}% 50%` }} />;
}

export default function KiwiRank({ daily, loading = false }) {
  const { locale } = useLocale(), en = locale === 'en';
  const { rank, streak, next, remaining, progress, index } = dailyRankProgress(daily?.current_streak);
  const name = item => item?.[en ? 'en' : 'pt'];
  return <section className="profile-rank" aria-labelledby="profile-rank-title">
    <div className="profile-section-heading"><h3 id="profile-rank-title">{en ? 'Daily streak' : 'Sequência diária'}</h3><span>{en ? 'COMING SOON' : 'EM BREVE'}</span></div>
    <div className="profile-rank-current">
      {rank && <RankBadge rank={rank} size={64} />}
      <div><strong>{daily ? `${streak} ${en ? streak === 1 ? 'day' : 'days' : streak === 1 ? 'dia' : 'dias'}` : '—'}</strong><small>{rank ? name(rank) : en ? 'No rank yet' : 'Ainda sem rank'}</small></div>
      <span className="profile-best-streak">{en ? 'BEST' : 'MELHOR'}<b>{daily?.best_streak ?? '—'}</b></span>
    </div>
    {daily && <><div className="profile-rank-track" role="progressbar" aria-label={en ? 'Progress to the next rank' : 'Progresso para o próximo rank'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress * 100)}><span style={{ width: `${progress * 100}%` }} /></div><p className="profile-next-rank">{next ? en ? `${remaining} more ${remaining === 1 ? 'day' : 'days'} to ${name(next)}` : `Faltam ${remaining} ${remaining === 1 ? 'dia' : 'dias'} para ${name(next)}` : en ? 'Highest rank reached' : 'Rank máximo alcançado'}</p></>}
    <details className="profile-rank-ladder"><summary>{en ? 'See all ranks' : 'Ver todos os ranks'}<span aria-hidden="true">+</span></summary><div className="profile-rank-grid">{DAILY_RANKS.map((item, i) => <div key={item.id} className={i === index ? 'is-current' : ''}><RankBadge rank={item} size={64} /><strong>{name(item)}</strong><small>{i === DAILY_RANKS.length - 1 ? '36+' : `${item.minDays}–${DAILY_RANKS[i + 1].minDays - 1}`} {en ? 'days' : 'dias'}</small></div>)}</div></details>
    <p className="profile-rank-note">{loading ? en ? 'Loading your streak…' : 'A carregar a sequência…' : !daily ? en ? 'Could not load your streak. Try reopening your profile.' : 'Não foi possível carregar a sequência. Tenta abrir o perfil novamente.' : en ? 'Complete the daily challenge on consecutive days to grow your kiwi. Streaks will start when the daily challenge launches. Days reset at 00:00 UTC.' : 'Conclui o desafio diário em dias consecutivos para evoluir o teu kiwi. As sequências começam quando o daily ficar disponível. Cada dia começa às 00:00 UTC.'}</p>
  </section>;
}
