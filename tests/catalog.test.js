import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapPoliticalFeature } from '../src/lib/catalog.js';
import { createGame, readIncludeTerritories, saveIncludeTerritories, saveScore, scoreKey } from '../src/lib/game.js';
import { checkpoint, emptyActivity, readActivity, restoreGame, writeActivity, saveKey } from '../src/lib/activity.js';
const countries = JSON.parse(readFileSync(new URL('../src/data/countries.json', import.meta.url)));
const memory = () => { const m = new Map(); return {getItem: k => m.get(k) || null, setItem: (k,v) => m.set(k,v)}; };
const pool = (region, include) => countries.filter(c => (region === 'mundo' || c.continente === region) && (include || c.isCountry));
test('countries by default include Kosovo and Tuvalu; territories require the option', () => {
  const ordinary = pool('mundo', false), expanded = pool('mundo', true);
  for (const id of ['383', '798', '275', '158']) assert.ok(ordinary.some(c => c.id === id), id);
  for (const id of ['831', '832']) { assert.ok(!ordinary.some(c => c.id === id)); assert.ok(expanded.some(c => c.id === id)); }
  assert.equal(new Set(expanded.map(c => c.id)).size, expanded.length);
  const storage = memory(); assert.equal(readIncludeTerritories(storage), false); saveIncludeTerritories(true, storage); assert.equal(readIncludeTerritories(storage), true);
});
test('Somaliland and Baikonur select their parent countries in both map datasets', () => {
  for (const [name, id] of [['Somaliland', '706'], ['Baikonur', '398']]) assert.equal(mapPoliticalFeature({id:'unmapped', properties:{name}}).id, id);
  assert.equal(mapPoliticalFeature({id:'383',properties:{name:'Kosovo'}}).id, '383');
});
test('scope-specific runs and records coexist with the original saved run', () => {
  let a = emptyActivity();
  const legacyPool = pool('europa', true).filter(c => !['383', '798'].includes(c.id));
  const legacy = createGame({mode:1,region:'europa',pool:legacyPool});
  const normal = createGame({mode:1,region:'europa',pool:pool('europa',false),includeTerritories:false});
  const all = createGame({mode:1,region:'europa',pool:pool('europa',true),includeTerritories:true});
  for (const g of [legacy,normal,all]) a=checkpoint(a,g);
  const storage=memory(); writeActivity(a,storage); a=readActivity(countries,storage);
  for (const [scope, expected] of [[undefined,legacy],[false,normal],[true,all]]) {
    const saved=a.saves[saveKey(1,'europa',scope)]; assert.ok(saved);
    assert.deepEqual(restoreGame(saved,countries).queue.map(c=>c.id),expected.queue.map(c=>c.id));
  }
  assert.notEqual(scoreKey(1,'europa','normal',false),scoreKey(1,'europa','normal',true));
  const scores=saveScore({}, {...normal,score:100},storage).scores;
  assert.equal(scores[scoreKey(1,'europa',normal.difficulty,false)],100);
});

test('the Netherlands display as Países Baixos while older accepted names remain valid', () => {
 const country=countries.find(item=>item.iso3==='NLD');
 assert.equal(country.nome_pt,'Países Baixos');
 for(const name of ['Países Baixos','Holanda','Netherlands']) assert.ok(country.aliases.includes(name));
});
