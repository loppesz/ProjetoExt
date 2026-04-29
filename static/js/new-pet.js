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

  const btn=document.getElementById('submit-btn');
  btn.disabled=true;btn.textContent='Cadastrando...';
  setTimeout(()=>{
    document.getElementById('form-wrap').style.display='none';
    document.getElementById('success-card').classList.add('show');
    window.scrollTo({top:0,behavior:'smooth'});
  }, 1500);
}

function resetForm(){
  selectedFiles=[];selectedSpecies='';
  document.getElementById('success-card').classList.remove('show');
  document.getElementById('form-wrap').style.display='block';
  document.getElementById('photo-previews').innerHTML='';
  document.querySelectorAll('.form-input,.form-textarea').forEach(el=>el.value='');
  document.querySelectorAll('.form-check input').forEach(el=>el.checked=false);
  document.querySelectorAll('.species-opt').forEach(el=>el.classList.remove('selected'));
  document.getElementById('submit-btn').disabled=false;
  document.getElementById('submit-btn').textContent='🐾 Cadastrar pet para adoção';
}
