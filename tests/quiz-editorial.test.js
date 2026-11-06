import test from 'node:test';
import assert from 'node:assert/strict';
import {quizQuestions,quizQuestionById as bank,getQuizPool} from '../src/quiz/questions.js';
import {quizRetirements,upgradeQuizQueue} from '../src/quiz/editorial-review.js';
import {createQuiz,submitQuiz,nextQuiz,evaluateSubmission,requiredAnswers,validateQuestion} from '../src/quiz/engine.js';
import {restoreQuiz,checkpointQuiz,readQuizSave,readQuizHistory,rememberQuizQuestion,QUIZ_HISTORY_KEY,QUIZ_SAVE_KEY} from '../src/quiz/storage.js';
const active=new Set(quizQuestions.map(q=>q.id));
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
const oldRun=ids=>{const game=createQuiz({bank:ids.map(id=>bank[id]),practice:true});return {...game,queue:ids,revisions:Object.fromEntries(ids.map(id=>[id,bank[id].revision]))};};

test('all 53 former booleans have an editorial decision: keep 5, convert 7 and retire 41',()=>{
  const archived=Object.keys(quizRetirements).map(id=>bank[id]).filter(q=>q.inputType==='TRUE_FALSE');
  assert.equal(archived.length,48);
  assert.equal(archived.filter(q=>quizRetirements[q.id].reason==='format').length,7);
  const booleans=quizQuestions.filter(q=>q.inputType==='TRUE_FALSE');assert.equal(booleans.length,5);
  assert.ok(booleans.some(q=>q.id==='tf-namib-fog'));
  assert.ok(!active.has('tf-berlin-1991')&&!active.has('tf-kiribati-hemispheres'));
  for(const [id,{replacementId}] of Object.entries(quizRetirements)){
    assert.ok(!active.has(id),id);if(replacementId)assert.ok(active.has(replacementId),id);
  }
});
test('canonical dates and country/list questions replace disguised rote true/false facts',()=>{
  assert.equal(bank['timeline-berlin'].answer.year,1989);
  assert.equal(bank['timeline-union-flag'].inputType,'SLIDER_TIMELINE');assert.equal(bank['timeline-union-flag'].answer.year,1801);
  assert.equal(bank['quatro-hemisferios'].inputType,'TEXT_SINGLE');assert.doesNotMatch(bank['quatro-hemisferios'].prompt.pt,/Tarawa/);
  assert.equal(evaluateSubmission(bank['quatro-hemisferios'],'Kiribati').answer.correct,true);
  for(const [id,country] of [['country-flag-bangladesh','Bangladesh'],['country-flag-jamaica','Jamaica'],['country-flag-philippines','Philippines'],['country-flag-paraguay','Paraguay'],['country-flag-lesotho','Lesotho'],['country-capricorn-oceania','Australia']]){
    assert.equal(bank[id].inputType,'TEXT_SINGLE');assert.doesNotMatch(bank[id].explanation.pt,/^[.:]|^(Verdadeiro|Falso)[.:]/);assert.deepEqual(validateQuestion(bank[id]),[],id);assert.equal(evaluateSubmission(bank[id],country,{locale:'en'}).answer.points,100,id);
  }
  const europe=bank['continental-landlocked-europe'];assert.equal(europe.answer.accepted.length,15);
  assert.ok(europe.answer.accepted.some(e=>e.id==='383'));assert.ok(europe.answer.accepted.some(e=>e.id==='756'));
  const doubly=bank['multiple-doubly-landlocked'];assert.equal(doubly.inputType,'TEXT_MULTIPLE');assert.equal(doubly.answer.accepted.length,2);
  assert.equal(requiredAnswers(2,'EASY'),1);assert.equal(requiredAnswers(2,'MEDIUM'),1);assert.equal(requiredAnswers(2,'HARD'),2);
});
test('unfinished saved questions are upgraded without reinterpreting past booleans or losing points',()=>{
  let game=oldRun(['tf-berlin-1991','tf-kiribati-hemispheres','flagsv-paraguay-two-sides']);
  game=submitQuiz(game,bank,false);game=nextQuiz(game);
  const restored=restoreQuiz(game);assert.ok(restored);
  assert.equal(restored.queue[0],'tf-berlin-1991');assert.equal(restored.answers[0].value,false);assert.equal(restored.score,100);
  assert.equal(restored.queue[1],'quatro-hemisferios');assert.equal(restored.queue[2],'country-flag-paraguay');assert.equal(restored.index,1);
  assert.deepEqual(restored.events,game.events);assert.deepEqual(restoreQuiz(restored),restored);
  const answered=submitQuiz(restored,bank,'Kiribati');assert.equal(answered.score,200);
  const storage=memory();checkpointQuiz(game,storage);const loaded=readQuizSave(10,'EASY',storage);assert.equal(loaded.score,100);assert.equal(loaded.queue[1],'quatro-hemisferios');
  checkpointQuiz(loaded,storage);assert.equal(JSON.parse(storage.getItem(QUIZ_SAVE_KEY))['10:EASY'].queue[1],'quatro-hemisferios');
});
test('multiple retired slots sharing a canonical target stay unique and deterministic across reloads',()=>{
  const game=oldRun(['tf-landlocked-bol','tf-landlocked-pry','continental-landlocked-south-america','tf-latitude-cape-town-south-sydney']);
  const first=restoreQuiz(game),second=restoreQuiz(game);assert.deepEqual(first,second);
  assert.equal(first.queue.length,4);assert.equal(new Set(first.queue).size,4);assert.ok(first.queue.every(id=>active.has(id)));
  assert.equal(first.queue[2],'continental-landlocked-south-america');
  const result=submitQuiz(oldRun(['tf-berlin-1991']),bank,false);const feedback=restoreQuiz(result);
  assert.equal(feedback.queue[0],'tf-berlin-1991');assert.equal(feedback.answers[0].correct,true,'in-flight feedback keeps its actual historic answer');
});
test('retired history becomes canonical history and does not consume fresh-question slots',()=>{
  const storage=memory();storage.setItem(QUIZ_HISTORY_KEY,JSON.stringify({version:1,questionIds:['tf-kiribati-hemispheres','tf-berlin-1991','tf-latitude-cape-town-south-sydney']}));
  assert.deepEqual(readQuizHistory(storage),['quatro-hemisferios','timeline-berlin']);
  rememberQuizQuestion('tf-berlin-1991',storage);assert.deepEqual(readQuizHistory(storage),['quatro-hemisferios','timeline-berlin']);
  const all=getQuizPool('pt').map(q=>q.id);storage.setItem(QUIZ_HISTORY_KEY,JSON.stringify({version:1,questionIds:all}));rememberQuizQuestion('tf-berlin-1991',storage);
  assert.equal(readQuizHistory(storage).length,all.length);assert.deepEqual(new Set(readQuizHistory(storage)),new Set(all));
  const game=oldRun(['tf-latitude-cape-town-south-sydney']);
  const onlyFresh=bank['timeline-union-flag'];const seen=quizQuestions.filter(q=>q.id!==onlyFresh.id).map(q=>q.id);
  assert.equal(upgradeQuizQueue(game,bank,quizQuestions,seen).queue[0],onlyFresh.id);
});
