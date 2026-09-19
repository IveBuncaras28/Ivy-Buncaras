/* ===== EDIT YOUR CONTENT HERE ===== */
const PROJECTS=[
 {t:"IMPLUS — DepEd Innovation Proposal",c:"Research",d:"Innovation research proposal for Cabitan NHS covering both the inventory system and the P.L.U.S. personnel system.",tags:["Research","DepEd","Systems Design"],url:"#"},
 {t:"Cabitan NHS Inventory System",c:"Web",d:"Web dashboard plus a Tkinter desktop app, both syncing to a shared Supabase backend for school stock tracking.",tags:["JavaScript","Supabase","Python"],url:"#"},
 {t:"P.L.U.S. — Personnel Locator & Utility System",c:"Desktop",d:"Teacher locator and service-credit monitoring, integrated into the school's admin dashboard.",tags:["Python","Tkinter","Supabase"],url:"#"},
 {t:"Peace & Order Module",c:"Web",d:"Incident reporting, an admin case workflow, and analytics built into the same school platform.",tags:["HTML/JS","Analytics","Supabase"],url:"#"}
];
const RESEARCH=[
 {t:"Your ResearchGate preprint",v:"ResearchGate",d:"Replace this with the title and abstract of your paper.",url:"#"},
 {t:"Your SSRN working paper",v:"SSRN",d:"Replace this with the title and abstract of your paper.",url:"#"}
];
const SOCIAL=[{n:"GitHub",u:"#"},{n:"ResearchGate",u:"#"},{n:"SSRN",u:"#"},{n:"Email",u:"#"},{n:"LinkedIn",u:"#"}];
const BOOKS=[
 {t:"Your favorite book #1",a:"Author name",shelf:"Favorite",rating:5,d:"Replace with why this book stuck with you.",url:"#"},
 {t:"Your favorite book #2",a:"Author name",shelf:"Favorite",rating:5,d:"Replace with why this book stuck with you.",url:"#"},
 {t:"Currently reading",a:"Author name",shelf:"Reading now",rating:0,d:"Replace with what it's about and why you picked it up.",url:"#"},
 {t:"Up next",a:"Author name",shelf:"To read",rating:0,d:"Replace with why it's on your list.",url:"#"}
];
/* ================================== */

// Scroll-reveal observer — defined first so anything below can call it safely.
let io;
function obs(){
  io=io||new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}

// Highlight the current page in the nav.
document.querySelectorAll('.links a').forEach(a=>{
  const here=location.pathname.split('/').pop();
  if(a.getAttribute('href')===here||(a.getAttribute('href')==='index.html'&&(here===''||here==='index.html')))
    a.setAttribute('data-current','true');
});

const yr=document.getElementById('yr');
if(yr) yr.textContent=new Date().getFullYear();

const pg=document.getElementById('projects-grid');
if(pg){
  const card=p=>`<article class="card reveal" data-c="${p.c}"><h3>${p.t}</h3><div class="chips">${p.tags.map(x=>`<span class="chip">${x}</span>`).join('')}</div><p>${p.d}</p><a class="more" href="${p.url}" ${p.url!=='#'?'target="_blank" rel="noopener"':''}>View →</a></article>`;
  const render=f=>{pg.innerHTML=PROJECTS.filter(p=>f==='All'||p.c===f).map(card).join('');obs();};
  const cats=['All',...new Set(PROJECTS.map(p=>p.c))];
  const filters=document.getElementById('filters');
  filters.innerHTML=cats.map((c,i)=>`<button class="${i?'':'on'}">${c}</button>`).join('');
  filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{filters.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');render(b.textContent);});
  render('All');
}

const rg=document.getElementById('research-grid');
if(rg){
  rg.innerHTML=RESEARCH.map(r=>`<article class="card reveal"><div class="chips"><span class="chip">${r.v}</span></div><h3>${r.t}</h3><p>${r.d}</p><a class="more" href="${r.url}" ${r.url!=='#'?'target="_blank" rel="noopener"':''}>Read paper →</a></article>`).join('');
}

const lg=document.getElementById('library-grid');
if(lg){
  const stars=n=>Array.from({length:5},(_,i)=>`<span class="${i<n?'':'off'}">★</span>`).join('');
  const book=b=>`<article class="card reveal book"><div class="book-spine"></div><div><span class="shelf-badge">${b.shelf}</span>${b.rating?`<div class="stars">${stars(b.rating)}</div>`:''}<h3>${b.t}</h3><div class="author">${b.a}</div><p>${b.d}</p><a class="more" href="${b.url}" ${b.url!=='#'?'target="_blank" rel="noopener"':''}>More →</a></div></article>`;
  const renderLib=f=>{lg.innerHTML=BOOKS.filter(b=>f==='All'||b.shelf===f).map(book).join('');obs();};
  const shelves=['All',...new Set(BOOKS.map(b=>b.shelf))];
  const lf=document.getElementById('lib-filters');
  lf.innerHTML=shelves.map((s,i)=>`<button class="${i?'':'on'}">${s}</button>`).join('');
  lf.querySelectorAll('button').forEach(b=>b.onclick=()=>{lf.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');renderLib(b.textContent);});
  renderLib('All');
}

const soc=document.getElementById('social');
if(soc){
  soc.innerHTML=SOCIAL.map(s=>`<a href="${s.u}" ${s.u!=='#'?'target="_blank" rel="noopener"':''}>${s.n}</a>`).join('');
}

obs();
