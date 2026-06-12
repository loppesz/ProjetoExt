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
    
    const ongNav = document.getElementById('nav-ongs');
    if(ongNav) ongNav.style.display = 'flex';
    
    const pendingOngNav = document.getElementById('nav-pending-ongs');
    if(pendingOngNav) pendingOngNav.style.display = 'flex';

    const siteImpactNav = document.getElementById('nav-site-impact');
    if(siteImpactNav) siteImpactNav.style.display = 'flex';

    // Altera as ações rápidas da aba "Resumo" para focar na administração
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
        quickActions.innerHTML = `
          <button class="btn btn-primary" onclick="showTab('pending-ongs', document.getElementById('nav-pending-ongs'))">Avaliar ONGs pendentes</button>
          <button class="btn btn-outline" onclick="openAdminPetsTab()">🐾 Gerenciar Pets</button>
          <button class="btn btn-outline" onclick="openAdminOngsTab()">🏢 Gerenciar ONGs</button>
          <button class="btn btn-outline" onclick="openAdminUsersTab()">🧑 Gerenciar Usuários</button>
        `;
    }

    // Adapta as estatísticas da aba de resumo para o Admin
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-value" id="stat-mypets">0</div>
          <div class="stat-label">Total de Pets</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-value" id="stat-adoptions">0</div>
          <div class="stat-label">ONGs Cadastradas</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-value" id="stat-received">0</div>
          <div class="stat-label">ONGs Pendentes</div>
        </div>
      `;

      // Busca os números reais no backend
      fetch('/api/admin/pets/stats')
        .then(r => r.json())
        .then(stats => {
          document.getElementById('stat-mypets').textContent = stats.total_pets || 0;
          document.getElementById('stat-adoptions').textContent = stats.total_ongs || 0;
          document.getElementById('stat-received').textContent = stats.pending_ongs || 0;
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
    renderAdminOngs();
    renderPendingOngs();
    renderSiteImpact();
  }


  if (user.role === 'user') {
    // Esconde abas de gerenciamento de pets para usuários comuns
    ['my-pets', 'received'].forEach(tab => {
      const link = document.querySelector(`[onclick*="showTab('${tab}'"]`);
      if (link) link.style.display = 'none';
    });

    const statMyPets = document.getElementById('stat-mypets');
    if (statMyPets && statMyPets.closest('.stat-card')) statMyPets.closest('.stat-card').style.display = 'none';
    
    const statReceived = document.getElementById('stat-received');
    if (statReceived && statReceived.closest('.stat-card')) statReceived.closest('.stat-card').style.display = 'none';

    document.querySelectorAll('a[href="/new-pet"]').forEach(btn => btn.style.display = 'none');
  }

  // Se a URL contiver uma hash (ex: /dashboard#adoptions), abre a aba correspondente na hora
  if (window.location.hash) {
    const tabId = window.location.hash.replace('#', '');
    const linkEl = document.querySelector(`[onclick*="'${tabId}'"]`);
    if (document.getElementById('tab-' + tabId)) showTab(tabId, linkEl);
  } else if (user.role === 'user') {
    // Se for usuário normal, abre a aba de adoções por padrão (já que Meus Pets está oculto)
    const adoptionsLink = document.querySelector(`[onclick*="showTab('adoptions'"]`);
    if (adoptionsLink) showTab('adoptions', adoptionsLink);
  }

  // Torna os cards de estatísticas clicáveis e interativos
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length > 0) {
    statCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.style.transition = 'transform 0.2s, box-shadow 0.2s';
      card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-4px)'; });
      card.addEventListener('mouseleave', () => { card.style.transform = 'translateY(0)'; });
    });

    if (user.role === 'admin' && statCards.length >= 3) {
      statCards[0].onclick = () => { openAdminPetsTab(); };
      statCards[1].onclick = () => { const l = document.querySelector('[onclick*="ongs-admin"]'); if(l) showTab('ongs-admin', l); };
      statCards[2].onclick = () => { const l = document.querySelector('[onclick*="pending-ongs"]'); if(l) showTab('pending-ongs', l); };
    } else {
      const cMyPets = document.getElementById('stat-mypets')?.closest('.stat-card');
      const cAdoptions = document.getElementById('stat-adoptions')?.closest('.stat-card');
      const cReceived = document.getElementById('stat-received')?.closest('.stat-card');
      
      if (cMyPets) cMyPets.onclick = () => { const l = document.querySelector('[onclick*="my-pets"]'); if(l) showTab('my-pets', l); };
      if (cAdoptions) cAdoptions.onclick = () => { const l = document.querySelector('[onclick*="adoptions"]'); if(l) showTab('adoptions', l); };
      if (cReceived) cReceived.onclick = () => { const l = document.querySelector('[onclick*="received"]'); if(l) showTab('received', l); };
    }
  }
}

// Para testar como admin: abra o console e rode:
// localStorage.setItem('petadopt_user', JSON.stringify({name:'Admin',email:'admin@petadopt.com',role:'admin'})); location.reload();

let MY_PETS = [];

let ALL_RECEIVED = [];
let receivedFilterDate = 'today';
let receivedSpecificDate = '';
let receivedStartDate = '';
let receivedEndDate = '';

// ── Stats ─────────────────────────────────────────────────────────────────────
function updateStats() {
  if (user.role === 'admin') return; // Impede que os números do Admin sejam sobrescritos
  const statMyPets = document.getElementById('stat-mypets');
  if (statMyPets) statMyPets.textContent = MY_PETS.length;
  const badgeMyPets = document.getElementById('badge-mypets');
  if (badgeMyPets) badgeMyPets.textContent = MY_PETS.length;
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
            </div>
          </div>
          <div class="item-actions" style="flex-direction:column">
            <button class="btn btn-ghost btn-sm" onclick="openEditTab('${p.id}')">✏️ Editar</button>
            <button class="btn btn-outline btn-sm btn-danger" onclick="confirmRemove('${p.id}')">🗑️ Remover</button>
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
      renderReceived();
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  })
  .catch(e => showToast(`Erro: ${e}`, ''));
}

// ── Editar Pet ────────────────────────────────────────────────────────────────
function openEditTab(id) {
  const p = MY_PETS.find(x => x.id == id) || (typeof ADMIN_ALL_PETS !== 'undefined' ? ADMIN_ALL_PETS.find(x => x.id == id) : null);
  if (!p) return;

  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  let tab = document.getElementById('tab-edit-pet');
  if (!tab) {
    tab = document.createElement('div');
    tab.id = 'tab-edit-pet';
    tab.className = 'tab-panel';
    document.querySelector('.content').appendChild(tab);
  }
  tab.classList.add('active');

  tab.innerHTML = `
    <div class="fade-in">
      <div class="panel-header" style="margin-bottom: 8px;">
        <div class="panel-title">✏️ Editar ${p.name}</div>
      </div>
      <p style="color: var(--muted); margin-bottom: 24px; font-size: 0.95rem;">Atualize as informações do pet</p>
      <div id="edit-error" class="modal-error-banner"></div>
      
      <!-- Dados do Pet -->
      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
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
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:0">
          <div>
                <label class="form-label">Cidade <span style="color:var(--terra)">*</span></label>
                <input id="edit-city" class="form-input" value="${p.city}">
          </div>
          <div>
                <label class="form-label">Estado <span style="color:var(--terra)">*</span></label>
                <input id="edit-state" class="form-input" value="${p.state}" maxlength="2">
          </div>
        </div>
      </div>
      
      <!-- Descrição -->
      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--yellow); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 18px;">
        <div style="margin-bottom:0">
              <label class="form-label">Descrição</label>
              <textarea id="edit-desc" class="form-textarea" rows="3">${p.desc}</textarea>
        </div>
      </div>
      
      <div style="margin-top: 28px; display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="saveEdit('${p.id}')" style="padding: 12px 24px;">💾 Salvar alterações</button>
        <button class="btn btn-ghost" onclick="showTab('my-pets')" style="padding: 12px 24px;">Voltar</button>
      </div>
    </div>
  `;
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
      showToast(`✅ ${data.mensagem}`, 'success');
      if (document.getElementById('tab-admin-pets') && user.role === 'admin') {
        fetch('/api/admin/pets').then(r => r.json()).then(d => { ADMIN_ALL_PETS = d.pets || []; renderAdminPetsList(); });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-admin-pets').classList.add('active');
      } else {
        renderMyPets();
        showTab('my-pets');
      }
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
function confirmRemove(id) {
  if(!confirm('Esta ação não pode ser desfeita. Deseja realmente remover o pet da plataforma?')) return;
  
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
      
      if(document.getElementById('stat-adoptions') && user.role !== 'admin') {
        document.getElementById('stat-adoptions').textContent = adocoes.length;
      }

      // ===== ATUALIZAÇÃO DO MENU LATERAL E NOTIFICAÇÃO =====
      const sidebarAdoptions = document.querySelector(`[onclick*="showTab('adoptions'"]`) || document.querySelector(`[onclick*='showTab("adoptions"']`);
      if (sidebarAdoptions) {
        // Renomeia o texto do menu para "Acompanhar Pedidos"
        const iconSpan = sidebarAdoptions.querySelector('.icon');
        if (iconSpan && !sidebarAdoptions.innerText.includes('Acompanhar Pedidos')) {
          sidebarAdoptions.innerHTML = '';
          sidebarAdoptions.appendChild(iconSpan);
          sidebarAdoptions.appendChild(document.createTextNode(' Acompanhar Pedidos'));
        }
      }
      
      const panelTitle = document.querySelector('#tab-adoptions .panel-title');
      if (panelTitle) panelTitle.innerHTML = '📋 Acompanhar Pedidos';
      // ======================================================

      if (!adocoes.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">💌</div><div class="empty-title">Nenhuma solicitação enviada</div><p class="empty-desc">Você ainda não enviou nenhum pedido de adoção.</p><a href="/pets" class="btn btn-primary">Encontrar um pet</a></div>`;
        return;
      }
        el.innerHTML = adocoes.map(a => {
        let msgFormatted = '';
        if (a.msg && a.msg.includes('📞 Contato:')) {
          const parts = a.msg.split('\n\n💬 Mensagem:');
          const infoList = parts[0].split('\n').filter(l => l.trim() !== '');
          const obs = parts.length > 1 ? parts[1].trim() : '';
          
          const borderColors = ['var(--blue)', 'var(--yellow)', 'var(--navy)', '#5ba3d4'];
          const gridItems = infoList.map((item, index) => {
            const colonIdx = item.indexOf(':');
            let label = item, val = '';
            if (colonIdx > -1) {
              label = item.substring(0, colonIdx + 1);
              val = item.substring(colonIdx + 1).trim();
            }
            return `<div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid ${borderColors[index % borderColors.length]}; padding: 12px 16px; border-radius: 12px; font-size: 0.88rem; color: #374151; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08);"><strong style="color:var(--navy); font-weight:700; display:block; margin-bottom:2px;">${label}</strong> ${val}</div>`;
          }).join('');
          
          msgFormatted = `
            <details style="margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <summary style="list-style: none; outline: none; cursor: pointer;">
                <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 600; color: var(--navy);">
                  <span style="display: flex; align-items: center; gap: 8px;">📋 <span>Detalhes da sua solicitação</span></span>
                  <span style="font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; color: #475569;">Ver informações ▾</span>
                </div>
              </summary>
              <div style="padding: 0 16px 16px 16px; border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 16px;">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">${gridItems}</div>
                ${obs ? `<div style="background:#f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 10px; font-size:.87rem; color:var(--bark-m); margin-top:12px; line-height:1.6;"><strong style="color:var(--navy); display:block; margin-bottom:4px; font-weight:700;">💬 Sua Mensagem:</strong>${obs}</div>` : ''}
              </div>
            </details>`;
        } else if (a.msg) {
          msgFormatted = `
            <details style="margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <summary style="list-style: none; outline: none; cursor: pointer;">
                <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 600; color: var(--navy);">
                  <span style="display: flex; align-items: center; gap: 8px;">📋 <span>Sua Mensagem</span></span>
                  <span style="font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; color: #475569;">Ver informações ▾</span>
                </div>
              </summary>
              <div style="padding: 0 16px 16px 16px; border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 16px;">
                <div style="background:#f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 10px; font-size:.87rem; color:var(--bark-m); line-height:1.6; white-space:pre-wrap;"><strong style="color:var(--navy); display:block; margin-bottom:4px; font-weight:700;">💬 Sua Mensagem:</strong>\n${a.msg}</div>
              </div>
            </details>`;
        }

        return `
        <div class="item-card" id="adocao-req-${a.id}" style="flex-direction:column; align-items: stretch; padding: 24px;">
          <div style="display:flex; gap: 16px; width: 100%;">
            <img class="item-img" src="${a.photo}" alt="${a.petName}" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover;">
            <div class="item-info" style="flex:1;">
              <div class="item-name" style="font-size: 1.2rem;">${a.petName}</div>
              <div class="item-meta">${a.petBreed} · 📍 ${a.city} · ${a.date}</div>
              ${a.status==='approved' ? `<div class="status-pill pill-approved" style="margin-top:8px;">✅ Pedido Aceito</div>` : a.status==='rejected' ? `<div class="status-pill" style="margin-top:8px; background:#f3f4f6; color:#4b5563;">❌ Solicitação não aceita</div>` : `<div class="status-pill pill-pending" style="margin-top:8px;">⏳ Aguardando contato do responsável</div>`}
            </div>
            <div class="item-actions" style="flex-direction:column; align-items: flex-end; min-width: 140px;">
              <a href="/pet/${a.petId}" class="btn btn-outline btn-sm">👁️ Ver pet</a>
              ${a.status==='pending' ? `<button class="btn btn-outline btn-sm btn-danger" onclick="cancelRequest(${a.id})">🗑️ Cancelar Pedido</button>` : ''}
              ${a.has_feedback ? `<span style="font-size: 0.85rem; background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-weight: 700; margin-top: 4px;">⭐ Avaliado</span>` : ''}
              ${a.status==='approved' && !a.has_feedback ? `<button class="btn btn-primary btn-sm" onclick="openFeedbackTab(${a.id})" style="margin-top: 4px;">⭐ Avaliar Experiência</button>` : ''}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <strong style="color:var(--navy); display:block; margin-bottom:12px; font-size: 1.05rem;">Informações do Responsável</strong>
            <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 12px 16px; border-radius: 8px;">
              <div>
                <div style="font-weight: 600; color: #1f2937;">${a.ongName || 'Tutor Responsável'}</div>
                <div style="font-size: 0.85rem; color: #6b7280; margin-top: 2px;">${a.whatsapp ? '📞 ' + a.whatsapp : 'Sem telefone cadastrado'}</div>
              </div>
              ${a.whatsapp ? `<a href="https://wa.me/55${String(a.whatsapp).replace(/\D/g,'')}" target="_blank" class="btn btn-whatsapp btn-sm" style="background:#25d366;color:#fff;border:none;text-decoration:none;display:flex;align-items:center;gap:6px;"><span style="font-size:1.1rem;">💬</span> Entrar em contato</a>` : ''}
            </div>
          </div>

          ${msgFormatted ? `
          <div style="margin-top: 16px;">
            <strong style="color:var(--navy); display:block; margin-bottom:4px; font-size: 1.05rem;">Sua Solicitação</strong>
            ${msgFormatted}
          </div>
          ` : ''}
        </div>`;
      }).join('');
    });
}

