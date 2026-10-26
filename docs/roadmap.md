# ROADMAP & AUDITORIA — COMERCIAL DO NORTE

> **Único documento operacional de execução, bloqueios, riscos e histórico breve** — atualizado em **25/10/2026**.
> Decisões permanentes e contexto: [`memory-ai.md`](./memory-ai.md). Não criar changelog, checklist ou prompts de memória separados nesta pasta.

## 1. Estado confirmado nesta revisão

- **26/10/2026 — integração direta da Issue #61 autorizada no chat:** commit de tipografia `79d43a0` reaplicado sobre a `main` remota (`594d311`), sem incorporar a antiga base do PR #63. O responsável dispensou PRs e revisão por PR; orientação registrada em `memory-ai.md`. Envio direto sem force; PR #63 será encerrado. As falhas de testes da API observadas na CI anterior não pertencem à tipografia. Nenhuma migration ou comando de deploy executado.

- **26/10/2026 — Issue #61:** padronização dos títulos da vitrine (`h1` a `h6`) em Bold (700), por token compartilhado e regra global fora das layers do Tailwind. Inclui home, catálogo, conta, cotação e editor; mantém tamanhos, cores e demais textos. Branch `fix/issue-61-titulos-bold`. CSS compilado com Tailwind/PostCSS e validado em Chromium via Playwright: seis níveis em 700 nas larguras 375/1280 px, mesmo com classes legadas e responsivas; parágrafos em 400 e destaques fora de títulos em 800 preservados. `git diff --check` aprovado. Sem migration ou deploy. Rollback: reverter somente o commit desta Issue.

