import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translate,readLocale,saveLocale,LOCALE_KEY,countryName,capitalName} from '../src/i18n/locale.js';
import {getNameSuggestions} from '../src/lib/suggestions.js';
import {matchesAnswer,saveTheme,readTheme} from '../src/lib/game.js';
const countries=JSON.parse(readFileSync(new URL('../src/data/countries.json',import.meta.url)));
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
test('locale choice persists independently and safely handles blocked or corrupt storage',()=>{
 const storage=memory();assert.equal(readLocale(storage),'pt');saveTheme('light',storage);saveLocale('en',storage);assert.equal(readLocale(storage),'en');assert.equal(readTheme(storage),'light');
 storage.setItem(LOCALE_KEY,'bad');assert.equal(readLocale(storage),'pt');
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.equal(readLocale(blocked),'pt');assert.doesNotThrow(()=>saveLocale('en',blocked));
});
test('UI translation covers geographic names and counters without translating fragments of words',()=>{
 assert.equal(translate('197 países + 35 territórios','en'),'197 countries + 35 territories');
 assert.equal(translate('Lisboa · Portugal','en'),'Lisbon · Portugal');
 assert.equal(translate('Repetir só os 3 que falhaste','en'),'Repeat only the 3 you missed');
 assert.equal(translate('REVISAR AS 197 RESPOSTAS','en'),'REVIEW ALL 197 ANSWERS');
 assert.equal(translate('despaísesx','en'),'despaísesx');
 assert.equal(translate('My English kiwi fact stays readable.','en'),'My English kiwi fact stays readable.');
 assert.equal(translate('Países','pt'),'Países');
});
test('every displayed English country and capital name remains a valid typed answer',()=>{
 for(const country of countries){assert.ok(matchesAnswer(country,2,countryName(country,'en')),country.id);assert.ok(matchesAnswer(country,4,capitalName(country,'en')),country.capital);}
});
test('English completion prefers English names while keeping all suggested values valid',()=>{
 const portugal=countries.find(c=>c.id==='620');
 assert.equal(getNameSuggestions([portugal],4,'lis',6,'en')[0].label,'Lisbon');
 assert.equal(getNameSuggestions(countries,2,'ger',6,'en')[0].label,'Germany');
 for(const mode of [2,4]) for(const item of getNameSuggestions(countries,mode,'s',232,'en')) assert.ok(countries.some(c=>matchesAnswer(c,mode,item.value)));
});
