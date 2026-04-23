const ALL_PETS = [
  {id:'1',name:'Thor',species:'dog',breed:'Golden Retriever',age:'2 anos',size:'large',sizeLabel:'Grande',city:'São Paulo',state:'SP',status:'available',photo:'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=75',fav:false},
  {id:'2',name:'Luna',species:'cat',breed:'Siamês',age:'1 ano e 6 meses',size:'small',sizeLabel:'Pequeno',city:'Rio de Janeiro',state:'RJ',status:'available',photo:'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=75',fav:true},
  {id:'3',name:'Bob',species:'dog',breed:'SRD (Vira-lata)',age:'3 anos',size:'medium',sizeLabel:'Médio',city:'Belo Horizonte',state:'MG',status:'available',photo:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=75',fav:false},
  {id:'4',name:'Mia',species:'cat',breed:'Persa',age:'8 meses',size:'small',sizeLabel:'Pequeno',city:'Curitiba',state:'PR',status:'available',photo:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=75',fav:false},
  {id:'5',name:'Rex',species:'dog',breed:'Pastor Alemão',age:'4 anos',size:'large',sizeLabel:'Grande',city:'Porto Alegre',state:'RS',status:'adopted',photo:'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=75',fav:false},
  {id:'6',name:'Nina',species:'dog',breed:'Poodle',age:'1 ano',size:'small',sizeLabel:'Pequeno',city:'São Paulo',state:'SP',status:'available',photo:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=75',fav:true},
  {id:'7',name:'Pipo',species:'bird',breed:'Calopsita',age:'2 anos',size:'small',sizeLabel:'Pequeno',city:'Florianópolis',state:'SC',status:'available',photo:'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=400&q=75',fav:false},
  {id:'8',name:'Coco',species:'rabbit',breed:'Angorá',age:'6 meses',size:'small',sizeLabel:'Pequeno',city:'Recife',state:'PE',status:'reserved',photo:'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=75',fav:false},
  {id:'9',name:'Bolinha',species:'dog',breed:'Beagle',age:'2 anos',size:'medium',sizeLabel:'Médio',city:'São Paulo',state:'SP',status:'available',photo:'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=75',fav:false},
  {id:'10',name:'Mel',species:'cat',breed:'Maine Coon',age:'3 anos',size:'large',sizeLabel:'Grande',city:'Rio de Janeiro',state:'RJ',status:'available',photo:'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&q=75',fav:false},
  {id:'11',name:'Duke',species:'dog',breed:'Labrador',age:'5 anos',size:'large',sizeLabel:'Grande',city:'Porto Alegre',state:'RS',status:'available',photo:'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=75',fav:false},
  {id:'12',name:'Lily',species:'cat',breed:'Ragdoll',age:'1 ano',size:'medium',sizeLabel:'Médio',city:'Curitiba',state:'PR',status:'available',photo:'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=75',fav:false},
];

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

function applyFilters(){ page=1; render(); }
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
  if(f.search) list = list.filter(p=>p.name.toLowerCase().includes(f.search)||p.breed.toLowerCase().includes(f.search));
  if(f.species) list = list.filter(p=>p.species===f.species);
  if(f.size) list = list.filter(p=>p.size===f.size);
  if(f.city) list = list.filter(p=>p.city.toLowerCase().includes(f.city));
  if(f.state) list = list.filter(p=>p.state===f.state);
  const sort = document.getElementById('sort').value;
  if(sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}

function petCard(p){
  const bLabel = p.status==='available'?'Disponível':p.status==='adopted'?'Adotado':'Reservado';
  const bClass = p.status==='available'?'badge-avail':p.status==='adopted'?'badge-adopted':'badge-reserved';
  return `
  <article class="pet-card" onclick="location.href='pet.html?id=${p.id}'">
    <div class="card-img">
      <img src="${p.photo}" alt="${p.name}" loading="lazy">
      <span class="card-badge ${bClass}">${bLabel}</span>
      <button class="fav-btn ${p.fav?'active':''}" onclick="event.stopPropagation();toggleFav('${p.id}',this)">${p.fav?'❤️':'🤍'}</button>
    </div>
    <div class="card-body">
      <div class="card-name">${p.name}</div>
      <div class="card-breed">${p.breed}</div>
      <div class="card-meta">
        <span>⏱ ${p.age}</span>
        <span>·</span><span>📏 ${p.sizeLabel}</span>
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
  const p=ALL_PETS.find(x=>x.id===id);if(!p)return;
  p.fav=!p.fav;
  btn.classList.toggle('active',p.fav);
  btn.textContent=p.fav?'❤️':'🤍';
  showToast(p.fav?'Adicionado aos favoritos! ❤️':'Removido dos favoritos.',p.fav?'success':'');
}
function showToast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast'+(type?' '+type:'');t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),3200);
}

render();
