# mono

Estrutura base do repositório `mono`: layout de pastas, governança, tooling de
lint/format e pipeline de CI. Neste estágio o repositório **não** assume uma
stack de linguagem específica nem contém código de aplicação — apenas o tooling
mínimo para manter o código consistente.

## Pré-requisitos

- Git
- Node.js >= 20 e npm (a versão recomendada está em [`.nvmrc`](.nvmrc))

## Setup

```sh
git clone <url-do-repo>
cd mono
npm ci
```

O único propósito das dependências declaradas hoje é **tooling de lint/format**
(ESLint, Prettier e `eslint-config-prettier`). Não há dependências de runtime,
stack de aplicação nem suíte de testes. O `package-lock.json` é versionado e
gerado a partir do `package.json` com `npm install` — garanta que ele esteja
consistente antes de commitar, pois `npm ci` falha se o lockfile divergir do
`package.json`. Use `npm ci` em ambientes limpos/CI e `npm install` apenas
quando precisar alterar dependências.

## Comandos

| Comando                | Descrição                                  |
| ---------------------- | ------------------------------------------ |
| `npm run lint`         | Roda o ESLint sobre o projeto              |
| `npm run format`       | Formata os arquivos com Prettier           |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |

> **Nota:** ainda **não há suíte de testes** e, por isso, **não existe script
> `test`** — em vez de um placeholder que passaria sem validar nada. O CI roda
> somente `format:check` e `lint`. Quando a stack for definida, adicione um
> runner de testes reais e uma etapa correspondente no CI.

## Estrutura de diretórios

```text
.
├── .github/workflows/   # Pipelines de CI
├── docs/                # Documentação e decisões de arquitetura
├── scripts/             # Scripts utilitários do repositório
├── src/                 # Código-fonte
├── tests/               # Testes
├── .editorconfig        # Padronização entre editores
├── .gitignore           # Artefatos ignorados pelo Git
├── eslint.config.js     # Configuração do ESLint
├── .prettierrc.json     # Configuração do Prettier
├── package-lock.json    # Lockfile (instalações reprodutíveis)
└── package.json         # Scripts e dependências de tooling
```

Detalhes sobre o layout e a estratégia de evolução estão em
[`docs/architecture.md`](docs/architecture.md).

## Como contribuir

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) para o fluxo de trabalho, convenção de
commits e estilo de código.

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE).
