import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_CATEGORIES, categoryHasGame } from '../src/lib/categories.js';

test('the nine games are all present exactly once in the intended expandable groups', () => {
  assert.deepEqual(GAME_CATEGORIES.flatMap(group => group.games).sort((a,b) => a-b),[1,2,3,4,5,6,7,8,9]);
  assert.deepEqual(GAME_CATEGORIES.find(group => group.id === 'capitais').games,[3,4,6]);
  assert.deepEqual(GAME_CATEGORIES.find(group => group.id === 'paises').games,[1,2]);
  assert.deepEqual(GAME_CATEGORIES.find(group => group.id === 'regionais').games,[5,7,8]);
  assert.deepEqual(GAME_CATEGORIES.find(group => group.id === 'desafios').games,[9]);
  assert.equal(categoryHasGame(GAME_CATEGORIES[1],6),true);
  assert.equal(categoryHasGame(GAME_CATEGORIES[1],7),false);
});
