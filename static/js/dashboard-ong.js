let ALL_SOLICITACOES = [];
let ONG_PETS = [];
let ongFilterDate = 'today';
let ongSpecificDate = '';
let ongStartDate = '';
let ongEndDate = '';
let ongPetFilters = { search: '', status: '' };

document.addEventListener('DOMContentLoaded', () => {
  // Transferir 'Meus Pets' para a aba Resumo e ocultar a aba original
  const tabResumo = document.querySelector('.tab-panel');
  const tabPets = document.getElementById('tab-pets');
  const linkPets = document.querySelector('.sidebar-link[onclick*="pets"]');
  
  if (tabResumo) {
    const petsSection = document.createElement('div');
    petsSection.innerHTML = `
      <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
        <h2 style="font-size: 1.4rem; color: var(--navy); margin: 0;">🐾 Meus Pets</h2>
      </div>
      <div style="display:flex; gap:10px; margin-bottom: 20px; background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label" style="font-size:0.8rem;margin-bottom:4px">Buscar Pet</label>
          <input type="text" class="form-input" placeholder="Nome ou raça..." onkeyup="ongPetFilters.search=this.value.toLowerCase(); updateOngPetsUI()">
        </div>
        <div>
          <label class="form-label" style="font-size:0.8rem;margin-bottom:4px">Status</label>
          <select class="form-input" onchange="ongPetFilters.status=this.value; updateOngPetsUI()">
            <option value="">Todos os status</option>
            <option value="available">✅ Disponível</option>
            <option value="reserved">⏳ Reservado</option>
            <option value="adopted">🏠 Adotado</option>
          </select>
        </div>
      </div>
      <div id="lista-pets-resumo"></div>
    `;
    tabResumo.appendChild(petsSection);
  }
  
  if (tabPets) tabPets.style.display = 'none';
  if (linkPets) linkPets.style.display = 'none';

  loadOngData();
  loadOngProfile();

  // Torna os cards de estatísticas clicáveis para navegar para as abas
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length >= 2) {
    statCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.style.transition = 'transform 0.2s, box-shadow 0.2s';
      card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-4px)'; });
      card.addEventListener('mouseleave', () => { card.style.transform = 'translateY(0)'; });
    });
    
    statCards[0].onclick = () => { 
      const el = document.getElementById('lista-pets-resumo');
      if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    statCards[1].onclick = () => { const l = document.querySelector('[onclick*="solicitacoes"]'); if(l) showTab('solicitacoes', l); };
  }
});

function showTab(id, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (el) {
    el.classList.add('active');
  } else {
    const link = document.querySelector(`.sidebar-link[onclick*="${id}"]`);
    if (link) link.classList.add('active');
  }
}

function loadOngData() {
  fetch('/api/ong/meus-pets')
    .then(r => r.json())
    .then(data => {
      ONG_PETS = data.pets || [];
      const pets = ONG_PETS;
      const tp = document.getElementById('total-pets');
      if (tp) tp.textContent = pets.length;

      updateOngPetsUI();
    });

  fetch('/api/ong/solicitacoes?t=' + Date.now())
    .then(r => r.json())
    .then(data => {
      if (data.erro) {
        const listaSol = document.getElementById('lista-solicitacoes');
        if (listaSol) listaSol.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-title">Erro do Servidor</div><p class="empty-desc">${data.erro}</p></div>`;
        return;
      }
      ALL_SOLICITACOES = data.solicitacoes || [];
      updateOngSolicitacoesUI();
    });
}

