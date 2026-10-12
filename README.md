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
demais workspaces — ver `packages/shared/tsconfig.build.json`. A ordem de build é
garantida de forma explícita e reproduzível:

- o hook `prepare` da raiz compila o `@mono/shared` logo após `npm install`/`npm ci`
  (portanto um clone limpo já tem o `dist/` antes de qualquer build/test);
- os scripts raiz `prebuild`, `pretest`, `prelint` e `predev` também compilam o shared
  antes de orquestrar os demais workspaces;
- `build` roda em ordem de dependência real: `@mono/shared` → `@mono/api` → `@mono/web`
  (não depende da ordem topológica implícita de `--workspaces`).

O pacote é privado e não é publicado.

## Rodando

```bash
npm install          # instala workspaces, compila o shared (hook prepare) e consolida o lockfile
npm run dev          # sobe web (4200) e api (3000) em paralelo
npm run build        # shared -> api -> web, em ordem de dependência
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
  (2) o default daquele arquivo (`'/api'`, assumindo que o host faz proxy da API).
  Nada é hardcoded no código da aplicação.

Para apontar a produção para outro host **sem rebuild**, injete
`<script>window.__API_BASE_URL__ = 'https://api.example.com/api'</script>` antes do bundle.
Para fixar um host no build, edite o default em `environment.production.ts` e rode
`ng build --configuration production`.

## Contrato da API

Base: `/api/todos`. O prefixo `/api` reserva o espaço para versionamento por caminho
(ex.: `/api/v2`) — **roadmap, ainda não implementado**.

| Método | Rota | Sucesso | Erros |
| --- | --- | --- | --- |
| `GET` | `/api/todos` | `200` lista de todos | — |
| `POST` | `/api/todos` | `201` todo criado | `400` payload inválido / JSON malformado |
| `PATCH` | `/api/todos/:id` | `200` todo atualizado | `400` payload inválido / JSON malformado, `404` id inexistente |
| `DELETE` | `/api/todos/:id` | `204` sem corpo | `404` id inexistente |

`GET /health` responde `{ "status": "ok" }`.

Entrada **e saída** são validadas em runtime com os schemas de `@mono/shared`
(`todoSchema`, `createTodoSchema`, `updateTodoSchema`):

- `CreateTodo`: `{ title: string }` — trim, 1..200 caracteres.
- `UpdateTodo`: `{ title?: string; completed?: boolean }` — ao menos um campo.
- `Todo` (resposta): `{ id, title, completed }` — validado antes de enviar.

Erros seguem o formato padronizado:

```json
{ "code": "VALIDATION_ERROR", "message": "Invalid request payload", "details": { ... } }
```

Códigos: `VALIDATION_ERROR`, `INVALID_JSON` (corpo não-JSON → `400`),
`NOT_FOUND`, `CORS_FORBIDDEN` (origem fora da allowlist → `403`) e
`INTERNAL_ERROR` (`500`, mensagem genérica em produção).

## Variáveis de ambiente (API)

Ver `.env.example`. A API carrega `.env` no start via `dotenv` (em `loadEnvFile()`),
então copiar `.env.example` para `.env` é suficiente. Principais:

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
Como o `prepare` da raiz compila o `@mono/shared`, o CI tem o `dist/` do shared
disponível já após o `npm ci`.

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
- **Concorrência no web:** `load()` descarta respostas obsoletas por token e também
  quando uma mutação otimista ocorreu durante a requisição (`mutationGeneration`),
  evitando que uma listagem em voo sobrescreva estado recém-mutado. Mutações usam
  atualização otimista com rollback (inclusive reposicionando o item removido).

## Estrutura

```
apps/
  web/        # Angular
  api/        # Express
packages/
  shared/     # tipos + schemas zod (build -> dist/)
```
