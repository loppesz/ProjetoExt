// ── Estado mock ──────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem('petadopt_user') || '{"name":"Maria Silva","email":"maria@email.com","role":"user"}');

// Para testar como admin: abra o console e rode:
// localStorage.setItem('petadopt_user', JSON.stringify({name:'Admin',email:'admin@petadopt.com',role:'admin'})); location.reload();

let MY_PETS = [
  {id:'3', name:'Bob',   breed:'SRD (Vira-lata)', species:'dog', size:'medium', sizeLabel:'Médio',   city:'Belo Horizonte', state:'MG', status:'available', gender:'Macho',  color:'Caramelo', vaccinated:true,  neutered:true,  desc:'Bob foi resgatado da rua.', photo:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=75', modStatus:'approved'},
  {id:'6', name:'Nina',  breed:'Poodle',           species:'dog', size:'small',  sizeLabel:'Pequeno', city:'São Paulo',       state:'SP', status:'available', gender:'Fêmea',  color:'Branco',   vaccinated:false, neutered:false, desc:'Nina é cheia de energia.', photo:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&q=75', modStatus:'approved'},
  {id:'7', name:'Mel',   breed:'Maine Coon',        species:'cat', size:'small',  sizeLabel:'Pequeno', city:'Florianópolis',   state:'SC', status:'available', gender:'Fêmea',  color:'Cinza',    vaccinated:true,  neutered:true,  desc:'Mel é dócil e carinhosa.', photo:'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&q=75', modStatus:'pending'},
];

// Todos os pets da plataforma (para moderação)
let ALL_PLATFORM_PETS = [
  {id:'1', name:'Thor',    breed:'Golden Retriever', city:'São Paulo',       state:'SP', status:'available', photo:'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&q=75', modStatus:'approved', owner:'Ana Costa'},
  {id:'2', name:'Luna',    breed:'Siamês',           city:'Rio de Janeiro',  state:'RJ', status:'available', photo:'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=300&q=75', modStatus:'approved', owner:'Carlos Lima'},
  {id:'3', name:'Bob',     breed:'SRD',              city:'Belo Horizonte',  state:'MG', status:'available', photo:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=75', modStatus:'approved', owner:'Maria Silva'},
  {id:'4', name:'Mia',     breed:'Persa',            city:'Curitiba',        state:'PR', status:'available', photo:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&q=75', modStatus:'pending',  owner:'Juliana Alves'},
  {id:'5', name:'Rex',     breed:'Pastor Alemão',    city:'Porto Alegre',    state:'RS', status:'adopted',   photo:'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&q=75', modStatus:'approved', owner:'Bruno Farias'},
  {id:'6', name:'Nina',    breed:'Poodle',           city:'São Paulo',       state:'SP', status:'available', photo:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&q=75', modStatus:'approved', owner:'Maria Silva'},
  {id:'7', name:'Mel',     breed:'Maine Coon',        city:'Florianópolis',   state:'SC', status:'available', photo:'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&q=75', modStatus:'pending',  owner:'Maria Silva'},
  {id:'8', name:'Duque',   breed:'Labrador',          city:'Recife',          state:'PE', status:'available', photo:'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=300&q=75', modStatus:'pending',  owner:'Beatriz Nunes'},
  {id:'9', name:'Bolinha', breed:'Beagle',           city:'São Paulo',       state:'SP', status:'available', photo:'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=300&q=75', modStatus:'pending',  owner:'Carlos Souza'},
];

const MY_ADOPTIONS = [
  {petName:'Luna', petBreed:'Siamês',          city:'Rio de Janeiro/RJ', status:'pending',  date:'há 2 dias',    photo:'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=100&q=75', petId:'2'},
  {petName:'Thor', petBreed:'Golden Retriever',city:'São Paulo/SP',      status:'approved', date:'há 2 semanas', photo:'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&q=75', petId:'1'},
];

const RECEIVED_REQUESTS = [
  {from:'João Santos', phone:'(11) 98888-1234', city:'São Paulo/SP', petName:'Bob', petId:'3', msg:'Olá! Tenho uma casa com quintal grande e adoro cães. Bob teria todo o espaço e amor que merece!', status:'pending'},
];

const FAVORITES = [
  {id:'2', name:'Luna', breed:'Siamês',  city:'RJ/RJ', photo:'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=300&q=75', status:'available'},
  {id:'6', name:'Nina', breed:'Poodle',  city:'SP/SP', photo:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&q=75', status:'available'},
];

// ── Init ──────────────────────────────────────────────────────────────────────
document.getElementById('sb-name').textContent = user.name;
document.getElementById('sb-email').textContent = user.email;
document.getElementById('greet-name').textContent = user.name.split(' ')[0];
document.getElementById('nav-user').textContent = 'Olá, ' + user.name.split(' ')[0];

if (user.role === 'admin') {
  document.getElementById('sb-badge').textContent = '🛡️ Administrador';
  document.getElementById('sb-badge').style.background = 'rgba(192,106,58,.12)';
  document.getElementById('sb-badge').style.color = 'var(--terra)';
  // Injeta aba de moderação na sidebar
  const sep = document.querySelector('.sidebar-nav [style*="border-top"]');
  const adminLink = document.createElement('div');
  adminLink.className = 'sidebar-link';
  adminLink.setAttribute('onclick', "showTab('moderation',this)");
  adminLink.innerHTML = '<span class="icon">🛡️</span> Moderação';
  sep.parentNode.insertBefore(adminLink, sep);
}

updateStats();
renderMyPets();
renderAdoptions();
renderReceived();
renderFavorites();
if (user.role === 'admin') renderModeration();

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('stat-mypets').textContent = MY_PETS.length;
  document.getElementById('badge-mypets').textContent = MY_PETS.length;
}

// ── Meus Pets ─────────────────────────────────────────────────────────────────
function renderMyPets() {
  const el = document.getElementById('my-pets-list');
  if (!MY_PETS.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet cadastrado</div><p class="empty-desc">Cadastre seu primeiro pet para adoção!</p><a href="new-pet.html" class="btn btn-primary">Cadastrar pet</a></div>`;
    return;
  }
  el.innerHTML = MY_PETS.map(p => `
    <div class="item-card">
      <img class="item-img" src="${p.photo}" alt="${p.name}" onclick="location.href='pet.html?id=${p.id}'" style="cursor:pointer">
      <div class="item-info">
        <div class="item-name">${p.name}</div>
        <div class="item-meta">${p.breed} · 📍 ${p.city}/${p.state}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap">
          <select class="sort-select" style="padding:6px 10px;font-size:.82rem" onchange="changeStatus('${p.id}',this.value)">
            <option value="available" ${p.status==='available'?'selected':''}>✅ Disponível</option>
            <option value="reserved"  ${p.status==='reserved'?'selected':''}>⏳ Reservado</option>
            <option value="adopted"   ${p.status==='adopted'?'selected':''}>🏠 Adotado</option>
          </select>
          <span class="status-pill ${p.modStatus==='approved'?'pill-avail':p.modStatus==='pending'?'pill-pending':'pill-rejected'}" style="margin-top:0">
            ${p.modStatus==='approved'?'✅ Aprovado':p.modStatus==='pending'?'⏳ Pendente':'❌ Removido'}
          </span>
        </div>
      </div>
      <div class="item-actions" style="flex-direction:column">
        <button class="btn btn-ghost btn-sm" onclick="openEditModal('${p.id}')">✏️ Editar</button>
        <button class="btn btn-outline btn-sm btn-danger" onclick="openRemoveModal('${p.id}')">🗑️ Remover</button>
      </div>
    </div>`).join('');
}

function changeStatus(id, newStatus) {
  const p = MY_PETS.find(x => x.id === id);
  if (!p) return;
  p.status = newStatus;
  const labels = {available:'Disponível', reserved:'Reservado', adopted:'Adotado'};
  showToast(`Status de ${p.name} alterado para "${labels[newStatus]}"`, 'success');
  updateStats();
}

// ── Editar Pet ────────────────────────────────────────────────────────────────
function openEditModal(id) {
  const p = MY_PETS.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">✏️ Editar ${p.name}</div>
    <p class="modal-sub">Atualize as informações do pet</p>
    <div id="edit-error" style="display:none;background:#fff0f0;border:1.5px solid #fca5a5;border-radius:var(--r-sm);padding:10px 14px;margin-bottom:14px;color:#c0392b;font-size:.88rem"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
      <div>
        <label style="display:block;font-size:.78rem;font-weight:700;color:var(--bark-m);margin-bottom:5px;text-transform:uppercase;letter-spacing:.03em">Nome <span style="color:var(--terra)">*</span></label>
        <input id="edit-name" class="form-input" value="${p.name}" style="width:100%;padding:11px 14px;border:2px solid var(--sand);border-radius:var(--r-sm);font-size:.93rem;font-family:var(--ff-body);background:var(--cream);color:var(--bark);transition:border-color var(--ease)">
      </div>
      <div>
        <label style="display:block;font-size:.78rem;font-weight:700;color:var(--bark-m);margin-bottom:5px;text-transform:uppercase;letter-spacing:.03em">Raça</label>
        <input id="edit-breed" class="form-input" value="${p.breed}" style="width:100%;padding:11px 14px;border:2px solid var(--sand);border-radius:var(--r-sm);font-size:.93rem;font-family:var(--ff-body);background:var(--cream);color:var(--bark);transition:border-color var(--ease)">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
      <div>
        <label style="display:block;font-size:.78rem;font-weight:700;color:var(--bark-m);margin-bottom:5px;text-transform:uppercase;letter-spacing:.03em">Cidade <span style="color:var(--terra)">*</span></label>
        <input id="edit-city" class="form-input" value="${p.city}" style="width:100%;padding:11px 14px;border:2px solid var(--sand);border-radius:var(--r-sm);font-size:.93rem;font-family:var(--ff-body);background:var(--cream);color:var(--bark);transition:border-color var(--ease)">
      </div>
      <div>
        <label style="display:block;font-size:.78rem;font-weight:700;color:var(--bark-m);margin-bottom:5px;text-transform:uppercase;letter-spacing:.03em">Estado <span style="color:var(--terra)">*</span></label>
        <input id="edit-state" class="form-input" value="${p.state}" maxlength="2" style="width:100%;padding:11px 14px;border:2px solid var(--sand);border-radius:var(--r-sm);font-size:.93rem;font-family:var(--ff-body);background:var(--cream);color:var(--bark);transition:border-color var(--ease)">
      </div>
    </div>
    <div style="margin-bottom:18px">
      <label style="display:block;font-size:.78rem;font-weight:700;color:var(--bark-m);margin-bottom:5px;text-transform:uppercase;letter-spacing:.03em">Descrição</label>
      <textarea id="edit-desc" rows="3" style="width:100%;padding:11px 14px;border:2px solid var(--sand);border-radius:var(--r-sm);font-size:.93rem;font-family:var(--ff-body);background:var(--cream);color:var(--bark);resize:vertical;transition:border-color var(--ease)">${p.desc}</textarea>
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-primary" style="flex:1" onclick="saveEdit('${p.id}')">💾 Salvar alterações</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    </div>`;
  document.getElementById('modal').classList.add('open');
}

function saveEdit(id) {
  const p = MY_PETS.find(x => x.id === id);
  const name  = document.getElementById('edit-name').value.trim();
  const city  = document.getElementById('edit-city').value.trim();
  const state = document.getElementById('edit-state').value.trim();
  const err   = document.getElementById('edit-error');

  if (!name || !city || !state) {
    err.textContent = '⚠️ Nome, cidade e estado são obrigatórios.';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';
  p.name  = name;
  p.breed = document.getElementById('edit-breed').value.trim();
  p.city  = city;
  p.state = state.toUpperCase();
  p.desc  = document.getElementById('edit-desc').value.trim();
  closeModal();
  renderMyPets();
  showToast(`${p.name} atualizado com sucesso! ✅`, 'success');
}

// ── Remover Pet ───────────────────────────────────────────────────────────────
function openRemoveModal(id) {
  const p = MY_PETS.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:3rem;margin-bottom:14px">🗑️</div>
      <div class="modal-title">Remover ${p.name}?</div>
      <p class="modal-sub">Esta ação não pode ser desfeita. O pet será removido da plataforma.</p>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-outline btn-danger" style="flex:1;border-color:rgba(192,106,58,.3);color:var(--terra)" onclick="confirmRemove('${p.id}')">Sim, remover</button>
        <button class="btn btn-ghost" style="flex:1" onclick="closeModal()">Cancelar</button>
      </div>
    </div>`;
  document.getElementById('modal').classList.add('open');
}

function confirmRemove(id) {
  const idx = MY_PETS.findIndex(x => x.id === id);
  const name = MY_PETS[idx]?.name;
  if (idx > -1) MY_PETS.splice(idx, 1);
  closeModal();
  renderMyPets();
  updateStats();
  showToast(`${name} removido da plataforma.`, '');
}

// ── Adoções ───────────────────────────────────────────────────────────────────
function renderAdoptions() {
  document.getElementById('adoptions-list').innerHTML = MY_ADOPTIONS.map(a => `
    <div class="item-card">
      <img class="item-img" src="${a.photo}" alt="${a.petName}">
      <div class="item-info">
        <div class="item-name">${a.petName}</div>
        <div class="item-meta">${a.petBreed} · 📍 ${a.city} · ${a.date}</div>
        <div class="status-pill ${a.status==='pending'?'pill-pending':a.status==='approved'?'pill-approved':'pill-rejected'}">
          ${a.status==='pending'?'⏳ Aguardando':a.status==='approved'?'✅ Aprovado':'❌ Recusado'}
        </div>
      </div>
      <div class="item-actions">
        <a href="pet.html?id=${a.petId}" class="btn btn-ghost btn-sm">Ver pet</a>
        ${a.status==='pending'?`<button class="btn btn-outline btn-sm btn-danger" onclick="showToast('Solicitação cancelada.','')">Cancelar</button>`:''}
      </div>
    </div>`).join('');
}

// ── Pedidos Recebidos ─────────────────────────────────────────────────────────
function renderReceived() {
  document.getElementById('received-list').innerHTML = RECEIVED_REQUESTS.map((r,i) => `
    <div class="item-card" id="req-${i}">
      <div style="width:52px;height:52px;border-radius:50%;background:var(--blush);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🧑</div>
      <div class="item-info">
        <div class="item-name">${r.from}</div>
        <div class="item-meta">Quer adotar: <strong>${r.petName}</strong> · Enviado recentemente</div>
        <div style="font-size:.87rem;color:var(--bark-m);margin-top:8px;font-style:italic;line-height:1.6;background:var(--cream-d);padding:10px 14px;border-radius:var(--r-sm);border-left:3px solid var(--sand)">"${r.msg}"</div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <span style="font-size:.82rem;color:var(--muted)">📞 ${r.phone}</span>
          <span style="font-size:.82rem;color:var(--muted)">·</span>
          <span style="font-size:.82rem;color:var(--muted)">📍 ${r.city}</span>
        </div>
      </div>
      <div class="item-actions" style="flex-direction:column">
        ${r.status==='pending'?`
          <button class="btn btn-sage btn-sm" onclick="approveRequest(${i})">✅ Aprovar</button>
          <button class="btn btn-outline btn-sm btn-danger" onclick="rejectRequest(${i})">❌ Recusar</button>
        `:`<span class="status-pill ${r.status==='approved'?'pill-approved':'pill-rejected'}">${r.status==='approved'?'✅ Aprovado':'❌ Recusado'}</span>`}
      </div>
    </div>`).join('');
}

function approveRequest(i) {
  RECEIVED_REQUESTS[i].status = 'approved';
  renderReceived();
  showToast('✅ Adoção aprovada! O solicitante foi notificado.', 'success');
}
function rejectRequest(i) {
  RECEIVED_REQUESTS[i].status = 'rejected';
  renderReceived();
  showToast('Solicitação recusada.', '');
}

// ── Favoritos ─────────────────────────────────────────────────────────────────
function renderFavorites() {
  document.getElementById('favorites-list').innerHTML = FAVORITES.map(p => `
    <div class="mini-pet-card" onclick="location.href='pet.html?id=${p.id}'">
      <div class="mini-card-img"><img src="${p.photo}" alt="${p.name}"></div>
      <div class="mini-card-body">
        <div class="mini-card-name">${p.name}</div>
        <div class="mini-card-meta">${p.breed} · ${p.city}</div>
        <div class="status-pill pill-avail" style="margin-top:6px">Disponível</div>
      </div>
    </div>`).join('');
}

// ── Moderação (admin) ─────────────────────────────────────────────────────────
function renderModeration() {
  const pending  = ALL_PLATFORM_PETS.filter(p => p.modStatus === 'pending').length;
  const approved = ALL_PLATFORM_PETS.filter(p => p.modStatus === 'approved').length;
  const removed  = ALL_PLATFORM_PETS.filter(p => p.modStatus === 'removed').length;
  document.getElementById('mod-pending').textContent  = pending;
  document.getElementById('mod-approved').textContent = approved;
  document.getElementById('mod-removed').textContent  = removed;

  document.getElementById('moderation-list').innerHTML = ALL_PLATFORM_PETS.map(p => `
    <div class="item-card" id="mod-pet-${p.id}">
      <img class="item-img" src="${p.photo}" alt="${p.name}" style="cursor:pointer" onclick="location.href='pet.html?id=${p.id}'">
      <div class="item-info">
        <div class="item-name">${p.name}</div>
        <div class="item-meta">${p.breed} · 📍 ${p.city}/${p.state} · por ${p.owner}</div>
        <span class="status-pill ${p.modStatus==='approved'?'pill-avail':p.modStatus==='pending'?'pill-pending':'pill-rejected'}">
          ${p.modStatus==='approved'?'✅ Aprovado':p.modStatus==='pending'?'⏳ Pendente':'❌ Removido'}
        </span>
      </div>
      <div class="item-actions" style="flex-direction:column">
        ${p.modStatus !== 'approved' ? `<button class="btn btn-sage btn-sm" onclick="moderateApprove('${p.id}')">✅ Aprovar</button>` : ''}
        ${p.modStatus !== 'removed'  ? `<button class="btn btn-outline btn-sm btn-danger" onclick="moderateRemove('${p.id}')">🗑️ Remover</button>` : ''}
      </div>
    </div>`).join('');
}

function moderateApprove(id) {
  const p = ALL_PLATFORM_PETS.find(x => x.id === id);
  if (!p) return;
  p.modStatus = 'approved';
  renderModeration();
  showToast(`${p.name} aprovado na plataforma. ✅`, 'success');
}

function moderateRemove(id) {
  const p = ALL_PLATFORM_PETS.find(x => x.id === id);
  if (!p) return;
  p.modStatus = 'removed';
  renderModeration();
  showToast(`${p.name} removido da plataforma.`, '');
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function showTab(id, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (el) el.classList.add('active');
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function closeModal(e) {
  if (!e || e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open');
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('petadopt_user');
  location.href = 'index.html';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}
window.showToast = showToast;
