let selectedFiles = [];
let selectedSpecies = '';

function selectSpecies(s, el){
  selectedSpecies = s;
  document.getElementById('species').value = s;
  document.querySelectorAll('.species-opt').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected');
}

function previewPhotos(files){
  const previews = document.getElementById('photo-previews');
  Array.from(files).forEach(file=>{
    if(selectedFiles.length>=6) return;
    selectedFiles.push(file);
    const idx = selectedFiles.length-1;
    const reader = new FileReader();
    reader.onload = e=>{
      const div = document.createElement('div');
      div.className='preview-item';
      div.id=`prev-${idx}`;
      div.innerHTML=`<img src="${e.target.result}" alt="foto">
        ${idx===0?'<div class="preview-cover">Capa</div>':''}
        <div class="preview-remove" onclick="removePhoto(${idx})">✕</div>`;
      previews.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('photos-input').value='';
}

function handleDrop(e){
  e.preventDefault();
  document.getElementById('photo-drop').classList.remove('drag');
  previewPhotos(e.dataTransfer.files);
}

function removePhoto(idx){
  const el=document.getElementById(`prev-${idx}`);
  if(el) el.remove();
  selectedFiles.splice(idx,1);
}

function showError(msg){
  const el=document.getElementById('error-banner');
  el.textContent='⚠️ '+msg;
  el.classList.add('show');
  el.scrollIntoView({behavior:'smooth',block:'center'});
}

function submitPet(){
  document.getElementById('error-banner').classList.remove('show');
  const name=document.getElementById('name').value.trim();
  const size=document.getElementById('size').value;
  const city=document.getElementById('city').value.trim();
  const state=document.getElementById('state').value;

  if(!selectedSpecies){showError('Selecione o tipo de animal.');return;}
  if(!name){showError('Digite o nome do pet.');return;}
  if(!size){showError('Selecione o porte do pet.');return;}
  if(!city){showError('Digite a cidade.');return;}
  if(!state){showError('Selecione o estado.');return;}

  const formData = new FormData();
  formData.append('nome', name);
  formData.append('especie', selectedSpecies);
  formData.append('raca', document.getElementById('breed').value.trim());
  formData.append('porte', size);
  formData.append('sexo', document.getElementById('gender').value || 'unknown');
  formData.append('idade_anos', document.getElementById('age-years').value || 0);
  formData.append('idade_meses', document.getElementById('age-months').value || 0);
  formData.append('cor', document.getElementById('color').value.trim());
  formData.append('vacinado', document.getElementById('vaccinated').checked ? 1 : 0);
  formData.append('castrado', document.getElementById('neutered').checked ? 1 : 0);
  formData.append('descricao', document.getElementById('description').value.trim());
  formData.append('cidade', city);
  formData.append('estado', state);
  
  if(selectedFiles.length > 0){
    formData.append('foto_capa', selectedFiles[0]);
  }

  fetch('/api/pets', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.sucesso) {
      // Redireciona para o dashboard em caso de sucesso
      window.location.href = '/dashboard';
    } else {
      showError(data.erro || 'Erro ao cadastrar o pet.');
    }
  })
  .catch(err => {
    showError('Erro de conexão com o servidor. Tente novamente.');
    console.error('Erro:', err);
  });
}