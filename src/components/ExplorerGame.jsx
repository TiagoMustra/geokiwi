import { useEffect, useMemo, useState } from 'react';
import { countries } from '../data/index.js';
import { explorationPlaces } from '../data/exploration-places.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { advanceExplorerGame, answerExplorerGame, clearExplorerSave, createExplorerGame, normalizeExplorerGeometry, normalizeExplorerRounds, readExplorerRecord, readExplorerSave, restoreExplorerGame, saveExplorerRecord, skipExplorerGame, writeExplorerSave } from '../lib/explorer-game.js';
import { Icon, KiwiMark } from './Icon.jsx';
import WorldMap from './WorldMap.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import RestartButton from './RestartButton.jsx';
import LanguageControl from './LanguageControl.jsx';
import Modal from './Modal.jsx';
import '../explorer.css';

const TYPES = {
  city: ['CIDADE', 'CITY'], peak: ['PICO', 'PEAK'], historic: ['LOCAL HISTÓRICO', 'HISTORIC PLACE'],
  lake: ['LAGO', 'LAKE'], sea: ['MAR', 'SEA'], bay: ['BAÍA', 'BAY'], desert: ['DESERTO', 'DESERT'],
  mountain: ['CORDILHEIRA', 'MOUNTAIN RANGE'], river: ['RIO', 'RIVER'],
};
function answerCountry(place, result) {
  const position = result?.nearestCoordinates || place.coordinates;
  return { id: `explore-${place.id}`, nome_pt: place.name_pt, nome_en: place.name_en, coordenadas_centro: position, coordenadas_capital: position, capital: '' };
}
function revealedGeometry(place, result) {
  return place && result && place.geometry ? normalizeExplorerGeometry(place.geometry) : null;
}

