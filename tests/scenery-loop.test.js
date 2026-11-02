import test from 'node:test';
import assert from 'node:assert/strict';
import {createSceneryLoop}from'../src/lib/scenery-loop.js';
function harness(){let active=true,id=0;const tasks=new Map(),times=[];const loop=createSceneryLoop({draw:t=>times.push(t),canRun:()=>active,requestFrame:fn=>{tasks.set(++id,fn);return id;},cancelFrame:id=>tasks.delete(id)});return{loop,times,tasks,setActive:value=>{active=value;},step:now=>{const callbacks=[...tasks.values()];tasks.clear();callbacks.forEach(fn=>fn(now));}};}
test('returning to a visible tab immediately restarts frames without a React render or unrelated DOM update',()=>{
 const h=harness();h.loop.sync();h.step(1000);h.step(1100);assert.deepEqual(h.times,[0,.1]);
 h.setActive(false);h.loop.sync();assert.equal(h.tasks.size,0);
 h.setActive(true);h.loop.sync();assert.equal(h.tasks.size,1);h.step(10000);h.step(10100);assert.deepEqual(h.times,[0,.1,.1,.2]);
 h.loop.destroy();assert.equal(h.tasks.size,0);
});
test('low frame rates retain real-time animation speed, while hidden time is excluded',()=>{
 const h=harness();h.loop.sync();h.step(1000);h.step(1500);h.step(2500);assert.deepEqual(h.times,[0,.5,1.5]);
 h.setActive(false);h.step(3000);h.setActive(true);h.loop.sync();h.step(20000);h.step(21000);assert.equal(h.times.at(-1),2.5);h.loop.destroy();
});
test('repeated focus and visibility events never duplicate the frame loop, and cleanup cannot restart it',()=>{
 const h=harness();for(let i=0;i<5;i++)h.loop.sync();assert.equal(h.tasks.size,1);h.step(1000);h.step(1010);assert.equal(h.times.length,1);h.step(1050);assert.equal(h.times.length,2);
 h.loop.destroy();h.loop.sync();assert.equal(h.tasks.size,0);
});
