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
  
  const navUser = document.getElementById('nav-user');
  if (navUser) navUser.textContent = 'Olá, ' + user.name.split(' ')[0];

  if (user.role === 'admin') {
    document.getElementById('sb-badge').textContent = '🛡️ Administrador';
    document.getElementById('sb-badge').style.background = 'rgba(192,106,58,.12)';
    document.getElementById('sb-badge').style.color = 'var(--terra)';
    
    // Exibe aba de moderação na sidebar
    const modNav = document.getElementById('nav-moderation');
    if(modNav) modNav.style.display = 'flex';
    
    const ongNav = document.getElementById('nav-ongs');
    if(ongNav) ongNav.style.display = 'flex';
    
    const pendingOngNav = document.getElementById('nav-pending-ongs');
    if(pendingOngNav) pendingOngNav.style.display = 'flex';

    // Altera as ações rápidas da aba "Resumo" para focar na administração
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
        quickActions.innerHTML = `
          <button class="btn btn-primary" onclick="showTab('moderation', document.getElementById('nav-moderation'))">🛡️ Avaliar Pets Pendentes</button>
          <a href="/pets" class="btn btn-outline">🔍 Ver site público</a>
        `;
    }

    // Adapta as estatísticas da aba de resumo para o Admin
    const labels = document.querySelectorAll('#tab-overview .stat-label');
    if (labels.length >= 3) {
      labels[0].textContent = 'Total de Pets';
      labels[1].textContent = 'ONGs Cadastradas';
      labels[2].textContent = 'Pets Pendentes';
      
      // Busca os números reais no backend
      fetch('/api/admin/pets/stats')
        .then(r => r.json())
        .then(stats => {
          document.getElementById('stat-mypets').textContent = stats.total_pets || 0;
          document.getElementById('stat-adoptions').textContent = stats.total_ongs || 0;
          document.getElementById('stat-received').textContent = stats.pending || 0;
        });
    }

    // Esconde as abas de usuário comum do menu lateral
    ['my-pets', 'adoptions', 'received', 'favorites'].forEach(tab => {
      const link = document.querySelector(`[onclick*="showTab('${tab}'"]`);
      if (link) link.classList.add('d-none');
    });
  }

  renderMyPets();
  renderAdoptions();
  renderReceived();
  renderFavorites();
  if (user.role === 'admin') {
    renderModeration();
    renderAdminOngs();
    renderPendingOngs();
  }
}

// Para testar como admin: abra o console e rode:
// localStorage.setItem('petadopt_user', JSON.stringify({name:'Admin',email:'admin@petadopt.com',role:'admin'})); location.reload();

let MY_PETS = [];

// Todos os pets da plataforma (para moderação)
let ALL_PLATFORM_PETS = [];

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
        el.innerHTML = `<div class="empty"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet cadastrado</div><p class="empty-desc">Cadastre seu primeiro pet para adoção!</p><a href="/new-pet" class="btn btn-primary">Cadastrar pet</a></div>`;
        updateStats();
        return;
      }
      el.innerHTML = MY_PETS.map(p => `
        <div class="item-card">
          <img class="item-img" src="${p.photo}" alt="${p.name}" onclick="location.href='/pet/${p.id}'" style="cursor:pointer">
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
            <label class="form-label">Nome <span style="color:var(--terra)">*</span></label>
            <input id="edit-name" class="form-input" value="${p.name}">
      </div>
      <div>
            <label class="form-label">Raça</label>
            <input id="edit-breed" class="form-input" value="${p.breed}">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
      <div>
            <label class="form-label">Cidade <span style="color:var(--terra)">*</span></label>
            <input id="edit-city" class="form-input" value="${p.city}">
      </div>
      <div>
            <label class="form-label">Estado <span style="color:var(--terra)">*</span></label>
            <input id="edit-state" class="form-input" value="${p.state}" maxlength="2">
      </div>
    </div>
    <div style="margin-bottom:18px">
          <label class="form-label">Descrição</label>
          <textarea id="edit-desc" class="form-textarea" rows="3">${p.desc}</textarea>
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
  fetch('/api/user/adocoes')
    .then(r => r.json())
    .then(data => {
      const adocoes = data.adocoes || [];
      const el = document.getElementById('adoptions-list');
      
      if(document.getElementById('stat-adoptions')) {
        document.getElementById('stat-adoptions').textContent = adocoes.length;
      }

      if (!adocoes.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">💌</div><div class="empty-title">Nenhuma solicitação enviada</div><p class="empty-desc">Você ainda não enviou nenhum pedido de adoção.</p><a href="/pets" class="btn btn-primary">Encontrar um pet</a></div>`;
        return;
      }
      el.innerHTML = adocoes.map(a => `
        <div class="item-card">
          <img class="item-img" src="${a.photo}" alt="${a.petName}">
          <div class="item-info">
            <div class="item-name">${a.petName}</div>
            <div class="item-meta">${a.petBreed} · 📍 ${a.city} · ${a.date}</div>
            <div class="status-pill ${a.status==='pending'?'pill-pending':a.status==='approved'?'pill-approved':'pill-rejected'}" style="margin-top: 6px;">
              ${a.status==='pending'?'⏳ Aguardando':a.status==='approved'?'✅ Aprovado':'❌ Recusado'}
            </div>
          </div>
          <div class="item-actions" style="flex-direction:column">
            <a href="/pet/${a.petId}" class="btn btn-outline btn-sm">👁️ Ver pet</a>
            ${a.status==='pending'?`<button class="btn btn-outline btn-sm btn-danger" onclick="cancelRequest(${a.id})">🗑️ Cancelar</button>`:''}
          </div>
        </div>`).join('');
    });
}

