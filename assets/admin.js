/* Admin panel. Requires supabase-config.js + db.js loaded first. */

const sb = window.supabaseClient;
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');

if(!sb){
  loginScreen.innerHTML = '<div class="login-box"><div class="login-mark">IB</div><h1>Not connected</h1><p class="login-sub">Fill in <code>assets/supabase-config.js</code> with your Supabase project URL and key first.</p></div>';
}else{
  init();
}

async function init(){
  const { data: { session } } = await sb.auth.getSession();
  if(session){ showDashboard(session.user.email); } else { showLogin(); }

  document.getElementById('login-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-msg');
    msg.textContent = '';
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if(error){ msg.innerHTML = `<div class="msg err">${escapeHtml(error.message)}</div>`; return; }
    showDashboard(email);
  });

  document.getElementById('signout').addEventListener('click', async ()=>{
    await sb.auth.signOut();
    showLogin();
  });

  document.querySelectorAll('.admin-tabs button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.admin-tabs button').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('on'));
      document.getElementById('panel-'+btn.dataset.tab).classList.add('on');
    });
  });

  setupPosts();
  setupProjects();
  setupResearch();
  setupTrainings();
  setupBooks();
  setupComments();
}

function showLogin(){ loginScreen.style.display='block'; dashboard.style.display='none'; }
function showDashboard(email){
  loginScreen.style.display='none'; dashboard.style.display='block';
  const who=document.getElementById('who-email');
  if(who && email) who.textContent = email;
  loadPosts(); loadProjects(); loadResearch(); loadTrainings(); loadBooks(); loadComments(); loadVisits();
}

