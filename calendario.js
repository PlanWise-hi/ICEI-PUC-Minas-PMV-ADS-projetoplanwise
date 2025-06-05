document.addEventListener('DOMContentLoaded', function () {
    // Identificador único do usuário
    let usuario = localStorage.getItem('usuario_id');

// Verificar se há um ?usuario=ID na URL
const params = new URLSearchParams(window.location.search);
const idDaUrl = params.get('usuario');

// Se houver ID na URL, sobrescreve o localStorage
if (idDaUrl) {
    usuario = idDaUrl;
    localStorage.setItem('usuario_id', usuario);
}

// Se ainda não houver ID, cria um novo
if (!usuario) {
    usuario = '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('usuario_id', usuario);
}

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

    let eventoEditandoId = null;

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
        atualizarSelectServicos();
        calendar.removeAllEvents();
        getAgendamentos().forEach(evento => {
            if (evento.start) {
                calendar.addEvent(evento);
            } else {
                calendar.addEvent({
                    id: evento.id || gerarId(),
                    title: evento.nome,
                    start: `${evento.data}T${evento.hora}`,
                    servico: evento.servico
                });
            }
        });
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
        const eventosDoDia = getAgendamentos().filter(ev => {
            if (ev.start) {
                return ev.start.startsWith(dateStr);
            } else {
                return ev.data === dateStr;
            }
        });
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
                            const hora = ev.hora || (ev.start ? ev.start.split('T')[1]?.slice(0,5) : '');
                            const nome = ev.nome || (ev.title || '');
                            const servico = ev.servico || (ev.descricao || '');
                            const id = ev.id || (ev.nome + ev.data + ev.hora);
                            return `<li class="mb-2" data-event-id="${id}">
                                <span class="badge bg-primary">${hora}</span> <strong>${nome}</strong> <span class="text-muted">${servico}</span>
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
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        overlay.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) overlay.remove();
        });

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
    }

    document.getElementById('formAgendamento').addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const descricao = document.getElementById('descricao').value;

        if (!nome || !data || !descricao) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        const hoje = new Date();
        const dataSelecionada = new Date(data + (hora ? 'T' + hora : 'T00:00'));
        hoje.setHours(0,0,0,0);
        if (dataSelecionada < hoje) {
            alert('Não é possível agendar para datas passadas.');
            return;
        }
        let eventosSalvos = getAgendamentos();

        // --- CONFLITO CONSIDERANDO DURAÇÃO ---
        const servicos = getServicosCadastrados();
        const servicoSelecionado = servicos.find(s => s.nome === descricao);
        const duracao = servicoSelecionado ? parseInt(servicoSelecionado.duracao) : 30;
        const inicioNovo = new Date(`${data}T${hora}`);
        const fimNovo = new Date(inicioNovo.getTime() + duracao * 60000);

        let conflito = eventosSalvos.some(ev => {
            if (ev.data !== data) return false;
            const servicoEv = servicos.find(s => s.nome === ev.servico);
            const duracaoEv = servicoEv ? parseInt(servicoEv.duracao) : 30;
            const inicioEv = new Date(`${ev.data}T${ev.hora}`);
            const fimEv = new Date(inicioEv.getTime() + duracaoEv * 60000);
            return (inicioNovo < fimEv && fimNovo > inicioEv);
        });

        if (conflito) {
            alert('Já existe um agendamento para este horário.');
            return;
        }

        const evento = {
            id: gerarId(),
            nome: nome,
            data: data,
            hora: hora,
            servico: descricao
        };

        eventosSalvos.push(evento);
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
            const link = `${window.location.origin}/ICEI-PUC-Minas-PMV-ADS-projetoplanwise/form-agendamento-cliente.html?usuario=${encodeURIComponent(usuario)}`;
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
