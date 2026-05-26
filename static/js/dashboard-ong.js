document.addEventListener('DOMContentLoaded', () => {
  loadOngData();
  loadOngProfile();
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
    .then(data => {
      if (data.sucesso) loadOngData();
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
