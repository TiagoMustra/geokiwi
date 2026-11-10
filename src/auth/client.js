import { createClient } from '@supabase/supabase-js';
import { accountConfig } from './config.js';
const config=accountConfig(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY);
export const supabase=config?createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}}):null;
export const authReturnUrl=()=>`${globalThis.location.origin}/`;
export const passwordReturnUrl=()=>`${globalThis.location.origin}/?auth=recovery`;
