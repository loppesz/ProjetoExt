let ALL_PETS = [];

function getPetId(){
  const match = location.pathname.match(/\/pet\/(\d+)/);
  if (match) return parseInt(match[1]);
  const p = new URLSearchParams(location.search).get('id');
  return p ? parseInt(p) : 1;
}

let currentPet = null;
let favState = false;

document.addEventListener('DOMContentLoaded', () => {
  const id = getPetId();
  Promise.all([
    fetch(`/api/pets/${id}`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch('/api/pets').then(r => r.json())
  ]).then(([petData, listData]) => {
      ALL_PETS = listData.pets || [];
      if (petData && !ALL_PETS.find(p => p.id === petData.id)) {
        ALL_PETS.push(petData);
      }
      render();
  }).catch(err => console.error('Erro ao carregar pets:', err));
});

function render(){
  const id = getPetId();
  const pet = ALL_PETS.find(p=>p.id===id);
  
  if(!pet) {
    document.getElementById('detail-content').innerHTML = `
      <div style="text-align:center; padding: 60px 20px;">
        <div style="font-size: 3rem; margin-bottom: 15px;">🐾</div>
        <h2 style="font-family: var(--ff-display); color: var(--bark); margin-bottom: 10px;">Pet não encontrado</h2>
        <p style="color: var(--bark-m); margin-bottom: 20px;">Este pet pode ter sido removido ou está indisponível.</p>
        <a href="/pets" class="btn btn-primary">Ver outros pets disponíveis</a>
      </div>`;
    return;
  }
  
  currentPet = pet;
  favState = pet.fav;
  document.title = `${pet.name} — PetAdopt`;
  if(document.getElementById('bc-name')) document.getElementById('bc-name').textContent = pet.name;

  const statusMap = {available:{label:'Disponível',cls:'chip-avail'},adopted:{label:'Adotado',cls:'chip-adopted'},reserved:{label:'Reservado',cls:'chip-reserved'}};
  const s = statusMap[pet.status];

  const photos = [pet.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'];
  const mainPhoto = photos[0];

  const thumbsHtml = photos.length > 1 ? `<div class="gallery-thumbs">
    ${photos.map((u,i)=>`<div class="thumb ${i===0?'active':''}" onclick="setPhoto('${u}',this)"><img src="${u}" alt=""></div>`).join('')}
  </div>` : '';

  const tagsHtml = `
    <div class="tags">
      ${pet.species==='dog'?'<span class="tag">🐶 Cachorro</span>':'<span class="tag">🐱 Gato</span>'}
      ${pet.breed?`<span class="tag">🏷️ ${pet.breed}</span>`:''}
      <span class="tag">⏱ ${pet.age}</span>
      <span class="tag">📏 ${pet.sizeLabel || pet.size || 'Médio'}</span>
      ${pet.color?`<span class="tag">🎨 ${pet.color}</span>`:''}
    </div>`;

  const waMsg = encodeURIComponent(`Olá! Vi o ${pet.name} no PetAdopt e tenho interesse em adoção.`);
  const waLink = `https://wa.me/5511999999999?text=${waMsg}`;

  const authMeta = document.querySelector('meta[name="user-auth"]');
  let isAuth = authMeta ? authMeta.content === 'true' : false;
  
  // Recuperar informações do usuário do localStorage para verificar a role
  const storedUser = localStorage.getItem('petadopt_user');
  let userRole = 'user';
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      userRole = u.role;
      isAuth = true; // Se tem usuário armazenado, consideramos logado
    } catch(e) {}
  }

  let adoptHtml = '';
  if (pet.status === 'available') {
    if (isAuth) {
      if (userRole === 'ong') {
        adoptHtml = `<div class="adopt-title">Pronto para um novo lar 🏠</div>
           <p class="adopt-note">Contas de ONG não podem solicitar adoção de pets na plataforma. Essa funcionalidade é exclusiva para usuários comuns.</p>
           <div style="margin-top:10px">
             <button class="btn btn-ghost btn-full" onclick="toggleFav()" id="fav-btn">${favState ? '❤️ Nos favoritos!' : '🤍 Adicionar aos favoritos'}</button>
           </div>`;
      } else {
        adoptHtml = `<div class="adopt-title">Pronto para um novo lar 🏠</div>
           <p class="adopt-note">Envie sua solicitação de adoção ou entre em contato diretamente pelo WhatsApp.</p>
           <button class="btn btn-primary btn-full btn-lg" onclick="openAdoptModal()">💌 Quero adotar ${pet.name}!</button>
           <a href="${waLink}" target="_blank" class="btn btn-ghost btn-full" style="margin-top:10px;background:#25d366;color:#fff">💬 Falar no WhatsApp</a>
           <div style="margin-top:10px">
             <button class="btn btn-ghost btn-full" onclick="toggleFav()" id="fav-btn">${favState ? '❤️ Nos favoritos!' : '🤍 Adicionar aos favoritos'}</button>
           </div>`;
      }
    } else {
      adoptHtml = `<div class="adopt-title">Pronto para um novo lar 🏠</div>
         <p class="adopt-note">Para solicitar a adoção ou ver os contatos, você precisa estar logado.</p>
         <a href="/login" class="btn btn-primary btn-full btn-lg">Fazer login para adotar</a>
         <div style="margin-top:10px">
           <a href="/register" class="btn btn-ghost btn-full">Criar conta grátis</a>
         </div>`;
    }
  } else if (pet.status === 'adopted') {
    let adocaoDetalhes = '';
    if (pet.adocao) {
        adocaoDetalhes = `<div style="margin-top:8px; font-size:0.9rem; color:#065f46; background:#d1fae5; padding:8px 12px; border-radius:6px; border:1px solid #a7f3d0;">🏠 Adotado por <strong>${pet.adocao.solicitante}</strong> em ${pet.adocao.data}</div>`;
    }
    adoptHtml = `<div class="adopted-box">✅ ${pet.name} já foi adotado!${adocaoDetalhes}<br><span style="font-size:.85rem;font-weight:400; display:block; margin-top:8px;">Mas há outros pets esperando por você.</span></div>
       <div style="margin-top:12px"><a href="/pets" class="btn btn-primary btn-full">Ver outros pets →</a></div>`;
  } else {
    adoptHtml = `<div class="adopted-box" style="background:#fff8e1;color:#b8860b">⏳ ${pet.name} está reservado.<br><span style="font-size:.85rem;font-weight:400">Outro adotante está em processo. Aguarde ou veja outros pets.</span></div>
       <div style="margin-top:12px"><a href="/pets" class="btn btn-outline btn-full">Ver outros pets</a></div>`;
  }

  document.getElementById('detail-content').innerHTML = `
    <div class="gallery">
      <div class="gallery-main"><img src="${mainPhoto}" alt="${pet.name}" id="main-img"></div>
      ${thumbsHtml}
    </div>
    <div>
      <div class="pet-status-chip ${s.cls}">${s.label}</div>
      <h1 class="pet-name">${pet.name}</h1>
      <div class="pet-location">📍 ${pet.city}, ${pet.state}</div>
      ${tagsHtml}
      <div class="pet-desc">${pet.description || 'Um pet adorável à procura de um lar.'}</div>
      <div class="adopt-box">
        <div class="owner-row">
          <div class="owner-avatar">🧑</div>
          <div>
            <div class="owner-name">${pet.ownerName || 'Tutor Parceiro'}</div>
            <div class="owner-sub">📍 ${pet.city}/${pet.state} · Responsável pelo pet</div>
          </div>
        </div>
        ${adoptHtml}
      </div>
    </div>`;

  renderSimilar(pet);
  checkUserAdoptionStatus(pet);
}

