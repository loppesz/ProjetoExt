function checkStrength(v){
  const bar = document.getElementById('strength-bar');
  let score = 0;
  if(v.length>=6) score++;
  if(v.length>=10) score++;
  if(/[A-Z]/.test(v)) score++;
  if(/[0-9]/.test(v)) score++;
  if(/[^a-zA-Z0-9]/.test(v)) score++;
  const w = [0,25,45,65,85,100][score];
  const c = ['','#e74c3c','#e67e22','#f39c12','#27ae60','#1abc9c'][score];
  bar.style.width=w+'%';bar.style.background=c;
}

function showErr(id, msg){
  const el=document.getElementById(id);el.textContent=msg;el.classList.add('show');
}
function hideErr(id){document.getElementById(id).classList.remove('show');}

function nextStep(){
  hideErr('err1');
  const name=document.getElementById('name').value.trim();
  const email=document.getElementById('email').value.trim();
  const pwd=document.getElementById('password').value;
  const cpwd=document.getElementById('confirm-pwd').value;
  if(!name){showErr('err1','⚠️ Digite seu nome.');return;}
  if(!email||!email.includes('@')){showErr('err1','⚠️ E-mail inválido.');return;}
  if(pwd.length<6){showErr('err1','⚠️ Senha deve ter no mínimo 6 caracteres.');return;}
  if(pwd!==cpwd){showErr('err1','⚠️ As senhas não coincidem.');return;}
  document.getElementById('step1').style.display='none';
  document.getElementById('step2').style.display='block';
  // Update progress
  document.getElementById('s1').className='step-circle done';document.getElementById('s1').textContent='✓';
  document.getElementById('l1').classList.add('done');
  document.getElementById('s2').className='step-circle active';
}

function prevStep(){
  document.getElementById('step2').style.display='none';
  document.getElementById('step1').style.display='block';
  document.getElementById('s1').className='step-circle active';document.getElementById('s1').textContent='1';
  document.getElementById('l1').classList.remove('done');
  document.getElementById('s2').className='step-circle';
}

function submitForm(){
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Criando conta...';

  const role = document.getElementById('user-role') ? document.getElementById('user-role').value : 'user';
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', document.getElementById('password').value);
  formData.append('confirm', document.getElementById('confirm-pwd').value);
  formData.append('phone', document.getElementById('phone').value.trim());
  formData.append('city', document.getElementById('city').value.trim());
  formData.append('state', document.getElementById('state').value);
  formData.append('role', role);

  if (role === 'ong') {
    formData.append('ong_nome', document.getElementById('ong-nome') ? document.getElementById('ong-nome').value.trim() : '');
    formData.append('ong_desc', document.getElementById('ong-desc') ? document.getElementById('ong-desc').value.trim() : '');
    formData.append('ong_desc_full', document.getElementById('ong-desc-full') ? document.getElementById('ong-desc-full').value.trim() : '');
    const ongFoto = document.getElementById('ong-foto');
    if (ongFoto && ongFoto.files.length > 0) {
      formData.append('ong_foto', ongFoto.files[0]);
    }
  }

  fetch('/register', {
    method: 'POST',
    body: formData
  })
  .then(async response => {
    const body = await response.json();
    if (!response.ok) {
      showErr('err2', body.message || 'Não foi possível criar a conta.');
      btn.disabled = false;
      btn.textContent = 'Criar minha conta!';
      return;
    }

    // Salvar no localStorage para os scripts de interface estática reconhecerem o usuário
    localStorage.setItem('petadopt_user', JSON.stringify({
      name: name,
      email: email,
      role: role
    }));

    // Após cadastro bem sucedido: redirecionar pra /dashboard-ong se ONG, senão comportamento atual
    if (role === 'ong') {
      window.location.href = '/dashboard-ong';
    } else {
      document.getElementById('step2').style.display='none';
      document.getElementById('step3').style.display='block';
      document.getElementById('l2').classList.add('done');
      document.getElementById('s3').className='step-circle done';
    }
  })
  .catch(() => {
    showErr('err2', 'Erro de conexão. Tente novamente.');
    btn.disabled = false;
    btn.textContent = 'Criar minha conta!';
  });
}
