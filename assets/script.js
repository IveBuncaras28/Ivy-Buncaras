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
/* ================================== */

document.querySelectorAll('.links a').forEach(a=>{
  if(a.getAttribute('href')===location.pathname.split('/').pop()||
     (a.getAttribute('href')==='index.html'&&(location.pathname.endsWith('/')||location.pathname.split('/').pop()==='')))
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

const soc=document.getElementById('social');
if(soc){
  soc.innerHTML=SOCIAL.map(s=>`<a href="${s.u}" ${s.u!=='#'?'target="_blank" rel="noopener"':''}>${s.n}</a>`).join('');
}

let io;
function obs(){
  io=io||new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}
obs();
