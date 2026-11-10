import { makeQueue } from './game.js';
import { capitalDistance, capitalPoints } from './extra-game.js';

export const STADIUM_ROUNDS=10;
export const STADIUM_SAVE_KEY='geokiwi.stadium.run.v1';
export const STADIUM_RECORD_KEY='geokiwi.stadium.record.v1';
const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
export const stadiumPrompt=stadium=>stadium.name;
export function createStadiumGame(stadiums,random=Math.random){
 const ids=[...new Set(stadiums.map(s=>s.id))];
 if(ids.length<STADIUM_ROUNDS)throw Error('At least 10 verified stadiums are required.');
 return {version:1,id:globalThis.crypto.randomUUID(),startedAt:Date.now(),queue:makeQueue(ids,10,random).slice(0,STADIUM_ROUNDS),index:0,answers:[],score:0,finished:false};
}
export function answerStadiumGame(game,stadiums,guess,countryId=null,{skipped=false}={}){
 if(game.finished||game.answers[game.index])return game;
 const stadium=stadiums.find(s=>s.id===game.queue[game.index]);
 if(!stadium||!skipped&&!point(guess))return game;
 const distance=skipped?null:capitalDistance(guess,stadium.coordinates);
 const inCountry=!skipped&&(countryId===stadium.countryId||(countryId===null&&distance<=5));
 const answer={id:stadium.id,guess:skipped?null:[...guess],countryId:skipped?null:countryId,skipped,distance,points:skipped?0:capitalPoints(distance,inCountry),correct:!skipped&&inCountry&&distance<=1,inCountry};
 return {...game,answers:[...game.answers,answer],score:game.score+answer.points};
}
export function nextStadiumRound(game){
 if(game.finished||!game.answers[game.index])return game;
 return game.index+1===STADIUM_ROUNDS?{...game,finished:true}:{...game,index:game.index+1};
}
export function restoreStadiumGame(saved,stadiums){
 if(!saved||saved.version!==1||typeof saved.id!=='string'||saved.id.length>100||!Number.isFinite(saved.startedAt)||saved.finished||!Array.isArray(saved.queue)||saved.queue.length!==STADIUM_ROUNDS||new Set(saved.queue).size!==STADIUM_ROUNDS||!saved.queue.every(id=>stadiums.some(s=>s.id===id))||!Number.isInteger(saved.index)||saved.index<0||saved.index>=STADIUM_ROUNDS||!Array.isArray(saved.answers)||![saved.index,saved.index+1].includes(saved.answers.length))return null;
 let game={version:1,id:saved.id,startedAt:saved.startedAt,queue:[...saved.queue],index:0,answers:[],score:0,finished:false};
 for(const [i,answer] of saved.answers.entries()){
  if(!answer||answer.id!==game.queue[i]||typeof answer.skipped!=='boolean'||!(answer.countryId===null||typeof answer.countryId==='string'))return null;
  if(i>game.index)game=nextStadiumRound(game);
  const next=answerStadiumGame(game,stadiums,answer.guess,answer.countryId,{skipped:answer.skipped});
  if(next===game)return null;game=next;
 }
 if(saved.index>game.index)game=nextStadiumRound(game);
 return game.index===saved.index&&!game.finished?game:null;
}
export function readStadiumSave(storage){try{return JSON.parse((storage??globalThis.localStorage).getItem(STADIUM_SAVE_KEY)||'null');}catch{return null;}}
export function writeStadiumSave(game,storage){try{const s=storage??globalThis.localStorage;if(game.finished)s.removeItem(STADIUM_SAVE_KEY);else s.setItem(STADIUM_SAVE_KEY,JSON.stringify(game));return true;}catch{return false;}}
export function readStadiumRecord(storage){try{const n=Number((storage??globalThis.localStorage).getItem(STADIUM_RECORD_KEY));return Number.isInteger(n)&&n>=0&&n<=1000?n:0;}catch{return 0;}}
export function saveStadiumRecord(game,storage){if(!game.finished)return false;try{(storage??globalThis.localStorage).setItem(STADIUM_RECORD_KEY,String(Math.max(readStadiumRecord(storage),game.score)));return true;}catch{return false;}}
