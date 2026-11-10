import test from 'node:test';import assert from 'node:assert/strict';
import { createStadiumGame, answerStadiumGame, nextStadiumRound, restoreStadiumGame, readStadiumSave, writeStadiumSave, readStadiumRecord, saveStadiumRecord, stadiumPrompt } from '../src/lib/stadium-game.js';
const venues=Array.from({length:12},(_,i)=>({id:`test-${i}`,name:`Ground ${i}`,club:'Hidden Club',city:'Hidden City',country:'Hidden Country',countryId:'620',coordinates:[-9+i/100,38.7]}));
const storage=()=>{const s=new Map();return{getItem:k=>s.get(k)||null,setItem:(k,v)=>s.set(k,v),removeItem:k=>s.delete(k)}};
test('stadium runs have exactly ten unique shuffled venues and the prompt exposes only the name',()=>{
 const game=createStadiumGame(venues,()=>.2);assert.equal(game.queue.length,10);assert.equal(new Set(game.queue).size,10);assert.ok(game.queue.every(id=>venues.some(s=>s.id===id)));
 assert.equal(stadiumPrompt(venues[0]),'Ground 0');assert.throws(()=>createStadiumGame(venues.slice(0,9)));
 assert.strictEqual(nextStadiumRound(game),game);
});
test('pins score by distance, cap wrong-country guesses consistently and cannot score twice',()=>{
 let game=createStadiumGame(venues);const target=venues.find(s=>s.id===game.queue[0]);
 assert.strictEqual(answerStadiumGame(game,venues,[Infinity,0]),game);assert.strictEqual(answerStadiumGame(game,venues,[200,0]),game);
 const exact=answerStadiumGame(game,venues,target.coordinates,target.countryId);assert.equal(exact.score,100);assert.equal(exact.answers[0].distance,0);assert.equal(exact.answers[0].correct,true);
 assert.strictEqual(answerStadiumGame(exact,venues,target.coordinates,target.countryId),exact);
 const near=answerStadiumGame(game,venues,[target.coordinates[0]+.2,target.coordinates[1]],target.countryId);
 const far=answerStadiumGame(game,venues,[target.coordinates[0]+2,target.coordinates[1]],target.countryId);
 assert.ok(near.score>far.score);assert.ok(near.score<100);assert.equal(near.answers[0].correct,false);
 assert.equal(answerStadiumGame(game,venues,target.coordinates,'724').score,25);
 assert.equal(answerStadiumGame(game,venues,null,null,{skipped:true}).score,0);
});
test('ten confirmations followed by explicit next actions reach results and persist a best score',()=>{
 let game=createStadiumGame(venues),s=storage();for(let i=0;i<10;i++){
  const target=venues.find(v=>v.id===game.queue[i]);game=answerStadiumGame(game,venues,target.coordinates,target.countryId);assert.equal(game.finished,false);game=nextStadiumRound(game);
 }
 assert.equal(game.finished,true);assert.equal(game.score,1000);assert.strictEqual(nextStadiumRound(game),game);
 assert.equal(saveStadiumRecord(game,s),true);assert.equal(readStadiumRecord(s),1000);
 saveStadiumRecord({...game,score:100},s);assert.equal(readStadiumRecord(s),1000);
 writeStadiumSave(game,s);assert.equal(readStadiumSave(s),null);
});
test('resume replays coordinates, preserves feedback and ignores forged scores without mixing saves',()=>{
 let game=createStadiumGame(venues),s=storage();const target=venues.find(v=>v.id===game.queue[0]);game=answerStadiumGame(game,venues,target.coordinates,target.countryId);
 writeStadiumSave(game,s);let resumed=restoreStadiumGame({...readStadiumSave(s),score:999,answers:game.answers.map(a=>({...a,points:999}))},venues);
 assert.equal(resumed.score,100);assert.equal(resumed.answers[0].points,100);assert.equal(resumed.index,0);
 resumed=nextStadiumRound(resumed);writeStadiumSave(resumed,s);assert.equal(restoreStadiumGame(readStadiumSave(s),venues).index,1);
 assert.equal(restoreStadiumGame({...game,queue:Array(10).fill(game.queue[0])},venues),null);
 assert.equal(restoreStadiumGame({...game,queue:['missing',...game.queue.slice(1)]},venues),null);
 assert.equal(restoreStadiumGame({...game,index:5},venues),null);
 assert.equal(readStadiumSave({getItem(){throw Error('blocked')}}),null);
 assert.equal(writeStadiumSave(game,{setItem(){throw Error('blocked')}}),false);
});

test('the shipped catalogue contains distinct European top-flight venues with season and coordinate provenance',async()=>{
 const {stadiums}=await import('../src/data/stadiums.js');const {default:countries}=await import('../src/data/countries.json',{with:{type:'json'}});
 assert.ok(stadiums.length>=60);assert.equal(new Set(stadiums.map(s=>s.id)).size,stadiums.length);
 assert.equal(new Set(stadiums.map(s=>s.league)).size,6);
 for(const s of stadiums){
  assert.ok(s.name&&s.club&&s.city&&s.country,s.id);assert.equal(s.leagueSeason,'2026/27');assert.equal(s.checkedAt,'2026-11-10');
  assert.ok(countries.some(c=>c.id===s.countryId&&c.continente==='europa'),s.id);
  assert.equal(s.coordinates.length,2);assert.ok(s.coordinates.every(Number.isFinite));assert.ok(s.coordinates[0]>-30&&s.coordinates[0]<40&&s.coordinates[1]>30&&s.coordinates[1]<65,s.id);
  for(const key of ['membershipSource','venueSource','coordinateSource'])assert.ok(s[key]?.title&&s[key].url.startsWith('https://'),`${s.id}:${key}`);
  assert.equal(stadiumPrompt(s),s.name);
 }
 const {capitalDistance}=await import('../src/lib/extra-game.js');
 for(let i=0;i<stadiums.length;i++)for(let j=i+1;j<stadiums.length;j++)assert.ok(capitalDistance(stadiums[i].coordinates,stadiums[j].coordinates)>.1,`Shared venue duplicated: ${stadiums[i].name}`);
 const luz=stadiums.find(s=>s.name==='Estádio da Luz');assert.ok(capitalDistance(luz.coordinates,[-9.1847,38.7528])<.1);
});
