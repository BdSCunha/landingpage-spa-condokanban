// =====================================================
// CONDOKANBAN - LANDING PAGE LOGIC
// =====================================================
// Organização: Este arquivo gerencia toda a lógica JavaScript
// da landing page do CondoKanban, dividida em módulos funcionais

// =====================================================
// 1. VERSIONING SYSTEM
// =====================================================

/**
 * Busca e atualiza automaticamente a versão do package.json
 * Atualiza tanto a meta tag quanto o span no rodapé
 */
(async function initVersioning() {
    let version = '';

    try {
        const response = await fetch('./package.json');
        if (response.ok) {
            const packageData = await response.json();
            version = packageData.version || '';
        }
    } catch (e) {
        console.warn('Não foi possível carregar a versão do package.json:', e);
    }

    // Atualizar meta tag
    const metaTag = document.querySelector('meta[name="app-version"]');
    if (metaTag && version) {
        metaTag.setAttribute('content', `v${version}`);
    }

    // Atualizar span no rodapé
    const versionEl = document.getElementById('app-version');
    if (versionEl && version) {
        versionEl.textContent = `v${version}`;
    }

    // Disponibilizar globalmente
    window.__APP_VERSION__ = version;
})();

// =====================================================
// 2. DATA & STATE MANAGEMENT
// =====================================================

/**
 * Mock data para tarefas do Kanban
 * Cada tarefa possui: id, título, status, visibilidade, prioridade, urgência, importância
 */
const tasks = [
    {id: 1, title: "Vazamento Gás Bloco A", status: "doing", visibility: "public", priority: "Q1", urgency: 9, importance: 9, description: "Cheiro forte reportado no 3º andar."},
    {id: 2, title: "Troca lâmpada Hall 2º Andar", status: "backlog", visibility: "floor", block: "A", floor: "2", priority: "Q3", urgency: 7, importance: 3, description: "Lâmpada queimada."},
    {id: 3, title: "Barulho excessivo Apt 502B", status: "stuck", visibility: "private", owner_id: "resident_b2_f5", priority: "Q4", urgency: 2, importance: 2, description: "Festa após horário."},
    {id: 4, title: "Orçamento Pintura Fachada", status: "doing", visibility: "public", priority: "Q2", urgency: 4, importance: 9, description: "Coletando 3 orçamentos."},
    {id: 5, title: "Limpeza da Piscina", status: "done", visibility: "public", priority: "Q2", urgency: 5, importance: 7, description: "Realizada na segunda-feira."},
    {id: 6, title: "Portão Garagem Travando", status: "backlog", visibility: "block", block: "A", priority: "Q1", urgency: 8, importance: 8, description: "Motor engasgando."},
    {id: 7, title: "Reembolso Material Limpeza", status: "done", visibility: "private", owner_id: "other", priority: "Q3", urgency: 6, importance: 4, description: "Compra de cloro."}
];

/**
 * Estado global do usuário atual
 */
let currentUser = {
    role: 'manager',
    block: null,
    floor: null,
    id: 'admin'
};

// =====================================================
// 3. KANBAN HELPER FUNCTIONS
// =====================================================

/**
 * Retorna o badge HTML para o nível de visibilidade da tarefa
 * @param {Object} task - Objeto da tarefa
 * @returns {string} HTML do badge
 */
function getVisibilityBadge(task) {
    const badges = {
        'public': '<span class="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">Público</span>',
        'block': '<span class="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">Bloco</span>',
        'floor': '<span class="text-[10px] uppercase font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">Andar</span>',
        'private': '<span class="text-[10px] uppercase font-bold text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded border border-stone-300">Privado</span>'
    };
    return badges[task.visibility] || '';
}

/**
 * Retorna a classe CSS de borda lateral baseada na prioridade (Matriz Eisenhower)
 * @param {string} priority - Código da prioridade (Q1-Q4)
 * @returns {string} Classes CSS
 */
function getPriorityColor(priority) {
    const colors = {
        'Q1': 'border-l-4 border-red-500',      // Crítico
        'Q2': 'border-l-4 border-blue-500',     // Estratégico
        'Q3': 'border-l-4 border-yellow-500',   // Delegar
        'Q4': 'border-l-4 border-stone-300'     // Eliminar
    };
    return colors[priority] || colors['Q4'];
}

/**
 * Filtra as tarefas baseado nas permissões do usuário atual
 * Manager vê tudo, Resident vê apenas: público, seu bloco/andar, ou suas privadas
 * @returns {Array} Array de tarefas filtradas
 */
