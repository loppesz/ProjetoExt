function togglePwd(){
  const input = document.getElementById('password');
  const icon  = document.getElementById('pwd-icon');
  if(input.type==='password'){input.type='text';icon.textContent='🙈';}
  else{input.type='password';icon.textContent='👁️';}
}

function showError(msg){
  const el = document.getElementById('error-msg');
  document.getElementById('error-text').textContent = msg;
  el.classList.add('show');
}

function doLogin(){
  const email = document.getElementById('email').value.trim();
  const pwd   = document.getElementById('password').value;
  const btn   = document.getElementById('login-btn');
  document.getElementById('error-msg').classList.remove('show');

  if(!email||!pwd){showError('Preencha e-mail e senha.');return;}
  if(!email.includes('@')){showError('E-mail inválido.');return;}

  btn.disabled=true; btn.textContent='Entrando...';
  // Simula autenticação — admin@petadopt.com vira admin
  setTimeout(()=>{
    const role = email === 'admin@petadopt.com' ? 'admin' : 'user';
    const name = role === 'admin' ? 'Admin PetAdopt' : 'Usuário Demo';
    localStorage.setItem('petadopt_user', JSON.stringify({name, email, role}));
    location.href='dashboard.html';
  }, 1200);
}

document.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
