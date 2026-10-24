# Análise Técnica de Reúso — Jonas & Elivaldo Commerce

**Contexto da Avaliação:**  
Avaliação de viabilidade para reaproveitamento desta base de código para um novo cliente (**distribuidora**).  
*Escopo previsto para a Fase 1:* Catálogo de produtos + solicitação de cotação (sem pagamento online no primeiro momento), sincronização de produtos via API de um ERP externo e gerenciamento de banners/conteúdo pelo painel administrativo pela equipe de marketing.

Todas as respostas abaixo são baseadas **estritamente no código-fonte deste monorepo**, com referência direta aos arquivos e linhas correspondentes.

---

### 1. Versões Exatas e Execução Local

#### Versões das Tecnologias
* **React**: `^19.1.1` (resolvido em lockfile com React 19)
  * Referência: [`apps/storefront/package.json`](apps/storefront/package.json#L13-L14) e [`apps/admin/package.json`](apps/admin/package.json#L13-L14)
* **Vite**: `^7.1.5`
  * Referência: [`apps/storefront/package.json`](apps/storefront/package.json#L28) e [`apps/admin/package.json`](apps/admin/package.json#L29)
* **NestJS**: `^11.1.6` (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`)
  * Referência: [`apps/api/package.json`](apps/api/package.json#L13-L15)
* **Prisma**: CLI `^6.16.0` (raiz) / `@prisma/client`: `6.19.3` (raiz) e `^6.16.0` na API
  * Referência: [`package.json`](package.json#L24-L28) e [`apps/api/package.json`](apps/api/package.json#L16)
* **MySQL**: Driver MySQL configurado em [`prisma/schema.prisma`](prisma/schema.prisma#L1-L4) (`provider = "mysql"`), homologado para MySQL 8.x / 8.4 conforme [`docs/runbooks/local-laragon.md`](docs/runbooks/local-laragon.md#L3).

#### Como Rodar o Projeto Localmente
1. **Pré-requisitos**:
   * Node.js versão **22** (validado estritamente por script em [`scripts/verify-local.mjs`](scripts/verify-local.mjs#L12)).
   * Gerenciador de pacotes **pnpm** (`pnpm@10.15.1`).
   * Instância ativa de **MySQL 8.x**.
2. **Banco de Dados**:
   * Criar banco de dados local com charset utf8mb4:
     ```sql
     CREATE DATABASE jonas_elivaldo_commerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
3. **Variáveis de Ambiente (`.env`)**:
   * Criar o arquivo `.env` na raiz do monorepo a partir do modelo [`.env.example`](.env.example) contendo as seguintes variáveis:
     * `DATABASE_URL` (ex: `mysql://usuario:senha@127.0.0.1:3306/jonas_elivaldo_commerce?connection_limit=5`)
     * `PORT` (porta da API, ex: `3001`)
     * `APP_ORIGIN` (origem da loja pública, ex: `http://localhost:5173`)
     * `ADMIN_ORIGIN` (origem do painel admin, ex: `http://localhost:5174`)
     * `COOKIE_SECRET` (segredo para assinatura de cookies de sessão)
     * `CRON_SECRET` (token Bearer para acionamento seguro do endpoint interno de jobs)
     * `SETTINGS_ENCRYPTION_KEY` (chave Base64 de 32 bytes para criptografia de senhas/tokens no banco)
     * `DEFAULT_ADMIN_PASSWORD` (senha inicial da conta de administrador no seed)
     * `DEFAULT_CUSTOMER_PASSWORD` (senha inicial da conta de cliente no seed)
     * *Opcionais*: `DEFAULT_ADMIN_EMAIL`, `DEFAULT_CUSTOMER_EMAIL`.
4. **Instalação e Bootstrap**:
   ```bash
   pnpm install
   pnpm bootstrap:local
   ```
   *(O script `bootstrap:local` executa verificação de ambiente, reparo de histórico de migrations, aplicação de migrations pendentes via Prisma e o seed de dados idempotente).*
5. **Execução**:
   ```bash
   pnpm dev
   ```
   * Storefront (Loja): `http://localhost:5173/`
   * Painel Administrativo: `http://localhost:5174/admin/`
   * Backend API: `http://localhost:3001/api/v1/health`

---

### 2. Modelo Completo de Produto no Prisma e Atributos

Definido no schema Prisma em [`prisma/schema.prisma`](prisma/schema.prisma#L361-L439).

#### Todos os Campos do Produto (`model Product`)
```prisma
model Product {
  id                 String              @id @default(cuid())
  legacySource       String?             @db.VarChar(80)
  legacyId           String?             @db.VarChar(191)
  publicId           String              @unique @default(cuid())
  name               String              @db.VarChar(220)
  slug               String              @unique @db.VarChar(191)
  description        String?             @db.Text
  status             RecordStatus        @default(DRAFT)
  brandId            String?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  brand              Brand?              @relation(fields: [brandId], references: [id], onDelete: SetNull)
  variants           ProductVariant[]
  images             ProductImage[]
  favorites          CustomerFavorite[]
  categories         ProductCategory[]
  promotionScopes    PromotionScope[]
  couponProductRules CouponProductRule[]

  @@unique([legacySource, legacyId])
  @@index([status, createdAt])
  @@index([brandId, status])
  @@index([name, status])
}
```

#### Campos da Variante (`model ProductVariant`)
* `id`: String (cuid)
* `publicId`: String (@unique)
* `productId`: String
* `sku`: String (@unique, @db.VarChar(100))
* `priceCents`: Int
* `compareAtPriceCents`: Int?
* `weightGrams`: Int?
* `widthMm`: Int?
* `heightMm`: Int?
* `lengthMm`: Int?
* `manageStock`: Boolean (@default(true))
* `stockStatus`: ProductStockStatus (@default(IN_STOCK))
* `lowStockThreshold`: Int?
* `status`: RecordStatus (@default(DRAFT))
* `createdAt`: DateTime, `updatedAt`: DateTime

#### Respostas Específicas sobre Atributos:
* **Galeria de fotos**: **SIM**. Implementada via relação `ProductImage[]` com campos `path`, `altText`, `sortOrder` e flag `isPrimary` ([`prisma/schema.prisma`](prisma/schema.prisma#L425-L439)).
* **Peso e dimensões**: **SIM**. Ficam na variante do produto (`ProductVariant`): `weightGrams`, `widthMm`, `heightMm`, `lengthMm` ([`prisma/schema.prisma`](prisma/schema.prisma#L404-L407)).
* **SKU / Código externo único**: **SIM**. `ProductVariant.sku` possui restrição única (`@unique`). Além disso, para integração com sistemas externos, `Product` possui os campos `legacySource` e `legacyId` com restrição `@unique([legacySource, legacyId])` ([`prisma/schema.prisma`](prisma/schema.prisma#L381)).
* **Marca**: **SIM**. Tabela `Brand`, associada a `Product.brandId`. A marca possui suporte a hierarquia através de auto-relacionamento (`parentId` / `children` com relação `BrandHierarchy`) ([`prisma/schema.prisma`](prisma/schema.prisma#L321-L342)).
* **Categoria e subcategoria**: O modelo `Category` possui **apenas 1 nível plano** ([`prisma/schema.prisma`](prisma/schema.prisma#L344-L359)). **NÃO EXISTE subcategoria no código** (não há campo `parentId` nem auto-relacionamento em `Category`).

---

### 3. Status do Produto e Fluxo de Publicação

* **Status Disponíveis**: Enum `RecordStatus` em [`prisma/schema.prisma`](prisma/schema.prisma#L10-L15):
  * `DRAFT` (Rascunho)
  * `ACTIVE` (Ativo / Publicado)
  * `INACTIVE` (Inativo)
  * `ARCHIVED` (Arquivado)
  *(Não existe status "PENDENTE").*
* **Fluxo de Publicação**:
  1. O produto é criado com status padrão `DRAFT` via `CatalogService.createProduct` ([`apps/api/src/modules/catalog/catalog.service.ts`](apps/api/src/modules/catalog/catalog.service.ts#L74-L105)).
  2. A publicação é acionada pela rota `POST /admin/catalog/products/:id/publish` que chama `CatalogService.publish(id)` ([`apps/api/src/modules/catalog/catalog.service.ts`](apps/api/src/modules/catalog/catalog.service.ts#L213-L235)).
  3. O método valida se todos os seguintes campos obrigatórios estão preenchidos:
     * `sku` (na variante principal)
     * `mainImage` (pelo menos uma imagem marcada com `isPrimary: true`)
     * `weightGrams`
     * `widthMm`
     * `heightMm`
     * `lengthMm`
     Se qualquer um desses campos estiver ausente, o sistema lança `ProductIncompleteError` e impede a publicação.
  4. Atendidas as validações, o status é alterado para `ACTIVE`.
  5. A listagem pública da loja (`CatalogService.listProducts`) aplica estritamente a cláusula `where: { status: RecordStatus.ACTIVE }` ([`apps/api/src/modules/catalog/catalog.service.ts`](apps/api/src/modules/catalog/catalog.service.ts#L265)). Apenas produtos `ACTIVE` aparecem no storefront.

---

### 4. Módulos de Importação e Sincronização Externa

* **O que EXISTE no código**:
  * Importador de catálogo do WooCommerce em [`apps/api/src/modules/catalog/woocommerce-importer.ts`](apps/api/src/modules/catalog/woocommerce-importer.ts) e o script executor [`scripts/import-woocommerce.ts`](scripts/import-woocommerce.ts).
  * O importador consome via HTTP as APIs REST do WooCommerce (`/wp-json/wc/store/v1/products` e `/wp-json/wp/v2/product_brand`), faz mapeamento de nomes, slugs, preços, imagens e taxonomias, e insere/atualiza no Prisma usando as chaves `legacySource = 'woocommerce'` e `legacyId`.
* **Importação via CSV**: **NÃO EXISTE NO CÓDIGO**.
* **Sincronização com API de ERP externo**: **NÃO EXISTE NO CÓDIGO**.
* **Webhook de catálogo/produtos**: **NÃO EXISTE NO CÓDIGO** (o único webhook da aplicação é o de pagamentos do Mercado Pago em [`apps/api/src/modules/payments/mercado-pago-webhook.controller.ts`](apps/api/src/modules/payments/mercado-pago-webhook.controller.ts)).

---

### 5. Máquina de Estados do Pedido, Cotação e Notificações

* **Estados Possíveis do Pedido** ([`prisma/schema.prisma`](prisma/schema.prisma#L85-L96)):
  * `DRAFT`
  * `AWAITING_PAYMENT`
  * `PAID`
  * `PREPARING`
  * `SHIPPED`
  * `READY_FOR_PICKUP`
  * `COMPLETED`
  * `CANCELLED`
  * `PARTIALLY_REFUNDED`
  * `REFUNDED`
* **Transições Válidas** ([`apps/api/src/modules/orders/order-status-machine.ts`](apps/api/src/modules/orders/order-status-machine.ts#L3-L14)):
  * `DRAFT` ➔ `AWAITING_PAYMENT`, `CANCELLED`
  * `AWAITING_PAYMENT` ➔ `PAID`, `CANCELLED`
  * `PAID` ➔ `PREPARING`, `REFUNDED`
  * `PREPARING` ➔ `SHIPPED`, `READY_FOR_PICKUP`, `CANCELLED`
  * `SHIPPED` ➔ `COMPLETED`
  * `READY_FOR_PICKUP` ➔ `COMPLETED`
  * `PARTIALLY_REFUNDED` ➔ `REFUNDED`
* **Criação de Pedido sem Pagamento / Cotação**: **NÃO EXISTE NO CÓDIGO**.
  * A finalização de compra (`OrdersService.createFromCart` em [`apps/api/src/modules/orders/orders.service.ts`](apps/api/src/modules/orders/orders.service.ts#L64-L104)) obriga o cálculo de preços, realiza a reserva de estoque físico e transiciona automaticamente para `AWAITING_PAYMENT`.
  * Não há modalidade de pedido com valor zero, orçamento aberto ou status do tipo "COTAÇÃO" ou "PROPOSTA".
* **Notificação para a Equipe Interna sobre Pedido Novo**: **NÃO EXISTE NO CÓDIGO**.
  * Na criação do pedido, o disparo do evento `ORDER_CREATED` enfileira um e-mail destinado unicamente para o comprador (`recipient: result.contactEmail` em [`apps/api/src/modules/orders/orders.service.ts`](apps/api/src/modules/orders/orders.service.ts#L112)). Não há envio para administradores ou equipe de vendas.

---

### 6. Home do Storefront, Banners, Menu, Busca e Filtros

* **Montagem da Home**:
  * Implementada em [`apps/storefront/src/pages/home-page.tsx`](apps/storefront/src/pages/home-page.tsx). Combina seções institucionais estáticas (dados do salão, depoimentos, galeria de fotos e serviços) definidas em [`apps/storefront/src/content/institutional-content.ts`](apps/storefront/src/content/institutional-content.ts) com banners dinâmicos carregados da API.
* **Origem dos Banners Dinâmicos**:
  * Vêm do **banco de dados** (tabela `HomeBanner`), são gerenciados no painel admin em `/admin/settings/banners` ([`apps/admin/src/features/settings/home-banners-page.tsx`](apps/admin/src/features/settings/home-banners-page.tsx)) e servidos pela rota `GET /api/v1/site/config` ([`apps/api/src/modules/settings/settings.service.ts`](apps/api/src/modules/settings/settings.service.ts#L105-L121)). A home consome esses dados via hook `useSiteConfig()` em [`apps/storefront/src/content/site-config-client.tsx`](apps/storefront/src/content/site-config-client.tsx#L34-L48).
* **Mega Menu de Categorias**: **NÃO EXISTE NO CÓDIGO**.
  * O menu de navegação em [`apps/storefront/src/components/storefront-shell.tsx`](apps/storefront/src/components/storefront-shell.tsx#L21-L36) é uma barra simples com links fixos ("Home", "Sobre nós", "Serviços", "Loja", "Certificação") e um submenu suspenso comum de 4 itens de serviços.
* **Mecanismos de Busca e Filtros do Catálogo** ([`apps/storefront/src/pages/shop-page.tsx`](apps/storefront/src/pages/shop-page.tsx#L53-L90) e [`apps/api/src/modules/catalog/catalog.service.ts`](apps/api/src/modules/catalog/catalog.service.ts#L264-L276)):
  * **Busca**: via parâmetro `search` na query string. O backend realiza a busca utilizando `startsWith` no `name` ou no `slug` (`{ OR: [{ name: { startsWith: input.search } }, { slug: { startsWith: input.search } }] }`).
  * **Filtros**: parâmetros `brand` e `category` por slug na URL. O filtro de marca inclui automaticamente as sub-marcas pertencentes à árvore selecionada.
  * **Ordenação**: processada no frontend do cliente (`alphabetical`, `price-asc`, `price-desc`, `recent`).
  * **Paginação**: fatiamento no cliente em páginas de 12 produtos (`PRODUCTS_PER_PAGE = 12`).

---

### 7. URLs Amigáveis, SEO e Renderização (SSR/SSG)

* **URLs Amigáveis**: **SIM**. O roteador utiliza slugs amigáveis ([`apps/storefront/src/routes/router.tsx`](apps/storefront/src/routes/router.tsx#L50-L52)):
  * Produto: `/produto/:slug`
  * Categoria: `/categoria/:slug`
  * Marca: `/marca/:slug`
* **Sitemap**: **NÃO EXISTE NO CÓDIGO**.
* **Meta Tags Dinâmicas**: O arquivo [`apps/storefront/index.html`](apps/storefront/index.html#L6-L8) contém apenas comentários estruturais (`<!--SEO_TITLE-->`, `<!--SEO_META-->`, `<!--SEO_JSON_LD-->`), porém **NÃO EXISTE NO CÓDIGO** nenhum utilitário, biblioteca (como `react-helmet`) ou script para preenchê-los dinamicamente nas páginas de produto ou categoria.
* **SSR / SSG / Pré-render**: **NÃO EXISTE NO CÓDIGO**. O storefront é uma Single Page Application (SPA) pura baseada em Vite + React 19 executada 100% no navegador (Client-Side Rendering).

---

### 8. Acoplamento de Cursos e Treinamentos com Produtos Físicos

* **O que é Específico de Salão / Estética**:
  * Módulo backend [`apps/api/src/modules/trainings/`](apps/api/src/modules/trainings/).
  * Modelos de banco de dados: `Training`, `TrainingSession`, `TrainingBatch`, `Enrollment` ([`prisma/schema.prisma`](prisma/schema.prisma#L844-L905)).
  * Páginas institucionais de serviços capilares e certificação ([`apps/storefront/src/routes/router.tsx`](apps/storefront/src/routes/router.tsx#L33-L42)).
* **Grau de Acoplamento**: **MUITO BAIXO**.
  * No banco de dados, `Training` e `Product` são entidades completamente separadas.
  * O modelo de item do pedido `OrderItem` ([`prisma/schema.prisma`](prisma/schema.prisma#L711-L722)) possui os campos `variantId` e `trainingSessionId` como opcionais, diferenciados pelo enum `itemType` (`PRODUCT_VARIANT` vs `TRAINING_SESSION`).
  * A esteira de checkout padrão de compras via carrinho ([`apps/api/src/modules/orders/orders.service.ts`](apps/api/src/modules/orders/orders.service.ts#L79)) gera exclusivamente itens com `itemType: OrderItemType.PRODUCT_VARIANT`.
* **É Possível Ter um Catálogo Somente de Produtos Físicos?**: **SIM**. O domínio de produtos físicos (`Product`, `ProductVariant`, `Brand`, `Category`, `InventoryBalance`, `CartItem`) não possui nenhuma dependência com a tabela ou regras de `Training`.

---

### 9. Upload e Armazenamento de Imagens

* **Mecanismo de Upload**: Implementado em [`apps/api/src/modules/files/local-file-storage.service.ts`](apps/api/src/modules/files/local-file-storage.service.ts) e [`apps/api/src/modules/catalog/admin-media.controller.ts`](apps/api/src/modules/catalog/admin-media.controller.ts).
  * Upload via Multer com interceptor em memória (`memoryStorage`).
  * **Limite máximo por arquivo**: **10 MB** (`10 * 1024 * 1024` bytes em [`local-file-storage.service.ts`](apps/api/src/modules/files/local-file-storage.service.ts#L8)).
  * **Formatos aceitos**: JPEG (`image/jpeg`), PNG (`image/png`) e WebP (`image/webp`).
  * **Processamento com Sharp**: Gera automaticamente 3 variantes responsivas em WebP com qualidade 82% (larguras de **480px**, **960px** e **1440px**) e preserva o arquivo com a extensão original (`original<ext>`).
* **Armazenamento**: Físico no **disco do servidor** sob o caminho `storage/uploads/<uuid>/`. O banco de dados armazena apenas a string do caminho relativo ou URL na coluna `path` de `ProductImage` ([`prisma/schema.prisma`](prisma/schema.prisma#L429)). As imagens **não** são salvas no banco como BLOB.

---

### 10. Configurações Dinâmicas (Admin/Banco) vs Identidade Visual

* **Grupos e Chaves Dinâmicas Existentes no Banco / Admin** ([`apps/api/src/modules/settings/settings.types.ts`](apps/api/src/modules/settings/settings.types.ts#L8-L64)):
  1. **`site`**: `siteName`, `logoPath`, `faviconPath`, `address`, `phone`, `whatsapp`, `instagramUrl`, `title`, `description`.
  2. **`banners`**: `desktopPath`, `mobilePath`, `eyebrow`, `title`, `description`, `ctaLabel`, `ctaHref`, `sortOrder`, `status`.
  3. **`payments`**: `environment` (TEST/PROD), `publicKey`, `accessToken` (criptografado), `webhookSecret` (criptografado), ativações (`enabled`, `enablePix`, `enableCard`).
  4. **`smtp`**: `host`, `port`, `username`, `password` (criptografado), `security` (NONE/STARTTLS/SSL_TLS), `fromEmail`, `fromName`, `replyTo`, `enabled`.
  5. **`templates`**: Templates de e-mails transacionais (`subject`, `htmlBody`, `textBody`).
  6. **`notifications`**: Preferências por tipo de evento de e-mail (`enabled`, `recipientOverride`).
* **Configuração de Cores / Tema**: **NÃO EXISTE NO CÓDIGO**. Não há campos no banco ou no admin para gerenciar paleta de cores.
* **Troca de Identidade Visual**: **Exige alteração direta em código e CSS**. Cores, tipografia e estilos globais estão fixados nos arquivos de estilo ([`apps/storefront/src/styles.css`](apps/storefront/src/styles.css) e [`apps/admin/src/styles.css`](apps/admin/src/styles.css)), e todo o texto/imagem de apresentação institucional está fixado no arquivo [`apps/storefront/src/content/institutional-content.ts`](apps/storefront/src/content/institutional-content.ts).

---

### 11. Jobs Assíncronos e Testes Automatizados

* **Fila de Jobs Assíncronos**: **NÃO utiliza Redis, Bull ou RabbitMQ**.
  * A fila é transacional no próprio MySQL, persistida na tabela `ScheduledJob` do Prisma ([`prisma/schema.prisma`](prisma/schema.prisma#L922-L945)).
  * A execução em lote é orquestrada por `JobsService.processBatch` ([`apps/api/src/modules/jobs/jobs.service.ts`](apps/api/src/modules/jobs/jobs.service.ts#L10-L34)) com controle de concorrência e tentativas de retry.
  * O gatilho de execução é disparado via requisição HTTP externa em `POST /internal/cron/process` autenticada pelo header `Authorization: Bearer <CRON_SECRET>` ([`apps/api/src/modules/jobs/cron.controller.ts`](apps/api/src/modules/jobs/cron.controller.ts#L12-L18)).
  * Jobs suportados ([`apps/api/src/modules/jobs/job-handlers.ts`](apps/api/src/modules/jobs/job-handlers.ts#L7-L11)):
    * `SEND_TRANSACTIONAL_EMAIL`: envio de e-mails em lote.
    * `EXPIRE_INVENTORY_RESERVATIONS`: liberação de estoque de pedidos não pagos.
    * `GENERATE_FINANCIAL_REPORT`: exportação assíncrona de relatórios operacionais.
* **Testes Automatizados**:
  * **Bibliotecas**: **Vitest** (`vitest`) para testes unitários/integração e **Playwright** (`@playwright/test` em [`package.json`](package.json#L11)).
  * **Escopo Coberto**: O repositório conta com mais de 50 suítes de testes automatizados cobrindo:
    * Testes de concorrência em reserva de estoque e execução concorrente de jobs ([`apps/api/src/modules/inventory/inventory.concurrent.spec.ts`](apps/api/src/modules/inventory/inventory.concurrent.spec.ts) e [`apps/api/src/modules/jobs/jobs.concurrent.spec.ts`](apps/api/src/modules/jobs/jobs.concurrent.spec.ts)).
    * Validação da máquina de estados do pedido ([`apps/api/src/modules/orders/order-status-machine.spec.ts`](apps/api/src/modules/orders/order-status-machine.spec.ts)).
    * Mecanismos de cálculo e regras de cupons ([`apps/api/src/modules/promotions/coupon.service.spec.ts`](apps/api/src/modules/promotions/coupon.service.spec.ts)).
    * Importador de produtos WooCommerce ([`apps/api/src/modules/catalog/woocommerce-importer.spec.ts`](apps/api/src/modules/catalog/woocommerce-importer.spec.ts)).
    * Criptografia de credenciais ([`apps/api/src/common/crypto/settings-crypto.service.spec.ts`](apps/api/src/common/crypto/settings-crypto.service.spec.ts)).
    * Conformidade e anonimização de dados LGPD ([`apps/api/src/modules/customers/privacy.service.spec.ts`](apps/api/src/modules/customers/privacy.service.spec.ts)).
    * Renderização e formatação de e-mails transacionais ([`apps/api/src/modules/notifications/email-renderer.spec.ts`](apps/api/src/modules/notifications/email-renderer.spec.ts)).
    * Componentes visuais e telas do Storefront e Admin via React Testing Library ([`apps/storefront/src/pages/commerce-pages.spec.tsx`](apps/storefront/src/pages/commerce-pages.spec.tsx) e [`apps/admin/src/features/settings/settings-page.spec.tsx`](apps/admin/src/features/settings/settings-page.spec.tsx)).

---

### 12. Deploy em Produção e Processo de Build

* **Processo de Build de Cada App**:
  * O comando central na raiz é `pnpm build` ([`package.json`](package.json#L7)), que dispara a sequência `turbo build && node scripts/copy-web-builds.mjs`:
    1. **`apps/storefront`**: Vite compila os assets estáticos da loja para `apps/storefront/dist/` (`tsc --noEmit && vite build`).
    2. **`apps/admin`**: Vite compila o painel com base path `/admin/` para `apps/admin/dist/` (`tsc --noEmit && vite build`).
    3. **`apps/api`**: O compilador TypeScript gera os binários JS do NestJS em `apps/api/dist/` (`tsc -p tsconfig.build.json`).
    4. O script pós-build [`scripts/copy-web-builds.mjs`](scripts/copy-web-builds.mjs#L3-L13) copia `apps/storefront/dist` para `apps/api/public/storefront` e `apps/admin/dist` para `apps/api/public/admin`.
    5. Em execução de produção, o próprio servidor NestJS serve os arquivos estáticos de ambos os frontends via Express static middlewares configurados em [`apps/api/src/main.ts`](apps/api/src/main.ts#L22-L23), consolidando a aplicação inteira em um único processo Node.js.
* **Ambiente de Produção**:
  * Documentado no runbook [`docs/runbooks/hostinger-deploy.md`](docs/runbooks/hostinger-deploy.md).
  * A infraestrutura documentada é a **Hostinger Web Business** executando Node.js 22 através do comando `node apps/api/dist/main.js`, banco MySQL gerenciado, pasta persistente para arquivos enviados em `storage/uploads` e Cron Job no painel do servidor chamando periodicamente a rota `POST /internal/cron/process`. O smoke test pós-deploy é automatizado pelo script [`scripts/verify-deployment.mjs`](scripts/verify-deployment.mjs).
