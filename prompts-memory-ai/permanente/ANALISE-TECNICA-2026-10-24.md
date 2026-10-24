# Análise técnica do repositório — 2026-10-24

> Snapshot do que existe **de fato** no código no commit `9e19170` (branch `main`).
> Método: clone completo do GitHub + leitura direta dos arquivos. Não foi executado `pnpm install`, `build` nem `test` nesta máquina (motivo em §9).
> Toda afirmação abaixo tem caminho de arquivo; quando o número da linha importa, ele vem no formato `arquivo:linha`.

---

## 1. Repositório e permissões

| Item | Resultado |
|---|---|
| Repositório | `victorwilliames/loja-comercial-do-norte` — privado, 58,4 MB (1,8 MB de código + 61,8 MB da pasta de referência HTML) |
| Branch principal | `main` (única). Sem outras branches, sem tags, sem PRs, sem issues |
| Histórico | 43 commits, 11/09/2026 → 23/10/2026 |
| Permissões da conta | `admin`, `maintain`, `push`, `pull`, `triage` |
| Escrita validada | `git fetch --dry-run` e `git push --dry-run origin main` → exit 0 |
| Proteção de branch | Inexistente (repo privado no plano free; GitHub exige Pro ou repo público) |
| Actions | Habilitadas, 0 workflows |
| Autorização necessária | **Nenhuma.** O `gh` está autenticado com scopes `repo`, `workflow`, `gist`, `project`, `read:org` |

**Histórico relevante**
- `6c84a57` (03/10) — último commit da base "Jonas & Elivaldo".
- `6195c6c` (23/10) — "migração e adaptação inicial para Comercial do Norte": renomeia marca no header/admin, reduz menu, remove rotas institucionais do router.
- `ecd0c39` (23/10) — remove `.github/workflows/ci.yml` porque o token da época não tinha scope `workflow`. **Hoje o scope existe** → o CI pode ser restaurado.
- `c6977e0` (23/10) — adiciona `site-comercial-do-norte-html-referencia/` (115 arquivos, 61,8 MB).

**Operação dentro do sandbox do DSH** (importante para retomar):
- `schannel` falha (`SEC_E_NO_CREDENTIALS`) → usar `http.sslBackend=openssl` (já gravado no `.git/config` local do repo).
- O credential helper do `gh` não roda (não cria pipe) → operações autenticadas usam token via header:
  `git -c credential.helper= -c http.extraHeader="AUTHORIZATION: basic <base64(x-access-token:TOKEN)>" push origin main`
- No terminal normal do Windows, `gh auth` + `git pull/push` funcionam sem gambiarra.

---

## 2. Arquitetura

Monorepo **Turborepo + pnpm workspaces**, TypeScript ponta a ponta, deploy em **processo único**.

```
apps/storefront  React 19 + Vite 7 (SPA/CSR) · React Router 7 · TanStack Query 5 (pouco usado)
apps/admin       React 19 + Vite 7 (SPA em /admin) · roteamento manual por pushState
apps/api         NestJS 11 + Express 5 + Prisma 6 + MySQL 8 · Node 22
packages/        contracts (Zod) · ui (Button, FormField, Money, StatusBadge, Icon/Lucide) · api-client
prisma/          schema (54 models + 29 enums) + 12 migrations + seed
scripts/         bootstrap-local, verify-local, verify-deployment, copy-web-builds, import/migrate WooCommerce
```

**Build:** `pnpm build` → Turbo compila os 3 apps → `scripts/copy-web-builds.mjs` copia `storefront/dist` e `admin/dist` para `apps/api/public/{storefront,admin}` → o Nest serve os dois SPAs via `express.static` (`apps/api/src/main.ts:22-24`).

**API:** prefixo global `api/v1` com exclusões para `webhooks/mercado-pago` e `internal/cron/process` (`apps/api/src/main.ts:25-27`). Sessão por cookie assinado (`cookie-parser` com `COOKIE_SECRET`), RBAC por permissão (`PermissionGuard`), `ValidationPipe` com whitelist, filtro global de exceções com `requestId`, Helmet com CSP.

**Assincronia:** fila no próprio MySQL (`ScheduledJob`), acionada por `POST /internal/cron/process` com `Authorization: Bearer $CRON_SECRET`, processada em lote por `JobsService.processBatch` (retry + concorrência).

**Domínio (schema Prisma, 54 models):** User/Role/Permission/Session, CustomerProfile/Address, Brand (hierárquica) / Category (**plana**) / Product / ProductVariant / ProductImage / CustomerFavorite, InventoryBalance / InventoryReservation / StockMovement, Cart / CartItem, Promotion / PromotionScope / Coupon (+ regras por produto, marca, categoria, e-mail, redemption), VipTier / VipMembership, Order / OrderItem / OrderStatusHistory, Payment / PaymentAttempt / PaymentEvent / Refund, ShippingQuote / Shipment, Training / TrainingSession / TrainingBatch / Enrollment, ScheduledJob, SiteConfiguration / SiteBanner / PaymentConfiguration / SmtpConfiguration / EmailTemplate / NotificationPreference / EmailDelivery, AuditLog, IdempotencyKey, ReportExport.