function cancelRequest(id) {
  if(!confirm('Deseja realmente cancelar sua solicitação de adoção?')) return;
  fetch(`/api/user/solicitacao/${id}/cancel`, { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      if(data.sucesso) {
        const card = document.getElementById(`adocao-req-${id}`);
        if(card) card.remove();
        showToast('Solicitação cancelada.', 'success');
        renderAdoptions(); // Atualiza contador e esconde lista se ficar vazia
      } else {
        showToast(data.erro || 'Erro ao cancelar.', 'error');
      }
    });
}

function openFeedbackTab(reqId) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  let tab = document.getElementById('tab-feedback');
  if (!tab) {
    tab = document.createElement('div');
    tab.id = 'tab-feedback';
    tab.className = 'tab-panel';
    document.querySelector('.content').appendChild(tab);
  }
  tab.classList.add('active');

  tab.innerHTML = `
    <div class="fade-in">
      <div class="panel-header" style="margin-bottom: 8px;">
        <div class="panel-title">⭐ Como foi a adoção?</div>
      </div>
      <p style="color: var(--muted); margin-bottom: 24px; font-size: 0.95rem;">Compartilhe sua experiência para inspirar outras pessoas!</p>
      <div id="fb-error" class="modal-error-banner"></div>

      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--yellow); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
        <div style="margin-bottom:0;">
          <label class="form-label">Mensagem <span class="text-danger">*</span></label>
          <textarea id="fb-msg" class="form-textarea" rows="4" placeholder="Ex: O pet é maravilhoso e a ONG foi super atenciosa..."></textarea>
        </div>
      </div>

      <div style="margin-top: 28px; display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="submitFeedback(${reqId})" style="padding: 12px 24px;">Enviar Feedback</button>
        <button class="btn btn-ghost" onclick="showTab('adoptions')" style="padding: 12px 24px;">Voltar</button>
      </div>
    </div>
  `;
}

