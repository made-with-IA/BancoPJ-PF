# Registro de Alterações — Sistema Bancário

**Projeto:** Sistema Bancário  
**Repositório:** monorepo pnpm  
**Início:** Abril de 2026

Registro cronológico de todas as alterações significativas realizadas no projeto.

---

## [v1.0.0] — 2026-04-06 — Criação do backend completo

**Tipo:** Feature — Backend inicial  
**Pacote:** `@workspace/banking-system` (`artifacts/banking-system/`)

### Adicionado

- **Servidor Express 5 + EJS** com 12 páginas server-rendered:
  - Dashboard com totais consolidados de PF e PJ
  - Listagem, detalhe, criação e edição de clientes PF e PJ
  - Páginas de saque e extrato por cliente
  - Página de configurações (idioma, moeda, formato de data)
- **20 endpoints REST** (`/api/*`) para uso por clientes externos:
  - CRUD completo de `individual-clients` e `business-clients`
  - Endpoint de saque com validação de limite
  - Endpoint de extrato paginado com filtros
  - Endpoint de configurações (GET/PUT)
  - Endpoints de exportação PDF e CSV
- **SQLite via `better-sqlite3`**: schema com tabelas `individual_clients`, `business_clients`, `transactions`, `settings`
- **Validação de entrada** com Zod em todas as rotas
- **Regras de negócio**: limite de saque R$1.000 (PF) e R$5.000 (PJ), transações atômicas
- **Exportações**: PDF via PDFKit e CSV via csv-stringify
- **Internacionalização PT/EN** controlada pela tabela `settings`
- **Paginação e filtros** em todas as listagens
- **34 testes automatizados** (Jest + Supertest) em 3 suites: `individualClient`, `businessClient`, `settings`
- **Seed de dados**: `pnpm run db:seed`

### Arquivos criados

```
artifacts/banking-system/
  src/
    app.ts, server.ts, db.ts
    controllers/ (individualClient.ts, businessClient.ts, settings.ts, exports.ts)
    routes/ (individualClients.ts, businessClients.ts, settings.ts, exports.ts)
    middleware/ (settingsMiddleware.ts)
    types/ (index.ts, pdfkit.d.ts)
    utils/ (formatters.ts, pagination.ts)
  tests/ (individualClient.test.ts, businessClient.test.ts, settings.test.ts)
  views/ (*.ejs para todas as páginas)
  public/ (styles.css)
  package.json, tsconfig.json, jest.config.js
```

---

## [v1.0.1] — 2026-04-06 — Correção de 6 bugs críticos (auditoria)

**Tipo:** Bugfix  
**Pacote:** `@workspace/banking-system`

### Corrigido

| ID | Componente | Problema | Solução |
|----|-----------|----------|---------|
| BUG-001 | `app.ts` | EJS desativava `include()` quando variável `client` existia no contexto (modo client-side) | Registrado engine EJS customizado com `express.set('view engine', 'ejs')` e opções explícitas |
| BUG-002 | `tsconfig.json` | `customConditions` incompatível com `moduleResolution: Node` | Migrado para `module/moduleResolution: "Node16"` + `customConditions: []` |
| BUG-003 | `controllers/*.ts` | `req.params.id` tipado como `string \| undefined` causava erros TypeScript | Adicionado `as string` em todas as 24 ocorrências nos controllers |
| BUG-004 | tipos | PDFKit sem declarações `@types` no npm | Criado `src/types/pdfkit.d.ts` com declarações locais |
| BUG-005 | `jest.config.js` | Testes quebrando após mudança de `moduleResolution` | Adicionado override `moduleResolution: 'Node'` no tsconfig do ts-jest |
| BUG-006 | `better-sqlite3` | Binding nativo não encontrado pelo Jest | Reconstruído com `node-gyp rebuild` |

### Resultado final

- 12/12 páginas HTTP 200
- 34/34 testes passando
- TypeScript typecheck sem erros
- Exportações PDF/CSV e saques funcionando

---

## [v1.1.0] — 2026-04-06 — Documentação completa

**Tipo:** Docs  
**Escopo:** Projeto inteiro

### Adicionado

- **`README.md`** (305 linhas): tecnologias, estrutura, instalação, rotas web, endpoints REST, testes, regras de negócio
- **`.docs/project.prd`** (281 linhas): visão, persona, 34 requisitos funcionais, 9 não-funcionais, arquitetura, schema do banco, critérios de aceitação
- **`.docs/errors-fixed.md`** (370 linhas): registro detalhado dos 6 bugs (BUG-001 a BUG-006) com causa raiz, código antes/depois e verificação
- **`openapi.json`** (OpenAPI 3.0.3): 20 endpoints, 18 schemas, exemplos reais coletados da API — pronto para Postman
- **`docs/prompts.md`**: registro cronológico de todas as solicitações enviadas ao agente

---

## [v2.0.0] — 2026-04-06 — Frontend React + Vite

**Tipo:** Feature — Frontend completo  
**Pacote:** `@workspace/banking-frontend` (`artifacts/banking-frontend/`)