function filterTasks() {
    return tasks.filter(task => {
        if (currentUser.role === 'manager') return true;

        if (task.visibility === 'public') return true;
        if (task.visibility === 'block') return task.block === currentUser.block;
        if (task.visibility === 'floor') {
            return task.block === currentUser.block && task.floor === currentUser.floor;
        }
        if (task.visibility === 'private') return task.owner_id === currentUser.id;

        return false;
    });
}

/**
 * Renderiza o board Kanban com as tarefas filtradas
 */
function renderBoard() {
    const filteredTasks = filterTasks();
    
    const columns = {
        'backlog': document.getElementById('col-backlog'),
        'doing': document.getElementById('col-doing'),
        'stuck': document.getElementById('col-stuck'),
        'done': document.getElementById('col-done')
    };
    
    const counts = { backlog: 0, doing: 0, stuck: 0, done: 0 };

    // Limpar colunas
    Object.values(columns).forEach(col => col.innerHTML = '');

    // Renderizar cards
    filteredTasks.forEach(task => {
        counts[task.status]++;
        const card = document.createElement('div');
        card.className = `kanban-card bg-white p-3 rounded shadow-sm border border-stone-100 ${getPriorityColor(task.priority)}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold text-stone-400">${task.priority}</span>
                ${getVisibilityBadge(task)}
            </div>
            <h4 class="text-sm font-semibold text-brand-text leading-tight mb-1 truncate" title="${task.title}">${task.title}</h4>
            <p class="text-xs text-stone-500 line-clamp-2" title="${task.description}">${task.description}</p>
        `;
        columns[task.status].appendChild(card);
    });

    // Atualizar contadores
    Object.keys(counts).forEach(key => {
        document.getElementById(`count-${key}`).textContent = counts[key];
    });

    // Atualizar mensagem de visibilidade
    updateViewMessage();
}

/**
 * Atualiza a mensagem explicativa sobre o que o usuário atual pode ver
 */
function updateViewMessage() {
    const msgEl = document.getElementById('view-message');
    if (currentUser.role === 'manager') {
        msgEl.innerHTML = "👁️ Visão do <strong>Grupo Gestor</strong>: Você vê todos os chamados, inclusive os privados de todos os condôminos.";
    } else {
        const location = currentUser.id === 'resident_b1_f2' ? 'Bloco A, 2º Andar' : 'Bloco B, 5º Andar';
        msgEl.innerHTML = `👁️ Visão de <strong>Condômino</strong> (${location}): Você vê chamados Públicos, do seu Bloco/Andar e os seus Privados.`;
    }
}

// =====================================================
// 4. EVENT HANDLERS
// =====================================================

/**
 * Handler para mudança de perfil de usuário no seletor
 * @param {string} value - Valor selecionado no dropdown
 */
function handleUserRoleChange(value) {
    const userProfiles = {
        'manager': { role: 'manager', id: 'admin', block: null, floor: null },
        'resident_b1_f2': { role: 'resident', block: 'A', floor: '2', id: 'resident_b1_f2' },
        'resident_b2_f5': { role: 'resident', block: 'B', floor: '5', id: 'resident_b2_f5' }
    };

    currentUser = userProfiles[value] || currentUser;
    renderBoard();
}

// =====================================================
// 5. CHARTS INITIALIZATION
// =====================================================

/**
 * Inicializa todos os gráficos (Chart.js e Plotly)
 */
function initCharts() {
    initMarketRadarChart();
    initEisenhowerMatrix();
}

/**
 * Inicializa o gráfico de radar (comparação de mercado)
 * Usa Chart.js para mostrar CondoKanban vs Apps Tradicionais
 */
function initMarketRadarChart() {
    const ctx = document.getElementById('marketChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Transparência', 'Facilidade de Uso', 'Gestão Financeira', 'Comunicação', 'Gestão de Tarefas'],
            datasets: [
                {
                    label: 'CondoKanban',
                    data: [95, 90, 20, 100, 100],
                    fill: true,
                    backgroundColor: 'rgba(217, 119, 6, 0.2)',
                    borderColor: 'rgb(217, 119, 6)',
                    pointBackgroundColor: 'rgb(217, 119, 6)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(217, 119, 6)'
                },
                {
                    label: 'Apps Tradicionais',
                    data: [40, 60, 95, 30, 20],
                    fill: true,
                    backgroundColor: 'rgba(87, 83, 78, 0.2)',
                    borderColor: 'rgb(87, 83, 78)',
                    pointBackgroundColor: 'rgb(87, 83, 78)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(87, 83, 78)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { tension: 0.3 } },
            scales: { r: { suggestedMin: 0, suggestedMax: 100 } }
        }
    });
}

/**
 * Inicializa a Matriz de Eisenhower (Plotly)
 * Visualiza as tarefas em um gráfico de dispersão com 4 quadrantes
 */