function submitFeedback(reqId) {
  const msg = document.getElementById('fb-msg').value.trim();
  if (!msg) {
    const err = document.getElementById('fb-error');
    err.textContent = '⚠️ Escreva uma mensagem.';
    err.classList.add('show');
    return;
  }
  
  fetch('/api/feedbacks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ solicitacao_id: reqId, mensagem: msg })
  })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      showToast('✅ ' + data.mensagem, 'success');
      renderAdoptions();
      showTab('adoptions');
    } else {
      const err = document.getElementById('fb-error');
      err.textContent = '❌ ' + data.erro;
      err.classList.add('show');
    }
  })
  .catch(e => showToast('Erro: ' + e, ''));
}

// ── Pedidos Recebidos ─────────────────────────────────────────────────────────
function renderReceived() {
  fetch('/api/user/solicitacoes')
    .then(r => r.json())
    .then(data => {
      ALL_RECEIVED = data.solicitacoes || [];
      updateReceivedUI();
    });
}

function updateReceivedUI() {
      const recebidas = ALL_RECEIVED;
      const el = document.getElementById('received-list');
      
      const pendentes = recebidas.filter(s => s.status === 'pending' && s.petStatus !== 'adopted').length;
      if(document.getElementById('stat-received') && user.role !== 'admin') {
        document.getElementById('stat-received').textContent = pendentes;
      }
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      let filtered = recebidas.filter(r => {
        if (receivedFilterDate === 'all') return true;
        if (!r.data) return true;
        const [y, m, d] = r.data.split('-');
        const dt = new Date(y, m - 1, d);
        
        if (receivedFilterDate === 'today') {
           return dt.getTime() === today.getTime();
        }
        if (receivedFilterDate === 'week') {
           const diff = today.getTime() - dt.getTime();
           return diff <= 7 * 24 * 60 * 60 * 1000 && diff >= 0;
        }
        if (receivedFilterDate === 'month') {
           return dt.getMonth() === today.getMonth() && dt.getFullYear() === today.getFullYear();
        }
        if (receivedFilterDate === 'specific') {
           if (!receivedSpecificDate) return true;
           return r.data === receivedSpecificDate;
        }
        if (receivedFilterDate === 'range') {
           if (!receivedStartDate && !receivedEndDate) return true;
           const reqDate = new Date(y, m - 1, d).getTime();
           let startValid = true, endValid = true;
           
           if (receivedStartDate) {
             const [sy, sm, sd] = receivedStartDate.split('-');
             startValid = reqDate >= new Date(sy, sm - 1, sd).getTime();
           }
           if (receivedEndDate) {
             const [ey, em, ed] = receivedEndDate.split('-');
             endValid = reqDate <= new Date(ey, em - 1, ed).getTime();
           }
           return startValid && endValid;
        }
        return true;
      });

      const filterHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; background: #fff; padding: 12px 16px; border-radius: 12px; border: 1px solid #e5e7eb; flex-wrap: wrap; gap: 10px;">
          <span style="font-weight:600; color:var(--navy);">Filtrar solicitações:</span>
          <div style="display:flex; gap:10px; flex-wrap: wrap;">
            <select class="form-input" style="width:auto; min-width: 200px; padding: 6px 12px; margin: 0;" onchange="receivedFilterDate=this.value; updateReceivedUI()">
              <option value="today" ${receivedFilterDate==='today'?'selected':''}>📅 Apenas Hoje</option>
              <option value="week" ${receivedFilterDate==='week'?'selected':''}>📅 Últimos 7 dias</option>
              <option value="month" ${receivedFilterDate==='month'?'selected':''}>📅 Este Mês</option>
              <option value="specific" ${receivedFilterDate==='specific'?'selected':''}>📅 Data Específica</option>
              <option value="range" ${receivedFilterDate==='range'?'selected':''}>📅 Intervalo de Datas</option>
              <option value="all" ${receivedFilterDate==='all'?'selected':''}>📅 Todas as datas</option>
            </select>
            ${receivedFilterDate === 'specific' ? `<input type="date" class="form-input" style="width:auto; padding: 6px 12px; margin: 0;" value="${receivedSpecificDate}" onchange="receivedSpecificDate=this.value; updateReceivedUI()">` : ''}
            ${receivedFilterDate === 'range' ? `
              <input type="date" class="form-input" style="width:auto; padding: 6px 12px; margin: 0;" value="${receivedStartDate}" onchange="receivedStartDate=this.value; updateReceivedUI()">
              <span style="color:var(--muted); font-size:0.9rem; font-weight:600; display:flex; align-items:center;">até</span>
              <input type="date" class="form-input" style="width:auto; padding: 6px 12px; margin: 0;" value="${receivedEndDate}" onchange="receivedEndDate=this.value; updateReceivedUI()">
            ` : ''}
          </div>
        </div>
      `;

      if (!filtered.length) {
        el.innerHTML = filterHtml + `<div class="empty"><div class="empty-icon">📥</div><div class="empty-title">Nenhum pedido encontrado</div><p class="empty-desc">Nenhuma solicitação para o período selecionado.</p></div>`;
        return;
      }
      el.innerHTML = filterHtml + filtered.map(r => {
        const phoneMatch = r.msg ? r.msg.match(/📞 Contato:\s*(.*?)\s*\(/) : null;
        const derivedPhone = r.phone || (phoneMatch ? phoneMatch[1] : '');

        // Transformar a mensagem única em blocos de estilo do projeto
        let msgFormatted = '';
        if (r.msg && r.msg.includes('📞 Contato:')) {
          const parts = r.msg.split('\n\n💬 Mensagem:');
          const infoList = parts[0].split('\n').filter(l => l.trim() !== '');
          const obs = parts.length > 1 ? parts[1].trim() : '';
          
          const borderColors = ['var(--blue)', 'var(--yellow)', 'var(--navy)', '#5ba3d4'];
          const gridItems = infoList.map((item, index) => {
            const colonIdx = item.indexOf(':');
            let label = item, val = '';
            if (colonIdx > -1) {
              label = item.substring(0, colonIdx + 1);
              val = item.substring(colonIdx + 1).trim();
            }
            return `<div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid ${borderColors[index % borderColors.length]}; padding: 12px 16px; border-radius: 12px; font-size: 0.88rem; color: #374151; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08);"><strong style="color:var(--navy); font-weight:700; display:block; margin-bottom:2px;">${label}</strong> ${val}</div>`;
          }).join('');
          
          msgFormatted = `
            <details style="margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <summary style="list-style: none; outline: none; cursor: pointer;">
                <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 600; color: var(--navy);">
                  <span style="display: flex; align-items: center; gap: 8px;">📋 <span>Detalhes da solicitação</span></span>
                  <span style="font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; color: #475569;">Ver informações ▾</span>
                </div>
              </summary>
              <div style="padding: 0 16px 16px 16px; border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 16px;">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">${gridItems}</div>
                ${obs ? `<div style="background:#f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 10px; font-size:.87rem; color:var(--bark-m); margin-top:12px; line-height:1.6;"><strong style="color:var(--navy); display:block; margin-bottom:4px; font-weight:700;">💬 Mensagem do Adotante:</strong>${obs}</div>` : ''}
              </div>
            </details>`;
        } else if (r.msg) {
          msgFormatted = `
            <details style="margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <summary style="list-style: none; outline: none; cursor: pointer;">
                <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 600; color: var(--navy);">
                  <span style="display: flex; align-items: center; gap: 8px;">📋 <span>Mensagem do Adotante</span></span>
                  <span style="font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; color: #475569;">Ver informações ▾</span>
                </div>
              </summary>
              <div style="padding: 0 16px 16px 16px; border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 16px;">
                <div style="background:#f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 10px; font-size:.87rem; color:var(--bark-m); line-height:1.6; white-space:pre-wrap;"><strong style="color:var(--navy); display:block; margin-bottom:4px; font-weight:700;">💬 Mensagem do Adotante:</strong>\n${r.msg}</div>
              </div>
            </details>`;
        }

        return `
        <div class="item-card" id="req-${r.id}">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--blush);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🧑</div>
          <div class="item-info">
            <div class="item-name">${r.from}</div>
            <div class="item-meta">Interesse em: <strong>${r.petName}</strong></div>
            ${msgFormatted}
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">
              <span style="font-size:.82rem;color:var(--muted)">📅 ${r.data ? r.data.split('-').reverse().join('/') : 'Recente'}</span>
              <span style="font-size:.82rem;color:var(--muted)"> ${r.city}</span>
            </div>
          </div>
          <div class="item-actions" style="flex-direction:column; min-width: 220px;">
            ${derivedPhone ? `<a href="https://wa.me/55${String(derivedPhone).replace(/\D/g,'')}" target="_blank" class="btn btn-whatsapp btn-sm" style="background:#25d366;color:#fff;border:none;text-decoration:none;display:flex;justify-content:center;">💬 Entrar em contato</a>` : `<div style="font-size: 0.8rem; color: var(--muted); text-align: center; padding: 4px;">Sem WhatsApp</div>`}
            ${r.status === 'approved' ? 
              `<button class="btn btn-sm" disabled style="margin-top:8px; display:flex; justify-content:center; background-color: #d1fae5; color: #065f46; border: 2px solid #a7f3d0; opacity: 1; font-weight: 700;">🏠 Adoção Confirmada</button>` : 
              (r.petStatus === 'adopted' ? 
                `<button class="btn btn-sm" disabled style="margin-top:8px; display:flex; justify-content:center; background-color: var(--cream-d); color: var(--muted); border: 2px solid var(--sand); opacity: 1;">Pet adotado por outro</button>` : 
                (r.status === 'rejected' ? `<button class="btn btn-sm" disabled style="margin-top:8px; display:flex; justify-content:center; background-color: var(--cream-d); color: var(--muted); border: 2px solid var(--sand); opacity: 1;">❌ Dispensado</button>` : `<button class="btn btn-primary btn-sm" id="btn-adopt-${r.id}" onclick="confirmarAdocaoUsuario(${r.id})" style="margin-top:8px; display:flex; justify-content:center; background-color: var(--sage); border-color: var(--sage);">🏆 Confirmar Adoção</button>`)
              )
            }
          </div>
        </div>`;
      }).join('');
}

