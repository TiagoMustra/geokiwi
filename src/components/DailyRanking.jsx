import { Icon } from './Icon.jsx';
import { useLocale } from '../i18n/LocaleContext.jsx';
import '../daily-ranking.css';

export default function DailyRanking({ onPlay }) {
  const { locale } = useLocale();
  const en = locale === 'en';
  return <main className="daily-ranking-page accent-lime" aria-labelledby="daily-ranking-title">
    <header className="daily-ranking-heading">
      <div>
        <span className="daily-ranking-kicker">GEOKIWI · DAILY</span>
        <h1 id="daily-ranking-title">{en ? 'Daily Ranking' : 'Ranking diário'}</h1>
      </div>
      <span className="daily-ranking-status">{en ? 'COMING SOON' : 'EM BREVE'}</span>
    </header>
    <section className="daily-ranking-board" aria-label={en ? 'Daily leaderboard' : 'Classificação diária'}>
      <div className="daily-ranking-columns" aria-hidden="true">
        <span>#</span><span>{en ? 'PLAYER' : 'JOGADOR'}</span><span>{en ? 'POINTS' : 'PONTOS'}</span>
      </div>
      <div className="daily-ranking-empty">
        <div className="daily-ranking-emblem" aria-hidden="true"><Icon name="trophy" size={48} /></div>
        <h2>{en ? 'A new challenge is on its way.' : 'Vem aí um novo desafio.'}</h2>
        <p>{en ? 'The daily leaderboard will appear here when the challenge launches.' : 'A classificação diária vai aparecer aqui quando o desafio ficar disponível.'}</p>
        <button className="primary-button" type="button" onClick={onPlay}>{en ? 'EXPLORE THE GAMES' : 'EXPLORAR OS JOGOS'}<Icon name="arrow" size={16} /></button>
      </div>
    </section>
  </main>;
}
