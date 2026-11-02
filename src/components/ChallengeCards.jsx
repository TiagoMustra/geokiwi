import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { readExplorerSave, readExplorerRecord } from '../lib/explorer-game.js';
import { readCountryClueSave, readCountryClueRecord } from '../lib/country-clues-game.js';
import { Icon } from './Icon.jsx';
import '../challenges.css';

const options = [10, 20, 30];
const games = [
  { kind: 'explorer', id: 8, icon: 'pin', readSave: readExplorerSave, readRecord: readExplorerRecord },
  { kind: 'clues', id: 9, icon: 'keyboard', readSave: readCountryClueSave, readRecord: readCountryClueRecord },
];
function initialRounds(readSave) {
  const saved = options.map(rounds => ({ rounds, game: readSave(rounds) })).filter(item => item.game);
  saved.sort((a,b) => (b.game.updatedAt || b.game.startedAt || 0) - (a.game.updatedAt || a.game.startedAt || 0));
  return saved[0]?.rounds || 10;
}
export default function ChallengeCards({ onStart }) {
  const {locale}=useLocale(); const en=locale==='en';
  const [rounds,setRounds]=useState(()=>Object.fromEntries(games.map(game=>[game.kind,initialRounds(game.readSave)])));
  return <div className="challenge-games-grid">{games.map(game=>{
    const count=rounds[game.kind]; const saved=game.readSave(count); const record=game.readRecord(count);
    const explorer=game.kind==='explorer';
    const title=explorer?(en?'Explore the world':'Explora o mundo'):'Fun facts';
    return <article key={game.kind} className={`game-card simple-game-card challenge-card accent-${explorer?'cyan':'orange'}`}>
      <div className="challenge-heading">
        <span className="challenge-symbol" aria-hidden="true"><Icon name={explorer?'map':'help'} size={42}/></span>
        <div><span className="challenge-action">{explorer?(en?'PLACE A PIN':'COLOCAR UM PIN'):(en?'TYPE THE COUNTRY':'ESCREVER O PAÍS')}</span><h3>{title}</h3></div>
        <span className="card-number">0{game.id}</span>
      </div>
      {explorer && <p className="challenge-description">{en?'Cities, landscapes and places around the world.':'Cidades, paisagens e lugares pelo mundo.'}</p>}
      <div className="region-heading">{en?'ROUNDS':'RONDAS'}</div>
      <div className="challenge-rounds" role="group" aria-label={en?`Rounds for ${title}`:`Rondas de ${title}`}>{options.map(value=><button type="button" key={value} aria-pressed={value===count} className={value===count?'selected':''} onClick={()=>setRounds(previous=>({...previous,[game.kind]:value}))}>{value}</button>)}</div>
      <div className="card-score"><span><Icon name="trophy" size={14}/>{en?'BEST':'RECORDE'} · {count} {en?'ROUNDS':'RONDAS'}</span><strong>{String(record||0).padStart(4,'0')}</strong></div>
      {saved&&<div className="saved-run compact-saved-run"><span><Icon name="save" size={14}/>{saved.answers.length}/{saved.queue.length} {en?'SAVED':'GUARDADAS'}</span><button type="button" className="start-button" onClick={()=>onStart(game.kind,count,true)}>{en?'RESUME GAME':'RETOMAR PARTIDA'}<Icon name="play" size={16}/></button></div>}
      <button type="button" className={saved?'new-run-button':'start-button'} onClick={()=>onStart(game.kind,count,false)}>{saved?(en?'START NEW GAME':'COMEÇAR NOVO JOGO'):(en?'PLAY':'JOGAR')}<Icon name="arrow" size={17}/></button>
    </article>;
  })}</div>;
}
