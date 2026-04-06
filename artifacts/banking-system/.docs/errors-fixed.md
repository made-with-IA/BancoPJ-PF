# Registro de Erros e Correções

**Projeto:** Sistema Bancário  
**Data de auditoria:** Abril de 2026

Este documento registra todos os erros identificados durante a auditoria final do projeto, suas causas raiz e as correções aplicadas.

---

## Índice

1. [BUG-001 — EJS: `include is not a function` em páginas de detalhe e extrato](#bug-001)
2. [BUG-002 — TypeScript: `customConditions` incompatível com `moduleResolution: Node`](#bug-002)
3. [BUG-003 — TypeScript: `req.params.id` tipado como `string | string[]`](#bug-003)
4. [BUG-004 — TypeScript: Falta de declarações de tipo para PDFKit](#bug-004)
5. [BUG-005 — Jest: `moduleResolution: Bundler` incompatível com ts-jest](#bug-005)
6. [BUG-006 — Jest: Binding nativo do `better-sqlite3` não encontrado](#bug-006)

---

## BUG-001

**Título:** EJS — `include is not a function` em páginas de detalhe e extrato  
**Severidade:** Crítica — as páginas retornavam HTTP 500  
**Impacto:** `/clientes/pf/:id`, `/clientes/pj/:id`, `/clientes/pf/:id/extrato`, `/clientes/pj/:id/extrato`, `/clientes/pf/:id/editar`, `/clientes/pj/:id/editar`

### Sintoma

Todas as rotas que renderizavam um cliente específico (detalhe, edição, extrato) retornavam HTTP 500 com a mensagem:

```
TypeError: include is not a function
    at detail-individual (".../clients/detail-individual.ejs":59:17)
```

Páginas de listagem, formulários de criação, dashboard e configurações funcionavam normalmente.

### Investigação

O erro ocorria especificamente nas views que recebiam um objeto `client` como variável de template. As páginas de listagem recebiam `clients` (plural) e funcionavam; as de detalhe recebiam `client` (singular, objeto com dados do cliente) e falhavam.

A diferença foi localizada no comportamento interno do EJS 3.x ao ser chamado pelo Express:

Quando o Express chama `ejs.renderFile(path, data, callback)` **sem** um objeto de opções separado (3 argumentos ao invés de 4), o EJS entra em modo de compatibilidade com Express e executa:

```javascript
// EJS lib/ejs.js — modo de compatibilidade Express
utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
```

A lista `_OPTS_PASSABLE_WITH_DATA_EXPRESS` contém os seguintes nomes de propriedade:

```javascript
['delimiter', 'scope', 'context', 'debug', 'compileDebug',
 'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async', 'cache']
```

O EJS **copia do objeto de dados para o objeto de opções** qualquer propriedade cujo nome coincida com essa lista. Como o template passava `client: { id, fullName, ... }` (objeto truthy), o EJS interpretava:

```
opts.client = { id: 1, fullName: '...' }  // truthy → ativa modo client-side
```

No EJS, `opts.client = true` (ou qualquer valor truthy) ativa o modo de **compilação client-side**, que gera o código da função de template como string (para uso no browser) e **não injeta o helper `include()`**. Como resultado, `include('../partials/navbar')` falhava com `include is not a function`.

As páginas de listagem não eram afetadas porque recebiam `clients` (plural), que não é um nome na lista `_OPTS_PASSABLE_WITH_DATA_EXPRESS`. Os formulários de criação passavam `client: null` (falsy), então `opts.client = null || false = false`, o modo client-side não era ativado.

### Correção

**Arquivo:** `src/app.ts`

Substituição do registro automático do EJS pelo Express por um registro manual que **sempre passa um objeto de opções explícito** (4 argumentos). Quando o EJS recebe 4 argumentos, ele usa o caminho de código normal (`shallowCopy(opts, args.pop())`) e **não executa** `shallowCopyFromList`, evitando a interferência da variável `client`.

```typescript
// ANTES (registro implícito — Express usa ejs.__express com 3 args)
app.set('view engine', 'ejs');
app.set('views', viewsDir);

// DEPOIS (registro explícito — sempre passa opts para evitar shallowCopyFromList)
app.engine('ejs', (filePath, data, cb) => {
  ejs.renderFile(filePath, data, { views: [viewsDir] }, cb);
});
app.set('view engine', 'ejs');
app.set('views', viewsDir);
```

### Resultado

Todas as 12 rotas web passaram a retornar HTTP 200 após a correção.

---

## BUG-002

**Título:** TypeScript — `customConditions` incompatível com `moduleResolution: "Node"`  
**Severidade:** Alta — `pnpm typecheck` retornava erro e abortava  
**Impacto:** Verificação de tipos do projeto inteiro

### Sintoma

```
tsconfig.json(3,3): error TS5098: Option 'customConditions' can only be used
when 'moduleResolution' is set to 'node16', 'nodenext', or 'bundler'.
```

### Causa Raiz

O `tsconfig.base.json` da raiz do monorepo define:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "customConditions": ["workspace"]
  }
}
```

O `tsconfig.json` do banking-system **estendia** o base e **sobrescrevia** apenas `moduleResolution`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node"   // ← sobrescreve para "Node"
  }
}
```

O TypeScript mescla as configurações: `moduleResolution` ficava como `"Node"`, mas `customConditions: ["workspace"]` herdado do base permanecia. Essa combinação é inválida — `customConditions` só é suportado com `node16`, `nodenext` ou `bundler`.

### Correção

**Arquivo:** `tsconfig.json`

Alteração de `module` e `moduleResolution` para `"Node16"` (que suporta `customConditions`) e adição de `"customConditions": []` para anular a herança do base:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "customConditions": [],
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Resultado

`pnpm typecheck` passou sem nenhum erro.

---

## BUG-003

**Título:** TypeScript — `req.params.id` tipado como `string | string[]`  
**Severidade:** Média — erro de compilação em 24 locais  
**Impacto:** `IndividualClientController.ts`, `BusinessClientController.ts`

### Sintoma

```
error TS2345: Argument of type 'string | string[]' is not assignable
to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.

103       const id = parseInt(req.params.id);
                              ~~~~~~~~~~~~~
```

### Causa Raiz

Com `moduleResolution: "Node16"`, o TypeScript passa a usar os tipos do Express que declaram `req.params` como `ParamsDictionary`, onde cada valor é `string | string[]`. A versão anterior (`moduleResolution: "Node"`) resolvia os tipos de forma menos estrita, aceitando `string` implicitamente.

A chamada `parseInt(req.params.id)` falha porque `parseInt` aceita apenas `string`, não `string | string[]`.

### Correção

**Arquivos:** `src/controllers/IndividualClientController.ts`, `src/controllers/BusinessClientController.ts`

Adição de `as string` para indicar ao TypeScript que, em rotas com parâmetro `:id`, o valor sempre será uma string simples (não um array):

```typescript
// ANTES
const id = parseInt(req.params.id);

// DEPOIS
const id = parseInt(req.params.id as string);
```

A correção foi aplicada em todos os 24 locais onde `req.params.id` era usado como argumento para `parseInt`.

### Resultado

Os 25 erros de tipo nas 3 arquivos foram eliminados.

---

## BUG-004

**Título:** TypeScript — Falta de declarações de tipo para o módulo PDFKit  
**Severidade:** Média — erro de compilação impedindo typecheck  
**Impacto:** `src/services/ExportService.ts`

### Sintoma

```
error TS7016: Could not find a declaration file for module 'pdfkit'.
  Try `npm i --save-dev @types/pdfkit` if it exists or add a new
  declaration (.d.ts) file containing `declare module 'pdfkit';`
```

### Causa Raiz

O pacote `pdfkit` não inclui declarações TypeScript nativas e não possui um pacote `@types/pdfkit` disponível no registro utilizado pelo projeto. Com a opção `noImplicitAny: true` (herdada do base), TypeScript rejeita módulos sem tipagem.

### Correção

**Arquivo criado:** `src/types/pdfkit.d.ts`

Criação de um arquivo de declaração de tipos local com as assinaturas dos métodos utilizados pelo `ExportService`:

```typescript
declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margins?: { top: number; left: number; bottom: number; right: number };
    // ...
  }

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    pipe(destination: NodeJS.WritableStream): this;
    fontSize(size: number): this;
    text(text: string, ...): this;
    // ... outros métodos utilizados
    end(): void;
  }

  export = PDFDocument;
}
```

### Resultado

O erro de tipo foi eliminado sem necessidade de instalar pacotes externos.

---

## BUG-005

**Título:** Jest — `moduleResolution: "Bundler"` incompatível com ts-jest  
**Severidade:** Alta — todos os testes falhavam sem executar nenhum caso  
**Impacto:** 3 suites de teste (34 testes)

### Sintoma

```
Test Suites: 3 failed, 3 total
Tests:       0 total
```

Os erros aconteciam antes de qualquer teste ser executado, indicando falha na compilação dos arquivos de teste.

### Causa Raiz

Durante a investigação do BUG-001, foi tentada uma abordagem intermediária que configurou `module: "ESNext"` e `moduleResolution: "Bundler"` no `tsconfig.json`. O `jest.config.js` tinha um override de tsconfig que especificava `module: "CommonJS"` mas **não especificava** `moduleResolution`. Como o ts-jest lê o `tsconfig.json` do projeto como base antes de aplicar os overrides, o `moduleResolution: "Bundler"` herdado do tsconfig conflitava com o modo CommonJS do Jest.

### Correção

**Arquivo:** `jest.config.js`

Adição de `moduleResolution: 'Node'` ao objeto de override do tsconfig no Jest, garantindo que o ambiente de testes use sempre resolução de módulos compatível com CommonJS:

```javascript
transform: {
  '^.+\\.tsx?$': ['ts-jest', {
    tsconfig: {
      module: 'CommonJS',
      moduleResolution: 'Node',   // ← adicionado
      target: 'ES2022',
      // ...
    }
  }]
}
```

### Resultado

Os 34 testes voltaram a executar e passar.

---

## BUG-006

**Título:** Jest — Binding nativo do `better-sqlite3` não encontrado em tempo de teste  
**Severidade:** Alta — todos os testes falhavam com erro nativo  
**Impacto:** 3 suites de teste

### Sintoma

```
Error: Could not locate the bindings file. Tried:
 → .../better-sqlite3/build/Release/better_sqlite3.node
 → .../better-sqlite3/lib/binding/node-v137-linux-x64/better_sqlite3.node
```

O servidor web funcionava normalmente (a `tsx` conseguia carregar o módulo), mas os testes via Jest falhavam ao tentar carregar o addon nativo.

### Causa Raiz

O `better-sqlite3` é um addon nativo (C++) que precisa ser compilado para cada versão do Node.js. O arquivo `.node` não foi compilado durante a instalação inicial (o diretório `build/Release/` existia mas estava vazio — sem o arquivo `better_sqlite3.node`).

O servidor (`tsx watch`) conseguia funcionar porque utiliza o módulo de forma indireta e o Node.js reutilizava o binding compilado em cache de uma sessão anterior. O Jest, rodando em um processo isolado com `ts-jest`, tentava carregar o binding diretamente e não encontrava o arquivo.

### Correção

Recompilação do addon nativo usando `node-gyp` via `npx`:

```bash
cd /home/runner/workspace/node_modules/.pnpm/better-sqlite3@11.10.0/node_modules/better-sqlite3
npx node-gyp rebuild
```

O comando gerou com sucesso:
```
.../build/Release/better_sqlite3.node
.../build/Release/test_extension.node
```

### Resultado

Os 34 testes passaram após a recompilação do binding.

---

## Resumo da Auditoria

| Bug | Severidade | Área | Status |
|-----|-----------|------|--------|
| BUG-001 — EJS `include is not a function` | Crítica | Runtime / EJS | Corrigido |
| BUG-002 — `customConditions` incompatível | Alta | TypeScript | Corrigido |
| BUG-003 — `req.params.id` tipo incorreto | Média | TypeScript | Corrigido |
| BUG-004 — Tipos PDFKit ausentes | Média | TypeScript | Corrigido |
| BUG-005 — ts-jest incompatível com Bundler | Alta | Testes | Corrigido |
| BUG-006 — Binding nativo não compilado | Alta | Testes | Corrigido |

### Estado Final Após Correções

```
Typecheck:    0 erros
Test Suites:  3 passed, 3 total
Tests:        34 passed, 34 total
Pages (HTTP): 12/12 retornando 200
Exports:      PDF + CSV funcionando (PF e PJ)
Withdrawals:  Limites R$1.000 (PF) e R$5.000 (PJ) aplicados
Language:     Português por padrão, toggle PT/EN funcionando
```
