const ALL_PETS = [
  {id:'1',name:'Thor',species:'dog',breed:'Golden Retriever',age:'2 anos',ageN:2,months:0,size:'Grande',city:'São Paulo',state:'SP',status:'available',gender:'Macho',color:'Dourado',vaccinated:true,neutered:true,whatsapp:'5511999990001',desc:'Thor é um Golden Retriever carinhoso e extremamente brincalhão. Adora crianças, se dá bem com outros cães e gatos. Está vacinado, castrado e com microchip. Foi resgatado de uma situação de abandono e está pronto para dar amor incondicional a uma nova família.',photos:['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80','https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'],owner:'Ana Costa',ownerCity:'São Paulo/SP'},
  {id:'2',name:'Luna',species:'cat',breed:'Siamês',age:'1 ano e 6 meses',ageN:1,months:6,size:'Pequeno',city:'Rio de Janeiro',state:'RJ',status:'available',gender:'Fêmea',color:'Creme com pontas escuras',vaccinated:true,neutered:false,whatsapp:'5521999990002',desc:'Luna é elegante, independente e muito curiosa. Adora um carinho na hora certa e se dá bem com adultos e crianças maiores. Ideal para apartamento. Muito saudável e vacinada.',photos:['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80','https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80'],owner:'Carlos Lima',ownerCity:'Rio de Janeiro/RJ'},
  {id:'3',name:'Bob',species:'dog',breed:'SRD (Vira-lata)',age:'3 anos',ageN:3,months:0,size:'Médio',city:'Belo Horizonte',state:'MG',status:'available',gender:'Macho',color:'Caramelo',vaccinated:true,neutered:true,whatsapp:'5531999990003',desc:'Bob foi resgatado da rua e está completamente recuperado. É um cachorro muito dócil, obediente e que aprende comandos rápido. Adora passear e brincar. Vai se dar bem em casa ou apartamento com quintal.',photos:['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'],owner:'Pedro Souza',ownerCity:'Belo Horizonte/MG'},
  {id:'4',name:'Mia',species:'cat',breed:'Persa',age:'8 meses',ageN:0,months:8,size:'Pequeno',city:'Curitiba',state:'PR',status:'available',gender:'Fêmea',color:'Branco',vaccinated:true,neutered:false,whatsapp:'5541999990004',desc:'Mia é uma persa filhote cheia de amor para dar. Muito tranquila, adora colos e dormir no canto do sofá. Ideal para quem busca um companheiro calmo e carinhoso. Vacinada e vermifugada.',photos:['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80'],owner:'Juliana Alves',ownerCity:'Curitiba/PR'},
  {id:'5',name:'Rex',species:'dog',breed:'Pastor Alemão',age:'4 anos',ageN:4,months:0,size:'Grande',city:'Porto Alegre',state:'RS',status:'adopted',gender:'Macho',color:'Preto e marrom',vaccinated:true,neutered:true,whatsapp:'5551999990005',desc:'Rex foi adotado com sucesso! É um Pastor Alemão inteligente, fiel e protetor. Precisava de espaço e já encontrou seu lar ideal.',photos:['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80'],owner:'Bruno Farias',ownerCity:'Porto Alegre/RS'},
  {id:'6',name:'Nina',species:'dog',breed:'Poodle',age:'1 ano',ageN:1,months:0,size:'Pequeno',city:'São Paulo',state:'SP',status:'available',gender:'Fêmea',color:'Branco',vaccinated:false,neutered:false,whatsapp:'5511999990006',desc:'Nina é uma poodle cheia de energia, alegria e personalidade! Adora brincar e fazer graças. Ideal para famílias ativas que amam um cachorro animado. Ainda não vacinada, mas saudável.',photos:['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80'],owner:'Fernanda Rocha',ownerCity:'São Paulo/SP'},
  {id:'7',name:'Pipo',species:'bird',breed:'Calopsita',age:'2 anos',ageN:2,months:0,size:'Pequeno',city:'Florianópolis',state:'SC',status:'available',gender:'Macho',color:'Cinza e amarelo',vaccinated:false,neutered:false,whatsapp:'5548999990007',desc:'Pipo é uma calopsita muito sociável e falante. Já fala algumas palavras e adora música. Vai junto com a gaiola e todos os acessórios.',photos:['https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=800&q=80'],owner:'Mateus Santos',ownerCity:'Florianópolis/SC'},
  {id:'8',name:'Coco',species:'rabbit',breed:'Angorá',age:'6 meses',ageN:0,months:6,size:'Pequeno',city:'Recife',state:'PE',status:'reserved',gender:'Fêmea',color:'Branco e marrom',vaccinated:false,neutered:false,whatsapp:'5581999990008',desc:'Coco é um coelho Angorá lindo e muito dócil. Já está acostumado com o toque humano e adora carinho. Vai junto com casinhas e acessórios.',photos:['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80'],owner:'Beatriz Nunes',ownerCity:'Recife/PE'},
];

function getPetId(){
  const p = new URLSearchParams(location.search).get('id');
  return p || '1';
}

