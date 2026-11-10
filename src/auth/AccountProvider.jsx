import { createContext,useContext,useEffect,useRef,useState } from 'react';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { supabase } from './client.js';
import { createProgressSync } from './progress-sync.js';
import { progressRemote,loadProfile } from './remote.js';
import {setGameStorageOwner,collectProgress,applyProgress,writeSyncMeta,readSyncMeta,ownerPrefix,metaKey} from './game-storage.js';

const safeProgress=owner=>{try{return collectProgress(owner);}catch{return {};}};
const Context=createContext({available:false,user:null,ready:true,status:'guest',profile:null,dataEpoch:0,recovery:false,client:null});
export const useAccount=()=>useContext(Context);
export default function AccountProvider({children,client=supabase,remoteFactory=progressRemote}){
 const {locale}=useLocale();
 const [sessionState,setSessionState]=useState({known:!client,session:null,recovery:false}),[hydration,setHydration]=useState({owner:null,ready:!client,status:'guest'}),[profileState,setProfileState]=useState(null),[dataEpoch,setEpoch]=useState(0);
 const syncRef=useRef(null),lastProfile=useRef(0);
 const user=sessionState.session?.user||null,owner=user?.id||null;
 useEffect(()=>{
  if(!client)return;
  let active=true,seenEvent=false;
  const {data}=client.auth.onAuthStateChange((event,session)=>{if(!active)return;seenEvent=true;setSessionState(old=>({known:true,session,recovery:event==='SIGNED_OUT'?false:old.recovery||event==='PASSWORD_RECOVERY'||(event==='INITIAL_SESSION'&&new URLSearchParams(location.search).get('auth')==='recovery'&&Boolean(session))}));});
  client.auth.getSession().then(({data,error})=>{if(active&&!seenEvent)setSessionState({known:true,session:error?null:data.session,recovery:Boolean(!error&&data.session&&new URLSearchParams(location.search).get('auth')==='recovery')});}).catch(()=>{if(active&&!seenEvent)setSessionState({known:true,session:null,recovery:false});});
  return()=>{active=false;data.subscription.unsubscribe();};
 },[client]);
 useEffect(()=>{
  if(!sessionState.known)return;
  setGameStorageOwner(owner);setProfileState(null);lastProfile.current++;
  if(!owner){setHydration({owner:null,ready:true,status:'guest'});return;}
  setHydration({owner,ready:false,status:'loading'});
  let sync;try{sync=createProgressSync({userId:owner,remote:remoteFactory(client),onStatus:status=>setHydration(old=>old.owner===owner?{...old,status}:old),onHydrated:reload=>{setHydration(old=>old.owner===owner?{...old,ready:true}:old);if(reload)setEpoch(e=>e+1);}});}catch{setHydration({owner,ready:true,status:'offline'});return;}
  syncRef.current=sync;
  const changed=()=>sync.changed(),online=()=>{void sync.hydrate();};
  let tabTimer;
  const otherTab=event=>{
   if(event.key!==null&&(!event.key.startsWith(ownerPrefix(owner))||event.key===metaKey(owner)))return;
   // Unmount stale React state before it can save over another tab’s cache.
   setHydration(old=>old.owner===owner?{...old,ready:false}:old);
   clearTimeout(tabTimer);tabTimer=setTimeout(()=>{setEpoch(e=>e+1);void sync.hydrate();},50);
  };
  window.addEventListener('storage',otherTab);
  window.addEventListener('geokiwi:progress-change',changed);window.addEventListener('online',online);
  const visibility=()=>{if(!document.hidden)void sync.hydrate();};document.addEventListener('visibilitychange',visibility);
  void sync.hydrate();
  const ticket=lastProfile.current;
  loadProfile(client,user).then(profile=>{if(ticket===lastProfile.current)setProfileState({owner,...profile});}).catch(()=>{});
  return()=>{clearTimeout(tabTimer);window.removeEventListener('storage',otherTab);lastProfile.current++;sync.stop();syncRef.current=null;window.removeEventListener('geokiwi:progress-change',changed);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visibility);};
 },[client,remoteFactory,owner,sessionState.known]);
 const ready=sessionState.known&&hydration.owner===owner&&hydration.ready;
 const value={available:Boolean(client),client,user,ready,status:hydration.owner===owner?hydration.status:'loading',profile:profileState?.owner===owner?profileState:null,dataEpoch,recovery:sessionState.recovery,
  async retry(){await syncRef.current?.hydrate();},
  async resolve(choice){await syncRef.current?.resolve(choice);},
  async signOut(){const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;},
  async updateProfile(name){const {error}=await client.from('profiles').update({display_name:name.trim()}).eq('id',owner);if(error)throw error;setProfileState({owner,display_name:name.trim()});},
  dismissRecovery(){setSessionState(s=>({...s,recovery:false}));if(new URLSearchParams(location.search).get('auth')==='recovery')history.replaceState(null,'',location.pathname);},
  canImport:ready&&Boolean(owner)&&Object.keys(safeProgress(null)).length>0&&Object.keys(safeProgress(owner)).length===0,
  importGuest(){if(!owner||!ready||Object.keys(safeProgress(owner)).length)return;const snapshot=collectProgress(null);applyProgress(owner,snapshot);const meta=readSyncMeta(owner);writeSyncMeta(owner,{...meta,dirty:true});setEpoch(e=>e+1);syncRef.current?.changed();},
 };
 return <Context.Provider value={value}>{ready?children:<main className="account-loading" role="status">{locale==='en'?'Preparing your account…':'A preparar a tua conta…'}</main>}</Context.Provider>;
}