function checkUserAdoptionStatus(pet) {
  const storedUser = localStorage.getItem('petadopt_user');
  if (!storedUser) return;
  try {
    const u = JSON.parse(storedUser);
    if (u.role !== 'user') return; // Apenas usuários comuns fazem adoção
  } catch(e) { return; }

  fetch('/api/user/adocoes')
    .then(r => r.json())
    .then(data => {
      if(data.adocoes) {
        const myReq = data.adocoes.find(a => a.petId === pet.id);
        if(myReq) {
          const container = document.querySelector('.adopt-box');
          if(!container) return;
          
          let statusText = myReq.status === 'approved' ? '✅ Pedido Aceito' : myReq.status === 'rejected' ? '❌ Não Aceito' : '⏳ Aguardando contato';
          let statusColor = myReq.status === 'approved' ? '#059669' : myReq.status === 'rejected' ? '#e74c3c' : '#d97706';
          let statusBg = myReq.status === 'approved' ? '#d1fae5' : myReq.status === 'rejected' ? '#fde8e8' : '#fef3c7';

          container.innerHTML = `
            <div class="owner-row">
              <div class="owner-avatar">🧑</div>
              <div>
                <div class="owner-name">${pet.ownerName || 'Tutor Parceiro'}</div>
                <div class="owner-sub">📍 ${pet.city}/${pet.state} · Responsável pelo pet</div>
              </div>
            </div>
            <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid ${statusColor}; padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.05); margin-top: 16px; margin-bottom: 12px;">
              <h3 style="color:var(--navy); margin-top:0; margin-bottom:12px; font-size:1.05rem;">Sua Solicitação</h3>
              <div style="display:inline-block; padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:700; background:${statusBg}; color:${statusColor}; margin-bottom:12px;">${statusText}</div>
              <p style="font-size:0.88rem; color:var(--bark-m); margin-bottom:16px;">Você já enviou um pedido para este pet. Acompanhe os detalhes e o contato no seu painel.</p>
              <a href="/dashboard#adoptions" class="btn btn-primary btn-full">📋 Acompanhar Pedido</a>
            </div>
            <div style="margin-top:10px">
              <button class="btn btn-ghost btn-full" onclick="toggleFav()" id="fav-btn">${favState ? '❤️ Nos favoritos!' : '🤍 Adicionar aos favoritos'}</button>
            </div>
          `;
        }
      }
    })
    .catch(e => console.error(e));
}

