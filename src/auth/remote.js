export function progressRemote(client){return {
 async read(userId,signal){const {data,error}=await client.from('game_progress').select('snapshot,revision').eq('user_id',userId).maybeSingle().abortSignal(signal);if(error)throw error;return data;},
 async save(userId,snapshot,revision,signal){const {data,error}=await client.rpc('save_game_progress',{p_user_id:userId,p_snapshot:snapshot,p_expected_revision:revision}).abortSignal(signal);if(error)throw error;return data?.[0]||null;},
};}
export const validDisplayName=name=>typeof name==='string'&&name.trim().length>=2&&name.trim().length<=24&&!/[\u0000-\u001f\u007f]/.test(name);
export async function loadProfile(client,user){
 const initial=user.user_metadata?.display_name;
 const displayName=validDisplayName(initial)?initial.trim():'Kiwi';
 // Ignore an existing row so stale signup metadata never resets the edited nickname.
 const {error:insertError}=await client.from('profiles').upsert({id:user.id,display_name:displayName},{onConflict:'id',ignoreDuplicates:true});if(insertError)throw insertError;
 const {data,error}=await client.from('profiles').select('display_name,avatar_path').eq('id',user.id).single();if(error)throw error;return data;
}

export async function loadDailyStreak(client) {
 const {data,error}=await client.rpc('get_my_daily_streak');
 if(error)throw error;
 return data?.[0]||{current_streak:0,best_streak:0,last_completed_date:null};
}
