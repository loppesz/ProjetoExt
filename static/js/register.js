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
  const btn=document.getElementById('submit-btn');
  btn.disabled=true;btn.textContent='Criando conta...';
  setTimeout(()=>{
    const name=document.getElementById('name').value.trim();
    const email=document.getElementById('email').value.trim();
    localStorage.setItem('petadopt_user', JSON.stringify({name,email,role:'user'}));
    document.getElementById('step2').style.display='none';
    document.getElementById('step3').style.display='block';
    document.getElementById('login-link').style.display='none';
    document.getElementById('l2').classList.add('done');
    document.getElementById('s3').className='step-circle done';
  }, 1400);
}
