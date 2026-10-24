# ROADMAP & AUDITORIA — COMERCIAL DO NORTE

> **Único documento operacional de execução, bloqueios, riscos e histórico breve** — atualizado em **24/10/2026**.
> Decisões permanentes e contexto: [`memory-ai.md`](./memory-ai.md). Não criar changelog, checklist ou prompts de memória separados nesta pasta.

## 1. Estado confirmado nesta revisão

- Repositório público consultável: `victorwilliames/loja-comercial-do-norte`. O código analisado é o do commit `5781590` (24/10/2026, 14:56 UTC) — o commit `cd02781` apenas consolidou a documentação e **não alterou código**. Nenhum commit analisado migrou a stack.
- **Decidido, ainda não implementado no código consultado:** frontend Next.js, PostgreSQL e padronização Tailwind/shadcn/ui. **Mantido:** NestJS, Prisma, Turborepo, pnpm, design de referência Comercial do Norte.
- O responsável afirma que **ainda não há produtos cadastrados, pois o projeto está em desenvolvimento**. Conferir existência de outras entidades e dados locais antes de recomeçar migrations.
- **Nada de execução foi validado neste ambiente:** este item foi **superado em 24/10/2026** pela revisão de execução descrita abaixo (§1.1). O bloqueio de `pnpm install` foi contornado com store e cache locais ao workspace.
- **Permissões GitHub verificadas em 24/10:** `pull`, `push`, `admin` e `maintain`; `main` sem proteção de branch e sem force push. A consolidação documental foi commitada em `cd02781` e publicada em `main`.
- Prazo histórico da fase 1: **31/10/2026**, com escopo de catálogo + cotação. Avaliar viabilidade considerando mudanças estruturais; não sacrificar segurança/qualidade para cumprir data.

### 1.1 Execução real em 24/10/2026 (branch `feat/stack-next-postgres`)

| Verificação | Comando | Resultado |
|---|---|---|
| CI completo (GitHub Actions) | run `40116859387` no commit `7a64b64` | **SUCESSO** — `pnpm install --frozen-lockfile`, `prisma generate`, `migrate deploy` (3 migrations), `db:seed` (catálogo demo + imagens WebP + templates), `lint` **6/6**, `typecheck` **6/6**, `typecheck:seed`, **testes de todos os pacotes** e `build` **6/6** com `next build` ("Compiled successfully") + build da API e do admin |
| Dependências locais | `pnpm install` (store/cache no workspace, `--node-linker=hoisted`) | 471+ pacotes; `argon2`, `sharp` e `prisma generate` funcionais |
| Typecheck local | `pnpm typecheck` | **6/6 tarefas OK** |
| Lint local | `pnpm lint` | **6/6 tarefas OK** |
| Build local | `pnpm build` | `contracts`, `api-client` e `api` OK; `admin`/`storefront` bloqueados pelo sandbox (`spawn EPERM` do esbuild/turbopack), validados no CI |
| Testes locais | `vitest` | **bloqueado pelo sandbox** (esbuild não inicia serviço); suítes executadas no CI |
| Verificação alternativa | build `tsc` + script JS puro | R04, E7 e R05 verificados contra o build compilado (`apps/api/dist`) |
| PostgreSQL | binários `embedded-postgres` + `scripts/dev/postgres.mjs` | PostgreSQL 18 real em `127.0.0.1:55432` |
| Migrations | `pg` aplicando `prisma/migrations/**` em banco novo | baseline `54 tabelas/29 enums/165 índices`; após cotação: **57 tabelas**, `QuoteStatus` com 7 valores e 2 eventos de e-mail |

**Consequência:** a base compila, passa em lint/typecheck/testes e builda no CI; localmente o sandbox bloqueia apenas esbuild/Prisma engine (registrado acima).

### Fonte única dos arquivos de memória

`docs/memory-ai.md` = decisões e fatos duradouros.
`docs/roadmap.md` = o que fazer, evidências, bloqueios, auditoria e changelog compacto.

Complementos permitidos: `docs/security/lgpd-data-map.md` e `docs/security/threat-model.md`. Nada além disso.

