# 📁 Estrutura do Código - CondoKanban Landing Page

## 🎯 Visão Geral

Landing page para apresentação do projeto CondoKanban, uma solução de gestão transparente para condomínios baseada em metodologia Kanban com inteligência artificial.

## 📂 Organização dos Arquivos

```
landingpage-spa-condokanban/
├── package.json        # Metadados do projeto e versionamento (raiz)
├── firebase.json       # Configuração de deploy Firebase
├── vite.config.js      # Configuração do Vite
├── README.md           # Documentação principal
├── README-CODE.md      # Documentação técnica do código
└── public/             # 🔥 Pasta pública do Firebase Hosting
    ├── index.html      # Estrutura HTML principal
    ├── main.js         # Lógica JavaScript (organizada em módulos)
    ├── style.css       # Estilos customizados (se houver)
    └── package.json    # Gerado automaticamente via npm postversion
```

> **Nota**: O `package.json` na pasta `public/` é gerado automaticamente pelo hook `postversion` quando você executa `npm version`. Ele contém apenas `name` e `version` para consumo do JavaScript cliente.

## 🧩 Estrutura do `main.js`

O arquivo JavaScript foi organizado em **6 módulos funcionais**:

### 1️⃣ **Versioning System**
- **Função**: `initVersioning()`
- **Responsabilidade**: Busca a versão do `package.json` e atualiza automaticamente:
  - Meta tag `<meta name="app-version">`
  - Span de exibição no rodapé `#app-version`
- **Execução**: Assíncrona (IIFE)

### 2️⃣ **Data & State Management**
- **Constantes**:
  - `tasks`: Array com mock data das tarefas do Kanban
  - `currentUser`: Objeto de estado do usuário atual (role, block, floor, id)
- **Estrutura da Task**:
  ```javascript
  {
    id: number,
    title: string,
    status: 'backlog' | 'doing' | 'stuck' | 'done',
    visibility: 'public' | 'block' | 'floor' | 'private',
    priority: 'Q1' | 'Q2' | 'Q3' | 'Q4',
    urgency: 1-10,
    importance: 1-10,
    description: string
  }
  ```

### 3️⃣ **Kanban Helper Functions**
- `getVisibilityBadge(task)`: Retorna badge HTML do nível de visibilidade
- `getPriorityColor(priority)`: Retorna classes CSS para borda colorida por prioridade
- `filterTasks()`: Filtra tarefas baseado nas permissões do usuário:
  - **Manager**: Vê tudo
  - **Resident**: Vê público + seu bloco/andar + seus privados
- `renderBoard()`: Renderiza o quadro Kanban completo com tarefas filtradas
- `updateViewMessage()`: Atualiza mensagem explicativa sobre visibilidade

### 4️⃣ **Event Handlers**
- `handleUserRoleChange(value)`: Handler para mudança de perfil no dropdown
  - Profiles disponíveis: `manager`, `resident_b1_f2`, `resident_b2_f5`

### 5️⃣ **Charts Initialization**
- `initCharts()`: Coordena inicialização de todos os gráficos
- `initMarketRadarChart()`: 
  - **Biblioteca**: Chart.js
  - **Tipo**: Radar Chart
  - **Objetivo**: Comparar CondoKanban vs Apps Tradicionais
- `initEisenhowerMatrix()`:
  - **Biblioteca**: Plotly.js
  - **Tipo**: Scatter Plot com 4 quadrantes
  - **Objetivo**: Visualizar priorização de tarefas via Matriz Eisenhower

### 6️⃣ **Initialization**
- **DOMContentLoaded Listener**: Inicialização ordenada:
  1. Renderizar board Kanban
  2. Inicializar gráficos
  3. Bind event handlers

## 🎨 Tecnologias Utilizadas

### Front-end
- **Tailwind CSS** (via CDN) - Estilização
- **Chart.js** (via CDN) - Gráfico de Radar
- **Plotly.js** (via CDN) - Matriz de Eisenhower
- **Google Fonts** - Tipografia Inter

### Build & Deploy
- **Vite** - Build tool
- **Firebase** - Hosting

## 🎯 Sistema de Cores (Tema Brand)

```javascript
brand: {
  bg: '#F5F5F4',       // Stone 100 - Background neutro
  card: '#FFFFFF',     // White - Cards
  text: '#292524',     // Stone 800 - Texto principal
  subtext: '#57534E',  // Stone 600 - Texto secundário
  accent: '#D97706',   // Amber 600 - Destaque principal
  secondary: '#0EA5E9',// Sky 500 - Tecnologia/Confiança
  success: '#10B981',  // Verde
  warning: '#F59E0B',  // Amarelo
  danger: '#EF4444'    // Vermelho
}
```

## 🔐 Sistema de Privacidade

O CondoKanban implementa 4 níveis de visibilidade:

| Nível | Descrição | Quem Vê |
|-------|-----------|---------|
| **Público** | Tarefas visíveis para todos | Todos os usuários |
| **Bloco** | Tarefas do bloco específico | Residents do bloco + Managers |
| **Andar** | Tarefas do andar específico | Residents do andar + Managers |
| **Privado** | Tarefas individuais | Dono da tarefa + Managers |

## 🤖 Priorização via IA (Matriz Eisenhower)

Classificação automática via **Google Gemini API**:

- **Q1 (Vermelho)**: Urgente + Importante → FAZER AGORA
- **Q2 (Azul)**: Não Urgente + Importante → PLANEJAR
- **Q3 (Amarelo)**: Urgente + Não Importante → DELEGAR
- **Q4 (Cinza)**: Não Urgente + Não Importante → ELIMINAR

## 📝 Boas Práticas Implementadas

✅ **Separação de Concerns**: HTML estrutural, JS funcional separado  
✅ **Modularização**: Código dividido em seções lógicas com JSDoc  
✅ **Versionamento Automático**: Lê do `package.json`  
✅ **Responsive Design**: Mobile-first com Tailwind  
✅ **Acessibilidade**: Estrutura semântica HTML5  
✅ **Performance**: CDNs para bibliotecas, código otimizado  

## 🚀 Como Executar

```bash
# Instalar dependências (se necessário)
npm install

# Build (se necessário)
npm run build

# Servir localmente
# Opção 1: Usar Live Server (VS Code)
# Opção 2: Python server
python -m http.server 8000

# Opção 3: Node.js
npx http-server
```

## 📦 Versionamento

A versão é gerenciada via `package.json` na raiz do projeto:

```bash
# Atualizar versão patch (0.0.2 → 0.0.3)
npm version patch

# Atualizar versão minor (0.0.2 → 0.1.0)
npm version minor

# Atualizar versão major (0.0.2 → 1.0.0)
npm version major
```

**Como funciona:**
1. O comando `npm version` atualiza o `package.json` na raiz
2. O hook `postversion` gera automaticamente `public/package.json` com apenas `name` e `version`
3. O JavaScript em `main.js` busca `/package.json` (servido de `public/`) para exibir a versão no rodapé
4. As mudanças são commitadas e enviadas para o repositório automaticamente

---

**Autor**: CondoKanban Team  
**Última Atualização**: 27 de Novembro de 2025
