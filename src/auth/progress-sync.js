import {collectProgress,applyProgress,readSyncMeta,writeSyncMeta,validSnapshot,validOwner} from './game-storage.js';

/** Serialize reads/writes and use revision compare-and-swap across devices. */
export function createProgressSync({userId,remote,storage=globalThis.localStorage,onStatus=()=>{},onHydrated=()=>{},delay=1200}){
 let active=true,hydrated=false,delivered=false,hydrating=false,timer=null,working=false,resolving=false,pending=false,refreshPending=false,conflict=false;
 if(!validOwner(userId))throw Error('Invalid account owner');
 const abort=new AbortController();
 const status=s=>{if(active)onStatus(s);};
 const metadata=()=>readSyncMeta(userId,storage);
 const deliver=reload=>{if(active){onHydrated(Boolean(reload));delivered=true;}};
 async function hydrate(){
  if(!active||hydrating)return;
  if(working){refreshPending=true;return;}
  hydrating=true;status('loading');
  try{
   const row=await remote.read(userId,abort.signal);if(!active)return;
   const meta=metadata(),revision=row?.revision||0,snapshot=row?.snapshot||{};
   if(!Number.isSafeInteger(revision)||revision<0||!validSnapshot(snapshot))throw Error('Invalid progress');
   // Another tab may have committed while this request was in flight.
   if(revision<meta.revision)throw Error('Stale progress response');
   if(meta.dirty&&meta.revision!==revision){conflict=true;hydrated=true;status('conflict');deliver(false);return;}
   const reload=delivered&&!meta.dirty&&JSON.stringify(collectProgress(userId,storage))!==JSON.stringify(snapshot);
   if(!meta.dirty)applyProgress(userId,snapshot,storage);
   writeSyncMeta(userId,{revision,dirty:meta.dirty},storage);
   conflict=false;hydrated=true;deliver(reload);status(meta.dirty?'pending':'synced');
   pending=pending||meta.dirty;
  }catch{if(active){status('offline');deliver(false);}}
  finally{hydrating=false;if(active&&pending&&hydrated&&!conflict){pending=false;void flush();}}
 }
 async function flush(){
  if(!active||conflict)return;
  if(hydrating){pending=true;return;}
  if(!hydrated){await hydrate();return;}
  if(working){pending=true;return;}
  const meta=metadata();if(!meta.dirty){status('synced');return;}
  working=true;pending=false;status('syncing');
  try{
   const snapshot=collectProgress(userId,storage);if(!validSnapshot(snapshot))throw Error('Progress too large');
   const row=await remote.save(userId,snapshot,meta.revision,abort.signal);if(!active)return;
   if(!row){conflict=true;status('conflict');return;}
   if(!Number.isSafeInteger(row.revision)||row.revision!==meta.revision+1)throw Error('Invalid revision');
   const changedDuringWrite=JSON.stringify(collectProgress(userId,storage))!==JSON.stringify(snapshot);
   const latest=metadata();
   // Never lower a revision shared with another tab.
   writeSyncMeta(userId,{revision:Math.max(row.revision,latest.revision),dirty:changedDuringWrite},storage);
   status(changedDuringWrite?'pending':'synced');pending=pending||changedDuringWrite;
  }catch{if(active)status('offline');}
  finally{
   working=false;
   if(active&&refreshPending){refreshPending=false;void hydrate();}
   else if(active&&pending&&!conflict){pending=false;changed();}
  }
 }
 function changed(){if(!active||conflict)return;clearTimeout(timer);status('pending');timer=setTimeout(()=>{void flush();},delay);}
 async function resolve(choice){
  if(!active||working||hydrating||resolving)return;
  resolving=true;status('loading');
  try{
   const row=await remote.read(userId,abort.signal);if(!active)return;
   const revision=row?.revision||0;
   if(!Number.isSafeInteger(revision)||revision<metadata().revision)throw Error('Stale progress response');
   if(choice==='cloud'){
    if(!validSnapshot(row?.snapshot||{}))throw Error('Invalid progress');
    applyProgress(userId,row?.snapshot||{},storage);writeSyncMeta(userId,{revision,dirty:false},storage);
    conflict=false;hydrated=true;deliver(true);status('synced');
   }else if(choice==='local'){
    writeSyncMeta(userId,{revision,dirty:true},storage);conflict=false;hydrated=true;await flush();
   }else throw Error('Unknown choice');
  }catch{status('offline');}finally{resolving=false;}
 }
 return {hydrate,flush,changed,resolve,stop(){active=false;abort.abort();clearTimeout(timer);}};
}
