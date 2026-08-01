# Finanças ERP

ERP simples para gerenciar **contas e despesas pessoais e da empresa em um único
app, mas em espaços totalmente separados** (workspaces), evitando qualquer
mistura entre as duas finanças.

## Como funciona a separação Pessoal x Empresa

Ao criar sua conta, dois **workspaces** são criados automaticamente:

- 🏠 **Pessoal**
- 🏢 **Empresa**

Categorias, transações e recorrências pertencem sempre a um único workspace.
Toda consulta e escrita no banco passa por um `workspaceId` obrigatório e é
validada contra os workspaces do usuário logado (`requireWorkspaceAccess` /
`requireActiveWorkspace`) — não existe caminho de código que misture dados dos
dois contextos. A troca entre Pessoal/Empresa é feita pelo seletor no topo da
tela e fica salva num cookie.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) + TypeScript
- **Tailwind CSS v4** para estilos
- **Prisma ORM 7** + **PostgreSQL** (testado com [Supabase](https://supabase.com), funciona com qualquer Postgres)
- **Autenticação própria**: sessão em cookie httpOnly assinada com JWT (`jose`) + senha com `bcryptjs` — sem dependências de terceiros para login
- **Recharts** para os gráficos do dashboard
- **Zod** para validação de formulários/Server Actions

## Estrutura do projeto

O projeto é organizado como um **monólito modular**: cada área de negócio
(categorias, transações, recorrências, dashboard, workspaces, autenticação)
vive isolada em `src/server/<modulo>`, com:

```
src/server/<modulo>/
  service.ts   # regras de negócio + acesso ao banco (sempre recebe workspaceId)
  actions.ts   # Server Actions ("use server") chamadas pelos formulários
  guards.ts    # (quando aplicável) checagens de acesso
```

Isso facilita adicionar ou alterar funcionalidades sem tocar em outros
módulos: para um novo módulo (ex.: "Metas financeiras"), basta criar
`src/server/metas/{service,actions}.ts` seguindo o mesmo padrão, um model no
`prisma/schema.prisma` com `workspaceId`, e uma página em
`src/app/(dashboard)/metas/page.tsx`.

```
src/
  app/
    (auth)/            # login, signup — layout redireciona se já autenticado
    (dashboard)/        # área logada: dashboard, transações, categorias, recorrências
  components/
    ui/                # componentes base (Button, Input, Card, Badge...)
    layout/            # Sidebar, Topbar, seletor de workspace
    charts/            # gráficos (Recharts)
    <modulo>/           # componentes específicos de cada tela
  server/
    auth/               # sessão, senha, server actions de login/signup
    workspaces/         # workspace ativo, troca de contexto, guarda de acesso
    categories/
    transactions/
    recurring/
    dashboard/
  lib/                  # prisma client, formatação de moeda/data, utils
prisma/
  schema.prisma
  migrations/
```

## Modelo de dados

- `User` — conta de login
- `Workspace` (`PESSOAL` | `EMPRESA`) + `WorkspaceMember` — isolamento de dados
- `Category` (`RECEITA` | `DESPESA`) — por workspace
- `Transaction` — cobre despesas, contas a pagar e a receber (`status`: `PENDENTE`/`PAGO`, "Atrasado" é calculado a partir do vencimento)
- `RecurringRule` — despesas/receitas fixas mensais; ao abrir o Dashboard ou as Transações do mês atual, os lançamentos pendentes daquele mês são gerados automaticamente (idempotente, não duplica)

## Configuração local

1. **Banco de dados**: crie um projeto Postgres gratuito (ex. [Supabase](https://supabase.com) ou [Neon](https://neon.tech)) e copie a connection string.
2. Copie `.env.example` para `.env` e preencha:
   ```
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="valor gerado com: openssl rand -base64 32"
   ```
3. Instale as dependências e aplique as migrações:
   ```bash
   npm install
   npx prisma migrate deploy
   ```
4. Rode o app:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000/signup` e crie sua conta.

> Alternativa sem Supabase: `npx prisma dev` sobe um Postgres local descartável e imprime a `DATABASE_URL` para colar no `.env`.

## Deploy (Vercel + Supabase)

1. Suba o repositório no GitHub e importe na [Vercel](https://vercel.com/new).
2. Configure as variáveis de ambiente `DATABASE_URL` e `AUTH_SECRET` no projeto da Vercel.
3. Rode `npx prisma migrate deploy` apontando para o banco de produção (uma vez, localmente ou via CI) para criar as tabelas.
4. Deploy.

## Limitações atuais / próximos passos sugeridos

- Cada usuário tem seus próprios workspaces Pessoal/Empresa; convidar outra pessoa para compartilhar um mesmo workspace (ex. cônjuge/sócio) ainda não tem UI — o modelo (`WorkspaceMember`) já suporta múltiplos membros por workspace, faltando apenas a tela de convite.
- Geração de lançamentos recorrentes acontece ao abrir o Dashboard/Transações (sem infraestrutura de cron); há também um botão manual em Recorrências.
