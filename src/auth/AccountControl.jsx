import {useEffect,useState} from 'react';
import {useAccount} from './AccountProvider.jsx';
import {useLocale} from '../i18n/LocaleContext.jsx';
import {validDisplayName} from './remote.js';
import {authReturnUrl,passwordReturnUrl} from './client.js';
import Modal from '../components/Modal.jsx';
import {Icon} from '../components/Icon.jsx';
import './account.css';

const errorText=(error,en)=>{
 const code=error?.code||'';
 if(code==='invalid_credentials')return en?'Email or password is incorrect.':'O email ou a palavra-passe não está correto.';
 if(code==='email_not_confirmed')return en?'Confirm your email before signing in.':'Confirma o teu email antes de entrar.';
 if(code==='user_already_exists')return en?'This account already exists. Try signing in.':'Esta conta já existe. Experimenta entrar.';
 if(/rate|over_/.test(code)||error?.status===429)return en?'Too many requests. Please try again later.':'Demasiados pedidos. Tenta novamente mais tarde.';
 if(code==='weak_password')return en?'Choose a stronger password with at least 8 characters.':'Escolhe uma palavra-passe mais forte, com pelo menos 8 caracteres.';
 return en?'Could not complete the request. Please try again.':'Não foi possível concluir o pedido. Tenta novamente.';
};
export default function AccountControl(){
 const account=useAccount(),{locale}=useLocale(),en=locale==='en',say=(pt,eng)=>en?eng:pt;
 const [open,setOpen]=useState(false),[mode,setMode]=useState('login'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[nickname,setNickname]=useState('');
 useEffect(()=>{if(account.recovery){setMode('recovery');setOpen(true);}},[account.recovery]);
 useEffect(()=>{setNickname(account.profile?.display_name||'');},[account.profile?.display_name]);
 if(!account.available)return null;
 const switchMode=next=>{setMode(next);setError('');setNotice('');};
 const close=()=>{if(busy)return;setOpen(false);setError('');setNotice('');if(account.recovery)account.dismissRecovery();};
 async function submit(event){
  event.preventDefault();if(busy)return;setError('');setNotice('');
  const form=new FormData(event.currentTarget),email=String(form.get('email')||'').trim(),password=String(form.get('password')||''),name=String(form.get('nickname')||'').trim();
  if(mode==='signup'&&!validDisplayName(name)){setError(say('O nome deve ter entre 2 e 24 caracteres.','Your name must contain 2–24 characters.'));return;}
  if(['signup','recovery'].includes(mode)&&password.length<8){setError(say('Usa pelo menos 8 caracteres na palavra-passe.','Use at least 8 characters in your password.'));return;}
  setBusy(true);
  try{
   let response;
   if(mode==='signup'){response=await account.client.auth.signUp({email,password,options:{emailRedirectTo:authReturnUrl(),data:{display_name:name}}});if(!response.error){setNotice(say('Confirma a tua conta através do email que enviámos. Depois podes entrar.','Confirm your account using the email we sent. You can then sign in.'));if(response.data?.session){setOpen(false);}}}
   else if(mode==='reset'){response=await account.client.auth.resetPasswordForEmail(email,{redirectTo:passwordReturnUrl()});if(!response.error)setNotice(say('Se existir uma conta com esse email, receberás instruções para recuperar o acesso.','If an account exists for that email, you will receive recovery instructions.'));}
   else if(mode==='recovery'){response=await account.client.auth.updateUser({password});if(!response.error){account.dismissRecovery();setOpen(false);setMode('login');}}
   else{response=await account.client.auth.signInWithPassword({email,password});if(!response.error)setOpen(false);}
   if(response.error)setError(errorText(response.error,en));
  }catch(error){setError(errorText(error,en));}finally{setBusy(false);}
 }
 async function saveProfile(event){event.preventDefault();if(busy)return;if(!validDisplayName(nickname)){setError(say('O nome deve ter entre 2 e 24 caracteres.','Your name must contain 2–24 characters.'));return;}setBusy(true);setError('');try{await account.updateProfile(nickname);setNotice(say('Nome guardado.','Name saved.'));}catch(e){setError(errorText(e,en));}finally{setBusy(false);}}
 const syncing={loading:say('A carregar o progresso…','Loading progress…'),syncing:say('A guardar na conta…','Saving to your account…'),pending:say('Alterações por guardar…','Changes waiting to sync…'),synced:say('Progresso guardado na conta','Progress saved to your account'),offline:say('Sem ligação à conta. O progresso fica neste dispositivo até voltar a sincronizar.','Cannot reach your account. Progress stays on this device until it can sync.'),conflict:say('Há alterações neste dispositivo e noutra sessão. Escolhe o progresso que queres manter.','Progress changed on this device and another session. Choose which progress to keep.')};
 return <>
  <button className="account-trigger" onClick={()=>{setOpen(true);if(!account.recovery)switchMode('login');}}><Icon name="user" size={17}/><span>{account.user?(account.profile?.display_name||say('Conta','Account')):say('Entrar','Sign in')}</span></button>
  {open&&<Modal title={account.recovery?say('Nova palavra-passe','New password'):account.user?say('A tua conta','Your account'):mode==='signup'?say('Criar conta','Create account'):mode==='reset'?say('Recuperar acesso','Recover access'):say('Entrar no GeoKiwi','Sign in to GeoKiwi')} kicker="GEOKIWI" className="account-modal" onClose={close}>
   {account.user&&!account.recovery?<>
    <p className="account-email">{account.user.email}</p>
    <form className="account-form" onSubmit={saveProfile}><label htmlFor="account-name">{say('Nome público','Display name')}</label><input id="account-name" name="nickname" required minLength={2} maxLength={24} autoComplete="nickname" value={nickname} onChange={e=>setNickname(e.target.value)} disabled={busy}/><button className="secondary-button" disabled={busy||!account.profile}>{say('Guardar nome','Save name')}</button></form>
    <p className={`account-sync is-${account.status}`} role="status">{syncing[account.status]||''}</p>
    {account.status==='offline'&&<button className="secondary-button" disabled={busy} onClick={()=>{void account.retry();}}>{say('Tentar sincronizar','Retry sync')}</button>}
    {account.status==='conflict'&&<div className="account-conflict"><button className="secondary-button" onClick={()=>{void account.resolve('local');}}>{say('Manter o deste dispositivo','Keep this device’s progress')}</button><button className="secondary-button" onClick={()=>{void account.resolve('cloud');}}>{say('Usar o guardado na conta','Use progress saved in the account')}</button></div>}
    {account.canImport&&<div className="account-import"><p>{say('Tens partidas de convidado neste navegador. Podes copiá-las para esta conta.','You have guest games in this browser. You can copy them into this account.')}</p><button className="secondary-button" onClick={()=>{try{account.importGuest();setNotice(say('Progresso importado.','Progress imported.'));}catch(e){setError(errorText(e,en));}}}>{say('Importar partidas locais','Import local games')}</button></div>}
    <button className="account-signout" disabled={busy} onClick={async()=>{setBusy(true);try{await account.signOut();setOpen(false);}catch(e){setError(errorText(e,en));}finally{setBusy(false);}}}>{say('Terminar sessão','Sign out')}</button>
   </>:<>
    {!account.recovery&&<p>{say('Guarda o teu progresso e continua noutro dispositivo. Também podes continuar a jogar sem conta.','Save your progress and continue on another device. You can also keep playing without an account.')}</p>}
    <form className="account-form" onSubmit={submit}>
     {mode==='signup'&&<><label htmlFor="auth-name">{say('Nome público','Display name')}</label><input id="auth-name" name="nickname" required minLength={2} maxLength={24} autoComplete="nickname" disabled={busy}/></>}
     {!account.recovery&&<><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" autoComplete="email" required disabled={busy}/></>}
     {mode!=='reset'&&<><label htmlFor="auth-password">{say('Palavra-passe','Password')}</label><input id="auth-password" name="password" type="password" required minLength={mode==='login'?1:8} maxLength={128} autoComplete={mode==='login'?'current-password':'new-password'} disabled={busy}/></>}
     <button className="primary-button" type="submit" disabled={busy}>{busy?say('Aguarda…','Please wait…'):mode==='signup'?say('Criar conta','Create account'):mode==='reset'?say('Enviar email','Send email'):account.recovery?say('Guardar palavra-passe','Save password'):say('Entrar','Sign in')}</button>
    </form>
    {!account.recovery&&<div className="account-links"><button disabled={busy} onClick={()=>switchMode(mode==='signup'?'login':'signup')}>{mode==='signup'?say('Já tenho conta','I already have an account'):say('Criar conta','Create account')}</button><button disabled={busy} onClick={()=>switchMode(mode==='reset'?'login':'reset')}>{mode==='reset'?say('Voltar a entrar','Back to sign in'):say('Esqueci a palavra-passe','Forgot password')}</button></div>}
   </>}
   {error&&<p className="account-message is-error" role="alert">{error}</p>}{notice&&<p className="account-message" role="status">{notice}</p>}
  </Modal>}
 </>;
}
