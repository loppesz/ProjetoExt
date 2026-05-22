function togglePwd(){
  const input = document.getElementById('senha');
  const icon  = document.getElementById('pwd-icon');
  if(input.type==='password'){input.type='text';icon.textContent='🙈';}
  else{input.type='password';icon.textContent='👁️';}
}

function doLogin(){
  const email = document.getElementById('email').value.trim();
  const pwd   = document.getElementById('senha').value;
  if(!email||!pwd){ return; }
  if(!email.includes('@')){ return; }
  document.getElementById('login-btn').disabled = true;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const form = document.querySelector('.auth-form');
    if (form) form.submit();
  }
});