Toda a documentação anterior (memórias, auditoria técnica, prompts, planos/specs, runbooks MySQL/Hostinger, importação WooCommerce e MVP antigo) foi **removida do worktree** em 24/10/2026 e permanece somente no histórico Git (`5781590`). **Não recriar cópias**, arquivos `*-old.md`, `*-backup.md` ou pastas de arquivo dentro do repositório.

## 2. Sequência executável de migração — SEM BIG BANG

### Fase A — Congelamento seguro / base de qualidade (P0)

- [x] **A1 — Backup / branch:** **feito em 24/10/2026** — `git status` limpo, `origin/main` sincronizado, tag anotada `backup/pre-migracao-2026-10-24` apontando para `564c9e3` (HEAD legado) e branch de trabalho `feat/stack-next-postgres`.
- [x] **A2 — Diagnóstico reprodutível:** **feito em 24/10/2026** com as ressalvas de sandbox do §1.1 — Node 24.15.0 (compatível), pnpm 10.15.1 fixado (executado via `.tools`, pois o pnpm global tentava baixar a versão fixada para fora do workspace), `pnpm install`/`typecheck`(6/6)/`lint`(6/6) OK; `build` OK em `contracts`, `api-client` e `api`, bloqueado em `admin`/`storefront` por `spawn EPERM` do esbuild no sandbox; suítes de teste não executam neste sandbox (mesma causa). Rodapé com a matriz completa em §1.1.
- [x] **A3 — Configuração segura:** **feito em 24/10/2026** — `.env.example` migrado para `DATABASE_URL` PostgreSQL e passou a documentar `DEFAULT_ADMIN_*`/`DEFAULT_CUSTOMER_*`, exigidas pelo seed; `SETTINGS_ENCRYPTION_KEY` continua obrigatória em produção. Nenhum segredo real versionado (`.env` segue ignorado).
- [x] **A4 — CI:** **feito em 24/10/2026** — `.github/workflows/ci.yml` com serviço PostgreSQL 17, `prisma generate`, `migrate deploy` (ou `db push` enquanto não houver migrations), `db:seed`, `typecheck:seed`, `lint`, `typecheck`, `test` e `build`. **Primeira execução verde:** run `40116859387` no commit `7a64b64` (lint 6/6, typecheck 6/6, testes de todos os pacotes e `next build` + build da API/admin). Playwright/E2E e checks de segurança dedicados continuam pendentes (ver E8).
- [x] **A5 — Inventário de dados:** **feito em 24/10/2026** — não há instância MySQL local/homologação nesta máquina (nenhum serviço `mysql`/`mariadb`, nenhum binário em `Program Files`); não existe dado legado a preservar. O histórico MySQL de migrations permanece no Git (`564c9e3`/tag de backup).

**Saída:** base conhecida e reproduzível, backup verificável e decisão documentada sobre dados que precisam ser migrados.

### Fase B — Migração MySQL → PostgreSQL (P0, isolada)

