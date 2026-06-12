document.addEventListener('DOMContentLoaded', () => {
  carregarResumo();
  carregarPets(); // Já carrega os pets ao abrir


  // Torna os cards de estatísticas clicáveis para navegar para as abas
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length >= 2) {
    statCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.style.transition = 'transform 0.2s, box-shadow 0.2s';
      card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-4px)'; });
      card.addEventListener('mouseleave', () => { card.style.transform = 'translateY(0)'; });
    });
    
    statCards[0].onclick = () => { const l = document.querySelector('[onclick*="pets"]'); if(l) showTab('pets', l); };
    statCards[1].onclick = () => { const l = document.querySelector('[onclick*="solicitacoes"]'); if(l) showTab('solicitacoes', l); };
  }
});

function showTab(id, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (el) el.classList.add('active');
}

function loadOngData() {
  fetch('/api/ong/meus-pets')
    .then(r => r.json())
    .then(data => {
      const pets = data.pets || [];
      document.getElementById('total-pets').textContent = pets.length;

      const listaPets = document.getElementById('lista-pets');
      if (!pets.length) {
        listaPets.innerHTML = '<div class="empty"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet cadastrado no momento.</div></div>';
        return;
      }

      listaPets.innerHTML = pets.map(p => `
        <div class="item-card">
          <img class="item-img" src="${p.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300'}" alt="${p.name}">
          <div class="item-info">
            <div class="item-name">${p.name}</div>
            <div class="item-meta">${p.breed || 'Sem raça definida'} · 📍 ${p.city || '-'}/${p.state || '-'}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <span class="status-pill ${p.status === 'available' ? 'pill-avail' : p.status === 'adopted' ? 'pill-adopted' : 'pill-reserved'}">
                ${p.status === 'available' ? 'Disponível' : p.status === 'adopted' ? 'Adotado' : 'Reservado'}
              </span>
              <span class="status-pill ${p.modStatus === 'approved' ? 'pill-approved' : p.modStatus === 'pending' ? 'pill-pending' : 'pill-rejected'}">
                ${p.modStatus === 'approved' ? 'Aprovado' : p.modStatus === 'pending' ? 'Aguardando admin' : 'Removido'}
              </span>
            </div>
          </div>
          <div class="item-actions">
            ${p.status !== 'adopted' ? `<button class="btn btn-sage btn-sm" onclick="marcarAdotado(${p.id})">Marcar como adotado</button>` : ''}
          </div>
        </div>
      `).join('');
    });

  fetch('/api/ong/solicitacoes')
    .then(r => r.json())
    .then(data => {
      const solicitacoes = data.solicitacoes || [];
      const pendentes = solicitacoes.filter(s => s.status === 'pending');
      document.getElementById('total-solicitacoes').textContent = pendentes.length;

      const listaSol = document.getElementById('lista-solicitacoes');
      if (!solicitacoes.length) {
        listaSol.innerHTML = '<div class="empty"><div class="empty-icon">💌</div><div class="empty-title">Nenhuma solicitação até o momento.</div></div>';
        return;
      }

      listaSol.innerHTML = solicitacoes.map(s => `
        <div class="item-card">
          <div class="req-avatar">👤</div>
          <div class="item-info">
            <div class="item-name">${s.solicitanteName}</div>
            <div class="item-meta">Quer adotar: <strong>${s.petName}</strong></div>
            <div class="item-meta">${s.email || ''}${s.telefone ? ' · ' + s.telefone : ''}</div>
            <div class="item-meta">${s.cidade || ''}${s.estado ? '/' + s.estado : ''}</div>
            <div class="req-quote">"${s.mensagem}"</div>
            <div class="mt-10">
              <span class="status-pill ${s.status === 'pending' ? 'pill-pending' : s.status === 'approved' ? 'pill-approved' : 'pill-rejected'}">
                ${s.status === 'pending' ? 'Aguardando' : s.status === 'approved' ? 'Aprovado' : 'Recusado'}
              </span>
            </div>
          </div>
          <div class="item-actions flex-column">
            ${s.status === 'pending' ? `
              <button class="btn btn-sage btn-sm" onclick="mudarStatusSolicitacao(${s.id}, 'approved')">Aprovar</button>
              <button class="btn btn-outline btn-sm btn-danger" onclick="mudarStatusSolicitacao(${s.id}, 'rejected')">Recusar</button>
            ` : ''}
          </div>
        </div>
      `).join('');
    });
}

