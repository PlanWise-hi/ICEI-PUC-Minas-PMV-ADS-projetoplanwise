return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  function formatarValor(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
  




  function carregarTransacoes() {
    return JSON.parse(localStorage.getItem('transacoes')) || [];
  }
  
  function salvarTransacoes(transacoes) {
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
  }
  



  function atualizarInterface(transacoes = carregarTransacoes()) {
    const lista = document.getElementById('lista-transacoes');
    lista.innerHTML = '';
  
    let entrada = 0, saida = 0, aReceber = 0;
    const tipoLabel = {
      entrada: 'Entrada',
      saida: 'Saída',
      areceber: 'A Receber'
    };
  
    transacoes.forEach((t, index) => {
      const valor = parseFloat(t.valor);
      if (t.tipo === 'entrada') entrada += valor;
      else if (t.tipo === 'saida') saida += valor;
      else if (t.tipo === 'areceber') aReceber += valor;
  
      const item = document.createElement('div');
      item.classList.add('transacao');
      const classeValor = t.tipo === 'saida' ? 'negativo' : 'positivo';
  
      item.innerHTML = `
        <strong>${formatarData(t.data)}</strong>
        <p>${t.descricao}</p>
        <p>${tipoLabel[t.tipo] || t.tipo}</p>
        <p>Método: ${t.metodo || 'Não informado'}</p>
        <p><span class="${classeValor}">${formatarValor(valor)}</span></p>
        <div class="botoes-transacao">
          <button class="add-button" onclick="editarTransacao(${index})">Editar</button>
          <button class="excluir-button" onclick="excluirTransacao(${index})">Excluir</button>
        </div>
      `;
      lista.appendChild(item);
    });
  
    document.getElementById('entrada').textContent = formatarValor(entrada);
    document.getElementById('saida').textContent = formatarValor(saida);
    document.getElementById('saldo').textContent = formatarValor(entrada - saida);
  }




  function registrarDespesasFixasAte(ate) {
    const transacoes = carregarTransacoes();
    const fixas = transacoes.filter(t => t.fixa && t.diaFixo);
  
    const fim = new Date(ate);
    fim.setHours(23, 59, 59);
  
    fixas.forEach(fixa => {
      let dataAtual = new Date();
      dataAtual.setDate(1);
  
      while (dataAtual <= fim) {
        const dia = parseInt(fixa.diaFixo);
        const mes = dataAtual.getMonth();
        const ano = dataAtual.getFullYear();
  
        const dataDespesa = new Date(ano, mes, dia);
        if (dataDespesa > new Date() && dataDespesa <= fim) {
          const chave = `fixa-${fixa.descricao}-${mes}-${ano}`;
          if (!localStorage.getItem(chave)) {
            transacoes.push({
              data: dataDespesa.toISOString().split('T')[0],
              descricao: fixa.descricao,
              valor: fixa.valor,
              tipo: fixa.tipo,
              metodo: fixa.metodo,
              fixa: false
            });
            localStorage.setItem(chave, 'registrado');
          }
        }
  
        dataAtual.setMonth(dataAtual.getMonth() + 1);
      }
    });
  
    salvarTransacoes(transacoes);
  }
  



  function filtrarTransacoes(de, ate) {
    const transacoes = carregarTransacoes().filter(t => {
      const data = new Date(t.data);
      return data >= de && data <= ate;
    });
    atualizarInterface(transacoes);
  }
  



  let indexEditando = null;
  
  document.getElementById('form-transacao').addEventListener('submit', function (e) {
    e.preventDefault();
    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const tipo = document.getElementById('tipo').value;
    const metodo = document.getElementById('metodoPagamento').value;
    const fixa = document.getElementById('marcarFixa').checked;
    const diaFixo = document.getElementById('diaFixo').value;
  
    if (!data || !descricao || !valor || !tipo) {
      alert('Preencha todos os campos!');
      return;
    }
  
    const transacoes = carregarTransacoes();
    const novaTransacao = {
      data,
      descricao,
      valor,
      tipo,
      metodo,
      fixa,
      diaFixo: fixa ? parseInt(diaFixo) : null
    };
  
    if (indexEditando !== null) {
      transacoes[indexEditando] = novaTransacao;
      indexEditando = null;
    } else {
      transacoes.push(novaTransacao);
    }
  
    salvarTransacoes(transacoes);
    atualizarInterface();
    this.reset();
    document.getElementById('diaFixo').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
  });
  



  document.getElementById('abrir-modal').addEventListener('click', function () {
    indexEditando = null;
    document.getElementById('form-transacao').reset();
    document.getElementById('diaFixo').style.display = 'none';
    document.getElementById('modal').style.display = 'flex';
  });
  

  document.getElementById('fechar-modal').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
    indexEditando = null;
  });
  
 
  function editarTransacao(index) {
    const transacoes = carregarTransacoes();
    const t = transacoes[index];
    document.getElementById('data').value = t.data;
    document.getElementById('descricao').value = t.descricao;
    document.getElementById('valor').value = t.valor;
    document.getElementById('tipo').value = t.tipo;
    document.getElementById('metodoPagamento').value = t.metodo || '';
    document.getElementById('marcarFixa').checked = !!t.fixa;
    document.getElementById('diaFixo').value = t.diaFixo || '';
    document.getElementById('diaFixo').style.display = t.fixa ? 'block' : 'none';
    indexEditando = index;
    document.getElementById('modal').style.display = 'flex';
  }
  



  function excluirTransacao(index) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      const transacoes = carregarTransacoes();
      transacoes.splice(index, 1);
      salvarTransacoes(transacoes);
      atualizarInterface();
    }
  }




  document.getElementById('filtro').addEventListener('click', () => {
    const de = new Date(document.getElementById('filtro-de').value + 'T00:00:00');
    const ate = new Date(document.getElementById('filtro-ate').value + 'T23:59:59');
  
    if (isNaN(de) || isNaN(ate)) {
      alert('Selecione um intervalo de datas.');
      return;
    }
  
    registrarDespesasFixasAte(ate);
    filtrarTransacoes(de, ate);
  });
  



  document.getElementById('marcarFixa').addEventListener('change', function () {
    document.getElementById('diaFixo').style.display = this.checked ? 'block' : 'none';
  });
  



  atualizarInterface();
  