export default function ExplorerGame({ rounds = 10, resume = false, onExit }) {
  const count = normalizeExplorerRounds(rounds);
  const { locale } = useLocale();
  const en = locale === 'en';
  const say = (pt, english) => en ? english : pt;
  const [game, setGame] = useState(() => (resume && restoreExplorerGame(readExplorerSave(count), explorationPlaces, count)) || createExplorerGame({ places: explorationPlaces, rounds: count }));
  const [confirm, setConfirm] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reading, setReading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [reviewId, setReviewId] = useState(null);
  const [startingRecord, setStartingRecord] = useState(() => readExplorerRecord(count));
  const lookup = useMemo(() => Object.fromEntries(explorationPlaces.map(place => [place.id, place])), []);
  const target = lookup[game.queue[game.index]];
  const result = game.answers[game.index];
  const mistakes = game.answers.filter(answer => !answer.correct);
  const correctCount = game.answers.length - mistakes.length;
  const duration = result?.correct ? 2400 : 4800;

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (game.finished) {
      clearExplorerSave(count);
      if (!game.practice) saveExplorerRecord(count, game.score);
    } else setStorageAvailable(writeExplorerSave(game));
  }, [game, count]);
  useEffect(() => {
    if (!result || game.finished || confirm || paused || reading || !visible) return;
    const timer = window.setTimeout(() => setGame(current => advanceExplorerGame(current)), duration);
    return () => window.clearTimeout(timer);
  }, [result, game.finished, confirm, paused, reading, visible, duration]);
  useEffect(() => { setReading(false); }, [game.index]);

  const restart = ids => {
    setStartingRecord(readExplorerRecord(count));
    setGame(createExplorerGame({ places: explorationPlaces, rounds: count, ids: ids || null, practice: Boolean(ids) }));
    setPaused(false); setReading(false); setReviewId(null); setConfirm(false);
  };
  const distanceLabel = answer => answer.skipped ? say('Saltaste esta ronda', 'You skipped this round')
    : answer.inside ? say('Dentro da área certa', 'Inside the correct area')
    : answer.rawDistance <= answer.toleranceKm && answer.toleranceKm > 0 ? say(`Até ${answer.toleranceKm} km do local`, `Within ${answer.toleranceKm} km of the place`)
    : `${Math.round(answer.rawDistance).toLocaleString(en ? 'en-GB' : 'pt-PT')} km`;

  const reviewAnswer = game.finished ? game.answers.find(answer => answer.id === reviewId) || mistakes[0] || game.answers[0] : null;
  const shownAnswer = game.finished ? reviewAnswer : result;
  const shownPlace = game.finished ? lookup[shownAnswer?.id] || target : target;
  const overlay = useMemo(() => revealedGeometry(shownPlace, shownAnswer), [shownPlace, shownAnswer]);
  if (!target) return <main className="results-page clean-results"><div className="results-shell"><h1>{say('Não foi possível preparar os lugares.', 'The places could not be prepared.')}</h1><button className="primary-button" onClick={onExit}>{say('Voltar ao menu', 'Back to menu')}</button></div></main>;
  const map = <WorldMap region="mundo" queue={countries} keepCorrect={false} solved={[]}
    disabled={Boolean(result) || game.finished || confirm || paused}
    onPointClick={(guess, countryId) => setGame(current => answerExplorerGame(current, guess, countryId, explorationPlaces))}
    guessPoint={shownAnswer?.guess || null}
    geographicFeature={overlay}
    geographicFeatureStatus={shownAnswer?.correct ? 'correct' : game.finished ? 'wrong' : 'reveal'}
    focusReveal={true}
    reveal={shownAnswer ? { country: answerCountry(shownPlace, shownAnswer), correct: shownAnswer.correct } : null} />;

  if (game.finished) return <ResultsScreen title={say('Explora o mundo', 'Explore the world')} context={`${game.queue.length} ${say('rondas', 'rounds')} · ${say('máximo', 'maximum')} ${game.queue.length * 100}`} score={game.score} correct={correctCount} total={game.queue.length} mistakes={mistakes.length} newRecord={!game.practice && game.score > startingRecord} onRetry={() => restart(mistakes.map(answer => answer.id))} onReplay={() => restart()} onExit={onExit} map={map} mapNote={say('Seleciona uma ronda para rever o local e o teu pin.', 'Select a round to review the place and your pin.')}>
    <section className="explorer-review" aria-label={say('Rever os lugares', 'Review places')}><h2>{say('Os teus lugares', 'Your places')}</h2><div className="explorer-review-list">{game.answers.map((answer, index) => {
      const place = lookup[answer.id];
      return <button key={answer.id} type="button" className={`${answer.correct ? 'is-correct' : 'is-wrong'} ${shownAnswer?.id === answer.id ? 'is-selected' : ''}`} aria-pressed={shownAnswer?.id === answer.id} onClick={() => setReviewId(answer.id)}><span>{index + 1}. {en ? place.name_en : place.name_pt}</span><small>{distanceLabel(answer)}</small><strong>{answer.points}/100</strong></button>;
    })}</div></section>
  </ResultsScreen>;

  return <main className="game-screen play-screen explorer-play accent-cyan">
    <div className="game-map-area">{map}</div>
    <div className="play-score-panel"><button className="play-exit" aria-label={say('Guardar e sair', 'Save and exit')} onClick={onExit}><Icon name="back" size={18} /><KiwiMark size={23} /></button><div className="play-score"><span>{say('PONTOS', 'POINTS')}</span><strong>{game.score}</strong></div><div className="play-round"><span>{say('RONDA', 'ROUND')}</span><strong>{game.index + 1}<small>/{game.queue.length}</small></strong></div></div>
    <section className="play-question explorer-question"><span className="play-instruction">{say('APROXIMA O PIN', 'PLACE YOUR PIN')} · {(TYPES[target.type] || ['LUGAR', 'PLACE'])[en ? 1 : 0]}</span><h1>{en ? target.name_en : target.name_pt}</h1></section>
    <div className="play-controls explorer-controls"><RestartButton onClick={() => setConfirm(true)} /><div className="explorer-control-row"><LanguageControl /><button type="button" className="explorer-pause" aria-pressed={paused} onClick={() => { setPaused(value => !value); setReading(false); }}><Icon name={paused ? 'play' : 'pause'} size={12} />{paused ? say('Continuar', 'Continue') : say('Pausar', 'Pause')}</button></div><button type="button" className="explorer-skip" disabled={Boolean(result) || paused} onClick={() => setGame(current => skipExplorerGame(current, explorationPlaces))}>{say('Saltar', 'Skip')} <Icon name="arrow" size={12} /></button><p>{say('Até 100 pontos por ronda. Mais perto, mais pontos.', 'Up to 100 points per round. Closer earns more.')}</p>{!storageAvailable && <small>{say('Progresso disponível só nesta sessão.', 'Progress is only available in this session.')}</small>}</div>
    {!result && paused && <div className="explorer-paused" role="status"><Icon name="pause" size={18}/>{say('Jogo em pausa', 'Game paused')}<button type="button" onClick={() => setPaused(false)}>{say('Continuar', 'Continue')}</button></div>}
    {result && <div className={`play-feedback explorer-feedback ${result.correct ? 'is-correct' : 'is-wrong'}`} role="status" onPointerEnter={event => { if (event.pointerType === 'mouse') setReading(true); }} onPointerLeave={() => setReading(false)} onFocusCapture={() => setReading(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setReading(false); }}>
      <div className="explorer-feedback-copy"><span className="capital-points-pop" aria-hidden="true" key={game.index}>+{result.points}</span><strong>+{result.points} {say('PONTOS', 'POINTS')} · {distanceLabel(result)}</strong><p>{en ? target.description_en : target.description_pt}</p>{result.restricted && !result.inCountry && !result.skipped && <small>{say('Fora do país certo: máximo de 25 pontos.', 'Outside the correct country: maximum 25 points.')}</small>}<a href={target.source.url} target="_blank" rel="noopener noreferrer">{say('Fonte', 'Source')}: {target.source.title} <Icon name="northeast" size={9}/></a><span className="explorer-auto">{paused || reading ? say('Pausa para ler', 'Paused for reading') : say('Próxima ronda automática', 'Next round automatically')}</span></div>
      <button type="button" className="explorer-feedback-pause" aria-label={paused ? say('Continuar automaticamente', 'Resume automatic play') : say('Pausar para ler', 'Pause to read')} aria-pressed={paused} onClick={() => { setPaused(value => !value); setReading(false); }}><Icon name={paused ? 'play' : 'pause'} size={14}/></button>
    </div>}
    {confirm && <Modal title={say('Reiniciar esta partida?', 'Restart this run?')} onClose={() => setConfirm(false)}><p>{say('O progresso desta partida será substituído.', 'This run’s progress will be replaced.')}</p><div className="modal-actions"><button className="primary-button" onClick={() => setConfirm(false)}>{say('Continuar', 'Continue')}</button><button className="secondary-button" onClick={() => restart(game.practice ? game.queue : null)}>{say('Reiniciar', 'Restart')}</button></div></Modal>}
  </main>;
}
