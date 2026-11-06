import { quizQuestionById, quizQuestions, getQuizPool } from './questions.js';
import { createQuiz, submitQuiz, nextQuiz, validDifficulty, DIFFICULTIES, QUIZ_SCORING_VERSION } from './engine.js';
import { readCountryClueSave, clearCountryClueSave } from '../lib/country-clues-game.js';

export const QUIZ_SAVE_KEY='geokiwi.geoguru.saves.v2';
export const QUIZ_RECORD_KEY='geokiwi.geoguru.records.v2';
export const QUIZ_HISTORY_KEY='geokiwi.geoguru.history.v1';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const safeRounds=n=>[10,20,30].includes(n)?n:10;
const slot=(rounds,difficulty)=>`${safeRounds(rounds)}:${validDifficulty(difficulty)}`;
function read(key,storage){try{const v=JSON.parse((storage??globalThis.localStorage).getItem(key)||'{}');return object(v)?v:{};}catch{return {};}}
function write(key,value,storage){try{(storage??globalThis.localStorage).setItem(key,JSON.stringify(value));return true;}catch{return false;}}

export function readQuizHistory(storage){
  const value=read(QUIZ_HISTORY_KEY,storage);
  let ids=value.version===1&&Array.isArray(value.questionIds)?value.questionIds:[];
  if(!ids.length){
    // Preserve knowledge of displayed questions when upgrading pre-history saves.
    ids=Object.values(read(QUIZ_SAVE_KEY,storage)).flatMap(saved=>Array.isArray(saved?.queue)&&Number.isInteger(saved.index)
      ?saved.queue.slice(0,Math.max(0,Math.min(saved.index+1,saved.queue.length))):[]);
  }
  return [...new Set(ids.filter(id=>typeof id==='string'&&Object.hasOwn(quizQuestionById,id)))].slice(-quizQuestions.length);
}
export function rememberQuizQuestion(id,storage){
  if(!Object.hasOwn(quizQuestionById,id))return false;
  const questionIds=[...readQuizHistory(storage).filter(old=>old!==id),id].slice(-quizQuestions.length);
  return write(QUIZ_HISTORY_KEY,{version:1,questionIds},storage);
}
export function createNewQuiz(options={},storage){
  const recentQuestionIds=readQuizHistory(storage);
  // Preserve imported pre-history knowledge before a fresh run replaces its old save.
  if(recentQuestionIds.length)write(QUIZ_HISTORY_KEY,{version:1,questionIds:recentQuestionIds},storage);
  return createQuiz({bank:getQuizPool(options.locale),...options,recentQuestionIds});
}

/** Replay accepted submissions against trusted answers; persisted scores are never trusted. */
export function restoreQuiz(saved,bank=quizQuestionById){
  if(!object(saved)||saved.version!==2||typeof saved.id!=='string'||saved.id.length>100||!Number.isFinite(saved.startedAt)
    ||!DIFFICULTIES.includes(saved.difficulty)||![10,20,30].includes(saved.rounds)||saved.finished
    ||!Array.isArray(saved.queue)||!saved.queue.length||saved.queue.length>saved.rounds||new Set(saved.queue).size!==saved.queue.length
    ||!saved.queue.every(id=>typeof id==='string'&&Object.hasOwn(bank,id)&&Number.isInteger(saved.revisions?.[id])&&bank[id].revision===saved.revisions[id])
    ||!Array.isArray(saved.events)||saved.events.length>5000||!Number.isInteger(saved.index)||saved.index<0||saved.index>=saved.queue.length)return null;
  let game={...saved,scoringVersion:QUIZ_SCORING_VERSION,practice:saved.practice===true,index:0,score:0,answers:[],foundIds:[],events:[],notice:null,finished:false};
  for(const event of saved.events){
    if(!object(event)||!Number.isInteger(event.index)||!['pt','en'].includes(event.locale)||typeof event.skipped!=='boolean')return null;
    if(event.index===game.index+1&&game.answers[game.index])game=nextQuiz(game);
    if(game.finished||event.index!==game.index||game.answers[game.index])return null;
    const next=submitQuiz(game,bank,event.value,{skipped:event.skipped,locale:event.locale});
    if(next.events.length!==game.events.length+1)return null;
    game=next;
  }
  if(saved.index===game.index+1&&game.answers[game.index])game=nextQuiz(game);
  return !game.finished&&saved.index===game.index?game:null;
}
export function writeQuizSave(game,storage){
  const saves=read(QUIZ_SAVE_KEY,storage),key=slot(game.rounds,game.difficulty);
  if(game.finished){if(saves[key]?.id===game.id)delete saves[key];}
  else saves[key]={version:2,scoringVersion:QUIZ_SCORING_VERSION,id:game.id,startedAt:game.startedAt,updatedAt:Date.now(),rounds:game.rounds,difficulty:game.difficulty,practice:game.practice,queue:game.queue,revisions:game.revisions,index:game.index,events:game.events,finished:false};
  return write(QUIZ_SAVE_KEY,saves,storage);
}
export function readQuizSave(rounds=10,difficulty='EASY',storage){
  const saved=read(QUIZ_SAVE_KEY,storage)[slot(rounds,difficulty)];
  if(saved){const restored=restoreQuiz(saved);return restored&&restored.rounds===rounds&&restored.difficulty===difficulty?restored:null;}
  // Legacy runs remain single-text runs at Easy, with their original queue and progress.
  if(difficulty!=='EASY')return null;
  const legacy=readCountryClueSave(rounds,storage);if(!legacy)return null;
  let game={...createQuiz({bank:quizQuestions,rounds,difficulty}),id:legacy.id,startedAt:legacy.startedAt,practice:legacy.practice,queue:legacy.queue,revisions:Object.fromEntries(legacy.queue.map(id=>[id,quizQuestionById[id].revision]))};
  for(let i=0;i<legacy.answers.length;i++){
    if(i>game.index)game=nextQuiz(game);
    const a=legacy.answers[i];game=submitQuiz(game,quizQuestionById,a.value,{skipped:a.skipped,locale:'pt'});
  }
  if(legacy.index>game.index)game=nextQuiz(game);
  return {...game,updatedAt:legacy.updatedAt};
}
/** Migration commits only after the new save has been written successfully. */
export function checkpointQuiz(game,storage){
  const ok=writeQuizSave(game,storage);
  if(ok&&game.difficulty==='EASY'){
    const legacy=readCountryClueSave(game.rounds,storage);
    if(legacy?.id===game.id)clearCountryClueSave(game.rounds,storage);
  }
  return ok;
}
export function readQuizRecord(rounds=10,difficulty='EASY',storage){
  const n=read(QUIZ_RECORD_KEY,storage)[slot(rounds,difficulty)];
  return Number.isInteger(n)&&n>=0&&n<=safeRounds(rounds)*100?n:0;
}
export function saveQuizRecord(game,storage){
  if(!game.finished||game.practice)return false;
  const records=read(QUIZ_RECORD_KEY,storage);records[slot(game.rounds,game.difficulty)]=Math.max(readQuizRecord(game.rounds,game.difficulty,storage),game.score);
  return write(QUIZ_RECORD_KEY,records,storage);
}
