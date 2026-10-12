# mono

Estrutura base do repositório `mono`: layout de pastas, governança, tooling de
lint/format e pipeline de CI. Neste estágio o repositório **não** assume uma
stack de linguagem específica nem contém código de aplicação — apenas o tooling
mínimo para manter o código consistente.

## Pré-requisitos

- Git
- Node.js >= 20.19 e npm (a versão recomendada está em [`.nvmrc`](.nvmrc); a
  versão de npm usada no projeto está em `packageManager` no `package.json`)

## Setup

```sh
git clone <url-do-repo>
cd mono
npm ci
```

O único propósito das dependências declaradas hoje é **tooling de lint/format**
(ESLint, Prettier, `eslint-config-prettier` e `globals`). Não há dependências de
runtime, stack de aplicação nem suíte de testes.

O `package-lock.json` é versionado e mantido consistente com o `package.json`.
Use `npm ci` em ambientes limpos/CI (install reprodutível, a partir do lockfile)
e `npm install` apenas quando precisar alterar dependências — ele regenera o
lockfile. O CI usa `npm ci`, portanto um lockfile divergente quebra o pipeline:
valide localmente antes de commitar.

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

`src/`, `tests/` e `scripts/` ainda não têm conteúdo de aplicação: a estrutura é
versionada por arquivos `.gitkeep` até que a stack seja definida.

Detalhes sobre o layout e a estratégia de evolução estão em
[`docs/architecture.md`](docs/architecture.md).

## CI

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda em push e
pull requests para `main`, instalando dependências com `npm ci` e executando
`format:check` e `lint`.

## Como contribuir

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) para o fluxo de trabalho, convenção de
commits e estilo de código.

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE).
