import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { readExplorerSave, readExplorerRecord } from '../lib/explorer-game.js';
import { readQuizSave, readQuizRecord } from '../quiz/storage.js';
import { DIFFICULTIES } from '../quiz/engine.js';
import { difficultyLabel } from '../quiz/presentation.js';
import { getQuizPool } from '../quiz/questions.js';
import GameCardHeading from './GameCardHeading.jsx';
import { Icon } from './Icon.jsx';
import '../challenges.css';

const options=[10,20,30];
export function hasChallengeSave(kind){
  return kind==='explorer'?options.some(rounds=>readExplorerSave(rounds)):DIFFICULTIES.some(level=>options.some(rounds=>readQuizSave(rounds,level)));
}
function initialPreferences(kind){
  const saved=kind==='explorer'?options.map(rounds=>({rounds,game:readExplorerSave(rounds)})):DIFFICULTIES.flatMap(difficulty=>options.map(rounds=>({difficulty,rounds,game:readQuizSave(rounds,difficulty)})));
  const valid=saved.filter(item=>item.game).sort((a,b)=>(b.game.updatedAt||b.game.startedAt||0)-(a.game.updatedAt||a.game.startedAt||0));
  return valid[0]||{rounds:10,difficulty:'EASY'};
}
export function ChallengeCard({kind,onStart}){
  const {locale}=useLocale(),en=locale==='en',explorer=kind==='explorer';
  const [initial]=useState(()=>initialPreferences(kind));
  const [rounds,setRounds]=useState(initial.rounds),[difficulty,setDifficulty]=useState(initial.difficulty||'EASY');
  const saved=explorer?readExplorerSave(rounds):readQuizSave(rounds,difficulty);
  const record=explorer?readExplorerRecord(rounds):readQuizRecord(rounds,difficulty);
  const title=explorer?(en?'Explore the world':'Explora o mundo'):(en?'General knowledge':'Conhecimento geral');
  return <article className={`game-card simple-game-card challenge-card accent-${explorer?'cyan':'orange'}`} aria-labelledby={`mode-title-${explorer?8:9}`}>
    <GameCardHeading mode={explorer?8:9} title={title} titleId={`mode-title-${explorer?8:9}`}/>
    <p className={`game-card-description ${explorer?'':'quiz-bank-count'}`}>{explorer?(en?'Cities, landscapes and places around the world.':'Cidades, paisagens e lugares pelo mundo.'):`${getQuizPool(locale).length} ${en?'questions':'perguntas'}`}</p>
    {!explorer&&<a className="quiz-bank-link" href="/downloads/conhecimento-geral.md" download>{en?'All questions (MD)':'Todas as perguntas (MD)'}<Icon name="northeast" size={11}/></a>}
    <div className="region-heading">{en?'ROUNDS':'RONDAS'}</div>
    <div className="challenge-rounds" role="group" aria-label={en?`Rounds for ${title}`:`Rondas de ${title}`}>{options.map(value=><button type="button" key={value} aria-pressed={value===rounds} className={value===rounds?'selected':''} onClick={()=>setRounds(value)}>{value}</button>)}</div>
    {!explorer&&<div className="challenge-difficulty"><div className="region-heading">{en?'DIFFICULTY':'DIFICULDADE'}</div><div className="challenge-rounds" role="group" aria-label={en?'Quiz difficulty':'Dificuldade do quiz'}>{DIFFICULTIES.map(level=><button type="button" key={level} className={difficulty===level?'selected':''} aria-pressed={difficulty===level} onClick={()=>setDifficulty(level)}>{difficultyLabel(level,locale)}</button>)}</div><p>{en?'Lists: 1 answer · half · all':'Listas: 1 resposta · metade · todas'}</p></div>}
    <div className="card-score"><span><Icon name="trophy" size={14}/>{en?'BEST':'RECORDE'} · {rounds} {en?'ROUNDS':'RONDAS'}</span><strong>{String(record||0).padStart(4,'0')}</strong></div>
    {saved&&<div className="saved-run compact-saved-run"><span><Icon name="save" size={14}/>{saved.answers.length}/{saved.queue.length} {en?'SAVED':'GUARDADAS'}</span><button type="button" className="start-button" onClick={()=>onStart(kind,rounds,true,difficulty)}>{en?'RESUME GAME':'RETOMAR PARTIDA'}<Icon name="play" size={16}/></button></div>}
    <button type="button" className={saved?'new-run-button':'start-button'} onClick={()=>onStart(kind,rounds,false,difficulty)}>{saved?(en?'START NEW GAME':'COMEÇAR NOVO JOGO'):(en?'PLAY':'JOGAR')}<Icon name="arrow" size={17}/></button>
  </article>;
}
