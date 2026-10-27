import { useEffect, useReducer, useRef, useState } from 'react';
import { MODES, REGIONS, getPool, byId } from '../data/index.js';
import { createGame, gameReducer, POINTS, normalizeAnswer, scoreKey, feedbackDuration } from '../lib/game.js';
import WorldMap from './WorldMap.jsx';
import Modal from './Modal.jsx';
import { Icon, KiwiMark } from './Icon.jsx';
import KeepCorrectControl from './KeepCorrectControl.jsx';
import MapViewControl from './MapViewControl.jsx';
import GlobeMap from './GlobeMap.jsx';
import ThemeControl from './ThemeControl.jsx';

const noop = () => {};

export default function Game({ config, onExit, onFinish, onReplay, sound, highScores, onKeepCorrectChange, mapView = 'flat', onMapViewChange, initialGame, onCheckpoint = noop, storageAvailable = true, paused = false, theme = 'dark', onThemeChange = noop, soundEnabled = false, onSoundChange = noop, onStatistics = noop }) {
  const [game, dispatch] = useReducer(gameReducer, initialGame || config, value => value.queue ? value : createGame({ ...value, pool: getPool(value.region) }));
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState(null);
  const [showExit, setShowExit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef(null);
  const [reading, setReading] = useState(false);
  const [hidden, setHidden] = useState(false);
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

  useEffect(() => { onCheckpoint(game); }, [game, onCheckpoint]);
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync(); document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  useEffect(() => {
    if (game.finished && !savedRef.current) {
      savedRef.current = true;
      onFinish(game);
    }
  }, [game.finished, game, onFinish]);
  useEffect(() => {
    answerLock.current = false; setInput(''); setReading(false);
    if (mode.input && !game.finished) inputRef.current?.focus({ preventScroll: true });
  }, [game.index, game.finished, mode.input]);
  useEffect(() => {
    if (!result) return;
    setFlash({ id: mode.input ? target.id : result.value, correct: result.correct });
    sound(result.correct);
    return () => setFlash(null);
  }, [result]);

  useEffect(() => {
    if (!result || game.finished || reading || showExit || showSettings || paused || hidden) return;
    timerRef.current = setTimeout(() => { setFlash(null); dispatch({ type: 'NEXT' }); }, feedbackDuration(result));
    return () => clearTimeout(timerRef.current);
  }, [result, game.finished, reading, showExit, showSettings, paused, hidden]);

  function answer(value) {
    if (result || game.finished || answerLock.current) return;
    if (mode.input && !value.trim()) return;
    answerLock.current = true;
    dispatch({ type: 'ANSWER', value });
  }

  function skip() {
    if (!mode.input || result || game.finished || answerLock.current) return;
    answerLock.current = true;
    setInput('');
    dispatch({ type: 'SKIP' });
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

  return <main className={`game-screen play-screen accent-${mode.color}`}>
    <div className="game-map-area"><MapComponent region={game.region} target={target} typed={mode.input} showCapitalPin={mode.id === 4} keepCorrect={game.keepCorrect} solved={correctAnswers.map(answer => answer.country.id)} flash={flash} onCountryClick={answer} disabled={Boolean(result) || paused || showExit || showSettings} reveal={result ? { country: target, correct: result.correct, showCapital: game.mode >= 3 } : null} />
    </div>
    <div className="play-score-panel">
      <button className="play-exit" onClick={() => setShowExit(true)} aria-label="Guardar e sair" title="Guardar e sair"><Icon name="back" size={18} /><KiwiMark size={23} /><span className="sr-only">GUARDAR E SAIR</span></button>
      <div className="play-score"><span>PONTOS</span><strong>{game.score}</strong></div>
      <div className="play-round"><span>RONDA</span><strong>{game.index + 1}<small>/{game.queue.length}</small></strong></div>
    </div>
    <section className={`play-question ${mode.input ? 'has-input' : ''}`} aria-label="Pergunta atual">
      <span className="play-instruction">{mode.id === 1 ? 'ENCONTRA ESTE PAÍS' : mode.id === 2 ? 'ESCREVE O NOME DO PAÍS' : mode.id === 3 ? 'ENCONTRA O PAÍS DESTA CAPITAL' : 'ESCREVE A CAPITAL DESTE PAÍS'}</span>
      {mode.id === 1 || mode.id === 4 ? <h1><img src={target.bandeira_url} alt={`Bandeira de ${target.nome_pt}`} />{target.nome_pt}</h1> : mode.id === 3 ? <h1><Icon name="city" size={24} />{target.capital}</h1> : <h1>Que país é este?</h1>}
      {sharedCapital && <span className="play-capital-context">{REGIONS.find(r => r.id === target.continente)?.name}</span>}
      {mode.input && <div className="play-input-row"><form onSubmit={event => { event.preventDefault(); answer(input); }}><label className="sr-only" htmlFor="answer-input">{mode.id === 2 ? 'Nome do país' : 'Nome da capital'}</label><input id="answer-input" ref={inputRef} value={input} maxLength={200} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" placeholder={mode.id === 2 ? 'Nome do país…' : 'Nome da capital…'} onChange={event => setInput(event.target.value)} disabled={Boolean(result)} /><button aria-label="Confirmar resposta" disabled={Boolean(result) || !input.trim()} type="submit"><Icon name="enter" size={19} /></button></form><button className="play-skip" type="button" onClick={skip} disabled={Boolean(result)} title="Saltar e revelar a resposta" aria-label="Saltar pergunta e revelar a resposta">SALTAR</button></div>}
    </section>
    <div className="play-controls"><div className="play-controls-top"><MapViewControl compact value={mapView} onChange={onMapViewChange} /><button className="play-settings-button" aria-label="Opções de jogo" title="Opções de jogo" onClick={() => setShowSettings(true)}><Icon name="settings" size={18} /></button></div><KeepCorrectControl compact checked={game.keepCorrect} onChange={changeKeepCorrect} /></div>
    {!result && game.index === 0 && <p className="play-first-tip">{mode.id === 4 ? 'O pin marca a capital.' : mode.input ? 'Observa o território em destaque.' : 'Clica no mapa para responder.'}</p>}
    {!result && game.index > 0 && <div className={`play-previous ${game.answers[game.index - 1].correct ? 'is-correct' : 'is-wrong'}`}><Icon name={game.answers[game.index - 1].correct ? 'check' : 'close'} size={13} /><span>{game.answers[game.index - 1].country.nome_pt}{game.mode >= 3 ? ` · ${game.answers[game.index - 1].country.capital}` : ''}</span></div>}
    {result && <div className={`play-feedback ${result.correct ? 'is-correct' : 'is-wrong'}`} role="status"><Icon name={result.correct ? 'check' : 'close'} size={22} /><div><strong>{result.correct ? `+${POINTS} PONTOS` : result.skipped ? 'SALTADA · 0 PONTOS' : '0 PONTOS'}</strong><p>{game.mode >= 3 ? `${target.capital} · ${target.nome_pt}` : target.nome_pt}{!result.correct && !mode.input && byId[result.value] ? ` — escolheste ${byId[result.value].nome_pt}` : ''}</p></div><button aria-pressed={reading} aria-label={reading ? 'Continuar o jogo' : 'Pausar para ler a resposta'} onClick={() => setReading(value => !value)}><Icon name={reading ? 'play' : 'pause'} size={17} /><span>{reading ? 'CONTINUAR' : 'PAUSAR'}</span></button><div className="play-countdown" aria-label={reading ? 'Em pausa' : 'Próxima pergunta automática'}>{!reading && !paused && !showExit && !showSettings && !hidden && <i key={`${game.index}-${reading}`} style={{ animationDuration: `${feedbackDuration(result)}ms` }} />}</div><span className="sr-only">{reading ? 'EM PAUSA' : 'A PRÓXIMA PERGUNTA VEM JÁ'}</span></div>}
    {showSettings && <Modal title="Opções de jogo" onClose={() => setShowSettings(false)}><div className="play-settings-content"><p>Jogo {mode.id} · {mode.title} · {region.name}</p><div className="play-preferences"><ThemeControl value={theme} onChange={onThemeChange} /><button className="secondary-button" aria-pressed={soundEnabled} onClick={() => onSoundChange(!soundEnabled)}><Icon name={soundEnabled ? 'volume' : 'muted'} size={18} />{soundEnabled ? 'SOM LIGADO' : 'SOM DESLIGADO'}</button></div><p role="status">{storageAvailable ? 'PROGRESSO GUARDADO AUTOMATICAMENTE neste navegador.' : 'O navegador bloqueou a gravação. O progresso fica apenas nesta sessão.'}</p><div className="modal-actions"><button className="primary-button" onClick={() => setShowSettings(false)}>CONTINUAR A JOGAR</button><button className="secondary-button" onClick={onStatistics}>ESTATÍSTICAS <Icon name="chart" size={16} /></button></div></div></Modal>}
    {showExit && <Modal title="Fazer uma pausa?" onClose={() => setShowExit(false)}><p>O progresso fica guardado automaticamente neste navegador, incluindo a ordem dos países, os pontos e os acertos. Podes retomar esta partida no cartão do jogo e da região.</p><div className="modal-actions"><button className="primary-button" onClick={() => setShowExit(false)}>CONTINUAR JOGANDO</button><button className="secondary-button" onClick={() => { onCheckpoint(game); onExit(); }}>GUARDAR E VOLTAR AO MENU</button></div></Modal>}
  </main>;
}
