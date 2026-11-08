import test from 'node:test';import assert from 'node:assert/strict';
import countries from '../src/data/countries.json' with {type:'json'};
import {flagColorQuestions} from '../src/quiz/flag-colors.js';
import {quizQuestions} from '../src/quiz/questions.js';
import {validateQuestion,requiredAnswers,multipleAnswerPoints} from '../src/quiz/engine.js';
const byIso=Object.fromEntries(countries.map(c=>[c.iso3,c]));
const q=id=>flagColorQuestions.find(q=>q.id===`flag-colors-${id}`);
const has=(question,iso)=>question.answer.accepted.some(e=>e.id===byIso[iso].id);
test('new colour combinations are complete scoped lists covering all five game continents',()=>{
 assert.equal(flagColorQuestions.length,26);
 assert.equal(new Set(flagColorQuestions.map(q=>q.topicId)).size,26);
 assert.deepEqual(new Set(flagColorQuestions.map(q=>countries.find(c=>c.id===q.countryIds[0]).continente)),new Set(['europa','africa','asia','americas','oceania']));
 for(const question of flagColorQuestions){
  assert.deepEqual(validateQuestion(question),[],question.id);
  assert.ok(quizQuestions.includes(question));
  assert.equal(question.inputType,'TEXT_MULTIPLE');assert.ok(question.answer.accepted.length>=2);
  assert.equal(new Set(question.countryIds).size,question.answer.accepted.length);
  const region=countries.find(c=>c.id===question.countryIds[0]).continente;
  assert.ok(question.countryIds.every(id=>countries.some(c=>c.id===id&&c.isCountry&&c.continente===region)));
  for(const locale of ['pt','en'])assert.ok(question.prompt[locale].includes(locale==='pt'?'Ignora brasões, selos e contornos finos':'Ignore coats of arms, seals and fine outlines'));
  const n=question.answer.accepted.length;assert.equal(requiredAnswers(n,'HARD'),n);assert.equal(multipleAnswerPoints(n-1,n,'HARD'),Math.floor(100*(n-1)/n));
 }
});
test('colour lists distinguish containment, exact palettes, separate backing panels and small devices',()=>{
 const europe=q('europa-red-white-blue-contains');assert.equal(europe.countryIds.length,12);assert.ok(has(europe,'FRA'));assert.ok(has(europe,'CZE'));assert.ok(!has(europe,'PRT'));
 const americas=q('americas-red-white-blue-contains');assert.equal(americas.countryIds.length,11);for(const iso of ['ATG','BLZ','HTI','VEN'])assert.ok(has(americas,iso),iso);
 const africa=q('africa-green-yellow-red-contains');assert.ok(has(africa,'MRT'));assert.ok(!has(africa,'ZMB'));
 const asia=q('asia-red-white-contains');assert.ok(has(asia,'QAT'));assert.ok(!has(asia,'BRN'));
 assert.ok(has(q('africa-red-black-white-contains'),'UGA'));
 assert.ok(has(q('europa-blue-yellow-red-only'),'LIE'));
 assert.ok(!has(q('oceania-blue-yellow-contains'),'MHL'),'Marshall Islands uses orange, not yellow');
 const exact=q('asia-red-white-only');assert.ok(has(exact,'QAT'));assert.ok(!has(exact,'THA'));
 assert.match(exact.prompt.pt,/apenas/);assert.match(europe.prompt.pt,/Pode ter outras cores/);
});
