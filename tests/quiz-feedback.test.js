import test from 'node:test';
import assert from 'node:assert/strict';
import { quizQuestions, quizQuestionById as bank } from '../src/quiz/questions.js';
import { allowsQuizSuggestions } from '../src/quiz/presentation.js';
import { createQuiz, submitQuiz, nextQuiz } from '../src/quiz/engine.js';
import { restoreQuiz } from '../src/quiz/storage.js';

test('all word-based clues block suggestions, while geography lists still allow them',()=>{
  const words=quizQuestions.filter(q=>q.category==='names');
  assert.ok(words.length>=64);
  assert.ok(words.every(q=>!allowsQuizSuggestions(q)));
  assert.equal(allowsQuizSuggestions(bank['continental-landlocked-europe']),true);
  assert.equal(allowsQuizSuggestions({inputType:'TEXT_SINGLE',suggestionDomain:'countries',nameLanguage:'pt'}),false);
  assert.equal(allowsQuizSuggestions({inputType:'TEXT_SINGLE',suggestionDomain:'none'}),false);
});

test('answered feedback survives save and resume until an explicit next action, including final results',()=>{
  for(const skipped of [false,true]){
    const q=bank['timeline-berlin'];
    let game=createQuiz({bank:[q],rounds:10,difficulty:'EASY'});
    game=submitQuiz(game,bank,1989,{locale:'pt',skipped});
    assert.equal(game.index,0);
    assert.equal(game.finished,false);
    const resumed=restoreQuiz(JSON.parse(JSON.stringify(game)));
    assert.equal(resumed.index,0);
    assert.equal(resumed.finished,false);
    assert.equal(resumed.answers[0].points,skipped?0:100);
    const done=nextQuiz(resumed);
    assert.equal(done.finished,true);
    assert.equal(done.score,resumed.score);
    assert.deepEqual(nextQuiz(done),done);
  }
});
