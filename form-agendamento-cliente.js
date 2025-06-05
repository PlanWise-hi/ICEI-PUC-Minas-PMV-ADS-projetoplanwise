document.addEventListener('DOMContentLoaded', function () {
    let usuario = localStorage.getItem('usuario_id');
    if (!usuario) {
        usuario = '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('usuario_id', usuario);
    }

    function getAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos_' + usuario)) || [];
    }
    function setAgendamentos(arr) {
        localStorage.setItem('agendamentos_' + usuario, JSON.stringify(arr));
    }
    function gerarId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    function getServicosCadastrados() {
        return JSON.parse(localStorage.getItem('servicos')) || [];
    }
    function getAgendamentosEmpresa() {
        return JSON.parse(localStorage.getItem('agendamentos_empresa')) || [];
    }

    // Preencher select de serviços
    const selectServico = document.getElementById('servicoCliente');
    function atualizarSelectServicos() {
        const servicos = getServicosCadastrados();
        const valorAtual = selectServico.value;
        selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome;
            option.textContent = servico.nome + (servico.duracao ? ` (${servico.duracao} min)` : '');
            option.setAttribute('data-duracao', servico.duracao || 30);
            selectServico.appendChild(option);
        });
        selectServico.value = valorAtual;
    }
    atualizarSelectServicos();

    // Filtrar horários disponíveis
    function gerarHorariosDia() {
        const horarios = [];
        for (let h = 8; h < 18; h++) {
            horarios.push(`${h.toString().padStart(2, '0')}:00`);
            horarios.push(`${h.toString().padStart(2, '0')}:30`);
        }
        return horarios;
    }

    function carregarHorariosDisponiveis(dataSelecionada, servicoSelecionado) {
        const horarios = gerarHorariosDia();
        const eventos = getAgendamentosEmpresa().filter(ev => ev.data === dataSelecionada);
        const servicos = getServicosCadastrados();
        const duracaoServico = servicos.find(s => s.nome === servicoSelecionado)?.duracao || 30;

        const horariosDisponiveis = horarios.filter(hora => {
            const inicioNovo = new Date(`${dataSelecionada}T${hora}`);
            const fimNovo = new Date(inicioNovo.getTime() + duracaoServico * 60000);

            return !eventos.some(ev => {
                const duracaoEv = servicos.find(s => s.nome === ev.servico)?.duracao || 30;
                const inicioEv = new Date(`${ev.data}T${ev.hora}`);
                const fimEv = new Date(inicioEv.getTime() + duracaoEv * 60000);
                return (inicioNovo < fimEv && fimNovo > inicioEv);
            });
        });

        const selectHora = document.getElementById('hora');
        selectHora.innerHTML = '<option value="">Selecione</option>';
        horariosDisponiveis.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h;
            opt.textContent = h;
            selectHora.appendChild(opt);
        });
    }

    document.getElementById('data').addEventListener('change', function () {
        const data = this.value;
        const servico = document.getElementById('servicoCliente').value;
        if (data && servico) carregarHorariosDisponiveis(data, servico);
    });
    document.getElementById('servicoCliente').addEventListener('change', function () {
        const servico = this.value;
        const data = document.getElementById('data').value;
        if (data && servico) carregarHorariosDisponiveis(data, servico);
    });

    // FORMULÁRIO DE AGENDAMENTO
    document.getElementById('formAgendamento').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const descricao = document.getElementById('servicoCliente').value;

        if (!nome || !data || !descricao || !hora) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const hoje = new Date();
        const dataSelecionada = new Date(data + 'T' + hora);
        hoje.setHours(0, 0, 0, 0);
        if (dataSelecionada < hoje) {
            alert('Não é possível agendar para datas passadas.');
            return;
        }

        const servicos = getServicosCadastrados();
        const servicoSelecionado = servicos.find(s => s.nome === descricao);
        const duracao = servicoSelecionado ? parseInt(servicoSelecionado.duracao) : 30;

        const inicioNovo = new Date(`${data}T${hora}`);
        const fimNovo = new Date(inicioNovo.getTime() + duracao * 60000);

        const eventosEmpresa = getAgendamentosEmpresa();
        const conflito = eventosEmpresa.some(ev => {
            if (ev.data !== data) return false;
            const servicoEv = servicos.find(s => s.nome === ev.servico);
            const duracaoEv = servicoEv ? parseInt(servicoEv.duracao) : 30;
            const inicioEv = new Date(`${ev.data}T${ev.hora}`);
            const fimEv = new Date(inicioEv.getTime() + duracaoEv * 60000);
            return (inicioNovo < fimEv && fimNovo > inicioEv);
        });

        if (conflito) {
            alert('Este horário já está ocupado.');
            return;
        }

        const evento = {
            id: gerarId(),
            nome,
            data,
            hora,
            servico: descricao
        };

        // Salvar no localStorage do cliente
        const eventosSalvos = getAgendamentos();
        eventosSalvos.push(evento);
        setAgendamentos(eventosSalvos);

        // Salvar também no localStorage da empresa
        eventosEmpresa.push(evento);
        localStorage.setItem('agendamentos_empresa', JSON.stringify(eventosEmpresa));

        document.getElementById('mensagemSucesso').classList.remove('d-none');
        this.reset();

        setTimeout(() => {
            document.getElementById('mensagemSucesso').classList.add('d-none');
        }, 3000);
    });

    // Gerar link para cliente
    const btnGerarLink = document.getElementById('btnGerarLink');
    if (btnGerarLink) {
        btnGerarLink.addEventListener('click', function () {
            const link = `${window.location.origin}${window.location.pathname}?usuario=${encodeURIComponent(usuario)}`;
            const input = document.getElementById('linkCliente');
            input.value = link;
            input.select();
            navigator.clipboard.writeText(link);
            this.textContent = 'Link copiado!';
            setTimeout(() => { this.textContent = 'Gerar link de agendamento do cliente'; }, 2000);
        });
    }
});
