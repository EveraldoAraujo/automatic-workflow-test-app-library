# mono

Estrutura base do repositório `mono`: layout de pastas, governança, tooling de
lint/format e pipeline de CI. Neste estágio o repositório não assume uma stack
de linguagem específica — apenas o tooling mínimo para manter o código
consistente.

## Pré-requisitos

- Git
- Node.js >= 20 e npm (para o tooling de lint/format)

## Setup

```sh
git clone <url-do-repo>
cd mono
npm install
```

## Comandos

| Comando                | Descrição                                  |
| ---------------------- | ------------------------------------------ |
| `npm run lint`         | Roda o ESLint sobre o projeto              |
| `npm run format`       | Formata os arquivos com Prettier           |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |
| `npm test`             | Roda os testes (placeholder no momento)    |

## Estrutura de diretórios

```
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
└── package.json         # Scripts e metadados
```

Detalhes sobre o layout e a estratégia de evolução estão em
[`docs/architecture.md`](docs/architecture.md).

## Como contribuir

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) para o fluxo de trabalho, convenção de
commits e estilo de código.

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE).