- [x] **B1 — Ambiente:** **feito em 24/10/2026** — PostgreSQL 18 real provisionado sem Docker via binários de `embedded-postgres` (`scripts/dev/postgres.mjs`, `pnpm db:local:*`), em `127.0.0.1:55432`, banco `comercial_norte_dev`, `DATABASE_URL` por variável. Cluster local com `trust` (uso exclusivo de desenvolvimento) e dados em `.postgres-data/` ignorado pelo Git.
- [x] **B2 — Schema Prisma:** **feito em 24/10/2026** — `provider = "postgresql"`; os únicos tipos nativos são `@db.VarChar`, `@db.Text` e `@db.Char` (todos válidos no PostgreSQL) e `Json` passa a `jsonb`; a busca pública deixou de depender do `LIKE` case-insensitive do MySQL e usa `contains` + `mode: insensitive` (`catalog.service.ts`).
- [x] **B3 — Histórico de migrations:** **feito em 24/10/2026** — migrations MySQL removidas do worktree e preservadas no Git (`564c9e3`, tag `backup/pre-migracao-2026-10-24`); baseline PostgreSQL gerada pelo próprio Prisma (`prisma migrate diff --from-empty --to-schema-datamodel`) em runner do GitHub e versionada em `prisma/migrations/20261024170000_init_postgresql/migration.sql`, com `migration_lock.toml` em `provider = "postgresql"`. **Validada aplicando em banco vazio**: `54 tabelas`, `29 enums`, `165 índices`. Motivo de ter sido gerada no CI: o sandbox local bloqueia o `schema-engine` com `spawn EPERM` (ver §1.1).
- [x] **B4 — SQL específico:** **feito em 24/10/2026** — identificadores entre aspas duplas e cast explícito de enum em `inventory.service.ts` (`SELECT ... FOR UPDATE`), `trainings.service.ts` (`UPDATE ... NOW()`) e `coupon.service.ts` (3 consultas com `FOR UPDATE`). Nenhum uso de `LAST_INSERT_ID`/`ON DUPLICATE` encontrado.
- [x] **B5 — Seed:** **feito em 24/10/2026** — `prisma/seed.ts` sem dados Jonas/Elivaldo: `siteName` padrão do schema agora é "Comercial do Norte", configuração do site usa os dados pesquisados (marcados como pendentes de confirmação) e o catálogo vem de `prisma/seed-catalog.ts` (`DEMO_SOURCE = SEED_DEMO`): 8 categorias reais do segmento, marca provisória "Marca Exemplo", 12 produtos de demonstração (10 `ACTIVE` e 2 `DRAFT`, um deles incompleto para exercitar `PRODUCT_INCOMPLETE`), variantes com SKU único, preço, peso e dimensões, saldo de estoque e imagens WebP geradas localmente com `sharp` (480/960/1440) — **sem hotlink**. Seed idempotente por `slug`/`sku`, credenciais por ambiente e `typecheck:seed` no CI.
- [ ] **B6 — Integração:** transações, isolamento, locks concorrentes, reservas, cupons, login/RBAC, uploads, notificação, jobs, consultas, relatório. Testar com PostgreSQL real, não só mock.
- [ ] **B7 — Deploy:** ajustar `DATABASE_URL`, scripts e documentação de provisionamento/backup/recovery do PostgreSQL; não manter instruções que partem de MySQL como runbook atual.

**Aceite:** API NestJS inicia com PostgreSQL; schema e seed aplicam em ambiente limpo; suítes críticas passam; não existe dependência de runtime MySQL no caminho em produção; dados pré-existentes preservados se houver.

### Fase C — Design system e monorepo (P0/P1, gradual)

- [x] **C1 — Fonte visual:** **feito em 24/10/2026** — `packages/ui/src/styles/tokens.css` reescrito com os tokens oficiais (`#264887`, `#E33C34`, fundo `#F4F7FB`, títulos `#1D2433`, texto `#475467`, superfície escura `#13213B`, tipografia Lufga/Plus Jakarta), no lugar do preto/dourado herdado; prefixo `--cn-*` para não colidir com o Tailwind.
- [ ] **C2 — Pacote UI:** parcial — Tailwind CSS v4 configurado no storefront Next (`app/globals.css` com `@theme inline` mapeando os tokens) e `@commerce/ui/styles/tokens.css` exportado pelo pacote; ainda faltam `cn`, variantes e a configuração equivalente no admin.
- [ ] **C3 — Inventário de componentes:** Button, inputs, form, badges, table, product-card, mega-menu, dialog/sheet, toast, empty-state, skeleton, media/hero, slider/carousel; para cada um definir comportamento, states, responsividade, acessibilidade e testes.
- [ ] **C4 — Admin existente:** manter React/Vite funcional enquanto incorpora tokens e componentes compartilhados; **não migrar o painel inteiro para Next antes de garantir o caminho crítico do lançamento**.
- [ ] **C5 — Cortar CSS duplicado por módulos, sem substituição total em um commit; remover preto/dourado e branding herdado.**

**Aceite:** uma fonte de cores/tipografia/espaçamentos, componentes compartilháveis entre loja e painel, sem identidades conflitantes.

### Fase D — Vite/React → Next.js na loja pública (P0/P1)

