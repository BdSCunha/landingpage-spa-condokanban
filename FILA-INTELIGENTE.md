# 🎯 Fila Inteligente de Chamados

## 📋 Visão Geral

A **Fila Inteligente** é um sistema de priorização automática de chamados que ordena os tickets do condomínio com base em múltiplos critérios, garantindo que chamados críticos não sejam esquecidos e que tarefas simples não sejam eternamente postergadas.

## ✨ Características Principais

### 1. **Sistema de Pontuação Multi-Critério**

Cada chamado recebe uma pontuação baseada em:

- **Quadrante da Matriz de Eisenhower** (Urgência × Importância)
  - Q1 (Urgente + Importante): 100 pontos base
  - Q2 (Não Urgente + Importante): 70 pontos
  - Q3 (Urgente + Não Importante): 50 pontos
  - Q4 (Não Urgente + Não Importante): 30 pontos

- **Aging (Envelhecimento)**: +1 ponto por dia em aberto (máximo 60 dias)

- **Status Atual**:
  - Fazendo: +20 pontos (já iniciado, deve continuar)
  - Enroscados: +15 pontos (bloqueado, precisa atenção)
  - A Fazer: 0 pontos

- **Regressões/Bloqueios**:
  - Saiu de "Enroscados" para "A Fazer": +25 pontos
  - Saiu de "Fazendo" para "A Fazer": +20 pontos
  - Bloqueado direto sem estar fazendo: +18 pontos

### 2. **Balanceamento Inteligente**

Para evitar que chamados simples sejam eternamente ignorados:
- Intercala **2 chamados complexos** (Q1/Q2) com **1 chamado simples** (Q3/Q4)
- Garante que até tarefas de baixa prioridade sejam atendidas

### 3. **Análise Contextual com IA (Gemini)**

- Utiliza a **API gratuita do Google Gemini** para análise contextual
- Identifica padrões, riscos e fornece insights sobre a fila
- **Funciona sem API key**: sistema continua operando apenas com lógica de scores

### 4. **Sistema de Cache Inteligente**

- Salva a fila calculada no `sessionStorage`
- Validade até meia-noite do dia seguinte
- Evita recálculos desnecessários e economiza chamadas à API

### 5. **Alertas de Risco**

Identifica automaticamente chamados simples (Q3/Q4) com mais de 7 dias em aberto, alertando sobre possível postergação infinita.

## 🔧 Como Usar

### Acessando a Fila

1. Clique no botão **"Fila Inteligente"** (ícone de lista numerada) no menu superior
2. O sistema calcula automaticamente a fila ou carrega do cache

### Interpretando os Insights

**Cards de Métricas:**
- **Total na Fila**: Quantidade de chamados ativos
- **Tempo Médio**: Média de dias em aberto
- **Em Risco**: Chamados simples com +7 dias (podem ser esquecidos)
- **Última Atualização**: Timestamp do cálculo

**Tabela da Fila:**
- **#**: Posição na fila (1 = maior prioridade)
- **Q**: Quadrante (Q1 vermelho, Q2 laranja, Q3 verde, Q4 cinza)
- **Título**: Nome do chamado
- **Unidade**: Bloco/unidade responsável
- **Status**: Estado atual (A Fazer, Fazendo, Bloqueado)
- **Dias**: Tempo em aberto
- **Score**: Pontuação final calculada
- **Ações**: Ver detalhes do chamado

**Linhas em Vermelho**: Chamados em risco de postergação (simples com +7 dias)

## 🤖 Configurando a API do Gemini (Opcional)

A análise contextual por IA é **opcional**. O sistema funciona perfeitamente sem ela, apenas com a lógica de pontuação.

### Como obter uma API Key gratuita:

1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### Como configurar no sistema:

**Opção 1 - Via Console do Navegador:**
```javascript
localStorage.setItem('gemini_api_key', 'SUA_CHAVE_AQUI');
```