### Contexto

Criação de um frontend React moderno que consome a API REST do `banking-system` via proxy Vite. O backend EJS continua em operação independente.

### Adicionado

**Artifact:** `banking-frontend` — React + Vite + shadcn/ui + TanStack Query  
**Preview:** `/banking-frontend/` (porta 19234)  
**API:** proxy Vite `/api` → `localhost:3000`

#### Páginas implementadas

| Rota | Página |
|------|--------|
| `/` | Dashboard com KPIs e listas de clientes recentes |
| `/clientes` | Lista unificada PF/PJ com busca, filtros, paginação, exportação |
| `/clientes/novo` | Formulário de criação com seletor PF/PJ e campos dinâmicos |
| `/clientes/pf/:id` | Detalhe de cliente PF |
| `/clientes/pj/:id` | Detalhe de cliente PJ |
| `/clientes/pf/:id/editar` | Edição de cliente PF |
| `/clientes/pj/:id/editar` | Edição de cliente PJ |
| `/clientes/pf/:id/saque` | Saque PF (limite R$1.000) |
| `/clientes/pj/:id/saque` | Saque PJ (limite R$5.000) |
| `/clientes/pf/:id/extrato` | Extrato PF com filtros de data e tipo |
| `/clientes/pj/:id/extrato` | Extrato PJ com filtros de data e tipo |
| `/configuracoes` | Configurações: idioma, moeda, formato de data |

#### Infraestrutura e arquitetura

- **`src/services/api.ts`**: cliente fetch tipado para todos os 20 endpoints da API bancária
- **`src/hooks/useIndividualClients.ts`** e **`useBusinessClients.ts`**: hooks TanStack Query com invalidação automática
- **`src/context/SettingsContext.tsx`**: contexto global de configurações + i18n (PT/EN)
- **`src/i18n/translations.ts`**: traduções completas PT e EN para toda a interface
- **`src/utils/formatters.ts`**: `formatCurrency()` e `formatDate()` respeitando settings do usuário
- **`src/components/Layout.tsx`**: sidebar fixa (desktop) + menu hamburguer (mobile)
- Componentes utilitários: `CategoryBadge`, `Pagination`, `LoadingState`, `ErrorState`, `EmptyState`, `PageHeader`
- Todas as rotas com `data-testid` para testes E2E
- Formulários com React Hook Form + Zod + mensagens de validação em português

#### Correção de roteamento (proxy API)

- Adicionado `/api/` ao array `paths` do `artifact.toml` para que o proxy reverso do Replit roteie chamadas `GET /api/*` para a porta 19234 (onde o Vite proxy encaminha para `localhost:3000`)
- Adicionado `resolve.dedupe: ["react", "react-dom"]` no `vite.config.ts` para evitar múltiplas instâncias React
- Removida dependência `@workspace/api-client-react` (desnecessária — a API bancária não usa o codegen Orval do monorepo)

#### Testes E2E

Todos os seguintes fluxos verificados e aprovados:
- Dashboard com dados reais (estatísticas, listas)
- Navegação pela sidebar
- Lista PF com busca e filtro de categoria
- Detalhe de cliente PF
- Lista PJ com CNPJ formatado
- Configurações com seletores pré-carregados
- Formulário de novo cliente PF e PJ

### Arquivos criados

```
artifacts/banking-frontend/
  src/
    types/index.ts
    services/api.ts
    hooks/ (useIndividualClients.ts, useBusinessClients.ts, useSettings.ts)
    context/SettingsContext.tsx
    i18n/translations.ts
    utils/formatters.ts
    components/ (Layout.tsx, CategoryBadge.tsx, Pagination.tsx, LoadingState.tsx,
                  ErrorState.tsx, EmptyState.tsx, PageHeader.tsx)
    pages/ (Dashboard.tsx, ClientsList.tsx, ClientNew.tsx,
            IndividualClientDetail.tsx, BusinessClientDetail.tsx,
            IndividualClientEdit.tsx, BusinessClientEdit.tsx,
            Withdraw.tsx, Statement.tsx, SettingsPage.tsx)
    App.tsx (atualizado com todas as rotas)
    index.css (tema profissional azul bancário, modo claro e escuro)
  vite.config.ts (proxy /api + resolve.dedupe)
  .replit-artifact/artifact.toml (paths: /banking-frontend/ + /api/)
```

---

## Sumário de versões

| Versão | Data | Tipo | Descrição |
|--------|------|------|-----------|
| v1.0.0 | 2026-04-06 | Feature | Backend Express + EJS + SQLite completo |
| v1.0.1 | 2026-04-06 | Bugfix | 6 bugs corrigidos (EJS, TypeScript, Jest, SQLite native) |
| v1.1.0 | 2026-04-06 | Docs | README, PRD, errors-fixed, openapi.json, prompts.md |
| v2.0.0 | 2026-04-06 | Feature | Frontend React + Vite — 11 páginas, API integrada, i18n PT/EN |