- [x] **D1 — Preparação (storefront Next.js):** **feito em 24/10/2026** — `apps/storefront` substituído pelo Next.js **16.4.3 com App Router + TypeScript** (`next build`, `next dev --port 3001`), rotas preservadas em `/`, `/loja`, `/produto/[slug]`, `/categoria/[slug]`, `/marca/[slug]`, `/marcas`, `/cotacao`, `/cotacao/[publicId]` e 404 próprio. O app Vite legado (64 arquivos, com checkout/Pix/Jonas) foi removido junto com seus testes obsoletos; fluxos fora da fase 1 seguem apenas na API, isolados.
- [x] **D2 — Integração:** **feito em 24/10/2026** — o storefront consome **somente** REST da API NestJS (`lib/api.ts`), com `API_URL` para SSR e `NEXT_PUBLIC_API_URL` para o navegador; nenhum acesso a Prisma/banco no Next e nenhuma rota de negócio duplicada. CORS com credenciais liberado apenas para `APP_ORIGIN`/`ADMIN_ORIGIN` em `main.ts`; CSP deixou de permitir o domínio do salão.
- [x] **D3 — SEO:** **feito em 24/10/2026** — `generateMetadata` por produto/categoria/marca com canonical, `robots.ts` (bloqueia `/cotacao`, `/conta`, `/admin`), `sitemap.ts` gerado a partir do catálogo publicado e `noindex` nas páginas de cotação. O renderer de SEO legado do Nest (`public-shell/seo-renderer`) foi **removido** junto com o shell da loja (R07/R13).
- [ ] **D4 — Performance:** otimização de mídia (armazenamento confiável), estratégia clara de cache/revalidação, paginação/busca no servidor, imagem responsiva, bundle e web vitals; evitar cache indevido em cotação/autenticação.
- [ ] **D5 — Integração visual:** converter o site HTML de referência em componentes Next/shadcn sem perder seções, responsividade e identidade já aprovada.
- [ ] **D6 — Rotas / SSR:** validar `/`, `/loja`, `/produto/:slug`, `/categoria/:slug`, `/marca/:slug`, fluxo de cotação e `/admin`; remover conflito do antigo Nest `public-shell` que servia SPAs por URL raiz.
- [ ] **D7 — Produção:** Nest e Next com serviços e portas independentes por reverse proxy; HTTPS, domínio configurável, cookies seguros, CORS/CSRF, assets persistentes, health checks, métricas e logs. **Não reaproveitar deploy de um processo sem adequar.**

**Aceite:** loja Next funciona ponta a ponta consumindo Nest, páginas de produtos indexáveis e responsivas, nenhum backend comercial duplicado.

### Fase E — Entrega funcional da Comercial do Norte (P0/P1)

