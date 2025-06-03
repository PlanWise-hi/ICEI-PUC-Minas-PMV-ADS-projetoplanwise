document.getElementById('cadastroForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const pergunta = document.getElementById('pergunta').value;
    const resposta = document.getElementById('resposta').value.trim().toLowerCase();
  
    const senhaErro = document.getElementById('senhaErro');
    const senhaConfirmarErro = document.getElementById('senhaConfirmarErro');
    const emailErro = document.getElementById('emailError');
  
    senhaErro.textContent = '';
    senhaConfirmarErro.textContent = '';
    emailErro.textContent = '';
  
  
    const senhaForte = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    if (!senhaForte.test(senha)) {
      senhaErro.textContent = 'A senha deve ter no mínimo 8 caracteres, incluir um número e um caractere especial.';
      return;
    }
  
    if (senha !== confirmarSenha) {
      senhaConfirmarErro.textContent = 'As senhas não coincidem.';
      return;
    }


  
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.some(user => user.email === email)) {
      emailErro.textContent = 'Este e-mail já está cadastrado.';
      return;
    }
  
    const novoUsuario = {
      nome,
      email,
      senha,
      pergunta,
      resposta
    };
  
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  
    alert('Cadastro realizado com sucesso!');
    window.location.href = 'index.html';
  });
  
