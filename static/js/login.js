function togglePwd(){
  const input = document.getElementById('password');
  const icon  = document.getElementById('pwd-icon');
  if(input.type==='password'){input.type='text';icon.textContent='🙈';}
  else{input.type='password';icon.textContent='👁️';}
}

document.addEventListener('DOMContentLoaded', () => {
  // Garante que o estado de login "salvo" (mock) no frontend seja resetado ao abrir a tela de login
  localStorage.removeItem('petadopt_user');

  const form = document.querySelector('.auth-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault(); // Impede o envio padrão da página HTML
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('login-btn');
      
      btn.disabled = true;
      btn.textContent = 'Autenticando...';

      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) {
          const errorMsg = document.getElementById('error-msg');
          const errorText = document.getElementById('error-text');
          if (errorMsg && errorText) {
            errorText.textContent = body.message || 'Erro no login.';
            errorMsg.classList.add('show');
          } else {
            alert('⚠️ ' + (body.message || 'Erro no login.'));
          }
          btn.disabled = false;
          btn.textContent = 'Entrar';
          return;
        }
        
        // Atualiza o cache local para a interface estática
        localStorage.setItem('petadopt_user', JSON.stringify({
          name: body.name || 'Usuário',
          email: email,
          role: body.role
        }));
        
        // Sucesso! Redireciona com base no tipo de usuário
        if (body.role === 'admin') {
          window.location.href = '/dashboard'; // Admin vai pro painel
        } else if (body.role === 'ong') {
          window.location.href = '/dashboard-ong'; // ONG vai para o painel dedicado
        } else {
          window.location.href = '/'; // Usuário normal vai pra home navegar no site
        }
      })
      .catch(err => {
        console.error(err);
        alert('Erro de conexão com o servidor.');
        btn.disabled = false;
        btn.textContent = 'Entrar';
      });
    });
  }
});
