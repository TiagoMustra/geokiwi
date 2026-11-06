import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { readExplorerSave, readExplorerRecord } from '../lib/explorer-game.js';
import { readQuizSave, readQuizRecord } from '../quiz/storage.js';
import { DIFFICULTIES } from '../quiz/engine.js';
import { difficultyLabel } from '../quiz/presentation.js';
import { quizQuestions } from '../quiz/questions.js';
import { Icon } from './Icon.jsx';
import '../challenges.css';

const options = [10, 20, 30];
const games = [
  { kind: 'explorer', id: 8, icon: 'pin', readSave: readExplorerSave, readRecord: readExplorerRecord },
  { kind: 'clues', id: 9, icon: 'help', readSave: readQuizSave, readRecord: readQuizRecord },
];
function initialRounds(readSave) {
  const saved = options.map(rounds => ({ rounds, game: readSave(rounds) })).filter(item => item.game);
  saved.sort((a,b) => (b.game.updatedAt || b.game.startedAt || 0) - (a.game.updatedAt || a.game.startedAt || 0));
  return saved[0]?.rounds || 10;
}
function initialQuizPreferences(){
  const saved=DIFFICULTIES.flatMap(difficulty=>options.map(rounds=>({difficulty,rounds,game:readQuizSave(rounds,difficulty)}))).filter(item=>item.game);
  saved.sort((a,b)=>(b.game.updatedAt||b.game.startedAt||0)-(a.game.updatedAt||a.game.startedAt||0));
  return saved[0]||{rounds:10,difficulty:'EASY'};
}
export default function ChallengeCards({ onStart }) {
  const {locale}=useLocale(); const en=locale==='en';
  const [quizInitial]=useState(initialQuizPreferences);
  const [rounds,setRounds]=useState(()=>Object.fromEntries(games.map(game=>[game.kind,game.kind==='clues'?quizInitial.rounds:initialRounds(game.readSave)])));
  const [difficulty,setDifficulty]=useState(quizInitial.difficulty);
  return <div className="challenge-games-grid">{games.map(game=>{
    const count=rounds[game.kind]; const saved=game.kind==='clues'?readQuizSave(count,difficulty):game.readSave(count); const record=game.kind==='clues'?readQuizRecord(count,difficulty):game.readRecord(count);
    const explorer=game.kind==='explorer';
    const title=explorer?(en?'Explore the world':'Explora o mundo'):'Fun facts';
    return <article key={game.kind} className={`game-card simple-game-card challenge-card accent-${explorer?'cyan':'orange'}`}>
      <div className="challenge-heading">
        <span className="challenge-symbol" aria-hidden="true"><Icon name={explorer?'map':'help'} size={42}/></span>
        <div><span className="challenge-action">{explorer?(en?'PLACE A PIN':'COLOCAR UM PIN'):(en?'GEOGRAPHY QUIZ':'QUIZ DE GEOGRAFIA')}</span><h3>{title}</h3></div>
        <span className="card-number">0{game.id}</span>
      </div>
      {explorer && <p className="challenge-description">{en?'Cities, landscapes and places around the world.':'Cidades, paisagens e lugares pelo mundo.'}</p>}
      {!explorer&&<p className="challenge-description quiz-bank-count">{quizQuestions.length} {en?'questions':'perguntas'}</p>}
      <div className="region-heading">{en?'ROUNDS':'RONDAS'}</div>
      <div className="challenge-rounds" role="group" aria-label={en?`Rounds for ${title}`:`Rondas de ${title}`}>{options.map(value=><button type="button" key={value} aria-pressed={value===count} className={value===count?'selected':''} onClick={()=>setRounds(previous=>({...previous,[game.kind]:value}))}>{value}</button>)}</div>
      {!explorer&&<div className="challenge-difficulty"><div className="region-heading">{en?'DIFFICULTY':'DIFICULDADE'}</div><div className="challenge-rounds" role="group" aria-label={en?'Quiz difficulty':'Dificuldade do quiz'}>{DIFFICULTIES.map(level=><button type="button" key={level} className={difficulty===level?'selected':''} aria-pressed={difficulty===level} onClick={()=>setDifficulty(level)}>{difficultyLabel(level,locale)}</button>)}</div><p>{en?'Lists: 1 answer · half · all':'Listas: 1 resposta · metade · todas'}</p></div>}
      <div className="card-score"><span><Icon name="trophy" size={14}/>{en?'BEST':'RECORDE'} · {count} {en?'ROUNDS':'RONDAS'}</span><strong>{String(record||0).padStart(4,'0')}</strong></div>
      {saved&&<div className="saved-run compact-saved-run"><span><Icon name="save" size={14}/>{saved.answers.length}/{saved.queue.length} {en?'SAVED':'GUARDADAS'}</span><button type="button" className="start-button" onClick={()=>onStart(game.kind,count,true,difficulty)}>{en?'RESUME GAME':'RETOMAR PARTIDA'}<Icon name="play" size={16}/></button></div>}
      <button type="button" className={saved?'new-run-button':'start-button'} onClick={()=>onStart(game.kind,count,false,difficulty)}>{saved?(en?'START NEW GAME':'COMEÇAR NOVO JOGO'):(en?'PLAY':'JOGAR')}<Icon name="arrow" size={17}/></button>
    </article>;
  })}</div>;
}