function initEisenhowerMatrix() {
    const container = document.getElementById('eisenhowerChart');
    if (!container) return;

    const trace = {
        x: tasks.map(t => t.urgency),
        y: tasks.map(t => t.importance),
        mode: 'markers+text',
        type: 'scatter',
        text: tasks.map(t => t.priority),
        textposition: 'top center',
        marker: {
            size: 12,
            color: tasks.map(t => {
                const colors = { Q1: '#EF4444', Q2: '#3B82F6', Q3: '#F59E0B', Q4: '#78716C' };
                return colors[t.priority] || colors.Q4;
            })
        },
        hoverinfo: 'text',
        hovertext: tasks.map(t => `<b>${t.title}</b><br>Urgência: ${t.urgency}<br>Importância: ${t.importance}`)
    };

    const layout = {
        // title: 'Matriz Eisenhower (Priorização via Gemini)',
        xaxis: { 
            title: 'Urgência (Prazo)', 
            range: [0, 10], 
            showgrid: false,
            fixedrange: true
        },
        yaxis: { 
            title: 'Importância (Impacto)', 
            range: [0, 10], 
            showgrid: false,
            fixedrange: true
        },
        shapes: [
            { type: 'line', x0: 5, y0: 0, x1: 5, y1: 10, line: { color: 'grey', width: 1, dash: 'dot' } },
            { type: 'line', x0: 0, y0: 5, x1: 10, y1: 5, line: { color: 'grey', width: 1, dash: 'dot' } }
        ],
        annotations: [
            { x: 2.5, y: 9, text: 'Q2: Planejar', showarrow: false, font: { color: '#3B82F6', size: 14, weight: 'bold' } },
            { x: 7.5, y: 9, text: 'Q1: FAZER AGORA', showarrow: false, font: { color: '#EF4444', size: 14, weight: 'bold' } },
            { x: 2.5, y: 1, text: 'Q4: Ficar de olho', showarrow: false, font: { color: '#78716C', size: 14 } },
            { x: 7.5, y: 1, text: 'Q3: Delegar', showarrow: false, font: { color: '#F59E0B', size: 14 } }
        ],
        margin: { t: 40, r: 20, b: 40, l: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        dragmode: false
    };

    const config = { 
        responsive: true, 
        displayModeBar: false,
        staticPlot: false,
        scrollZoom: false,
        doubleClick: false
    };

    Plotly.newPlot(container, [trace], layout, config);
}

// =====================================================
// 6. INITIALIZATION
// =====================================================

/**
 * Inicialização principal quando DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar board inicial
    renderBoard();

    // Inicializar gráficos
    initCharts();

    // Bind event handlers
    const userSelector = document.getElementById('userRoleSelector');
    if (userSelector) {
        userSelector.addEventListener('change', (e) => handleUserRoleChange(e.target.value));
    }

    // Controle do botão voltar ao topo
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.add('opacity-100');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.remove('opacity-100');
            }
        });
    }

    // Sistema de Captura de Leads (Firebase)
    initContactForm();
});

// =====================================================
// 7. CONTACT FORM & FIREBASE INTEGRATION
// =====================================================

/**
 * Inicializa o formulário de contato com validações e integração Firebase
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Máscara para telefone brasileiro
    const phoneInput = document.getElementById('contactPhone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        e.target.value = value;
    });

    // Handler do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();

        // Validações
        if (!validateEmail(email)) {
            showFeedback('error', 'Por favor, insira um e-mail válido.');
            return;
        }

        if (!validateBRPhone(phone)) {
            showFeedback('error', 'Por favor, insira um telefone brasileiro válido no formato (XX) XXXXX-XXXX');
            return;
        }

        // Desabilitar botão durante envio
        const submitBtn = form.querySelector('button[type="submit"]');
        // DEBUG MODE: Apenas exibe mensagem de sucesso sem salvar
        console.log('📝 Lead capturado (modo debug):', { name, email, phone });
        
        showFeedback('success', '✅ Obrigado pelo interesse! Em breve entraremos em contato.');
        form.reset();
        
        // Fechar modal após 3 segundos
        setTimeout(() => {
            document.getElementById('contactModal').classList.add('hidden');
            document.getElementById('contactModal').classList.remove('flex');
            hideFeedback();
        }, 3000);
    });
}

/**
 * Valida e-mail
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida telefone brasileiro
 */
function validateBRPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Exibe feedback visual para o usuário
 */
function showFeedback(type, message) {
    const feedbackEl = document.getElementById('formFeedback');
    feedbackEl.className = `mt-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`;
    feedbackEl.textContent = message;
    feedbackEl.classList.remove('hidden');
}

/**
 * Oculta feedback
 */
function hideFeedback() {
    const feedbackEl = document.getElementById('formFeedback');
    feedbackEl.classList.add('hidden');
}
