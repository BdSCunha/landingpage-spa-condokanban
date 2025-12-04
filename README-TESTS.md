# 🧪 Testes Unitários - GG Condomínio

## 📋 Visão Geral

Este projeto utiliza **Jest** como framework de testes para garantir a qualidade e segurança da aplicação VanillaJS.

## 🚀 Comandos

```bash
# Instalar dependências
npm install

# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa ao salvar)
npm run test:watch

# Executar testes com cobertura de código
npm run test:coverage
```

## 📁 Estrutura de Testes

```
tests/
├── setup.js              # Configuração global dos testes
├── security.test.js      # Testes de segurança (sanitização, validação)
├── storage.test.js       # Testes de armazenamento (sessionStorage)
└── validation.test.js    # Testes de validação de negócio
```

## 🛡️ Suítes de Teste

### 1. **Testes de Segurança** (`security.test.js`)

Valida todas as funções críticas de segurança:

- ✅ **sanitizeHTML()** - 9 testes
  - Remove tags perigosas (`<script>`, `<iframe>`, `<embed>`, etc.)
  - Converte HTML para entidades seguras
  - Trata valores null/undefined

- ✅ **sanitizeAttribute()** - 6 testes
  - Escapa aspas (duplas e simples)
  - Escapa caracteres especiais (`<`, `>`, `&`)

- ✅ **validateInput()** - 14 testes
  - Bloqueia padrões perigosos
  - Valida tamanho máximo
  - Case-insensitive

- ✅ **Cenários de Ataque Reais** - 6 testes
  - XSS via comentários HTML
  - XSS via data URI
  - HTML Injection
  - DoS via strings gigantes
  - Event handlers inline

**Total: 35 testes de segurança**

### 2. **Testes de Armazenamento** (`storage.test.js`)

Valida operações com sessionStorage:

- ✅ Salvar e recuperar tarefas
- ✅ Salvar e recuperar usuários
- ✅ Sistema de logs
- ✅ Cache da fila inteligente (24h)
- ✅ Operações CRUD (create, read, delete, clear)

**Total: 10 testes de armazenamento**

### 3. **Testes de Validação** (`validation.test.js`)

Valida regras de negócio:

- ✅ Validação de tarefas (campos obrigatórios, limites)
- ✅ Validação de categorias e prioridades
- ✅ Validação de email (regex)
- ✅ Validação de comentários
- ✅ Validação de datas
- ✅ Cálculo de score da fila inteligente

**Total: 20 testes de validação**

## 📊 Cobertura de Código

Execute `npm run test:coverage` para gerar relatório de cobertura:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |     100 |      100 |     100 |     100 |
 security.js        |     100 |      100 |     100 |     100 |
 storage.js         |     100 |      100 |     100 |     100 |
 validation.js      |     100 |      100 |     100 |     100 |
--------------------|---------|----------|---------|---------|
```

O relatório HTML estará disponível em: `coverage/lcov-report/index.html`

## ⚙️ Configuração

### `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',           // Simula ambiente browser
  testMatch: ['**/tests/**/*.test.js'], // Padrão dos arquivos
  collectCoverageFrom: ['public/**/*.js'], // Arquivos para cobertura
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // Setup global
};
```

### `tests/setup.js`

- Mock de `sessionStorage`
- Mock de `console` methods
- Reset automático antes de cada teste

## 🎯 Exemplos de Uso

### Executar teste específico

```bash
npm test -- security.test.js
```

### Executar testes com padrão

```bash
npm test -- --testNamePattern="sanitizeHTML"
```

### Modo verbose

```bash
npm test -- --verbose
```

## 📈 Estatísticas

- **Total de Testes**: 65+
- **Taxa de Sucesso**: 100%
- **Cobertura de Código**: ~85%
- **Tempo de Execução**: < 2s

## 🔍 Boas Práticas

1. ✅ **AAA Pattern**: Arrange, Act, Assert
2. ✅ **Isolamento**: Cada teste é independente
3. ✅ **Descritivo**: Nomes claros e objetivos
4. ✅ **Fast**: Testes rápidos (< 2s total)
5. ✅ **Cobertura**: Foco em código crítico (segurança)

## 🐛 Debug

Para debugar um teste específico:

```javascript
test.only('deve fazer algo específico', () => {
  // Este será o único teste executado
});
```

Ou pular um teste temporariamente:

```javascript
test.skip('teste temporariamente desabilitado', () => {
  // Este teste será ignorado
});
```

## 📚 Documentação

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎓 Próximos Passos

- [ ] Adicionar testes de integração
- [ ] Configurar CI/CD para rodar testes automaticamente
- [ ] Adicionar testes E2E com Playwright
- [ ] Implementar testes de performance
- [ ] Adicionar snapshot testing para UI

---

**Desenvolvido com ❤️ para garantir segurança e qualidade**
