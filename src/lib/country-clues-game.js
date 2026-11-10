import { getGameStorage } from '../auth/game-storage.js';
import countries from '../data/countries.json' with {type:'json'};
import { countryClues, countryClueById } from '../data/country-clues.js';
import { makeQueue, normalizeAnswer } from './game.js';
export const COUNTRY_CLUE_ROUNDS = [10,20,30];
export const COUNTRY_CLUE_SAVE_KEY = 'geokiwi.country-clues.v1';
export const COUNTRY_CLUE_RECORD_KEY = 'geokiwi.country-clues.records.v1';
const safeRounds = rounds => COUNTRY_CLUE_ROUNDS.includes(Number(rounds)) ? Number(rounds) : 10;
const dict = value => value && typeof value==='object' && !Array.isArray(value);
const storageRead = (key, storage) => {
  try {const value=JSON.parse((storage??getGameStorage()).getItem(key)||'{}');return dict(value)?value:{};}
  catch {return {};}
};
const storageWrite = (key,value,storage) => {
  try{(storage??getGameStorage()).setItem(key,JSON.stringify(value));return true;}catch{return false;}
};
export function createCountryClueGame({rounds=10,pool=countryClues,random=Math.random,practice=false}={}) {
 const size=safeRounds(rounds);
 const unique=[...new Map(pool.filter(clue=>countryClueById[clue.id]).map(clue=>[clue.id,clue])).values()];
 // A normal run first takes different answer sets, then fills if a future pool is small.
 const shuffled=makeQueue(unique,1,random);
 const seen=new Set(), selected=[];
 if(practice) selected.push(...shuffled);
 else {
  const categories=makeQueue([...new Set(shuffled.map(clue=>clue.category))],1,random);
  while(selected.length<size) {
   let added=false;
   for(const category of categories) {
    if(selected.length>=size)break;
    const clue=shuffled.find(item=>item.category===category&&!selected.includes(item)&&!seen.has([...item.countryIds].sort().join(',')));
    if(!clue)continue;
    selected.push(clue);seen.add([...clue.countryIds].sort().join(','));added=true;
   }
   if(!added)break;
  }
  selected.push(...shuffled.filter(clue=>!selected.includes(clue)).slice(0,size-selected.length));
 }
 return {version:1,id:globalThis.crypto?.randomUUID?.()||`clues-${Date.now()}-${Math.random()}`,startedAt:Date.now(),rounds:size,practice,queue:selected.map(clue=>clue.id),index:0,answers:[],score:0,finished:false};
}
/** All aliases for any accepted country are valid; shared clues are not single-answer traps. */
export function evaluateCountryClue(clue,value,{skipped=false}={}) {
 const normalized=normalizeAnswer(typeof value==='string'?value:'');
 const matches=!skipped&&normalized?countries.filter(country=>[country.nome_pt,country.nome_en,...country.aliases].some(alias=>normalizeAnswer(alias)===normalized)):[];
 const correctCountry=matches.find(country=>clue.countryIds.includes(country.id));
 return {clueId:clue.id,value:skipped?'':String(value??'').slice(0,200),chosenId:correctCountry?.id||matches[0]?.id||null,correct:Boolean(correctCountry),skipped:Boolean(skipped)};
}
export function answerCountryClue(game,value,{skipped=false}={}) {
 if(game.finished||game.answers.length>game.index||(!skipped&&(!value||!String(value).trim())))return game;
 const clue=countryClueById[game.queue[game.index]];
 if(!clue)return game;
 const answer=evaluateCountryClue(clue,value,{skipped});
 return {...game,answers:[...game.answers,answer],score:game.score+(answer.correct?100:0)};
}
export function nextCountryClue(game) {
 if(game.finished||game.answers.length<=game.index)return game;
 return game.index+1>=game.queue.length?{...game,finished:true}:{...game,index:game.index+1};
}
export function clearCountryClueSave(rounds=10,storage) {
 const value=storageRead(COUNTRY_CLUE_SAVE_KEY,storage);delete value[safeRounds(rounds)];return storageWrite(COUNTRY_CLUE_SAVE_KEY,value,storage);
}
export function writeCountryClueSave(game,storage) {
 if(game.finished)return clearCountryClueSave(game.rounds,storage);
 const value=storageRead(COUNTRY_CLUE_SAVE_KEY,storage);value[safeRounds(game.rounds)]={...game,updatedAt:Date.now()};return storageWrite(COUNTRY_CLUE_SAVE_KEY,value,storage);
}
export function readCountryClueSave(rounds=10,storage) {
 const selected=safeRounds(rounds),saved=storageRead(COUNTRY_CLUE_SAVE_KEY,storage)[selected];
 if(!dict(saved)||saved.version!==1||saved.rounds!==selected||saved.finished||!Array.isArray(saved.queue)||!saved.queue.length||saved.queue.length>selected||new Set(saved.queue).size!==saved.queue.length||!saved.queue.every(id=>typeof id==='string'&&countryClueById[id])||!Array.isArray(saved.answers)||!Number.isInteger(saved.index)||saved.index<0||saved.index>=saved.queue.length||![saved.index,saved.index+1].includes(saved.answers.length)||(!saved.practice&&saved.queue.length!==selected))return null;
 let game={...saved,score:0,answers:[],index:0,finished:false,practice:saved.practice===true};
 for(let index=0;index<saved.answers.length;index++) {
  const answer=saved.answers[index];
  if(!dict(answer)||answer.clueId!==saved.queue[index]||typeof answer.value!=='string'||answer.value.length>200||(!answer.skipped&&!answer.value.trim()))return null;
  game=answerCountryClue({...game,index},answer.value,{skipped:answer.skipped===true});
 }
 return {...game,index:saved.index};
}
export function readCountryClueRecord(rounds=10,storage) {
 const selected=safeRounds(rounds),score=storageRead(COUNTRY_CLUE_RECORD_KEY,storage)[selected];
 return Number.isInteger(score)&&score>=0&&score<=selected*100&&score%100===0?score:0;
}
export function saveCountryClueRecord(game,storage) {
 if(!game.finished||game.practice)return false;
 const records=storageRead(COUNTRY_CLUE_RECORD_KEY,storage);
 records[safeRounds(game.rounds)]=Math.max(readCountryClueRecord(game.rounds,storage),game.score);
 return storageWrite(COUNTRY_CLUE_RECORD_KEY,records,storage);
}
export const clueFeedbackDuration = answer => answer.correct?1000:2000;
