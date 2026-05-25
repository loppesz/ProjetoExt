document.addEventListener('DOMContentLoaded', () => {
    loadOngData();
});

function showTab(id, el) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    if(el) el.classList.add('active');
}

function loadOngData() {
    // Carregar Pets
    fetch('/api/ong/meus-pets')
        .then(r => r.json())
        .then(data => {
            document.getElementById('total-pets').textContent = data.pets.length;
            
            const listaPets = document.getElementById('lista-pets');
            if (!data.pets.length) {
                listaPets.innerHTML = '<div class="empty"><div class="empty-icon">🐾</div><div class="empty-title">Nenhum pet cadastrado no momento.</div></div>';
            } else {
                listaPets.innerHTML = data.pets.map(p => `
                    <div class="item-card">
                        <div class="item-info">
                            <div class="item-name">${p.name}</div>
                            Status: <span class="status-pill ${p.status === 'available' ? 'pill-avail' : 'pill-adopted'} mb-0">
                                ${p.status === 'available' ? 'Disponível' : p.status === 'adopted' ? 'Adotado' : 'Reservado'}
                            </span>
                        </div>
                        <div class="item-actions">
                            ${p.status !== 'adopted' ? `<button class="btn btn-sage btn-sm" onclick="marcarAdotado(${p.id})">Marcar como Adotado</button>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        });

    // Carregar Solicitações
    fetch('/api/ong/solicitacoes')
        .then(r => r.json())
        .then(data => {
            const pendentes = data.solicitacoes.filter(s => s.status === 'pending');
            document.getElementById('total-solicitacoes').textContent = pendentes.length;
            
            const listaSol = document.getElementById('lista-solicitacoes');
            if (!data.solicitacoes.length) {
                listaSol.innerHTML = '<div class="empty"><div class="empty-icon">💌</div><div class="empty-title">Nenhuma solicitação até o momento.</div></div>';
            } else {
                listaSol.innerHTML = data.solicitacoes.map(s => `
                    <div class="item-card">
                        <div class="req-avatar">🧑</div>
                        <div class="item-info">
                            <div class="item-name">${s.solicitanteName}</div>
                            <div class="item-meta">Quer adotar: <strong>${s.petName}</strong></div>
                            <div class="req-quote">"${s.mensagem}"</div>
                            <div class="mt-10">
                                <span class="status-pill ${s.status === 'pending' ? 'pill-pending' : s.status === 'approved' ? 'pill-approved' : 'pill-rejected'}">
                                    ${s.status === 'pending' ? '⏳ Aguardando' : s.status === 'approved' ? '✅ Aprovado' : '❌ Recusado'}
                                </span>
                            </div>
                        </div>
                        <div class="item-actions flex-column">
                            ${s.status === 'pending' ? `
                                <button class="btn btn-sage btn-sm" onclick="mudarStatusSolicitacao(${s.id}, 'approved')">✅ Aprovar</button>
                                <button class="btn btn-outline btn-sm btn-danger" onclick="mudarStatusSolicitacao(${s.id}, 'rejected')">Recusar</button>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            }
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
    .then(data => { if (data.sucesso) loadOngData(); });
}