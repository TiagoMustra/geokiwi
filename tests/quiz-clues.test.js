import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,stat } from 'node:fs/promises';
import countries from '../src/data/countries.json' with {type:'json'};
import { quizQuestions,getQuizPool,quizQuestionById as bank } from '../src/quiz/questions.js';
import { landmarkPhotos } from '../src/quiz/landmark-photos.js';
import { nameExpansion,countryLetters } from '../src/quiz/name-expansion.js';
import { flagExpansion } from '../src/quiz/flag-expansion.js';
import { createQuiz,evaluateSubmission,requiredAnswers } from '../src/quiz/engine.js';
import { createNewQuiz } from '../src/quiz/storage.js';
import { selectQuizQuestions } from '../src/quiz/selection.js';

const byIso=Object.fromEntries(countries.map(c=>[c.iso3,c]));
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
const rng=()=>{let n=7;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};

test('every monument pin has a local credited photograph and no country in its question or alt',async()=>{
  const monuments=quizQuestions.filter(q=>q.inputType==='MAP_PINPOINT'&&q.placeType==='monument');
  assert.equal(monuments.length,10);assert.equal(landmarkPhotos.length,10);
  for(const q of monuments){
    const photo=q.image;assert.ok(photo,q.id);assert.equal(photo.flagsChecked,true);
    assert.ok(photo.author&&photo.license&&photo.sourceUrl&&photo.licenseUrl);
    assert.ok(photo.width>0&&photo.height>0);
    const path=new URL('../public'+photo.src,import.meta.url),data=await readFile(path);
    assert.equal(data.readUInt16BE(0),0xffd8,q.id);assert.ok((await stat(path)).size<1_000_000,q.id);
    for(const locale of ['pt','en'])for(const id of q.countryIds){
      const country=countries.find(c=>c.id===id),name=locale==='pt'?country.nome_pt:country.nome_en;
      assert.ok(!q.prompt[locale].includes(`(${name})`),q.id);assert.ok(!photo.alt[locale].includes(name),q.id);
    }
  }
});
test('all pins state whether the target is a city, summit or monument',()=>{
  const pins=quizQuestions.filter(q=>q.inputType==='MAP_PINPOINT');
  assert.ok(pins.length>=50);assert.ok(pins.filter(q=>q.placeType==='city').length>=30);
  assert.equal(pins.filter(q=>q.placeType==='peak').length,10);
  assert.ok(pins.every(q=>['city','peak','monument'].includes(q.placeType)));
});
test('the name clue answer set uses its fixed name language and ignores spaces, hyphens and accents',()=>{
  assert.equal(nameExpansion.length,64);
  const b=bank['names-pt-initial-world-b'];assert.ok(b.answer.accepted.some(e=>e.id===byIso.BRA.id));
  const europe=bank['names-pt-length-europe-over-6'];
  assert.ok(europe.answer.accepted.some(e=>e.id===byIso.PRT.id));assert.ok(!europe.answer.accepted.some(e=>e.id===byIso.MLT.id));
  assert.ok(europe.answer.accepted.every(e=>{const c=countries.find(c=>c.id===e.id);return c.continente==='europa'&&countryLetters(c,'pt').length>6;}));
  const aPt=bank['names-pt-initial-world-a'],aEn=bank['names-en-initial-world-a'];
  assert.ok(aPt.answer.accepted.some(e=>e.id===byIso.DEU.id));assert.ok(!aEn.answer.accepted.some(e=>e.id===byIso.DEU.id));
  assert.equal(countryLetters(byIso.TLS,'pt').length,'timorleste'.length);
  assert.equal(countryLetters(byIso.AUT,'pt')[0],'a');
  assert.equal(evaluateSubmission(aPt,'Germany',{locale:'en'}).answer.correct,true,'switching UI language cannot silently change an existing answer set');
});
test('new games choose lexical questions for the UI language and counters reflect the eligible bank',()=>{
  for(const locale of ['pt','en']){
    const pool=getQuizPool(locale);assert.equal(pool.length,quizQuestions.length-nameExpansion.filter(q=>q.nameLanguage!==locale).length);
    assert.ok(pool.every(q=>!q.nameLanguage||q.nameLanguage===locale));
    const game=createNewQuiz({locale,random:rng()},memory());
    assert.ok(game.queue.every(id=>!bank[id].nameLanguage||bank[id].nameLanguage===locale));
    assert.ok(game.queue.some(id=>bank[id].category==='names'));
  }
});
test('fresh flag and word-play subjects appear in new runs, with mixed question order and no forced repeats',()=>{
  const random=rng();
  for(let i=0;i<20;i++){
    const game=createQuiz({bank:getQuizPool('pt'),random});
    assert.ok(game.queue.some(id=>bank[id].category==='flags'));
    assert.ok(game.queue.some(id=>bank[id].category==='names'));
  }
  const seen=getQuizPool('pt').filter(q=>['flags','names'].includes(q.category)).map(q=>q.id);
  const later=createQuiz({bank:getQuizPool('pt'),recentQuestionIds:seen,random});
  assert.ok(later.queue.every(id=>!seen.includes(id)));
  const selected=selectQuizQuestions(getQuizPool('pt'),{limit:10,random:rng()});
  assert.equal(new Set(selected.map(q=>q.id)).size,10);
});
test('flag groups and letter groups share the difficulty quota rules',()=>{
  assert.equal(flagExpansion.length,12);
  assert.equal(flagExpansion.filter(q=>q.inputType==='TEXT_MULTIPLE').length,8);
  for(const q of [...flagExpansion.filter(q=>q.inputType==='TEXT_MULTIPLE'),...nameExpansion]){
    const total=q.answer.accepted.length;
    assert.equal(requiredAnswers(total,'EASY'),1);assert.equal(requiredAnswers(total,'MEDIUM'),Math.ceil(total/2));assert.equal(requiredAnswers(total,'HARD'),total);
  }
});