**Opção 2 - Código Customizado:**
Descomente as linhas no arquivo `board.html` (função `getGeminiApiKey`):
```javascript
if (!apiKey) {
    apiKey = prompt('Cole sua API key do Google Gemini (gratuita):');
    if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
}
```

### Limites da API Gratuita:

- **15 requisições por minuto**
- **1.500 requisições por dia**
- **1 milhão de tokens por mês**

Como a fila é cacheada por 24h, você só usará **1 requisição por dia** (ou quando forçar recálculo).

## 📊 Exemplos de Uso

### Cenário 1: Gestão Proativa
Um gestor abre a Fila Inteligente toda segunda-feira para planejar a semana:
- Identifica os 5 primeiros chamados da fila
- Verifica alertas de risco
- Prioriza recursos baseado nos scores

### Cenário 2: Evitando Postergação
O alerta vermelho mostra "Lâmpada queimada (14 dias)":
- Gestor percebe que um chamado simples está parado há 2 semanas
- Aproveita uma manutenção de rotina para resolver vários chamados simples juntos

### Cenário 3: Análise de Padrões (com IA)
A IA identifica: *"Muitos chamados de vazamento concentrados no Bloco B. Possível problema estrutural na tubulação."*
- Gestor investiga padrão identificado
- Planeja manutenção preventiva para evitar novos chamados

## 🔄 Recalculando a Fila

A fila é recalculada automaticamente:
- **A cada 24h** (após meia-noite)
- **Sempre que a modal é aberta** pela primeira vez no dia

Para forçar recálculo manualmente:
```javascript
sessionStorage.removeItem('queueCache');
```

## 🎨 Personalização

### Ajustar Critérios de Risco

No código, linha ~3180, altere:
```javascript
const atRisk = queue.filter(t => 
    [3, 4].includes(quadrant) && t.daysOpen > 7  // Altere o número de dias
);
```

### Ajustar Balanceamento

No código, linha ~3165, altere a proporção:
```javascript
// Intercalar: 2 complexos, 1 simples
for (let i = 0; i < 2 && complexIdx < complex.length; i++) {  // Altere para 3, 4, etc.
    balanced.push(complex[complexIdx++]);
}
```

### Ajustar Pontuação Base

No código, linha ~3122:
```javascript
const baseScore = {
    1: 100,  // Aumente/diminua conforme necessário
    2: 70,
    3: 50,
    4: 30
}
```

## 🚀 Roadmap Futuro

- [ ] Botão para forçar recálculo manual
- [ ] Export da fila para CSV/PDF
- [ ] Filtros (por quadrante, por bloco, por status)
- [ ] Histórico de evolução da fila
- [ ] Notificações push para chamados em risco crítico
- [ ] Integração com calendário para agendamento automático

## 📝 Notas Técnicas

- **Armazenamento**: `sessionStorage.queueCache`
- **Validade do Cache**: Até meia-noite (00:00:00)
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp`
- **Modelo Gemini**: `gemini-2.0-flash-exp` (mais rápido e econômico)
- **Temperatura IA**: 0.3 (respostas mais determinísticas)
- **Tokens máximos**: 200 por análise

## 🐛 Troubleshooting

### A fila não está recalculando
```javascript
// Limpar cache manualmente
sessionStorage.removeItem('queueCache');
// Reabrir modal
```

### Erro na API do Gemini
- Verifique se a API key está correta
- Confirme que não excedeu os limites gratuitos
- Sistema continua funcionando sem IA

### Chamados não aparecem na fila
Verifique se os chamados:
- Não estão arquivados (`status !== 'archived'`)
- Não estão concluídos (`status !== 'done'`)
- Possuem `priorityMatrix.quadrant` definido

## 📄 Licença

Este módulo está integrado ao CondoKanban sob a mesma licença do projeto principal.

---

**Desenvolvido para otimizar a gestão de chamados em condomínios** 🏢