function cancelRequest(id) {
  if(!confirm('Deseja realmente cancelar sua solicitação de adoção?')) return;
  fetch(`/api/user/solicitacao/${id}/cancel`, { method: 'POST' })
    .then(() => {
      showToast('Solicitação cancelada.', '');
      renderAdoptions();
    });
}

// ── Pedidos Recebidos ─────────────────────────────────────────────────────────
function renderReceived() {
  fetch('/api/user/solicitacoes')
    .then(r => r.json())
    .then(data => {
      const recebidas = data.solicitacoes || [];
      const el = document.getElementById('received-list');
      
      const pendentes = recebidas.filter(s => s.status === 'pending').length;
      if(document.getElementById('stat-received')) document.getElementById('stat-received').textContent = pendentes;
      
      if (!recebidas.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">📥</div><div class="empty-title">Nenhum pedido recebido</div><p class="empty-desc">Quando alguém quiser adotar seus pets, os pedidos aparecerão aqui.</p></div>`;
        return;
      }
      el.innerHTML = recebidas.map(r => `
        <div class="item-card" id="req-${r.id}">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--blush);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🧑</div>
          <div class="item-info">
            <div class="item-name">${r.from}</div>
            <div class="item-meta">Quer adotar: <strong>${r.petName}</strong></div>
            <div style="font-size:.87rem;color:var(--bark-m);margin-top:8px;font-style:italic;line-height:1.6;background:var(--cream-d);padding:10px 14px;border-radius:var(--r-sm);border-left:3px solid var(--sand)">"${r.msg}"</div>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
              <span style="font-size:.82rem;color:var(--muted)">📞 ${r.phone}</span>
              <span style="font-size:.82rem;color:var(--muted)">·</span>
              <span style="font-size:.82rem;color:var(--muted)">📍 ${r.city}</span>
            </div>
          </div>
          <div class="item-actions" style="flex-direction:column">
            ${r.status==='pending'?`
              <button class="btn btn-sage btn-sm" onclick="respondRequest(${r.id}, 'approved')">✅ Aprovar</button>
              <button class="btn btn-outline btn-sm btn-danger" onclick="respondRequest(${r.id}, 'rejected')">❌ Recusar</button>
            `:`<span class="status-pill ${r.status==='approved'?'pill-approved':'pill-rejected'}">${r.status==='approved'?'✅ Aprovado':'❌ Recusado'}</span>`}
          </div>
        </div>`).join('');
    });
}

function respondRequest(id, status) {
  // Reaproveitando a rota que já existia para as ONGs
  fetch(`/api/ong/solicitacao/${id}/status`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({status})
  }).then(() => {
    showToast(status === 'approved' ? '✅ Adoção aprovada! O solicitante foi notificado.' : 'Solicitação recusada.', status === 'approved' ? 'success' : '');
    renderReceived();
  });
}

// ── Favoritos ─────────────────────────────────────────────────────────────────
function renderFavorites() {
  document.getElementById('favorites-list').innerHTML = FAVORITES.map(p => `
    <div class="mini-pet-card" onclick="location.href='/pet/${p.id}'">
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

// ── Gerenciar ONGs (admin) ───────────────────────────────────────────────────
function renderAdminOngs() {
  fetch('/api/ongs')
    .then(r => r.json())
    .then(data => {
      const ongs = data.ongs || [];
      const el = document.getElementById('admin-ongs-list');
      if (!ongs.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">🏢</div><div class="empty-title">Nenhuma ONG cadastrada</div></div>`;
        return;
      }
      el.innerHTML = ongs.map(o => `
        <div class="item-card">
          <img class="item-img" src="${o.photo}" alt="${o.name}">
          <div class="item-info">
            <div class="item-name">${o.name}</div>
            <div class="item-meta">📍 ${o.city}/${o.state} · 📞 ${o.whatsapp}</div>
          </div>
        </div>`).join('');
    });
}

