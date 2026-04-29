const MOCK_ONGS = [
  {
    id:'1', name:'Patinhas do Bem', city:'São Paulo', state:'SP',
    desc:'Resgatamos e reabilitamos cães e gatos em situação de rua desde 2015. Já realizamos mais de 300 adoções responsáveis.',
    descFull:'A Patinhas do Bem atua há mais de 9 anos no resgate, reabilitação e adoção responsável de animais em situação de vulnerabilidade na Grande São Paulo. Contamos com uma rede de lares temporários e parceiros veterinários que garantem o bem-estar de cada animal até encontrar um lar definitivo.',
    whatsapp:'5511999990001', pets:12, adopted:320, donations:4800,
    photo:'https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=600&q=80',
    pix:'patinhasdob@gmail.com', vakinha:'https://www.vakinha.com.br'
  },
  {
    id:'2', name:'Lar dos Bichos', city:'Rio de Janeiro', state:'RJ',
    desc:'ONG dedicada ao resgate de animais abandonados no Rio de Janeiro. Atuamos com castração, vacinação e adoção.',
    descFull:'O Lar dos Bichos é uma organização sem fins lucrativos que atua no Rio de Janeiro há 7 anos. Nosso trabalho inclui resgate de emergência, cuidados veterinários, castração e vacinação subsidiada, além de um programa de adoção responsável com acompanhamento pós-adoção.',
    whatsapp:'5521999990002', pets:8, adopted:185, donations:3200,
    photo:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    pix:'lardosbichos@gmail.com', vakinha:'https://www.vakinha.com.br'
  },
  {
    id:'3', name:'Amigos de Patas', city:'Belo Horizonte', state:'MG',
    desc:'Cuidamos de animais especiais — idosos, com deficiência e vítimas de maus-tratos. Cada vida importa para nós.',
    descFull:'A Amigos de Patas se especializa no cuidado de animais com necessidades especiais: idosos, com deficiências físicas ou sequelas de maus-tratos. Acreditamos que todo animal merece uma segunda chance, independente de sua condição. Trabalhamos com adoção consciente e educação sobre guarda responsável.',
    whatsapp:'5531999990003', pets:15, adopted:210, donations:5600,
    photo:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
    pix:'amigospatinhas@gmail.com', vakinha:'https://www.vakinha.com.br'
  },
  {
    id:'4', name:'Refúgio Animal Sul', city:'Porto Alegre', state:'RS',
    desc:'Atuamos no sul do Brasil com foco em animais de grande porte. Temos um abrigo com capacidade para 50 animais.',
    descFull:'O Refúgio Animal Sul é o maior abrigo de animais do Rio Grande do Sul, com capacidade para 50 animais. Focamos especialmente em cães de grande porte, que têm mais dificuldade de adoção. Nosso abrigo conta com área verde, veterinário residente e equipe de voluntários dedicados.',
    whatsapp:'5551999990004', pets:22, adopted:140, donations:2900,
    photo:'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80',
    pix:'refugioanimalsul@gmail.com', vakinha:'https://www.vakinha.com.br'
  },
];

// Métricas dinâmicas
const totalPets = MOCK_ONGS.reduce((s,o)=>s+o.pets,0);
const totalAdopted = MOCK_ONGS.reduce((s,o)=>s+o.adopted,0);
const totalDonations = MOCK_ONGS.reduce((s,o)=>s+o.donations,0);
document.getElementById('m-pets').textContent = totalPets;
document.getElementById('m-adopted').textContent = totalAdopted + '+';
document.getElementById('m-donations').textContent = 'R$ ' + totalDonations.toLocaleString('pt-BR');

