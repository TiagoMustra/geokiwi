import { loadEnv } from 'vite';
import { accountConfig } from '../src/auth/config.js';
const env={...loadEnv('production',process.cwd(),'VITE_'),...process.env};
const url=env.VITE_SUPABASE_URL,key=env.VITE_SUPABASE_PUBLISHABLE_KEY||env.VITE_SUPABASE_ANON_KEY;
if((url||key)&&!accountConfig(url,key)){console.error('Invalid Supabase configuration: provide the project URL and a publishable/anon key. Secret/service_role keys are forbidden in browser builds.');process.exit(1);}
console.log(url?'Account configuration: public client credentials validated.':'Account configuration: guest mode (Supabase project not configured).');
