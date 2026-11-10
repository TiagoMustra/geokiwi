import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { stadiums } from '../data/stadiums.js';
import { createStadiumGame, answerStadiumGame, nextStadiumRound, readStadiumSave, restoreStadiumGame, writeStadiumSave, readStadiumRecord, saveStadiumRecord, stadiumPrompt } from '../lib/stadium-game.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import ProximityMap from './ProximityMap.jsx';
import { Icon, KiwiMark } from './Icon.jsx';
import RestartButton from './RestartButton.jsx';
import LanguageControl from './LanguageControl.jsx';
import Modal from './Modal.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import '../stadiums.css';

const STADIUM_BOUNDS=[[-12,34],[26,60]];

export default function StadiumGame({resume=false,onExit}){
 const {locale,t}=useLocale(),en=locale==='en',say=(pt,eng)=>en?eng:pt;
 const [game,setGame]=useState(()=>resume&&restoreStadiumGame(readStadiumSave(),stadiums)||createStadiumGame(stadiums));
 const [draft,setDraft]=useState(null),[confirm,setConfirm]=useState(false),[storageOK,setStorageOK]=useState(true),[review,setReview]=useState(null);
 const initialRecord=useRef(readStadiumRecord());
 const byId=useMemo(()=>Object.fromEntries(stadiums.map(s=>[s.id,s])),[]);
 const target=byId[game.queue[game.index]],result=game.answers[game.index];
 const shown=game.finished?(game.answers.find(a=>a.id===review)||game.answers[0]):result;
 const revealed=shown?byId[shown.id]:null;
 const near=game.answers.filter(a=>a.correct).length;
 useEffect(()=>{setStorageOK(writeStadiumSave(game));if(game.finished)saveStadiumRecord(game);},[game]);
 useEffect(()=>{setDraft(null);},[game.id,game.index]);
 const restart=()=>{initialRecord.current=readStadiumRecord();setGame(createStadiumGame(stadiums));setDraft(null);setReview(null);setConfirm(false);};
 const answer=()=>{if(draft&&!confirm)setGame(g=>answerStadiumGame(g,stadiums,draft.coordinates,draft.countryId));};
 const distance=answer=>answer.skipped?say('Ronda saltada','Round skipped'):`${new Intl.NumberFormat(en?'en-GB':'pt-PT',{maximumFractionDigits:answer.distance<10?2:0}).format(answer.distance)} km`;
 const map=<ProximityMap region="europa" initialBounds={STADIUM_BOUNDS} revealMaxZoom={16} disabled={Boolean(result)||game.finished||confirm} onPointClick={(coordinates,countryId)=>setDraft({coordinates,countryId})} guessPoint={shown?.guess||(!game.finished?draft?.coordinates:null)} reveal={revealed?{country:{id:revealed.id,nome_pt:revealed.name,nome_en:revealed.name,coordenadas_centro:revealed.coordinates},correct:shown.correct}:null}/>;
 if(game.finished)return <ResultsScreen title="Stadium Pinpoint" context={say('10 rondas · máximo 1 000 pontos','10 rounds · maximum 1,000 points')} score={game.score} correct={near} total={10} mistakes={10-near} newRecord={game.score>initialRecord.current} onReplay={restart} onExit={onExit} map={map} mapNote={say('Escolhe uma ronda para rever o estádio e o teu pin.','Choose a round to review the stadium and your pin.')}>
  <section className="stadium-review"><h2>{say('Os teus estádios','Your stadiums')}</h2>{game.answers.map((a,i)=><button key={a.id} className={shown?.id===a.id?'is-selected':''} aria-pressed={shown?.id===a.id} onClick={()=>setReview(a.id)}><span>{i+1}. {byId[a.id].name}<small>{byId[a.id].city} · {t(byId[a.id].country)} · {distance(a)}</small></span><strong>{a.points}/100</strong></button>)}</section>
 </ResultsScreen>;
 return <main className="game-screen play-screen stadium-play accent-cyan">
  <div className="game-map-area">{map}</div>
  <div className="play-score-panel"><button className="play-exit" aria-label={say('Guardar e sair','Save and exit')} onClick={onExit}><Icon name="back" size={18}/><KiwiMark size={23}/></button><div className="play-score"><span>{say('PONTOS','POINTS')}</span><strong>{game.score}</strong></div><div className="play-round"><span>{say('RONDA','ROUND')}</span><strong>{game.index+1}<small>/10</small></strong></div></div>
  <section className="play-question stadium-question" aria-label={say('Estádio a localizar','Stadium to locate')}>
   {createElement('h1',null,stadiumPrompt(target))}
   {!result&&<div className="stadium-submit"><button className="stadium-confirm" disabled={!draft||confirm} onClick={answer}><Icon name="pin" size={16}/>{say('Confirmar pin','Confirm pin')}</button><button className="stadium-skip" disabled={confirm} onClick={()=>setGame(g=>answerStadiumGame(g,stadiums,null,null,{skipped:true}))}>{say('Saltar','Skip')}<Icon name="arrow" size={13}/></button></div>}
  </section>
  <div className="play-controls stadium-controls"><LanguageControl/><RestartButton onClick={()=>setConfirm(true)}/>{!storageOK&&<small>{say('Progresso disponível só nesta sessão.','Progress is only available in this session.')}</small>}</div>
  {result&&<section className="play-feedback stadium-feedback" role="status"><div><strong>+{result.points} {say('pontos','points')} · {distance(result)}</strong><h2>{target.name}</h2><p>{target.club} · {t(target.city)} · {t(target.country)}</p><a href={target.venueSource.url} target="_blank" rel="noreferrer">{say('Sobre o estádio','About the stadium')} <Icon name="northeast" size={11}/></a></div><button className="stadium-next" onClick={()=>setGame(nextStadiumRound)}>{game.index===9?say('Ver resultados','See results'):say('Próxima ronda','Next round')}<Icon name="arrow" size={16}/></button></section>}
  {confirm&&<Modal title={say('Reiniciar esta partida?','Restart this run?')} onClose={()=>setConfirm(false)}><p>{say('O progresso desta partida será substituído. O recorde mantém-se.','This replaces your current run. Your best score stays saved.')}</p><div className="modal-actions"><button className="primary-button" onClick={()=>setConfirm(false)}>{say('Continuar','Continue')}</button><button className="secondary-button" onClick={restart}>{say('Reiniciar','Restart')}</button></div></Modal>}
 </main>;
}
