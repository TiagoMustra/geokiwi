import { useEffect, useReducer, useRef, useState } from 'react';
import { MODES, REGIONS, getPool, byId } from '../data/index.js';
import { createGame, gameReducer, POINTS, normalizeAnswer, scoreKey } from '../lib/game.js';
import WorldMap from './WorldMap.jsx';
import Modal from './Modal.jsx';
import { Icon } from './Icon.jsx';
import KeepCorrectControl from './KeepCorrectControl.jsx';
import MapViewControl from './MapViewControl.jsx';
import GlobeMap from './GlobeMap.jsx';

export default function Game({ config, onExit, onFinish, onReplay, sound, highScores, onKeepCorrectChange, mapView = 'flat', onMapViewChange }) {
  const [game, dispatch] = useReducer(gameReducer, config, value => createGame({ ...value, pool: getPool(value.region) }));
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState(null);
  const [showExit, setShowExit] = useState(false);
  const inputRef = useRef(null);
  const nextRef = useRef(null);
  const savedRef = useRef(false);
  const timerRef = useRef(null);
  const answerLock = useRef(false);
  const initialScores = useRef(highScores);
  const mode = MODES.find(mode => mode.id === game.mode);
  const MapComponent = mapView === 'globe' ? GlobeMap : WorldMap;
  const region = REGIONS.find(region => region.id === game.region);
  const target = game.queue[game.index];
  const result = game.answers[game.index];
  const correctAnswers = game.answers.filter(answer => answer.correct);
  const sharedCapital = game.mode === 3 && game.queue.some(country => country.id !== target.id && normalizeAnswer(country.capital) === normalizeAnswer(target.capital));

  function changeKeepCorrect(value) {
    dispatch({ type: 'SET_KEEP_CORRECT', value });
    onKeepCorrectChange(value);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);
  useEffect(() => {
    if (game.finished && !savedRef.current) {
      savedRef.current = true;
      onFinish(game);
    }
  }, [game.finished, game, onFinish]);
  useEffect(() => {
    if (mode.input && !game.finished) inputRef.current?.focus({ preventScroll: true });
  }, [game.index, game.finished, mode.input]);
  useEffect(() => {
    if (!result) return;
    setFlash({ id: mode.input ? target.id : result.value, correct: result.correct });
    sound(result.correct);
    timerRef.current = setTimeout(() => setFlash(null), 1100);
    nextRef.current?.focus({ preventScroll: true });
  }, [result]);

  function answer(value) {
    if (result || game.finished || answerLock.current) return;
    if (mode.input && !value.trim()) return;
    answerLock.current = true;
    dispatch({ type: 'ANSWER', value });
  }

  function next() {
    clearTimeout(timerRef.current);
    setFlash(null);
    setInput('');
    answerLock.current = false;
    dispatch({ type: 'NEXT' });
  }

  if (game.finished) {
    const isNewRecord = game.score > (initialScores.current[scoreKey(game.mode, game.region, game.difficulty)] || 0);
    return <main className={`results-page accent-${mode.color}`}>
      <div className="results-spark">✦ + ✦</div>
      <div className="results-trophy"><Icon name="trophy" size={48} /></div>
      <div className="eyebrow">{isNewRecord ? 'NOVO RECORDE DESBLOQUEADO!' : 'MISSÃO CONCLUÍDA'}</div>
      <h1>{game.score === game.queue.length * POINTS ? 'O mundo é seu!' : game.score >= game.queue.length * POINTS / 2 ? 'Bela exploração!' : 'Cada partida, uma descoberta.'}</h1>
      <p>{mode.title} <span> / </span> {region.name} <span> / </span> {game.difficulty === 'dificil' ? 'Sem acertos visíveis' : 'Com ajuda visual'}</p>
      <div className="results-stats"><div><span>PONTUAÇÃO FINAL</span><strong>{String(game.score).padStart(4, '0')}</strong></div><div><span>ACERTOS</span><strong>{correctAnswers.length}<small>/{game.queue.length}</small></strong></div><div><span>MELHOR SEQUÊNCIA</span><strong>{game.bestStreak}<small>✦</small></strong></div></div>
      <div className="results-actions"><button className="primary-button" onClick={onReplay}><Icon name="reset" size={17} /> JOGAR DE NOVO</button><button className="secondary-button" onClick={onExit}>VOLTAR AO MENU <Icon name="arrow" size={17} /></button></div>
      <details className="answer-review"><summary>REVISAR AS {game.queue.length} RESPOSTAS <span>+</span></summary><div>{game.answers.map((answer, i) => <div className="review-row" key={answer.country.id}><span>{String(i + 1).padStart(2, '0')}</span><Icon name={answer.correct ? 'check' : 'close'} size={16} /><span>{answer.country.nome_pt}</span><strong>{answer.country.capital}</strong></div>)}</div></details>
    </main>;
  }

  return <main className={`game-screen accent-${mode.color}`}>
    <div className="game-meta"><button onClick={() => setShowExit(true)}><Icon name="back" size={15} /> MENU</button><span>JOGO 0{mode.id} <b>/</b> {mode.title.toUpperCase()} <b>/</b> {region.name.toUpperCase()}</span><span className="difficulty-badge">{game.queue.length} DESTINOS · ORDEM ALEATÓRIA</span></div>
    <div className="question-bar">
      <div className="question-heading"><span className="question-eyebrow">{mode.id === 1 ? 'ENCONTRE ESTE PAÍS' : mode.id === 2 ? 'QUAL É O PAÍS EM DESTAQUE?' : mode.id === 3 ? 'A QUAL PAÍS PERTENCE ESTA CAPITAL?' : `QUAL É A CAPITAL DE ${target.nome_pt.toUpperCase()}?`}</span>
        {mode.id === 1 ? <h1><img src={target.bandeira_url} alt={`Bandeira de ${target.nome_pt}`} />{target.nome_pt}</h1> : mode.id === 3 ? <><h1><Icon name="city" size={30} />{target.capital}</h1>{sharedCapital && <span className="capital-context">REGIÃO: {REGIONS.find(r => r.id === target.continente)?.name.toUpperCase()}</span>}</> : <form onSubmit={event => { event.preventDefault(); answer(input); }}><label className="sr-only" htmlFor="answer-input">{mode.id === 2 ? 'Nome do país' : 'Nome da capital'}</label><input id="answer-input" ref={inputRef} value={input} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" placeholder={mode.id === 2 ? 'Digite o nome do país…' : 'Digite o nome da capital…'} onChange={event => setInput(event.target.value)} disabled={Boolean(result)} /><button aria-label="Confirmar resposta" disabled={Boolean(result) || !input.trim()} type="submit"><Icon name="enter" /></button></form>}
      </div>
      <div className="question-stat"><span>PONTOS</span><strong>{String(game.score).padStart(4, '0')}</strong></div>
      <div className="question-stat progress-stat"><span>PROGRESSO</span><strong>{String(game.answers.length).padStart(2, '0')}<small>/{game.queue.length}</small></strong><div className="progress-track"><i style={{ width: `${game.answers.length / game.queue.length * 100}%` }} /></div></div>
    </div>
    <div className="game-options-bar"><span><Icon name={mode.id === 4 ? 'pin' : 'globe'} size={15} />{mode.id === 4 ? 'O pin marca a capital. Qual é o nome?' : 'Percorra todos os países da região.'}</span><div className="game-options-actions"><MapViewControl value={mapView} onChange={onMapViewChange} /><KeepCorrectControl checked={game.keepCorrect} onChange={changeKeepCorrect} /></div></div>
    <div className="game-map-area"><MapComponent region={game.region} target={target} typed={mode.input} showCapitalPin={mode.id === 4} keepCorrect={game.keepCorrect} solved={correctAnswers.map(answer => answer.country.id)} flash={flash} onCountryClick={answer} disabled={Boolean(result)} round={game.index} />
      {!result && <div className="map-prompt"><Icon name={mode.id === 4 ? 'pin' : mode.input ? 'keyboard' : 'pin'} size={16} />{mode.id === 4 ? 'Observe o pin da capital e digite o nome acima.' : mode.input ? 'Observe o território em destaque e digite sua resposta acima.' : 'Faça sua escolha: clique no país correto.'}</div>}
      {result && <div className={`feedback-bar ${result.correct ? 'is-correct' : 'is-wrong'}`} role="status"><div className="feedback-icon"><Icon name={result.correct ? 'check' : 'close'} size={24} /></div><div><strong>{result.correct ? `NA MOSCA! +${POINTS} PONTOS` : 'QUASE! CONTINUE EXPLORANDO.'}</strong><p>{mode.id === 3 || mode.id === 4 ? `${target.capital} é a capital de ${target.nome_pt}.` : `Resposta: ${target.nome_pt}.`}{!result.correct && !mode.input && byId[result.value] ? ` Você escolheu ${byId[result.value].nome_pt}.` : ''}</p></div><button ref={nextRef} onClick={next}>{game.index + 1 === game.queue.length ? 'VER RESULTADO' : 'PRÓXIMO'}<Icon name="arrow" size={18} /></button></div>}
    </div>
    {showExit && <Modal title="Fazer uma pausa?" onClose={() => setShowExit(false)}><p>Esta partida ainda não terminou. Ao voltar ao menu, o progresso atual será perdido. Seus recordes anteriores ficam salvos.</p><div className="modal-actions"><button className="primary-button" onClick={() => setShowExit(false)}>CONTINUAR JOGANDO</button><button className="secondary-button" onClick={onExit}>VOLTAR AO MENU</button></div></Modal>}
  </main>;
}
