let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let editandoServico = null;

function exibirClientes(listaClientes = clientes) {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  listaClientes.forEach((cliente, index) => {
    const clienteDiv = document.createElement("div");
    clienteDiv.classList.add("cliente");

    const header = document.createElement("div");
    header.classList.add("cliente-header");

    const nomeSpan = document.createElement("span");
    nomeSpan.textContent = cliente.nome;

    const acoesDiv = document.createElement("div");
    acoesDiv.classList.add("cliente-acoes");

    const btnEditar = document.createElement("button");
    btnEditar.classList.add("editar");
    btnEditar.textContent = "Editar";
    btnEditar.onclick = () => editarCliente(index);

    const btnExcluir = document.createElement("button");
    btnExcluir.classList.add("excluir");
    btnExcluir.textContent = "Excluir";
    btnExcluir.onclick = () => excluirCliente(index);

    acoesDiv.appendChild(btnEditar);
    acoesDiv.appendChild(btnExcluir);

    header.appendChild(nomeSpan);
    header.appendChild(acoesDiv);

    const detalhes = document.createElement("div");
    detalhes.classList.add("cliente-detalhes");
    detalhes.style.display = "none";

    header.addEventListener("click", () => {
      detalhes.style.display = detalhes.style.display === "block" ? "none" : "block";
    });

    detalhes.innerHTML = `
      <p><strong>CPF:</strong> ${cliente.cpf}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>
      <p><strong>Telefone:</strong> ${cliente.telefone}</p>
      <p><strong>Endereço:</strong> ${cliente.endereco}</p>

      <div class="adicionar-servico">
        <button onclick="mostrarFormularioServico(${index})" id="btn-mostrar-servico-${index}">+ Adicionar Serviço</button>
        <form onsubmit="adicionarServico(event, ${index})" id="form-servico-${index}" style="display: none; margin-top: 10px;">
          <input type="text" name="nome" placeholder="Nome do serviço" required />
          <input type="date" name="data" required />
          <input type="number" name="valor" placeholder="Valor (R$)" required />
          <button type="submit">Adicionar</button>
        </form>
      </div>

      <div id="tabela-servicos-${index}">
        ${gerarTabelaServicos(cliente.servicos || [], index)}
      </div>
    `;

    clienteDiv.appendChild(header);
    clienteDiv.appendChild(detalhes);
    lista.appendChild(clienteDiv);
  });
}

function mostrarFormularioServico(index) {
  const form = document.getElementById(`form-servico-${index}`);
  const botao = document.getElementById(`btn-mostrar-servico-${index}`);
  const visivel = form.style.display === "block";

  form.style.display = visivel ? "none" : "block";
  botao.textContent = visivel ? "+ Adicionar Serviço" : "Cancelar";
}

function gerarTabelaServicos(servicos, clienteIndex) {
  if (!servicos || servicos.length === 0) {
    return "<p style='margin-top: 10px;'>Nenhum serviço cadastrado.</p>";
  }

  const linhas = servicos.map((servico, servicoIndex) => `
    <tr>
      <td>${servico.nome}</td>
      <td>${servico.data}</td>
      <td>R$ ${parseFloat(servico.valor).toFixed(2)}</td>
      <td>
        <button class="editar" onclick="editarServico(${clienteIndex}, ${servicoIndex})">Editar</button>
        <button class="remover-servico" onclick="removerServico(${clienteIndex}, ${servicoIndex})">Remover</button>
      </td>
    </tr>
  `).join("");

  return `
    <table class="tabela-servicos">
      <thead>
        <tr><th>Serviço</th><th>Data</th><th>Valor</th><th>Ações</th></tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function adicionarServico(event, index) {
  event.preventDefault();
  const form = event.target;
  const { nome, data, valor } = form;

  const novoServico = {
    nome: nome.value,
    data: data.value,
    valor: valor.value
  };

  if (editandoServico && editandoServico.indexCliente === index) {
    clientes[index].servicos[editandoServico.indexServico] = novoServico;
    editandoServico = null;
    form.querySelector("button[type=submit]").textContent = "Adicionar";
  } else {
    if (!clientes[index].servicos) {
      clientes[index].servicos = [];
    }
    clientes[index].servicos.push(novoServico);
  }

  localStorage.setItem("clientes", JSON.stringify(clientes));
  form.reset();
  form.style.display = "none";
  document.getElementById(`btn-mostrar-servico-${index}`).textContent = "+ Adicionar Serviço";
  exibirClientes();
}

function editarServico(indexCliente, indexServico) {
  const cliente = clientes[indexCliente];
  const servico = cliente.servicos[indexServico];
  const form = document.getElementById(`form-servico-${indexCliente}`);

  form.nome.value = servico.nome;
  form.data.value = servico.data;
  form.valor.value = servico.valor;

  form.style.display = "block";
  document.getElementById(`btn-mostrar-servico-${indexCliente}`).textContent = "Cancelar";
  form.querySelector("button[type=submit]").textContent = "Salvar";
  editandoServico = { indexCliente, indexServico };
}

function removerServico(clienteIndex, servicoIndex) {
  clientes[clienteIndex].servicos.splice(servicoIndex, 1);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  exibirClientes();
}

function abrirModal() {
  document.getElementById("modalCliente").style.display = "block";
}

function fecharModal() {
  document.getElementById("modalCliente").style.display = "none";
  document.getElementById("formCadastroCliente").reset();
  document.getElementById("formCadastroCliente").onsubmit = cadastrarCliente;
}

function cadastrarCliente(event) {
  event.preventDefault();

  const novoCliente = {
    nome: document.getElementById("nomeCliente").value,
    cpf: document.getElementById("cpfCliente").value,
    email: document.getElementById("emailCliente").value,
    telefone: document.getElementById("telefoneCliente").value,
    endereco: document.getElementById("enderecoCliente").value,
    servicos: []
  };

  clientes.push(novoCliente);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  fecharModal();
  exibirClientes();
}

function excluirCliente(index) {
  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    clientes.splice(index, 1);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    exibirClientes();
  }
}

function filtrarClientes() {
  const termo = document.querySelector(".pesquisa").value.toLowerCase();
  const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(termo));
  exibirClientes(clientesFiltrados);
}

function editarCliente(index) {
  const cliente = clientes[index];

  document.getElementById("nomeCliente").value = cliente.nome;
  document.getElementById("cpfCliente").value = cliente.cpf;
  document.getElementById("emailCliente").value = cliente.email;
  document.getElementById("telefoneCliente").value = cliente.telefone;
  document.getElementById("enderecoCliente").value = cliente.endereco;

  abrirModal();

  const form = document.getElementById("formCadastroCliente");
  form.onsubmit = function (event) {
    event.preventDefault();

    cliente.nome = document.getElementById("nomeCliente").value;
    cliente.cpf = document.getElementById("cpfCliente").value;
    cliente.email = document.getElementById("emailCliente").value;
    cliente.telefone = document.getElementById("telefoneCliente").value;
    cliente.endereco = document.getElementById("enderecoCliente").value;

    clientes[index] = cliente;
    localStorage.setItem("clientes", JSON.stringify(clientes));
    fecharModal();
    exibirClientes();
  };
}

window.onload = () => {
  document.getElementById("formCadastroCliente").onsubmit = cadastrarCliente;
  exibirClientes();
};
