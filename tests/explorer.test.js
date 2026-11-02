import test from 'node:test';
import assert from 'node:assert/strict';
import { geoArea, geoContains } from 'd3';
import { explorationPlaces } from '../src/data/exploration-places.js';
import { advanceExplorerGame, answerExplorerGame, clearExplorerSave, createExplorerGame, nearestExplorerPlace, nearestExplorerSegment, normalizeExplorerGeometry, readExplorerRecord, readExplorerSave, restoreExplorerGame, saveExplorerRecord, scoreExplorerGuess, skipExplorerGame, writeExplorerSave } from '../src/lib/explorer-game.js';
const memory=()=>{const values=new Map();return{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
const fakePlaces=Array.from({length:60},(_,i)=>({id:`place-${i}`,coordinates:[i,0],type:'city',countryIds:['001']}));
const rectangle={type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]],[[3,3],[3,7],[7,7],[7,3],[3,3]]]};

test('exploration catalog includes all requested types and finite geographic targets without missing shape data',()=>{
 assert.ok(explorationPlaces.length>=80);assert.equal(new Set(explorationPlaces.map(p=>p.id)).size,explorationPlaces.length);
 for(const type of ['city','peak','historic','lake','sea','bay','desert','mountain','river'])assert.ok(explorationPlaces.some(p=>p.type===type),type);
 for(const place of explorationPlaces){assert.ok(place.name_pt&&place.name_en&&place.description_pt&&place.description_en);assert.ok(place.source.url.startsWith('https://'));assert.ok(place.coordinates.every(Number.isFinite));assert.ok(Math.abs(place.coordinates[0])<=180&&Math.abs(place.coordinates[1])<=90);if(!['city','peak','historic'].includes(place.type))assert.ok(place.geometry,place.id);const closest=nearestExplorerPlace(place.coordinates,place);assert.ok(closest&&Number.isFinite(closest.distance),place.id);}
});
test('area scoring accepts any part of a small polygon, preserves its holes and does not mutate source winding',()=>{
 const original=JSON.stringify(rectangle),geometry=normalizeExplorerGeometry(rectangle);assert.ok(geoArea(geometry)<Math.PI*2);assert.ok(geoContains(geometry,[1,1]));assert.ok(!geoContains(geometry,[5,5]));
 const place={coordinates:[1,1],geometry:rectangle,type:'lake',countryIds:[]};assert.equal(nearestExplorerPlace([9,9],place).distance,0);assert.ok(nearestExplorerPlace([5,5],place).distance>200);assert.equal(scoreExplorerGuess([9,9],null,place).points,100);assert.equal(JSON.stringify(rectangle),original);
});
test('nearest river distance follows the entire spherical segment, handles endpoints and the antimeridian',()=>{
 let result=nearestExplorerSegment([5,2],[0,0],[10,0]);assert.ok(Math.abs(result.distance-222.39)<1);assert.ok(Math.abs(result.coordinates[0]-5)<1e-6);assert.ok(Math.abs(result.coordinates[1])<1e-6);
 result=nearestExplorerSegment([20,0],[0,0],[10,0]);assert.ok(Math.abs(result.coordinates[0]-10)<1e-6);
 result=nearestExplorerSegment([180,3],[170,0],[-170,0]);assert.ok(Math.abs(Math.abs(result.coordinates[0])-180)<1e-6);assert.ok(Math.abs(result.distance-333.59)<1);
 const river={coordinates:[0,0],type:'river',geometry:{type:'MultiLineString',coordinates:[[[0,0],[10,0]],[[40,0],[60,0]]]},toleranceKm:15};assert.equal(scoreExplorerGuess([55,.1],null,river).points,100);assert.ok(nearestExplorerPlace([55,.1],river).distance<12);
});
test('explorer points use the capital scale, cap wrong-country point guesses and never penalize natural cross-border areas',()=>{
 const city={coordinates:[0,0],type:'city',countryIds:['001']};assert.equal(scoreExplorerGuess([0,0],'001',city).points,100);assert.equal(scoreExplorerGuess([0,0],'002',city).points,25);assert.equal(scoreExplorerGuess([0,0],null,city).points,100);assert.ok(scoreExplorerGuess([1,0],'001',city).points>scoreExplorerGuess([10,0],'001',city).points);assert.equal(scoreExplorerGuess([0,0],'002',{...city,type:'sea'}).points,100);
});
test('10, 20 and 30 round runs visit distinct targets, retain prior answers and lock duplicate submissions',()=>{
 for(const rounds of [10,20,30]){let game=createExplorerGame({places:fakePlaces,rounds,random:()=>.4});assert.equal(game.queue.length,rounds);assert.equal(new Set(game.queue).size,rounds);assert.strictEqual(advanceExplorerGame(game),game);const first=fakePlaces.find(p=>p.id===game.queue[0]);game=answerExplorerGame(game,first.coordinates,'001',fakePlaces);assert.equal(game.score,100);assert.strictEqual(answerExplorerGame(game,[50,0],null,fakePlaces),game);game=advanceExplorerGame(game);assert.equal(game.index,1);assert.equal(game.answers.length,1);while(!game.finished)game=advanceExplorerGame(skipExplorerGame(game,fakePlaces));assert.equal(game.answers.length,rounds);assert.equal(game.score,100);}
});
test('explorer saves and records are separate by round count; restore recalculates points and rejects corrupted queues',()=>{
 const storage=memory();let game=createExplorerGame({places:fakePlaces,rounds:10});game=answerExplorerGame(game,fakePlaces.find(p=>p.id===game.queue[0]).coordinates,'001',fakePlaces);assert.ok(writeExplorerSave(game,storage));const saved=readExplorerSave(10,storage);assert.equal(readExplorerSave(20,storage),null);saved.score=99999;saved.answers[0].points=999;const restored=restoreExplorerGame(saved,fakePlaces,10);assert.equal(restored.score,100);assert.equal(restored.answers[0].points,100);assert.deepEqual(restored.queue,game.queue);assert.equal(restoreExplorerGame({...saved,queue:['unknown',...saved.queue.slice(1)]},fakePlaces,10),null);assert.equal(restoreExplorerGame({...saved,answers:[{...saved.answers[0],guess:[Infinity,0]}]},fakePlaces,10),null);saveExplorerRecord(10,500,storage);saveExplorerRecord(20,1100,storage);saveExplorerRecord(10,200,storage);assert.equal(readExplorerRecord(10,storage),500);assert.equal(readExplorerRecord(20,storage),1100);clearExplorerSave(10,storage);assert.equal(readExplorerSave(10,storage),null);
 const practice=createExplorerGame({places:fakePlaces,rounds:20,ids:['place-2','place-9'],practice:true});assert.equal(practice.queue.length,2);assert.ok(restoreExplorerGame(practice,fakePlaces,20));
});
