import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { quizQuestionById } from '../quiz/questions.js';
import { fromLngLat, nextQuiz, submitQuiz, toLngLat } from '../quiz/engine.js';
import { checkpointQuiz, readQuizSave, readQuizRecord, saveQuizRecord, createNewQuiz, rememberQuizQuestion } from '../quiz/storage.js';
import { difficultyLabel, inputLabel, noticeLabel, solutionLabel, placeTypeLabel, allowsQuizSuggestions, quizPointsColor } from '../quiz/presentation.js';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { Icon, KiwiMark } from './Icon.jsx';
import Modal from './Modal.jsx';
import RestartButton from './RestartButton.jsx';
import ResultsScreen from './ResultsScreen.jsx';
import LanguageControl from './LanguageControl.jsx';
import QuestionInput from './quiz/QuestionInput.jsx';
import QuestionPhoto, { QuestionPhotoDialog } from './quiz/QuestionPhoto.jsx';
import '../country-clues.css';
import '../quiz/quiz.css';

const ProximityMap=lazy(()=>import('./ProximityMap.jsx'));

export default function CountryClueGame({rounds=10,difficulty='EASY',resume=false,onExit}) {
  const {locale}=useLocale(),en=locale==='en';
  const [game,setGame]=useState(()=>resume&&readQuizSave(rounds,difficulty)||createNewQuiz({rounds,difficulty,locale}));
  const [point,setPoint]=useState(null),[confirm,setConfirm]=useState(false),[storageOK,setStorageOK]=useState(true),[suggestions,setSuggestions]=useState(true);
  const [photoOpen,setPhotoOpen]=useState(false);
  const recordRef=useRef(readQuizRecord(rounds,difficulty)),finishedRef=useRef(false);
  const question=quizQuestionById[game.queue[game.index]],result=game.answers[game.index];
  const mapQuestion=question.inputType==='MAP_PINPOINT';
  const missed=game.answers.filter(a=>!a.correct).map(a=>quizQuestionById[a.questionId]);
  const correctCount=game.answers.filter(a=>a.correct).length;
  const mapReveal=mapQuestion&&result?{country:{id:question.id,nome_pt:'Resposta',nome_en:'Answer',coordenadas_centro:toLngLat(question.answer.point)},correct:result.correct}:null;

  useEffect(()=>{setStorageOK(checkpointQuiz(game));if(game.finished&&!finishedRef.current){finishedRef.current=true;saveQuizRecord(game);}},[game]);
  useEffect(()=>{setPoint(null);setPhotoOpen(false);},[game.id,game.index]);
  useEffect(()=>{rememberQuizQuestion(game.queue[game.index]);},[game.id,game.index]);
  useEffect(()=>{for(const id of game.queue.slice(game.index+1,game.index+3)){const photo=quizQuestionById[id]?.image;if(photo){const image=new Image();image.src=photo.src;}}},[game.id,game.index]);
  function advance(){if(!confirm&&!photoOpen)setGame(nextQuiz);}
  function answer(value,skipped=false){setGame(old=>submitQuiz(old,quizQuestionById,value,{skipped,locale}));}
  function start(bank,practice=false){finishedRef.current=false;recordRef.current=readQuizRecord(rounds,game.difficulty);setConfirm(false);setGame(createNewQuiz({rounds,difficulty:game.difficulty,locale,...(bank?{bank}:{}),practice}));}
  function exit(){checkpointQuiz(game);onExit();}

  if(game.finished)return <ResultsScreen title={en?'General knowledge':'Conhecimento geral'} context={`${difficultyLabel(game.difficulty,locale)} · ${game.queue.length} ${en?'questions':'perguntas'}`} score={game.score} correct={correctCount} total={game.queue.length} mistakes={missed.length} newRecord={!game.practice&&game.score>recordRef.current} onReplay={()=>start()} onExit={onExit} allowReview={false} prominentScore/>;
  return <main className={`game-screen play-screen clue-game geoguru-game accent-lime ${mapQuestion?'quiz-map-round':'quiz-no-map'}`}>
    {mapQuestion&&<div className="game-map-area"><Suspense fallback={<div className="mode-loading">{en?'Loading the map…':'A carregar o mapa…'}</div>}><ProximityMap onPointClick={coords=>setPoint(fromLngLat(coords))} disabled={Boolean(result)||confirm} guessPoint={result&&!result.skipped?toLngLat(result.value):point?toLngLat(point):null} reveal={mapReveal}/></Suspense></div>}
    <div className="play-score-panel"><button className="play-exit" aria-label={en?'Save and exit':'Guardar e sair'} onClick={exit}><Icon name="back" size={18}/><KiwiMark size={23}/></button><div className="play-score"><span>{en?'POINTS':'PONTOS'}</span><strong>{game.score}</strong></div><div className="play-round"><span>{en?'ROUND':'RONDA'}</span><strong>{game.index+1}<small>/{game.queue.length}</small></strong></div></div>
    <div className="quiz-round-content">
    <section key={`${game.id}:${game.index}`} className="play-question clue-question quiz-question" aria-label={en?'General knowledge question':'Pergunta de conhecimento geral'}>{result&&<span className="quiz-points-burst" style={{'--points-color':quizPointsColor(result.points)}} aria-hidden="true">+{result.points}</span>}<div className="quiz-question-meta"><div className="quiz-instruction-group"><span className="play-instruction">{inputLabel(question.inputType,locale)}</span>{mapQuestion&&<span className="quiz-place-type">{placeTypeLabel(question.placeType,locale)}</span>}</div><span>{difficultyLabel(game.difficulty,locale)}</span></div>{question.image?<div className="quiz-photo-prompt"><h1>{question.prompt[locale]}</h1><QuestionPhoto photo={question.image} onExpand={()=>setPhotoOpen(true)}/></div>:<h1>{question.prompt[locale]}</h1>}{question.nameLanguage&&<p className="quiz-name-rule">{en?`Names in ${question.nameLanguage==='pt'?'Portuguese':'English'} · spaces and hyphens do not count`:`Nomes em ${question.nameLanguage==='pt'?'português':'inglês'} · não contes espaços nem hífens`}</p>}
      <QuestionInput key={`${game.id}:${game.index}`} question={question} difficulty={game.difficulty} foundIds={game.foundIds} locale={locale} disabled={Boolean(result)||confirm} onSubmit={answer} point={point} suggestions={suggestions} result={result}/>
      {game.notice&&<p className="quiz-notice" role="status">{noticeLabel(game.notice,question,locale)}</p>}
      <div className="quiz-question-footer">{question.referenceYear&&<span>{en?'Data':'Dados'}: {question.referenceYear}</span>}<button className="play-skip" type="button" onClick={()=>answer('',true)} disabled={Boolean(result)||confirm}>{en?'SKIP':'SALTAR'} <Icon name="arrow" size={12}/></button></div>
    </section>
    {result&&<section className={`play-feedback clue-feedback quiz-answer-card ${result.correct?'is-correct':result.points>0?'is-close':'is-wrong'}`} role="status"><Icon name={result.correct?'check':result.points>0?'help':'close'} size={22}/><div className="clue-solution"><strong className="quiz-earned-points" style={{color:quizPointsColor(result.points)}}>+{result.points} {en?'points':'pontos'}{result.skipped?en?' · skipped':' · saltada':''}{typeof result.distanceKm==='number'?` · ${Math.round(result.distanceKm)} km`:''}</strong><h2>{solutionLabel(question,locale)}</h2><p title={question.explanation[locale]}>{question.explanation[locale]}</p>{question.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{en?'Source':'Fonte'}: {source.title} <Icon name="northeast" size={11}/></a>)}</div><button type="button" className="quiz-feedback-advance" onClick={advance} disabled={confirm||photoOpen} aria-label={en?game.index+1===game.queue.length?'See results':'Next question':game.index+1===game.queue.length?'Ver resultados':'Próxima pergunta'}><span>{en?game.index+1===game.queue.length?'See results':'Next question':game.index+1===game.queue.length?'Ver resultados':'Próxima pergunta'} <Icon name="arrow" size={15}/></span></button></section>}
    </div>
    <div className="play-controls clue-controls"><LanguageControl/><RestartButton onClick={()=>setConfirm(true)}/>{allowsQuizSuggestions(question)&&<button type="button" className="quiz-suggestions-toggle" role="switch" aria-checked={suggestions} onClick={()=>setSuggestions(v=>!v)}>{en?'Suggestions':'Sugestões'}<span>{suggestions?'ON':'OFF'}</span></button>}<span className="clue-save-status">{storageOK?en?'Saved automatically':'Guardado automaticamente':en?'Saving is blocked in this browser':'A gravação está bloqueada neste navegador'}</span></div>
    {photoOpen&&question.image&&<QuestionPhotoDialog photo={question.image} onClose={()=>setPhotoOpen(false)}/>}
    {confirm&&<Modal title={en?'Restart this game?':'Reiniciar esta partida?'} onClose={()=>setConfirm(false)}><p>{en?'This replaces the current run. Your records stay saved.':'Esta ação substitui a partida atual. Os recordes mantêm-se guardados.'}</p><div className="modal-actions"><button className="primary-button" onClick={()=>setConfirm(false)}>{en?'CONTINUE':'CONTINUAR'}</button><button className="secondary-button" onClick={()=>start(game.practice?game.queue.map(id=>quizQuestionById[id]):undefined,game.practice)}>{en?'RESTART':'REINICIAR'}</button></div></Modal>}
  </main>;
}
