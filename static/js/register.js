document.addEventListener('DOMContentLoaded', () => {
  let roleSelect = document.getElementById('user-role');
  
  // Tenta encontrar o seletor de "Tipo de Conta" caso o ID tenha mudado no HTML
  if (!roleSelect) {
    document.querySelectorAll('select').forEach(sel => {
      if (Array.from(sel.options).some(opt => opt.value.toLowerCase() === 'ong')) {
        roleSelect = sel;
      }
    });
  }

  if (roleSelect) {
    const toggleOngFields = () => {
      const isOng = roleSelect.value.toLowerCase() === 'ong';
      
      // Ocultar automaticamente qualquer campo que tenha termos relacionados a ONG/Projeto
      document.querySelectorAll('label').forEach(label => {
        const txt = label.textContent.toLowerCase();
        const isOngField = txt.includes('ong') || txt.includes('projeto') || txt.includes('foto') || txt.includes('história') || txt.includes('historia') || txt.includes('descriç');
        
        if (isOngField) {
          const container = label.closest('.form-group') || label.parentElement;
          if (container && container.tagName !== 'FORM') {
            container.style.display = isOng ? 'block' : 'none';
            
            // Tira a validação obrigatória se o campo estiver invisível (para não travar o cadastro do usuário comum)
            container.querySelectorAll('input, textarea').forEach(input => {
              if (!isOng) input.removeAttribute('required');
            });
          }
        }
      });
    };
    roleSelect.addEventListener('change', toggleOngFields);
    toggleOngFields(); // Roda a checagem no estado inicial da página
  }
});

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

  let roleSelect = document.getElementById('user-role');
  if (!roleSelect) {
    document.querySelectorAll('select').forEach(sel => {
      if (Array.from(sel.options).some(opt => opt.value.toLowerCase() === 'ong')) {
        roleSelect = sel;
      }
    });
  }
  const role = roleSelect ? roleSelect.value.toLowerCase() : 'user';
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';

  if (!phone) {
    showErr('err2', '⚠️ O número de WhatsApp/Telefone é obrigatório para o contato de adoção.');
    btn.disabled = false;
    btn.textContent = 'Criar minha conta!';
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', document.getElementById('password').value);
  formData.append('confirm', document.getElementById('confirm-pwd').value);
  formData.append('phone', phone);
  formData.append('city', document.getElementById('city').value.trim());
  formData.append('state', document.getElementById('state').value);
  formData.append('role', role);

  if (role === 'ong') {
    // Pega as descrições extras de forma inteligente se não achar pelo ID
    let ongNome = document.getElementById('ong-nome') ? document.getElementById('ong-nome').value.trim() : '';
    let ongDesc = document.getElementById('ong-desc') ? document.getElementById('ong-desc').value.trim() : '';
    let ongDescFull = document.getElementById('ong-desc-full') ? document.getElementById('ong-desc-full').value.trim() : '';
    
    if (!ongNome || !ongDesc) {
      document.querySelectorAll('label').forEach(label => {
        const txt = label.textContent.toLowerCase();
        const input = label.parentElement.querySelector('input, textarea');
        if (input) {
          if (!ongNome && (txt.includes('nome') && (txt.includes('ong') || txt.includes('projeto')))) ongNome = input.value.trim();
          if (!ongDesc && txt.includes('curta')) ongDesc = input.value.trim();
          if (!ongDescFull && txt.includes('hist')) ongDescFull = input.value.trim();
        }
      });
    }
    formData.append('ong_nome', ongNome);
    formData.append('ong_desc', ongDesc);
    formData.append('ong_desc_full', ongDescFull);

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
