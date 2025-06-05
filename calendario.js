document.addEventListener('DOMContentLoaded', function () {
    let usuario = localStorage.getItem('usuario_id');
    if (!usuario) {
        usuario = '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('usuario_id', usuario);
    }

    let eventoEditandoId = null;

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
        const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
        return servicos;
    }

    // Preencher select de serviços
    const selectServico = document.getElementById('descricao');
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

    // Calendário
    const calendarEl = document.getElementById('calendario');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'pt-br',
        events: [],
        eventDisplay: 'block',
        displayEventTime: true,
        displayEventEnd: true,
        slotEventOverlap: false,
        eventDidMount: function(info) {
            info.el.setAttribute('title', info.event.title);
        },
        dateClick: function(info) {
            mostrarOverlayDoDia(info.dateStr);
        },
        eventClick: function(info) {
            mostrarOverlayDoDia(info.event.startStr.split('T')[0]);
        }
    });
    calendar.render();

    function atualizarCalendario() {
        calendar.removeAllEvents();
        const servicos = getServicosCadastrados();
        const eventos = getAgendamentos();
        
        eventos.forEach(evento => {
            const servico = servicos.find(s => s.nome === evento.servico);
            const duracao = servico && servico.duracao ? parseInt(servico.duracao) : 30;
            const start = `${evento.data}T${evento.hora}`;
            const endDate = new Date(new Date(start).getTime() + duracao * 60000);
            const end = endDate.toISOString().slice(0,16);
            
            calendar.addEvent({
                id: evento.id || gerarId(),
                title: `${evento.nome} - ${evento.servico} (${duracao}min)`,
                start: start,
                end: end,
                allDay: false,
                display: 'block',
                backgroundColor: '#1282A2',
                borderColor: '#1282A2',
                textColor: '#ffffff'
            });
        });
        
        calendar.render();
        atualizarSelectServicos();
    }

    function excluirAgendamento(id, dateStr) {
        let eventosSalvos = getAgendamentos();
        eventosSalvos = eventosSalvos.filter(ev => (ev.id || ev.nome + ev.data + ev.hora) !== id);
        setAgendamentos(eventosSalvos);
        atualizarCalendario();
        mostrarOverlayDoDia(dateStr);
    }

    function mostrarOverlayDoDia(dateStr) {
        document.querySelectorAll('.fc-dia-overlay').forEach(el => el.remove());
        const eventosDoDia = getAgendamentos().filter(ev => ev.data === dateStr);
        eventosDoDia.sort((a, b) => a.hora.localeCompare(b.hora));

        const overlay = document.createElement('div');
        overlay.className = 'fc-dia-overlay';
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('role', 'dialog');
        overlay.tabIndex = -1;
        overlay.style = `
            position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:9999;
            display:flex; align-items:center; justify-content:center;
        `;

        overlay.innerHTML = `
            <div class="fc-dia-overlay-content" style="background:#fff; border-radius:12px; padding:32px 24px; min-width:320px; max-width:90vw; max-height:80vh; overflow-y:auto; position:relative;" tabindex="0">
                <button class="fc-dia-fechar" aria-label="Fechar janela" style="position:absolute; top:12px; right:18px; background:none; border:none; font-size:2rem; color:#1282A2; cursor:pointer;">&times;</button>
                <h3>Agendamentos do dia ${dateStr.split('-').reverse().join('/')}</h3>
                <ul style="margin-top:18px; padding-left:0; list-style:none;">
                    ${
                        eventosDoDia.length > 0
                        ? eventosDoDia.map(ev => {
                            const hora = ev.hora;
                            const nome = ev.nome;
                            const servico = ev.servico;
                            const id = ev.id || (ev.nome + ev.data + ev.hora);
                            const servicoInfo = getServicosCadastrados().find(s => s.nome === servico);
                            const duracao = servicoInfo && servicoInfo.duracao ? servicoInfo.duracao : '30';
                            
                            return `<li class="mb-2" data-event-id="${id}">
                                <span class="badge bg-primary">${hora}</span> 
                                <strong>${nome}</strong> 
                                <span class="text-muted">${servico} (${duracao} min)</span>
                                <button class="btn btn-sm btn-warning btn-alterar ms-2" data-id="${id}" data-date="${dateStr}">Alterar</button>
                                <button class="btn btn-sm btn-danger btn-excluir ms-2" data-id="${id}" data-date="${dateStr}">Excluir</button>
                            </li>`;
                        }).join('')
                        : '<li>Nenhum agendamento neste dia.</li>'
                    }
                </ul>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.querySelector('.fc-dia-overlay-content').focus();

        overlay.querySelector('.fc-dia-fechar').onclick = () => overlay.remove();
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
        overlay.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.remove(); });

        // Botões de ação
        overlay.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const date = this.getAttribute('data-date');
                if (confirm('Deseja excluir este agendamento?')) {
                    overlay.remove();
                    excluirAgendamento(id, date);
                }
            };
        });

        overlay.querySelectorAll('.btn-alterar').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const eventos = getAgendamentos();
                const evento = eventos.find(ev => (ev.id || ev.nome + ev.data + ev.hora) === id);
                if (evento) {
                    document.getElementById('nome').value = evento.nome;
                    document.getElementById('data').value = evento.data;
                    document.getElementById('hora').value = evento.hora;
                    document.getElementById('descricao').value = evento.servico;
                    eventoEditandoId = id;
                    overlay.remove();
                }
            };
        });
    }

    document.getElementById('formAgendamento').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const descricao = document.getElementById('descricao').value;

        if (!nome || !data || !hora || !descricao) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const hoje = new Date();
        const dataSelecionada = new Date(`${data}T${hora}`);
        hoje.setHours(0,0,0,0);
        if (dataSelecionada < hoje) {
            alert('Não é possível agendar para datas passadas.');
            return;
        }

        const servicos = getServicosCadastrados();
        const servicoSelecionado = servicos.find(s => s.nome === descricao);
        
        if (!servicoSelecionado) {
            alert('Serviço não encontrado. Por favor, selecione um serviço válido.');
            return;
        }

        const duracao = servicoSelecionado.duracao ? parseInt(servicoSelecionado.duracao) : 30;
        const inicioNovo = new Date(`${data}T${hora}`);
        const fimNovo = new Date(inicioNovo.getTime() + duracao * 60000);

        let eventosSalvos = getAgendamentos();
        let conflito = eventosSalvos.some(ev => {
            if (eventoEditandoId && (ev.id || ev.nome + ev.data + ev.hora) === eventoEditandoId) return false;
            if (ev.data !== data) return false;

            const servicoEv = servicos.find(s => s.nome === ev.servico);
            const duracaoEv = servicoEv && servicoEv.duracao ? parseInt(servicoEv.duracao) : 30;
            const inicioEv = new Date(`${ev.data}T${ev.hora}`);
            const fimEv = new Date(inicioEv.getTime() + duracaoEv * 60000);

            return (inicioNovo < fimEv && fimNovo > inicioEv);
        });

        if (conflito) {
            alert('Já existe um agendamento para este horário.\nVerifique a duração do serviço e escolha outro horário.');
            return;
        }

        if (eventoEditandoId) {
            eventosSalvos = eventosSalvos.map(ev => {
                if ((ev.id || ev.nome + ev.data + ev.hora) === eventoEditandoId) {
                    return {
                        id: ev.id || eventoEditandoId,
                        nome,
                        data,
                        hora,
                        servico: descricao
                    };
                }
                return ev;
            });
            eventoEditandoId = null;
        } else {
            eventosSalvos.push({
                id: gerarId(),
                nome,
                data,
                hora,
                servico: descricao
            });
        }

        setAgendamentos(eventosSalvos);
        atualizarCalendario();

        document.getElementById('mensagemSucesso').classList.remove('d-none');
        this.reset();

        setTimeout(() => {
            document.getElementById('mensagemSucesso').classList.add('d-none');
        }, 3000);
    });

    if (document.getElementById('btnGerarLink')) {
        document.getElementById('btnGerarLink').addEventListener('click', function () {
            const link = `${window.location.origin}/planwiseTESTE/form-agendamento-cliente.html?usuario=${encodeURIComponent(usuario)}`;
            const input = document.getElementById('linkCliente');
            input.value = link;
            input.select();
            navigator.clipboard.writeText(link);
            this.textContent = 'Link copiado!';
            setTimeout(() => { this.textContent = 'Gerar link de agendamento do cliente'; }, 2000);
        });
    }

    atualizarCalendario();
});