function confirmarAdocaoUsuario(reqId) {
  if (!confirm('Deseja confirmar a adoção para este adotante? O pet será marcado como Adotado e a solicitação será aprovada.')) return;
  respondRequest(reqId, 'approved');
}

function respondRequest(id, status) {
  const btn = document.getElementById(`btn-adopt-${id}`);
  if(btn) {
    btn.disabled = true;
    if (status === 'approved') {
      btn.textContent = '🏠 Adoção Confirmada';
      btn.style.backgroundColor = '#d1fae5';
      btn.style.color = '#065f46';
      btn.style.borderColor = '#a7f3d0';
      btn.style.fontWeight = '700';
    } else {
      btn.textContent = 'Processando...';
    }
  }
  // Reaproveitando a rota que já existia para as ONGs
  fetch(`/api/ong/solicitacao/${id}/status`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({status})
  })
  .then(r => r.json())
  .then(data => {
    if(data.sucesso) {
      showToast(status === 'approved' ? '✅ Adoção confirmada! O pet foi marcado como Adotado.' : 'Solicitação dispensada.', status === 'approved' ? 'success' : '');
      renderReceived();
      renderMyPets(); // Atualiza a aba de pets para refletir que foi adotado
    } else {
      showToast('❌ Erro: ' + data.erro, '');
      if(btn) {
        btn.disabled = false;
        btn.textContent = '🏆 Confirmar Adoção';
        btn.style = 'margin-top:8px; display:flex; justify-content:center; background-color: var(--sage); border-color: var(--sage);';
      }
    }
  })
  .catch(e => {
    showToast('Erro de conexão', '');
    if(btn) {
      btn.disabled = false;
      btn.textContent = '🏆 Confirmar Adoção';
      btn.style = 'margin-top:8px; display:flex; justify-content:center; background-color: var(--sage); border-color: var(--sage);';
    }
  });
}