function setPhoto(url, thumb){
  document.getElementById('main-img').src = url;
  document.querySelectorAll('.thumb').forEach(t=>t.classList.remove('active'));
  thumb.classList.add('active');
}

function renderSimilar(pet){
  const similar = ALL_PETS.filter(p=>p.id!==pet.id && p.status!=='adopted').slice(0,3);
  document.getElementById('similar-grid').innerHTML = similar.map(p=>`
    <article class="pet-card" onclick="location.href='/pet/${p.id}'">
      <div class="card-img">
        <img src="${p.photo || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'}" alt="${p.name}" loading="lazy">
        <span class="card-badge">${p.status==='available'?'Disponível':'Reservado'}</span>
      </div>
      <div class="card-body">
        <div class="card-name">${p.name}</div>
        <div class="card-breed">${p.breed}</div>
        <div class="card-meta">⏱ ${p.age} · 📍 ${p.city}/${p.state}</div>
      </div>
    </article>`).join('');
}

function openAdoptModal(){
  const container = document.querySelector('.adopt-box');
  if(!container) return;

  container.innerHTML = `
    <div class="fade-in" style="margin-top:16px;">
      <h3 style="color:var(--navy); margin-top:0; margin-bottom:8px; font-size:1.15rem;">💌 Formulário de Adoção</h3>
      <p style="font-size:0.9rem; color:var(--muted); margin-bottom:16px;">Preencha este breve formulário para agilizar o processo.</p>

      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--blue); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
            <label class="form-label">Tipo de moradia <span style="color:var(--terra)">*</span></label>
            <select class="form-input" id="adopt-moradia">
              <option value="">Selecione</option>
              <option value="Casa (com quintal seguro)">Casa (com quintal seguro)</option>
              <option value="Casa (sem quintal)">Casa (sem quintal)</option>
              <option value="Apartamento (telado)">Apartamento (telado)</option>
              <option value="Apartamento (sem telas)">Apartamento (sem telas)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Outros pets? <span style="color:var(--terra)">*</span></label>
            <select class="form-input" id="adopt-outros">
              <option value="">Selecione</option>
              <option value="Nenhum">Nenhum</option>
              <option value="Sim, cães">Sim, cães</option>
              <option value="Sim, gatos">Sim, gatos</option>
              <option value="Sim, outros">Sim, outros</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:0">
          <label class="form-label">Onde o pet vai ficar? <span style="color:var(--terra)">*</span></label>
          <input type="text" class="form-input" id="adopt-rotina" placeholder="Ex: Dentro de casa, solto no quintal...">
        </div>
      </div>

      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--yellow); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
        <div style="margin-bottom:0">
          <label class="form-label">Por que você seria o lar ideal? <span style="color:var(--terra)">*</span></label>
          <textarea class="form-textarea" id="adopt-msg" rows="3" placeholder="Fale um pouco sobre você, sua família e sua rotina..."></textarea>
        </div>
      </div>

      <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid var(--navy); padding: 18px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); margin-bottom: 16px;">
        <div style="display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;">
          <div>
            <label class="form-label" style="margin-bottom:6px;">Telefone de Contato <span style="color:var(--terra)">*</span></label>
            <input type="tel" class="form-input" id="adopt-phone" placeholder="(11) 99999-9999">
          </div>
          <div style="padding-top:22px;">
            <label class="form-check" style="margin:0; display:flex; align-items:center; gap:6px;">
              <input type="checkbox" id="adopt-whats" checked>
              <span style="font-weight:600; font-size:0.85rem; color:var(--bark-m);">É WhatsApp?</span>
            </label>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <button class="btn btn-primary" style="flex:1" onclick="confirmAdopt()" id="btn-submit-adopt">Enviar solicitação</button>
        <button class="btn btn-ghost" onclick="location.reload()">Cancelar</button>
      </div>
    </div>
  `;
}

