import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuiz, submitQuiz, nextQuiz, multipleAnswerPoints } from '../src/quiz/engine.js';
import { quizQuestionById as bank } from '../src/quiz/questions.js';
import { checkpointQuiz, readQuizSave, restoreQuiz } from '../src/quiz/storage.js';

const question=bank['multiple-caspian']; // Five countries: Medium requires three.
const memory=()=>{const items=new Map();return {getItem:key=>items.get(key)||null,setItem:(key,value)=>items.set(key,value)};};
const start=difficulty=>createQuiz({bank:[question],rounds:10,difficulty});
const answer=(game,index)=>submitQuiz(game,bank,question.answer.accepted[index].label.pt);

test('list credit uses the difficulty quota, rounds down and caps at 100',()=>{
  assert.equal(multipleAnswerPoints(0,9,'HARD'),0);
  assert.equal(multipleAnswerPoints(2,3,'HARD'),66);
  assert.equal(multipleAnswerPoints(2,9,'HARD'),22);
  assert.equal(multipleAnswerPoints(8,9,'HARD'),88);
  assert.equal(multipleAnswerPoints(9,9,'HARD'),100);
  assert.equal(multipleAnswerPoints(1,5,'EASY'),100);
  assert.equal(multipleAnswerPoints(2,5,'MEDIUM'),66);
  assert.equal(multipleAnswerPoints(3,5,'MEDIUM'),100);
  assert.equal(multipleAnswerPoints(9,5,'MEDIUM'),100);
});

test('two of three earns 66 immediately and concluding never adds it a second time',()=>{
  let game=answer(answer(start('MEDIUM'),0),1);
  assert.equal(game.score,66);assert.equal(game.answers.length,0);
  assert.strictEqual(nextQuiz(game),game);
  const duplicate=submitQuiz(game,bank,question.answer.accepted[0].label.en,{locale:'en'});
  assert.equal(duplicate.score,66);assert.equal(duplicate.notice,'duplicate');
  game=submitQuiz(duplicate,bank,'Portugal');
  assert.equal(game.score,66);assert.equal(game.notice,'not-found');
  game=submitQuiz(game,bank,'',{skipped:true});
  assert.equal(game.score,66);assert.equal(game.answers[0].points,66);
  assert.equal(game.answers[0].correct,false);assert.equal(game.answers[0].foundIds.length,2);
  assert.strictEqual(submitQuiz(game,bank,'',{skipped:true}),game);
  assert.equal(nextQuiz(game).score,66);assert.equal(nextQuiz(game).finished,true);
});

test('completing a list adds only the remaining credit in all difficulties',()=>{
  for(const [difficulty,quota] of [['EASY',1],['MEDIUM',3],['HARD',5]]){
    let game=start(difficulty);
    for(let i=0;i<quota;i++)game=answer(game,i);
    assert.equal(game.score,100);assert.equal(game.answers[0].points,100);
    assert.equal(game.answers[0].correct,true);
    assert.strictEqual(submitQuiz(game,bank,'',{skipped:true}),game);
  }
  const zero=submitQuiz(start('HARD'),bank,'',{skipped:true});
  assert.equal(zero.score,0);assert.equal(zero.answers[0].points,0);
});

test('earned points survive resume before and after conclusion and migrate old event histories',()=>{
  const storage=memory();let game=answer(answer(start('MEDIUM'),0),1);
  checkpointQuiz(game,storage);game=readQuizSave(10,'MEDIUM',storage);
  assert.equal(game.score,66);assert.equal(game.foundIds.length,2);
  game=submitQuiz(game,bank,'',{skipped:true});checkpointQuiz(game,storage);
  assert.equal(readQuizSave(10,'MEDIUM',storage).score,66);
  const old={...game,scoringVersion:3,score:0,answers:game.answers.map(a=>({...a,points:0}))};
  const upgraded=restoreQuiz(old);
  assert.equal(upgraded.scoringVersion,4);assert.equal(upgraded.score,66);
  assert.deepEqual(upgraded.queue,game.queue);assert.deepEqual(upgraded.events,game.events);
  assert.equal(upgraded.answers[0].points,66);
});
