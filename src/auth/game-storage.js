/** Guest data stays at its original keys; signed-in games use an isolated UUID namespace. */
const exact=new Set(['geoquest.activity.v1','geoquest.highscores.v2','geokiwi.geoguru.saves.v2','geokiwi.geoguru.records.v2','geokiwi.geoguru.history.v1','geokiwi.stadium.run.v1','geokiwi.stadium.record.v1','geokiwi.country-clues.v1','geokiwi.country-clues.records.v1']);
export const isProgressKey=key=>typeof key==='string'&&(exact.has(key)||/^geokiwi\.explorer\.(run|record)\.v1:(10|20|30)$/.test(key)||/^geokiwi\.extra\.(v1|record):[a-z0-9:+-]{1,150}$/.test(key));
export const validOwner=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export const ownerPrefix=owner=>owner?`geokiwi.account.${owner}.`:'';
export const metaKey=owner=>`${ownerPrefix(owner)}sync-meta`;
let currentOwner=null;
export function setGameStorageOwner(owner){if(owner!==null&&!validOwner(owner))throw Error('Invalid account owner');currentOwner=owner;}
export function readSyncMeta(owner,storage=globalThis.localStorage){try{const v=JSON.parse(storage.getItem(metaKey(owner))||'null');return {revision:Number.isSafeInteger(v?.revision)&&v.revision>=0?v.revision:0,dirty:v?.dirty===true};}catch{return{revision:0,dirty:false};}}
export function writeSyncMeta(owner,value,storage=globalThis.localStorage){storage.setItem(metaKey(owner),JSON.stringify(value));}
export function createGameStorage(owner,storage=globalThis.localStorage,onChange=()=>{}){
 if(owner!==null&&!validOwner(owner))throw Error('Invalid account owner');
 const prefix=ownerPrefix(owner);
 const mark=()=>{if(owner){const meta=readSyncMeta(owner,storage);writeSyncMeta(owner,{...meta,dirty:true},storage);}};
 return {getItem(key){return storage.getItem(isProgressKey(key)?prefix+key:key);},setItem(key,value){const k=isProgressKey(key)?prefix+key:key;const raw=String(value);if(storage.getItem(k)===raw)return;if(isProgressKey(key))mark();storage.setItem(k,raw);if(isProgressKey(key))onChange();},removeItem(key){const k=isProgressKey(key)?prefix+key:key;if(storage.getItem(k)===null)return;if(isProgressKey(key))mark();storage.removeItem(k);if(isProgressKey(key))onChange();}};
}
export function getGameStorage(){return createGameStorage(currentOwner,globalThis.localStorage,()=>globalThis.dispatchEvent?.(new Event('geokiwi:progress-change')));}
export function collectProgress(owner,storage=globalThis.localStorage){
 const prefix=ownerPrefix(owner),snapshot={};
 for(let i=0;i<storage.length;i++){const raw=storage.key(i),key=prefix?raw?.startsWith(prefix)?raw.slice(prefix.length):null:raw;if(isProgressKey(key)){const value=storage.getItem(raw);if(value!==null)snapshot[key]=value;}}
 return snapshot;
}
export function validSnapshot(snapshot){return Boolean(snapshot&&typeof snapshot==='object'&&!Array.isArray(snapshot)&&Object.keys(snapshot).length<=200&&Object.entries(snapshot).every(([k,v])=>isProgressKey(k)&&typeof v==='string'&&v.length<=2_000_000)&&new TextEncoder().encode(JSON.stringify(snapshot)).byteLength+Object.keys(snapshot).length*2<=2_000_000);}
export function applyProgress(owner,snapshot,storage=globalThis.localStorage){
 if(!validSnapshot(snapshot))throw Error('Invalid cloud snapshot');
 const prefix=ownerPrefix(owner),old=collectProgress(owner,storage);
 // Roll back on quota/storage failure rather than silently losing local saves.
 try{for(const key of Object.keys(old))if(!(key in snapshot))storage.removeItem(prefix+key);for(const [key,value]of Object.entries(snapshot))storage.setItem(prefix+key,value);}
 catch(error){try{for(const key of Object.keys(snapshot))storage.removeItem(prefix+key);for(const [key,value]of Object.entries(old))storage.setItem(prefix+key,value);}catch{}throw error;}
}
