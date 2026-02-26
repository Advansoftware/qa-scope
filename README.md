# QA Scope 🎯

Ferramenta de QA para gerenciar escopos de teste, tarefas com Kanban, e comandos de terminal — tudo local com SQLite.

## Stack

| Tecnologia | Versão |
|---|---|
| [Next.js](https://nextjs.org/) | 16 (Turbopack) |
| [MUI](https://mui.com/) | v7 |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | latest |
| JavaScript | ES2022+ |

## Funcionalidades

- **📊 Dashboard** — Overview com estatísticas e escopos recentes
- **📁 Projetos** — CRUD completo com contagem de escopos/tarefas
- **📋 Escopos de Teste** — Checklists interativos com barra de progresso
- **🗂️ Kanban Board** — Drag & drop entre colunas (A Fazer → Em Progresso → Testando → Concluído)
- **⌨️ Terminal** — Execute comandos salvos ou personalizados com output em tempo real
- **✏️ CRUD Completo** — Criar, ler, editar e excluir projetos, escopos, tarefas e comandos
- **🌙 Dark Theme Premium** — Glassmorphism, gradientes e micro-animações

## Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd qa-scope

# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**

## Estrutura do Projeto

```
src/
├── app/                          # Pages (App Router)
│   ├── page.js                   # Dashboard
│   ├── layout.js                 # Root layout
│   ├── globals.css               # Reset CSS
│   ├── projects/page.js          # CRUD de projetos
│   ├── scopes/
│   │   ├── page.js               # Lista de escopos
│   │   └── [id]/page.js          # Detalhe: checklist + comandos + edição
│   ├── kanban/page.js            # Kanban board
│   ├── terminal/page.js          # Terminal interativo
│   └── api/                      # API Routes
│       ├── projects/             # GET, POST, PUT, DELETE
│       ├── scopes/               # GET, POST, PUT, DELETE
│       ├── tasks/                # GET, POST, PUT, PATCH, DELETE
│       ├── commands/             # GET, POST, PUT, DELETE + /execute
│       └── dashboard/            # GET (stats agregados)
├── components/
│   ├── layout/                   # AppShell, Sidebar, Header
│   ├── common/                   # ConfirmDialog, StatusChip, EmptyState
│   └── ThemeRegistry.js          # MUI ThemeProvider + CssBaseline
├── hooks/                        # Custom hooks
│   ├── useProjects.js
│   ├── useScopes.js
│   ├── useTasks.js               # Inclui groupedByStatus para Kanban
│   ├── useCommands.js            # Inclui executeCommand
│   └── useDashboard.js
├── lib/
│   └── db.js                     # SQLite singleton + schema auto-init
└── theme/
    └── index.js                  # Dark theme premium com MUI v7
```

## API Routes

| Método | Rota | Descrição |
|---|---|---|
| `GET/POST` | `/api/projects` | Listar / Criar projetos |
| `GET/PUT/DELETE` | `/api/projects/[id]` | Detalhe / Atualizar / Excluir projeto |
| `GET/POST` | `/api/scopes` | Listar / Criar escopos (filtro por `project_id`) |
| `GET/PUT/DELETE` | `/api/scopes/[id]` | Detalhe / Atualizar / Excluir escopo |
| `GET/POST` | `/api/tasks` | Listar / Criar tarefas (filtro por `scope_id`) |
| `GET/PUT/PATCH/DELETE` | `/api/tasks/[id]` | CRUD + PATCH para Kanban drag & drop |
| `GET/POST` | `/api/commands` | Listar / Criar comandos |
| `GET/PUT/DELETE` | `/api/commands/[id]` | CRUD de comandos |
| `POST` | `/api/commands/execute` | Executar comando no servidor |
| `GET` | `/api/dashboard` | Stats agregados |

## Banco de Dados

SQLite local (`qa-scope.db`) criado automaticamente na raiz do projeto. Tabelas:

- **projects** — id, name, description, created_at
- **scopes** — id, project_id (FK), title, description, status, created_at
- **tasks** — id, scope_id (FK), title, description, status, priority, sort_order, created_at
- **commands** — id, scope_id (FK), label, command, description, created_at
- **command_history** — id, command_id, command_text, output, exit_code, executed_at

## Configuração MCP

Arquivo `.gemini/settings.json` inclui configurações para:

- **Google Stitch MCP** — Requer `gcloud auth login` para autenticar
- **MUI MCP** — Acesso à documentação oficial de componentes

## Scripts

```bash
# Desenvolvimento (web)
npm run dev            # Servidor Next.js com Turbopack
npm run build          # Build de produção
npm run start          # Servidor de produção
npm run lint           # ESLint

# Electron Desktop
npm run electron:dev   # App desktop em modo dev (requer dev server rodando)
npm run dist:linux     # Build + pacote Linux (AppImage + deb)
npm run dist:win       # Build + pacote Windows (NSIS installer)
npm run dist:all       # Build para Linux + Windows
```

## Electron Desktop App

O QA Scope pode ser empacotado como aplicação desktop nativa:

- **Linux**: AppImage + .deb (x64)
- **Windows**: NSIS installer (x64)

### Como funciona

1. `npm run build` gera o Next.js standalone server
2. `electron-builder` empacota tudo (Electron + Next.js + SQLite) num executável
3. O Electron inicia o servidor Next.js em uma porta livre e abre a janela
4. `better-sqlite3` é recompilado para o runtime do Electron automaticamente

### Output

```
dist-electron/
├── linux-unpacked/       # App descompactado (pode rodar direto com ./qa-scope)
├── QA Scope-1.0.0.AppImage   # AppImage portátil
└── qa-scope_1.0.0_amd64.deb  # Pacote Debian
```

## Regras do Projeto

- JavaScript (sem TypeScript)
- Máximo de 1000 linhas por arquivo
- Custom hooks para lógica de estado
- Componentização rigorosa
- MUI v7 para todos os componentes visuais

## Licença

MIT
