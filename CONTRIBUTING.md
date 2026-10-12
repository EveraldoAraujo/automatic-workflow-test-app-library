# Contribuindo

Obrigado por contribuir com o projeto `mono`. Este documento descreve o fluxo
de trabalho e as convenções básicas do repositório.

## Pré-requisitos

- Git
- Node.js (LTS) e npm — usados para o tooling de lint/format
- Editor com suporte a [EditorConfig](https://editorconfig.org/) (a maioria já
  tem suporte nativo ou via extensão)

## Fluxo de trabalho

1. Faça fork/clone do repositório.
2. Crie uma branch descritiva a partir de `main`:
   ```sh
   git checkout -b feat/minha-mudanca
   ```
3. Faça mudanças pequenas e focadas.
4. Rode lint/format e testes antes de abrir um PR:
   ```sh
   npm run lint
   npm run format
   ```
5. Abra um Pull Request descrevendo o problema, a solução e como validar.

## Convenção de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: ...` — nova funcionalidade
- `fix: ...` — correção de bug
- `docs: ...` — documentação
- `chore: ...` — manutenção, tooling, configuração
- `refactor: ...` — mudança sem alteração de comportamento
- `test: ...` — testes

Mantenha o assunto no imperativo e com no máximo ~72 caracteres.

## Estilo de código

- Formatação padronizada por Prettier (`.prettierrc.json`).
- Lint por ESLint (`eslint.config.js`) quando aplicável à stack.
- Indentação de 2 espaços, fim de linha LF, sem espaços ao final das linhas
  (ver `.editorconfig`).

## Estrutura

Consulte [`docs/architecture.md`](docs/architecture.md) para o layout de pastas
e a estratégia de evolução do repositório.
