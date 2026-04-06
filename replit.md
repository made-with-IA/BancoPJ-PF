# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a complete banking system (Sistema Bancário) in Portuguese.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Backend**: Express 5 + EJS + SQLite (`artifacts/banking-system`, port 3000)
- **Frontend**: React + Vite + shadcn/ui + TanStack Query (`artifacts/banking-frontend`, port 19234)
- **Database**: SQLite via better-sqlite3 (file: `artifacts/banking-system/banking.db`)
- **Testing**: Jest + Supertest (34 tests, 3 suites)

## Frontend (banking-frontend)

Located at `artifacts/banking-frontend/`, served at `/banking-frontend/`.

### Pages
- `/` — Dashboard with KPI cards and recent clients
- `/clientes` — Unified client list (PF/PJ tabs) with search, filter, export, CRUD actions
- `/clientes/novo` — New client form (PF/PJ selector with dynamic fields)
- `/clientes/pf/:id` — Individual client detail
- `/clientes/pj/:id` — Business client detail
- `/clientes/pf/:id/editar` — Edit individual client
- `/clientes/pj/:id/editar` — Edit business client
- `/clientes/pf/:id/saque` — Withdraw from individual (limit R$1,000)
- `/clientes/pj/:id/saque` — Withdraw from business (limit R$5,000)
- `/clientes/pf/:id/extrato` — Individual client statement
- `/clientes/pj/:id/extrato` — Business client statement
- `/configuracoes` — Settings (language, currency, date format)

### Architecture
- API calls via Vite proxy: `/api` → `localhost:3000`
- Proxy path `/api/` registered in artifact.toml so Replit routes API calls to port 19234
- `SettingsContext` provides global settings + i18n (PT/EN translations)
- `formatCurrency` and `formatDate` respect user settings
- All forms use React Hook Form + Zod with Portuguese validation messages

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/banking-system run dev` — run banking system (port 3000)
- `pnpm --filter @workspace/banking-system run test` — run all tests
- `pnpm --filter @workspace/banking-system run db:seed` — seed sample data

## Banking System Features

- **Pessoa Física** (Individual clients): CRUD at `/clientes/pf`, withdrawal limit R$1,000
- **Pessoa Jurídica** (Business clients): CRUD at `/clientes/pj`, withdrawal limit R$5,000
- Account statements with transaction history and date/type filters
- PDF and CSV export (with proper async temp file cleanup)
- Settings: language (PT/EN), currency format (BRL/USD/EUR), date format
- Pagination and search/filter support
- All UI in Portuguese with EN toggle

## Architecture

- **MVC structure**: controllers → services → repositories → SQLite
- `DashboardService` aggregates stats from individual and business repositories
- Withdrawals use `db.transaction()` for atomic balance update + transaction record creation
- Error handler reads `res.locals.lang` (not `req.session`) for language-aware error pages
- SQLite dates are stored as `YYYY-MM-DD HH:MM:SS` UTC; `formatDate` appends `Z` suffix before parsing

## URL Routes

| Route | Description |
|-------|-------------|
| `GET /` | Dashboard |
| `GET /clientes/pf` | List individual clients |
| `GET /clientes/pj` | List business clients |
| `GET /configuracoes` | Settings |
| `GET /api/individual-clients` | JSON API |
| `GET /api/business-clients` | JSON API |

## Test Structure

- `tests/individualClient.test.ts` — Individual client API tests
- `tests/businessClient.test.ts` — Business client API tests
- `tests/settings.test.ts` — Settings API + withdrawal limit constants
- `tests/helpers/setupDb.ts` — Shared in-memory DB setup helper

## Package Dependencies Note

- `better-sqlite3` requires Python3 to compile. Python3 must be installed as a system dependency.
- If `pnpm install` fails for `better-sqlite3`, run: install `python3` via system dependencies first.

See the `pnpm-workspace` skill for workspace structure and TypeScript setup.
