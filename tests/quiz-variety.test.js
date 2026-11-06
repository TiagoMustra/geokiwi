import test from 'node:test';
import assert from 'node:assert/strict';
import countries from '../src/data/countries.json' with {type:'json'};
import { explorationPlaces } from '../src/data/exploration-places.js';
import { quizQuestions, quizQuestionById as bank } from '../src/quiz/questions.js';
import { geographyExpansion, borderQuestions, distanceQuestions, pinpointQuestions } from '../src/quiz/geography-expansion.js';
import { createQuiz, distanceKm, validateQuestion } from '../src/quiz/engine.js';
import { selectQuizQuestions } from '../src/quiz/selection.js';
import { createNewQuiz, readQuizHistory, rememberQuizQuestion, checkpointQuiz, QUIZ_HISTORY_KEY } from '../src/quiz/storage.js';

const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};};
const seeded=initial=>{let n=initial;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};

test('the expanded bank has substantial coverage of every interaction, original prompts and mapped countries',()=>{
  assert.ok(quizQuestions.length>=300);
  assert.equal(new Set(quizQuestions.map(q=>q.id)).size,quizQuestions.length);
  assert.equal(new Set(quizQuestions.map(q=>q.prompt.pt)).size,quizQuestions.length);
  assert.equal(new Set(quizQuestions.map(q=>q.prompt.en)).size,quizQuestions.length);
  for(const type of ['TRUE_FALSE','NUMBER_EXACT','TEXT_MULTIPLE','SLIDER_TIMELINE','SLIDER_DISTANCE','MAP_PINPOINT'])assert.ok(quizQuestions.filter(q=>q.inputType===type).length>=30,type);
  const known=new Set(countries.filter(c=>c.isCountry).map(c=>c.id));
  for(const q of quizQuestions){assert.deepEqual(validateQuestion(q),[],q.id);assert.ok((q.countryIds||[]).every(id=>known.has(id)),q.id);}
});
test('Berlin asks about the fall, preserving existing question IDs and 1989 answers',()=>{
  assert.match(bank['timeline-berlin'].prompt.pt,/caiu o Muro de Berlim/);
  assert.match(bank['timeline-berlin'].prompt.en,/Berlin Wall fall/);
  assert.equal(bank['timeline-berlin'].answer.year,1989);
  assert.match(bank['tf-berlin-1991'].prompt.pt,/caiu em 1991/);
  assert.equal(bank['tf-berlin-1991'].answer.value,false);
});
test('a small exhausted pin pool never forces a repeat while new text questions remain',()=>{
  const pin=bank['pinpoint-everest'];
  const texts=quizQuestions.filter(q=>q.inputType==='TEXT_SINGLE').slice(0,30);
  const game=createQuiz({bank:[pin,...texts],recentQuestionIds:[pin.id],random:seeded(1)});
  assert.equal(game.queue.length,10);assert.ok(!game.queue.includes(pin.id));
  assert.ok(game.queue.every(id=>texts.some(q=>q.id===id)));
});
test('new runs avoid every displayed question until new questions are exhausted, then recycle older ones',()=>{
  const random=seeded(42),seen=[];
  for(let run=0;run<Math.floor(quizQuestions.length/10);run++){
    const game=createQuiz({bank:quizQuestions,rounds:10,recentQuestionIds:seen,random});
    assert.equal(game.queue.length,10);assert.ok(game.queue.every(id=>!seen.includes(id)),`run ${run}`);
    seen.push(...game.queue);
  }
  const remaining=quizQuestions.filter(q=>!seen.includes(q.id)).map(q=>q.id);
  const overflow=createQuiz({bank:quizQuestions,rounds:10,recentQuestionIds:seen,random});
  assert.ok(remaining.every(id=>overflow.queue.includes(id)));
  assert.equal(new Set(overflow.queue).size,10);
  const singleType=quizQuestions.filter(q=>q.inputType==='TEXT_SINGLE').slice(0,25);
  const recycled=selectQuizQuestions(singleType,{limit:10,recentQuestionIds:singleType.map(q=>q.id),random});
  assert.deepEqual(recycled.map(q=>q.id),singleType.slice(0,10).map(q=>q.id));
});
test('different input formats do not ask the same underlying fact twice in a run when alternatives exist',()=>{
  const candidates=quizQuestions.filter(q=>q.inputType==='TRUE_FALSE').slice(0,15);
  const duplicate={...candidates[0],id:'duplicate-in-another-format',inputType:'TEXT_SINGLE',suggestionDomain:'none',answer:{accepted:[{id:'yes',label:{pt:'Sim',en:'Yes'},aliases:[]}]}};
  const selected=selectQuizQuestions([...candidates,duplicate],{limit:10,random:seeded(5)});
  const topics=selected.map(q=>q.topicId||q.id);assert.equal(new Set(topics).size,topics.length);
});
test('history persists shown questions across difficulty, restart and browser reload without reserving unseen queue entries',()=>{
  const storage=memory(),random=seeded(3);
  const first=createNewQuiz({random},storage);checkpointQuiz(first,storage);rememberQuizQuestion(first.queue[0],storage);
  assert.deepEqual(readQuizHistory(storage),[first.queue[0]]);
  assert.ok(!readQuizHistory(storage).includes(first.queue[1]));
  const reloaded=JSON.parse(storage.getItem(QUIZ_HISTORY_KEY));assert.deepEqual(reloaded.questionIds,[first.queue[0]]);
  const next=createNewQuiz({difficulty:'HARD',random},storage);assert.ok(!next.queue.includes(first.queue[0]));
  rememberQuizQuestion(first.queue[0],storage);assert.equal(readQuizHistory(storage).length,1);
});
test('pre-history saves seed displayed questions before a new run overwrites their checkpoint',()=>{
  const storage=memory(),random=seeded(9);
  const previous=createQuiz({bank:quizQuestions,random});checkpointQuiz({...previous,index:2},storage);
  const oldDisplayed=previous.queue.slice(0,3);
  assert.deepEqual(readQuizHistory(storage),oldDisplayed);
  const next=createNewQuiz({random},storage);checkpointQuiz(next,storage);rememberQuizQuestion(next.queue[0],storage);
  assert.ok(oldDisplayed.every(id=>readQuizHistory(storage).includes(id)));
  assert.ok(next.queue.every(id=>!oldDisplayed.includes(id)));
});
test('history safely ignores malformed and retired IDs and blocked storage still permits a game',()=>{
  const storage=memory();storage.setItem(QUIZ_HISTORY_KEY,'broken');assert.deepEqual(readQuizHistory(storage),[]);
  storage.setItem(QUIZ_HISTORY_KEY,JSON.stringify({version:1,questionIds:['constructor','retired',null,'timeline-berlin','timeline-berlin']}));
  assert.deepEqual(readQuizHistory(storage),['timeline-berlin']);
  const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
  assert.equal(rememberQuizQuestion('timeline-berlin',blocked),false);assert.equal(createNewQuiz({},blocked).queue.length,10);
});
test('border answer sets include all neighbours and no territories or invented IDs',()=>{
  assert.equal(borderQuestions.length,30);
  const byIso=Object.fromEntries(countries.map(c=>[c.iso3,c]));
  const answer=iso=>bank[`multiple-borders-${iso.toLowerCase()}`].answer.accepted.map(e=>e.id).sort();
  assert.deepEqual(answer('PAN'),['COL','CRI'].map(iso=>byIso[iso].id).sort());
  assert.deepEqual(answer('USA'),['CAN','MEX'].map(iso=>byIso[iso].id).sort());
  assert.deepEqual(answer('PRT'),[byIso.ESP.id]);
  for(const q of borderQuestions)assert.equal(new Set(q.answer.accepted.map(e=>e.id)).size,q.answer.accepted.length);
});
test('curated city distances match spherical coordinates and pins only use point targets',()=>{
  const byPlace=Object.fromEntries(explorationPlaces.map(p=>[p.id,p]));
  assert.equal(distanceQuestions.length,40);assert.equal(new Set(distanceQuestions.map(q=>q.topicId)).size,40);
  for(const q of distanceQuestions){
    const [,from,to]=q.topicId.split(':');const a=byPlace[`city-${from}`],b=byPlace[`city-${to}`];
    const expected=distanceKm({lat:a.coordinates[1],lng:a.coordinates[0]},{lat:b.coordinates[1],lng:b.coordinates[0]});
    assert.ok(Math.abs(q.answer.km-expected)<=.5,q.id);
  }
  assert.equal(pinpointQuestions.length,49);
  for(const q of pinpointQuestions){const p=byPlace[q.topicId.slice(4)];assert.ok(['city','peak','historic'].includes(p.type));assert.deepEqual(q.answer.point,{lat:p.coordinates[1],lng:p.coordinates[0]});}
  assert.equal(geographyExpansion.length,119);
});
