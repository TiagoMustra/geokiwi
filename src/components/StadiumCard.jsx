import { useLocale } from '../i18n/LocaleContext.jsx';
import { stadiums } from '../data/stadiums.js';
import { readStadiumSave, restoreStadiumGame, readStadiumRecord } from '../lib/stadium-game.js';
import GameCardHeading from './GameCardHeading.jsx';
import { Icon } from './Icon.jsx';
export const hasStadiumSave=()=>Boolean(restoreStadiumGame(readStadiumSave(),stadiums));
export default function StadiumCard({color,onStart}){
 const {locale}=useLocale(),en=locale==='en',saved=restoreStadiumGame(readStadiumSave(),stadiums);
 return <article className={`game-card simple-game-card accent-${color}`} aria-labelledby="mode-title-10">
  <GameCardHeading mode={10} title="Stadium Pinpoint" titleId="mode-title-10"/>
  <p className="game-card-description">{en?'Only the stadium name. Find its location.':'Só o nome do estádio. Encontra a localização.'}</p>
  <div className="region-heading">10 {en?'ROUNDS':'RONDAS'} <span>{stadiums.length} {en?'stadiums · Europe':'estádios · Europa'}</span></div>
  <div className="card-score"><span><Icon name="trophy" size={14}/> {en?'BEST':'RECORDE'}</span><strong>{String(readStadiumRecord()).padStart(4,'0')}</strong></div>
  {saved&&<div className="saved-run compact-saved-run"><span><Icon name="save" size={14}/>{saved.answers.length}/10 {en?'SAVED':'GUARDADAS'}</span><button className="start-button" onClick={()=>onStart('stadiums',10,true)}>{en?'RESUME GAME':'RETOMAR PARTIDA'}<Icon name="play" size={16}/></button></div>}
  <button className={saved?'new-run-button':'start-button'} onClick={()=>onStart('stadiums',10,false)}>{saved?(en?'START NEW GAME':'COMEÇAR NOVO JOGO'):(en?'PLAY':'JOGAR')}<Icon name="arrow" size={17}/></button>
 </article>;
}
