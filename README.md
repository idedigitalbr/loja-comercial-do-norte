# Comercial do Norte

Catálogo e solicitação de cotação da **Comercial do Norte** — distribuidora de plásticos, descartáveis, embalagens e mercearia em Belém/PA, atendendo atacado e varejo.

> **Fase 1 (escopo vigente): catálogo + cotação.** O visitante monta uma lista, envia a solicitação com os dados de contato e o time comercial fecha o atendimento no ERP. Não há checkout, Pix, cartão nem frete de venda nesta fase.

## Estado do repositório

Este repositório nasceu de uma base de e-commerce de outro cliente e está **em migração** para a arquitetura aprovada em 24/10/2026. A branch de desenvolvimento já incorpora Next.js, PostgreSQL e cotação; a main continua no checkpoint anterior até revisão humana:

| Camada | Arquitetura-alvo (decidida) | Estado atual no código |
|---|---|---|
| Storefront | Next.js + React + TypeScript | Next.js App Router em apps/storefront |
| Admin | React + Vite | React 19 + Vite |
| API | NestJS (mantido, fonte única da regra de negócio) | NestJS 11 + Express |
| Banco | PostgreSQL | PostgreSQL e quatro migrations versionadas |
| ORM | Prisma | Prisma 6 |
| UI | Tailwind CSS + shadcn/ui + `packages/ui` | CSS manual + `packages/ui` parcial |
| Ícones | Lucide | Lucide |
| Monorepo | Turborepo + pnpm | Turborepo + pnpm |

A sequência da migração (banco, framework, design system e entrega da cotação) está em [`docs/roadmap.md`](docs/roadmap.md).

## Estrutura

- `apps/storefront` — loja pública.
- `apps/admin` — painel administrativo (catálogo, banners, pedidos, configurações).
- `apps/api` — API REST NestJS + Prisma.
- `packages/contracts` — schemas Zod e contratos compartilhados.
- `packages/ui` — componentes, tokens e utilitários de interface.
- `packages/api-client` — cliente HTTP tipado.
- `prisma/` — schema, migrations e seed.
- `site-comercial-do-norte-html-referencia/` — site HTML aprovado; **fonte visual oficial**.
- `docs/` — documentação oficial do projeto (memória, roadmap e complementos de segurança).

## Documentação — leia nesta ordem

1. [`docs/memory-ai.md`](docs/memory-ai.md) — contexto, escopo das fases, arquitetura definitiva, identidade visual e regras para agentes.
2. [`docs/roadmap.md`](docs/roadmap.md) — estado real do código, auditoria, riscos e plano de execução.
3. [`docs/security/threat-model.md`](docs/security/threat-model.md) e [`docs/security/lgpd-data-map.md`](docs/security/lgpd-data-map.md) — complementos de segurança e LGPD.
4. `site-comercial-do-norte-html-referencia/DESIGN-comercial-do-norte.md` — tokens, cores e tipografia oficiais.

## Desenvolvimento local

Pré-requisitos: **Node 22** (`.nvmrc`), **pnpm 10.15.1** e **PostgreSQL** local.

```bash
cp .env.example .env      # preencha DATABASE_URL, COOKIE_SECRET, CRON_SECRET,
                          # SETTINGS_ENCRYPTION_KEY (base64 de 32 bytes)
                          # e DEFAULT_ADMIN_PASSWORD / DEFAULT_CUSTOMER_PASSWORD (exigidas pelo seed)
pnpm install
pnpm bootstrap:local      # migrations + seed
pnpm dev                  # loja :3001 · admin :5174/admin · API na PORT (padrão 3000)
```

Antes de inicializar banco ou aplicar migrations, confira o ambiente e a memória do projeto. Esta missão de coordenação não executa essas operações.

## Regras rápidas

- Não instalar MedusaJS, Payload CMS ou TanStack Start.
- Não substituir o NestJS nem criar um segundo backend.
- Não manter MySQL nem React/Vite como arquitetura final.
- Não usar a identidade visual preto/dourado do cliente anterior; a identidade oficial (azul `#264887` / vermelho `#E33C34`) está em `docs/memory-ai.md`.
- Linguagem de cotação na interface: "Adicionar à Cotação", "Enviar Cotação" — nunca "Comprar".
