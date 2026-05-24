// ── Estado mock ──────────────────────────────────────────────────────────────
let user = JSON.parse(localStorage.getItem('petadopt_user') || '{"name":"Maria Silva","email":"maria@email.com","role":"user"}');

// Carrega dados do usuário da API ao abrir a página
fetch('/api/user')
  .then(r => r.json())
  .then(data => {
    user = data;
    localStorage.setItem('petadopt_user', JSON.stringify(user));
    initDashboard();
  })
  .catch(e => {
    console.error('Erro ao carregar usuário:', e);
    initDashboard();
  });

function initDashboard() {
  // Inicializa o dashboard com os dados do usuário
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

  renderMyPets();
  renderAdoptions();
  renderReceived();
  renderFavorites();
  if (user.role === 'admin') renderModeration();
}

// Para testar como admin: abra o console e rode:
// localStorage.setItem('petadopt_user', JSON.stringify({name:'Admin',email:'admin@petadopt.com',role:'admin'})); location.reload();

let MY_PETS = [];

// Todos os pets da plataforma (para moderação)
let ALL_PLATFORM_PETS = [];

const MY_ADOPTIONS = [];

const RECEIVED_REQUESTS = [];

const FAVORITES = [];

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('stat-mypets').textContent = MY_PETS.length;
  document.getElementById('badge-mypets').textContent = MY_PETS.length;
}

// ── Meus Pets ─────────────────────────────────────────────────────────────────
function renderMyPets() {
  // Busca os pets do usuário logado da API
  fetch('/api/user/pets')
    .then(r => r.json())
    .then(data => {
      MY_PETS = data.pets || [];
      
      const el = document.getElementById('my-pets-list');
      if (!MY_PETS.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet cadastrado</div><p class="empty-desc">Cadastre seu primeiro pet para adoção!</p><a href="new-pet.html" class="btn btn-primary">Cadastrar pet</a></div>`;
        updateStats();
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
      updateStats();
    })
    .catch(e => {
      console.error('Erro ao carregar meus pets:', e);
      MY_PETS = [];
      updateStats();
    });
}


function changeStatus(id, newStatus) {
  fetch(`/api/pets/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      showToast(`✅ ${data.mensagem}`, 'success');
      renderMyPets();
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  })
  .catch(e => showToast(`Erro: ${e}`, ''));
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
  const name  = document.getElementById('edit-name').value.trim();
  const city  = document.getElementById('edit-city').value.trim();
  const state = document.getElementById('edit-state').value.trim();
  const err   = document.getElementById('edit-error');

  if (!name || !city || !state) {
    err.textContent = '⚠️ Nome, cidade e estado são obrigatórios.';
    err.style.display = 'block';
    return;
  }
  
  console.log('DEBUG: Salvando pet', id, { name, city, state });
  
  fetch(`/api/pets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      breed: document.getElementById('edit-breed').value.trim(),
      city: city,
      state: state.toUpperCase(),
      description: document.getElementById('edit-desc').value.trim()
    })
  })
  .then(r => {
    console.log('DEBUG: Response status', r.status);
    return r.json();
  })
  .then(data => {
    console.log('DEBUG: Response data', data);
    if (data.sucesso) {
      closeModal();
      showToast(`✅ ${data.mensagem}`, 'success');
      renderMyPets();
    } else {
      err.textContent = `⚠️ ${data.erro}`;
      err.style.display = 'block';
    }
  })
  .catch(e => {
    console.error('DEBUG: Erro na requisição', e);
    err.textContent = `⚠️ Erro: ${e}`;
    err.style.display = 'block';
  });
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
  console.log('DEBUG: Removendo pet', id);
  
  fetch(`/api/pets/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(r => {
    console.log('DEBUG: Response status', r.status);
    return r.json();
  })
  .then(data => {
    console.log('DEBUG: Response data', data);
    if (data.sucesso) {
      closeModal();
      showToast(`✅ ${data.mensagem}`, 'success');
      renderMyPets();
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  })
  .catch(e => {
    console.error('DEBUG: Erro na requisição', e);
    showToast(`Erro: ${e}`, '');
  });
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
  // Carrega todos os pets para contar status
  fetch('/api/admin/pets/pending')
    .then(r => r.json())
    .then(data => {
      const pets = data.pets || [];
      
      // Contar pets por status
      const pending = pets.length;
      
      // Buscar contadores totais
      fetch('/api/admin/pets/stats')
        .then(r => r.json())
        .then(stats => {
          document.getElementById('mod-pending').textContent = stats.pending || pending;
          document.getElementById('mod-approved').textContent = stats.approved || 0;
          document.getElementById('mod-removed').textContent = stats.removed || 0;
        })
        .catch(e => {
          // Se rota não existir, mostrar só o pending
          document.getElementById('mod-pending').textContent = pending;
          document.getElementById('mod-approved').textContent = '0';
          document.getElementById('mod-removed').textContent = '0';
        });
      
      const el = document.getElementById('moderation-list');
      
      if (!pets.length) {
        el.innerHTML = `<div class="empty" style="grid-column:1/-1">
          <div class="empty-icon">✅</div>
          <div class="empty-title">Todos os pets foram aprovados!</div>
          <p class="empty-desc">Não há pets pendentes de moderação.</p>
        </div>`;
        return;
      }
      
      el.innerHTML = pets.map(p => `
        <div class="item-card" id="mod-pet-${p.id}">
          <img class="item-img" src="${p.photo}" alt="${p.name}" style="cursor:pointer">
          <div class="item-info">
            <div class="item-name">${p.name}</div>
            <div class="item-meta">${p.breed} · 📍 ${p.city}/${p.state}</div>
            <div class="item-meta">👤 ${p.owner}</div>
            ${p.description ? `<p style="font-size:.87rem;color:var(--bark-m);margin-top:8px;line-height:1.6">${p.description}</p>` : ''}
            <span class="status-pill pill-pending" style="margin-top:8px">⏳ Pendente de aprovação</span>
          </div>
          <div class="item-actions" style="flex-direction:column">
            <button class="btn btn-sage btn-sm" onclick="moderateApprove(${p.id})">✅ Aprovar</button>
            <button class="btn btn-outline btn-sm btn-danger" onclick="moderateRemove(${p.id})">🗑️ Remover</button>
          </div>
        </div>`).join('');
    })
    .catch(e => {
      console.error('Erro ao carregar pets pendentes:', e);
      document.getElementById('moderation-list').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-title">Erro ao carregar</div></div>`;
    });
}

function moderateApprove(petId) {
  fetch(`/api/admin/pets/${petId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      document.getElementById(`mod-pet-${petId}`)?.remove();
      showToast(`✅ ${data.mensagem}`, 'success');
      renderModeration(); // Recarrega lista
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  })
  .catch(e => showToast(`Erro: ${e}`, ''));
}

function moderateRemove(petId) {
  if (!confirm('Tem certeza que deseja remover este pet?')) return;
  
  fetch(`/api/admin/pets/${petId}/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      document.getElementById(`mod-pet-${petId}`)?.remove();
      showToast(`${data.mensagem}`, 'success');
      renderModeration(); // Recarrega lista
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  })
  .catch(e => showToast(`Erro: ${e}`, ''));
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
  location.href = '/logout';
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
