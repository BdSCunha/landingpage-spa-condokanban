# Guia de Deploy - Sistema de Captura de Leads Seguro

## 🔒 Solução Implementada

Em vez de expor credenciais Firebase no frontend, implementamos uma **API REST segura** usando Firebase Cloud Functions.

### Arquitetura

```
Cliente (Browser)
    ↓
POST /api/leads (sem credenciais)
    ↓
Firebase Cloud Function (backend seguro)
    ↓
Firestore Database (credenciais protegidas)
```

---

## 📋 Pré-requisitos

1. **Firebase CLI instalado**
   ```powershell
   npm install -g firebase-tools
   ```

2. **Login no Firebase**
   ```powershell
   firebase login
   ```

3. **Projeto Firebase criado**
   - Acesse: https://console.firebase.google.com
   - Crie um projeto
   - Ative o **Firestore Database** (modo produção)

---

## 🚀 Deploy Passo-a-Passo

### 1. Instalar dependências das Cloud Functions

```powershell
cd functions
npm install
cd ..
```

### 2. Configurar regras do Firestore

No console Firebase, vá em **Firestore Database > Regras** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leads só podem ser escritos pelo backend (Cloud Functions)
    match /leads/{document=**} {
      allow read: if false; // Ninguém pode ler
      allow write: if false; // Apenas Cloud Functions podem escrever
    }
  }
}
```

### 3. Deploy completo (Hosting + Functions)

```powershell
npm run build
firebase deploy
```

**Ou deploy separado:**

```powershell
# Apenas functions
firebase deploy --only functions

# Apenas hosting
firebase deploy --only hosting
```

---

## 🧪 Testar Localmente (Opcional)

### Emular Cloud Functions localmente:

```powershell
cd functions
npm run serve
```

Depois ajuste o endpoint em `main.js`:
```javascript
const apiEndpoint = 'http://127.0.0.1:5001/SEU_PROJECT_ID/us-central1/leads';
```

---

## 🔍 Verificar Deploy

### 1. URL da Cloud Function

Após deploy, você verá algo como:
```
✔ functions[leads(us-central1)] https://us-central1-SEU_PROJECT_ID.cloudfunctions.net/leads
```

### 2. Testar manualmente com CURL

```powershell
curl -X POST https://us-central1-SEU_PROJECT_ID.cloudfunctions.net/leads `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Teste\",\"email\":\"teste@example.com\",\"phone\":\"(11) 99999-9999\"}'
```

### 3. Ver logs em tempo real

```powershell
firebase functions:log
```

---

## 📊 Visualizar Leads no Firestore

1. Console Firebase > **Firestore Database**
2. Coleção: `leads`
3. Cada documento terá:
   - `name`
   - `email`
   - `phone`
   - `source`
   - `userAgent`
   - `url`
   - `ip`
   - `timestamp`
   - `createdAt`

---

## 💰 Custos (Plano Gratuito Spark)

### Limites gratuitos:
- **Cloud Functions**: 2M invocações/mês
- **Firestore**: 20K escritas/dia
- **Hosting**: 10GB armazenamento + 360MB/dia transferência

Para landing page, **ficará 100% gratuito** por muito tempo.

---

## 🔐 Segurança Implementada

✅ **Nenhuma credencial exposta** no frontend  
✅ **Validações no backend** (email, telefone)  
✅ **CORS configurado** (apenas seu domínio)  
✅ **Firestore protegido** (apenas Cloud Functions escrevem)  
✅ **Rate limiting** automático pelo Firebase  
✅ **Logs de auditoria** com IP e userAgent  

---

## 🐛 Troubleshooting

### Erro: "Function not found"
- Rode: `firebase deploy --only functions`
- Aguarde 2-3 minutos para propagação

### Erro: "CORS policy"
- Verifique se `cors: true` está em `functions/index.js`
- Adicione header no rewrite do `firebase.json`

### Erro: "Permission denied" no Firestore
- Verifique as regras do Firestore
- Cloud Functions têm permissão automática (Admin SDK)

---

## 📞 Suporte

Em caso de dúvidas, consulte:
- Documentação Firebase Functions: https://firebase.google.com/docs/functions
- Documentação Firestore: https://firebase.google.com/docs/firestore
