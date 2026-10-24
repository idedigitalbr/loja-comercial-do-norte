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

## Fluxo de trabalho

`git status` limpo → branch por tarefa (`feat/…`, `fix/…`) → commits pequenos em português → testes/`typecheck`/`build` quando o ambiente permitir → PR ou push em `main` sincronizada. Nunca force push.