function renderOngs() {
  const grid = document.getElementById('ongs-grid');
  grid.innerHTML = MOCK_ONGS.map(o => `
    <article class="pet-card" style="cursor:pointer" onclick="openOngModal('${o.id}')">
      <div class="card-img">
        <img src="${o.photo}" alt="${o.name}" loading="lazy">
        <span class="card-badge badge-avail">${o.pets} pets</span>
      </div>
      <div class="card-body">
        <div class="card-name">${o.name}</div>
        <div class="card-breed" style="margin-bottom:8px">📍 ${o.city}/${o.state}</div>
        <p style="font-size:.84rem;color:var(--bark-m);line-height:1.6;margin-bottom:14px">${o.desc}</p>
        <div style="display:flex;gap:16px;font-size:.8rem;color:var(--muted);margin-bottom:14px">
          <span>🐾 ${o.pets} pets</span>
          <span>🏠 ${o.adopted} adoções</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openDonateModal('${o.id}')">💚 Doar</button>
          <a href="https://wa.me/${o.whatsapp}" target="_blank" class="btn btn-ghost btn-sm" onclick="event.stopPropagation()">💬 WhatsApp</a>
        </div>
      </div>
    </article>`).join('');
}

function openOngModal(id) {
  const o = MOCK_ONGS.find(x => x.id === id);
  if (!o) return;
  document.getElementById('modal-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <div style="width:60px;height:60px;border-radius:var(--r-sm);overflow:hidden;flex-shrink:0">
        <img src="${o.photo}" alt="${o.name}" style="width:100%;height:100%;object-fit:cover">
      </div>
      <div>
        <div class="modal-title" style="margin-bottom:2px">${o.name}</div>
        <div style="font-size:.85rem;color:var(--muted)">📍 ${o.city}, ${o.state}</div>
      </div>
    </div>
    <p style="color:var(--bark-m);line-height:1.8;margin-bottom:20px;font-size:.95rem">${o.descFull}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px">
      <div style="background:var(--cream-d);border-radius:var(--r-sm);padding:14px;text-align:center">
        <div style="font-family:var(--ff-display);font-size:1.5rem;font-weight:700;color:var(--terra)">${o.pets}</div>
        <div style="font-size:.78rem;color:var(--muted)">Pets ativos</div>
      </div>
      <div style="background:var(--cream-d);border-radius:var(--r-sm);padding:14px;text-align:center">
        <div style="font-family:var(--ff-display);font-size:1.5rem;font-weight:700;color:var(--sage)">${o.adopted}+</div>
        <div style="font-size:.78rem;color:var(--muted)">Adoções</div>
      </div>
      <div style="background:var(--cream-d);border-radius:var(--r-sm);padding:14px;text-align:center">
        <div style="font-family:var(--ff-display);font-size:1.5rem;font-weight:700;color:var(--gold)">R$ ${o.donations.toLocaleString('pt-BR')}</div>
        <div style="font-size:.78rem;color:var(--muted)">Doações</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" style="flex:1" onclick="closeModal();openDonateModal('${o.id}')">💚 Fazer doação</button>
      <a href="https://wa.me/${o.whatsapp}" target="_blank" class="btn btn-ghost" style="flex:1;text-align:center">💬 Falar no WhatsApp</a>
    </div>
    <button class="btn btn-ghost btn-full" style="margin-top:10px" onclick="closeModal()">Fechar</button>`;
  document.getElementById('modal').classList.add('open');
}

function openDonateModal(id) {
  const o = MOCK_ONGS.find(x => x.id === id);
  if (!o) return;
  let selectedValue = 25;
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">💚 Doar para ${o.name}</div>
    <p class="modal-sub">Escolha um valor e ajude a cuidar dos animais</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px" id="value-btns">
      ${[10,25,50,100].map(v=>`
        <button class="btn ${v===25?'btn-primary':'btn-outline'} btn-sm" onclick="selectValue(${v},this)" data-val="${v}">R$ ${v}</button>
      `).join('')}
    </div>
    <div style="margin-bottom:20px">
      <label class="form-label" style="display:block;font-size:.8rem;font-weight:700;color:var(--bark-m);margin-bottom:6px;text-transform:uppercase;letter-spacing:.03em">Outro valor</label>
      <input type="number" id="custom-val" class="form-input" placeholder="Ex: 30" min="1" style="width:100%;padding:12px 14px;border:2px solid var(--sand);border-radius:var(--r-sm);font-size:.93rem;font-family:var(--ff-body);background:var(--cream);color:var(--bark);transition:border-color var(--ease)" oninput="onCustomVal(this)">
      <div id="val-error" style="color:#c0392b;font-size:.82rem;margin-top:4px;display:none">⚠️ Valor mínimo de R$ 1,00</div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:8px">
      <button class="btn btn-primary" style="flex:1" onclick="proceedPix('${o.id}')">📱 Pagar via Pix</button>
      <a href="${o.vakinha}" target="_blank" class="btn btn-ghost" style="flex:1;text-align:center" onclick="closeModal()">🔗 Link externo</a>
    </div>
    <button class="btn btn-ghost btn-full" onclick="closeModal()">Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
}

function selectValue(v, btn) {
  document.querySelectorAll('#value-btns .btn').forEach(b => {
    b.className = b.className.replace('btn-primary','btn-outline');
  });
  btn.className = btn.className.replace('btn-outline','btn-primary');
  document.getElementById('custom-val').value = '';
  document.getElementById('val-error').style.display = 'none';
}

function onCustomVal(input) {
  document.querySelectorAll('#value-btns .btn').forEach(b => {
    b.className = b.className.replace('btn-primary','btn-outline');
  });
  const err = document.getElementById('val-error');
  const v = parseFloat(input.value);
  if (input.value && (isNaN(v) || v < 1)) {
    err.style.display = 'block';
    input.style.borderColor = '#e74c3c';
  } else {
    err.style.display = 'none';
    input.style.borderColor = '';
  }
}

function getSelectedValue() {
  const custom = document.getElementById('custom-val');
  if (custom && custom.value) {
    const v = parseFloat(custom.value);
    if (isNaN(v) || v < 1) return null;
    return v;
  }
  const active = document.querySelector('#value-btns .btn-primary');
  return active ? parseFloat(active.dataset.val) : 25;
}

function proceedPix(id) {
  const o = MOCK_ONGS.find(x => x.id === id);
  const val = getSelectedValue();
  if (!val) {
    document.getElementById('val-error').style.display = 'block';
    return;
  }
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">📱 Pix — ${o.name}</div>
    <p class="modal-sub">Escaneie o QR Code ou copie a chave Pix abaixo</p>
    <div style="text-align:center;margin-bottom:20px">
      <div style="background:var(--cream-d);border-radius:var(--r-lg);padding:24px;display:inline-block;margin-bottom:16px">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('pix:'+o.pix+'?amount='+val)}" alt="QR Code Pix" style="width:160px;height:160px;border-radius:var(--r-sm)">
      </div>
      <div style="font-family:var(--ff-display);font-size:1.6rem;font-weight:700;color:var(--terra)">R$ ${val.toFixed(2).replace('.',',')}</div>
    </div>
    <div style="background:var(--cream-d);border-radius:var(--r-sm);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px">
      <div>
        <div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Chave Pix</div>
        <div style="font-weight:600;font-size:.93rem;color:var(--bark)" id="pix-key">${o.pix}</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="copyPix('${o.pix}')">📋 Copiar</button>
    </div>
    <div style="background:rgba(78,115,82,.08);border-radius:var(--r-sm);padding:12px 16px;font-size:.84rem;color:var(--sage);margin-bottom:20px">
      ✅ Após o pagamento, envie o comprovante via WhatsApp para confirmar sua doação.
    </div>
    <div style="display:flex;gap:10px">
      <a href="https://wa.me/${o.whatsapp}" target="_blank" class="btn btn-sage" style="flex:1;text-align:center">💬 Enviar comprovante</a>
      <button class="btn btn-ghost" onclick="closeModal()">Fechar</button>
    </div>`;
}

function copyPix(key) {
  navigator.clipboard.writeText(key).then(() => {
    showToast('Chave Pix copiada! ✅', 'success');
  }).catch(() => {
    showToast('Chave: ' + key, '');
  });
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal')) {
    document.getElementById('modal').classList.remove('open');
  }
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

renderOngs();
