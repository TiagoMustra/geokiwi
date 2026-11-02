import { useEffect, useMemo, useRef, useState } from 'react';
import { countries, byId } from '../data/index.js';
import { countryClues, countryClueById } from '../data/country-clues.js';
import { answerCountryClue, nextCountryClue, createCountryClueGame, readCountryClueSave, writeCountryClueSave, readCountryClueRecord, saveCountryClueRecord, clueFeedbackDuration } from '../lib/country-clues-game.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { Icon, KiwiMark } from './Icon.jsx';
import AnswerInput from './AnswerInput.jsx';
import Modal from './Modal.jsx';
import RestartButton from './RestartButton.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import WorldMap from './WorldMap.jsx';
import LanguageControl from './LanguageControl.jsx';
import '../country-clues.css';

export default function CountryClueGame({rounds=10,resume=false,onExit}) {
 const {locale,countryName}=useLocale();
 const en=locale==='en';
 const [game,setGame]=useState(()=>resume&&readCountryClueSave(rounds)||createCountryClueGame({rounds}));
 const [input,setInput]=useState(''),[paused,setPaused]=useState(false),[hidden,setHidden]=useState(false),[confirm,setConfirm]=useState(false),[storageOK,setStorageOK]=useState(true);
 const inputRef=useRef(null),lock=useRef(false),finishedRef=useRef(false),recordRef=useRef(readCountryClueRecord(rounds));
 const clue=countryClueById[game.queue[game.index]],result=game.answers[game.index];
 const pool=useMemo(()=>countries.filter(country=>country.isCountry),[]);
 const missed=game.answers.filter(answer=>!answer.correct).map(answer=>countryClueById[answer.clueId]);
 const solvedIds=[...new Set(game.answers.filter(answer=>answer.correct).flatMap(answer=>countryClueById[answer.clueId].countryIds))];
 const wrongIds=[...new Set(missed.flatMap(item=>item.countryIds))];
 const answerNames=item=>item.countryIds.map(id=>countryName(byId[id])).join(' / ');
 const correctCount=game.answers.filter(answer=>answer.correct).length;
 const canonical=byId[result?.correct&&result.chosenId?result.chosenId:clue.countryIds[0]];
 useEffect(()=>{setStorageOK(writeCountryClueSave(game));if(game.finished&&!finishedRef.current){finishedRef.current=true;saveCountryClueRecord(game);}},[game]);
 useEffect(()=>{const sync=()=>setHidden(document.hidden);sync();document.addEventListener('visibilitychange',sync);return()=>document.removeEventListener('visibilitychange',sync);},[]);
 useEffect(()=>{lock.current=false;setInput('');setPaused(false);if(!game.finished)inputRef.current?.focus({preventScroll:true});},[game.id,game.index,game.finished]);
 useEffect(()=>{if(!result||game.finished||paused||hidden||confirm)return;const timer=setTimeout(()=>setGame(nextCountryClue),clueFeedbackDuration(result));return()=>clearTimeout(timer);},[result,game.finished,paused,hidden,confirm]);
 function answer(value,skipped=false){if(lock.current||result||game.finished||(!skipped&&!value.trim()))return;lock.current=true;setGame(old=>answerCountryClue(old,value,{skipped}));}
 function start(poolItems=countryClues,practice=false){lock.current=false;finishedRef.current=false;recordRef.current=readCountryClueRecord(rounds);setConfirm(false);setGame(createCountryClueGame({rounds,pool:poolItems,practice}));}
 function exit(){writeCountryClueSave(game);onExit();}
 if(game.finished)return <ResultsScreen title="Fun facts" context={`${game.queue.length} ${en?'clues':'pistas'}${game.practice?en?' · practice':' · treino':''}`} score={game.score} correct={correctCount} total={game.queue.length} mistakes={missed.length} newRecord={!game.practice&&game.score>recordRef.current} onRetry={()=>start(missed,true)} onReplay={()=>start()} onExit={onExit} map={<WorldMap region="mundo" queue={pool} solved={solvedIds} wrong={wrongIds} disabled />} mapNote={en?'Red: countries from missed clues · Green: correct answers':'Vermelho: países das pistas falhadas · Verde: acertos'}>
  <details className="answer-review clue-review"><summary>{en?'Review the clues':'Rever as pistas'} <span>+</span></summary>{game.answers.map(answer=>{const item=countryClueById[answer.clueId];return <article key={item.id}><Icon name={answer.correct?'check':'close'} size={17}/><div><h3>{en?item.en:item.pt}</h3><strong>{answerNames(item)}</strong><p>{en?item.explanation_en:item.explanation_pt}</p><a href={item.source.url} target="_blank" rel="noreferrer">{en?'Source':'Fonte'}: {item.source.title} <Icon name="northeast" size={11}/></a></div></article>;})}</details>
 </ResultsScreen>;
 return <main className="game-screen play-screen clue-game accent-lime">
  <div className="game-map-area"><WorldMap region="mundo" queue={pool} target={result?canonical:undefined} typed={Boolean(result)} solved={result?clue.countryIds:[]} keepCorrect={true} wrong={result&&!result.correct&&result.chosenId?[result.chosenId]:[]} flash={result?.chosenId?{id:result.chosenId,correct:result.correct}:null} reveal={result?{country:canonical,correct:result.correct}:null} disabled /></div>
  <div className="play-score-panel"><button className="play-exit" aria-label={en?'Save and exit':'Guardar e sair'} onClick={exit}><Icon name="back" size={18}/><KiwiMark size={23}/></button><div className="play-score"><span>{en?'POINTS':'PONTOS'}</span><strong>{game.score}</strong></div><div className="play-round"><span>{en?'ROUND':'RONDA'}</span><strong>{game.index+1}<small>/{game.queue.length}</small></strong></div></div>
  <section className="play-question clue-question" aria-label={en?'Country riddle':'Pista do país'}><span className="play-instruction">{en?'WHICH COUNTRY IS THIS?':'DE QUE PAÍS SE TRATA?'}</span><h1>{en?clue.en:clue.pt}</h1>{clue.countryIds.length>1&&<small className="clue-shared">{en?'Any one of the countries is accepted.':'É aceite qualquer um dos países.'}</small>}<div className="play-input-row"><form onSubmit={event=>{event.preventDefault();answer(input);}}><label className="sr-only" htmlFor="answer-input">{en?'Country name':'Nome do país'}</label><AnswerInput value={input} onChange={setInput} onSelect={value=>answer(value)} inputRef={inputRef} pool={pool} mode={2} enabled={true} disabled={Boolean(result)||confirm}/><button type="submit" aria-label={en?'Submit answer':'Confirmar resposta'} disabled={Boolean(result)||!input.trim()}><Icon name="enter" size={18}/></button></form><button className="play-skip" type="button" onClick={()=>answer('',true)} disabled={Boolean(result)}>{en?'SKIP':'SALTAR'}</button></div></section>
  <div className="play-controls clue-controls"><LanguageControl/><RestartButton onClick={()=>setConfirm(true)}/><span className="clue-save-status">{storageOK?en?'Saved automatically':'Guardado automaticamente':en?'Saving is blocked in this browser':'A gravação está bloqueada neste navegador'}</span></div>
  {!result&&<p className="play-first-tip">{en?'Type a country or choose a suggestion.':'Escreve um país ou escolhe uma sugestão.'}</p>}
  {result&&<section className={`play-feedback clue-feedback ${result.correct?'is-correct':'is-wrong'}`} role="status"><Icon name={result.correct?'check':'close'} size={22}/><div className="clue-solution"><strong>{result.correct?'+100':result.skipped?en?'SKIPPED · 0':'SALTADA · 0':'0'} {en?'POINTS':'PONTOS'}</strong><h2>{answerNames(clue)}</h2>{!result.correct&&result.value&&<small>{en?'Your answer':'A tua resposta'}: {result.chosenId?countryName(byId[result.chosenId]):result.value}</small>}<p title={en?clue.explanation_en:clue.explanation_pt}>{en?clue.explanation_en:clue.explanation_pt}</p><a href={clue.source.url} target="_blank" rel="noreferrer" onClick={()=>setPaused(true)}>{en?'Source':'Fonte'}: {clue.source.title} <Icon name="northeast" size={11}/></a></div><button aria-pressed={paused} aria-label={en?paused?'Continue':'Pause to read':paused?'Continuar':'Pausar para ler'} onClick={()=>setPaused(value=>!value)}><Icon name={paused?'play':'pause'} size={17}/><span>{en?paused?'CONTINUE':'PAUSE':paused?'CONTINUAR':'PAUSAR'}</span></button>{!paused&&!hidden&&!confirm&&<div className="play-countdown"><i key={`${game.id}-${game.index}-${paused}`} style={{animationDuration:`${clueFeedbackDuration(result)}ms`}}/></div>}</section>}
  {confirm&&<Modal title={en?'Restart this game?':'Reiniciar esta partida?'} onClose={()=>setConfirm(false)}><p>{en?'This replaces the current run. Your records stay saved.':'Esta ação substitui a partida atual. Os recordes mantêm-se guardados.'}</p><div className="modal-actions"><button className="primary-button" onClick={()=>setConfirm(false)}>{en?'CONTINUE':'CONTINUAR'}</button><button className="secondary-button" onClick={()=>start(game.practice?game.queue.map(id=>countryClueById[id]):countryClues,game.practice)}>{en?'RESTART':'REINICIAR'}</button></div></Modal>}
 </main>;
}
