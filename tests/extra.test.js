import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoArea, geoPath, geoMercator, geoAlbersUsa, zoomIdentity } from 'd3';
import { capitalDistance, capitalPoints, readExtra, writeExtra } from '../src/lib/extra-game.js';
import { createGame, gameReducer, saveScore, readScores } from '../src/lib/game.js';
import { checkpoint, emptyActivity, restoreGame, readActivity, writeActivity, saveKey } from '../src/lib/activity.js';
import { toggleRegion, regionIncludes, validRegion } from '../src/lib/regions.js';
import { createFlatProjection, flatClickCoordinate } from '../src/lib/map.js';
const countries=JSON.parse(readFileSync(new URL('../src/data/countries.json',import.meta.url)));
const flags=JSON.parse(readFileSync(new URL('../src/data/flag-svgs.json',import.meta.url)));
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
test('all 308 municipalities and 50 states have unique, finite clickable geometry',()=>{
  for (const [kind,count] of [['municipios',308],['estados',50]]) {
    const features=JSON.parse(readFileSync(new URL(`../public/maps/${kind}.json`,import.meta.url))).features;
    assert.equal(features.length,count);assert.equal(new Set(features.map(f=>f.id)).size,count);
    const groups=kind==='municipios'?['continente','acores','madeira']:['all'];
    for(const group of groups){const list=group==='all'?features:features.filter(f=>f.properties.group===group);assert.ok(list.length);
      const fc={type:'FeatureCollection',features:list};const projection=kind==='estados'?geoAlbersUsa().fitExtent([[0,0],[1000,600]],fc):geoMercator().fitExtent([[0,0],[1000,600]],fc);const path=geoPath(projection);
      for(const f of list){assert.ok(f.properties.name);assert.ok(geoArea(f)>0&&geoArea(f)<Math.PI*2,f.properties.name);let d=path(f);assert.ok(d&&!/NaN|Infinity/.test(d),f.properties.name);}
    }
  }
});
test('flags used in questions are embedded in the bundle',()=>{for(const c of countries){assert.ok(flags[c.iso2]?.includes('<svg'),c.nome_pt);}});
test('multiple continents form a stable union with separate saved games and scores',()=>{
  let region=toggleRegion('mundo','europa');region=toggleRegion(region,'africa');assert.equal(region,'africa+europa');assert.equal(validRegion(region),true);assert.equal(regionIncludes(region,'asia'),false);
  const pool=countries.filter(c=>c.isCountry&&regionIncludes(region,c.continente));let game=createGame({mode:1,region,includeTerritories:false,pool});game=gameReducer(game,{type:'ANSWER',value:game.queue[0].id});const a=checkpoint(emptyActivity(),game), mem=storage();writeActivity(a,mem);assert.equal(readActivity(countries,mem).saves[saveKey(1,region,false)].queue.length,pool.length);assert.equal(restoreGame(a.saves[saveKey(1,region,false)],countries).score,100);
  saveScore({},game,mem);assert.equal(Object.values(readScores(mem))[0],100);
  assert.equal(toggleRegion(toggleRegion(region,'africa'),'europa'),'mundo');
});
test('retry games persist only the mistaken destinations without affecting full-run records',()=>{
  const pool=countries.filter(c=>c.isCountry&&c.continente==='europa').slice(0,3);const game=createGame({mode:2,region:'europa',includeTerritories:false,pool,practice:true});const saved=checkpoint(emptyActivity(),game).saves[saveKey(2,'europa',false)];const restored=restoreGame(saved,countries);assert.equal(restored.practice,true);assert.equal(restored.queue.length,3);
});
test('capital distances and points behave geographically',()=>{
  assert.ok(capitalDistance([0,0],[0,0])<.001);assert.equal(capitalPoints(0),5000);assert.ok(Math.abs(capitalDistance([0,0],[1,0])-111.2)<1);assert.ok(capitalPoints(100)>capitalPoints(1000));assert.ok(capitalPoints(1000)>capitalPoints(10000));
  const mem=storage();writeExtra('capitais','europa:paises',{queue:['1'],answers:[]},mem);assert.equal(readExtra('capitais','europa:paises',mem).queue[0],'1');assert.equal(readExtra('capitais','europa:territorios',mem),null);
});
test('capital map click inverts pan and zoom including repeated worlds',()=>{
  const p=createFlatProjection(1100,590);const t=zoomIdentity.translate(65,-20).scale(2);const period=2*Math.PI*p.scale();const source=[-9.14,38.72];const point=p(source);for(const offset of [-2,-1,0,1,2]){const result=flatClickCoordinate(t.apply([point[0]+period*offset,point[1]]),t,p);assert.ok(Math.abs(result[0]-source[0])<1e-8);assert.ok(Math.abs(result[1]-source[1])<1e-8);}
});