- [x] **E1 — Flags de escopo:** **feito em 24/10/2026** — `FEATURE_CHECKOUT`, `FEATURE_PAYMENTS` e `FEATURE_TRAININGS` (schema Zod, **desligadas por padrão**, só habilitam com `true`) + `FeatureGuard`/`@RequireFeature` que responde **404** (`FEATURE_NOT_AVAILABLE`) sem revelar o recurso. Aplicado em `checkout`, `payments` (incluindo `refund`, com guards mesclados para não perder auth), `webhooks/mercado-pago`, `trainings` e `admin/trainings`. As flags são expostas em `GET /api/v1/site/config` (`features`). **Nada foi apagado:** módulos, tabelas e testes continuam no repositório. **Pendente:** esconder no admin as telas de pagamentos/treinamentos quando as flags estiverem desligadas.
- [ ] **E2 — Categorias:** implementar hierarquia `Category.parentId`, imagens, ordenação e filtro descendente; admin capaz de gerir categorias.
- [x] **E3 — Cotação real (backend):** **feito em 24/10/2026** — modelo próprio `Quote`/`QuoteItem`/`QuoteEvent` (migration `20261024190000_add_quote_requests`), com `QuoteStatus` (`REQUESTED → IN_REVIEW → ANSWERED → WON/LOST/CANCELLED/EXPIRED`), máquina de estados validada, snapshot de item (nome, slug, SKU, imagem, preço unitário e total) e **preço sempre recalculado no servidor**. `POST /api/v1/quotes` público (sem login), com agrupamento de itens repetidos, validação de nome/WhatsApp/e-mail, idempotência por chave (`IdempotencyKey`, escopo `quote:<telefone>`) e protocolo `publicId` devolvido ao solicitante; `GET /api/v1/quotes/:publicId` expõe apenas os dados do próprio solicitante, com telefone mascarado. **Nada reserva estoque, cobra ou cria pedido.** Testes unitários: `quotes.service.spec.ts` e `quote-status-machine.spec.ts`.
- [x] **E4 — Vendas:** **feito em 24/10/2026** — notificação `QUOTE_REQUESTED` enfileirada na transação (template `pt-BR` no seed + `NotificationPreference` com destinatário configurável por `QUOTES_SALES_EMAIL`/admin) e `QUOTE_STATUS_CHANGED` para o solicitante; `GET /api/v1/admin/quotes` (status, busca por protocolo/nome/telefone/empresa, paginação e contadores), `GET /api/v1/admin/quotes/:id` e `PATCH /api/v1/admin/quotes/:id/status` protegidos por `SessionGuard` + `quotes.manage`; **painel administrativo** ganhou a seção **Cotações** (`apps/admin/src/features/quotes/`) com fila, filtros, paginação, detalhe dos itens/observações e ações de status permitidas. Dados pessoais não são gravados em log.
- [ ] **E5 — Conteúdo Comercial do Norte:** trocar seed, logo, categorias reais, dados de contato aprovados, imagens e banners; retirar conteúdo do salão e brands hardcoded. No seed, cada produto precisa de variante com SKU único, preço, peso e dimensões (a maioria `ACTIVE`, alguns `DRAFT` para exercitar a fila de pendentes); imagens em WebP geradas localmente, **sem hotlink**; marcas provisórias com nome genérico ("Marca Exemplo") até o cliente enviar a lista oficial. Nunca inventar marca real, depoimento ou dado de cliente.
  - **Parcial em 24/10/2026 (seed/catálogo/banners/logo prontos):** `prisma/seed-catalog.ts` cria 8 categorias, marca provisória, 12 produtos demo (10 publicados, 2 em rascunho), variantes com SKU/peso/dimensões e imagens WebP locais; `default-home-banners.ts` foi reescrito com 3 banners de demonstração apontando para a storage local (fim dos 15 hotlinks do salão); o logo oficial da referência é convertido para WebP em `uploads/seed-brand/logo.webp` e ligado a `siteConfiguration.logoPath`. **Pendências:** confirmar dados cadastrais/contato oficiais, lista real de marcas e fotos reais; revisar textos herdados em `apps/storefront/src/content` durante a migração para Next (fase D).
- [ ] **E6 — Home e catálogo:** S0–S10, mega menu, campanhas, marcas, ofertas, categorias, mais vendidos se houver dados, “Explica Aí Comercial”, loja física e rodapé. CTA de cotação em cards, produto e carrinho.
- [x] **E7 — Busca:** **feito em 24/10/2026** — novo endpoint `GET /api/v1/catalog/products/search` com `search` (contains + `insensitive` no PostgreSQL), filtros por categoria/marca (incluindo marcas filhas), ordenação (`newest`/`name_asc`), paginação server-side (`page`/`pageSize`, limite 48) e `total`/`totalPages`; o catálogo do storefront usa a paginação do servidor com URLs estáveis (`?q=&categoria=&pagina=&ordem=`). Coberto por `catalog-search.spec.ts`. **Pendente:** índice trigram/GIN quando houver catálogo em escala (avaliar com dados reais) e ordenação por preço (preço vive na variante, exige desnormalização ou consulta dedicada).
- [ ] **E8 — Smoke tests e aceite:** visitante encontra produto → adiciona à cotação → envia formulário → vendas recebe → admin vê solicitação → visitante não tem checkout/pagamento. Validar mobile, teclado, a11y, LGPD, SEO e erros de rede.

**Aceite de negócio:** catálogo + cotação funciona de ponta a ponta, sem cobrar cliente, sem dados da outra empresa, e marketing opera o painel.

### Fase F — ERP e e-commerce completo (P2; só após decisão de produto)

- [ ] **F1 — ERP:** receber documentação oficial e acordo sobre fonte de verdade/IDs, mapeamento, auth, limites, logs, retries, conflitos, produtos DRAFT e reconciliação; só então implementar sync NestJS.
- [ ] **F2 — Checkout real:** corrigir fluxo de pagamentos e webhooks, estoque/reservas, frete/retirada, cupons, reembolso e conciliação; homologar com provedores e testes de concorrência reais. **Aceite:** duas reservas concorrentes não consomem a última unidade; webhook duplicado ou fora de ordem não duplica pagamento nem pedido; usuário sem permissão não executa ação administrativa crítica; pedido preserva snapshot de preço, frete e contato.
- [ ] **F3 — CMS próprio:** blocos e conteúdo editáveis no admin existente; se inspirar em UX de CMS sem instalar Payload.
- [ ] **F4 — Melhorias:** observabilidade, relatórios, automação de marketing, conta do cliente completa, desempenho do catálogo em escala e automação de deploy.

