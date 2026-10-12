# mono — Angular To-Do List

Aplicação Angular (standalone components) que implementa uma **to-do list** simples,
com estado local gerenciado por Angular Signals.

## Funcionalidades

- Adicionar tarefas (título é aparado; entradas vazias são ignoradas).
- Marcar/desmarcar tarefas como concluídas.
- Remover tarefas.
- Contador de tarefas pendentes.
- Filtro de visualização: **Todas**, **Ativas** e **Concluídas**.

## Pré-requisitos

- Node.js 20+ (testado com Node 24)
- npm 11+

## Instalação

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm start
# ou
npx ng serve
```

Acesse `http://localhost:4200/`.

## Testes

```bash
npm test -- --watch=false
```

## Build de produção

```bash
npm run build
```

Os artefatos são gerados em `dist/mono-app`.

## Estrutura

```
src/app/
├── app.ts                        # AppComponent raiz
├── app.html
├── app.css
├── models/
│   └── todo.ts                   # interface Todo { id, title, completed }
├── services/
│   ├── todo.service.ts           # estado em Signals: add/toggle/remove
│   └── todo.service.spec.ts
└── components/
    └── todo-list/
        ├── todo-list.ts          # componente standalone (input, lista, filtros)
        ├── todo-list.html
        ├── todo-list.css
        └── todo-list.spec.ts
```

## Tecnologias

- Angular 22 (standalone components + Signals)
- TypeScript
- Vitest (via Angular CLI) para testes unitários