---

## 3. Inventário funcional

### Storefront (rotas em `apps/storefront/src/routes/router.tsx`)
`/` (catálogo = home) · `/loja` (redirect) · `/categoria/:slug` · `/marca/:slug` · `/produto/:slug` · `/carrinho` · `/checkout` · `/pedido/:publicId` · `/entrar` · `/conta` (+ pedidos, detalhe, dados, endereços, favoritos, segurança) · `/admin/*` (redirect para o app admin).

Componentes-chave: `storefront-shell.tsx` (header/footer/carrinho/conta), `cart-drawer.tsx`, `product-card.tsx`, `product-filters.tsx`, `brand-rail.tsx`, `storefront-product-search.tsx`, `site-config-client.tsx` (consome `GET /api/v1/site/config`).

### Admin (`apps/admin/src/admin-shell.tsx`)
Visão geral, Banner da Home, Catálogo (produtos, marcas com hierarquia, taxonomia), Pedidos, Estoque, Clientes, Promoções/Cupons, Relatórios, Configurações (identidade do site, banners, Mercado Pago, SMTP, templates de e-mail, preferências de notificação). Login separado em `features/auth/login-page.tsx`.

### API (≈90 rotas)
Público: `catalog/products`, `catalog/products/:slug`, `catalog/brands`, `catalog/categories`, `site/config`, `carts/*`, `checkout/prepare|quote|:publicId`, `orders/*`, `payments/pix|card|refund`, `shipping/quote`, `auth/*`, `account/*`, `trainings/*`, `health`.
Admin: `admin/catalog/*` (CRUD produto/marca/categoria + `publish` + `archive`), `admin/media/images|brand-images`, `admin/inventory/*`, `admin/orders/*`, `admin/customers/*`, `admin/promotions/coupons`, `admin/reports/*`, `admin/settings/*` (+ mídia de logo/favicon/banner), `admin/trainings/*`.
Infra: `webhooks/mercado-pago`, `internal/cron/process`.

### Integrações existentes
- **Mercado Pago** — Pix + cartão, webhook idempotente (`payment-events`), token criptografado no banco. *Fora de escopo na fase 1.*
- **SMTP** via Nodemailer, templates por evento editáveis no admin, `recipientOverride` por evento.
- **Upload de mídia** local + Sharp (3 larguras WebP + original, máx. 10 MB, `storage/uploads`).
- **ViaCEP** no front (`features/account/cep-client.ts`).
- **WooCommerce** — importador por JSON (`scripts/migrate-woocommerce.ts`) e por API (`apps/api/src/modules/catalog/woocommerce-importer.ts`), idempotente por `legacySource`+`legacyId`.
- **Melhor Envio** — apenas stub: o fetcher padrão sempre lança `SHIPPING_UNAVAILABLE` (`apps/api/src/modules/shipping/providers/melhor-envio.provider.ts:9-13`).

### Deploy documentado (`docs/runbooks/hostinger-deploy.md`)
Hostinger Web Business · Node 22 · `node apps/api/dist/main.js` · `prisma migrate deploy` antes de subir · cron do hPanel a cada 5 min (UTC) · `storage/uploads` persistente · smoke test `node scripts/verify-deployment.mjs <url>`.

---

## 4. Achados (com evidência)