## 3. Achados técnicos que NÃO podem se perder

| ID | Severidade | Problema constatado no código legado / ação | Evidência |
|---|---|---|---|
| R01 | **P0** | O `payments.service.ts` atualiza o pagamento no webhook mas não demonstra transição automática do pedido para `PAID`; testar e corrigir ANTES de habilitar checkout. | `apps/api/src/modules/payments/payments.service.ts` |
| R02 | **P0** | `checkout` aceita `shippingCents` fornecido pelo cliente; não confiar em preço, frete ou total vindos da interface. A API precisa recalcular/verificar cotação de frete autenticada. | `apps/api/src/modules/checkout/checkout.service.ts` / `orders/orders.service.ts` |
| R03 | **P0** | `job-handlers.ts` é um mapa de no-ops; apenas `SEND_TRANSACTIONAL_EMAIL` é sobrescrito com implementação real em `jobs.module.ts:20`. `RELEASE_EXPIRED_RESERVATIONS`, `RECONCILE_PAYMENT`, `GENERATE_REPORT` e `CLEAN_EXPIRED_CARTS` só retornam `undefined` — o runner marca o job como concluído sem executar nada. Implementar antes de operar vendas/estoque. | `apps/api/src/modules/jobs/job-handlers.ts:5-11`, `jobs.module.ts:18-21` |
| R04 | **P0** | ~~Produto DRAFT acessível por slug~~ **Corrigido em 24/10/2026:** `getProductBySlug` passou a filtrar `status: ACTIVE`; coberto por `catalog-public-access.spec.ts` e validado no build compilado. | `apps/api/src/modules/catalog/catalog.service.ts` |
| R05 | **P0** | ~~`GET /orders/:publicId` pode não validar ownership~~ **Corrigido em 24/10/2026:** `OrdersService.getForUser(publicId, userId)` filtra por dono e devolve 404 para terceiros; coberto por `orders-ownership.spec.ts` e validado no build compilado. | `apps/api/src/modules/orders/orders.service.ts` |
| R06 | **P1** | Melhor Envio provider é stub e não consulta API real. Retirada traz rótulo legado “salão”. | `apps/api/src/modules/shipping/providers/{melhor-envio,pickup}.provider.ts` |
| R07 | **P1** | SEO usa `Jonas & Elivaldo` e domínio antigo; CSP também permite domínio do salão; corrigir durante Next/limpeza. | `apps/api/src/public-shell/seo-renderer.service.ts`, `apps/api/src/main.ts` |
| R08 | **P1** | Front filtra marca por lista hardcoded do cliente anterior e usa busca/paginação do catálogo no navegador. | `apps/storefront/src/pages/shop-page.tsx` |
| R09 | **P1** | `Category` é plana; Brand já oferece padrão de hierarquia reutilizável. | `prisma/schema.prisma` |
| R10 | **P1** | Fluxo de cotação e notificação para equipe de vendas não existem; fluxo de pedidos atual cobra/segura estoque. | `orders.service.ts`, `notifications`, `checkout` |
| R11 | P1 | **Parcialmente corrigido em 24/10/2026:** seed, banners default e nome padrão do schema não usam mais Jonas/Elivaldo; resta conteúdo herdado em `apps/storefront/src/content`, removido na migração Next. | `prisma/seed.ts`, `apps/api/src/modules/settings/default-home-banners.ts` |
| R12 | **P1** | `prisma/schema.prisma` e `migration_lock.toml` vinculados a MySQL; migrations SQL são específicas do dialeto. | `prisma/`, `scripts/repair-migration-history.ts` |
| R13 | **P1** | `public-shell` Nest legado pode conflitar com raiz Next/deploy de serviços separados. | `apps/api/src/public-shell/`, `apps/api/src/main.ts` |
| R14 | **P1** | CI não possui workflow ativo no snapshot; execução da suíte não comprovada nesta revisão. | `.github/workflows/` ausente |
| R15 | **P2** | Antigos testes institucionais referenciam rotas removidas; ajustar a contrato atual, não remover testes para ficar verde. | `apps/storefront/src/pages/institutional-pages.spec.tsx` |
| R16 | **P2** | CSS extenso duplicado e tokens de salão contradizem referência Comercial do Norte; `packages/ui` subaproveitado. | `apps/*/src/styles.css`, `packages/ui` |

