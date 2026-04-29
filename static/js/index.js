const MOCK_PETS = [
  {id:'1',name:'Thor',species:'dog',breed:'Golden Retriever',age:'2 anos',size:'Grande',city:'São Paulo',state:'SP',status:'available',photo:'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=75',fav:false,vaccinated:true,neutered:true},
  {id:'2',name:'Luna',species:'cat',breed:'Siamês',age:'1 ano e 6 meses',size:'Pequeno',city:'Rio de Janeiro',state:'RJ',status:'available',photo:'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=75',fav:true,vaccinated:true,neutered:false},
  {id:'3',name:'Bob',species:'dog',breed:'SRD (Vira-lata)',age:'3 anos',size:'Médio',city:'Belo Horizonte',state:'MG',status:'available',photo:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=75',fav:false,vaccinated:true,neutered:true},
  {id:'4',name:'Mia',species:'cat',breed:'Persa',age:'8 meses',size:'Pequeno',city:'Curitiba',state:'PR',status:'available',photo:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=75',fav:false,vaccinated:true,neutered:false},
  {id:'5',name:'Rex',species:'dog',breed:'Pastor Alemão',age:'4 anos',size:'Grande',city:'Porto Alegre',state:'RS',status:'adopted',photo:'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=75',fav:false,vaccinated:true,neutered:true},
  {id:'6',name:'Nina',species:'dog',breed:'Poodle',age:'1 ano',size:'Pequeno',city:'São Paulo',state:'SP',status:'available',photo:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=75',fav:true,vaccinated:false,neutered:false},
  {id:'7',name:'Mel',species:'cat',breed:'Maine Coon',age:'3 anos',size:'Pequeno',city:'Florianópolis',state:'SC',status:'available',photo:'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&q=75',fav:false,vaccinated:true,neutered:true},
  {id:'8',name:'Duque',species:'dog',breed:'Labrador',age:'2 anos',size:'Grande',city:'Recife',state:'PE',status:'available',photo:'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=75',fav:false,vaccinated:true,neutered:false},
];

let currentSpecies = '';

function petCard(p){
  const bLabel = p.status==='available'?'Disponível':p.status==='adopted'?'Adotado':'Reservado';
  const bClass = p.status==='available'?'badge-avail':p.status==='adopted'?'badge-adopted':'badge-reserved';
  return `
  <article class="pet-card" onclick="location.href='pet.html?id=${p.id}'">
    <div class="card-img">
      <img src="${p.photo}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x300/e2e8f0/94a3b8?text=${p.name}'">
      <span class="card-badge ${bClass}">${bLabel}</span>
      <button class="fav-btn ${p.fav?'active':''}" onclick="event.stopPropagation();toggleFav('${p.id}',this)" title="Favoritar">
        ${p.fav?'❤️':'🤍'}
      </button>
    </div>
    <div class="card-body">
      <div class="card-name">${p.name}</div>
      <div class="card-breed">${p.breed}</div>
      <div class="card-meta">
        <span>⏱ ${p.age}</span>
        <span>·</span><span>📏 ${p.size}</span>
        <span>·</span><span>📍 ${p.city}/${p.state}</span>
      </div>
    </div>
  </article>`;
}

function renderGrid(species=''){
  const grid = document.getElementById('pets-grid');
  const list = MOCK_PETS.filter(p=> !species || p.species===species).slice(0,6);
  grid.innerHTML = list.map(petCard).join('');
}

function filterSpecies(s, btn){
  currentSpecies = s;
  document.querySelectorAll('.sp-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderGrid(s);
}

function toggleFav(id, btn){
  const p = MOCK_PETS.find(x=>x.id===id);
  if(!p) return;
  p.fav = !p.fav;
  btn.classList.toggle('active', p.fav);
  btn.textContent = p.fav ? '❤️' : '🤍';
  showToast(p.fav ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', p.fav ? 'success':'');
}

function showToast(msg, type=''){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type?' '+type:'');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 3200);
}

renderGrid();

// RF13 — Métricas dinâmicas calculadas do mock
const totalPets    = MOCK_PETS.length;
const totalAdopted = MOCK_PETS.filter(p => p.status === 'adopted').length;
const cities       = new Set(MOCK_PETS.map(p => p.city)).size;

const statVals = document.querySelectorAll('.stat-val');
if (statVals[0]) statVals[0].textContent = totalPets + '+';
if (statVals[1]) statVals[1].textContent = totalAdopted + '+';
if (statVals[2]) statVals[2].textContent = cities;
