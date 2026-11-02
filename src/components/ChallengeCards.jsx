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
    const title=explorer?(en?'Explore the world':'Explora o mundo'):(en?'Guess the country':'Adivinha o país');
    return <article key={game.kind} className={`game-card simple-game-card challenge-card accent-${explorer?'cyan':'orange'}`}>
      <div className="simple-card-header"><span className="card-action"><Icon name={game.icon} size={17}/>{explorer?(en?'PLACE A PIN':'COLOCAR UM PIN'):(en?'TYPE THE COUNTRY':'ESCREVER O PAÍS')}</span><span className="card-number">0{game.id}</span></div>
      <h3>{title}</h3>
      <div className="mode-preview challenge-demo" aria-label={explorer?(en?'Find Mount Everest on the map':'Encontra o Evereste no mapa'):(en?'A clue leads to a country name':'Uma pista leva ao nome de um país')}>
        <span className="challenge-demo-clue"><Icon name={explorer?'pin':'help'} size={27}/><strong>{explorer?(en?'Mount Everest':'Monte Evereste'):(en?'Divided the world with Spain':'Dividiu o mundo com Espanha')}</strong></span><Icon name="arrow" size={19}/>
        {explorer?<span className="challenge-demo-map"><Icon name="map" size={58}/><Icon name="pin" size={18}/></span>:<span className="challenge-demo-input">Portugal <Icon name="enter" size={13}/></span>}
      </div>
      <p className="challenge-description">{explorer?(en?'Cities, rivers, seas and remarkable places. Closer pins earn up to 100 points.':'Cidades, rios, mares e lugares marcantes. Quanto mais perto, mais pontos: até 100.'):(en?'Surprising clues about countries. Answer and discover the explanation.':'Pistas surpreendentes sobre países. Responde e descobre a explicação.')}</p>
      <div className="region-heading">{en?'ROUNDS':'RONDAS'}</div>
      <div className="challenge-rounds" role="group" aria-label={en?`Rounds for ${title}`:`Rondas de ${title}`}>{options.map(value=><button type="button" key={value} aria-pressed={value===count} className={value===count?'selected':''} onClick={()=>setRounds(previous=>({...previous,[game.kind]:value}))}>{value}</button>)}</div>
      <div className="card-score"><span><Icon name="trophy" size={14}/>{en?'BEST':'RECORDE'} · {count} {en?'ROUNDS':'RONDAS'}</span><strong>{String(record||0).padStart(4,'0')}</strong></div>
      {saved&&<div className="saved-run compact-saved-run"><span><Icon name="save" size={14}/>{saved.answers.length}/{saved.queue.length} {en?'SAVED':'GUARDADAS'}</span><button type="button" className="start-button" onClick={()=>onStart(game.kind,count,true)}>{en?'RESUME GAME':'RETOMAR PARTIDA'}<Icon name="play" size={16}/></button></div>}
      <button type="button" className={saved?'new-run-button':'start-button'} onClick={()=>onStart(game.kind,count,false)}>{saved?(en?'START NEW GAME':'COMEÇAR NOVO JOGO'):(en?'PLAY':'JOGAR')}<Icon name="arrow" size={17}/></button>
    </article>;
  })}</div>;
}