**Severidade é de revisão estática; não significa exploração demonstrada.** Corrigir R04/R05 antes de abrir dados reais ao público; R01–R03/R06 são bloqueadores de **checkout de venda**, não necessariamente do MVP sem cobrança.

## 4. Catálogo e UI: critérios de aceitação completos

- **Design**: extrair tokens e componentes de `site-comercial-do-norte-html-referencia/`; manter identidade azul `#264887`, vermelho `#E33C34`, fundo `#F4F7FB`, Lufga/Plus Jakarta Sans, ícones Lucide e responsividade.
- **Navegação**: header, busca, mega menu hierárquico, campanha editável, produtos, categorias, marcas, mini-carrinho e rodapé.
- **Cotação**: visitante não precisa criar conta; quantidade editável; captura dados necessários; formulário acessível; API idempotente; notificação para vendas; histórico e estado no admin.
- **Publicação**: Produto DRAFT invisível tanto em busca/lista quanto em detalhes; preço/categoria/variante/imagem com regras comerciais explícitas; o marketing publica.
- **SEO**: título, descrição, canonical, sitemap, robots, OG, JSON-LD quando aplicável, URLs limpas e noindex de páginas privadas/rascunhos.
- **Qualidade**: sem warnings críticos de React/hydration, sem links quebrados, imagens redimensionadas, 404 correto, validação de tudo no Nest, smoke tests em produção/homologação, testes automatizados e evidência de sucesso.

## 5. Regras da migração e das branches

1. Não executar `prisma migrate reset` nem apagar migrations legadas num banco existente sem **verificação explícita** do banco e backup. Como não há produtos, o caminho de **PostgreSQL vazio** é preferível, mas ainda precisa verificar users/settings/banners.
2. Registrar todos os arquivos e scripts que dependem de MySQL; adaptar SQL com identificadores entre aspas duplas (`"InventoryBalance"`, por exemplo), sem injeção, preservando transação e locks.
3. Não misturar refatoração visual extensa no commit que troca provider do Prisma. Usar PRs/commits pequenos e reversíveis, scripts com `--dry-run` quando possível.
4. O frontend migrado usa o Nest via contratos compartilhados; não adicionar Prisma ao Next nem inventar endpoints BFF permanentes para contornar a API.
5. Fase 1 aprovada = cotação; funcionalidades herdadas de pagamentos e treinamentos permanecem isoladas. Uma evolução para loja com pagamento requer decisão e homologação independentes.
6. Não alterar ao mesmo tempo o banco que opera vendas e a implementação de checkout. Homologar em staging antes do cutover.

## 6. Documentação — estado final

A documentação oficial é **somente**:

- `docs/memory-ai.md` — decisões, contexto e padrões.
- `docs/roadmap.md` — este arquivo.
- `docs/security/lgpd-data-map.md` e `docs/security/threat-model.md` — complementos de segurança/LGPD, sem repetir decisões de produto.

Removidos do worktree em 24/10/2026 (preservados no commit `5781590`, acessíveis por `git show 5781590:<caminho>`):

| Removido | Motivo |
|---|---|
| `prompts-memory-ai/**` (9 arquivos, incl. `permanente/`) | memória antiga e contraditória; consolidada nos dois arquivos atuais |
| `docs/superpowers/**` (planos e specs) | engenharia da base Jonas, sem valor de decisão atual |
| `docs/acceptance/mvp.md` | MVP com checkout/Pix/treinamento; substituído por cotação |
| `docs/decisions/phase-1-gates.md` | gates de MySQL/Hostinger; substituído pela fase A/B deste roadmap |
| `docs/runbooks/hostinger-*.md`, `docs/runbooks/local-laragon.md` | deploy MySQL/processo único; runbook novo entra em D7 (VPS Next + Nest + PostgreSQL) |
| `docs/migration/**` | importação WooCommerce da loja anterior; não é especificação do ERP |
| `docs/testing/strategy.md` | camadas e gates já absorvidos em A2/A4 e na seção 4 |
| `docs/ui-design/**` | design preto/dourado da Jonas; a identidade oficial está em §3 do `memory-ai.md` |
| `docs/README.md`, `docs/_archive/**` | índice e backups que só existiam para os documentos acima |
| pacote `COMERCIAL-DO-NORTE-MEMORIA-IA-2026-10-24` (Downloads) | origem da memória consolidada; apagado |

