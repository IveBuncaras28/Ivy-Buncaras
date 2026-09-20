/* Shared helpers. Requires supabase-config.js (window.supabaseClient) loaded first. */

function dbReady(){
  return !!window.supabaseClient;
}

function notConfiguredNotice(el, extra){
  el.innerHTML = `<div class="empty">This section isn't connected to a database yet.${extra?` ${extra}`:''}<br>Fill in <code>assets/supabase-config.js</code> with your Supabase project URL and key to turn it on.</div>`;
}

function renderMarkdown(md){
  const raw = (window.marked && (window.marked.parse ? window.marked.parse(md) : window.marked(md))) || md.replace(/\n/g,'<br>');
  return window.DOMPurify ? window.DOMPurify.sanitize(raw) : raw;
}

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtDate(iso){
  try{ return new Date(iso).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}); }
  catch(e){ return iso; }
}

async function fetchPublishedPosts(){
  const { data, error } = await window.supabaseClient
    .from('posts').select('*').eq('published', true).order('created_at', {ascending:false});
  if(error) throw error;
  return data;
}

async function fetchPostBySlug(slug){
  const { data, error } = await window.supabaseClient
    .from('posts').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  if(error) throw error;
  return data;
}

async function fetchApprovedComments(postId){
  const { data, error } = await window.supabaseClient
    .from('comments').select('*').eq('post_id', postId).eq('approved', true).order('created_at', {ascending:true});
  if(error) throw error;
  return data;
}

async function submitComment(postId, name, body){
  const { error } = await window.supabaseClient
    .from('comments').insert({post_id: postId, name: name, body: body});
  if(error) throw error;
}

async function fetchBooks(){
  const { data, error } = await window.supabaseClient
    .from('books').select('*').order('sort_order', {ascending:true}).order('created_at', {ascending:false});
  if(error) throw error;
  return data;
}

async function fetchProjects(){
  const { data, error } = await window.supabaseClient
    .from('projects').select('*').order('sort_order', {ascending:true}).order('created_at', {ascending:false});
  if(error) throw error;
  return data;
}

async function fetchResearch(){
  const { data, error } = await window.supabaseClient
    .from('research').select('*').order('sort_order', {ascending:true}).order('created_at', {ascending:false});
  if(error) throw error;
  return data;
}

async function fetchTrainings(){
  const { data, error } = await window.supabaseClient
    .from('trainings').select('*').order('sort_order', {ascending:true}).order('created_at', {ascending:false});
  if(error) throw error;
  return data;
}
