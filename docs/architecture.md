# Arquitetura

Este documento descreve a organização de pastas do repositório `mono` e a
estratégia de evolução. Ele é intencionalmente leve: no estado atual não há
código de aplicação nem stack confirmada.

## Objetivo

Estabelecer uma fundação organizacional mínima (layout, governança, tooling e
documentação) que permita adicionar código de forma incremental e reversível,
sem assumir dependências de linguagem além do necessário.

## Layout de diretórios

```text
.
├── .github/
│   └── workflows/     # Pipelines de CI (lint e format check)
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
- **.github/workflows/** — CI. Hoje apenas lint/format; deve evoluir junto com a
  stack (test/build).

## Arquivos de governança e tooling

| Arquivo                    | Papel                                              |
| -------------------------- | -------------------------------------------------- |
| `.nvmrc`                   | Versão de Node recomendada                         |
| `.editorconfig`            | Padroniza indentação, EOL e charset entre editors  |
| `.gitattributes`           | Normaliza fim de linha (LF) e marca binários       |
| `.gitignore`               | Ignora dependências, builds, envs e caches         |
| `.prettierrc.json`         | Regras de formatação                               |
| `.prettierignore`          | Exclui lockfile, `.git`, builds e artefatos        |
| `eslint.config.js`         | Regras de lint (flat config, ESM)                  |
| `package-lock.json`        | Lockfile versionado para instalações reprodutíveis |
| `.github/workflows/ci.yml` | Pipeline de integração contínua                    |

## Tooling instalado

O repositório declara as ferramentas de lint/format como `devDependencies` do
`package.json`, com versões estáveis e reais (`eslint`/`@eslint/js` na linha 9):

- `eslint` + `@eslint/js` — lint (flat config em `eslint.config.js`).
- `eslint-config-prettier` — desativa regras do ESLint que conflitam com o
  Prettier (aplicado por último na config).
- `prettier` — formatação.

`package.json` define `"type": "module"`, portanto `eslint.config.js` é
interpretado como ESM. Os scripts de lint/format usam `--cache` e os artefatos
de cache (`.eslintcache`, cache do Prettier) são ignorados pelo Git.

O `package-lock.json` é versionado e **gerado a partir do `package.json`** com
`npm install`; o CI usa `npm ci` para instalações reprodutíveis. Um lockfile
inconsistente com o `package.json` faz o `npm ci` falhar (EUSAGE), então ao
alterar dependências regenere o lockfile antes de commitar.

Não há dependências de runtime nem stack de aplicação definida. Também **não
existe script `test`**: como não há testes reais, optou-se pela ausência
explícita em vez de um placeholder que passaria sem validar nada. O CI não
executa testes enquanto não existir uma suíte real.

## Decisões

- **Layout flat na raiz** por enquanto: um único pacote lógico. Evita a
  complexidade de workspaces antes de existir mais de um pacote.
- **Dependências apenas de tooling** (lint/format). Dependências de runtime
  serão definidas junto com a stack da aplicação.
- **Sem código de aplicação**: diretórios vazios são mantidos versionados via
  `.gitkeep` (removido quando o diretório passa a ter conteúdo real).
- **Sem script de teste nem etapa de testes no CI** enquanto não houver testes
  reais: evita um pipeline "verde" fictício. O CI roda apenas `format:check` e
  `lint`.
- **`package-lock.json` ignorado pelo Prettier**: é um JSON gerado pelo npm e
  não deve ser reformatado; a consistência com o `package.json` é garantida pelo
  `npm ci` no CI, não pela formatação.

## Estratégia de evolução

### Quando houver múltiplos pacotes

Migrar para workspaces:

1. Adotar `packages/` para bibliotecas e `apps/` para aplicações executáveis.
2. Declarar os workspaces em `package.json` (`"workspaces": ["packages/*", "apps/*"]`)
   ou usar pnpm/yarn workspaces.
3. Mover conteúdo relevante de `src/` para o pacote correspondente.
4. Manter `docs/`, `scripts/` e `.github/` na raiz (compartilhados).

### Robustez do CI

- Usar `npm ci` com lockfile versionado (já adotado).
- Adicionar cache de dependências e matriz de versões de runtime.
- Quebrar o CI em jobs de lint, test e (quando aplicável) build **quando
  existirem testes/build reais**. O script `test` deve ser criado apenas nesse
  momento, já executando testes de verdade.

### Qualidade

- Ativar regras de lint específicas da stack (o `eslint-config-prettier` já está
  configurado para evitar conflitos com a formatação).
- Adicionar cobertura de testes e limites mínimos.
- Automatizar convenção de commits (ex.: commitlint) e changelog.
