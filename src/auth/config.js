export function accountConfig(url,key){
 if(!url&&!key)return null;
 try{const parsed=new URL(url);if(parsed.protocol!=='https:'&&!(parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname)))return null;
  const publishable=typeof key==='string'&&/^sb_publishable_[a-zA-Z0-9_-]{15,}$/.test(key);
  let anon=false;if(typeof key==='string'&&key.startsWith('eyJ')){const part=key.split('.')[1];const claims=JSON.parse(globalThis.atob(part.replace(/-/g,'+').replace(/_/g,'/')));anon=claims.role==='anon';}
  return publishable||anon?{url:parsed.origin,key}:null;
 }catch{return null;}
}
