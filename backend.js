/* NO SIGNAL cloud adapter. Optional: local mode still works when unconfigured. */
(function(){
  const config = window.NO_SIGNAL_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.supabaseUrl || "") &&
    typeof config.supabaseAnonKey === "string" && config.supabaseAnonKey.length > 20;
  let clientPromise = null;
  function client(){
    if(!configured) return Promise.reject(new Error("Supabase ещё не настроен"));
    if(!clientPromise) clientPromise = new Promise((resolve,reject)=>{
      if(window.supabase?.createClient) return resolve(window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
      const script=document.createElement("script");
      script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload=()=>window.supabase?.createClient?resolve(window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})):reject(new Error("Не удалось загрузить клиент Supabase"));
      script.onerror=()=>reject(new Error("Нет соединения для загрузки клиента Supabase"));
      document.head.appendChild(script);
    });
    return clientPromise;
  }
  async function session(){if(!configured)return {configured:false,user:null};const c=await client();const {data,error}=await c.auth.getSession();if(error)throw error;return {configured:true,user:data.session?.user||null,client:c}}
  async function signIn(email,password){const c=await client();const {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;return data.user}
  async function signUp(email,password){const c=await client();const {data,error}=await c.auth.signUp({email,password});if(error)throw error;return data}
  async function signOut(){const c=await client();const {error}=await c.auth.signOut();if(error)throw error}
  async function syncLibrary(local){
    const state=await session();if(!state.user)throw new Error("Сначала войди в аккаунт");
    const c=state.client;
    const {data:remote,error}=await c.from("user_library").select("album_id,saved,reaction,opened_at").eq("user_id",state.user.id);
    if(error)throw error;
    const merged={...local,saved:[...new Set([...(local.saved||[]),...(remote||[]).filter(x=>x.saved).map(x=>x.album_id)])],reactions:{...(local.reactions||{})},read:[...new Set([...(local.read||[]),...(remote||[]).filter(x=>x.opened_at).map(x=>x.album_id)])]};
    for(const row of remote||[])if(row.reaction&&!merged.reactions[row.album_id])merged.reactions[row.album_id]=row.reaction;
    const ids=new Set([...(merged.saved||[]),...(merged.read||[]),...Object.keys(merged.reactions||{})]);
    const rows=[...ids].map(id=>({user_id:state.user.id,album_id:id,saved:(merged.saved||[]).includes(id),reaction:merged.reactions?.[id]||null,opened_at:(merged.read||[]).includes(id)?new Date().toISOString():null,updated_at:new Date().toISOString()}));
    if(rows.length){const {error:upsertError}=await c.from("user_library").upsert(rows,{onConflict:"user_id,album_id"});if(upsertError)throw upsertError}
    return merged;
  }
  async function getTodayIssue(date=new Date().toLocaleDateString("en-CA")){
    const c=await client();const {data,error}=await c.from("daily_issues").select("issue_date,album_id,headline,editor_note,albums(id,artist,title,release_year,genre,cover_url,spotify_url,description)").eq("issue_date",date).eq("published",true).maybeSingle();if(error)throw error;return data;
  }
  window.NoSignalBackend={configured,session,signIn,signUp,signOut,syncLibrary,getTodayIssue};
})();