// ── Favoritos ─────────────────────────────────────────────────────────────────
function renderFavorites() {
  fetch('/api/user/favorites')
    .then(r => r.json())
    .then(data => {
      const favs = data.favorites || [];
      const el = document.getElementById('favorites-list');
      if (!el) return;

      const statFav = document.getElementById('stat-favorites');
      if (statFav && user.role !== 'admin') {
        statFav.textContent = favs.length;
      }

      if (!favs.length) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">🤍</div><div class="empty-title">Nenhum pet favoritado</div><p class="empty-desc">Você ainda não adicionou nenhum pet aos favoritos.</p><a href="/pets" class="btn btn-primary">Buscar pets</a></div>`;
        return;
      }
      el.innerHTML = favs.map(p => `
        <div class="mini-pet-card" onclick="location.href='/pet/${p.id}'">
          <div class="mini-card-img"><img src="${p.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600'}" alt="${p.name}"></div>
          <div class="mini-card-body">
            <div class="mini-card-name">${p.name}</div>
            <div class="mini-card-meta">${p.breed || 'Sem raça definida'} · 📍 ${p.city}</div>
            <div class="status-pill ${p.status==='available'?'pill-avail':p.status==='adopted'?'pill-adopted':'pill-reserved'}" style="margin-top:6px">${p.status==='available'?'Disponível':p.status==='adopted'?'Adotado':'Reservado'}</div>
          </div>
        </div>`).join('');
    })
    .catch(e => console.error('Erro ao buscar favoritos', e));
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

