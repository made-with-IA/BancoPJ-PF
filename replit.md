# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a complete banking system (Sistema Bancário) in Portuguese.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: SQLite via better-sqlite3 (file: `artifacts/banking-system/banking.db`)
- **Template engine**: EJS (server-rendered, no React/Vite)
- **Testing**: Jest + Supertest (23 tests, 3 suites)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/banking-system run dev` — run banking system (port 3000)
- `pnpm --filter @workspace/banking-system run test` — run all tests
- `pnpm --filter @workspace/banking-system run db:seed` — seed sample data

## Banking System Features

- **Pessoa Física** (Individual clients): CRUD, withdrawal limit R$1,000
- **Pessoa Jurídica** (Business clients): CRUD, withdrawal limit R$5,000
- Account statements with transaction history
- PDF and CSV export
- Settings: language (PT/EN), currency format, date format
- Pagination and search filters
- All UI in Portuguese with EN toggle

## Package Dependencies Note

- `better-sqlite3` requires Python3 to compile. Python3 must be installed as a system dependency.
- If `pnpm install` fails for `better-sqlite3`, run: install `python3` via system dependencies first.

See the `pnpm-workspace` skill for workspace structure and TypeScript setup.
