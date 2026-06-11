document.addEventListener('DOMContentLoaded', () => {
  carregarResumo();
  carregarPets(); // Já carrega os pets ao abrir

  // Injeta o botão "Editar Perfil" no final do menu lateral
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    sidebarNav.insertAdjacentHTML('beforeend', `
      <hr class="sidebar-divider">
      <a class="sidebar-link" onclick="openEditOngTab(this)">
        <span class="icon" style="font-size:1.15rem;">⚙️</span> Editar Perfil
      </a>
    `);
  }

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
      
      container.innerHTML = sol.map(s => {
        const phoneMatch = s.mensagem.match(/📞 Contato:\s*(.*?)\s*\(/);
        const derivedPhone = s.solicitantePhone || (phoneMatch ? phoneMatch[1] : '');

        // Transformar a mensagem única em blocos de estilo do projeto
        let msgFormatted = '';
        if (s.mensagem.includes('📞 Contato:')) {
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
          
          msgFormatted = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px;">${gridItems}</div>` + 
                         (obs ? `<div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); font-size:.87rem; color:var(--bark-m); margin-top:12px; line-height:1.6;"><strong style="color:var(--navy); display:block; margin-bottom:4px; font-weight:700;">💬 Mensagem do Adotante:</strong>${obs}</div>` : '');
        } else {
          msgFormatted = `<div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 14px 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); font-size:.87rem; color:var(--bark-m); margin-top:12px; line-height:1.6; white-space:pre-wrap;"><strong style="color:var(--navy); display:block; margin-bottom:4px; font-weight:700;">💬 Mensagem do Adotante:</strong>\n${s.mensagem}</div>`;
        }

        return `
        <div class="item-card">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--blush);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🧑</div>
          <div class="item-info">
            <div class="item-name">${s.solicitanteName}</div>
            <div class="item-meta">Interesse em: <strong>${s.petName}</strong></div>
            ${msgFormatted}
          </div>
          <div class="item-actions" style="flex-direction:column; min-width: 220px;">
            ${derivedPhone ? `<a href="https://wa.me/55${derivedPhone.replace(/\D/g,'')}" target="_blank" class="btn btn-whatsapp btn-sm" style="background:#25d366;color:#fff;border:none;text-decoration:none;display:flex;justify-content:center;">💬 Chamar no WhatsApp</a>` : `<div style="font-size: 0.8rem; color: var(--muted); text-align: center; padding: 4px;">Sem WhatsApp</div>`}
            ${s.status === 'pending' ? `
              <button class="btn btn-adopt-confirm btn-sm" onclick="responderSolicitacao(${s.id}, 'approved')" style="margin-top:6px;">🏆 Confirmar Adoção</button>
              <button class="btn btn-adopt-dismiss btn-sm" onclick="responderSolicitacao(${s.id}, 'rejected')" style="margin-top:4px;">❌ Dispensar</button>
            ` : (s.status === 'approved' ? `<span class="status-pill pill-approved" style="margin-top:6px; justify-content:center;">🏆 Adoção Confirmada</span>` : `<span class="status-pill pill-rejected" style="margin-top:6px; justify-content:center;">❌ Dispensado</span>`)}
          </div>
        </div>`;
      }).join('');
    });
}

function marcarAdotado(petId) {
  if(confirm('Tem certeza que deseja marcar este pet como adotado?')) {
    fetch(`/api/ong/pet/${petId}/marcar-adotado`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) {
          if (typeof showToast === 'function') showToast('✅ Pet marcado como adotado e estatísticas atualizadas!', 'success');
          carregarPets();
          carregarResumo();
        }
      });
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
      if(typeof showToast === 'function') showToast(status === 'approved' ? '🏆 Parabéns! Adoção confirmada e pet atualizado.' : 'Solicitação dispensada.', status === 'approved' ? 'success' : '');
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

function openEditOngTab(el) {
  // Ativa o link visualmente no menu lateral e limpa as outras abas
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if(el) el.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  // Verifica se a aba já foi criada no DOM. Se não, cria uma nova.
  let tab = document.getElementById('tab-edit-ong');
  if (!tab) {
    tab = document.createElement('div');
    tab.id = 'tab-edit-ong';
    tab.className = 'tab-panel';
    document.querySelector('.content').appendChild(tab);
  }
  tab.classList.add('active');
  
  // Aviso de carregamento "fofo" e animado enquanto busca os dados
  tab.innerHTML = `
    <div style="text-align:center; padding: 50px 20px;" class="fu">
      <div style="font-size:3.5rem; margin-bottom:16px; animation: float 2s ease-in-out infinite;">🐾</div>
      <h3 style="font-family: var(--ff-display); color: var(--bark); font-size: 1.4rem;">Buscando dados...</h3>
      <p style="color: var(--muted); font-size: 0.95rem;">Só um segundinho!</p>
    </div>
  `;

  fetch('/api/ong/perfil')
    .then(r => r.json())
    .then(ong => {
      // Um pequeno atraso de 300ms garante que a tela não "pisque" se a internet for muito rápida
      setTimeout(() => {
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
      }, 300); // Fim do setTimeout
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
  formData.append('link_vakinha', document.getElementById('edit-ong-vakinha').value);
  formData.append('instagram', document.getElementById('edit-ong-instagram').value);
  formData.append('descricao', document.getElementById('edit-ong-desc').value);
  formData.append('descricao_completa', document.getElementById('edit-ong-desc-full').value);

  const fotoInput = document.getElementById('edit-ong-foto');
  if (fotoInput.files.length > 0) formData.append('foto', fotoInput.files[0]);

  fetch('/api/ong/perfil', { method: 'POST', body: formData })
  .then(r => r.json())
  .then(data => {
    if (data.sucesso) {
      showToast('Perfil atualizado com sucesso!', 'success');
      setTimeout(() => location.reload(), 1000); // Atualiza a página para carregar foto e nome novos!
    } else {
      showToast('Erro: ' + data.erro, '');
      btn.disabled = false;
      btn.textContent = '💾 Salvar Alterações';
    }
  });
}

function closeModal(e) { if (!e || e.target === document.getElementById('modal')) document.getElementById('modal').classList.remove('open'); }

function showToast(msg, type = '') {
  const t = document.getElementById('toast'); if(!t) return;
  t.textContent = msg; t.className = 'toast' + (type ? ' ' + type : ''); t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3200);
}