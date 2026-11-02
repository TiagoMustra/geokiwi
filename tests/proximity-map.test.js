import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { wrapLongitude, validMapPoint, countryAtPoint, initialProximityBounds, guessConnection, physicalAnswerFeature, revealMapBounds } from '../src/lib/proximity-map.js';
import { mapPoliticalFeature } from '../src/lib/catalog.js';
import { scoreCapitalGuess } from '../src/lib/extra-game.js';
const topology=JSON.parse(readFileSync(new URL('../src/data/world.json',import.meta.url)));
const land=feature(topology,topology.objects.countries).features.map(f=>mapPoliticalFeature({...f,id:String(f.id).padStart(3,'0')}));

test('physical-map clicks wrap repeated worlds and retain the capital country scoring rule',()=>{
  for(const longitude of [-8,352,-368]){
    const country=countryAtPoint([longitude,40],land);
    assert.equal(country,'620');
    assert.equal(scoreCapitalGuess(0,country,'620').points,100);
  }
  assert.equal(countryAtPoint([-40,0],land),null);
  assert.equal(countryAtPoint([16.37,48.21],land),'040');
  assert.equal(scoreCapitalGuess(400,'040','756').points,25);
  assert.equal(countryAtPoint([0,NaN],land),null);
  assert.equal(validMapPoint([0,89]),false);
  assert.equal(wrapLongitude(181),-179);
});
test('initial camera uses the selected continent union, including Oceania across the date line',()=>{
  assert.deepEqual(initialProximityBounds('europa'),[[-26,33],[48,81]]);
  assert.deepEqual(initialProximityBounds('africa+europa'),[[-26,-56],[65,81]]);
  assert.deepEqual(initialProximityBounds('oceania'),[[90,-55],[235,30]]);
  assert.deepEqual(initialProximityBounds(),[[-180,-58],[180,80]]);
});
test('answer connections follow the short route across the date line',()=>{
  const line=guessConnection([179,0],[-179,1]).features[0].geometry.coordinates;
  assert.deepEqual(line,[[179,0],[181,1]]);
  assert.deepEqual(guessConnection(null,[0,0]).features,[]);
  const bounds=revealMapBounds({type:'MultiPoint',coordinates:[[179,0],[-179,1]]});
  assert.ok(bounds[1][0]-bounds[0][0]<3);
  const reveal=revealMapBounds(null,[-179,0],[179,1]);
  assert.ok(reveal[1][0]-reveal[0][0]<3);
});
test('reveals preserve river/area geometry and include both the answer and guess in the camera',()=>{
  const river={type:'LineString',coordinates:[[1,1],[2,2],[3,1]]};
  const collection=physicalAnswerFeature(river);
  assert.deepEqual(collection.features[0].geometry,river);
  assert.strictEqual(physicalAnswerFeature(collection),collection);
  assert.deepEqual(physicalAnswerFeature(null).features,[]);
  assert.deepEqual(revealMapBounds(river,null,[5,3]),[[1,1],[5,3]]);
  assert.equal(revealMapBounds(null,null),null);
});
test('physical style has rivers, lakes and terrain, with a fixed flat projection and no answer labels',()=>{
  const style=JSON.parse(readFileSync(new URL('../public/maps/proximity-style.json',import.meta.url)));
  assert.equal(style.projection.type,'mercator');
  assert.equal(style.sources['geokiwi-relief'].type,'raster-dem');
  assert.equal(style.sources['geokiwi-relief'].encoding,'terrarium');
  assert.ok(style.layers.some(l=>l.type==='hillshade'));
  assert.ok(style.layers.some(l=>l['source-layer']==='water'));
  assert.ok(style.layers.some(l=>l['source-layer']==='waterway'));
  assert.ok(!style.layers.some(l=>l.type==='symbol'));
});