function updateOngPetsUI() {
  const listaPets = document.getElementById('lista-pets-resumo') || document.getElementById('lista-pets');
  if (!listaPets) return;

  let filtered = ONG_PETS.filter(p => {
    if (ongPetFilters.status && p.status !== ongPetFilters.status) return false;
    if (ongPetFilters.search) {
      const s = ongPetFilters.search;
      if (!p.name.toLowerCase().includes(s) && !(p.breed || '').toLowerCase().includes(s)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    listaPets.innerHTML = '<div class="empty"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet encontrado.</div><p class="empty-desc">Ajuste os filtros ou cadastre um novo pet.</p></div>';
    return;
  }

  listaPets.innerHTML = filtered.map(p => `
    <details style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: border-color 0.3s ease;">
      <summary style="list-style: none; outline: none; cursor: pointer; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; flex: 1; min-width: 250px;">
          <img src="${p.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300'}" alt="${p.name}" style="width:52px;height:52px;border-radius:12px;object-fit:cover;flex-shrink:0;margin-right:16px;">
          <div>
            <div class="item-name" style="font-size: 1.1rem; color: var(--navy); font-weight: 700;">${p.name}</div>
            <div style="font-size: 0.85rem; color: var(--muted); margin-top: 2px;">${p.breed || 'Sem raça'} · 📍 ${p.city || '-'}/${p.state || '-'}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="status-pill ${p.status === 'available' ? 'pill-avail' : p.status === 'adopted' ? 'pill-adopted' : 'pill-reserved'}" style="margin:0;">
            ${p.status === 'available' ? 'Disponível' : p.status === 'adopted' ? 'Adotado' : 'Reservado'}
          </span>
          <span style="font-size: 0.85rem; color: var(--navy); background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 20px; font-weight: 600;">Ver detalhes ▾</span>
        </div>
      </summary>
      
      <div style="padding: 0 16px 16px 84px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        ${p.adocao ? `
          <div style="background: #d1fae5; border: 1px solid #a7f3d0; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
            <div style="font-size: 0.9rem; color: #065f46; font-weight: 700; margin-bottom: 4px;">🏠 Adotado por ${p.adocao.solicitante} em ${p.adocao.data}</div>
            <div style="font-size: 0.85rem; color: #065f46; opacity: 0.9;">✉️ ${p.adocao.email} &nbsp;·&nbsp; 📞 ${p.adocao.telefone || 'Não informado'}</div>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm" onclick="openEditPetTab('${p.id}')">✏️ Editar informações</button>
          ${p.status !== 'adopted' ? `<button class="btn btn-sage btn-sm" onclick="marcarAdotado(${p.id})">Marcar como adotado</button>` : ''}
          <a href="/pet/${p.id}" target="_blank" class="btn btn-ghost btn-sm">👁️ Ver na página pública</a>
          <button class="btn btn-outline btn-sm btn-danger" onclick="deleteOngPet('${p.id}')">🗑️ Excluir</button>
        </div>
      </div>
    </details>
  `).join('');
}

// ── Editar Pet (ONG) ──────────────────────────────────────────────────────────
function openEditPetTab(id) {
  const p = ONG_PETS.find(x => x.id == id);
  if (!p) return;

  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

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
      <div id="edit-error" class="modal-error-banner" style="display:none; padding:12px; border-radius:8px; margin-bottom:16px; background:#fff0f0; color:#c0392b;"></div>
      
      <!-- Dados do Pet -->
      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
                <label class="form-label">Nome <span style="color:var(--terra)">*</span></label>
                <input id="edit-name" class="form-input" value="${p.name}">
          </div>
          <div>
                <label class="form-label">Raça</label>
                <input id="edit-breed" class="form-input" value="${p.breed || ''}">
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
              <textarea id="edit-desc" class="form-textarea" rows="3" placeholder="Carregando..."></textarea>
        </div>
      </div>
      
      <div style="margin-top: 28px; display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="saveEditPet('${p.id}')" style="padding: 12px 24px;">💾 Salvar alterações</button>
        <button class="btn btn-ghost" onclick="showTab('pets')" style="padding: 12px 24px;">Voltar</button>
      </div>
    </div>
  `;
  
  fetch(`/api/pets/${id}`)
    .then(r => r.json())
    .then(data => {
      const descEl = document.getElementById('edit-desc');
      if(descEl && data.description !== undefined) {
         descEl.value = data.description;
      }
    })
    .catch(e => console.error('Erro ao carregar descrição', e));
}

function saveEditPet(id) {
  const name  = document.getElementById('edit-name').value.trim();
  const city  = document.getElementById('edit-city').value.trim();
  const state = document.getElementById('edit-state').value.trim();
  const err   = document.getElementById('edit-error');

  err.style.display = 'none';

  if (!name || !city || !state) {
    err.textContent = '⚠️ Nome, cidade e estado são obrigatórios.';
    err.style.display = 'block';
    return;
  }
  
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
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      showToast('✅ Pet atualizado com sucesso!', 'success');
      loadOngData();
      showTab('pets');
    } else {
      err.textContent = `⚠️ ${data.erro}`;
      err.style.display = 'block';
    }
  })
  .catch(e => {
    err.textContent = `⚠️ Erro: ${e}`;
    err.style.display = 'block';
  });
}

function deleteOngPet(id) {
  if (!confirm('Atenção: Deseja realmente excluir este pet da plataforma? Esta ação não pode ser desfeita.')) return;
  fetch(`/api/pets/${id}`, { method: 'DELETE' })
    .then(r => r.json())
    .then(data => {
      if (data.sucesso) {
        showToast(`✅ ${data.mensagem}`, 'success');
        loadOngData();
      } else {
        showToast(`❌ ${data.erro}`, '');
      }
    });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

function updateOngSolicitacoesUI() {
      const solicitacoes = ALL_SOLICITACOES;
      const pendentes = solicitacoes.filter(s => s.status === 'pending' && s.petStatus !== 'adopted');
      document.getElementById('total-solicitacoes').textContent = pendentes.length;

      const listaSol = document.getElementById('lista-solicitacoes');
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      let filtered = solicitacoes.filter(s => {
        if (ongFilterDate === 'all') return true;
        if (!s.data) return true;
        const [y, m, d] = s.data.split('-');
        const dt = new Date(y, m - 1, d);
        
        if (ongFilterDate === 'today') {
           return dt.getTime() === today.getTime();
        }
        if (ongFilterDate === 'week') {
           const diff = today.getTime() - dt.getTime();
           return diff <= 7 * 24 * 60 * 60 * 1000 && diff >= 0;
        }
        if (ongFilterDate === 'month') {
           return dt.getMonth() === today.getMonth() && dt.getFullYear() === today.getFullYear();
        }
        if (ongFilterDate === 'specific') {
           if (!ongSpecificDate) return true;
           return s.data === ongSpecificDate;
        }
        if (ongFilterDate === 'range') {
           if (!ongStartDate && !ongEndDate) return true;
           const reqDate = new Date(y, m - 1, d).getTime();
           let startValid = true, endValid = true;
           
           if (ongStartDate) {
             const [sy, sm, sd] = ongStartDate.split('-');
             startValid = reqDate >= new Date(sy, sm - 1, sd).getTime();
           }
           if (ongEndDate) {
             const [ey, em, ed] = ongEndDate.split('-');
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
            <select class="form-input" style="width:auto; min-width: 200px; padding: 6px 12px; margin: 0;" onchange="ongFilterDate=this.value; updateOngSolicitacoesUI()">
              <option value="today" ${ongFilterDate==='today'?'selected':''}>📅 Apenas Hoje</option>
              <option value="week" ${ongFilterDate==='week'?'selected':''}>📅 Últimos 7 dias</option>
              <option value="month" ${ongFilterDate==='month'?'selected':''}>📅 Este Mês</option>
              <option value="specific" ${ongFilterDate==='specific'?'selected':''}>📅 Data Específica</option>
              <option value="range" ${ongFilterDate==='range'?'selected':''}>📅 Intervalo de Datas</option>
              <option value="all" ${ongFilterDate==='all'?'selected':''}>📅 Todas as datas</option>
            </select>
            ${ongFilterDate === 'specific' ? `<input type="date" class="form-input" style="width:auto; padding: 6px 12px; margin: 0;" value="${ongSpecificDate}" onchange="ongSpecificDate=this.value; updateOngSolicitacoesUI()">` : ''}
            ${ongFilterDate === 'range' ? `
              <input type="date" class="form-input" style="width:auto; padding: 6px 12px; margin: 0;" value="${ongStartDate}" onchange="ongStartDate=this.value; updateOngSolicitacoesUI()">
              <span style="color:var(--muted); font-size:0.9rem; font-weight:600; display:flex; align-items:center;">até</span>
              <input type="date" class="form-input" style="width:auto; padding: 6px 12px; margin: 0;" value="${ongEndDate}" onchange="ongEndDate=this.value; updateOngSolicitacoesUI()">
            ` : ''}
          </div>
        </div>
      `;

      if (!filtered.length) {
        listaSol.innerHTML = filterHtml + '<div class="empty"><div class="empty-icon">💌</div><div class="empty-title">Nenhuma solicitação encontrada.</div><p class="empty-desc">Nenhum pedido para o período selecionado.</p></div>';
        return;
      }

      listaSol.innerHTML = filterHtml + filtered.map(s => {
        let msgFormatted = '';
        if (s.mensagem && s.mensagem.includes('📞 Contato:')) {
          const parts = s.mensagem.split('\n\n💬 Mensagem:');
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
        } else if (s.mensagem) {
          msgFormatted = `
            <details style="margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <summary style="list-style: none; outline: none; cursor: pointer;">
                <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 600; color: var(--navy);">
                  <span style="display: flex; align-items: center; gap: 8px;">📋 <span>Mensagem do Adotante</span></span>
                  <span style="font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; color: #475569;">Ver informações ▾</span>
                </div>
              </summary>
              <div style="padding: 0 16px 16px 16px; border-top: 1px solid #f1f5f9; margin-top: 4px; padding-top: 16px;">
                <div style="background:#f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 10px; font-size:.87rem; color:var(--bark-m); line-height:1.6; white-space:pre-wrap;"><strong style="color:var(--navy); display:block; margin-bottom:4px; font-weight:700;">💬 Mensagem do Adotante:</strong>\n${s.mensagem}</div>
              </div>
            </details>`;
        }

        const phoneMatch = s.mensagem ? s.mensagem.match(/📞 Contato:\s*(.*?)\s*\(/) : null;
        const derivedPhone = s.telefone || (phoneMatch ? phoneMatch[1] : '');

        return `
        <div class="item-card">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--blush, #fce7f3);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🧑</div>
          <div class="item-info">
            <div class="item-name">${s.solicitanteName}</div>
            <div class="item-meta">Interesse em: <strong>${s.petName}</strong></div>
            ${msgFormatted}
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">
              <span style="font-size:.82rem;color:var(--muted)">📅 ${s.data ? s.data.split('-').reverse().join('/') : 'Recente'}</span>
              <span style="font-size:.82rem;color:var(--muted)">📍 ${s.cidade || ''}${s.estado ? '/' + s.estado : ''}</span>
              ${s.email ? `<span style="font-size:.82rem;color:var(--muted)">✉️ ${s.email}</span>` : ''}
            </div>
          </div>
          <div class="item-actions flex-column" style="min-width: 220px;">
            ${derivedPhone ? `<a href="https://wa.me/55${String(derivedPhone).replace(/\D/g,'')}" target="_blank" class="btn btn-whatsapp btn-sm" style="background:#25d366;color:#fff;border:none;text-decoration:none;display:flex;justify-content:center;margin-bottom:8px;">💬 Entrar em contato</a>` : ''}
            ${s.status === 'approved' ? 
              `<button class="btn btn-sm" disabled style="display:flex; justify-content:center; background-color: #d1fae5; color: #065f46; border: 2px solid #a7f3d0; opacity: 1; font-weight: 700;">🏠 Adoção Confirmada</button>` : 
              (s.petStatus === 'adopted' ? 
                `<button class="btn btn-sm" disabled style="display:flex; justify-content:center; background-color: var(--cream-d); color: var(--muted); border: 2px solid var(--sand); opacity: 1;">Pet adotado por outro</button>` : 
                (s.status === 'rejected' ? `<button class="btn btn-sm" disabled style="display:flex; justify-content:center; background-color: var(--cream-d); color: var(--muted); border: 2px solid var(--sand); opacity: 1;">❌ Dispensado</button>` : 
                `<div style="display:flex; gap:8px; width:100%; margin-top: 8px;">
                  <button class="btn btn-primary btn-sm" id="btn-adopt-${s.id}" onclick="confirmarAdocao(${s.id})" style="flex:1; display:flex; justify-content:center; background-color: var(--sage); border-color: var(--sage);">🏆 Confirmar</button>
                  <button class="btn btn-outline btn-sm btn-danger" id="btn-reject-${s.id}" onclick="recusarAdocao(${s.id})" style="flex:1; display:flex; justify-content:center;">❌ Recusar</button>
                </div>`)
              )
            }
          </div>
        </div>
      `;
      }).join('');
}

function confirmarAdocao(reqId) {
  if (!confirm('Deseja confirmar a adoção para este adotante? O pet será marcado como Adotado e a solicitação será aprovada.')) return;
  mudarStatusSolicitacao(reqId, 'approved');
}

function recusarAdocao(reqId) {
  if (!confirm('Tem certeza que deseja recusar esta solicitação de adoção? O usuário adotante será notificado no painel dele.')) return;
  mudarStatusSolicitacao(reqId, 'rejected');
}

function marcarAdotado(petId) {
  fetch(`/api/ong/pet/${petId}/marcar-adotado`, { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      if (data.sucesso) {
        loadOngData();
      }
    });
}

function mudarStatusSolicitacao(reqId, novoStatus) {
  const btn = document.getElementById(`btn-adopt-${reqId}`);
  const btnReject = document.getElementById(`btn-reject-${reqId}`);
  if(btn) {
    btn.disabled = true;
    if(btnReject) btnReject.disabled = true;
    if (novoStatus === 'approved') {
      btn.textContent = '🏠 Adoção Confirmada';
      btn.style.backgroundColor = '#d1fae5';
      btn.style.color = '#065f46';
      btn.style.borderColor = '#a7f3d0';
      btn.style.fontWeight = '700';
      if(btnReject) btnReject.style.display = 'none';
    } else if (novoStatus === 'rejected') {
      btn.textContent = '❌ Dispensado';
      btn.style.backgroundColor = 'var(--cream-d)';
      btn.style.color = 'var(--muted)';
      btn.style.borderColor = 'var(--sand)';
      if(btnReject) btnReject.style.display = 'none';
    } else {
      btn.textContent = 'Processando...';
    }
  }
  fetch(`/api/ong/solicitacao/${reqId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: novoStatus })
  })
    .then(r => r.json())
    .then(data => {
      if (data.sucesso) {
        showToast(novoStatus === 'approved' ? '✅ Adoção confirmada! O pet foi marcado como Adotado.' : 'Status atualizado.', 'success');
        loadOngData();
      } else {
        showToast('❌ Erro: ' + (data.erro || 'Não foi possível confirmar.'), '');
        if(btn) {
          btn.disabled = false;
          btn.textContent = '🏆 Confirmar';
          btn.style = 'display:flex; justify-content:center; background-color: var(--sage); border-color: var(--sage);';
          if(btnReject) btnReject.disabled = false;
        }
      }
    })
    .catch(e => {
      showToast('Erro de conexão', '');
      if(btn) {
        btn.disabled = false;
        btn.textContent = '🏆 Confirmar';
        btn.style = 'display:flex; justify-content:center; background-color: var(--sage); border-color: var(--sage);';
        if(btnReject) btnReject.disabled = false;
      }
    });
}

function loadOngProfile() {
  fetch('/api/ong/profile')
    .then(r => r.json())
    .then(data => {
      document.getElementById('ong-profile-name').value = data.name || '';
      document.getElementById('ong-profile-whatsapp').value = data.whatsapp || '';
      document.getElementById('ong-profile-city').value = data.city || '';
      document.getElementById('ong-profile-state').value = data.state || '';
      document.getElementById('ong-profile-photo').value = data.photo || '';
      document.getElementById('ong-profile-vakinha').value = data.vakinha || '';
      document.getElementById('ong-profile-pix').value = data.pix || '';
      document.getElementById('ong-profile-desc').value = data.desc || '';
      document.getElementById('ong-profile-desc-full').value = data.descFull || '';
    });
}

function saveOngProfile() {
  const alertBox = document.getElementById('ong-profile-error');
  alertBox.classList.remove('show');

  fetch('/api/ong/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('ong-profile-name').value.trim(),
      whatsapp: document.getElementById('ong-profile-whatsapp').value.trim(),
      city: document.getElementById('ong-profile-city').value.trim(),
      state: document.getElementById('ong-profile-state').value.trim().toUpperCase(),
      photo: document.getElementById('ong-profile-photo').value.trim(),
      vakinha: document.getElementById('ong-profile-vakinha').value.trim(),
      pix: document.getElementById('ong-profile-pix').value.trim(),
      desc: document.getElementById('ong-profile-desc').value.trim(),
      descFull: document.getElementById('ong-profile-desc-full').value.trim()
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data.sucesso) {
        alertBox.textContent = data.mensagem;
        alertBox.style.background = '#ecfdf5';
        alertBox.style.color = '#065f46';
        alertBox.classList.add('show');
        loadOngProfile();
      } else {
        alertBox.textContent = data.erro || 'Não foi possível salvar.';
        alertBox.style.background = '#fff0f0';
        alertBox.style.color = '#c0392b';
        alertBox.classList.add('show');
      }
    });
}
