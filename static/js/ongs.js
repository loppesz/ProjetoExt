let ALL_ONGS = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/ongs')
    .then(r => r.json())
    .then(data => {
      ALL_ONGS = data.ongs || [];
      updateOngMetrics();
      renderOngs();
    })
    .catch(e => console.error('Erro ao carregar ONGs', e));
});

function updateOngMetrics() {
  const totalPets = ALL_ONGS.reduce((s,o)=>s+o.pets,0);
  const totalAdopted = ALL_ONGS.reduce((s,o)=>s+o.adopted,0);
  const totalDonations = ALL_ONGS.reduce((s,o)=>s+o.donations,0);
  
  const mOngs = document.getElementById('m-ongs');
  if(mOngs) mOngs.textContent = ALL_ONGS.length.toLocaleString('pt-BR');

  const mPets = document.getElementById('m-pets');
  if(mPets) mPets.textContent = totalPets;
  
  const mAdopted = document.getElementById('m-adopted');
  if(mAdopted) mAdopted.textContent = totalAdopted.toLocaleString('pt-BR');
  
  const mDonations = document.getElementById('m-donations');
  if(mDonations) mDonations.textContent = 'R$ ' + totalDonations.toLocaleString('pt-BR');
}

function renderOngs() {
  const grid = document.getElementById('ongs-grid');
  if (!grid) return;
  grid.innerHTML = ALL_ONGS.map(o => `
    <article class="pet-card" style="cursor:pointer" onclick="location.href='/ong/${o.id}'">
      <div class="card-img">
        <img src="${o.photo}" alt="${o.name}" loading="lazy">
        <span class="card-badge badge-avail">${o.pets} pets</span>
      </div>
      <div class="card-body">
        <div class="card-name">${o.name}</div>
        <div class="card-breed" style="margin-bottom:8px">📍 ${o.city}/${o.state}</div>
        <p style="font-size:.84rem;color:var(--bark-m);line-height:1.6;margin-bottom:14px">${o.desc}</p>
        <div style="display:flex;gap:16px;font-size:.8rem;color:var(--muted);margin-bottom:14px">
          <span>🐾 ${o.pets} pets</span>
          <span>🏠 ${o.adopted} adoções</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();location.href='/ong/${o.id}'">💚 Doar</button>
          <a href="https://wa.me/${o.whatsapp}" target="_blank" class="btn btn-ghost btn-sm" onclick="event.stopPropagation()"> WhatsApp</a>
        </div>
      </div>
    </article>`).join('');
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

renderOngs();