| ID | Sev. | Achado | Evidência |
|---|---|---|---|
| A1 | **P0** | Seed exige `DEFAULT_ADMIN_PASSWORD` e `DEFAULT_CUSTOMER_PASSWORD`, mas o `.env.example` não as lista → `pnpm bootstrap:local` falha em ambiente novo | `prisma/seed.ts:33-37`; `.env.example` (8 linhas) |
| A2 | **P0** | `verify-local` exige Node **22** e aborta em qualquer outra versão; a máquina local está no Node 24.15.0. `pnpm` local é 12.8.1, projeto fixa 10.15.1 | `scripts/verify-local.mjs:12`; `.nvmrc`; `package.json:3` |
| A3 | **P0** | `pnpm install` não roda dentro do sandbox do DSH (lock em `%LOCALAPPDATA%\pnpm-store-operation-locks` → acesso negado) | reproduzido; ver §9 |
| A4 | **P1** | Rota pública de produto não filtra `status` → DRAFT/INACTIVE acessível por slug | `apps/api/src/modules/catalog/catalog.service.ts:279-286`; `catalog.controller.ts:21-24` |
| A5 | **P1** | Catálogo público filtra marcas por lista fixa do site antigo (`bioma-care`, `grandha`, `haskell`, `knut`, `maxiline`, `meu-tudo`, `oh-my`, `senscience`) → **esconde todas as marcas novas** | `apps/storefront/src/pages/shop-page.tsx:13` e `:33-39` |
| A6 | **P1** | Conteúdo do salão ainda embutido: 69 referências a Jonas/Elivaldo, imagens hospedadas em `jonaselivaldohair.com.br`, banners padrão, sidebar do admin, SEO | `apps/storefront/src/content/institutional-content.ts`; `apps/api/src/modules/settings/default-home-banners.ts:13-40`; `prisma/seed.ts:165-178`; `apps/admin/src/admin-shell.tsx:197`; `apps/api/src/public-shell/seo-renderer.service.ts:12-23`; `apps/api/src/main.ts:32` (CSP libera o domínio do salão) |
| A7 | **P1** | Checkout/pagamento continuam visíveis na loja ("Finalizar compra") | `apps/storefront/src/features/cart/cart-drawer.tsx:213`; `router.tsx:28-29` |
| A8 | **P1** | Não existe fluxo de cotação: criação de pedido sempre reserva estoque e vai para `AWAITING_PAYMENT`; enum não tem `QUOTE_REQUESTED` | `apps/api/src/modules/orders/orders.service.ts:99-105`; `prisma/schema.prisma:85-96` |
| A9 | **P1** | Pedido novo notifica só o comprador; equipe de vendas não recebe nada | `apps/api/src/modules/orders/orders.service.ts:109-118` |
| A10 | **P2** | Controllers do SPA herdam prefixo `api/v1` (storefront/admin shell), enquanto o smoke test espera `/`, `/admin` = 200 → **risco de 404 no root em produção**. Não há teste cobrindo | `apps/api/src/main.ts:25-27`; `apps/api/src/public-shell/storefront-shell.controller.ts:22-42`; `scripts/verify-deployment.mjs:3` |
| A11 | **P2** | Suíte institucional testa rotas que o router novo não expõe (`/sobre-nos`, `/servicos`, `/cabelos-e-penteados`) e 6 páginas ficaram sem uso (home, about, services, certification, training, service-detail) → `pnpm test` tende a falhar | `apps/storefront/src/pages/institutional-pages.spec.tsx`; `apps/storefront/src/routes/router.tsx` |
| A12 | **P2** | `GET /orders/:publicId` exige sessão mas **não valida dono** (IDOR) | `apps/api/src/modules/orders/orders.controller.ts:26-30` |
| A13 | **P2** | Busca `startsWith` (não acha termo no meio do nome) e paginação/ordenação 100% no cliente, com `findMany` sem `take` | `apps/api/src/modules/catalog/catalog.service.ts:268-276`; `shop-page.tsx:12` |
| A14 | **P2** | `Category` plana (sem `parentId`), sem imagem e sem ordem — bloqueia mega menu e "compre por categoria" com imagem | `prisma/schema.prisma:344-359` |
| A15 | **P2** | CI desligado desde `ecd0c39` | `.github/workflows/ci.yml` (removido) |
| A16 | **P3** | CSS manual de 205 KB no storefront e 36 KB no admin, tokens duplicados por app (ainda dourado do Jonas); `@commerce/api-client` existe e os apps usam `fetch` cru; sem sitemap/robots | `apps/storefront/src/styles.css`; `apps/admin/src/styles.css`; `packages/ui/src/styles/tokens.css`; `apps/storefront/public/` |

---

## 5. Correções ao `memory-ai.md`

Coisas que a memória de produto afirma e que o código desmente ou precisa de ajuste:

1. **"tabela `HomeBanner`"** → o model real é **`SiteBanner`** (`prisma/schema.prisma:941`). A rota pública é `GET /api/v1/site/config` e devolve `{ site, banners }` (`apps/api/src/modules/settings/settings.service.ts:129-139`, controller em `settings.controller.ts:107-115`). Confirmado que o endpoint **existe** e só devolve banners `ACTIVE`.
2. **"50+ suítes de teste"** → são **86 arquivos** `*.spec.ts(x)` / `*.e2e-spec.ts`.
3. **Seed grava dados do Jonas** (`siteName`, endereço de Macapá, WhatsApp `5596981001897`, Instagram do salão) — enquanto isso não mudar, rodar o seed cria a loja errada. `prisma/seed.ts:165-178`.
4. **Endereço/telefones da Comercial** (Av. Rômulo Maiorana, 115A, São Braz, Belém/PA · (91) 98344-0880) não estão em lugar nenhum do código — vêm do `CONTEXTO-PARA-CHATGPT.md` §6 e precisam entrar via settings/seed na Etapa 4.
5. O item "meta tags são placeholders nunca injetados" está **parcialmente desatualizado**: existe injeção server-side de title/description/canonical/JSON-LD para `/produto/:slug` (`seo-renderer.service.ts`), mas com a marca do salão e só para produto.

