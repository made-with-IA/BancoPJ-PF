# Registro de Solicitações e Prompts

**Projeto:** Sistema Bancário  
**Período:** Abril de 2026

Registro cronológico de todas as solicitações enviadas ao agente durante o desenvolvimento do projeto.

---

## Prompt 01 — Criação do projeto completo

**Solicitação:**

> Crie um sistema bancário completo em português com as seguintes funcionalidades:
> - Clientes Pessoa Física (PF) em `/clientes/pf` com CRUD completo
> - Clientes Pessoa Jurídica (PJ) em `/clientes/pj` com CRUD completo
> - Saques com limites: R$ 1.000 para PF, R$ 5.000 para PJ
> - Extrato de transações por cliente
> - Exportação de relatórios em PDF e CSV
> - Configurações de idioma (PT/EN), moeda e formato de data
> - Paginação e filtros nas listagens
> - 34 testes unitários com Jest
> - Arquitetura: Express + EJS server-rendered (sem React/Vite), SQLite via better-sqlite3

**Resultado entregue:**

- Aplicação Express 5 + EJS com 12 rotas web e 20 endpoints de API REST
- CRUD completo para PF e PJ com validação via Zod
- Regras de saque aplicadas com transações atômicas SQLite
- Extrato paginado com histórico de transações
- Exportação PDF (via PDFKit) e CSV para ambos os tipos de cliente
- Sistema de internacionalização PT/EN com middleware de configurações
- Dashboard com totais consolidados
- 3 suites de teste (Jest + Supertest): `individualClient`, `businessClient`, `settings`
- Seed de dados de exemplo (`pnpm run db:seed`)

---

## Prompt 02 — Correção de erros críticos (sessão de auditoria)

**Solicitação:**

> (Sessão de auditoria automática — continuação de sessão anterior)  
> Corrija os erros encontrados:
> - Páginas de detalhe e extrato retornando HTTP 500 (EJS `include is not a function`)
> - TypeScript typecheck falhando (`customConditions` incompatível com `moduleResolution: Node`)
> - Erros de tipo em `req.params.id` nos controllers (24 ocorrências)
> - Tipos ausentes para o módulo PDFKit
> - Testes Jest quebrando após mudança de `moduleResolution`
> - Binding nativo do `better-sqlite3` não encontrado pelo Jest

**Resultado entregue:**

- **BUG-001 (crítico):** Registrado engine EJS customizado em `app.ts` com opções explícitas para evitar que a variável de template `client` ativasse o modo client-side do EJS (que desativa o helper `include()`)
- **BUG-002:** Alterado `tsconfig.json` para `module/moduleResolution: "Node16"` + `customConditions: []`
- **BUG-003:** Adicionado `as string` em todos os usos de `req.params.id` nos controllers PF e PJ
- **BUG-004:** Criado `src/types/pdfkit.d.ts` com declarações de tipo locais para PDFKit
- **BUG-005:** Adicionado `moduleResolution: 'Node'` ao override de tsconfig no `jest.config.js`
- **BUG-006:** Reconstruído o binding nativo do `better-sqlite3` com `node-gyp rebuild`
- Auditoria final confirmou: 12/12 páginas HTTP 200, 34/34 testes passando, typecheck sem erros, exportações e saques funcionando

---

## Prompt 03 — Documentação: README, PRD e registro de erros

**Solicitação (literal):**

> Crie o readme.md  
> Crie o PRD do projeto em .docs/project.prd  
> Crie os registros de erros e correcoes em .docs/errors-fixed.md

**Resultado entregue:**

- **`README.md`** (305 linhas): Visão geral, tecnologias, estrutura do projeto, instalação, uso, tabela completa de rotas web, endpoints de API REST, exportações, testes e regras de negócio
- **`.docs/project.prd`** (281 linhas): Visão do produto, escopo, persona, 34 requisitos funcionais (RF-01 a RF-34), 9 requisitos não-funcionais, arquitetura com diagrama, schema do banco de dados, critérios de aceitação e status dos entregáveis
- **`.docs/errors-fixed.md`** (370 linhas): Registro detalhado dos 6 bugs corrigidos (BUG-001 a BUG-006) com sintoma, investigação da causa raiz, código antes/depois e resultado verificado

---

## Prompt 04 — Especificação OpenAPI para Postman

**Solicitação (literal):**

> criar o openapi.json para ser usado no postman

**Resultado entregue:**

- **`openapi.json`** (OpenAPI 3.0.3): Especificação completa com 20 endpoints, 18 schemas e exemplos reais coletados da API em execução
- Organizado em 4 tags: Clientes PF, Clientes PJ, Configurações, Exportações
- Todos os endpoints com: parâmetros de query, request body com validações, múltiplos exemplos de response (sucesso e erro), Content-Type correto para PDF e CSV
- Schemas completos: `IndividualClient`, `BusinessClient`, `Transaction`, `StatementPage`, `WithdrawRequest`, `WithdrawResponse`, `Settings`, erros de validação e 404
- Pronto para importação direta no Postman via **Import → openapi.json**

---

## Prompt 05 — Registro de prompts

**Solicitação (literal):**

> Crie o registro das solicitacoes e prompts enviados em ./docs/prompts.md

**Resultado entregue:**

- **`docs/prompts.md`** (este arquivo): Registro cronológico de todos os 5 prompts enviados durante o projeto, com a solicitação literal (quando disponível), contexto e descrição do que foi entregue em cada um

---

## Sumário

| # | Prompt | Arquivos gerados / modificados |
|---|--------|-------------------------------|
| 01 | Criação do projeto completo | `src/**`, `tests/**`, `public/**`, `package.json`, `jest.config.js`, `tsconfig.json` |
| 02 | Correção de erros (auditoria) | `src/app.ts`, `src/controllers/*.ts`, `src/types/pdfkit.d.ts`, `tsconfig.json`, `jest.config.js` |
| 03 | README + PRD + registro de erros | `README.md`, `.docs/project.prd`, `.docs/errors-fixed.md` |
| 04 | OpenAPI para Postman | `openapi.json` |
| 05 | Registro de prompts | `docs/prompts.md` |
