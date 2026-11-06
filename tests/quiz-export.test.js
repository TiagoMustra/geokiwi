import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {quizQuestions,getQuizPool} from '../src/quiz/questions.js';
import {worldVariants} from '../src/quiz/world-variants.js';
import {validateQuestion,evaluateSubmission,distanceKm} from '../src/quiz/engine.js';

test('the complete export includes every authored question, language variant, answer and source',async()=>{
  const exported=JSON.parse(await readFile(new URL('../public/downloads/conhecimento-geral.json',import.meta.url),'utf8'));
  assert.deepEqual(exported.questions,quizQuestions);
  assert.equal(exported.storedQuestionCount,quizQuestions.length);
  assert.deepEqual(exported.eligibleCounts,{pt:getQuizPool('pt').length,en:getQuizPool('en').length});
  const md=await readFile(new URL('../public/downloads/conhecimento-geral.md',import.meta.url),'utf8');
  for(const question of quizQuestions){
    assert.ok(md.includes(`### ${question.id}\n`),question.id);
    assert.ok(md.includes(question.prompt.pt),question.id);
    assert.ok(md.includes(question.prompt.en),question.id);
    assert.ok(md.includes(question.explanation.pt),question.id);
    assert.ok(question.sources.every(source=>md.includes(source.url)),question.id);
  }
});
test('new world variants cover numeric estimates, dates, city pins and selected distance routes',()=>{
  for(const type of ['NUMBER_EXACT','SLIDER_TIMELINE','MAP_PINPOINT','SLIDER_DISTANCE'])assert.ok(worldVariants.filter(q=>q.inputType===type).length>=8,type);
  for(const q of worldVariants){
    assert.deepEqual(validateQuestion(q),[],q.id);
    const value=q.inputType==='MAP_PINPOINT'?q.answer.point:q.answer.year??q.answer.km??q.answer.value;
    assert.equal(evaluateSubmission(q,value).answer.points,100,q.id);
  }
  assert.ok(worldVariants.filter(q=>q.inputType==='MAP_PINPOINT').every(q=>q.placeType==='city'));
  assert.equal(Math.round(distanceKm({lat:-.213042,lng:-78.501997},{lat:1.293033466,lng:103.8558207})),worldVariants.find(q=>q.id==='world-distance-quito-singapore').answer.km);
});

test('continental questions distinguish land at the Equator, complete regional lists and shared waterbodies',async()=>{
  const {continentalVariants}=await import('../src/quiz/continental-variants.js');
  const byId=Object.fromEntries(continentalVariants.map(q=>[q.id,q]));
  const equator=byId['continental-equator-land-world'];
  const ids=equator.answer.accepted.map(e=>e.id);
  assert.equal(ids.length,11);assert.ok(ids.includes('678'),'São Tomé and Príncipe includes Ilhéu das Rolas');
  assert.ok(!ids.includes('462')&&!ids.includes('296'),'Maldives and Kiribati have no land on the line');
  const africa=byId['continental-equator-land-africa'],americas=byId['continental-equator-land-americas'];
  assert.equal(africa.answer.accepted.length,7);assert.equal(americas.answer.accepted.length,3);
  for(const q of [africa,americas])assert.ok(q.answer.accepted.every(e=>ids.includes(e.id)));
  assert.deepEqual(byId['continental-lake-tanganyika-shores'].answer.accepted.map(e=>e.id).sort(),['108','180','834','894']);
  assert.equal(byId['continental-landlocked-africa'].answer.accepted.length,16);
  assert.equal(byId['continental-landlocked-asia'].answer.accepted.length,12);
  assert.equal(byId['continental-equatorial-guinea-land'].answer.value,false);
  assert.equal(byId['continental-maldives-equator-land'].answer.value,false);
});

test('flag variants add complete continental patterns and precise numeric details',async()=>{
  const {flagVariants}=await import('../src/quiz/flag-variants.js');
  const bank=Object.fromEntries(flagVariants.map(q=>[q.id,q]));
  assert.equal(flagVariants.length,30);
  for(const q of flagVariants)assert.deepEqual(validateQuestion(q),[],q.id);
  assert.deepEqual(bank['flagsv-africa-crescents'].answer.accepted.map(e=>e.id).sort(),['012','174','434','478','788']);
  const redWhite=bank['flagsv-europe-red-white-only'].answer.accepted.map(e=>e.id);
  assert.equal(redWhite.length,6);assert.ok(!redWhite.includes('470'),'Malta has a grey cross and is excluded by the full-symbol colour rule');
  assert.equal(bank['flagsv-oceania-southern-cross'].answer.accepted.length,4);
  assert.equal(bank['flagsv-usa-star-count'].answer.value,50);
  assert.equal(bank['flagsv-india-chakra-spokes'].answer.value,24);
  assert.equal(bank['flagsv-paraguay-two-sides'].answer.value,true);
  assert.equal(bank['flagsv-philippines-peacetime-order'].answer.value,false);
});
