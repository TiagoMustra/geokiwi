import test from 'node:test';import assert from 'node:assert/strict';
import {createGameStorage,collectProgress,applyProgress,readSyncMeta,writeSyncMeta,isProgressKey,ownerPrefix,validSnapshot} from '../src/auth/game-storage.js';
import {createProgressSync} from '../src/auth/progress-sync.js';
import {accountConfig} from '../src/auth/config.js';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',key='geokiwi.stadium.record.v1';
function memory(){const m=new Map();return {get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
test('guest, A and B never share game state; preferences remain device-wide and tokens never sync',()=>{
 const raw=memory(),guest=createGameStorage(null,raw),a=createGameStorage(A,raw),b=createGameStorage(B,raw);
 guest.setItem(key,'900');a.setItem(key,'100');b.setItem(key,'200');
 assert.equal(guest.getItem(key),'900');assert.equal(a.getItem(key),'100');assert.equal(b.getItem(key),'200');
 guest.setItem('geoquest.preferences.v1','light');assert.equal(a.getItem('geoquest.preferences.v1'),'light');
 raw.setItem('sb-example-auth-token','secret');assert.deepEqual(collectProgress(A,raw),{[key]:'100'});assert.deepEqual(collectProgress(null,raw),{[key]:'900'});
 assert.equal(readSyncMeta(A,raw).dirty,true);assert.equal(isProgressKey('sb-example-auth-token'),false);assert.equal(isProgressKey('geokiwi.locale.v1'),false);
});
test('all game families sync raw strings and removed cloud saves do not resurrect',()=>{
 for(const k of ['geoquest.activity.v1','geoquest.highscores.v2','geokiwi.geoguru.saves.v2','geokiwi.geoguru.history.v1','geokiwi.country-clues.v1','geokiwi.explorer.run.v1:10','geokiwi.extra.v1:municipios:mundo:distrito:11','geokiwi.extra.record:capitais:europa:paises:sem-verde:v2',key])assert.ok(isProgressKey(k),k);
 const raw=memory();applyProgress(A,{[key]:'100','geokiwi.stadium.run.v1':'{"index":1}'},raw);applyProgress(A,{[key]:'200'},raw);
 assert.deepEqual(collectProgress(A,raw),{[key]:'200'});assert.equal(raw.getItem(ownerPrefix(A)+'geokiwi.stadium.run.v1'),null);
 assert.equal(validSnapshot({'sb-auth':'token'}),false);assert.equal(validSnapshot({[key]:{score:1}}),false);
 assert.throws(()=>applyProgress(A,{'sb-auth':'token'},raw));
});
test('initial cloud read hydrates without upload and local changes use revision compare-and-swap',async()=>{
 const raw=memory(),writes=[],statuses=[];let rev=2;
 const remote={read:async()=>({snapshot:{[key]:'100'},revision:rev}),save:async(id,snapshot,expected)=>{writes.push({id,snapshot,expected});return {revision:++rev}}};
 const sync=createProgressSync({userId:A,remote,storage:raw,onStatus:s=>statuses.push(s)});await sync.hydrate();assert.equal(writes.length,0);assert.equal(createGameStorage(A,raw).getItem(key),'100');
 createGameStorage(A,raw).setItem(key,'500');await sync.flush();assert.deepEqual(writes[0],{id:A,snapshot:{[key]:'500'},expected:2});assert.equal(readSyncMeta(A,raw).dirty,false);assert.equal(statuses.at(-1),'synced');sync.stop();
});
test('another-device edits require explicit conflict resolution and cannot silently overwrite dirty saves',async()=>{
 const raw=memory();createGameStorage(A,raw).setItem(key,'300');writeSyncMeta(A,{revision:1,dirty:true},raw);let writes=0;
 const remote={read:async()=>({snapshot:{[key]:'700'},revision:2}),save:async()=>{writes++;return {revision:3}}};const statuses=[];
 const sync=createProgressSync({userId:A,remote,storage:raw,onStatus:s=>statuses.push(s)});await sync.hydrate();assert.equal(statuses.at(-1),'conflict');assert.equal(collectProgress(A,raw)[key],'300');await sync.flush();assert.equal(writes,0);
 await sync.resolve('cloud');assert.equal(collectProgress(A,raw)[key],'700');assert.equal(readSyncMeta(A,raw).dirty,false);sync.stop();
});
test('CAS conflict and logout during hydration preserve data and ignore late responses',async()=>{
 const raw=memory(),d=deferred();const sync=createProgressSync({userId:A,storage:raw,remote:{read:()=>d.promise}});const pending=sync.hydrate();sync.stop();d.resolve({snapshot:{[key]:'900'},revision:4});await pending;assert.deepEqual(collectProgress(A,raw),{});assert.deepEqual(collectProgress(B,raw),{});
 const statuses=[],sync2=createProgressSync({userId:A,storage:raw,remote:{read:async()=>null,save:async()=>null},onStatus:s=>statuses.push(s)});await sync2.hydrate();createGameStorage(A,raw).setItem(key,'100');await sync2.flush();assert.equal(statuses.at(-1),'conflict');assert.equal(readSyncMeta(A,raw).dirty,true);sync2.stop();
});
test('offline dirty changes remain queued and retry only uploads after a successful read',async()=>{
 const raw=memory(),statuses=[];let offline=true,calls=0;
 const remote={read:async()=>{if(offline)throw Error('offline');return null},save:async()=>{calls++;return {revision:1}}};
 const sync=createProgressSync({userId:A,remote,storage:raw,onStatus:s=>statuses.push(s)});await sync.hydrate();createGameStorage(A,raw).setItem(key,'400');await sync.flush();assert.equal(calls,0);assert.equal(readSyncMeta(A,raw).dirty,true);offline=false;await sync.hydrate();assert.equal(calls,1);assert.equal(readSyncMeta(A,raw).dirty,false);sync.stop();
});
test('browser config accepts only public credentials and refuses service keys',()=>{
 assert.equal(accountConfig(),null);assert.equal(accountConfig('https://example.supabase.co','sb_secret_abcdefghijklmnop'),null);
 assert.equal(accountConfig('javascript:alert(1)','sb_publishable_abcdefghijklmnop'),null);
 assert.ok(accountConfig('https://example.supabase.co','sb_publishable_abcdefghijklmnop'));
 const jwt=role=>'eyJhbGciOiJIUzI1NiJ9.'+btoa(JSON.stringify({role}))+'.signature';assert.ok(accountConfig('https://example.supabase.co',jwt('anon')));assert.equal(accountConfig('https://example.supabase.co',jwt('service_role')),null);
});
test('a newer cloud snapshot remounts already hydrated game state before it can write stale saves',async()=>{
 const raw=memory(),reloads=[];let revision=1;
 const remote={read:async()=>({snapshot:{[key]:String(revision*100)},revision}),save:async()=>{throw Error('unexpected write')}};
 const sync=createProgressSync({userId:A,remote,storage:raw,onHydrated:reload=>reloads.push(reload)});await sync.hydrate();assert.deepEqual(reloads,[false]);revision=2;await sync.hydrate();assert.deepEqual(reloads,[false,true]);assert.equal(collectProgress(A,raw)[key],'200');sync.stop();
});
test('a failed snapshot read during upload releases the sync lock and retains dirty data',async()=>{
 const raw=memory();let fail=false;const broken={get length(){if(fail)throw Error('blocked');return raw.length},key:raw.key,getItem:raw.getItem,setItem:raw.setItem,removeItem:raw.removeItem};
 let calls=0;const statuses=[];const sync=createProgressSync({userId:A,storage:broken,onStatus:s=>statuses.push(s),remote:{read:async()=>null,save:async()=>{calls++;return {revision:1}}}});await sync.hydrate();createGameStorage(A,broken).setItem(key,'250');fail=true;await sync.flush();assert.equal(statuses.at(-1),'offline');assert.equal(calls,0);fail=false;await sync.flush();assert.equal(calls,1);assert.equal(readSyncMeta(A,raw).dirty,false);sync.stop();
});
test('hydration and upload serialize; an older read from another tab never lowers a persisted revision',async()=>{
 const raw=memory(),read=deferred();let reads=0,writes=0;
 const sync=createProgressSync({userId:A,storage:raw,remote:{read:async()=>++reads===1?{snapshot:{[key]:'100'},revision:1}:read.promise,save:async()=>{writes++;return {revision:2}}}});
 await sync.hydrate();const refresh=sync.hydrate();createGameStorage(A,raw).setItem(key,'200');await sync.flush();assert.equal(writes,0);read.resolve({snapshot:{[key]:'100'},revision:1});await refresh;await new Promise(r=>setTimeout(r,0));assert.equal(writes,1);assert.equal(collectProgress(A,raw)[key],'200');assert.equal(readSyncMeta(A,raw).revision,2);sync.stop();
 const stale=deferred(),statuses=[];const sync2=createProgressSync({userId:A,storage:raw,onStatus:s=>statuses.push(s),remote:{read:()=>stale.promise}});const hydration=sync2.hydrate();writeSyncMeta(A,{revision:3,dirty:false},raw);stale.resolve({snapshot:{[key]:'100'},revision:1});await hydration;assert.equal(collectProgress(A,raw)[key],'200');assert.equal(readSyncMeta(A,raw).revision,3);assert.equal(statuses.at(-1),'offline');sync2.stop();
});
test('accepted refresh clears a conflict resolved by another tab',async()=>{
 const raw=memory();createGameStorage(A,raw).setItem(key,'300');writeSyncMeta(A,{revision:1,dirty:true},raw);let writes=0;
 const sync=createProgressSync({userId:A,storage:raw,remote:{read:async()=>({snapshot:{[key]:'700'},revision:2}),save:async()=>{writes++;return {revision:3}}}});await sync.hydrate();applyProgress(A,{[key]:'700'},raw);writeSyncMeta(A,{revision:2,dirty:false},raw);await sync.hydrate();createGameStorage(A,raw).setItem(key,'800');await sync.flush();assert.equal(writes,1);sync.stop();
});
test('snapshot budget measures UTF-8 bytes, including JSONB whitespace margin',()=>{
 assert.equal(validSnapshot({[key]:'a'.repeat(900_000)}),true);assert.equal(validSnapshot({[key]:'é'.repeat(1_000_000)}),false);
});
