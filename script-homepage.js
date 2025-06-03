function sair() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}




const nome = localStorage.getItem("username");
if (nome) {
  document.querySelector(".logo-nav").textContent = `Bem-vindo(a), ${nome}!`;
}


  
