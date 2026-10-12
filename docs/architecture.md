# Arquitetura

Este documento descreve a organização de pastas do repositório `mono` e a
estratégia de evolução. Ele é intencionalmente leve: no estado atual não há
código de aplicação nem stack definida.

## Objetivo

Estabelecer uma fundação organizacional mínima (layout, governança, tooling e
documentação) que permita adicionar código de forma incremental e reversível,
sem assumir dependências de linguagem além do necessário.

## Layout de diretórios

```
.
├── .github/
│   └── workflows/     # Pipelines de CI (lint, format check, testes)
├── docs/              # Documentação, decisões de arquitetura (ADRs)
├── scripts/           # Scripts utilitários (build, setup, automação local)
├── src/               # Código-fonte
└── tests/             # Testes
```

### Papel de cada diretório

- **src/** — código de produção. Deve conter apenas o que é distribuído/executado.
- **tests/** — testes. Espelha a estrutura de `src/` quando fizer sentido.
- **scripts/** — automação local e utilitários de desenvolvimento (não fazem
  parte do artefato final).
- **docs/** — documentação e decisões arquiteturais. Decisões relevantes devem
  ser registradas como ADRs em `docs/adr/`.
- **.github/workflows/** — CI. Hoje apenas lint/format/test; deve evoluir junto
  com a stack.

## Arquivos de governança e tooling

| Arquivo                    | Papel                                            |
| -------------------------- | ------------------------------------------------ |
| `.editorconfig`            | Padroniza indentação, EOL e charset entre editors |
| `.gitattributes`           | Normaliza fim de linha (LF) e marca binários     |
| `.gitignore`               | Ignora dependências, builds, envs e caches       |
| `.prettierrc.json`         | Regras de formatação                             |
| `eslint.config.js`         | Regras de lint (flat config)                     |
| `.github/workflows/ci.yml` | Pipeline de integração contínua                  |

## Decisões

- **Layout flat na raiz** por enquanto: um único pacote lógico. Evita a
  complexidade de workspaces antes de existir mais de um pacote.
- **Sem lockfile/dependências fixadas** até que a stack seja confirmada. O CI
  usa `npm install` para não exigir um lockfile prematuro.
- **Sem código de aplicação**: diretórios vazios são mantidos versionados via
  `.gitkeep`.

## Estratégia de evolução

### Quando houver múltiplos pacotes

Migrar para workspaces:

1. Adotar `packages/` para bibliotecas e `apps/` para aplicações executáveis.
2. Declarar os workspaces em `package.json` (`"workspaces": ["packages/*", "apps/*"]`)
   ou usar pnpm/yarn workspaces.
3. Mover conteúdo relevante de `src/` para o pacote correspondente.
4. Manter `docs/`, `scripts/` e `.github/` na raiz (compartilhados).

### Robustez do CI

- Fixar versões de dependências com lockfile assim que a stack for definida.
- Adicionar cache de dependências e matriz de versões de runtime.
- Quebrar o CI em jobs de lint, test e (quando aplicável) build.

### Qualidade

- Ativar regras de lint específicas da stack.
- Adicionar cobertura de testes e limites mínimos.
- Automatizar convenção de commits (ex.: commitlint) e changelog.
