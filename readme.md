# Sistema Bancário

Sistema de gerenciamento bancário completo com suporte a clientes Pessoa Física (PF) e Pessoa Jurídica (PJ), construído com Node.js, Express e EJS.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Rotas](#rotas)
- [API REST](#api-rest)
- [Exportações](#exportações)
- [Testes](#testes)
- [Regras de Negócio](#regras-de-negócio)

---

## Visão Geral

O Sistema Bancário é uma aplicação web server-rendered que permite:

- Cadastro e gestão de clientes **Pessoa Física (PF)** e **Pessoa Jurídica (PJ)**
- Realização de **saques** com limites por tipo de cliente
- Consulta de **extrato** com histórico de transações
- **Exportação** de relatórios em PDF e CSV
- **Configurações** de idioma (PT/EN), moeda e formato de data
- **Filtros e paginação** nas listagens

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 24+ |
| Framework | Express 5 |
| View Engine | EJS 3 |
| Banco de Dados | SQLite (via better-sqlite3) |
| Linguagem | TypeScript |
| Validação | Zod |
| PDF | PDFKit |
| Testes | Jest + ts-jest + Supertest |
| Build / Dev | tsx (watch mode) |

---

## Estrutura do Projeto

```
artifacts/banking-system/
├── src/
│   ├── app.ts                    # Configuração Express
│   ├── server.ts                 # Entrada do servidor HTTP
│   ├── config/
│   │   └── constants.ts          # Limites de saque, paginação
│   ├── controllers/
│   │   ├── BusinessClientController.ts
│   │   ├── DashboardController.ts
│   │   ├── IndividualClientController.ts
│   │   └── SettingsController.ts
│   ├── database/
│   │   ├── connection.ts         # Singleton do banco
│   │   ├── init.ts               # DDL / criação de tabelas
│   │   └── seed.ts               # Dados de exemplo
│   ├── middlewares/
│   │   ├── errorHandler.ts       # AppError, NotFoundError
│   │   └── settingsMiddleware.ts # Injeta traduções em res.locals
│   ├── repositories/
│   │   ├── BusinessClientRepository.ts
│   │   ├── IndividualClientRepository.ts
│   │   ├── SettingsRepository.ts
│   │   └── TransactionRepository.ts
│   ├── routes/
│   │   ├── apiRoutes.ts          # API REST (/api/...)
│   │   └── webRoutes.ts          # Rotas web (/clientes/...)
│   ├── services/
│   │   ├── BusinessClientService.ts
│   │   ├── DashboardService.ts
│   │   ├── ExportService.ts
│   │   └── IndividualClientService.ts
│   ├── types/
│   │   └── pdfkit.d.ts           # Declarações de tipo para PDFKit
│   ├── utils/
│   │   ├── formatters.ts         # Formatação de moeda e data
│   │   ├── i18n.ts               # Traduções PT/EN
│   │   └── validation.ts         # Schemas Zod
│   └── views/
│       ├── clients/              # Listagem, detalhe, formulário, extrato
│       ├── dashboard/
│       ├── partials/             # navbar, flash, pagination, errors
│       └── settings/
├── tests/
│   ├── helpers/
│   │   └── setupDb.ts
│   ├── businessClient.test.ts
│   ├── individualClient.test.ts
│   └── settings.test.ts
├── public/
│   ├── css/main.css
│   └── js/main.js
├── banking.db                    # Banco SQLite (gerado em runtime)
├── jest.config.js
├── package.json
└── tsconfig.json
```

---

## Instalação

```bash
# A partir da raiz do monorepo
pnpm install

# Inicializar o banco de dados com dados de exemplo
pnpm --filter @workspace/banking-system run db:seed
```

---

## Configuração

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3000` | Porta do servidor |
| `DB_PATH` | `banking.db` | Caminho para o arquivo SQLite |
| `NODE_ENV` | `development` | Ambiente de execução |

Em modo de teste, `DB_PATH=:memory:` é definido automaticamente para isolar cada suite.

---

## Uso

```bash
# Desenvolvimento (hot-reload)
pnpm --filter @workspace/banking-system run dev

# Executar seed
pnpm --filter @workspace/banking-system run db:seed

# Verificação de tipos
pnpm --filter @workspace/banking-system run typecheck

# Testes
pnpm --filter @workspace/banking-system run test
```

A aplicação estará disponível em `http://localhost:3000`.

---

## Rotas

### Interface Web

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Dashboard com resumo |
| GET | `/clientes/pf` | Listagem de clientes PF |
| GET | `/clientes/pf/novo` | Formulário de novo cliente PF |
| POST | `/clientes/pf` | Criar cliente PF |
| GET | `/clientes/pf/:id` | Detalhe do cliente PF |
| GET | `/clientes/pf/:id/editar` | Formulário de edição PF |
| POST | `/clientes/pf/:id/editar` | Atualizar cliente PF |
| POST | `/clientes/pf/:id/excluir` | Excluir cliente PF |
| GET | `/clientes/pf/:id/extrato` | Extrato do cliente PF |
| POST | `/clientes/pf/:id/saque` | Realizar saque (web) PF |
| GET | `/clientes/pj` | Listagem de clientes PJ |
| GET | `/clientes/pj/novo` | Formulário de novo cliente PJ |
| POST | `/clientes/pj` | Criar cliente PJ |
| GET | `/clientes/pj/:id` | Detalhe do cliente PJ |
| GET | `/clientes/pj/:id/editar` | Formulário de edição PJ |
| POST | `/clientes/pj/:id/editar` | Atualizar cliente PJ |
| POST | `/clientes/pj/:id/excluir` | Excluir cliente PJ |
| GET | `/clientes/pj/:id/extrato` | Extrato do cliente PJ |
| POST | `/clientes/pj/:id/saque` | Realizar saque (web) PJ |
| GET | `/configuracoes` | Página de configurações |
| POST | `/configuracoes` | Atualizar configurações |

---

## API REST

Base: `/api`

### Clientes PF

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/individual-clients` | Listar com filtros e paginação |
| POST | `/api/individual-clients` | Criar cliente |
| GET | `/api/individual-clients/:id` | Buscar por ID |
| PUT | `/api/individual-clients/:id` | Atualizar |
| DELETE | `/api/individual-clients/:id` | Excluir |
| POST | `/api/individual-clients/:id/withdraw` | Sacar |
| GET | `/api/individual-clients/:id/statement` | Extrato |

### Clientes PJ

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/business-clients` | Listar com filtros e paginação |
| POST | `/api/business-clients` | Criar cliente |
| GET | `/api/business-clients/:id` | Buscar por ID |
| PUT | `/api/business-clients/:id` | Atualizar |
| DELETE | `/api/business-clients/:id` | Excluir |
| POST | `/api/business-clients/:id/withdraw` | Sacar |
| GET | `/api/business-clients/:id/statement` | Extrato |

### Configurações

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/settings` | Obter configurações ativas |
| PUT | `/api/settings` | Atualizar configurações |

### Parâmetros de listagem

```
GET /api/individual-clients?page=1&limit=10&name=João&category=premium&minBalance=1000&maxBalance=50000
```

---

## Exportações

| Rota | Formato | Conteúdo |
|------|---------|----------|
| `/api/exports/individual-clients/pdf` | PDF | Relatório de clientes PF |
| `/api/exports/individual-clients/csv` | CSV | Dados de clientes PF |
| `/api/exports/business-clients/pdf` | PDF | Relatório de clientes PJ |
| `/api/exports/business-clients/csv` | CSV | Dados de clientes PJ |

Os filtros de listagem são propagados para as exportações via query string.

---

## Testes

```bash
pnpm --filter @workspace/banking-system run test
```

**3 suites / 34 testes:**

- `tests/individualClient.test.ts` — CRUD, saques, filtros, extrato, exportações PF
- `tests/businessClient.test.ts` — CRUD, saques, filtros, extrato, exportações PJ
- `tests/settings.test.ts` — Leitura e atualização de configurações

Cada suite utiliza banco SQLite em memória (`:memory:`) via `DB_PATH=:memory:`, sem efeito colateral no banco de produção.

---

## Regras de Negócio

### Limites de Saque

| Tipo de Cliente | Limite por Operação |
|----------------|---------------------|
| Pessoa Física (PF) | R$ 1.000,00 |
| Pessoa Jurídica (PJ) | R$ 5.000,00 |

O sistema valida:
1. O valor não pode exceder o limite do tipo de cliente
2. O saldo da conta deve ser suficiente
3. O valor deve ser positivo

### Categorias de Clientes

| Código | Descrição |
|--------|-----------|
| `standard` | Padrão |
| `premium` | Premium |
| `vip` | VIP (PF) |
| `corporate` | Corporativo (PJ) |
| `enterprise` | Empresarial (PJ) |

### Idiomas Suportados

| Código | Idioma |
|--------|--------|
| `pt` | Português (padrão) |
| `en` | Inglês |

### Formatos de Data

| Formato | Exemplo |
|---------|---------|
| `DD/MM/YYYY` | 06/04/2026 |
| `MM/DD/YYYY` | 04/06/2026 |
| `YYYY-MM-DD` | 2026-04-06 |

### Formatos de Moeda

| Código | Símbolo | Localidade |
|--------|---------|------------|
| `BRL` | R$ | pt-BR |
| `USD` | $ | en-US |
| `EUR` | € | pt-PT |
