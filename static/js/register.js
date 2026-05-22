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

  const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirm: document.getElementById('confirm-pwd').value,
    phone: document.getElementById('phone').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value,
  };

  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(async response => {
    const body = await response.json();
    if (!response.ok) {
      showErr('err2', body.message || 'Não foi possível criar a conta.');
      btn.disabled = false;
      btn.textContent = 'Criar minha conta!';
      return;
    }
    document.getElementById('step2').style.display='none';
    document.getElementById('step3').style.display='block';
    document.getElementById('l2').classList.add('done');
    document.getElementById('s3').className='step-circle done';
  })
  .catch(() => {
    showErr('err2', 'Erro de conexão. Tente novamente.');
    btn.disabled = false;
    btn.textContent = 'Criar minha conta!';
  });
}
