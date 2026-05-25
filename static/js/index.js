let ALL_PETS = [];
let currentSpecies = '';

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/pets')
    .then(res => res.json())
    .then(data => {
      ALL_PETS = data.pets || [];
      renderGrid('');
      updateMetrics();
    })
    .catch(err => console.error('Erro ao buscar pets:', err));

  // Puxa as ONGs para exibir as 4 principais na Home
  fetch('/api/ongs')
    .then(res => res.json())
    .then(data => {
      renderHomeOngs(data.ongs || []);
    })
    .catch(err => console.error('Erro ao buscar ONGs:', err));
});

function petCard(p){
  const bLabel = p.status==='available'?'Disponível':p.status==='adopted'?'Adotado':'Reservado';
  const bClass = p.status==='available'?'badge-avail':p.status==='adopted'?'badge-adopted':'badge-reserved';
  const petSize = p.sizeLabel || p.size || 'Médio';
  
  return `
  <article class="pet-card" onclick="location.href='/pet/${p.id}'">
    <div class="card-img">
      <img src="${p.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600'}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x300/e2e8f0/94a3b8?text=${p.name}'">
      <span class="card-badge ${bClass}">${bLabel}</span>
      <button class="fav-btn ${p.fav?'active':''}" onclick="event.stopPropagation();toggleFav('${p.id}',this)" title="Favoritar">
        ${p.fav?'❤️':'🤍'}
      </button>
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

function renderGrid(species=''){
  const grid = document.getElementById('pets-grid');
  if (!grid) return;
  const list = ALL_PETS.filter(p=> !species || p.species===species).slice(0,6);
  
  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Nenhum pet encontrado.</div>';
    return;
  }
  
  grid.innerHTML = list.map(petCard).join('');
}

window.filterSpecies = function(s, btn){
  currentSpecies = s;
  document.querySelectorAll('.sp-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderGrid(s);
}

function toggleFav(id, btn){
  const p = ALL_PETS.find(x=>x.id==id);
  if(!p) return;
  p.fav = !p.fav;
  btn.classList.toggle('active', p.fav);
  btn.textContent = p.fav ? '❤️' : '🤍';
  showToast(p.fav ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', p.fav ? 'success':'');
}

function showToast(msg, type=''){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type?' '+type:'');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 3200);
}

function updateMetrics() {
  const totalPets = ALL_PETS.length > 0 ? ALL_PETS.length + 1240 : 1247;
  const totalAdopted = 840; 
  const cities = new Set(ALL_PETS.map(p => p.city)).size > 0 ? new Set(ALL_PETS.map(p => p.city)).size + 85 : 92;

  const statVals = document.querySelectorAll('.stat-val');
  if (statVals[0]) statVals[0].textContent = totalPets + '+';
  if (statVals[1]) statVals[1].textContent = totalAdopted + '+';
  if (statVals[2]) statVals[2].textContent = cities;
}

function renderHomeOngs(ongs) {
  const grid = document.getElementById('home-ongs-grid');
  if (!grid) return;
  
  const list = ongs.slice(0, 4);
  grid.innerHTML = list.map((o, index) => `
    <div class="ong-card reveal reveal-delay-${(index % 4) + 1} visible">
      <div class="ong-img"><img src="${o.photo || 'https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=600&q=80'}" alt="${o.name}" loading="lazy"></div>
      <div class="ong-body">
        <div class="ong-name">${o.name}</div>
        <div class="ong-city">📍 ${o.city}, ${o.state}</div>
        <div class="ong-stats"><span>🐾 ${o.pets || 0} pets</span><span>🏠 ${o.adopted || 0} adoções</span></div>
        <a href="/ongs" class="btn-ong">Conhecer ONG</a>
      </div>
    </div>
  `).join('');
}
