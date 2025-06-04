// Lista de clientes armazenada no localStorage
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

// Exibir clientes na tela
function exibirClientes() {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = ""; // limpa lista atual

  clientes.forEach((cliente, index) => {
    const clienteDiv = document.createElement("div");
    clienteDiv.classList.add("cliente");

    const headerBtn = document.createElement("button");
    headerBtn.classList.add("cliente-header");
    headerBtn.innerText = `${cliente.nome} ▼`;
    headerBtn.onclick = () => {
      detalhesDiv.style.display = detalhesDiv.style.display === "block" ? "none" : "block";
    };

    const detalhesDiv = document.createElement("div");
    detalhesDiv.classList.add("cliente-detalhes");
    detalhesDiv.innerHTML = `
      <table>
        <tr><th>CPF</th><th>Serviço</th><th>Observação</th></tr>
        <tr><td>${cliente.cpf}</td><td>${cliente.servico}</td><td>${cliente.observacoes}</td></tr>
      </table>
      <div style="margin-top: 10px;">
        <button onclick="editarCliente(${index})">Editar</button>
        <button onclick="excluirCliente(${index})">Excluir</button>
      </div>
    `;

    clienteDiv.appendChild(headerBtn);
    clienteDiv.appendChild(detalhesDiv);
    lista.appendChild(clienteDiv);
  });
}

// Abrir modal de cadastro
function abrirModal() {
  document.getElementById("modalCliente").style.display = "block";
}

// Fechar modal
function fecharModal() {
  document.getElementById("modalCliente").style.display = "none";
  document.getElementById("formCadastroCliente").reset();

  // Restaurar função padrão do formulário
  document.getElementById("formCadastroCliente").onsubmit = cadastrarCliente;
}

// Cadastrar novo cliente
function cadastrarCliente(event) {
  event.preventDefault();

  const novoCliente = {
    nome: document.getElementById("nomeCliente").value,
    cpf: document.getElementById("cpfCliente").value,
    email: document.getElementById("emailCliente").value,
    telefone: document.getElementById("telefoneCliente").value,
    endereco: document.getElementById("enderecoCliente").value,
    servico: document.getElementById("servicoCliente").value,
    observacoes: document.getElementById("observacoesCliente").value
  };

  clientes.push(novoCliente);
  localStorage.setItem("clientes", JSON.stringify(clientes));

  fecharModal();
  exibirClientes();
}

// Excluir cliente pelo índice
function excluirCliente(index) {
  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    clientes.splice(index, 1);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    exibirClientes();
  }
}

// Editar cliente
function editarCliente(index) {
  const cliente = clientes[index];

  // Preenche o formulário com os dados do cliente
  document.getElementById("nomeCliente").value = cliente.nome;
  document.getElementById("cpfCliente").value = cliente.cpf;
  document.getElementById("emailCliente").value = cliente.email;
  document.getElementById("telefoneCliente").value = cliente.telefone;
  document.getElementById("enderecoCliente").value = cliente.endereco;
  document.getElementById("servicoCliente").value = cliente.servico;
  document.getElementById("observacoesCliente").value = cliente.observacoes;

  abrirModal();

  // Substitui o comportamento do formulário para salvar edição
  const form = document.getElementById("formCadastroCliente");
  form.onsubmit = function (event) {
    event.preventDefault();

    const clienteEditado = {
      nome: document.getElementById("nomeCliente").value,
      cpf: document.getElementById("cpfCliente").value,
      email: document.getElementById("emailCliente").value,
      telefone: document.getElementById("telefoneCliente").value,
      endereco: document.getElementById("enderecoCliente").value,
      servico: document.getElementById("servicoCliente").value,
      observacoes: document.getElementById("observacoesCliente").value
    };

    clientes[index] = clienteEditado;
    localStorage.setItem("clientes", JSON.stringify(clientes));
    fecharModal();
    exibirClientes();
  };
}

// Inicializar a página
window.onload = () => {
  document.getElementById("formCadastroCliente").onsubmit = cadastrarCliente;
  exibirClientes();
};
