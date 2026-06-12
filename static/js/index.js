let ALL_PETS = [];
let currentSpecies = '';

document.addEventListener('DOMContentLoaded', () => {
  updateMetrics();

  fetch('/api/pets')
    .then(res => res.json())
    .then(data => {
      ALL_PETS = data.pets || [];
      renderGrid('');
    })
    .catch(err => console.error('Erro ao buscar pets:', err));

  // Puxa as ONGs para exibir as 4 principais na Home
  fetch('/api/ongs')
    .then(res => res.json())
    .then(data => {
      renderHomeOngs(data.ongs || []);
    })
    .catch(err => console.error('Erro ao buscar ONGs:', err));

  // Puxa os feedbacks para substituir os depoimentos hardcoded
  fetch('/api/feedbacks')
    .then(res => res.json())
    .then(data => {
      renderFeedbacks(data.feedbacks || []);
    })
    .catch(err => console.error('Erro ao buscar feedbacks:', err));
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
  fetch(`/api/pets/${id}/favorite`, { method: 'POST' })
    .then(res => {
      if(res.redirected && res.url.includes('/login') || res.status === 401) {
        window.location.href = '/login';
        return null;
      }
      return res.json();
    })
    .then(data => {
      if(!data) return;
      const p = ALL_PETS.find(x=>x.id==id);
      if(!p) return;
      p.fav = data.fav;
      btn.classList.toggle('active', p.fav);
      btn.textContent = p.fav ? '❤️' : '🤍';
      showToast(p.fav ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', p.fav ? 'success':'');
    })
    .catch(err => console.error(err));
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
  fetch('/api/site-impact')
    .then(r => r.json())
    .then(data => {
      const totals = data.totals || {};
      setMetric('cnt-pets', totals.pets || 0);
      setMetric('cnt-adopted', totals.adoptions || 0);
      setMetric('cnt-cities', totals.cities || 0);
      setMetric('impact-pets', totals.pets || 0);
      setMetric('impact-adopted', totals.adoptions || 0);
      setMetric('impact-cities', totals.cities || 0);

      const floatCities = document.getElementById('float-cities');
      if (floatCities) floatCities.textContent = `🏠 ${formatNumber(totals.cities || 0)} cidades`;

      const marquee = document.getElementById('impact-marquee');
      if (marquee) {
        const items = (data.highlights || []).concat(data.highlights || []);
        marquee.innerHTML = items.map(item => `
          <div class="marquee-item"><span>${item.icon}</span> ${item.label}</div>
        `).join('');
      }
    })
    .catch(err => console.error('Erro ao carregar impacto do site:', err));
}

function setMetric(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.dataset.target = value;
  el.textContent = formatNumber(value);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR');
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

function renderFeedbacks(feedbacks) {
  // Busca pelas classes nativas caso os IDs ainda não tenham sido definidos no HTML
  const section = document.getElementById('feedback-section') || document.querySelector('.section-testimonials');
  const grid = document.getElementById('feedbacks-grid') || document.querySelector('.testimonials-grid');
  
  if (!section || !grid) return;
  
  if (feedbacks.length === 0) {
    section.classList.add('d-none');
    return;
  }
  
  section.classList.remove('d-none');
  grid.innerHTML = feedbacks.map((f, index) => `
    <div class="testimonial-card reveal reveal-delay-${(index % 3) + 1} visible">
      <div class="testimonial-avatar">
        <img src="${f.pet_photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200'}" alt="${f.pet_name}" class="feedback-pet-img">
      </div>
      <div class="testimonial-stars">${'⭐'.repeat(f.nota)}</div>
      <div class="testimonial-quote">"${f.mensagem}"</div>
      <div class="testimonial-name">${f.tutor}</div>
      <div class="testimonial-city">Adotou o(a) ${f.pet_name}</div>
    </div>
  `).join('');
}
