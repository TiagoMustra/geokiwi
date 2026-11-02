import { useEffect, useMemo, useState } from 'react';
import municipalities from '../data/municipios-index.json';
import { districts as districtNames } from '../data/districts.js';
import { features, getPool } from '../data/index.js';
import { makeQueue, feedbackDuration } from '../lib/game.js';
import { capitalDistance, scoreCapitalGuess, migrateCapitalGame, readExtra, writeExtra, removeExtra, saveExtraRecord, extraScope, extraQueueIds } from '../lib/extra-game.js';
import { Icon, KiwiMark } from './Icon.jsx';
import KeepCorrectControl from './KeepCorrectControl.jsx';
import Modal from './Modal.jsx';
import SubdivisionMap from './SubdivisionMap.jsx';
import WorldMap from './WorldMap.jsx';
import RestartButton from './RestartButton.jsx';
import ResultsScreen from './ResultsScreen.jsx';

const titles = { municipios: 'Concelhos de Portugal', estados: 'Estados dos EUA', capitais: 'Aproximação de capitais' };
const initial = (ids, keepCorrect, practice = false) => ({ queue: makeQueue(ids, 1), answers: [], index: 0, score: 0, keepCorrect, usedMapHints: keepCorrect, practice, scoringVersion: 2, finished: false });
function validSaved(saved, ids) {
  if (!saved || !Array.isArray(saved.queue) || !saved.queue.length || !Array.isArray(saved.answers) || !Number.isInteger(saved.index) || saved.index < 0 || saved.index >= saved.queue.length || ![saved.index,saved.index+1].includes(saved.answers.length)) return false;
  return new Set(saved.queue).size === saved.queue.length && saved.queue.every(id => ids.includes(id)) && (saved.practice || saved.queue.length === ids.length);
}
export default function ExtraGame({ config, onExit, keepCorrectInitial = true }) {
  const { kind, region = 'mundo', includeTerritories = false, resume = false, municipalityId = null } = config;
  const [data, setData] = useState(null), [game, setGame] = useState(null), [error, setError] = useState('');
  const [districts, setDistricts] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const isCapital = kind === 'capitais';
  const saveRegion = extraScope(kind, region, includeTerritories, municipalityId);
  useEffect(() => {
    let active = true;
    const json = url => fetch(url).then(r => { if (!r.ok) throw Error('mapa indisponível'); return r.json(); });
    const load = isCapital ? Promise.resolve([getPool(region, includeTerritories), null]) : Promise.all([json(`/maps/${kind}.json`).then(x => x.features), kind === 'municipios' ? json('/maps/distritos.json') : Promise.resolve(null)]);
    load.then(([items, districtLines]) => {
      if (!active) return;
      const ids = extraQueueIds(kind, items, municipalityId);
      if (!ids.length) { setError('Não foi possível encontrar o distrito selecionado.'); return; }
      let saved = resume && readExtra(kind, saveRegion);
      if (isCapital && saved && saved.scoringVersion !== 2 && validSaved(saved, ids)) {
        saved = migrateCapitalGame(saved, items, features);
      }
      setDistricts(districtLines); setData(items); setGame(validSaved(saved, ids) ? saved : initial(ids, keepCorrectInitial));
    }).catch(() => { if (active) setError('Não foi possível carregar o mapa. Verifica a ligação e tenta novamente.'); });
    return () => { active = false; };
  }, [kind, region, includeTerritories, resume, municipalityId]);
  useEffect(() => { if (!game) return; if (game.finished) { removeExtra(kind,saveRegion); if (!game.practice) saveExtraRecord(kind, isCapital ? `${saveRegion}:sem-verde:v2` : `${saveRegion}:${game.usedMapHints ? 'normal' : 'dificil'}`, game.score); } else writeExtra(kind, saveRegion, game); }, [game,kind,saveRegion]);
  const lookup = useMemo(() => Object.fromEntries((data || []).map(x => [String(x.id),x])),[data]);
  const target = game && lookup[game.queue[game.index]];
  const result = game?.answers[game.index];
  const targetName = kind === 'municipios' && target ? municipalities.find(item => item.id === String(target.id))?.label || target.properties.name : target?.properties?.name;
  useEffect(() => {
    if (!result || confirm || game.finished) return;
    const timer=setTimeout(() => setGame(g => g.index + 1 >= g.queue.length ? {...g,finished:true} : {...g,index:g.index+1}), isCapital ? (result.correct ? 2600 : feedbackDuration(result)) : feedbackDuration(result));
    return () => clearTimeout(timer);
  }, [result, confirm, isCapital, game?.finished]);
  if (error) return <main className="results-page"><p>{error}</p><button className="secondary-button" onClick={onExit}>VOLTAR AO MENU</button></main>;
  if (!game || !target) return <main className="results-page"><p>A preparar o mapa…</p></main>;
  const answer = (value, clickedCountryId = null) => {
    if (result || game.finished) return;
    if (isCapital) {
      const distance=capitalDistance(value,target.coordenadas_capital);
      const {points, inCountry, correct}=scoreCapitalGuess(distance,clickedCountryId,target.id);
      setGame(g => g.answers.length > g.index ? g : {...g,score:g.score+points,answers:[...g.answers,{id:target.id,guess:value,distance,points,inCountry,clickedCountryId,correct}]});
    } else {
      const correct=value===String(target.id);
      setGame(g => g.answers.length > g.index ? g : {...g,score:g.score+(correct?100:0),answers:[...g.answers,{id:String(target.id),value,correct}]});
    }
  };
  const correct=game.answers.filter(a=>a.correct).map(a=>String(a.id));
  const wrong=game.answers.filter(a=>!a.correct).map(a=>String(a.id));
  const flash=result && !isCapital ? {id:result.value,targetId:String(target.id),correct:result.correct} : null;
  const map = isCapital ? <WorldMap region={region} queue={data} disabled={Boolean(result)||game.finished||confirm} onPointClick={answer} guessPoint={!game.finished ? result?.guess : null} wrong={game.finished ? wrong : []} solved={[]} keepCorrect={false} reveal={result && !game.finished ? {country:target,correct:result.correct,showCapital:true} : null} />
    : <SubdivisionMap kind={kind} features={data} districts={districts} answered={Boolean(result)||game.finished||confirm} onChoose={answer} solved={correct} wrong={game.finished?wrong:[]} flash={game.finished ? null : flash} keepCorrect={game.finished || game.keepCorrect} review={game.finished} focusIds={game.queue} />;
  if (game.finished) return <ResultsScreen title={titles[kind]} context={kind === 'municipios' && municipalityId ? `${districtNames.find(d => d.id === municipalityId)?.label || 'Distrito'} · ${game.queue.length} concelhos` : `${game.queue.length} rondas`} score={game.score} correct={correct.length} total={game.queue.length} mistakes={wrong.length} onRetry={() => setGame(initial(wrong,game.keepCorrect,true))} onReplay={() => setGame(initial(extraQueueIds(kind,data,municipalityId),game.keepCorrect))} onExit={onExit} map={map} mapNote={isCapital ? 'Vermelho: fora do país ou a mais de 100 km' : 'Vermelho: erros · Verde: acertos'} />;
  return <main className={`game-screen play-screen accent-lime ${kind === 'municipios' ? 'municipality-play' : ''}`}><div className="game-map-area">{map}</div><div className="play-score-panel"><button className="play-exit" aria-label="Guardar e sair" onClick={onExit}><Icon name="back" size={18}/><KiwiMark size={23}/></button><div className="play-score"><span>PONTOS</span><strong>{game.score}</strong></div><div className="play-round"><span>RONDA</span><strong>{game.index+1}<small>/{game.queue.length}</small></strong></div></div><section className="play-question"><span className="play-instruction">{isCapital?'COLOCA O PIN O MAIS PERTO POSSÍVEL':kind==='municipios'?'ENCONTRA O CONCELHO':'ENCONTRA O ESTADO'}</span><h1>{isCapital ? `${target.capital} · ${target.nome_pt}` : targetName}</h1></section><div className="play-controls"><RestartButton onClick={() => setConfirm(true)} />{!isCapital && <KeepCorrectControl compact checked={game.keepCorrect} onChange={value=>setGame(g=>({...g,keepCorrect:value,usedMapHints:g.usedMapHints || value}))}/>}{isCapital && <div className="play-scope">ATÉ 100 PONTOS · FORA DO PAÍS: MÁXIMO 25</div>}</div>{result && <div className={`play-feedback ${result.correct?'is-correct':'is-wrong'}`} role="status"><div>{isCapital && <span className="capital-points-pop" aria-hidden="true" key={game.index}>+{result.points}</span>}<strong>{isCapital?`+${result.points} PONTOS · ${Math.round(result.distance)} KM`:result.correct?'+100 PONTOS':'0 PONTOS'}</strong><p>{isCapital ? `${target.capital} · ${target.nome_pt} · ${result.inCountry ? 'No país certo' : 'Fora do país · máximo 25 pontos'}` : `${targetName}${kind === 'municipios' && !result.correct ? ' · resposta a amarelo' : ''}`}</p></div></div>}{confirm && <Modal title="Reiniciar esta partida?" onClose={() => setConfirm(false)}><p>O progresso desta partida será substituído.</p><div className="modal-actions"><button className="primary-button" onClick={() => setConfirm(false)}>CONTINUAR</button><button className="secondary-button" onClick={() => {setGame(initial(game.practice ? game.queue : extraQueueIds(kind,data,municipalityId),game.keepCorrect,game.practice));setConfirm(false);}}>REINICIAR</button></div></Modal>}</main>;
}