function confirmAdopt(){
  const moradia = document.getElementById('adopt-moradia').value;
  const outros = document.getElementById('adopt-outros').value;
  const rotina = document.getElementById('adopt-rotina').value.trim();
  const obs = document.getElementById('adopt-msg').value.trim();
  const phone = document.getElementById('adopt-phone').value.trim();
  const isWhats = document.getElementById('adopt-whats').checked ? 'Sim' : 'Não';

  if(!moradia || !outros || !rotina || !obs || !phone){
    showToast('Por favor, preencha todos os campos obrigatórios (*)', ''); 
    return;
  }

  const msgFormatada = `📞 Contato: ${phone} (WhatsApp: ${isWhats})\n🏠 Moradia: ${moradia}\n🐾 Outros pets: ${outros}\n🛋️ Ficará: ${rotina}\n\n💬 Mensagem: ${obs}`;

  const btn = document.getElementById('btn-submit-adopt');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  fetch(`/api/pets/${currentPet.id}/adopt`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ mensagem: msgFormatada })
  })
  .then(r => r.json())
  .then(data => {
    if(data.sucesso) {
      // Limpa os campos do formulário
      document.getElementById('adopt-moradia').value = '';
      document.getElementById('adopt-outros').value = '';
      document.getElementById('adopt-rotina').value = '';
      document.getElementById('adopt-msg').value = '';
      document.getElementById('adopt-phone').value = '';

      const textoZap = encodeURIComponent(`Olá! Tenho interesse em adotar o(a) ${currentPet.name}.\n\n*Meu Perfil:*\n${msgFormatada}`);
      const zapLink = data.whatsapp ? 
        `<a href="https://wa.me/${data.whatsapp.replace(/\D/g,'')}?text=${textoZap}" target="_blank" class="btn btn-whatsapp" style="margin-top:14px;background:#25d366;color:#fff;text-decoration:none;display:block;text-align:center;padding:12px;border-radius:var(--r-xl);font-weight:600;">💬 Enviar mensagem no WhatsApp</a>` 
        : '';
        
      const container = document.querySelector('.adopt-box');
      container.innerHTML = `
        <div style="background:#fff; border: 1px solid #e5e7eb; border-left: 4px solid #065f46; padding: 24px; border-radius: 12px; box-shadow: 0 4px 14px rgba(46, 134, 193, 0.08); text-align:center;">
          <div style="font-size:3rem; margin-bottom:12px;">🎉</div>
          <h3 style="color:var(--navy); margin-top:0; margin-bottom:8px; font-size:1.25rem;">Solicitação enviada!</h3>
          <p style="font-size:0.95rem; color:var(--muted); margin-bottom:20px;">${data.mensagem}</p>
          ${zapLink}
          <a href="/dashboard#adoptions" class="btn btn-outline" style="margin-top:10px; display:block; text-align:center; padding:12px; border-radius:12px; font-weight:600;">📋 Acompanhar Pedido no Painel</a>
        </div>`;
    } else {
      showToast(data.erro || 'Erro ao enviar solicitação.', '');
      btn.disabled = false;
      btn.textContent = 'Enviar solicitação';
    }
  })
  .catch(err => {
    showToast('Erro de conexão.', '');
    btn.disabled = false;
    btn.textContent = 'Enviar solicitação';
  });
}

function toggleFav(){
  fetch(`/api/pets/${currentPet.id}/favorite`, { method: 'POST' })
    .then(res => {
      if(res.redirected && res.url.includes('/login') || res.status === 401) {
        window.location.href = '/login';
        return null;
      }
      return res.json();
    })
    .then(data => {
      if(!data) return;
      favState = data.fav;
      currentPet.fav = data.fav;
      const btn = document.getElementById('fav-btn');
      if(btn){
        btn.textContent = favState ? '❤️ Nos favoritos!' : '🤍 Adicionar aos favoritos';
        showToast(favState ? 'Adicionado aos favoritos! ❤️' : 'Removido dos favoritos.', favState ? 'success' : '');
      }
    })
    .catch(e => console.error(e));
}

function closeModal(e){
  if(!e || e.target===document.getElementById('modal')){
    document.getElementById('modal').classList.remove('open');
  }
}

function showToast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast'+(type?' '+type:'');t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),3200);
}

window.setPhoto = setPhoto;
window.openAdoptModal = openAdoptModal;
window.confirmAdopt = confirmAdopt;
window.toggleFav = toggleFav;
window.closeModal = closeModal;
