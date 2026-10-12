# Contribuindo

Obrigado por contribuir com o projeto `mono`. Este documento descreve o fluxo
de trabalho e as convenções básicas do repositório.

## Pré-requisitos

- Git
- Node.js >= 20 e npm — usados para o tooling de lint/format
- Editor com suporte a [EditorConfig](https://editorconfig.org/) (a maioria já
  tem suporte nativo ou via extensão)

## Fluxo de trabalho

1. Faça fork/clone do repositório.
2. Crie uma branch descritiva a partir de `main`:
   ```sh
   git checkout -b feat/minha-mudanca
   ```
3. Instale as dependências de tooling com `npm ci` (reprodutível).
4. Faça mudanças pequenas e focadas.
5. Rode lint/format antes de abrir um PR:
   ```sh
   npm run format
   npm run lint
   ```
6. Abra um Pull Request descrevendo o problema, a solução e como validar.

> **Testes:** ainda não há suíte de testes. O script `npm test` é um placeholder
> provisório e não valida nada — não o use como evidência de qualidade. Quando a
> stack for definida, adicione um runner de testes reais e a etapa
> correspondente no CI.

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
- Lint por ESLint (`eslint.config.js`), hoje com a config recomendada de JS.
- Indentação de 2 espaços, fim de linha LF, sem espaços ao final das linhas
  (ver `.editorconfig`).

## Estrutura

Consulte [`docs/architecture.md`](docs/architecture.md) para o layout de pastas
e a estratégia de evolução do repositório.