window.openNewOngModal = function() {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  let tab = document.getElementById('tab-new-ong');
  if (!tab) {
    tab = document.createElement('div');
    tab.id = 'tab-new-ong';
    tab.className = 'tab-panel';
    document.querySelector('.content').appendChild(tab);
  }
  tab.classList.add('active');

  tab.innerHTML = `
    <div class="fade-in">
      <div class="panel-header" style="margin-bottom: 8px;">
        <div class="panel-title">🏢 Cadastrar Nova ONG</div>
      </div>
      <p style="color: var(--muted); margin-bottom: 24px; font-size: 0.95rem;">Preencha os dados básicos da ONG parceira</p>
      <div id="ong-error" class="modal-error-banner"></div>
      
      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div><label class="form-label">Nome da ONG <span style="color:var(--terra)">*</span></label><input id="ong-nome" class="form-input"></div>
          <div><label class="form-label">WhatsApp</label><input id="ong-whatsapp" class="form-input"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div><label class="form-label">Cidade <span style="color:var(--terra)">*</span></label><input id="ong-city" class="form-input"></div>
          <div><label class="form-label">Estado <span style="color:var(--terra)">*</span></label><input id="ong-state" class="form-input" maxlength="2"></div>
        </div>
        <div style="margin-bottom:0"><label class="form-label">Logo / Foto da ONG</label><input type="file" id="ong-foto" accept="image/*" class="form-input" style="padding: 10px;"></div>
      </div>

      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--yellow); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
        <div style="margin-bottom:14px"><label class="form-label">Chave PIX</label><input id="ong-pix" class="form-input"></div>
        <div style="margin-bottom:0"><label class="form-label">Descrição Curta <span style="color:var(--terra)">*</span></label><textarea id="ong-desc" class="form-textarea" rows="3"></textarea></div>
      </div>

      <div style="margin-top: 28px; display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="saveNewOng()" style="padding: 12px 24px;">Cadastrar ONG</button>
        <button class="btn btn-ghost" onclick="showTab('ongs-admin')" style="padding: 12px 24px;">Voltar</button>
      </div>
    </div>
  `;
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

  const formData = new FormData();
  formData.append('nome', nome);
  formData.append('cidade', cidade);
  formData.append('estado', estado);
  formData.append('whatsapp', document.getElementById('ong-whatsapp').value.trim());
  formData.append('chave_pix', document.getElementById('ong-pix').value.trim());
  formData.append('descricao', document.getElementById('ong-desc').value.trim());

  const photoInput = document.getElementById('ong-foto');
  if (photoInput && photoInput.files.length > 0) {
    formData.append('foto_url', photoInput.files[0]);
  }
  
  fetch('/api/ongs', {
    method: 'POST',
    body: formData
  })
  .then(r => r.json())
  .then(data => {
    if(data.sucesso) {
      showToast(data.mensagem, 'success');
      renderAdminOngs();
      showTab('ongs-admin');
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

// ── Gerenciar Pets (admin) ───────────────────────────────────────────────────
let ADMIN_ALL_PETS = [];
let adminPetFilters = { species: '', gender: '', breed: '' };

window.openAdminPetsTab = function() {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  let tab = document.getElementById('tab-admin-pets');
  if (!tab) {
    tab = document.createElement('div');
    tab.id = 'tab-admin-pets';
    tab.className = 'tab-panel';
    document.querySelector('.content').appendChild(tab);
  }
  tab.classList.add('active');

  tab.innerHTML = `
    <div class="fade-in">
      <div class="panel-header" style="margin-bottom: 8px;">
        <div class="panel-title">🐾 Todos os Pets da Plataforma</div>
      </div>
      <p style="color: var(--muted); margin-bottom: 24px; font-size: 0.95rem;">Visualize e filtre todos os animais cadastrados para moderação.</p>

      <!-- Filtros -->
      <div style="display:flex; gap:10px; margin-bottom: 20px; background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; flex-wrap: wrap;">
        <div>
          <label class="form-label" style="font-size:0.8rem;margin-bottom:4px">Espécie</label>
          <select class="form-input" id="admin-f-species" onchange="adminPetFilters.species=this.value; renderAdminPetsList()">
            <option value="">Todas as espécies</option>
            <option value="dog">🐶 Cachorro</option>
            <option value="cat">🐱 Gato</option>
            <option value="other">Outros</option>
          </select>
        </div>
        <div>
          <label class="form-label" style="font-size:0.8rem;margin-bottom:4px">Gênero</label>
          <select class="form-input" id="admin-f-gender" onchange="adminPetFilters.gender=this.value; renderAdminPetsList()">
            <option value="">Todos os gêneros</option>
            <option value="male">Macho</option>
            <option value="female">Fêmea</option>
            <option value="unknown">Não informado</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label" style="font-size:0.8rem;margin-bottom:4px">Buscar Raça, Nome do Pet ou Adotante</label>
          <input type="text" class="form-input" id="admin-f-breed" placeholder="Ex: Poodle, Luna, Maria..." onkeyup="adminPetFilters.breed=this.value.toLowerCase(); renderAdminPetsList()">
        </div>
      </div>

      <div id="admin-pets-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
    </div>
  `;
  
  fetch('/api/admin/pets').then(r => r.json()).then(data => {
    ADMIN_ALL_PETS = data.pets || [];
    renderAdminPetsList();
  });
}

window.renderAdminPetsList = function() {
  const el = document.getElementById('admin-pets-list');
  if (!el) return;

  let filtered = ADMIN_ALL_PETS.filter(p => {
    if (adminPetFilters.species && p.species !== adminPetFilters.species) return false;
    if (adminPetFilters.gender && p.sex !== adminPetFilters.gender) return false;
    if (adminPetFilters.breed) {
      const search = adminPetFilters.breed;
      const matchName = p.name.toLowerCase().includes(search);
      const matchBreed = (p.breed || '').toLowerCase().includes(search);
      const matchAdopter = (p.adocao && p.adocao.solicitante) ? p.adocao.solicitante.toLowerCase().includes(search) : false;
      if (!matchName && !matchBreed && !matchAdopter) return false;
    }
    return true;
  });

  if (!filtered.length) {
    el.innerHTML = '<div class="empty" style="border: 1px dashed #e2e8f0;"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet encontrado</div><p class="empty-desc">Tente limpar os filtros acima.</p></div>';
    return;
  }

  el.innerHTML = filtered.map(p => `
    <div class="item-card" style="box-shadow: none; border: 1px solid #e2e8f0;">
      <img class="item-img" src="${p.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300'}" alt="${p.name}" style="width:70px; height:70px;">
      <div class="item-info">
        <div class="item-name">${p.name} <span style="font-size:0.8rem; color:var(--muted); font-weight:normal">(${p.sex === 'male' ? 'Macho' : p.sex === 'female' ? 'Fêmea' : 'Gênero N/I'})</span></div>
        <div class="item-meta">${p.breed || 'Sem raça'} · 📍 ${p.city}/${p.state}</div>
        <div style="margin-top:8px; display:flex; gap:6px;">
          <span class="status-pill ${p.status === 'available' ? 'pill-avail' : p.status === 'adopted' ? 'pill-adopted' : 'pill-reserved'}">${p.status === 'available' ? 'Disponível' : p.status === 'adopted' ? 'Adotado' : 'Reservado'}</span>
          <span class="status-pill" style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;">Moderação: ${p.mod_status}</span>
        </div>
        ${p.adocao ? `<div style="margin-top: 10px; font-size: 0.85rem; color: #065f46; background: #d1fae5; padding: 6px 12px; border-radius: 6px; border: 1px solid #a7f3d0; display: inline-block;">🏠 Adotado por <strong>${p.adocao.solicitante}</strong> em ${p.adocao.data}</div>` : ''}
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openEditTab('${p.id}')">✏️ Editar</button>
        <a href="/pet/${p.id}" class="btn btn-outline btn-sm">👁️ Ver</a>
        <button class="btn btn-outline btn-sm btn-danger" onclick="adminConfirmRemove('${p.id}')">🗑️ Excluir</button>
      </div>
    </div>
  `).join('');
}

window.adminConfirmRemove = function(id) {
  if(!confirm('Atenção: Você está como Administrador. Deseja realmente excluir este pet definitivamente da plataforma?')) return;
  fetch(`/api/pets/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      showToast(`✅ ${data.mensagem}`, 'success');
      fetch('/api/admin/pets').then(r => r.json()).then(d => { ADMIN_ALL_PETS = d.pets || []; renderAdminPetsList(); });
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  });
}

// ── Gerenciar ONGs Aba Completa (admin) ──────────────────────────────────────
let ADMIN_ALL_ONGS = [];
let adminOngFilters = { search: '' };

window.openAdminOngsTab = function() {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  let tab = document.getElementById('tab-admin-ongs');
  if (!tab) {
    tab = document.createElement('div');
    tab.id = 'tab-admin-ongs';
    tab.className = 'tab-panel';
    document.querySelector('.content').appendChild(tab);
  }
  tab.classList.add('active');

  tab.innerHTML = `
    <div class="fade-in">
      <div class="panel-header" style="margin-bottom: 8px;">
        <div class="panel-title">🏢 Todas as ONGs da Plataforma</div>
        <button class="btn btn-primary" onclick="openNewOngModal()">+ Nova ONG</button>
      </div>
      <p style="color: var(--muted); margin-bottom: 24px; font-size: 0.95rem;">Gerencie todas as organizações parceiras aprovadas.</p>

      <!-- Filtros -->
      <div style="display:flex; gap:10px; margin-bottom: 20px; background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label" style="font-size:0.8rem;margin-bottom:4px">Buscar por Nome, Cidade ou Estado</label>
          <input type="text" class="form-input" id="admin-f-ong" placeholder="Ex: Patinhas, São Paulo..." onkeyup="adminOngFilters.search=this.value.toLowerCase(); renderAdminOngsList()">
        </div>
      </div>

      <div id="admin-ongs-list-full" style="display: flex; flex-direction: column; gap: 12px;"></div>
    </div>
  `;
  
  fetch('/api/ongs').then(r => r.json()).then(data => {
    ADMIN_ALL_ONGS = data.ongs || [];
    renderAdminOngsList();
  });
}

window.renderAdminOngsList = function() {
  const el = document.getElementById('admin-ongs-list-full');
  if (!el) return;

  let filtered = ADMIN_ALL_ONGS.filter(o => {
    if (adminOngFilters.search) {
      const search = adminOngFilters.search;
      const matchName = o.name.toLowerCase().includes(search);
      const matchCity = (o.city || '').toLowerCase().includes(search);
      const matchState = (o.state || '').toLowerCase().includes(search);
      if (!matchName && !matchCity && !matchState) return false;
    }
    return true;
  });

  if (!filtered.length) {
    el.innerHTML = '<div class="empty" style="border: 1px dashed #e2e8f0;"><div class="empty-icon">🏢</div><div class="empty-title">Nenhuma ONG encontrada</div><p class="empty-desc">Tente limpar os filtros acima.</p></div>';
    return;
  }

  el.innerHTML = filtered.map(o => `
    <div class="item-card" style="box-shadow: none; border: 1px solid #e2e8f0;">
      <img class="item-img" src="${o.photo || 'https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=300'}" alt="${o.name}" style="width:70px; height:70px;">
      <div class="item-info">
        <div class="item-name">${o.name}</div>
        <div class="item-meta">📍 ${o.city}/${o.state} · 📞 ${o.whatsapp}</div>
        <div style="margin-top:8px; display:flex; gap:12px; font-size: 0.85rem; color: var(--muted);">
          <span>🐾 <strong>${o.pets}</strong> pets reais</span>
          <span>🏠 <strong>${o.adopted}</strong> adoções reais</span>
        </div>
      </div>
      <div class="item-actions">
        <a href="/ong/${o.id}" class="btn btn-outline btn-sm">👁️ Perfil</a>
        <button class="btn btn-outline btn-sm btn-danger" onclick="adminConfirmRemoveOng('${o.id}')">🗑️ Excluir</button>
      </div>
    </div>
  `).join('');
}

window.adminConfirmRemoveOng = function(id) {
  if(!confirm('Atenção: Deseja realmente excluir esta ONG e ocultá-la do sistema?')) return;
  fetch(`/api/admin/ongs/${id}`, { method: 'DELETE' })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      showToast(`✅ ${data.mensagem}`, 'success');
      fetch('/api/ongs').then(r => r.json()).then(d => { ADMIN_ALL_ONGS = d.ongs || []; renderAdminOngsList(); renderAdminOngs(); });
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  });
}

// ── Gerenciar Usuários Aba (admin) ───────────────────────────────────────────
let ADMIN_ALL_USERS = [];
let adminUserFilters = { search: '' };

window.openAdminUsersTab = function() {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  let tab = document.getElementById('tab-admin-users');
  if (!tab) {
    tab = document.createElement('div');
    tab.id = 'tab-admin-users';
    tab.className = 'tab-panel';
    document.querySelector('.content').appendChild(tab);
  }
  tab.classList.add('active');

  tab.innerHTML = `
    <div class="fade-in">
      <div class="panel-header" style="margin-bottom: 8px;">
        <div class="panel-title">🧑 Todos os Usuários (Adotantes)</div>
      </div>
      <p style="color: var(--muted); margin-bottom: 24px; font-size: 0.95rem;">Visualize todos os adotantes comuns cadastrados na plataforma.</p>

      <!-- Filtros -->
      <div style="display:flex; gap:10px; margin-bottom: 20px; background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label" style="font-size:0.8rem;margin-bottom:4px">Buscar por Nome, E-mail ou Telefone</label>
          <input type="text" class="form-input" id="admin-f-user" placeholder="Ex: Maria, maria@email.com..." onkeyup="adminUserFilters.search=this.value.toLowerCase(); renderAdminUsersList()">
        </div>
      </div>

      <div id="admin-users-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
    </div>
  `;
  
  fetch('/api/admin/users').then(r => r.json()).then(data => {
    ADMIN_ALL_USERS = data.users || [];
    renderAdminUsersList();
  });
}

window.renderAdminUsersList = function() {
  const el = document.getElementById('admin-users-list');
  if (!el) return;

  let filtered = ADMIN_ALL_USERS.filter(u => {
    if (adminUserFilters.search) {
      const search = adminUserFilters.search;
      const matchName = u.name.toLowerCase().includes(search);
      const matchEmail = u.email.toLowerCase().includes(search);
      const matchPhone = (u.phone || '').toLowerCase().includes(search);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  if (!filtered.length) {
    el.innerHTML = '<div class="empty" style="border: 1px dashed #e2e8f0;"><div class="empty-icon">🧑</div><div class="empty-title">Nenhum usuário encontrado</div><p class="empty-desc">Tente limpar os filtros acima.</p></div>';
    return;
  }

  el.innerHTML = filtered.map(u => `
    <div class="item-card" style="box-shadow: none; border: 1px solid #e2e8f0;">
      <div style="width:52px;height:52px;border-radius:50%;background:var(--blush);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;margin-right:12px;">🧑</div>
      <div class="item-info">
        <div class="item-name">${u.name}</div>
        <div class="item-meta">✉️ ${u.email} · 📞 ${u.phone}</div>
        <div style="margin-top:8px; display:flex; gap:6px;">
          <span class="status-pill" style="background:#f1f5f9; color:#475569; border:1px solid #e2e8f0;">📍 ${u.city}/${u.state}</span>
        </div>
      </div>
      <div class="item-actions">
        ${u.phone !== 'Não informado' ? `<a href="https://wa.me/55${String(u.phone).replace(/\D/g,'')}" target="_blank" class="btn btn-whatsapp btn-sm" style="background:#25d366;color:#fff;border:none;text-decoration:none;display:flex;align-items:center;gap:6px;"><span style="font-size:1.1rem;">💬</span> Mensagem</a>` : ''}
        <button class="btn btn-outline btn-sm btn-danger" onclick="adminConfirmRemoveUser('${u.id}')">🗑️ Excluir</button>
      </div>
    </div>
  `).join('');
}

window.adminConfirmRemoveUser = function(id) {
  if(!confirm('Atenção: Deseja realmente excluir este usuário (adotante) e todos os seus dados da plataforma?')) return;
  fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      showToast(`✅ ${data.mensagem}`, 'success');
      fetch('/api/admin/users').then(r => r.json()).then(d => { ADMIN_ALL_USERS = d.users || []; renderAdminUsersList(); });
    } else {
      showToast(`❌ ${data.erro}`, '');
    }
  });
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function fillSiteImpactForm(data) {
  document.getElementById('impact-pets-total').textContent = data.totals.pets;
  document.getElementById('impact-adoptions-total').textContent = data.totals.adoptions;
  document.getElementById('impact-cities-total').textContent = data.totals.cities;

  document.getElementById('impact-pets-base').textContent = data.base.pets;
  document.getElementById('impact-adoptions-base').textContent = data.base.adoptions;
  document.getElementById('impact-cities-base').textContent = data.base.cities;

  document.getElementById('impact-pets-offset').value = data.offsets.pets;
  document.getElementById('impact-adoptions-offset').value = data.offsets.adoptions;
  document.getElementById('impact-cities-offset').value = data.offsets.cities;

  document.getElementById('impact-show-trust').checked = data.flags.show_trust;
}

function renderSiteImpact() {
  fetch('/api/admin/site-impact')
    .then(r => r.json())
    .then(fillSiteImpactForm)
    .catch(e => {
      console.error('Erro ao carregar impacto do site:', e);
      showToast('Erro ao carregar impacto do site.', '');
    });
}

function saveSiteImpact() {
  fetch('/api/admin/site-impact', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offsets: {
        pets: parseInt(document.getElementById('impact-pets-offset').value || '0', 10),
        adoptions: parseInt(document.getElementById('impact-adoptions-offset').value || '0', 10),
        cities: parseInt(document.getElementById('impact-cities-offset').value || '0', 10)
      },
      flags: {
        show_trust: document.getElementById('impact-show-trust').checked
      }
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      fillSiteImpactForm(data.impact);
      showToast('Impacto do site atualizado.', 'success');
    } else {
      showToast(data.erro || 'Nao foi possivel salvar.', '');
    }
  })
  .catch(e => showToast(`Erro: ${e}`, ''));
}

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