**Regra:** não recriar cópias, `*-old.md`, `*-backup.md`, `*-v2.md` ou pastas de arquivo dentro do repositório. O histórico é o Git.

## 7. Histórico consolidado (curto, com fatos e sem duplicações)

| Data | Registro |
|---|---|
| 11/09–03/10/2026 | Base Jonas & Elivaldo construída com NestJS, Prisma/MySQL, React/Vite, admin, catálogo, pagamentos, CRM/treinamentos e documentação legada. |
| 20–21/10/2026 | Decisões de produto Comercial do Norte: fase 1 catálogo + cotação; ERP depois; layout varejista, azul/vermelho, “Explica Aí Comercial”. |
| 23/10/2026 | Primeiras adaptações ao novo cliente; repositório incorpora a referência visual HTML e estudos de Payload como ideias, sem adoção como backend. |
| 24/10/2026 (`5781590`) | Antigo agente reorganizou `prompts-memory-ai`, `permanente` e `ui-design`; produziu auditoria de código, backlog e changelog, ainda com escolhas antigas de stack. |
| **24/10/2026 — decisão do responsável** | **Escolhida a stack Next.js + NestJS + PostgreSQL + Prisma + Tailwind CSS + shadcn/ui, monorepo e componentes compartilhados.** Medusa/Payload/TanStack Start excluídos da implementação; manter fase 1 cotação. |
| **24/10/2026 — esta revisão** | Contexto histórico e auditoria consolidados em **dois Markdown**; tarefas de migração formalizadas; **nenhuma alteração de código, banco, deploy ou GitHub afirmada**. |
| **24/10/2026 — consolidação final** | Documentação reduzida a `docs/memory-ai.md` + `docs/roadmap.md` + `docs/security/`; **31 arquivos legados** (22 de `docs/` + 9 da memória antiga) e a pasta `prompts-memory-ai/` removidos do worktree; pacote de memória em Downloads apagado. Histórico preservado no commit `5781590`. **Nenhum código, banco ou migration alterado.** |
| **24/10/2026 — execução (branch `feat/stack-next-postgres`)** | Dependências instaladas (store local), `typecheck`/`lint` 6/6, build OK na API e bloqueado no Vite pelo sandbox; **R04 e R05 corrigidos** com testes; Prisma migrado para PostgreSQL, SQL nativo adaptado e busca case-insensitive; PostgreSQL 18 local provisionado por script; **CI criado**; migration baseline PostgreSQL bloqueada pelo sandbox (`spawn EPERM` no `schema-engine`). |
| **24/10/2026 — cotação + Next + CI verde** | Migration PostgreSQL gerada pelo Prisma no runner e validada (`57 tabelas` com cotação); **domínio de cotação** (`Quote/QuoteItem/QuoteEvent`, `POST /quotes` público, fila admin `quotes.manage`, notificações); **storefront migrado para Next.js 16** com tokens oficiais e fluxo de cotação completo; **shell/SEO legado removido**; **CI verde** no run `40116859387` (commit `7a64b64`) com lint/typecheck/testes/build incluindo `next build`. |

### Protocolo de manutenção daqui em diante

Após **cada etapa concluída**, substituir `[ ]` por `[x]` com evidência: data, branch/commit, comandos de teste, resultado, migrações aplicadas e rollback. Inserir uma linha nova no histórico **deste arquivo** em vez de criar `changelog.md` extra. Se o requisito mudar, atualizar `memory-ai.md` no mesmo commit.

**Critério principal de encerramento:** stack nova implementada e testada, projeto rodando em Next + Nest + PostgreSQL, UI padronizada em Tailwind/shadcn, negócio de cotação funcional, e nenhuma dependência de Medusa ou Payload.
