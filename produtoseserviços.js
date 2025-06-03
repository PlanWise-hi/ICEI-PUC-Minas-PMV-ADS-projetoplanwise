document.addEventListener('DOMContentLoaded', function () {
    // --- PRODUTOS ---
    const produtosKey = 'produtos';
    const produtosLista = document.getElementById('produtos-lista');
    let produtos = JSON.parse(localStorage.getItem(produtosKey)) || [];
    let editandoProduto = null;

    function renderProdutos() {
        produtosLista.innerHTML = '';
        if (produtos.length === 0) {
            produtosLista.innerHTML = `<tr><td colspan="6" id="produtos-vazio">Nenhum produto cadastrado.</td></tr>`;
            return;
        }
        produtos.forEach((produto, idx) => {
            produtosLista.innerHTML += `
                <tr>
                    <td>${produto.nome}</td>
                    <td>${produto.quantidade}</td>
                    <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                    <td>R$ ${parseFloat(produto.custo).toFixed(2)}</td>
                    <td>${produto.tipo}</td>
                    <td>
                        <button class="btn btn-sm btn-warning btn-alterar-produto" data-idx="${idx}">Alterar</button>
                        <button class="btn btn-sm btn-danger btn-excluir-produto ms-1" data-idx="${idx}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        // Excluir produto
        produtosLista.querySelectorAll('.btn-excluir-produto').forEach(btn => {
            btn.onclick = function () {
                const idx = parseInt(this.getAttribute('data-idx'));
                if (confirm('Deseja excluir este produto?')) {
                    produtos.splice(idx, 1);
                    localStorage.setItem(produtosKey, JSON.stringify(produtos));
                    renderProdutos();
                }
            };
        });

        // Alterar produto
        produtosLista.querySelectorAll('.btn-alterar-produto').forEach(btn => {
            btn.onclick = function () {
                const idx = parseInt(this.getAttribute('data-idx'));
                const produto = produtos[idx];
                document.getElementById('nomeProduto').value = produto.nome;
                document.getElementById('quantidadeProduto').value = produto.quantidade;
                document.getElementById('precoProduto').value = produto.preco;
                document.getElementById('custoProduto').value = produto.custo;
                document.getElementById('tipoProduto').value = produto.tipo;
                editandoProduto = idx;
                document.getElementById('btnProduto').textContent = 'Salvar Alteração';
            };
        });
    }

    document.getElementById('formProduto').addEventListener('submit', function (e) {
        e.preventDefault();
        const nome = document.getElementById('nomeProduto').value.trim();
        const quantidade = document.getElementById('quantidadeProduto').value;
        const preco = document.getElementById('precoProduto').value;
        const custo = document.getElementById('custoProduto').value;
        const tipo = document.getElementById('tipoProduto').value;
        if (!nome || !quantidade || !preco || !custo || !tipo) return;

        if (editandoProduto !== null) {
            produtos[editandoProduto] = { nome, quantidade, preco, custo, tipo };
            editandoProduto = null;
            document.getElementById('btnProduto').textContent = 'Cadastrar Produto';
        } else {
            produtos.push({ nome, quantidade, preco, custo, tipo });
        }
        localStorage.setItem(produtosKey, JSON.stringify(produtos));
        this.reset();
        renderProdutos();
    });

    document.getElementById('toggle-produtos').onclick = function () {
        const container = document.getElementById('produtos-container');
        container.style.display = container.style.display === 'none' ? '' : 'none';
    };

    renderProdutos();

    // --- SERVIÇOS ---
    function getServicos() {
        return JSON.parse(localStorage.getItem('servicos')) || [];
    }
    function setServicos(servicos) {
        localStorage.setItem('servicos', JSON.stringify(servicos));
    }
    function atualizarListaServicos() {
        const lista = document.getElementById('servicos-lista');
        lista.innerHTML = '';
        const servicos = getServicos();
        if (servicos.length === 0) {
            lista.innerHTML = `<tr><td colspan="5" id="servicos-vazio">Nenhum serviço cadastrado.</td></tr>`;
            return;
        }
        servicos.forEach((servico, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${servico.nome}</td>
                <td>R$ ${parseFloat(servico.preco).toFixed(2)}</td>
                <td>${servico.descricao}</td>
                <td>${servico.duracao || 30}</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-editar-servico" data-idx="${idx}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-excluir-servico" data-idx="${idx}">Excluir</button>
                </td>
            `;
            lista.appendChild(tr);
        });
    }

    document.getElementById('formServico').addEventListener('submit', function (e) {
        e.preventDefault();
        const nome = document.getElementById('nomeServico').value.trim();
        const preco = parseFloat(document.getElementById('precoServico').value);
        const descricao = document.getElementById('descricaoServico').value.trim();
        const duracao = parseInt(document.getElementById('duracaoServico').value);

        if (!nome || isNaN(preco) || !descricao || isNaN(duracao) || duracao < 1) {
            alert('Preencha todos os campos corretamente.');
            return;
        }

        const servicos = getServicos();
        // Não permitir nomes duplicados
        if (servicos.some(s => s.nome === nome)) {
            alert('Já existe um serviço com esse nome.');
            return;
        }

        servicos.push({ nome, preco, descricao, duracao });
        setServicos(servicos);
        this.reset();
        atualizarListaServicos();
    });

    // Editar serviço
    document.getElementById('servicos-lista').addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-editar-servico')) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            const servicos = getServicos();
            const servico = servicos[idx];
            document.getElementById('nomeServico').value = servico.nome;
            document.getElementById('precoServico').value = servico.preco;
            document.getElementById('descricaoServico').value = servico.descricao;
            document.getElementById('duracaoServico').value = servico.duracao || 30;
            // Remove o antigo ao salvar novamente
            servicos.splice(idx, 1);
            setServicos(servicos);
            atualizarListaServicos();
        }
        // Excluir serviço
        if (e.target.classList.contains('btn-excluir-servico')) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            if (confirm('Deseja excluir este serviço?')) {
                const servicos = getServicos();
                servicos.splice(idx, 1);
                setServicos(servicos);
                atualizarListaServicos();
            }
        }
    });

    // Mostrar/esconder lista de serviços
    document.getElementById('toggle-servicos').addEventListener('click', function () {
        const container = document.getElementById('servicos-container');
        if (container.style.display === 'none') {
            container.style.display = '';
            this.textContent = 'Mostrar/Esconder Serviços ▼';
        } else {
            container.style.display = 'none';
            this.textContent = 'Mostrar/Esconder Serviços ▲';
        }
    });

    atualizarListaServicos();
});
