let ALL_SOLICITACOES = [];
let ongFilterDate = 'today';
let ongSpecificDate = '';
let ongStartDate = '';
let ongEndDate = '';

document.addEventListener('DOMContentLoaded', () => {
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
      ALL_SOLICITACOES = data.solicitacoes || [];
      updateOngSolicitacoesUI();
    });
}

function updateOngSolicitacoesUI() {
      const solicitacoes = ALL_SOLICITACOES;
      const pendentes = solicitacoes.filter(s => s.status === 'pending');
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
          </div>
        </div>
      `;
      }).join('');
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
