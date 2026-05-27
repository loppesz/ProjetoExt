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
  fetch('/api/pets')
    .then(r => r.json())
    .then(data => {
      ALL_PETS = data.pets || [];
      render();
    })
    .catch(err => console.error('Erro ao carregar pets:', err));
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
  
  let adoptHtml = '';
  if (pet.status === 'available') {
    if (isAuth) {
      adoptHtml = `<div class="adopt-title">Pronto para um novo lar 🏠</div>
         <p class="adopt-note">Envie sua solicitação de adoção ou entre em contato diretamente pelo WhatsApp.</p>
         <button class="btn btn-primary btn-full btn-lg" onclick="openAdoptModal()">💌 Quero adotar ${pet.name}!</button>
         <a href="${waLink}" target="_blank" class="btn btn-ghost btn-full" style="margin-top:10px;background:#25d366;color:#fff">💬 Falar no WhatsApp</a>
         <div style="margin-top:10px">
           <button class="btn btn-ghost btn-full" onclick="toggleFav()" id="fav-btn">${favState ? '❤️ Nos favoritos!' : '🤍 Adicionar aos favoritos'}</button>
         </div>`;
    } else {
      adoptHtml = `<div class="adopt-title">Pronto para um novo lar 🏠</div>
         <p class="adopt-note">Para solicitar a adoção ou ver os contatos, você precisa estar logado.</p>
         <a href="/login" class="btn btn-primary btn-full btn-lg">Fazer login para adotar</a>
         <div style="margin-top:10px">
           <a href="/register" class="btn btn-ghost btn-full">Criar conta grátis</a>
         </div>`;
    }
  } else if (pet.status === 'adopted') {
    adoptHtml = `<div class="adopted-box">✅ ${pet.name} já foi adotado!<br><span style="font-size:.85rem;font-weight:400">Mas há outros pets esperando por você.</span></div>
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
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">💌 Solicitar adoção de ${currentPet.name}</div>
    <p class="modal-sub">Apresente-se ao responsável e diga por que você seria um lar ideal!</p>
    <label class="form-label">Sua mensagem <span style="color:var(--terra)">*</span></label>
    <textarea class="form-textarea" id="adopt-msg" placeholder="Fale sobre você, sua casa, família, experiência com animais e por que deseja adotar ${currentPet.name}..."></textarea>
    <div class="modal-actions">
      <button class="btn btn-primary" style="flex:1" onclick="confirmAdopt()">Enviar solicitação</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    </div>`;
  document.getElementById('modal').classList.add('open');
}

function confirmAdopt(){
  const msg = document.getElementById('adopt-msg').value.trim();
  if(!msg){showToast('Por favor, escreva uma mensagem!',''); return;}

  const btn = document.querySelector('#modal-content .btn-primary');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  fetch(`/api/pets/${currentPet.id}/solicitar`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ mensagem: msg })
  })
  .then(r => r.json())
  .then(data => {
    if(data.sucesso) {
      document.getElementById('modal-content').innerHTML = `
        <div class="success-modal">
          <div class="success-icon">🎉</div>
          <div class="success-title">Solicitação enviada!</div>
          <p class="success-sub">Sua mensagem foi enviada ao responsável. Aguarde o retorno — você receberá uma notificação quando a solicitação for analisada.</p>
          <button class="btn btn-primary" onclick="closeModal()">Entendido!</button>
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
