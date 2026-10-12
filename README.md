# mono

Monorepo (npm workspaces) para a aplicação de to-do list, composto por:

| Pacote | Caminho | Descrição |
| --- | --- | --- |
| `@mono/web` | `apps/web` | App Angular 22 (standalone, Signals) com a to-do list. |
| `@mono/api` | `apps/api` | API HTTP REST (Express + TypeScript) para todos. |
| `@mono/shared` | `packages/shared` | Tipos/contratos e schemas de validação (zod) compartilhados. |

O lockfile é único e vive na raiz (`package-lock.json`); os workspaces são resolvidos
por nome via symlinks do npm (sem paths relativos improvisados).

## Rodando

```bash
npm install          # instala todos os workspaces e consolida o lockfile
npm run dev          # sobe web (4200) e api (3000) em paralelo
npm run build        # build de todos os workspaces
npm test             # testes de todos os workspaces
npm run lint         # checagem de formatação de todos os workspaces
```

Para rodar um pacote isolado: `npm run <script> -w @mono/web|@mono/api|@mono/shared`.

O dev server do web faz proxy de `/api` para `http://localhost:3000` (apps/web/proxy.conf.json).

## Contrato da API

Base: `/api/todos` (versionamento previsto via prefixo de rota).

| Método | Rota | Sucesso | Erros |
| --- | --- | --- | --- |
| `GET` | `/api/todos` | `200` lista de todos | — |
| `POST` | `/api/todos` | `201` todo criado | `400` payload inválido |
| `PATCH` | `/api/todos/:id` | `200` todo atualizado | `400` payload inválido, `404` id inexistente |
| `DELETE` | `/api/todos/:id` | `204` sem corpo | `404` id inexistente |

`GET /health` responde `{ "status": "ok" }`.

Payloads validados em runtime com os schemas de `@mono/shared`:

- `CreateTodo`: `{ title: string }` — trim, 1..200 caracteres.
- `UpdateTodo`: `{ title?: string; completed?: boolean }` — ao menos um campo.

Erros seguem o formato padronizado:

```json
{ "code": "VALIDATION_ERROR", "message": "Invalid request payload", "details": { ... } }
```

## Variáveis de ambiente (API)

| Variável | Default | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do servidor. |
| `NODE_ENV` | `development` | Ambiente; em `production` não vaza stack/detalhes internos. |
| `CORS_ORIGINS` | `http://localhost:4200` | Allowlist separada por vírgula. `*` é ignorado em produção. |

O web resolve a base URL da API por ambiente (`src/environments/`): `/api` em dev
(proxy) e configurável em produção — nada hardcoded no código.

## Decisões registradas

- **Autenticação: ausente nesta fase.** A API é destinada a uso local/dev. Qualquer
  exposição pública exige autenticação/autorização antes do deploy.
- **Persistência: em memória (volátil).** Os dados são perdidos ao reiniciar a API.
  O acesso é isolado atrás de `TodoRepository`, permitindo troca por banco sem
  alterar a camada HTTP.
- **Segurança:** `helmet`, `cors` com allowlist, `express.json({ limit: '100kb' })`,
  rate limit básico e middleware central de erros com status corretos
  (400/404/500) e sem stack trace em produção.

## Estrutura

```
apps/
  web/        # Angular
  api/        # Express
packages/
  shared/     # tipos + schemas zod
```