let currentPet = null;
let favState = false;

function render(){
  const id = getPetId();
  const pet = ALL_PETS.find(p=>p.id===id) || ALL_PETS[0];
  currentPet = pet;
  document.title = `${pet.name} — PetAdopt`;
  document.getElementById('bc-name').textContent = pet.name;

  const statusMap = {available:{label:'Disponível',cls:'chip-avail'},adopted:{label:'Adotado',cls:'chip-adopted'},reserved:{label:'Reservado',cls:'chip-reserved'}};
  const s = statusMap[pet.status];

  const photos = pet.photos;
  const mainPhoto = photos[0];

  const thumbsHtml = photos.length > 1 ? `<div class="gallery-thumbs">
    ${photos.map((u,i)=>`<div class="thumb ${i===0?'active':''}" onclick="setPhoto('${u}',this)"><img src="${u}" alt=""></div>`).join('')}
  </div>` : '';

  const tagsHtml = `
    <div class="tags">
      ${pet.species==='dog'?'<span class="tag">🐶 Cachorro</span>':pet.species==='cat'?'<span class="tag">🐱 Gato</span>':pet.species==='bird'?'<span class="tag">🦜 Pássaro</span>':'<span class="tag">🐾 Animal</span>'}
      ${pet.breed?`<span class="tag">🏷️ ${pet.breed}</span>`:''}
      <span class="tag">⏱ ${pet.age}</span>
      <span class="tag">📏 ${pet.size}</span>
      <span class="tag">${pet.gender==='Macho'?'♂️':'♀️'} ${pet.gender}</span>
      ${pet.color?`<span class="tag">🎨 ${pet.color}</span>`:''}
      ${pet.vaccinated?'<span class="tag tag-green">✅ Vacinado</span>':'<span class="tag">💉 Não vacinado</span>'}
      ${pet.neutered?'<span class="tag tag-green">✅ Castrado</span>':''}
    </div>`;

  const waMsg = encodeURIComponent(`Olá! Vi o ${pet.name} no PetAdopt e tenho interesse em adotar. Podemos conversar?`);
  const waLink = `https://wa.me/${pet.whatsapp}?text=${waMsg}`;

  const adoptHtml = pet.status==='available'
    ? `<div class="adopt-title">Pronto para um novo lar 🏠</div>
       <p class="adopt-note">Envie sua solicitação de adoção ou entre em contato diretamente pelo WhatsApp.</p>
       <button class="btn btn-primary btn-full btn-lg" onclick="openAdoptModal()">💌 Quero adotar ${pet.name}!</button>
       <a href="${waLink}" target="_blank" class="btn btn-ghost btn-full" style="margin-top:10px;background:#25d366;color:#fff">💬 Falar no WhatsApp</a>
       <div style="margin-top:10px">
         <button class="btn btn-ghost btn-full" onclick="toggleFav()" id="fav-btn">🤍 Adicionar aos favoritos</button>
       </div>`
    : pet.status==='adopted'
      ? `<div class="adopted-box">✅ ${pet.name} já foi adotado!<br><span style="font-size:.85rem;font-weight:400">Mas há outros pets esperando por você.</span></div>
         <div style="margin-top:12px"><a href="pets.html" class="btn btn-primary btn-full">Ver outros pets →</a></div>`
      : `<div class="adopted-box" style="background:#fff8e1;color:#b8860b">⏳ ${pet.name} está reservado.<br><span style="font-size:.85rem;font-weight:400">Outro adotante está em processo. Aguarde ou veja outros pets.</span></div>
         <div style="margin-top:12px"><a href="pets.html" class="btn btn-outline btn-full">Ver outros pets</a></div>`;

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
      <div class="pet-desc">${pet.desc}</div>
      <div class="adopt-box">
        <div class="owner-row">
          <div class="owner-avatar">🧑</div>
          <div>
            <div class="owner-name">${pet.owner}</div>
            <div class="owner-sub">📍 ${pet.ownerCity} · Responsável pelo pet</div>
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
    <article class="pet-card" onclick="location.href='pet.html?id=${p.id}'">
      <div class="card-img">
        <img src="${p.photos[0]}" alt="${p.name}" loading="lazy">
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
  document.getElementById('modal-content').innerHTML = `
    <div class="success-modal">
      <div class="success-icon">🎉</div>
      <div class="success-title">Solicitação enviada!</div>
      <p class="success-sub">Sua mensagem foi enviada para ${currentPet.owner}. Aguarde o retorno — você receberá uma notificação quando a solicitação for analisada.</p>
      <button class="btn btn-primary" onclick="closeModal()">Entendido!</button>
    </div>`;
}

function toggleFav(){
  favState = !favState;
  const btn = document.getElementById('fav-btn');
  if(btn){
    btn.textContent = favState ? '❤️ Nos favoritos!' : '🤍 Adicionar aos favoritos';
    showToast(favState?'Adicionado aos favoritos! ❤️':'Removido dos favoritos.', favState?'success':'');
  }
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

render();
