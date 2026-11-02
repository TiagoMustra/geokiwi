import test from 'node:test';
import assert from 'node:assert/strict';
import countries from '../src/data/countries.json' with {type:'json'};
import {countryClues,countryClueById} from '../src/data/country-clues.js';
import {createCountryClueGame,answerCountryClue,nextCountryClue,evaluateCountryClue,readCountryClueSave,writeCountryClueSave,readCountryClueRecord,saveCountryClueRecord,clueFeedbackDuration,COUNTRY_CLUE_SAVE_KEY} from '../src/lib/country-clues-game.js';
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)};};
const name=id=>countries.find(c=>c.id===id).nome_en;

test('country riddles have bilingual explanations, primary links and valid country answers',()=>{
 assert.ok(countryClues.length>=70);assert.equal(new Set(countryClues.map(x=>x.id)).size,countryClues.length);
 for(const item of countryClues){for(const field of ['pt','en','explanation_pt','explanation_en'])assert.ok(typeof item[field]==='string'&&item[field].length>15,`${item.id}: ${field}`);assert.ok(item.countryIds.length>0);assert.equal(new Set(item.countryIds).size,item.countryIds.length);assert.ok(/^https:\/\//.test(item.source.url));assert.ok(item.source.title);for(const id of item.countryIds)assert.ok(countries.some(c=>c.id===id&&c.isCountry),`${item.id}:${id}`);}
});
test('shared geographical clues accept all their countries and unrelated guesses remain wrong',()=>{
 for(const id of ['everest-partilhado','caspio-partilhado','vitoria-partilhada','ohrid-partilhado','duplamente-encravado']){
  const clue=countryClueById[id];assert.ok(clue.countryIds.length>1);
  for(const countryId of clue.countryIds){const result=evaluateCountryClue(clue,name(countryId));assert.equal(result.correct,true,`${id}:${countryId}`);assert.equal(result.chosenId,countryId);}
  assert.equal(evaluateCountryClue(clue,'Portugal').correct,false);
 }
});
test('short runs mix clue categories, avoid repeated answer sets and visit each selected question once',()=>{
 for(const rounds of [10,20,30]){
  const game=createCountryClueGame({rounds});assert.equal(game.queue.length,rounds);assert.equal(new Set(game.queue).size,rounds);
  assert.equal(new Set(game.queue.map(id=>countryClueById[id].countryIds.join(','))).size,rounds);
  assert.ok(new Set(game.queue.map(id=>countryClueById[id].category)).size>=3);
 }
});
test('a single locked answer or skip scores once, reveals the answer and completes the run',()=>{
 let game=createCountryClueGame({rounds:10});assert.equal(nextCountryClue(game),game);assert.equal(answerCountryClue(game,'  '),game);
 for(let index=0;index<game.queue.length;index++){
  const clue=countryClueById[game.queue[index]],before=game;
  game=answerCountryClue(game,index===0?'':name(clue.countryIds[0]),{skipped:index===0});
  assert.equal(game.score,index*100);assert.equal(answerCountryClue(game,'Portugal'),game);
  assert.equal(game.answers[index].clueId,clue.id);assert.equal(game.answers[index].skipped,index===0);
  game=nextCountryClue(game);assert.equal(before.queue,game.queue);
 }
 assert.equal(game.finished,true);assert.equal(game.score,900);assert.equal(nextCountryClue(game),game);
 assert.ok(clueFeedbackDuration({correct:false})>=5000);
});
test('saved runs resume identical questions and verified scores; rounds and practice records stay separate',()=>{
 const storage=memory();let game=createCountryClueGame({rounds:10});const clue=countryClueById[game.queue[0]];
 game=answerCountryClue(game,name(clue.countryIds[0]));assert.equal(writeCountryClueSave(game,storage),true);
 const restored=readCountryClueSave(10,storage);assert.deepEqual(restored.queue,game.queue);assert.deepEqual(restored.answers,game.answers);assert.equal(restored.score,100);assert.equal(restored.index,0);
 const other=createCountryClueGame({rounds:20});writeCountryClueSave(other,storage);assert.equal(readCountryClueSave(20,storage).queue.length,20);assert.equal(readCountryClueSave(10,storage).queue.length,10);
 const forged=JSON.parse(storage.getItem(COUNTRY_CLUE_SAVE_KEY));forged[10].score=99999;forged[10].answers[0].correct=false;storage.setItem(COUNTRY_CLUE_SAVE_KEY,JSON.stringify(forged));assert.equal(readCountryClueSave(10,storage).score,100);
 const practice=createCountryClueGame({rounds:10,pool:[countryClues[0],countryClues[1]],practice:true});assert.equal(practice.queue.length,2);writeCountryClueSave(practice,storage);assert.equal(readCountryClueSave(10,storage).practice,true);
 assert.equal(saveCountryClueRecord({...practice,finished:true,score:200},storage),false);assert.equal(readCountryClueRecord(10,storage),0);
 assert.equal(saveCountryClueRecord({...game,finished:true,score:900},storage),true);assert.equal(readCountryClueRecord(10,storage),900);assert.equal(readCountryClueRecord(20,storage),0);
 writeCountryClueSave({...game,finished:true},storage);assert.equal(readCountryClueSave(10,storage),null);assert.ok(readCountryClueSave(20,storage));
});
test('corrupt and blocked storage are safe and unknown question IDs cannot resume',()=>{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.equal(readCountryClueSave(10,blocked),null);assert.equal(readCountryClueRecord(10,blocked),0);assert.equal(writeCountryClueSave(createCountryClueGame(),blocked),false);
 const storage=memory();storage.setItem(COUNTRY_CLUE_SAVE_KEY,'broken');assert.equal(readCountryClueSave(10,storage),null);
 const game=createCountryClueGame();writeCountryClueSave(game,storage);const value=JSON.parse(storage.getItem(COUNTRY_CLUE_SAVE_KEY));value[10].queue[0]='unknown';storage.setItem(COUNTRY_CLUE_SAVE_KEY,JSON.stringify(value));assert.equal(readCountryClueSave(10,storage),null);
});