function slugify(s){
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

async function uploadFile(file, folder){
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g,'_')}`;
  const { error } = await sb.storage.from('uploads').upload(path, file, { upsert:true });
  if(error) throw error;
  const { data } = sb.storage.from('uploads').getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------- POSTS ---------------- */
function setupPosts(){
  const form = document.getElementById('post-form');
  const titleEl = document.getElementById('post-title');
  const slugEl = document.getElementById('post-slug');
  let slugTouched = false;
  slugEl.addEventListener('input', ()=> slugTouched = true);
  titleEl.addEventListener('input', ()=>{ if(!slugTouched) slugEl.value = slugify(titleEl.value); });

  document.getElementById('post-cover-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('post-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'covers');
      document.getElementById('post-cover-url').value = url;
      const img = document.getElementById('post-cover-preview');
      img.src = url; img.style.display='inline-block';
      msg.textContent = '';
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('post-cancel').addEventListener('click', resetPostForm);

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const msg = document.getElementById('post-msg');
    const id = document.getElementById('post-id').value;
    const row = {
      title: titleEl.value.trim(),
      slug: slugEl.value.trim(),
      excerpt: document.getElementById('post-excerpt').value.trim(),
      body: document.getElementById('post-body').value,
      cover_url: document.getElementById('post-cover-url').value || null,
      published: document.getElementById('post-published').checked,
      updated_at: new Date().toISOString()
    };
    try{
      if(id){
        const { error } = await sb.from('posts').update(row).eq('id', id);
        if(error) throw error;
      }else{
        const { error } = await sb.from('posts').insert(row);
        if(error) throw error;
      }
      msg.innerHTML = '<div class="msg ok">Saved.</div>';
      resetPostForm(); loadPosts();
    }catch(e){ msg.innerHTML = `<div class="msg err">${escapeHtml(e.message)}</div>`; }
  });
}

function resetPostForm(){
  document.getElementById('post-form').reset();
  document.getElementById('post-id').value = '';
  document.getElementById('post-cover-url').value = '';
  document.getElementById('post-cover-preview').style.display = 'none';
  document.getElementById('post-msg').textContent = '';
}

async function loadPosts(){
  const list = document.getElementById('posts-list');
  const { data, error } = await sb.from('posts').select('*').order('created_at', {ascending:false});
  if(error){ list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; return; }
  if(!data.length){ list.innerHTML = '<div class="empty">No posts yet — create your first one above.</div>'; return; }
  list.innerHTML = data.map(p => `
    <div class="admin-row">
      <div class="info"><b>${escapeHtml(p.title)} <span class="badge ${p.published?'live':'pending'}">${p.published?'Published':'Draft'}</span></b>
      <span>/${escapeHtml(p.slug)} · ${fmtDate(p.created_at)}</span></div>
      <div class="btns">
        <button class="btn-mini" onclick="editPost('${p.id}')">Edit</button>
        <button class="btn-mini danger" onclick="deletePost('${p.id}')">Delete</button>
      </div>
    </div>`).join('');
}

window.editPost = async function(id){
  const { data } = await sb.from('posts').select('*').eq('id', id).single();
  if(!data) return;
  document.getElementById('post-id').value = data.id;
  document.getElementById('post-title').value = data.title;
  document.getElementById('post-slug').value = data.slug;
  document.getElementById('post-excerpt').value = data.excerpt || '';
  document.getElementById('post-body').value = data.body;
  document.getElementById('post-published').checked = data.published;
  document.getElementById('post-cover-url').value = data.cover_url || '';
  const img = document.getElementById('post-cover-preview');
  if(data.cover_url){ img.src = data.cover_url; img.style.display='inline-block'; } else { img.style.display='none'; }
  document.querySelector('[data-tab="posts"]').click();
  window.scrollTo({top:0, behavior:'smooth'});
};

window.deletePost = async function(id){
  if(!confirm('Delete this post permanently?')) return;
  await sb.from('posts').delete().eq('id', id);
  loadPosts();
};

/* ---------------- PROJECTS ---------------- */
function setupProjects(){
  document.getElementById('project-cover-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('project-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'project-covers');
      document.getElementById('project-cover-url').value = url;
      const img = document.getElementById('project-cover-preview');
      img.src = url; img.style.display='inline-block';
      msg.textContent = '';
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('project-cancel').addEventListener('click', resetProjectForm);

  document.getElementById('project-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const msg = document.getElementById('project-msg');
    const id = document.getElementById('project-id').value;
    const tagsRaw = document.getElementById('project-tags').value.trim();
    const row = {
      title: document.getElementById('project-title').value.trim(),
      category: document.getElementById('project-category').value.trim(),
      description: document.getElementById('project-description').value.trim(),
      tags: tagsRaw ? tagsRaw.split(',').map(t=>t.trim()).filter(Boolean) : [],
      link_url: document.getElementById('project-link').value.trim() || null,
      cover_url: document.getElementById('project-cover-url').value || null
    };
    try{
      if(id){
        const { error } = await sb.from('projects').update(row).eq('id', id);
        if(error) throw error;
      }else{
        const { error } = await sb.from('projects').insert(row);
        if(error) throw error;
      }
      msg.innerHTML = '<div class="msg ok">Saved.</div>';
      resetProjectForm(); loadProjects();
    }catch(e){ msg.innerHTML = `<div class="msg err">${escapeHtml(e.message)}</div>`; }
  });
}

function resetProjectForm(){
  document.getElementById('project-form').reset();
  document.getElementById('project-id').value = '';
  document.getElementById('project-cover-url').value = '';
  document.getElementById('project-cover-preview').style.display = 'none';
  document.getElementById('project-msg').textContent = '';
}

async function loadProjects(){
  const list = document.getElementById('projects-list');
  const { data, error } = await sb.from('projects').select('*').order('created_at', {ascending:false});
  if(error){ list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; return; }
  if(!data.length){ list.innerHTML = '<div class="empty">No projects yet — add your first one above.</div>'; return; }
  list.innerHTML = data.map(p => `
    <div class="admin-row">
      <div class="info"><b>${escapeHtml(p.title)}</b><span>${escapeHtml(p.category)} · ${fmtDate(p.created_at)}</span></div>
      <div class="btns">
        <button class="btn-mini" onclick="editProject('${p.id}')">Edit</button>
        <button class="btn-mini danger" onclick="deleteProject('${p.id}')">Delete</button>
      </div>
    </div>`).join('');
}

window.editProject = async function(id){
  const { data } = await sb.from('projects').select('*').eq('id', id).single();
  if(!data) return;
  document.getElementById('project-id').value = data.id;
  document.getElementById('project-title').value = data.title;
  document.getElementById('project-category').value = data.category;
  document.getElementById('project-description').value = data.description || '';
  document.getElementById('project-tags').value = (data.tags||[]).join(', ');
  document.getElementById('project-link').value = data.link_url || '';
  document.getElementById('project-cover-url').value = data.cover_url || '';
  const img = document.getElementById('project-cover-preview');
  if(data.cover_url){ img.src = data.cover_url; img.style.display='inline-block'; } else { img.style.display='none'; }
  document.querySelector('[data-tab="projects"]').click();
  window.scrollTo({top:0, behavior:'smooth'});
};

window.deleteProject = async function(id){
  if(!confirm('Delete this project permanently?')) return;
  await sb.from('projects').delete().eq('id', id);
  loadProjects();
};

/* ---------------- RESEARCH ---------------- */
function setupResearch(){
  document.getElementById('research-cover-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('research-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'research-covers');
      document.getElementById('research-cover-url').value = url;
      const img = document.getElementById('research-cover-preview');
      img.src = url; img.style.display='inline-block';
      msg.textContent = '';
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('research-file-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('research-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'research-files');
      document.getElementById('research-file-url').value = url;
      msg.innerHTML = `<div class="msg ok">File attached.</div>`;
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('research-cancel').addEventListener('click', resetResearchForm);

  document.getElementById('research-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const msg = document.getElementById('research-msg');
    const id = document.getElementById('research-id').value;
    const row = {
      title: document.getElementById('research-title').value.trim(),
      venue: document.getElementById('research-venue').value.trim(),
      description: document.getElementById('research-description').value.trim(),
      link_url: document.getElementById('research-link').value.trim() || null,
      cover_url: document.getElementById('research-cover-url').value || null,
      file_url: document.getElementById('research-file-url').value || null
    };
    try{
      if(id){
        const { error } = await sb.from('research').update(row).eq('id', id);
        if(error) throw error;
      }else{
        const { error } = await sb.from('research').insert(row);
        if(error) throw error;
      }
      msg.innerHTML = '<div class="msg ok">Saved.</div>';
      resetResearchForm(); loadResearch();
    }catch(e){ msg.innerHTML = `<div class="msg err">${escapeHtml(e.message)}</div>`; }
  });
}

function resetResearchForm(){
  document.getElementById('research-form').reset();
  document.getElementById('research-id').value = '';
  document.getElementById('research-cover-url').value = '';
  document.getElementById('research-file-url').value = '';
  document.getElementById('research-cover-preview').style.display = 'none';
  document.getElementById('research-msg').textContent = '';
}

async function loadResearch(){
  const list = document.getElementById('research-list');
  const { data, error } = await sb.from('research').select('*').order('created_at', {ascending:false});
  if(error){ list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; return; }
  if(!data.length){ list.innerHTML = '<div class="empty">No papers yet — add your first one above.</div>'; return; }
  list.innerHTML = data.map(r => `
    <div class="admin-row">
      <div class="info"><b>${escapeHtml(r.title)}</b><span>${escapeHtml(r.venue)} · ${fmtDate(r.created_at)}</span></div>
      <div class="btns">
        <button class="btn-mini" onclick="editResearch('${r.id}')">Edit</button>
        <button class="btn-mini danger" onclick="deleteResearch('${r.id}')">Delete</button>
      </div>
    </div>`).join('');
}

window.editResearch = async function(id){
  const { data } = await sb.from('research').select('*').eq('id', id).single();
  if(!data) return;
  document.getElementById('research-id').value = data.id;
  document.getElementById('research-title').value = data.title;
  document.getElementById('research-venue').value = data.venue;
  document.getElementById('research-description').value = data.description || '';
  document.getElementById('research-link').value = data.link_url || '';
  document.getElementById('research-cover-url').value = data.cover_url || '';
  document.getElementById('research-file-url').value = data.file_url || '';
  const img = document.getElementById('research-cover-preview');
  if(data.cover_url){ img.src = data.cover_url; img.style.display='inline-block'; } else { img.style.display='none'; }
  document.querySelector('[data-tab="research"]').click();
  window.scrollTo({top:0, behavior:'smooth'});
};

window.deleteResearch = async function(id){
  if(!confirm('Delete this paper permanently?')) return;
  await sb.from('research').delete().eq('id', id);
  loadResearch();
};

/* ---------------- TRAININGS ---------------- */
function setupTrainings(){
  document.getElementById('training-cover-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('training-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'training-covers');
      document.getElementById('training-cover-url').value = url;
      const img = document.getElementById('training-cover-preview');
      img.src = url; img.style.display='inline-block';
      msg.textContent = '';
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('training-file-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('training-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'training-files');
      document.getElementById('training-file-url').value = url;
      msg.innerHTML = `<div class="msg ok">Certificate attached.</div>`;
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('training-cancel').addEventListener('click', resetTrainingForm);

  document.getElementById('training-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const msg = document.getElementById('training-msg');
    const id = document.getElementById('training-id').value;
    const row = {
      title: document.getElementById('training-title').value.trim(),
      provider: document.getElementById('training-provider').value.trim(),
      date_label: document.getElementById('training-date').value.trim(),
      description: document.getElementById('training-description').value.trim(),
      link_url: document.getElementById('training-link').value.trim() || null,
      cover_url: document.getElementById('training-cover-url').value || null,
      file_url: document.getElementById('training-file-url').value || null
    };
    try{
      if(id){
        const { error } = await sb.from('trainings').update(row).eq('id', id);
        if(error) throw error;
      }else{
        const { error } = await sb.from('trainings').insert(row);
        if(error) throw error;
      }
      msg.innerHTML = '<div class="msg ok">Saved.</div>';
      resetTrainingForm(); loadTrainings();
    }catch(e){ msg.innerHTML = `<div class="msg err">${escapeHtml(e.message)}</div>`; }
  });
}

function resetTrainingForm(){
  document.getElementById('training-form').reset();
  document.getElementById('training-id').value = '';
  document.getElementById('training-cover-url').value = '';
  document.getElementById('training-file-url').value = '';
  document.getElementById('training-cover-preview').style.display = 'none';
  document.getElementById('training-msg').textContent = '';
}

async function loadTrainings(){
  const list = document.getElementById('trainings-list');
  const { data, error } = await sb.from('trainings').select('*').order('created_at', {ascending:false});
  if(error){ list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; return; }
  if(!data.length){ list.innerHTML = '<div class="empty">No trainings yet — add your first one above.</div>'; return; }
  list.innerHTML = data.map(t => `
    <div class="admin-row">
      <div class="info"><b>${escapeHtml(t.title)}</b><span>${escapeHtml(t.provider||'')}${t.date_label?' · '+escapeHtml(t.date_label):''}</span></div>
      <div class="btns">
        <button class="btn-mini" onclick="editTraining('${t.id}')">Edit</button>
        <button class="btn-mini danger" onclick="deleteTraining('${t.id}')">Delete</button>
      </div>
    </div>`).join('');
}

window.editTraining = async function(id){
  const { data } = await sb.from('trainings').select('*').eq('id', id).single();
  if(!data) return;
  document.getElementById('training-id').value = data.id;
  document.getElementById('training-title').value = data.title;
  document.getElementById('training-provider').value = data.provider || '';
  document.getElementById('training-date').value = data.date_label || '';
  document.getElementById('training-link').value = data.link_url || '';
  document.getElementById('training-description').value = data.description || '';
  document.getElementById('training-cover-url').value = data.cover_url || '';
  document.getElementById('training-file-url').value = data.file_url || '';
  const img = document.getElementById('training-cover-preview');
  if(data.cover_url){ img.src = data.cover_url; img.style.display='inline-block'; } else { img.style.display='none'; }
  document.querySelector('[data-tab="trainings"]').click();
  window.scrollTo({top:0, behavior:'smooth'});
};

window.deleteTraining = async function(id){
  if(!confirm('Delete this training permanently?')) return;
  await sb.from('trainings').delete().eq('id', id);
  loadTrainings();
};

/* ---------------- BOOKS ---------------- */
function setupBooks(){
  document.getElementById('book-cover-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('book-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'book-covers');
      document.getElementById('book-cover-url').value = url;
      const img = document.getElementById('book-cover-preview');
      img.src = url; img.style.display='inline-block';
      msg.textContent = '';
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('book-file-file').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0]; if(!file) return;
    const msg = document.getElementById('book-msg');
    msg.textContent = 'Uploading…';
    try{
      const url = await uploadFile(file, 'book-files');
      document.getElementById('book-file-url').value = url;
      msg.innerHTML = `<div class="msg ok">File attached.</div>`;
    }catch(e){ msg.innerHTML = `<div class="msg err">Upload failed: ${escapeHtml(e.message)}</div>`; }
  });

  document.getElementById('book-cancel').addEventListener('click', resetBookForm);

  document.getElementById('book-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const msg = document.getElementById('book-msg');
    const id = document.getElementById('book-id').value;
    const row = {
      title: document.getElementById('book-title').value.trim(),
      author: document.getElementById('book-author').value.trim(),
      shelf: document.getElementById('book-shelf').value.trim(),
      rating: parseInt(document.getElementById('book-rating').value, 10),
      description: document.getElementById('book-description').value.trim(),
      link_url: document.getElementById('book-link').value.trim() || null,
      cover_url: document.getElementById('book-cover-url').value || null,
      file_url: document.getElementById('book-file-url').value || null
    };
    try{
      if(id){
        const { error } = await sb.from('books').update(row).eq('id', id);
        if(error) throw error;
      }else{
        const { error } = await sb.from('books').insert(row);
        if(error) throw error;
      }
      msg.innerHTML = '<div class="msg ok">Saved.</div>';
      resetBookForm(); loadBooks();
    }catch(e){ msg.innerHTML = `<div class="msg err">${escapeHtml(e.message)}</div>`; }
  });
}

function resetBookForm(){
  document.getElementById('book-form').reset();
  document.getElementById('book-id').value = '';
  document.getElementById('book-cover-url').value = '';
  document.getElementById('book-file-url').value = '';
  document.getElementById('book-cover-preview').style.display = 'none';
  document.getElementById('book-msg').textContent = '';
}

async function loadBooks(){
  const list = document.getElementById('books-list');
  const { data, error } = await sb.from('books').select('*').order('created_at', {ascending:false});
  if(error){ list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; return; }
  if(!data.length){ list.innerHTML = '<div class="empty">No books yet — add your first one above.</div>'; return; }
  list.innerHTML = data.map(b => `
    <div class="admin-row">
      <div class="info"><b>${escapeHtml(b.title)}</b><span>${escapeHtml(b.author||'')} · ${escapeHtml(b.shelf)}</span></div>
      <div class="btns">
        <button class="btn-mini" onclick="editBook('${b.id}')">Edit</button>
        <button class="btn-mini danger" onclick="deleteBook('${b.id}')">Delete</button>
      </div>
    </div>`).join('');
}

window.editBook = async function(id){
  const { data } = await sb.from('books').select('*').eq('id', id).single();
  if(!data) return;
  document.getElementById('book-id').value = data.id;
  document.getElementById('book-title').value = data.title;
  document.getElementById('book-author').value = data.author || '';
  document.getElementById('book-shelf').value = data.shelf;
  document.getElementById('book-rating').value = data.rating || 0;
  document.getElementById('book-description').value = data.description || '';
  document.getElementById('book-link').value = data.link_url || '';
  document.getElementById('book-cover-url').value = data.cover_url || '';
  document.getElementById('book-file-url').value = data.file_url || '';
  const img = document.getElementById('book-cover-preview');
  if(data.cover_url){ img.src = data.cover_url; img.style.display='inline-block'; } else { img.style.display='none'; }
  document.querySelector('[data-tab="books"]').click();
  window.scrollTo({top:0, behavior:'smooth'});
};

window.deleteBook = async function(id){
  if(!confirm('Delete this book permanently?')) return;
  await sb.from('books').delete().eq('id', id);
  loadBooks();
};

/* ---------------- COMMENTS ---------------- */
function setupComments(){}

async function loadComments(){
  const list = document.getElementById('comments-list');
  const { data, error } = await sb.from('comments').select('*, posts(title)').order('created_at', {ascending:false});
  if(error){ list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; return; }
  if(!data.length){ list.innerHTML = '<div class="empty">No comments yet.</div>'; return; }
  list.innerHTML = data.map(c => `
    <div class="admin-row">
      <div class="info"><b>${escapeHtml(c.name)} <span class="badge ${c.approved?'live':'pending'}">${c.approved?'Approved':'Pending'}</span></b>
      <span>on “${escapeHtml(c.posts ? c.posts.title : 'deleted post')}” · ${fmtDate(c.created_at)}</span>
      <div style="margin-top:6px;color:var(--ink);font-size:14px">${escapeHtml(c.body)}</div></div>
      <div class="btns">
        ${!c.approved ? `<button class="btn-mini primary" onclick="approveComment('${c.id}')">Approve</button>` : ''}
        <button class="btn-mini danger" onclick="deleteComment('${c.id}')">Delete</button>
      </div>
    </div>`).join('');
}

window.approveComment = async function(id){
  await sb.from('comments').update({approved:true}).eq('id', id);
  loadComments();
};

window.deleteComment = async function(id){
  if(!confirm('Delete this comment?')) return;
  await sb.from('comments').delete().eq('id', id);
  loadComments();
};

/* ---------------- VISITS ---------------- */
async function loadVisits(){
  const totalEl = document.getElementById('visits-total');
  const list = document.getElementById('visits-breakdown');
  try{
    const { total, breakdown } = await fetchVisitStats();
    totalEl.textContent = total.toLocaleString();
    if(!breakdown.length){
      list.innerHTML = '<div class="empty">No visits logged yet.</div>';
      return;
    }
    list.innerHTML = breakdown.map(([page,n]) => `
      <div class="admin-row">
        <div class="info"><b>${escapeHtml(page)}</b></div>
        <div class="btns"><span class="badge live">${n.toLocaleString()} view${n===1?'':'s'}</span></div>
      </div>`).join('');
  }catch(e){
    totalEl.textContent = '–';
    list.innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}
