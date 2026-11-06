import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuiz, evaluateSubmission, requiredAnswers, parseSmartNumber, inputBounds, MAX_DISTANCE_KM, distanceKm, fromLngLat, toLngLat, submitQuiz, nextQuiz, validateQuestion, INPUT_TYPES } from '../src/quiz/engine.js';
import { dynamicQuestions, quizQuestions, quizQuestionById as bank } from '../src/quiz/questions.js';
import { restoreQuiz, checkpointQuiz, readQuizSave, readQuizRecord, saveQuizRecord, QUIZ_SAVE_KEY } from '../src/quiz/storage.js';
import { createCountryClueGame, answerCountryClue, writeCountryClueSave, readCountryClueSave } from '../src/lib/country-clues-game.js';
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)||null,setItem:(key,v)=>map.set(key,v)};};
const list=bank['multiple-caspian'];
const newRun=(question,difficulty='EASY')=>createQuiz({bank:[question],difficulty,practice:true});
const evalQ=(id,value,opts)=>evaluateSubmission(bank[id],value,opts);

test('all authored questions satisfy the union schema, including all seven input types',()=>{
  assert.equal(new Set(quizQuestions.map(q=>q.id)).size,quizQuestions.length);
  assert.deepEqual(new Set(dynamicQuestions.map(q=>q.inputType)),new Set(INPUT_TYPES));
  for(const q of quizQuestions)assert.deepEqual(validateQuestion(q),[],q.id);
  assert.deepEqual(validateQuestion({...list,answer:{accepted:[]}}),['entities']);
  assert.ok(validateQuestion({...bank['timeline-berlin'],answer:{year:3000,toleranceYears:0}}).includes('numeric'));
  assert.ok(validateQuestion({...bank['timeline-berlin'],range:null}).includes('timeline'));
  assert.throws(()=>createQuiz({bank:[{...list,inputType:'UNKNOWN'}]}),TypeError);
});
test('difficulty quotas round odd halves up and never request zero answers',()=>{
  for(const [n,easy,medium,hard] of [[1,1,1,1],[2,1,1,2],[5,1,3,5],[9,1,5,9]]){
    assert.equal(requiredAnswers(n,'EASY'),easy);assert.equal(requiredAnswers(n,'MEDIUM'),medium);assert.equal(requiredAnswers(n,'HARD'),hard);
  }
  assert.throws(()=>requiredAnswers(0,'EASY'));
});
test('smart numbers accept suffixes, decimal commas, zero and correctly grouped thousands',()=>{
  for(const [raw,locale,expected] of [['10k','pt',10000],['10M','pt',10000000],['10b','en',1e10],['2,5M','pt',2500000],['2.5M','en',2500000],['267 570','pt',267570],['267.570','pt',267570],['267,570','en',267570],['1.234.567,89','pt',1234567.89],['1,234,567.89','en',1234567.89],['553.33','pt',553.33],['553,33','en',553.33],['0','pt',0],['-3000','pt',-3000]])assert.equal(parseSmartNumber(raw,locale),expected,raw);
  for(const raw of ['', '   ','Infinity','NaN','10km','1e6','12abc','1 2','1,2,3','0x10','--10','1.000.000.12',1/0])assert.equal(parseSmartNumber(raw),null,String(raw));
});
test('boolean false is a real answer; text false and missing answers cannot submit',()=>{
  assert.equal(evalQ('tf-berlin-1991',false).answer.correct,true);
  assert.equal(evalQ('tf-berlin-1991',true).answer.correct,false);
  assert.equal(evalQ('tf-berlin-1991','false').notice,'invalid');
});
test('single text accepts aliases and both languages; a different entity is a mistake',()=>{
  assert.equal(evalQ('taj-mahal','Índia').answer.correct,true);
  assert.equal(evalQ('taj-mahal','India').answer.correct,true);
  assert.equal(evalQ('taj-mahal','Portugal').answer.correct,false);
  assert.equal(evalQ('text-city-eiffel','PARIS').answer.correct,true);
});
test('multiple answers accumulate, deduplicate translated aliases, and finish only at the quota',()=>{
  for(const difficulty of ['EASY','MEDIUM','HARD']){
    let game=newRun(list,difficulty),required=requiredAnswers(5,difficulty);
    for(let i=0;i<required;i++){
      game=submitQuiz(game,bank,list.answer.accepted[i].label.pt);
      assert.equal(game.foundIds.length,i+1);
      if(i<required-1){
        assert.equal(game.answers.length,0);
        const duplicate=submitQuiz(game,bank,list.answer.accepted[i].label.en,{locale:'en'});
        assert.equal(duplicate.notice,'duplicate');assert.equal(duplicate.events.length,game.events.length);assert.equal(duplicate.score,0);
      }
    }
    assert.equal(game.score,100);assert.equal(game.answers.length,1);
    assert.equal(submitQuiz(game,bank,'Portugal'),game);
  }
  const wrong=submitQuiz(newRun(list,'HARD'),bank,'Portugal');assert.equal(wrong.notice,'not-found');assert.equal(wrong.answers.length,0);
});
test('exact numbers show strict or explicitly configured tolerance, and never accept trailing junk',()=>{
  assert.equal(evalQ('number-swedish-islands','267.57k').answer.correct,true);
  assert.equal(evalQ('number-swedish-islands','267k').answer.correct,false);
  assert.equal(evalQ('number-swedish-islands','267570 islands').notice,'invalid');
  assert.equal(evalQ('number-cn-tower','553,33').answer.correct,true);
  assert.equal(evalQ('number-cn-tower',-1).notice,'out-of-range');
  const q=bank['distance-lisbon-paris'];
  assert.equal(evaluateSubmission(q,q.answer.km+25).answer.correct,true);
  assert.equal(evaluateSubmission(q,q.answer.km+26).answer.correct,false);
});
test('timeline and distance bounds apply equally to manual entry and sliders',()=>{
  const q={...bank['timeline-berlin'],range:{min:-3000,max:'CURRENT_YEAR',step:1}};
  assert.deepEqual(inputBounds(q,2026),{min:-3000,max:2026,step:1});
  assert.equal(evaluateSubmission(q,'2027',{year:2026}).notice,'out-of-range');
  assert.equal(evaluateSubmission(q,'1989.5',{year:2026}).notice,'out-of-range');
  assert.equal(evaluateSubmission(q,'0',{year:2026}).notice,'out-of-range');
  assert.equal(evaluateSubmission({...q,answer:{year:-2500,toleranceYears:0}},'-2500',{year:2026}).answer.correct,true);
  assert.equal(inputBounds({...q,range:{min:1900,max:3000}},2026).max,2026);
  const d=bank['distance-lisbon-paris'];
  assert.deepEqual(inputBounds(d),{min:0,max:20037,step:1});
  assert.equal(evaluateSubmission(d,MAX_DISTANCE_KM+1).notice,'out-of-range');
  assert.equal(evaluateSubmission(d,0).answer.correct,false);
});
test('named map coordinates cannot be reversed; distances wrap across the antimeridian',()=>{
  const q=bank['pinpoint-everest'],point=q.answer.point;
  assert.deepEqual(fromLngLat(toLngLat(point)),point);
  const exact=evaluateSubmission(q,point).answer;assert.equal(exact.points,100);assert.equal(exact.distanceKm,0);
  assert.equal(evaluateSubmission(q,{lat:100,lng:0}).notice,'invalid');
  assert.equal(evaluateSubmission(q,[point.lng,point.lat]).notice,'invalid');
  const far=evaluateSubmission(q,{lat:0,lng:0}).answer;assert.equal(far.correct,false);assert.ok(far.points<10);
  assert.ok(distanceKm({lat:0,lng:179},{lat:0,lng:-179})<225);
});
test('runs mix input types, use a question once and score each submission at most once',()=>{
  let game=createQuiz({bank:quizQuestions,rounds:10});
  assert.equal(game.queue.length,10);assert.equal(new Set(game.queue).size,10);
  assert.equal(new Set(game.queue.slice(0,7).map(id=>bank[id].inputType)).size,7);
  assert.equal(nextQuiz(game),game);
  for(let i=0;i<10;i++){
    game=submitQuiz(game,bank,'',{skipped:true});assert.equal(game.answers.length,i+1);
    assert.equal(submitQuiz(game,bank,'',{skipped:true}),game);game=nextQuiz(game);
  }
  assert.equal(game.finished,true);assert.equal(game.score,0);
});
test('skipping a partially completed list reveals it and gives zero points',()=>{
  let game=submitQuiz(newRun(list,'HARD'),bank,'Russia');
  game=submitQuiz(game,bank,'',{skipped:true});assert.equal(game.answers[0].skipped,true);
  assert.deepEqual(game.answers[0].foundIds,['643']);assert.equal(game.score,0);
});
test('saves restore partial lists and recompute scores instead of trusting edited snapshots',()=>{
  let game=submitQuiz(newRun(list,'HARD'),bank,'Russia');const storage=memory();
  assert.equal(checkpointQuiz(game,storage),true);
  let restored=readQuizSave(10,'HARD',storage);assert.deepEqual(restored.foundIds,['643']);assert.equal(restored.score,0);
  const saved=JSON.parse(storage.getItem(QUIZ_SAVE_KEY));saved['10:HARD'].score=9999;saved['10:HARD'].foundIds=list.answer.accepted.map(e=>e.id);storage.setItem(QUIZ_SAVE_KEY,JSON.stringify(saved));
  restored=readQuizSave(10,'HARD',storage);assert.deepEqual(restored.foundIds,['643']);assert.equal(restored.score,0);
  game=submitQuiz(restored,bank,'Iran');assert.equal(game.foundIds.length,2);
  const stale={...saved['10:HARD'],revisions:{[list.id]:999}};assert.equal(restoreQuiz(stale),null);
});
test('resuming works during feedback and between rounds without losing boolean false',()=>{
  let game=createQuiz({bank:dynamicQuestions,rounds:10});const storage=memory();
  game=submitQuiz(game,bank,'',{skipped:true});checkpointQuiz(game,storage);
  assert.equal(readQuizSave(10,'EASY',storage).answers.length,1);
  game=nextQuiz(game);checkpointQuiz(game,storage);assert.equal(readQuizSave(10,'EASY',storage).index,1);
  game=newRun(bank['tf-berlin-1991']);game=submitQuiz(game,bank,false);checkpointQuiz(game,storage);
  assert.equal(readQuizSave(10,'EASY',storage).score,100);
});
test('difficulty saves and records are separate; practice never changes a record',()=>{
  const storage=memory();
  for(const difficulty of ['EASY','MEDIUM','HARD'])checkpointQuiz(newRun(list,difficulty),storage);
  for(const difficulty of ['EASY','MEDIUM','HARD'])assert.equal(readQuizSave(10,difficulty,storage).difficulty,difficulty);
  const game={...newRun(list,'HARD'),finished:true,practice:false,score:100};saveQuizRecord(game,storage);
  assert.equal(readQuizRecord(10,'HARD',storage),100);assert.equal(readQuizRecord(10,'EASY',storage),0);
  assert.equal(saveQuizRecord({...game,practice:true,score:200},storage),false);
});
test('old text-only games migrate without losing their queue or progress',()=>{
  const storage=memory();let legacy=createCountryClueGame({rounds:10});
  legacy=answerCountryClue(legacy,'',{skipped:true});writeCountryClueSave(legacy,storage);
  const migrated=readQuizSave(10,'EASY',storage);assert.deepEqual(migrated.queue,legacy.queue);assert.equal(migrated.answers[0].skipped,true);assert.equal(migrated.index,legacy.index);
  assert.ok(readCountryClueSave(10,storage));checkpointQuiz(migrated,storage);assert.equal(readCountryClueSave(10,storage),null);assert.equal(readQuizSave(10,'EASY',storage).id,legacy.id);
});
test('corrupt, impossible, revised and blocked saves fail safely',()=>{
  const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
  assert.equal(readQuizSave(10,'EASY',blocked),null);assert.equal(checkpointQuiz(newRun(list),blocked),false);
  const game=newRun(list,'HARD');
  assert.equal(restoreQuiz({...game,queue:['no-such-question']}),null);
  assert.equal(restoreQuiz({...game,queue:['constructor'],revisions:{}}),null);
  assert.equal(restoreQuiz({...game,index:8}),null);
  assert.equal(restoreQuiz({...game,events:[{index:0,value:'Portugal',locale:'pt',skipped:false}]}),null);
});
