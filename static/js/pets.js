let ALL_PETS = [];

function loadPets() {
  fetch("/api/pets")
    .then((r) => r.json())
    .then((data) => {
      ALL_PETS = data.pets;
      render(); // Renderiza com os dados do banco
    })
    .catch((e) => {
      console.error("Erro ao carregar pets:", e);
      // Se der erro, mantém vazio
    });
}

// Chama quando a página carrega
document.addEventListener("DOMContentLoaded", loadPets);

const PAGE_SIZE = 9;
let page = 1;

function getFilters(){
  return {
    search: document.getElementById('f-search').value.toLowerCase(),
    species: document.getElementById('f-species').value,
    size: document.getElementById('f-size').value,
    city: document.getElementById('f-city').value.toLowerCase(),
    state: document.getElementById('f-state').value,
  };
}

function applyFilters() {
  page = 1;
  loadPetsWithFilters(); // Nova função
}

function loadPetsWithFilters() {
  const f = getFilters();

  // Monta URL com query strings
  let url = "/api/pets?";
  if (f.search) url += `search=${encodeURIComponent(f.search)}&`;
  if (f.species) url += `especie=${f.species}&`;
  if (f.size) url += `porte=${f.size}&`;
  if (f.city) url += `cidade=${encodeURIComponent(f.city)}&`;
  if (f.state) url += `estado=${f.state}&`;

  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      ALL_PETS = data.pets;
      render();
    });
}

function clearFilters(){
  ['f-search','f-city'].forEach(id=>document.getElementById(id).value='');
  ['f-species','f-size','f-state'].forEach(id=>document.getElementById(id).value='');
  applyFilters();
}

let searchTimer;
document.getElementById('f-search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(applyFilters,400)});
document.getElementById('f-city').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(applyFilters,400)});
['f-species','f-size','f-state'].forEach(id=>document.getElementById(id).addEventListener('change',applyFilters));

function filtered(){
  const f = getFilters();
  let list = [...ALL_PETS];
  if(f.search) list = list.filter(p=>(p.name||'').toLowerCase().includes(f.search)||(p.breed||'').toLowerCase().includes(f.search));
  if(f.species) list = list.filter(p=>p.species===f.species);
  if(f.size) list = list.filter(p=>p.size===f.size);
  if(f.city) list = list.filter(p=>(p.city||'').toLowerCase().includes(f.city));
  if(f.state) list = list.filter(p=>p.state===f.state);
  
  const sortEl = document.getElementById('sort');
  if(sortEl && sortEl.value === 'name') {
    list.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  }
  return list;
}

function petCard(p){
  const bLabel = p.status==='available'?'Disponível':p.status==='adopted'?'Adotado':'Reservado';
  const bClass = p.status==='available'?'badge-avail':p.status==='adopted'?'badge-adopted':'badge-reserved';
  const petSize = p.sizeLabel || p.size || 'Médio';
  return `
  <article class="pet-card" onclick="location.href='/pet/${p.id}'">
    <div class="card-img">
      <img src="${p.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600'}" alt="${p.name}" loading="lazy">
      <span class="card-badge ${bClass}">${bLabel}</span>
      <button class="fav-btn ${p.fav?'active':''}" onclick="event.stopPropagation();toggleFav('${p.id}',this)">${p.fav?'❤️':'🤍'}</button>
    </div>
    <div class="card-body">
      <div class="card-name">${p.name}</div>
      <div class="card-breed">${p.breed || 'Sem raça definida'}</div>
      <div class="card-meta">
        <span>⏱ ${p.age}</span>
        <span>·</span><span>📏 ${petSize}</span>
        <span>·</span><span>📍 ${p.city}/${p.state}</span>
      </div>
    </div>
  </article>`;
}

function render(){
  const list = filtered();
  const total = list.length;
  const pages = Math.ceil(total/PAGE_SIZE) || 1;
  if(page>pages) page=pages;
  const slice = list.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const grid = document.getElementById('pets-grid');
  document.getElementById('results-count').textContent = `${total} pet${total!==1?'s':''} encontrado${total!==1?'s':''}`;
  if(!slice.length){
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <div class="empty-icon">🐾</div>
      <div class="empty-title">Nenhum pet encontrado</div>
      <p class="empty-desc">Tente ajustar os filtros ou <button onclick="clearFilters()" style="color:var(--terra);font-weight:600;cursor:pointer;background:none;border:none;font-size:inherit">limpar a busca</button>.</p>
    </div>`;
    document.getElementById('pagination').innerHTML=''; return;
  }
  grid.innerHTML = slice.map(petCard).join('');
  renderPagination(page, pages);
}

function renderPagination(cur, total){
  const el = document.getElementById('pagination');
  if(total<=1){el.innerHTML='';return;}
  let h = `<button class="page-btn" ${cur===1?'disabled':''} onclick="goPage(${cur-1})">←</button>`;
  for(let i=1;i<=total;i++){
    if(i===1||i===total||Math.abs(i-cur)<=1){
      h+=`<button class="page-btn ${i===cur?'active':''}" onclick="goPage(${i})">${i}</button>`;
    } else if(Math.abs(i-cur)===2){
      h+=`<span class="page-dots">…</span>`;
    }
  }
  h+=`<button class="page-btn" ${cur===total?'disabled':''} onclick="goPage(${cur+1})">→</button>`;
  el.innerHTML=h;
}
function goPage(p){page=p;render();window.scrollTo({top:0,behavior:'smooth'});}

function toggleFav(id,btn){
  fetch(`/api/pets/${id}/favorite`, { method: 'POST' })
    .then(res => {
      if (res.redirected && res.url.includes('/login') || res.status === 401) {
        window.location.href = '/login';
        return null;
      }
      return res.json();
    })
    .then(data => {
      if (!data) return;
      const p = ALL_PETS.find(x => x.id == id);
      if (!p) return;
      p.fav = data.fav;
      btn.classList.toggle('active', p.fav);
      btn.textContent = p.fav ? '❤️' : '🤍';
      showToast(p.fav ? 'Adicionado aos favoritos! ❤️' : 'Removido dos favoritos.', p.fav ? 'success' : '');
    })
    .catch(e => console.error('Erro ao atualizar favorito:', e));
}
function showToast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast'+(type?' '+type:'');t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),3200);
}

render();
