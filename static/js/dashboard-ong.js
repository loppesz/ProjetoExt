document.addEventListener('DOMContentLoaded', () => {
  carregarResumo();
  carregarPets(); // Já carrega os pets ao abrir
});

function showTab(id, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  
  const tab = document.getElementById('tab-' + id);
  if(tab) tab.classList.add('active');
  if(el) el.classList.add('active');
  
  if(id === 'pets') carregarPets();
  if(id === 'solicitacoes') carregarSolicitacoes();
}

function carregarResumo() {
  fetch('/api/ong/meus-pets')
    .then(r => r.json())
    .then(data => {
      const pets = data.pets || [];
      document.getElementById('total-pets').textContent = pets.length;
    });
    
  fetch('/api/ong/solicitacoes')
    .then(r => r.json())
    .then(data => {
      const sol = data.solicitacoes || [];
      const pendentes = sol.filter(s => s.status === 'pending').length;
      document.getElementById('total-solicitacoes').textContent = pendentes;
    });
}

function carregarPets() {
  fetch('/api/user/pets')
    .then(r => r.json())
    .then(data => {
      const pets = data.pets || [];
      const container = document.getElementById('lista-pets');
      
      if (pets.length === 0) {
        container.innerHTML = `<div class="empty"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet cadastrado</div><p class="empty-desc">Cadastre seu primeiro pet para adoção!</p><a href="/new-pet" class="btn btn-primary">Cadastrar pet</a></div>`;
        return;
      }
      
      container.innerHTML = pets.map(p => `
        <div class="item-card">
          <img class="item-img" src="${p.photo}" alt="${p.name}" onclick="location.href='/pet/${p.id}'" style="cursor:pointer">
          <div class="item-info">
            <div class="item-name">${p.name}</div>
            <div class="item-meta">${p.breed} · 📍 ${p.city}/${p.state}</div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap">
              <span class="status-pill ${p.status==='available'?'pill-avail':p.status==='adopted'?'pill-approved':'pill-pending'}">
                ${p.status==='available'?'✅ Disponível':p.status==='adopted'?'🏠 Adotado':'⏳ Reservado'}
              </span>
            </div>
          </div>
          <div class="item-actions" style="flex-direction:column">
            <button class="btn btn-outline btn-sm" onclick="location.href='/pet/${p.id}'">👁️ Ver pet</button>
            ${p.status !== 'adopted' ? `<button class="btn btn-sage btn-sm" onclick="marcarAdotado(${p.id})">🏠 Marcar Adotado</button>` : ''}
            <button class="btn btn-outline btn-sm btn-danger" onclick="excluirPet(${p.id})">🗑️ Excluir</button>
          </div>
        </div>`).join('');
    });
}

function carregarSolicitacoes() {
  fetch('/api/ong/solicitacoes')
    .then(r => r.json())
    .then(data => {
      const sol = data.solicitacoes || [];
      const container = document.getElementById('lista-solicitacoes');
      
      if (sol.length === 0) {
        container.innerHTML = `<div class="empty"><div class="empty-icon">💌</div><div class="empty-title">Nenhuma solicitação</div><p class="empty-desc">Sua ONG ainda não recebeu pedidos de adoção pela plataforma.</p></div>`;
        return;
      }
      
      container.innerHTML = sol.map(s => `
        <div class="item-card">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--blush);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🧑</div>
          <div class="item-info">
            <div class="item-name">${s.solicitanteName}</div>
            <div class="item-meta">Quer adotar: <strong>${s.petName}</strong></div>
            <div style="font-size:.87rem;color:var(--bark-m);margin-top:8px;font-style:italic;line-height:1.6;background:var(--cream-d);padding:10px 14px;border-radius:var(--r-sm);border-left:3px solid var(--sand)">"${s.mensagem}"</div>
          </div>
          <div class="item-actions" style="flex-direction:column">
            ${s.status === 'pending' ? `
              <button class="btn btn-sage btn-sm" onclick="responderSolicitacao(${s.id}, 'approved')">✅ Aprovar</button>
              <button class="btn btn-outline btn-sm btn-danger" onclick="responderSolicitacao(${s.id}, 'rejected')">❌ Recusar</button>
            ` : `<span class="status-pill ${s.status==='approved'?'pill-approved':'pill-rejected'}">${s.status==='approved'?'✅ Aprovada':'❌ Recusada'}</span>`}
          </div>
        </div>`).join('');
    });
}

function marcarAdotado(petId) {
  if(confirm('Tem certeza que deseja marcar este pet como adotado?')) {
    fetch(`/api/ong/pet/${petId}/marcar-adotado`, { method: 'POST' })
      .then(() => carregarPets());
  }
}

