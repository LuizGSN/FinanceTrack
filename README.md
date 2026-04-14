# FinanceTrack

> Aplicação fullstack de controle financeiro pessoal com dashboard, CRUD de transações e análise de gastos.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Funcionalidades

- **Autenticação** — registro, login e sessão com JWT e senhas criptografadas (bcrypt)
- **CRUD completo** — criar, editar e excluir receitas e despesas
- **Filtros por período** — intervalo de datas e tipo (receita/despesa)
- **Dashboard interativo** — resumo com receitas, despesas e saldo em tempo real
- **Analytics** — gráficos de pizza, barras e linhas com Recharts
- **Análise de perfil** — insights automáticos sobre hábitos financeiros

## 🖥️ Demonstração

<img width="1916" height="960" alt="image" src="https://github.com/user-attachments/assets/15fb9d80-0c65-49b9-8d73-17eb0516c170" />
<img width="1914" height="960" alt="image" src="https://github.com/user-attachments/assets/3890137b-384c-402b-a65e-fcd9f3f7786e" />
<img width="1912" height="898" alt="image" src="https://github.com/user-attachments/assets/8a813631-514b-4f57-9e04-9439cb3756de" />



## 🛠️ Tecnologias

| Frontend | Backend | DevOps |
|---|---|---|
| React 19 | Node.js + Express | Docker + Docker Compose |
| Vite 6 | PostgreSQL (pg) | Nginx |
| Tailwind CSS | JWT + bcrypt | Git |
| Recharts | Helmet + rate-limit | |

## 📋 Pré-requisitos

- Node.js >= 20
- PostgreSQL >= 17
- npm

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/LuizGSN/FinanceTrack.git
cd FinanceTrack
```

### 2. Configure o banco de dados

```bash
createdb financetrack
```

Ou use Docker:

```bash
docker compose up -d postgres
```

### 3. Configure o backend

```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais
npm ci
node src/server.js
```

### 4. Configure o frontend

```bash
cd frontend
npm ci
npm run dev
```

O app estará disponível em `http://localhost:5173`.

## 🐳 Rodar com Docker

```bash
docker compose up --build
```

Tudo sobe em um comando: PostgreSQL, backend e frontend. Acesse `http://localhost`.

## 📁 Estrutura do Projeto

```
FinanceTrack/
├── .env.example              # Variáveis de ambiente modelo
├── .gitignore
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js             # Entry point + middleware
│       ├── database/
│       │   └── db.js             # Pool PostgreSQL
│       ├── middleware/
│       │   └── auth.js           # JWT middleware
│       └── routes/
│           ├── auth.js           # Login, registro, me
│           └── transactions.js   # CRUD completo
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.jsx               # Router por estado
        ├── api.js                # Fetch wrappers + interceptor 401
        ├── config.js             # API base URL
        ├── pages/
        │   ├── LoginPage.jsx     # Login e registro
        │   ├── Dashboard.jsx     # CRUD + filtros + resumo
        │   └── AnalyticsPage.jsx # Gráficos e análise
        └── components/
            ├── Header.jsx        # Navbar com navegação
            ├── Logo.jsx          # Logo SVG (FT)
            ├── Summary.jsx       # Cards de resumo
            ├── TransactionList.jsx # Lista com ações
            └── TransactionForm.jsx # Modal de criação/edição
```

## 🔌 API Endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | Não | Criar conta |
| `POST` | `/auth/login` | Não | Login |
| `GET` | `/auth/me` | Sim | Dados do usuário |
| `GET` | `/transactions` | Sim | Listar transações (filtros: `type`, `date_from`, `date_to`) |
| `POST` | `/transactions` | Sim | Criar transação |
| `PUT` | `/transactions/:id` | Sim | Atualizar transação |
| `DELETE` | `/transactions/:id` | Sim | Deletar transação |

## 🔒 Segurança

- Senhas com **bcrypt 12 rounds** (async, sem bloquear event loop)
- **Helmet** para headers HTTP seguros
- **Rate limiting** por IP/usuário com limite progressivo (5 req auth/15min, 100 req API/min, 30 req transações/min)
- **CORS** restrito com allowed origins
- Validação completa de inputs (email, senha, valores, datas, tamanhos, categorias)
- **HTTPS** em produção com certificados SSL/TLS (TLS 1.2+)
- SQL injection protegido por **prepared statements**
- **Interceptor 401** no frontend — redireciona ao login quando token expira
- **Validação de token** ao recarregar a página via `/auth/me`
- Headers de segurança: HSTS, X-Content-Type-Options, X-Frame-Options, CSP

## 🌐 Deploy

### Backend — Render

1. Conecte o repo no [Render](https://render.com)
2. Crie um serviço Web apontando para `backend/`
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` — string do Neon, Supabase ou outro PostgreSQL
   - `JWT_SECRET` — chave aleatória forte (ex: `openssl rand -hex 32`)
   - `ALLOWED_ORIGINS` — URL do frontend (Vercel/Netlify)
   - `NODE_ENV=production`

### Frontend — Vercel

1. Conecte o repo na [Vercel](https://vercel.com)
2. Aponte para o diretório `frontend/`
3. Configure a variável `VITE_API_BASE_URL` com a URL do backend no Render
4. Deploy automático a cada push

---

## 🚀 V1.1.0 — Melhorias Implementadas

### Testes Automatizados
- **Jest** no backend com testes de validadores
- **Vitest + React Testing Library** no frontend
- Cobertura de testes em utilitários e validações

### Validações Aprimoradas
- Categorias permitidas por tipo: salary, freelance, investment (income) ; food, transport, utilities, etc (expense)
- Rejeição de datas futuras, valores negativos e montantes excessivos
- Validação centralizada em `src/utils/validators.js`

### Rate Limiting Melhorado
- Por IP/usuário com endpoints específicos
- Auth: 5 req/15min | API: 100 req/min | Transações: 30 req/min
- Compatível com reverse proxy (detecta IP real)

### HTTPS em Produção
- Suporte nativo com certificados SSL/TLS
- Nginx configurado com redirecionamento HTTP→HTTPS
- Headers de segurança avançados (HSTS, CSP, X-Frame-Options)

### Toast Notifications
- Sistema de notificações para sucesso, erro, aviso e informação
- Animações suaves e duração configurável
- Integrado em `api.js` para erro handling automático

### Versionamento de API
- Todos endpoints em `/api/v1/` (compatibilidade regressiva mantida)
- Melhor preparação para evoluções futuras
- Configurável via `.env`

### Documentação Swagger/OpenAPI
- Documentação interativa em `http://localhost:3000/api/docs`
- Teste de endpoints diretamente na UI
- Suporte a autenticação Bearer JWT

### Logs Estruturados
- **Winston** para logging profissional
- Arquivos: `logs/all.log` (todos) e `logs/error.log` (erros)
- Níveis: error, warn, info, http, debug

### Variáveis de Ambiente Completas
- `.env.example` totalmente documentado
- Seções: Database, Backend, Frontend, CORS, SSL/TLS, Logging, Rate Limit, Features, Security
- [Ver documentação completa](./IMPROVEMENTS.md)

**Veja [IMPROVEMENTS.md](./IMPROVEMENTS.md) para detalhes técnicos completos e [EXAMPLES.md](./EXAMPLES.md) para exemplos de uso.**

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido por [Luiz Gonzaga](https://github.com/LuizGSN) — Estudante de Análise e Desenvolvimento de Sistemas