---

## 6. O que já está pronto e não deve ser reconstruído

- Produto nasce `DRAFT` e só publica com SKU + foto principal + peso + dimensões (`CatalogService.publish`, erro `ProductIncompleteError`) — **é exatamente a regra do "pendente"**.
- `legacySource` + `legacyId` (unique composta) em Product/Brand/Category e `ProductVariant.sku` único — gancho pronto para o ERP.
- Galeria com `alt`, ordem e foto principal; upload com Sharp em 3 tamanhos.
- Hierarquia de marca pai/filho, com filtro incluindo as filhas — **molde pronto para copiar em Category**.
- Preço na variante (`priceCents` + `compareAtPriceCents`) → "de/por" das etiquetas de oferta.
- Carrinho anônimo com token e expiração de 30 dias.
- Estoque com reserva transacional concorrente + expiração por job.
- Pedido com máquina de estados, histórico e snapshots.
- Cupons com regras avançadas; VIP; auditoria; LGPD (anonimização); relatórios.
- Admin de banners + identidade + SMTP/templates.
- Design system da referência HTML (tokens, Lufga, seções da home, 115 assets) — base visual da Etapa 5.

---

## 7. Roadmap por prioridade

### 7.1 O que já temos
Base madura de e-commerce (~1.8 MB de código, 86 specs) cobrindo catálogo, carrinho, estoque, pedidos, cupons, admin, settings, auditoria, jobs e e-mail — mais o site HTML de referência aprovado, com design system e assets.

### 7.2 O que falta (fase 1 → 31/10/2026)
1. Feature flags para desligar treinamentos/checkout/pagamento e esconder rotas e botões.
2. `Category.parentId` + subcategorias + imagem.
3. Fluxo de cotação: `QUOTE_REQUESTED`, `createQuoteFromCart` (sem estoque, sem pagamento), tela de envio, número da cotação, e-mail para vendas, filtro no admin.
4. Seed/catálogo da distribuidora + dados reais da loja (Belém).
5. Home S0–S10 + mega menu + identidade azul/vermelho.
6. Página de produto com "Adicionar à Cotação", mini-carrinho e similares.
7. SEO mínimo: title/description/OG reais, `sitemap.xml`, `robots.txt`; busca `contains`.
8. Limpeza total do conteúdo do salão.

### 7.3 O que corrigir antes (ordem)
A1 → A2 → A3 (ambiente/seed) · A15 (CI) · A11 (suíte) · A4 e A12 (segurança) · A5 (filtro de marcas) · A10 (validar rotas de produção) · A6 (limpeza Jonas).

### 7.4 O que melhorar depois
SSR/pré-render para SEO de catálogo · paginação e busca no servidor · tokens em fonte única + Tailwind opcional · usar `@commerce/api-client` · admin com router de verdade · peso do repo (61,8 MB de assets → LFS ou storage) · performance de imagens.

### 7.5 Sequência recomendada
1. **Destravar** ambiente, seed e CI; rodar `pnpm test` para ter linha de base.
2. **Etapa 0–1 do `PROMPT-FASE1-SEM-API.md`**: backup/tag e desligar o que não é da fase 1.
3. **Etapa 2**: hierarquia de categoria.
4. **Etapa 3**: cotação (coração da fase 1).
5. **Etapa 4**: catálogo + dados da loja.
6. **Etapa 5**: home nova, mega menu e identidade.
7. **Etapa 6**: SEO. **Etapa 7**: suíte + build + relatório.

---

## 8. Comandos úteis

```bash
# estado do repositório
git log --oneline -5
git status --porcelain

# ambiente local (fora do sandbox do DSH)
nvm use 22            # ou instalar Node 22
corepack enable && corepack prepare pnpm@10.15.1 --activate
pnpm install
cp .env.example .env  # e adicionar DEFAULT_ADMIN_PASSWORD / DEFAULT_CUSTOMER_PASSWORD
pnpm bootstrap:local
pnpm dev              # 5173 loja · 5174 admin · 3001 API

# qualidade
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

---

## 9. Limites desta análise (o que **não** foi executado)

- **`pnpm install`**: bloqueado pelo sandbox do DSH (lock de store em `AppData\Local`). Roda normalmente no terminal do usuário.
- **`pnpm test` / `pnpm build` / `pnpm typecheck`**: não executados → os achados A10 e A11 são **leitura de código**, não resultado de execução. Confirme rodando a suíte.
- **Banco**: nenhum MySQL tocado, nenhuma migration aplicada, nada de seed.
- **Nada foi commitado**: as mudanças locais de organização de pastas (`ui-design/`, `prompts-memory-ai/`) são do usuário e continuam fora do Git até ele decidir commitar.