function excluirPet(petId) {
  if(confirm('Tem certeza que deseja excluir este pet permanentemente?')) {
    fetch(`/api/pets/${petId}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(data => {
        if (typeof showToast === 'function') showToast('Pet excluído com sucesso!', 'success');
        carregarPets();
        carregarResumo();
      });
  }
}

function responderSolicitacao(reqId, status) {
  fetch(`/api/ong/solicitacao/${reqId}/status`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({status})
  })
  .then(r => r.json())
  .then(data => {
    if(data.sucesso) {
      if(typeof showToast === 'function') showToast(status === 'approved' ? '✅ Adoção aprovada! Pet marcado como adotado.' : 'Solicitação recusada.', status === 'approved' ? 'success' : '');
      carregarSolicitacoes();
      carregarResumo();
      carregarPets();
    } else {
      if(typeof showToast === 'function') showToast('❌ Erro: ' + data.erro, '');
    }
  })
  .catch(e => {
    if(typeof showToast === 'function') showToast('Erro de conexão', '');
  });
}

function openEditOngModal() {
  fetch('/api/ong/perfil')
    .then(r => r.json())
    .then(ong => {
      document.getElementById('modal-content').innerHTML = `
        <div class="modal-title">✏️ Editar Perfil da ONG</div>
        <p class="modal-sub">Atualize os dados e a apresentação da sua instituição</p>
        <form id="form-edit-ong" onsubmit="saveOngProfile(event)">
          <div style="margin-bottom:14px">
            <label class="form-label">Nome da ONG <span style="color:var(--terra)">*</span></label>
            <input type="text" id="edit-ong-nome" class="form-input" value="${ong.nome || ''}" required>
          </div>
          <div style="margin-bottom:14px">
            <label class="form-label">Nova Foto de Perfil <span style="font-weight:400;color:var(--muted);text-transform:none;letter-spacing:normal">(Deixe vazio para manter a atual)</span></label>
            <input type="file" id="edit-ong-foto" class="form-input" accept="image/*">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div>
              <label class="form-label">Cidade <span style="color:var(--terra)">*</span></label>
              <input type="text" id="edit-ong-cidade" class="form-input" value="${ong.cidade || ''}" required>
            </div>
            <div>
              <label class="form-label">Estado <span style="color:var(--terra)">*</span></label>
              <input type="text" id="edit-ong-estado" class="form-input" value="${ong.estado || ''}" required maxlength="2">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div>
              <label class="form-label">WhatsApp</label>
              <input type="text" id="edit-ong-whatsapp" class="form-input" value="${ong.whatsapp || ''}">
            </div>
            <div>
              <label class="form-label">Chave PIX</label>
              <input type="text" id="edit-ong-pix" class="form-input" value="${ong.chave_pix || ''}">
            </div>
          </div>
          <div style="margin-bottom:14px">
            <label class="form-label">Descrição Curta</label>
            <textarea id="edit-ong-desc" class="form-textarea" rows="2">${ong.descricao || ''}</textarea>
          </div>
          <div style="margin-bottom:18px">
            <label class="form-label">História Completa</label>
            <textarea id="edit-ong-desc-full" class="form-textarea" rows="4">${ong.descricao_completa || ''}</textarea>
          </div>
          <div style="display:flex;gap:10px">
            <button type="submit" class="btn btn-primary" id="btn-save-ong" style="flex:1">💾 Salvar Alterações</button>
            <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
          </div>
        </form>
      `;
      document.getElementById('modal').classList.add('open');
    });
}

function saveOngProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-ong');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  const formData = new FormData();
  formData.append('nome', document.getElementById('edit-ong-nome').value);
  formData.append('cidade', document.getElementById('edit-ong-cidade').value);
  formData.append('estado', document.getElementById('edit-ong-estado').value);
  formData.append('whatsapp', document.getElementById('edit-ong-whatsapp').value);
  formData.append('chave_pix', document.getElementById('edit-ong-pix').value);
  formData.append('descricao', document.getElementById('edit-ong-desc').value);
  formData.append('descricao_completa', document.getElementById('edit-ong-desc-full').value);

  const fotoInput = document.getElementById('edit-ong-foto');
  if (fotoInput.files.length > 0) formData.append('foto', fotoInput.files[0]);

  fetch('/api/ong/perfil', { method: 'POST', body: formData })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      closeModal();
      showToast('Perfil atualizado com sucesso!', 'success');
      setTimeout(() => location.reload(), 1000); // Atualiza a página para carregar foto e nome novos!
    } else {
      alert('Erro: ' + data.erro);
      btn.disabled = false;
      btn.textContent = '💾 Salvar';
    }
  });
}

function closeModal(e) { if (!e || e.target === document.getElementById('modal')) document.getElementById('modal').classList.remove('open'); }

function showToast(msg, type = '') {
  const t = document.getElementById('toast'); if(!t) return;
  t.textContent = msg; t.className = 'toast' + (type ? ' ' + type : ''); t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
}