function openNewOngModal() {
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">🏢 Cadastrar Nova ONG</div>
    <p class="modal-sub">Preencha os dados básicos da ONG parceira</p>
    <div id="ong-error" style="display:none;background:#fff0f0;border:1.5px solid #fca5a5;border-radius:var(--r-sm);padding:10px 14px;margin-bottom:14px;color:#c0392b;font-size:.88rem"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
      <div>
        <label class="form-label">Nome da ONG <span style="color:var(--terra)">*</span></label>
        <input id="ong-nome" class="form-input">
      </div>
      <div>
        <label class="form-label">WhatsApp</label>
        <input id="ong-whatsapp" class="form-input">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
      <div>
        <label class="form-label">Cidade <span style="color:var(--terra)">*</span></label>
        <input id="ong-city" class="form-input">
      </div>
      <div>
        <label class="form-label">Estado <span style="color:var(--terra)">*</span></label>
        <input id="ong-state" class="form-input" maxlength="2">
      </div>
    </div>
    <div style="margin-bottom:14px">
      <label class="form-label">Chave PIX</label>
      <input id="ong-pix" class="form-input">
    </div>
    <div style="margin-bottom:18px">
      <label class="form-label">Descrição Curta <span style="color:var(--terra)">*</span></label>
      <textarea id="ong-desc" class="form-textarea" rows="3"></textarea>
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-primary" style="flex:1" onclick="saveNewOng()">Cadastrar ONG</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    </div>
  `;
  document.getElementById('modal').classList.add('open');
}

function saveNewOng() {
  const nome = document.getElementById('ong-nome').value.trim();
  const cidade = document.getElementById('ong-city').value.trim();
  const estado = document.getElementById('ong-state').value.trim().toUpperCase();
  const err = document.getElementById('ong-error');
  
  if(!nome || !cidade || !estado) {
    err.textContent = '⚠️ Preencha Nome, Cidade e Estado.';
    err.style.display = 'block';
    return;
  }
  
  fetch('/api/ongs', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      nome, cidade, estado,
      whatsapp: document.getElementById('ong-whatsapp').value.trim(),
      chave_pix: document.getElementById('ong-pix').value.trim(),
      descricao: document.getElementById('ong-desc').value.trim()
    })
  })
  .then(r => r.json())
  .then(data => {
    if(data.sucesso) {
      closeModal();
      showToast(data.mensagem, 'success');
      renderAdminOngs();
    } else {
      err.textContent = data.erro; err.style.display = 'block';
    }
  });
}

// ── ONGs Pendentes (admin) ───────────────────────────────────────────────────
function renderPendingOngs() {
  fetch('/api/admin/ongs/pending')
    .then(r => r.json())
    .then(data => {
      const ongs = data.ongs || [];
      const el = document.getElementById('pending-ongs-list');
      if (!el) return;
      if (!ongs.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">🏢</div><div class="empty-title">Nenhuma ONG pendente</div></div>`;
        return;
      }
      el.innerHTML = ongs.map(o => `
        <div class="item-card" id="mod-ong-${o.id}">
          <img class="item-img" src="${o.photo || 'https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=600&q=80'}" alt="${o.name}">
          <div class="item-info">
            <div class="item-name">${o.name}</div>
            <div class="item-meta">📍 ${o.city}/${o.state} · 📞 ${o.whatsapp}</div>
            ${o.desc ? `<p class="item-desc-text">${o.desc}</p>` : ''}
            <span class="status-pill pill-pending mt-10">⏳ Pendente de aprovação</span>
          </div>
          <div class="item-actions flex-column">
            <button class="btn btn-sage btn-sm" onclick="moderateOngApprove(${o.id})">✅ Aprovar</button>
            <button class="btn btn-outline btn-sm btn-danger" onclick="moderateOngReject(${o.id})">❌ Recusar</button>
          </div>
        </div>`).join('');
    });
}

function moderateOngApprove(id) {
  fetch(`/api/admin/ongs/${id}/approve`, { method: 'POST' })
    .then(r => r.json())
    .then(data => { 
      if(data.sucesso){ 
        document.getElementById(`mod-ong-${id}`)?.remove();
        showToast(data.mensagem, 'success'); 
        renderPendingOngs(); 
        renderAdminOngs(); 
      } else { showToast(data.erro, ''); }
    });
}

function moderateOngReject(id) {
  if (!confirm('Tem certeza que deseja recusar e ocultar esta ONG?')) return;
  fetch(`/api/admin/ongs/${id}/reject`, { method: 'POST' })
    .then(r => r.json())
    .then(data => { 
      if(data.sucesso){ 
        document.getElementById(`mod-ong-${id}`)?.remove();
        showToast(data.mensagem, 'success'); 
        renderPendingOngs(); 
        renderAdminOngs();
      } else { showToast(data.erro, ''); }
    });
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