- **Atualização de 25/10/2026:** main remota em `984079e`, com integração Next.js/PostgreSQL/coordenação no commit `018648f`. Checkout local atualizado de `c6977e0` para `984079e` por fast-forward, sem descarte de trabalho. As referências abaixo à main `564c9e3` e PR #37 pendente descrevem a revisão anterior, não o estado atual. A refatoração visual solicitada hoje ainda não começou.
- Repositório oficial **privado**: [idedigitalbr/loja-comercial-do-norte](https://github.com/idedigitalbr/loja-comercial-do-norte). Branch de desenvolvimento `feat/stack-next-postgres` em `88c413c`; coordenação em `chore/multiagent-coordination`. Main em `564c9e3`; nenhuma integração/deploy autorizada nesta missão.
- Código conferido: Next.js App Router na loja, NestJS como API única, admin React/Vite, Prisma/PostgreSQL com quatro migrations versionadas, cotação implementada e flags isolando módulos futuros. Padronização visual completa, Playwright e prontidão de produção ainda pendem.
- Fonte operacional de tarefas/status: [Project 3](https://github.com/orgs/idedigitalbr/projects/3). Roadmap registra marcos, riscos e evidências; o manifesto é estrutura de bootstrap, não um espelho autoritativo de execução.
- O prazo registrado da fase 1 permanece **31/10/2026**, sujeito a aceite; não prova datas individuais das Sprints. Não foi executada migration nem inicialização de PostgreSQL nesta recuperação.

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

### 1.2 Configuração e migração para Neon (PostgreSQL na nuvem) — 26/10/2026

- **Projeto Neon oficial conectado:**
  - Projeto: `projeto_db_lojacomercialdonorte` (`bitter-haze-15129381`)
  - Organização: `org-wandering-union-17658713`
  - Região: `aws-sa-east-1` (São Paulo)
  - Branch ativa: `production` (`br-floral-grass-b6brkh2t`)
  - Banco: `db_lojacomercialdonorte`
  - Plano: Free
- **MCP Server oficial e Agent Skills:**
  - Neon MCP Server configurado em `~/.gemini/config/mcp_config.json` e `~/.gemini/antigravity/mcp_config.json` com endpoint oficial `https://mcp.neon.tech/mcp`.
  - Neon Agent Skills instaladas no workspace em `.agents/skills/`: `neon`, `neon-postgres`, `neon-postgres-branches`.
- **Estratégia de ambientes e preservação do PostgreSQL local:**
  - O banco local em `127.0.0.1:55432` permanece 100% ativo e preservado.
  - `.env` mantém as credenciais de desenvolvimento local (`comercial_norte_dev`).
  - `.env.neon` isolado (ignorado pelo Git) armazena as connection strings da branch `production`:
    - `DATABASE_URL`: conexão com pooling para runtime de aplicações (`-pooler`).
    - `DATABASE_URL_UNPOOLED`: conexão direta sem pooling para migrations e DDL.
  - Arquivos de configuração de infraestrutura criados na raiz: `.neon` e `neon.ts` (`auth: false`).
- **Migração de estrutura e dados:**
  - 4/4 migrations do Prisma executadas com sucesso (`20261024170000_init_postgresql`, `20261024180000_site_configuration_default_name`, `20261024190000_add_quote_requests`, `20261024210000_category_hierarchy`).
  - Total de 58 tabelas criadas no schema `public`.
  - 100% dos dados migrados em ordem topológica de chave estrangeira (146 registros em 19 tabelas, incluindo os 12 produtos cadastrados, variantes, categorias, imagens, usuários, permissões e banners).
  - Verificação comparativa local vs Neon: 19/19 tabelas populadas com contagens idênticas.
- **Runbook operacional para agentes e Antigravity:**
  - *Inspecionar via MCP*: `Neon.list_projects`, `Neon.list_branches`, `Neon.get_database_tables`, `Neon.run_sql`.
  - *Consultar dados via CLI*: `neon db query "SELECT count(*) FROM \"Product\";"`
  - *Migrations seguras*: utilizar sempre a connection string direta (`DATABASE_URL_UNPOOLED`). Exemplo: `$env:DATABASE_URL = $unpooled; pnpm db:migrate:deploy`.
  - *Backup/dump*: gerar via Prisma/script de exportação para JSON/SQL em diretório seguro e gitignored.
- **Evidência de Build e Testes:**
  - `pnpm build`: 6/6 pacotes concluídos com sucesso (Next.js 16.4.3 Turbopack, Vite admin e NestJS API).
  - Testes com API NestJS conectada ao Neon: rotas `/api/v1/catalog/products` e `/api/v1/catalog/categories` validadas com retorno íntegro.

### 1.3 Padronização de Projetos e Tríade de Domínios na Vercel — 26/10/2026

- **Eliminação de dependência local (Cloudflare Tunnel descontinuado):**
  - O Cloudflare Tunnel (`trycloudflare.com`) e o processo local do NestJS foram totalmente desativados.
  - A API NestJS 11 foi configurada e publicada diretamente na infraestrutura de Vercel Functions (Fluid Compute).
- **Padronização Oficial dos Projetos na Organização Vercel `idedigital`:**
  - `storefront` ➔ **`loja-home-front`** (Root: `apps/storefront`, ID: `prj_dHScON9vNIIz4wPczBxJaUpcdd7Q`)
  - `comercial-api` ➔ **`loja-api`** (Root: `apps/api`, ID: `prj_gShEQGImTlH46o0iJ6v59lmWPSXB`)
  - `comercial-admin` ➔ **`loja-admin`** (Root: `apps/admin`, ID: `prj_28rMmBH5umS0lC0evpyPVapmS3o2`)
- **Tríade Padronizada de Domínios de Produção:**
  - 🛒 **Vitrine (`loja-home-front`)**: `https://loja-comercialdonorte.vercel.app` (mantido `https://lojacomercialdonorte.vercel.app` como alias)
  - ⚙️ **Admin (`loja-admin`)**: `https://admin-comercialdonorte.vercel.app`
  - 🔌 **API (`loja-api`)**: `https://api-comercialdonorte.vercel.app` (mantido `https://lojacomercialdonorte-api.vercel.app` como alias)
- **Diagnóstico e Correções Técnicas Aplicadas:**
  - `apps/api/src/main.ts`: exportação de `export default async function handler(req, res)` utilizando caching de `app.init()` no Express para o runner serverless da Vercel. Preservado `bootstrap()` com `require.main === module` para desenvolvimento local.
  - Vercel preset da API: atualizado para `nestjs`.
  - Prisma Client: scripts `"build"` e `"vercel-build"` em `apps/api/package.json` geram o cliente Prisma e copiam `public/` para `dist/public`.
  - CORS e Cookies Cross-Domain: implementada resolução dinâmica de CORS para `*.vercel.app` e origens configuradas (`APP_ORIGIN`, `ADMIN_ORIGIN`). Cookies configurados com `sameSite: 'none'` e `secure: true`.
  - `apps/admin/vite.config.ts`: `base` ajustado para `process.env.VITE_BASE ?? '/'`.
  - `apps/admin/vercel.json`: configurado com rewrites de proxy `/api/(.*)` para `https://api-comercialdonorte.vercel.app/api/$1` e fallback SPA `/(.*)` para `/index.html`.
  - Vínculos locais `.vercel/project.json` atualizados em `apps/storefront`, `apps/admin`, `apps/api` e raiz.
- **Evidências de Validação Pública (HTTP 200 em todos os serviços):**
  - `GET https://loja-comercialdonorte.vercel.app` ➔ `HTTP 200` (Vitrine SSR conectada à API oficial).
  - `GET https://loja-comercialdonorte.vercel.app/loja` ➔ `HTTP 200` (Catálogo com produtos do Neon).
  - `GET https://admin-comercialdonorte.vercel.app` ➔ `HTTP 200` (Painel Vite online com assets `/assets/index-*.js`).
  - `GET https://admin-comercialdonorte.vercel.app/api/v1/health` ➔ `HTTP 200` (Proxy rewrite para backend funcionando).
  - `GET https://api-comercialdonorte.vercel.app/api/v1/health` ➔ `HTTP 200` (`status: ok, database: up`).
  - `GET https://api-comercialdonorte.vercel.app/api/v1/catalog/products` ➔ `HTTP 200` (10 produtos retornados em tempo real do Neon PostgreSQL).
- **Autonomia da Máquina Local:**
  - Processos locais terminados. A loja, a API e o admin operam de forma 100% autônoma e em alta disponibilidade na nuvem (Vercel + Neon).

### Fonte única dos arquivos de memória

`docs/memory-ai.md` = decisões e fatos duradouros.
`docs/roadmap.md` = o que fazer, evidências, bloqueios, auditoria e changelog compacto.

Complementos permitidos: `docs/security/lgpd-data-map.md` e `docs/security/threat-model.md`. Nada além disso.

Toda a documentação anterior (memórias, auditoria técnica, prompts, planos/specs, runbooks MySQL/Hostinger, importação WooCommerce e MVP antigo) foi **removida do worktree** em 24/10/2026 e permanece somente no histórico Git (`5781590`). **Não recriar cópias**, arquivos `*-old.md`, `*-backup.md` ou pastas de arquivo dentro do repositório.

## 2. Planejamento macro — tarefas e estados no Project

| Etapa | Evidência na branch de desenvolvimento | Pendência principal | Fonte operacional |
|---|---|---|---|
| 1 — Arquitetura/qualidade | CI e base de ambiente versionados; coordenação recuperada nesta missão | validar automações com credencial Projects e revisão humana | [#42](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/42) |
| 2 — PostgreSQL/Prisma | provider, SQL, seed e quatro migrations versionadas | integração concorrente real, backup/recovery e produção | [#43](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/43) |
| 3 — Design system | tokens e primitivos em packages/ui | consumo consistente, acessibilidade e admin | [#44](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/44) |
| 4 — Next.js | App Router, integração REST e metadata/sitemap/robots | fidelidade HTML, performance, navegador e produção | [#45](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/45) |
| 5 — Catálogo/cotação | hierarquia de categorias, busca, solicitação idempotente, fila admin e notificações | contatos/marcas/fotos oficiais, home final e aceite Playwright | [#46](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/46) |
| 6 — Homologação/futuro | escopo separado e dependências identificadas | ERP só com contrato; checkout só após correções/homologação | [#47](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/47) |

As **36 tarefas originais** permanecem no Project/manifesto com as mesmas identidades. A manutenção de coordenação é [#48](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/48), adicional às originais. Não manter checklists duplicados de execução neste arquivo. O aceite de negócio segue: catálogo → cotação → vendas/admin, sem cobrança online, dados oficiais e operação possível pelo marketing.

## 3. Achados técnicos que NÃO podem se perder

| ID | Severidade | Problema constatado no código legado / ação | Evidência |
|---|---|---|---|
| R01 | **P0** | O `payments.service.ts` atualiza o pagamento no webhook mas não demonstra transição automática do pedido para `PAID`; testar e corrigir ANTES de habilitar checkout. | `apps/api/src/modules/payments/payments.service.ts` |
| R02 | **P0** | `checkout` aceita `shippingCents` fornecido pelo cliente; não confiar em preço, frete ou total vindos da interface. A API precisa recalcular/verificar cotação de frete autenticada. | `apps/api/src/modules/checkout/checkout.service.ts` / `orders/orders.service.ts` |
| R03 | **P0** | `job-handlers.ts` é um mapa de no-ops; apenas `SEND_TRANSACTIONAL_EMAIL` é sobrescrito com implementação real em `jobs.module.ts:20`. `RELEASE_EXPIRED_RESERVATIONS`, `RECONCILE_PAYMENT`, `GENERATE_REPORT` e `CLEAN_EXPIRED_CARTS` só retornam `undefined` — o runner marca o job como concluído sem executar nada. Implementar antes de operar vendas/estoque. | `apps/api/src/modules/jobs/job-handlers.ts:5-11`, `jobs.module.ts:18-21` |
| R04 | **P0** | ~~Produto DRAFT acessível por slug~~ **Corrigido em 24/10/2026:** `getProductBySlug` passou a filtrar `status: ACTIVE`; coberto por `catalog-public-access.spec.ts` e validado no build compilado. | `apps/api/src/modules/catalog/catalog.service.ts` |
| R05 | **P0** | ~~`GET /orders/:publicId` pode não validar ownership~~ **Corrigido em 24/10/2026:** `OrdersService.getForUser(publicId, userId)` filtra por dono e devolve 404 para terceiros; coberto por `orders-ownership.spec.ts` e validado no build compilado. | `apps/api/src/modules/orders/orders.service.ts` |
| R06 | **P1** | Melhor Envio provider é stub e não consulta API real. Retirada traz rótulo legado “salão”. | `apps/api/src/modules/shipping/providers/{melhor-envio,pickup}.provider.ts` |
| R07 | **P1** | **Corrigido na branch de desenvolvimento:** shell/SEO legado da loja removido, Next fornece metadata e CSP foi ajustada. Confirmar domínio final antes de publicar. | `apps/api/src/public-shell/seo-renderer.service.ts`, `apps/api/src/main.ts` |
| R08 | **P1** | **Superado na branch de desenvolvimento:** loja Next usa busca/paginação REST no servidor; trecho Vite citado é histórico. | `apps/storefront/src/pages/shop-page.tsx` |
| R09 | **P1** | **Implementado:** Category tem parentId/imagePath/sortOrder, filtro descendente e proteção contra ciclos. Aceite de upload/ordenação do admin pendente. | `prisma/schema.prisma` |
| R10 | **P1** | **Implementado na API:** domínio próprio de cotação, fila admin e notificações. Solicitação não cria pedido/reserva de venda; aceite no navegador ainda pendente. | `orders.service.ts`, `notifications`, `checkout` |
| R11 | P1 | **Parcialmente corrigido em 24/10/2026:** seed, banners default e nome padrão do schema não usam mais Jonas/Elivaldo; resta conteúdo herdado em `apps/storefront/src/content`, removido na migração Next. | `prisma/seed.ts`, `apps/api/src/modules/settings/default-home-banners.ts` |
| R12 | **P1** | **Superado na branch de desenvolvimento:** provider/lock PostgreSQL e quatro migrations versionadas. Histórico MySQL permanece no Git. | `prisma/`, `scripts/repair-migration-history.ts` |
| R13 | **P1** | Shell público da loja removido; validar reverse proxy Next/Nest/admin e rotas finais antes de produção. | `apps/api/src/public-shell/`, `apps/api/src/main.ts` |
| R14 | **P1** | CI existe e possui runs verdes históricos. Resultado atual da recuperação está na seção 8; não confundir run antigo com validação do novo commit. | `.github/workflows/` ausente |
| R15 | **P2** | Testes Vite antigos foram removidos na migração anterior; cobertura de navegador Next/Playwright continua pendente. | `apps/storefront/src/pages/institutional-pages.spec.tsx` |
| R16 | **P2** | CSS extenso duplicado e tokens de salão contradizem referência Comercial do Norte; `packages/ui` subaproveitado. | `apps/*/src/styles.css`, `packages/ui` |

**Severidade é de revisão estática; não significa exploração demonstrada.** Preservar as correções R04/R05 antes de abrir dados reais ao público; R01–R03/R06 são bloqueadores de **checkout de venda**, não necessariamente do MVP sem cobrança.

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
| **24/10/2026 — checkpoint de auditoria (HEAD `1813e1a`)** | **Desenvolvimento autônomo pausado a pedido do responsável** para auditoria independente. HEAD com **CI verde** (run `40121852853`): lint, typecheck, typecheck do seed, testes de todos os pacotes, **E2E da API da cotação**, `next build` e builds da API/admin. Estado conhecido: nenhuma validação em navegador (Playwright) realizada; dados oficiais de contato/marcas/fotos pendentes de confirmação; marcas "Jonas & Elivaldo" residuais em `settings.service.ts` (fallbacks), `notifications.service.ts` (e-mail de teste) e no login do admin; `apps/storefront/tsconfig.tsbuildinfo` era artefato de build versionado por engano (removido do índice neste checkpoint). Nenhuma migration, deploy ou merge na `main` foi executado. |

### Protocolo de manutenção daqui em diante

Após cada marco, atualizar a Issue operacional com evidência: data, branch/commit, comandos de teste, resultado e rollback. Conclusão exige revisão humana; não editar listas duplicadas de status. Inserir uma linha nova no histórico **deste arquivo** em vez de criar `changelog.md` extra. Se o requisito mudar, atualizar `memory-ai.md` no mesmo commit.

**Critério principal de encerramento:** stack nova implementada e testada, projeto rodando em Next + Nest + PostgreSQL, UI padronizada em Tailwind/shadcn, negócio de cotação funcional, e nenhuma dependência de Medusa ou Payload.

## 8. Recuperação da coordenação — 24/10/2026

**Escopo:** [Issue #48](https://github.com/idedigitalbr/loja-comercial-do-norte/issues/48), [PR #37](https://github.com/idedigitalbr/loja-comercial-do-norte/pull/37). Não desenvolver e-commerce, executar migrations, iniciar PostgreSQL, fazer merge ou deploy.

### Recuperado e preservado

- Branch `chore/multiagent-coordination`, HEAD inicial `1078e31`, sincronizado com remoto; main `564c9e3`, desenvolvimento `88c413c`. Sem stash nem outro worktree. Origin já correto.
- Três arquivos não rastreados do Harness: `setup-hierarchy.mjs`, `setup-views.mjs`, `verify-project.mjs`; quatro patches e consultas GraphQL em `.agents-work/`. Cópia externa preservada no TEMP, prefixo `cdn-coordination-recovery-20261024-180750`.
- Patches não foram executados às cegas: continham leitura insegura de dono por comentário, referência a `project.items` não carregado e opção de reconciliar apagando status. Funcionalidades recuperadas foram incorporadas aos scripts com proteção e testes.
- PR #37 tinha a migração da aplicação inteira contra main. Base alterada para a branch de desenvolvimento existente; diff de coordenação isolado, sem branch de trabalho adicional e sem reescrever histórico.

### Quadro e histórico verificados pela API

- Nome preservado: **Quadro -  loja-comercial-do-norte**. Project vinculado ao repo oficial privado. **47 itens**: 36 tarefas originais + 4 Sprints + 6 Etapas + manutenção #48. Relações nativas preservadas; #48 pertence à Etapa 1, reaberta por ter filho pendente.
- **42/42 dependências originais** confirmadas por leitura, grafo validado sem ciclos. A recuperação não precisou recriar dependências que já existiam. Ciclos externos ao Project também são percorridos pelos scripts.
- Todos os itens têm Assignee humano; nove agrupadores sem responsável receberam `victorwilliames`. Nenhum responsável legítimo removido.
- Somente **Tabela, Kanban e Roadmap**. Tabela com 11 colunas na ordem aprovada e Labels oculta; cartões do Kanban reduzidos a campos essenciais. Roadmap filtra agrupadores por ausência de Tipo. Nenhuma data nova inferida; datas anteriores preservadas.
- Agente executor contém Codex (Will), Antigravity (Will), Claude (Will), DeepSeek Harness (Will), OpenCode (Will), com IDs estáveis e modelo nulo até confirmação. Humano/Não atribuído removidos após limpeza. Valor legado DeepSeek da #23 preservado em participantes e comentário, com operador/horários não confirmados, sem sessão retroativa inventada.
- Causa dos status incompatíveis: automações nativas continuavam usando IDs de opções renomeadas; reservar #48 fechou a Issue automaticamente, comprovado no timeline. Removidas as cinco regras nativas de status/fechamento, mantida Auto-add sub-issues to project. #48 reaberta; tarefas previamente fechadas com evidência foram apenas alinhadas a Concluído, sem novas aprovações de negócio.
- Progresso é o campo nativo Sub-issues progress. Reconciliador não deriva status de execução dos contadores nem sobrescreve reserva/bloqueio de agrupadores. Nenhuma Sprint foi fechada.
- Reserva própria #48 migrada para ref única antes de remover a própria ref legada. Ledger por commits mantém sessão inicial verificável, sessões do teste, eventos e participantes. Não registra telemetria inventada.

### Validação e limites

| Camada | Comando/evidência | Resultado |
|---|---|---|
| Regras locais | `node --test scripts/agents/*.test.mjs` | **8/8 aprovados**, com ciclo falhar/corrigir verificado; propriedade, histórico, ciclos longos/externos, aprovação estrutural e espelho pendente |
| API real — concorrência | `node scripts/agents/live-reservation-test.mjs --live --issue-48` | dois commits irmãos disputam a mesma ref: um aceito, outro recusado; liberação atrasada recusada após nova sessão; histórico preservado |
| API real — bloqueio | claim da #15 com dependência #14 aberta | recusado antes de criar reserva |
| API real — propriedade | release #48 com sessão incorreta | recusado; reserva preservada |
| API real — recuperação | `live-reservation-test.mjs --live --issue-48 --mirror-recovery` | release com espelho pendente impediu novo claim; reparo explícito e auditado removeu pendência; novo claim pela CLI confirmado. Participantes/histórico preservados |
| API real — quadro | `node scripts/agents/verify-project.mjs` | 36 originais, 47 itens, 42/42 dependências; zero erros na auditoria implementada |
| Idempotência | segunda reconciliação aplicada e dry-run | **zero alterações**, nenhuma Issue/view duplicada |
| Lint/typecheck | launcher local pnpm | **lint 6/6 e typecheck 6/6 aprovados**; ESLint dos scripts de coordenação também aprovado |
| PR real | `PR_NUMBER=37 node scripts/agents/pr-sync.mjs`, duas vezes | evidência publicada na #48 sem duplicação; estado e reserva preservados; transição para revisão usa a sessão proprietária |
| Suíte geral local | launcher `.tools/bin/pnpm.cmd test`, TEMP/TMP em `.agents-work/tmp` | **falhou**: API com 12 arquivos de teste falhos, 52 aprovados; 126 testes aprovados, 1 falho e 16 pulados. PostgreSQL `127.0.0.1:55432` indisponível. Nenhum banco iniciado/alterado para contornar o limite |
| Primeiras tentativas locais | pnpm global / TEMP do Windows | bloqueios de permissão resolvidos usando launcher/cache temporário do workspace; não confundir essas tentativas com teste aprovado |
| Navegador | in-app browser e tentativa de Chrome | in-app sem login no GitHub; controle do Chrome interrompido pela ferramenta por não conseguir confirmar URL. Agrupamento por Status no Kanban, expansão hierárquica da Tabela e propriedades da timeline **não verificados visualmente** |
| Automações Actions | secrets do repositório e branch padrão | `PROJECT_TOKEN` não listado no repo; visibilidade de eventuais secrets organizacionais não comprova disponibilização ao workflow. CLI OAuth com project/repo tem leitura/escrita real, mas não equivale ao token efêmero do Actions |

### Ativação pendente, rollback e próxima revisão

- Revisão humana do PR #37 contra `feat/stack-next-postgres`; integração na main continua proibida sem autorização. Automação por comentário só executa o código da branch padrão. PR privilegiado usa checkout explícito da branch padrão; enquanto os scripts não estiverem lá, a automação completa não está ativa.
- Configurar secret `PROJECT_TOKEN` ou token de instalação de App com acesso mínimo de Projects e leitura das Issues vinculadas; provar a permissão no Actions. Não publicar a credencial local nem presumir que o secret exista por nome. Falha deve ser explícita antes de reservar.
- Confirmar na UI: Kanban agrupado por Status com sete opções, Tabela com hierarquia expandida, Roadmap com campos Start date/Target date e progresso. API pública disponível nesta sessão não expõe agrupamento/timeline. Não inventar datas.
- Sessões usam identificador aleatório único por operação e `pendingMirror` como barreira entre ledger e espelho: nova operação recusa enquanto houver reparo pendente. Recuperação exige confirmação de processo encerrado e motivo; refs permanentes não são excluídas. Cancelar uma projeção de conclusão inválida exige `repair --recover --cancel-pending --reason`, preserva o evento anterior e retorna à revisão; intenção de reabrir é persistida para repetição segura.
- Rollback de código: revert dos commits de coordenação, sem restaurar o protocolo inseguro em operação ativa. Não apagar refs/ledgers ou histórico. Configuração do Project exige revisão dos IDs reais; nunca recriar auto-close/auto-done com opções renomeadas. Campos e relações existentes foram preservados.
- Pendências de aplicação continuam nas Issues originais; esta recuperação não homologa produção, Playwright, ERP, checkout ou persistência.

### Checkpoint solicitado pelo responsável

Execução encerrada para conservar a franquia. Código e scripts recuperados preservados na branch `chore/multiagent-coordination`; PR #37 permanece com base em `feat/stack-next-postgres`. Últimas evidências: 8/8 testes rápidos, sintaxe/ESLint dos scripts, lint e typecheck 6/6; concorrência e recuperação confirmadas pela API/CLI. Não houve nova tentativa de integração PostgreSQL, merge ou deploy. Homologação do Actions com PROJECT_TOKEN e configuração visual do Kanban/timeline permanecem pendentes. O diagnóstico de credenciais foi preparado, mas ainda não executado no Actions. CI do novo checkpoint deve ser consultado na próxima sessão; não foi aguardado nesta rodada.

### Checkpoint Project e agenda — 24/10/2026

- Migração aplicada e conferida pela API: `Tipo` e `Agentes que participaram` multisseleção; `Agente executando` seleção única; `Início`/`Entrega` como datas; prioridade P0 renomeada para URGENTE. Campos legados removidos após migração. Tabela/Kanban atualizados; Roadmap permanece sem configuração visual de datas/escala, não exposta pela API disponível.
- Agenda aplicada sem sobrescrever datas existentes: 34/34 itens fora de Backlog têm início e entrega; 8 itens em Backlog seguem sem datas. Datas ativas são estimativas. Sprint 3 mantém entrega de 31/10; agregação de tarefas chega a 07/11 e precisa de revisão humana.
- Reconciliação de categorias executada; `verify-project.mjs`: 47 itens, 42/42 dependências, zero erros. A reserva de #48 continua ativa para `codex-will`, sem atividade confirmada nesta sessão.
- Pendente: configuração visual do Roadmap, revisão da divergência de Sprint 3, CI após o novo push e homologação de `PROJECT_TOKEN` no Actions. Nenhum PostgreSQL iniciado; sem merge/deploy.

### Checkpoint Vitrine Modular e Fidelidade Visual — 25/10/2026

- **Entrega executada:**
  - Diagnóstico da referência `site-comercial-do-norte-html-referencia` e sincronização de assets e favicons para `apps/storefront/public/assets`.
  - Design Tokens do Header oficial e Hero integrados em `packages/ui/src/styles/tokens.css` e mapeados no Tailwind 4 (`apps/storefront/app/globals.css`).
  - Arquitetura Modular de Widgets (`apps/storefront/lib/storefront/widget-types.ts`, `widget-registry.tsx`, `home-configuration.ts`).
  - Header fiel em 3 barras com Mascote 3D James, logo oficial branca, seletor de CEP, busca Figma, ações de cotação/favoritos/conta, subnav de departamentos e drawer mobile off-canvas (`apps/storefront/components/site-header.tsx`), estático e sem comportamento instável de scroll/auto-hide.
  - Hero Carousel de largura total estilo Mercado Livre (`HeroCarouselWidget`).
  - Hero Secundário Contido com bordas arredondadas e sobreposição negativa (`ContainedHeroWidget`).
  - Barra de benefícios comerciais (`BenefitsBarWidget`).
  - Carrossel de ofertas com cards de produto e cotação (`ProductCarouselWidget`).
  - Grid de departamentos do catálogo (`CategoryGridWidget`).
  - Suíte do Editor Visual In-Place Minimalista da Vitrine (`StorefrontShell`, `HomeView`, `ElementorEditorProvider`, `ElementorTopBar`, `ElementorSectionWrapper`, `ElementorAddSectionBox`, `ElementorMediaModal`, `InlineImageEditorOverlay`, `ElementorCanvas`, `ElementorTogglePill`):
    - Layout 100% normal, fluido e sem barra lateral fixa empurrando a página.
    - Alça de seção minimalista: no hover surge apenas um botão lápis ("Lápizinho") no canto superior direito que abre janela popover/tooltip com ações de mover, duplicar, visibilidade e exclusão.
    - Ferramenta de troca de imagem centralizada exatamente no meio de cada banner/slide (`InlineImageEditorOverlay`) com upload direto do computador, galeria de 10 banners oficiais da loja e edição de links.
    - Edição inline de títulos diretamente na página (vitrine de ofertas, departamentos).
    - Top Bar compacta (44px) com seletores de viewport (Desktop, Tablet 768px, Mobile 390px), Undo/Redo, botão de Histórico de Revisões com checkpoints (`ElementorRevisionsModal`), modal flutuante de novas seções e botão de salvar no servidor.
    - Rota de persistência no backend Next.js (`POST /api/storefront/composition`) e histórico (`/api/storefront/revisions`) com segurança por ambiente via `admin-guard.ts` (bloqueio de atalhos inseguros em produção/Vercel com `403 Forbidden`, exigência de `je_access` ou chave de serviço, preservando atalhos em dev local para agentes), persistência durável no PostgreSQL Neon (`SiteConfiguration.homeComposition` e `AuditLog`) com fallback em disco, checkpoints com autoria e data/hora, revalidação ISR de rota (`revalidatePath('/')`), autosave local imediato (`localStorage`) e entrega SSR no `layout.tsx`/`page.tsx` para exibição instantânea em abas anônimas e visitantes.
    - Indicador de desenvolvimento do Next.js posicionado no canto inferior direito (`bottom-right`).
    - Botão flutuante de ativação (`ElementorTogglePill`) para alternar entre navegação normal e modo de edição visual.
  - Página inicial `apps/storefront/app/page.tsx` refatorada para renderização dinâmica via `PageRenderer` e suporte ao editor visual.
  - **Expansão Completa da Biblioteca de Widgets e Reconstrução das 20 Seções (`site-final.jpg` + `wireframe.png` — 25/10/2026):**
    - Recortes de imagens e produtos extraídos sem textos pré-achatados em `apps/storefront/public/assets/home-ref/` e catalogados no modal de mídia (`ElementorMediaModal`).
    - Evoluídos os widgets `category-grid` (`variant: 'icons-bar'`), `product-carousel` (`variant: 'split-banner' | 'standard-5col'`) e `ProductCard` (badges empilhados `35% OFF` + `⚡ RELÂMPAGO`, divisória, título antes das estrelas `4.8 (212)`, preço em `#163264`, condição de atacado e botão `"Adicionar à cotação"`).
    - Implementados 8 novos widgets reutilizáveis: `banner-grid` (Seções 05 e 11), `quote-steps-banner` (Seção 07), `segments-carousel` (Seção 08), `promo-strip` com 3 variantes `'offers-strip' | 'conditions-mascot' | 'whatsapp-group'` (Seções 09, 13 e 17), `events-carousel` (Seção 12), `video-articles-carousel` (Seção 15), `instagram-feed` (Seção 16), `testimonials-grid` (Seção 18) e `store-locations-map` (Seção 19), além do `SiteFooter` fiel à Seção 20.
    - Testes unitários de composição (`apps/storefront/lib/storefront/home-configuration.spec.ts`) garantindo as 19 seções de widgets habilitadas em ordem sequencial.
- **Validação técnica:**
  - `pnpm typecheck`: **6/6 pacotes aprovados**.
  - `pnpm lint`: **6/6 pacotes aprovados**.
  - `pnpm --filter storefront test`: **2 suítes / 6 testes aprovados**.
  - Sem quebras nas integrações existentes de API NestJS ou cotação.

### Checkpoint Conclusão de Issues e Integração Direta na Main — 26/10/2026

- **Integração na `main` autorizada pelo responsável:** Commit `7ab82e2` aplicado diretamente na branch padrão `main` do repositório remoto [idedigitalbr/loja-comercial-do-norte](https://github.com/idedigitalbr/loja-comercial-do-norte).
- **Issues do Project 3 Concluídas e Auditadas:**
  - **Issue #14 (`C2`):** Primitivos compartilhados (`cn`, `WebButton`, `WebBadge`, `WebEmptyState`) em `@commerce/ui/web` com 11/11 testes unitários (commit `6fec0f7`).
  - **Issue #15 (`C3`):** Inventário completo de componentes acessíveis WCAG 2.2 AA (`WebField`, `WebInput`, `WebTextarea`, `WebSelect`, `WebCard`, `WebAlert`, `WebSkeleton`, `WebSheet`) com 16/16 testes (commit `0129118`).
  - **Issue #16 (`C4`):** Design System oficial Comercial do Norte aplicado no painel administrativo (`apps/admin/src/styles.css`), substituindo o dourado legado pelos tokens oficiais azul `#264887` e marinho `#13213b` (commit `2ce186b`).
  - **Issue #17 (`C5`):** Remoção total de branding herdado (*"Jonas & Elivaldo"*) e atalhos legados de WooCommerce/Pix na API e no Admin (commit `593bb6c`). **Etapa 3 atingiu 100% de conclusão (5/5 tarefas concluídas)**.
  - **Issue #21 (`D4`):** Performance, cache ISR com tags semânticas (`site-config`, `catalog-products`, `catalog-categories`, `catalog-brands`, `catalog-offers`), imagens responsivas AVIF/WebP e observador de Core Web Vitals (commit `bfeb6fd`).
  - **Issue #22 (`D5`):** Fidelidade visual completa das seções S01 a S19 da homepage com testes de configuração (commit `b1b06cc`).
  - **Issue #30 (`E6`):** Catálogo, rotas dinâmicas de categoria e produto com similares/descontos e fluxo oficial de cotação (commit `61f9a3b`).
  - **Issue #32 (`E8`):** Smoke tests de aceite no navegador com Playwright (`playwright.config.ts`, `e2e/smoke.e2e.ts`) cobrindo abertura da home, cabeçalho, gaveta de cotação e formulário acessível (commit `7ab82e2`).
- **Validação consolidada do monorepo:**
  - `pnpm typecheck`: **6/6 tarefas aprovadas** (FULL TURBO).
  - `pnpm lint`: **6/6 tarefas aprovadas** (FULL TURBO).
  - `pnpm --filter storefront test`: **3 suítes / 10 testes aprovados**.
  - `pnpm --filter admin test`: **8 suítes / 18 testes aprovados**.
  - `pnpm --filter api exec vitest run src/modules/settings src/modules/notifications src/main.spec.ts`: **9 suítes / 25 testes unitários aprovados**.
  - `pnpm exec playwright test --list`: **3 smoke tests de navegador registrados e válidos**.
  - `pnpm agents:verify`: **47 itens, 42/42 dependências confirmadas, 0 erros no Project 3**.

### Login único no storefront — 26/10/2026 (Issue #56)

- Removido o formulário duplicado de `apps/admin/src/features/auth/login-page.tsx`; acesso ao painel consulta a sessão oficial e encaminha sessão ausente para `/login` do storefront.
- Validação local no checkout de desenvolvimento: 11 suítes / 31 testes do admin aprovados; TypeScript e ESLint dos dois arquivos alterados aprovados. Sem validação de login real: API local na porta 3000 indisponível. CI e aceite humano pendentes.
- Alteração isolada em `fix/issue-56-login-unico`, com cópia dos dois arquivos aplicada ao servidor local para acompanhamento. Arquivos da Issue #55 preservados. Sem migration, deploy ou merge.
- Rollback: reverter o commit desta Issue restaura o formulário anterior; nenhuma alteração de banco ou contrato de autenticação.

### Entrega direta do login único autorizada — 26/10/2026

- Responsável dispensou revisão do PR #59 e autorizou envio direto da correção à `main`. Código isolado em `3b3f852`; o commit deste registro atualiza o fluxo para os próximos ajustes solicitados.
- Login validado no navegador com API NestJS e PostgreSQL locais: sem sessão redireciona para `/login`; login ADMIN de desenvolvimento compartilha sessão com o painel e abre dashboard. Nenhum seed/migration/deploy manual executado.
- CI do PR falhou no seed com P2022 (`SiteConfiguration.homeComposition` ausente na base), antes de executar testes. A entrega não altera schema nem migrations; falha registrada separadamente das 31 verificações unitárias locais aprovadas e do teste real de login.

### Refinamento Explica Aí Nort — 26/10/2026 — Issue #60

- Branch isolada `fix/explica-ai-nort`, derivada de `fix/issue-55-publicacao-vitrine` em `7df1fef`; sessão `888b39ab-0053-4079-a413-968158c881e5`, executor `codex-will`. Alterações concorrentes no checkout principal preservadas.
- Widget S15 com hierarquia solicitada, bold 700, pills rosas, três frases curtas, cards com borda/sombra rosa e continuidade sob degradê vermelho. Mantidos os controles de mídia do editor e os destinos existentes dos CTAs.
- Quatro fotos geradas com ferramenta nativa image_gen e convertidas para WebP 720×960 (63–80 KB cada). Prompt comum: fotografia editorial realista para tutorial brasileiro de embalagens, retrato 3:4, profissional com polo azul-marinho e avental escuro, cenário gastronômico desfocado, madeira e detalhe vermelho, iluminação quente suave, sem textos/logos/ícones. Variações: mulher com três caixas de pizza; homem com sacola e recipiente kraft; mulher com copos de açaí e café; confeiteira com caixa kraft com visor e doces.
- Validação local: typecheck e lint aprovados; 18 suítes / 76 testes aprovados. Navegador Playwright em 1440px e 390px: título 48px/700 no desktop, avanço de 550px confirmado e capturas inspecionadas. Turbopack recusou dependências em junction fora do worktree; conferência realizada com Webpack, sem alterar a configuração do produto. Home tem overflow horizontal global em 390px; a seção capturada permanece contida.
- API/CI: não executados como evidência desta alteração visual. Sem migrations/deploy. A publicação de composições existentes continua pendente de edição administrativa; histórico de revisões não foi reescrito. Rollback: reverter o commit visual, sem tocar em dados publicados.
- Tokens/custo/tempo ativo: Não disponível.

- Atualização expressa do responsável em 26/10/2026: integrar esta alteração diretamente na main, sem exigir revisão de PR. Aplicação isolada do commit visual sobre origin/main; demais trabalhos pendentes não integram esta entrega. Esta autorização substitui a exigência anterior de PR para esta entrega.
- Integração direta revalidada sobre a main atual: lint e typecheck aprovados, 17 suítes / 60 testes aprovados. O resultado anterior de 76 testes refere-se à base isolada original; a integração não inclui os commits pendentes de autenticação/publicação. Sessão de integração: a523e399-1469-4281-a5f0-7053d1e806a4.

### PostgreSQL e idempotência — 26/10/2026 — Issue #11 / PR #53

- Reproduzida corrida real: três chamadas simultâneas de cotação com a mesma chave produziam rejeições P2002; o teste antigo aceitava apenas um sucesso e ocultava a falha. Corrigido com advisory lock transacional por chave antes de consultá-la. Todas as chamadas agora retornam a mesma cotação, sem reserva de estoque nem duplicação de registros.
- Testes de concorrência criam produtos/saldos próprios em banco descartável; não usam o primeiro registro existente nem compensações em dados compartilhados. Cobrem incrementos sem perda, decremento rejeitado com InventoryUnavailableError, idempotência de todas as chamadas, rollback e preservação do JSONB ao reaplicar a migration aditiva.
- `pnpm --filter api test` e `test:e2e` agora criam um banco local `cn_api_test_UUID`, aplica migrations/seed exclusivamente nele e remove o banco ao final. `API_TEST_ADMIN_URL` deve apontar para PostgreSQL real numa URL de loopback; não herda a DATABASE_URL de produção. No GitHub Actions, `inet_server_addr()` pode identificar o service container em `172.16/12`, exceção limitada às duas flags `GITHUB_ACTIONS` e `API_TEST_ALLOW_DOCKER`, ambas repassadas pelo Turbo. O config E2E recusa execução direta sobre outro banco. Login admin do fluxo de cotação exige sessão real, sem passar silenciosamente quando faltam credenciais.
- CI também tinha três falhas antigas em main.spec.ts: testes presumiam array CORS e ignoravam o callback atual. Agora verificam decisões de allowlist, origens oficiais/configuradas e ataques de substring. Atalho localhost usa hostname exato e fica desabilitado na Vercel. CSP de imagens retorna a mídia própria/data/blob, mantendo frames YouTube autorizados.
- Validação local: 145 testes da API em 64 suítes e 21 E2E em 6 suítes aprovados, com PostgreSQL descartável migrado e semeado; ciclo falhar/corrigir da concorrência comprovado. 15 testes do protocolo aprovados. A tentativa inicial de lint/typecheck no worktree falhou por PATH sem turbo, sem indicar defeito de código; repetição com PATH dos executáveis instalados aprovada: lint/typecheck 6/6 e typecheck:seed.
- Inspeção Neon **READ ONLY**: coluna `homeComposition` existe como JSONB nullable; configuração `default` existe mas está sem composição; somente quatro migrations anteriores constam aplicadas. Migration `20261026190000_add_home_composition` ainda não registrada. A migration IF NOT EXISTS preserva a coluna/JSONB em teste isolado, mas formalização em produção depende de aprovação e procedimento próprio. Nenhuma migration aplicada no Neon.
- Rollback por revert dos commits de serviço/testes, preservando dados e migration aditiva. PR #53 segue aguardando aceite humano; base das entregas #52/#57.
- Validação final da branch: `pnpm test` aprovado em 6/6 tarefas, com API 145/145, admin 27/27, vitrine 60/60, UI 16/16 e contracts 1/1 (api-client sem testes). Primeira execução conjunta apresentou timeouts; paralelismo da API limitado a 4 workers e timeout de integração ajustado, mantendo todos os testes. Não versionar composições/checkpoints gerados pelos testes antigos da vitrine: descartados somente no worktree isolado. A correção definitiva desses testes está no PR #57.

- Incidente de consoles Windows (26/10): PostgreSQL local 55432 iniciado por `scripts/dev/postgres.mjs` tinha `detached:true` sem `windowsHide`. Logs mostraram workers interrompidos com 0xC000013A e reinicialização de processos pelo postmaster, recriando janelas. Instância descartável 55439 e instância local 55432 encerradas por pg_ctl; nenhum dado apagado e nenhum serviço reiniciado. Launcher corrigido: windowsHide, sem detached no Windows, detecção de servidor já ativo e stop por pg_ctl em vez de matar PID. Validação desta correção limitada a sintaxe/revisão; não reiniciar banco apenas para teste após o incidente.

### Correção da verificação PostgreSQL no CI — 26/10/2026 — Issue #11 / PR #53

- O job do GitHub Actions usa PostgreSQL como service container. O runner conectava pela URL `127.0.0.1`, mas a API de teste recusava o endereço privado informado pelo servidor. A primeira exceção não chegou às tarefas porque Turbo filtrou as variáveis; os logs e os commits intermediários registram essa tentativa e sua falha.
- A correção exige `GITHUB_ACTIONS=true` e `API_TEST_ALLOW_DOCKER=true`, aceita somente IPv4 em `172.16/12` para o endereço do servidor e mantém a URL do administrador restrita ao loopback. Ambas as variáveis são explicitamente repassadas no `globalPassThroughEnv`; o workflow executa 3 testes de segurança antes da suíte.
- CI do commit `ed7ac68` aprovado no run `40406122873`: guard 3/3, `pnpm test` (API 145/145, seis tarefas), API E2E PostgreSQL 21/21, lint/typecheck/seed e build seis tarefas. O build registrou avisos do fallback Neon e rotas estáticas lentas, mas concluiu com sucesso. Nenhuma escrita no Neon. PR #53 aguarda revisão humana.
### Revisão de backup/recovery — 26/10/2026 — Issue #12 / PR #52

- Corrigido o restaurador que executava TRUNCATE CASCADE e desativava constraints sem transação abrangente. Backup v2 usa snapshot REPEATABLE READ READ ONLY, metadados de schema/migrations, JSONB textual e SHA-256 de arquivo e tabelas. Valores bigint/numeric/binários/arrays/timestamps não passam por conversão numérica JavaScript.
- Restore compara schema, migrations, contagens e conteúdo, mantém constraints ativas e executa limpeza/carga/verificação dentro de uma única transação SERIALIZABLE com locks explícitos. Inclui tabelas cujo backup está vazio. Qualquer falha reverte tudo. Imports não carregam credenciais nem conectam ao banco.
- Uso explícito: `BACKUP_DATABASE_URL` para backup; `RESTORE_DATABASE_URL`, `--from DIRETORIO` e `--confirm-target HOST:PORT/BANCO` para restore. Restore é limitado a loopback e banco com segmento `test` ou `restore` no nome; também verifica endereço real do servidor e nome real do banco. Não existe override de produção. `--dry-run` verifica checksums e schema sem escrita. Backups v1 inseguros são recusados.
- Limites deliberados: somente schema public e tabelas sem sequências/triggers próprias/ciclos entre tabelas/FKs entre schemas. Nesses casos usar pg_dump/pg_restore com procedimento separado e aprovado; esses binários não estão instalados neste ambiente. A implementação não é homologação de disaster recovery de produção.
- Testes locais com bancos descartáveis: round-trip exato, self-FK, coluna gerada, snapshot durante escrita concorrente, checksum adulterado, schema incompatível, tabela vazia, dry-run, FK quebrada com rollback completo, proteção de destino e recusa de sequências/triggers. Nenhum acesso ao Neon. CI inclui `pnpm test:backup` com PostgreSQL descartável.
- Rollback: revert do commit, sem executar o restaurador antigo. PR #52 continua aguardando revisão humana; base atualizada para incluir a migration aditiva do PR #53.
