# AGENTS.md — instruções para agentes de IA

Este arquivo é um **atalho operacional**. Ele não substitui a memória do projeto: em caso de conflito, vale [`docs/memory-ai.md`](docs/memory-ai.md).

## Leia antes de qualquer alteração

1. [`docs/memory-ai.md`](docs/memory-ai.md) — contexto, arquitetura decidida, escopo e regras.
2. [`docs/roadmap.md`](docs/roadmap.md) — estado real do código, riscos, fases e checklist.
3. `site-comercial-do-norte-html-referencia/` — fonte visual oficial (HTML, design system e assets aprovados).

## Regras que não se negociam

- **Stack definitiva:** Next.js (storefront) + NestJS (API) + PostgreSQL + Prisma + Tailwind CSS + shadcn/ui + Lucide + Turborepo/pnpm + Zod/contratos. **Não** usar MedusaJS, Payload CMS ou TanStack Start, e **não** criar um segundo backend.
- **Fase 1 é catálogo + cotação.** Sem checkout, Pix, cartão, parcelamento ou frete de venda. Botões falam "Adicionar à Cotação" / "Enviar Cotação", nunca "Comprar".
- **Estado atual ≠ arquitetura final.** O código ainda é React/Vite + MySQL: trate como transição, não como padrão a replicar.
- **Não apague código legado** (pagamentos, pedidos, treinamentos) — isole por feature flag.
- **Não recrie documentação antiga**, arquivos `*-old.md`/`*-backup.md` nem pastas de arquivo. A fonte de verdade são os dois arquivos de `docs/`.
- **Não invente** marca, depoimento, preço ou dado de cliente; demonstração precisa estar marcada como exemplo.
- **Não commite segredos** (`.env`, tokens, senhas, dumps).
- Mudanças grandes exigem teste, rollback e atualização do `docs/roadmap.md`; código de negócio e persistência vivem **apenas** na API NestJS.

## Coordenação multiagente (GitHub Project)

Quadro oficial: **[Comercial do Norte — Coordenação Multiagente](https://github.com/orgs/idedigitalbr/projects/3)** (repo `idedigitalbr/loja-comercial-do-norte`).
Ferramentas versionadas: `scripts/agents/tasks.json` (manifesto do roadmap), `project-sync.mjs` (cria/atualiza campos, labels, Issues e dependências), `task-claim.mjs` (reserva) e `pr-sync.mjs` (atualiza a Issue a partir do PR). Workflows: `.github/workflows/agent-claim.yml` e `agent-task-sync.yml`.

**Título padrão das tarefas:** `[ETAPA N] [TIPO] Descrição`.
**Campos obrigatórios:** Assignees · Agente executor · Status (Backlog, A Fazer, Reservado, Em Andamento, Em Revisão, Bloqueado, Concluído) · Sprint · Etapa · Tipo (UX, UI, FRONT, BACK, BUG, INFRA, DB, SEC, QA, SEO, DOCS, CONTENT, ERP) · Trilha (Engenharia, Design/Frontend, Compartilhado) · Prioridade (P0–P3).

**Protocolo obrigatório de cada agente:**
1. Ler `docs/memory-ai.md` e `docs/roadmap.md`.
2. Consultar o GitHub Project e escolher uma Issue **disponível** (sem reserva e sem `Blocked by` em aberto).
3. Assumir formalmente **antes de editar código**: Actions → *Assumir tarefa* (`/claim --agent <Agente>`) ou `pnpm agents:claim claim --issue N --agent <Agente> --branch feat/<codigo>-<slug>`.
4. Trabalhar em **branch própria** (`feat|fix|chore|docs|refactor/<codigo>-<slug>`); nunca direto na `main`.
5. Atualizar a Issue a cada marco: `/start`, `/block --reason "..."`, `/review`, `/done`, sempre com commit, PR e teste.
6. Abrir PR; o workflow comenta na Issue e move para **Em Revisão**.
7. **Não concluir automaticamente**: CI verde não fecha tarefa — a validação é humana (`/done` + revisão).
8. Liberar a reserva ao encerrar (`/release`) ou em caso de abandono justificado.
9. Não fazer merge automático na `main`.

**Exclusividade:** a trava é o ref Git `refs/heads/claims/issue-<n>--<Agente>` — criado de forma atômica pelo servidor (422 se já existir). Campo de texto e label são só espelho visual. Nunca libere reserva expirada sem confirmar que não há processo, branch ou PR ativo. Dependência técnica (`Blocked by`) é diferente de reserva: uma bloqueia o início, a outra impede dois agentes na mesma tarefa.

## Fluxo de trabalho

`git status` limpo → branch por tarefa (`feat/…`, `fix/…`) → commits pequenos em português → testes/`typecheck`/`build` quando o ambiente permitir → PR ou push em `main` sincronizada. Nunca force push.
