/* ===== EDIT YOUR CONTENT HERE ===== */
const SOCIAL=[{n:"GitHub",u:"https://github.com/IveBuncaras28"},{n:"ResearchGate",u:"https://www.researchgate.net/profile/Ivy-Buncaras-2?ev=hdr_xprf"},{n:"SSRN",u:"https://www.ssrn.com/ssrn/"},{n:"Email",u:"mailto:ivebalbuena@gmail.com"},{n:"LinkedIn",u:"https://www.linkedin.com/in/ivy-buncaras-9b3883124?utm_source=share_via&utm_content=profile&utm_medium=member_android"}];
/* ================================== */

// Scroll-reveal observer — defined first so anything below can call it safely.
let io;
function obs(){
  io=io||new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}

// Generic client-side paginator used by dashboard.html (indicators + headlines)
// and any other list that wants Prev/Next paging over an in-memory array.
//   getItems   — function returning the current full array to page over
//   pageSize   — items per page
//   renderFn   — called with the items for the current page
//   paginationEl, prevBtn, nextBtn, labelEl — the wrapping controls
function makePaginator(getItems, pageSize, renderFn, paginationEl, prevBtn, nextBtn, labelEl){
  let page = 0;
  function render(){
    const items = getItems() || [];
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    if(page > totalPages - 1) page = totalPages - 1;
    if(page < 0) page = 0;
    const start = page * pageSize;
    renderFn(items.slice(start, start + pageSize));
    if(paginationEl) paginationEl.style.display = totalPages > 1 ? 'flex' : 'none';
    if(labelEl) labelEl.textContent = `Page ${page + 1} of ${totalPages}`;
    if(prevBtn) prevBtn.disabled = page === 0;
    if(nextBtn) nextBtn.disabled = page >= totalPages - 1;
  }
  if(prevBtn) prevBtn.onclick = ()=>{ page--; render(); };
  if(nextBtn) nextBtn.onclick = ()=>{ page++; render(); };
  return {
    render,
    reset(){ page = 0; render(); }
  };
}

// Highlight the current page in the nav.
document.querySelectorAll('.links a').forEach(a=>{
  const here=location.pathname.split('/').pop();
  if(a.getAttribute('href')===here||(a.getAttribute('href')==='index.html'&&(here===''||here==='index.html')))
    a.setAttribute('data-current','true');
});

const yr=document.getElementById('yr');
if(yr) yr.textContent=new Date().getFullYear();

const soc=document.getElementById('social');
if(soc){
  soc.innerHTML=SOCIAL.map(s=>`<a href="${s.u}" ${s.u!=='#'?'target="_blank" rel="noopener"':''}>${s.n}</a>`).join('');
}

obs();
trackVisit();