function marcarAdotado(petId) {
  fetch(`/api/ong/pet/${petId}/marcar-adotado`, { method: 'POST' })
    .then(r => r.json())
    .then(ong => {
      tab.innerHTML = `
        <div class="fade-in">
            <div class="panel-header" style="margin-bottom: 8px;">
              <div class="panel-title">⚙️ Editar Perfil da ONG</div>
            </div>
            <p style="color: var(--muted); margin-bottom: 24px; font-size: 0.95rem;">Mantenha suas informações atualizadas para atrair mais adotantes!</p>
            
            <form id="form-edit-ong" onsubmit="saveOngProfile(event)">
              <!-- 1. Foto de Perfil -->
              <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid #5ba3d4; padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
                <label class="form-label" style="margin-bottom:12px;">📸 Foto de Perfil <span style="font-weight:400;color:var(--muted);text-transform:none;letter-spacing:normal">(Deixe vazio para manter)</span></label>
                <div style="display:flex; gap:16px; align-items:center;">
                  <img src="${ong.foto_url || 'https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=100&q=80'}" style="width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid #e5e7eb; box-shadow: var(--sh-sm);">
                  <input type="file" id="edit-ong-foto" class="form-input" accept="image/*" style="flex:1;">
                </div>
              </div>

              <!-- 2. Dados Principais -->
              <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
                <div class="form-group" style="margin-bottom: 14px;">
                  <label class="form-label">🏢 Nome da ONG <span class="req">*</span></label>
                  <input type="text" id="edit-ong-nome" class="form-input" value="${ong.nome || ''}" required>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div>
                    <label class="form-label">📍 Cidade <span class="req">*</span></label>
                    <input type="text" id="edit-ong-cidade" class="form-input" value="${ong.cidade || ''}" required>
                  </div>
                  <div>
                    <label class="form-label">🗺️ Estado <span class="req">*</span></label>
                    <input type="text" id="edit-ong-estado" class="form-input" value="${ong.estado || ''}" required maxlength="2">
                  </div>
                </div>
              </div>

              <!-- 3. Contatos e Doações -->
              <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--yellow); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                  <div>
                    <label class="form-label">💬 WhatsApp</label>
                    <input type="text" id="edit-ong-whatsapp" class="form-input" value="${ong.whatsapp || ''}" placeholder="Ex: 11999990000">
                  </div>
                  <div>
                    <label class="form-label">💳 Chave PIX</label>
                    <input type="text" id="edit-ong-pix" class="form-input" value="${ong.chave_pix || ''}" placeholder="E-mail, CPF, Celular...">
                  </div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div>
                    <label class="form-label">❤️ Link da Vakinha</label>
                    <input type="url" id="edit-ong-vakinha" class="form-input" value="${ong.link_vakinha || ''}" placeholder="https://vakinha.com.br/...">
                  </div>
                  <div>
                    <label class="form-label">✨ Instagram</label>
                    <input type="url" id="edit-ong-instagram" class="form-input" value="${ong.instagram || ''}" placeholder="https://instagram.com/...">
                  </div>
                </div>
              </div>

              <!-- 4. Sobre a ONG -->
              <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--navy); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
                <div class="form-group" style="margin-bottom: 14px;">
                  <label class="form-label">📝 Descrição Curta</label>
                  <textarea id="edit-ong-desc" class="form-textarea" rows="2" placeholder="Resumo em uma frase sobre o que a ONG faz...">${ong.descricao || ''}</textarea>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">📖 História Completa</label>
                  <textarea id="edit-ong-desc-full" class="form-textarea" rows="4" placeholder="Conte a história detalhada da instituição, como surgiu, como ajudam...">${ong.descricao_completa || ''}</textarea>
                </div>
              </div>

              <div style="margin-top: 28px;">
                <button type="submit" class="btn btn-primary" id="btn-save-ong" style="padding: 12px 24px;">💾 Salvar Alterações</button>
              </div>
            </form>
          </div>
      `;
    });
}

function mudarStatusSolicitacao(reqId, novoStatus) {
  fetch(`/api/ong/solicitacao/${reqId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: novoStatus })
  })
    .then(r => r.json())
    .then(data => {
      if (data.sucesso) loadOngData();
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
