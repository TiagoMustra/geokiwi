import { useLocale } from '../i18n/LocaleContext.jsx';
import { Icon } from './Icon.jsx';

/** Results and next steps use the same layout in all seven games. */
export default function ResultsScreen({ title, context, score, correct, total, mistakes, onRetry, onReplay, onExit, map, mapNote = 'Vermelho: erros · Verde: acertos', newRecord = false, children, allowReview = true, prominentScore = false }) {
  const {locale}=useLocale();
  return <main className={`results-page clean-results accent-lime ${prominentScore?'results-score-prominent':''}`}><div className="results-shell">
    <header className="results-heading"><p>{newRecord ? 'NOVO RECORDE' : 'PARTIDA CONCLUÍDA'}</p><h1>{title}</h1>{context && <span>{context}</span>}</header>
    <div className="results-metrics" aria-label="Resultado da partida"><div><strong>{score.toLocaleString(locale==='en'?'en-GB':'pt-PT')}</strong><span>Pontos</span></div><div><strong>{correct}<small>/{total}</small></strong><span>Acertos</span></div><div><strong>{allowReview?mistakes:Math.round(score/Math.max(1,total))}{!allowReview&&<small>/100</small>}</strong><span>{allowReview?'A rever':locale==='en'?'Average per round':'Média por ronda'}</span></div></div>
    <nav className="results-next" aria-label="O que queres fazer a seguir?">
      {allowReview && mistakes > 0 && onRetry && <button type="button" className="result-action result-action-primary" onClick={onRetry}><Icon name="reset" size={20}/><span><strong>Praticar os erros</strong><small>Repetir só os {mistakes} que falhaste</small></span></button>}
      <button type="button" className="result-action" onClick={onReplay}><Icon name="play" size={20}/><span><strong>Jogar de novo</strong><small>Repetir esta seleção do início</small></span></button>
      <button type="button" className="result-action result-action-menu" onClick={onExit}><Icon name="back" size={20}/><span><strong>Voltar ao menu</strong><small>Escolher outro jogo</small></span></button>
    </nav>
    {allowReview && map && <section className="result-review" aria-label="Rever o mapa"><div className="result-review-heading"><h2>O teu mapa</h2><p>{mapNote}</p></div><div className="result-review-map">{map}</div></section>}
    {allowReview && children}
  </div></main>;
}
