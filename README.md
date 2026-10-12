# mono

Monorepo (npm workspaces) para a aplicação de to-do list, composto por:

| Pacote | Caminho | Descrição |
| --- | --- | --- |
| `@mono/web` | `apps/web` | App Angular 22 (standalone, Signals) com a to-do list. |
| `@mono/api` | `apps/api` | API HTTP REST (Express + TypeScript) para todos. |
| `@mono/shared` | `packages/shared` | Tipos/contratos e schemas de validação (zod) compartilhados. |

O lockfile é único e vive na raiz (`package-lock.json`); os workspaces são resolvidos
por nome via symlinks do npm (sem paths relativos improvisados).

`@mono/shared` **gera artefato de build** (`dist/` com JS + `.d.ts`) consumido pelos
demais workspaces — ver `packages/shared/tsconfig.build.json`. Os scripts `build`,
`test`, `dev` e `start` dos apps rodam `pre*` hooks que compilam o `@mono/shared`
antes, garantindo resolução consistente sem passos manuais. O pacote é privado e não
é publicado; por isso ainda não há versionamento/publicação de pacote.

## Rodando

```bash
npm install          # instala todos os workspaces e consolida o lockfile
npm run dev          # sobe web (4200) e api (3000) em paralelo
npm run build        # build de todos os workspaces (shared -> api/web por dependência)
npm test             # testes de todos os workspaces
npm run lint         # checagem de formatação de todos os workspaces
```

Para rodar um pacote isolado: `npm run <script> -w @mono/web|@mono/api|@mono/shared`.

O dev server do web faz proxy de `/api` para `http://localhost:3000` (apps/web/proxy.conf.json).

### Base URL da API no web (por ambiente)

A base URL é resolvida por ambiente via `fileReplacements` do `angular.json`:

- `development` → `src/environments/environment.development.ts` (`apiBaseUrl: '/api'`, proxy de dev).
- `production` → `src/environments/environment.production.ts`, que resolve a URL na
  ordem: (1) `globalThis.__API_BASE_URL__` injetado em runtime pelo host, ou
  (2) o default daquele arquivo. Nada é hardcoded no código da aplicação.

Para apontar a produção para outro host sem rebuild, injete
`<script>window.__API_BASE_URL__ = 'https://api.example.com/api'</script>` antes do bundle.

## Contrato da API

Base: `/api/todos` (o prefixo `/api` já reserva o espaço para versionamento futuro
por caminho — ex.: `/api/v2` — ainda não implementado).

| Método | Rota | Sucesso | Erros |
| --- | --- | --- | --- |
| `GET` | `/api/todos` | `200` lista de todos | — |
| `POST` | `/api/todos` | `201` todo criado | `400` payload inválido / JSON malformado |
| `PATCH` | `/api/todos/:id` | `200` todo atualizado | `400` payload inválido / JSON malformado, `404` id inexistente |
| `DELETE` | `/api/todos/:id` | `204` sem corpo | `404` id inexistente |

`GET /health` responde `{ "status": "ok" }`.

Payloads validados em runtime com os schemas de `@mono/shared`:

- `CreateTodo`: `{ title: string }` — trim, 1..200 caracteres.
- `UpdateTodo`: `{ title?: string; completed?: boolean }` — ao menos um campo.

Erros seguem o formato padronizado:

```json
{ "code": "VALIDATION_ERROR", "message": "Invalid request payload", "details": { ... } }
```

Códigos: `VALIDATION_ERROR`, `INVALID_JSON` (corpo não-JSON → `400`),
`NOT_FOUND`, `CORS_FORBIDDEN` (origem fora da allowlist → `403`) e
`INTERNAL_ERROR` (`500`, mensagem genérica em produção).

## Variáveis de ambiente (API)

Ver `.env.example`. Principais:

| Variável | Default | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do servidor. |
| `NODE_ENV` | `development` | Ambiente; em `production` não vaza stack/detalhes internos. |
| `CORS_ORIGINS` | `http://localhost:4200` | Allowlist separada por vírgula. `*` é ignorado em produção. |

A configuração é lida em `apps/api/src/config.ts` e injetada em `createApp`, de modo
que os handlers nunca acessam `process.env` diretamente (inclusive o middleware de
erros, que usa `config.nodeEnv`).

## CI

O workflow em `.github/workflows/ci.yml` roda, em cada push/PR:
`npm ci` → `npm run lint` → `npm run build` → `npm test`, em todos os workspaces.

## Decisões registradas

- **Autenticação: ausente nesta fase.** A API é destinada a uso local/dev. Qualquer
  exposição pública exige autenticação/autorização antes do deploy.
- **Persistência: em memória (volátil).** Os dados são perdidos ao reiniciar a API.
  O acesso é isolado atrás de `TodoRepository`, permitindo troca por banco sem
  alterar a camada HTTP.
- **Segurança:** `helmet`, `cors` com allowlist (nega com `403` padronizado),
  `express.json({ limit: '100kb' })`, rate limit básico e middleware central de
  erros com status corretos e sem stack trace em produção.
- **Robustez de handlers:** todos os handlers da API passam por um `asyncHandler`
  explícito, garantindo que rejeições assíncronas e `throw` síncronos cheguem ao
  middleware de erros (Express 4 não captura rejeições async por padrão).

## Estrutura

```
apps/
  web/        # Angular
  api/        # Express
packages/
  shared/     # tipos + schemas zod (build -> dist/)
```
