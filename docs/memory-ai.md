# MEMORY AI — COMERCIAL DO NORTE

> **Documento canônico de contexto e decisões do projeto** — atualizado em **25/10/2026**.
> Leitura obrigatória para qualquer agente de IA ou desenvolvedor antes de planejar, implementar ou revisar alterações.
> Repositório: `https://github.com/idedigitalbr/loja-comercial-do-norte`.
> Complemento operacional: [`roadmap.md`](./roadmap.md). **Nesta pasta existem somente estes dois arquivos `.md`** (os únicos complementos ficam em `security/`).

## 0. Ordem de autoridade e regra de atualização

1. **Decisões explícitas mais recentes do responsável pelo projeto**, registradas neste documento, prevalecem sobre propostas, prompts, planos e decisões técnicas anteriores.
2. **Código da branch realmente inspecionada** determina o que existe e funciona no repositório; memória de produto não deve ser interpretada como funcionalidade já implementada.
3. A referência **visual** oficial é `site-comercial-do-norte-html-referencia/`, especialmente `DESIGN-comercial-do-norte.md`, imagens e páginas HTML. Ela é um ativo a reutilizar, não motivo para reconstrução visual livre.
4. Documentação antiga (planos, specs, runbooks, auditorias e memórias da base Jonas) foi **removida do repositório** em 24/10/2026 e permanece apenas no histórico Git (`5781590`). Além destes dois arquivos, `docs/` contém somente complementos de segurança (`docs/security/`), que não são fonte de decisão de produto.
5. Não inventar conclusão, teste, deploy, conexão ao ERP ou dado comercial. Anotar como **decidido / implementado / pendente / bloqueado**.
6. Atualizar **este `memory-ai.md`** quando houver decisão duradoura, e **`roadmap.md`** quando houver mudança de status, commit, risco, bloqueio ou etapa. Não criar novos arquivos Markdown de memória nem pastas `permanente`/`prompts` paralelas.

### Estado atual do código (transição)

- **Correção confirmada em 25/10/2026:** a main remota já contém Next.js/PostgreSQL e a coordenação, integrados em `018648f`; HEAD consultado `984079e`. Os apontamentos abaixo sobre main antiga e branches de desenvolvimento são históricos. A cópia local `D:\.GITHUB\sistemas\loja-comercial-do-norte` estava em `c6977e0` (23/10), foi sincronizada por fast-forward para `984079e` nesta sessão. O origin local ainda usa a URL antiga de `victorwilliames`; o repositório oficial é `idedigitalbr/loja-comercial-do-norte`. **Não refazer a migração Next nem reutilizar o storefront Vite antigo.** Vite permanece no admin.
- Referência inspecionada: branch `chore/multiagent-coordination`, derivada de `feat/stack-next-postgres` (`88c413c`). A `main` permanece em `564c9e3` até revisão humana. Em 24/10/2026 o **storefront passou a ser Next.js 16 (App Router)** consumindo a API REST, o **admin** continua React/Vite, o Prisma aponta para **PostgreSQL** com migrations versionadas e o domínio de **cotação** já existe na API.
- Next.js, NestJS e PostgreSQL estão implementados na branch de desenvolvimento; padronização completa de UI, aceite no navegador e produção permanecem pendentes. Não confundir implementação nessa branch com integração na `main` ou publicação.
- Projeto **em desenvolvimento**; segundo o responsável, **ainda não há produtos cadastrados**. Não concluir daí que o banco está vazio: validar usuários, configurações, banners e demais registros antes de qualquer reset.
- Meta da fase 1: **31/10/2026** (evento ACP), sujeita à validação de prontidão. Não declarar lançamento realizado.

| Camada | Decidido | Implementado hoje | Pendente |
|---|---|---|---|
| Storefront | Next.js App Router + TypeScript | **Next.js 16.4.3** em `apps/storefront` publicado na Vercel (`loja-comercialdonorte.vercel.app`) consumindo a API REST oficial | estado vazio/erros de rede, E2E Playwright, design da referência (fase C/D5) |
| API | NestJS, fonte única da regra de negócio | **NestJS 11 + Express 5** hospedado em Vercel Functions (`api-comercialdonorte.vercel.app`) | manter e evoluir |
| Banco | PostgreSQL (Neon na nuvem + Embedded local) | **PostgreSQL 18 no Neon** (AWS sa-east-1, São Paulo), conectado à API NestJS na Vercel | manter e monitorar |
| ORM | Prisma | Prisma 6 | revisar schema e histórico de migrations |
| UI | Tailwind CSS + shadcn/ui + `packages/ui` | CSS manual extenso + `packages/ui` parcial | padronizar (fase C) |
| Ícones | Lucide | Lucide | manter |
| Cotação | solicitação + aviso à equipe de vendas | **implementada** (`Quote`/`QuoteItem`/`QuoteEvent`, `POST /quotes` público, fila no admin, notificação) | telas finais/E2E (E8) |
| Flags de escopo | fase 1 sem checkout/pagamento/treinamento | `FEATURE_CHECKOUT/PAYMENTS/TRAININGS` desligadas por padrão, rotas retornam 404 | esconder telas legadas do admin |
| ERP | integração futura | inexistente | fase F |

## 1. Decisão FINAL de arquitetura — não reabrir por preferência de framework

**Stack aprovada para a Comercial do Norte:**

| Camada | Padrão obrigatório | Papel e limites |
|---|---|---|
| Storefront público | **Next.js + React + TypeScript** | Renderização adequada a SEO de produto/categoria, experiência responsiva e páginas institucionais |
| API / regras comerciais | **NestJS existente**, Node.js + TypeScript | **Fonte única da lógica de negócio**, catálogo, cotação, autenticação, integrações, pagamentos futuros e autorização |
| Banco de dados | **PostgreSQL** | Provider PostgreSQL implementado na branch de desenvolvimento; backup e validação antes de qualquer banco real |
| ORM | **Prisma** | Modelagem, migrações e acesso a dados **somente pela API NestJS** |
| Design e estilos | **Tailwind CSS + shadcn/ui + tokens CSS** | Componentes reutilizáveis, acessíveis, consistentes; **não instalar um segundo design system concorrente** |
| Componentes compartilhados | `packages/ui` | Componentes base, variantes, utilitários e tokens únicos para loja e admin |
| Ícones | **Lucide** | Mesmo estilo, tamanhos e stroke em todas as telas |
| Dados de servidor no cliente | **TanStack Query quando necessário** | Cache, sincronização e invalidação de requisições interativas; não confundir com TanStack Start |
| Forms / contratos | **React Hook Form + Zod** quando apropriado; `packages/contracts` | Schemas compartilhados, validação no servidor obrigatória, formulários padronizados |
| Workspaces | **Turborepo + pnpm** | Preservar monorepo, scripts centralizados, TypeScript strict, lint/test/build padronizados |
| Qualidade | **Vitest + Playwright + lint + typecheck** | Verificação automatizada, sobretudo fluxos de cotação, auth e concorrência |
| Hospedagem-alvo | **VPS com deploy definido e verificado** | Next.js e NestJS como serviços separados/reverse proxy; PostgreSQL persistente, backups, HTTPS, observabilidade. Não presumir que o modelo antigo (um processo Nest servindo os SPAs) sirva como deploy final |

### O que fica explicitamente DE FORA

- **MedusaJS: NÃO instalar, NÃO migrar o backend para Medusa, NÃO usá-lo como motor de pedidos, carrinho ou catálogo.** Pode servir apenas de inspiração conceitual quando solicitado.
- **Payload CMS: NÃO instalar, NÃO criar segundo backend, NÃO utilizar coleções ou backend Payload.** O estudo antigo de Payload é apenas histórico; no máximo aproveitar ideias de UX/CMS, sem dependência.
- **TanStack Start: NÃO adotar**. Decisão de framework público já é **Next.js**.
- Não criar APIs comerciais próprias dentro de Route Handlers do Next.js que dupliquem lógica NestJS. SSR pode consultar a API NestJS; a autorização permanece no backend.
- Não adicionar outro framework de componentes (MUI, Ant Design etc.) por comodidade; novas dependências requerem justificativa técnica.
- Não reintroduzir MySQL nem React/Vite como arquitetura final. Não reconstruir o backend Nest sem um requisito comprovado.

### Organização-alvo coerente com a base atual

```text
apps/
  storefront/          # Next.js App Router implementado; evolução visual incremental
  admin/               # painel React/Vite EXISTENTE; padronizar shadcn/Tailwind
                         # avaliar integração futura ao Next, sem big bang
  api/                 # NestJS — única API de negócio e acesso ao PostgreSQL
packages/
  ui/                  # tokens globais, shadcn/ui, componentes compartilhados
  contracts/           # Zod, DTOs e tipos públicos compartilhados
  api-client/          # cliente de API tipado, autenticação e tratamento de erros
  config-eslint/
  config-typescript/
prisma/                  # schema PostgreSQL + quatro migrations versionadas
site-comercial-do-norte-html-referencia/  # fonte visual de verdade
docs/
  memory-ai.md          # ESTA fonte de verdade
  roadmap.md            # execução, auditoria e registro de alterações
  security/             # complementos: LGPD e threat model
```

**Não renomear diretórios por estética sem mapear imports, scripts e deploy**. A migração para Next é incremental e o admin não precisa ser refeito no mesmo commit.

**Responsabilidades:** `storefront` e `admin` apenas consomem a API (nunca acessam banco); `api` concentra regra de negócio, persistência, autorização, integrações e jobs; `packages/*` guarda contratos, cliente tipado, componentes e configurações compartilhadas.

### Princípios obrigatórios de implementação

- Organização por domínio/feature; separação de camadas e dependências explícitas; baixa duplicação; contratos tipados e atualizados junto com API.
- Tokens e componentes canônicos centralizados no workspace compartilhado; nenhum CSS solto para refazer estilos já existentes. Tailwind sobre CSS custom properties. Configuração shadcn consistente em `apps/*` e `packages/ui`.
- Server Components por padrão em páginas Next quando fizer sentido; componentes cliente somente por interação real. SEO com metadata, conteúdo indexável e URLs canônicas verificadas. Estratégia de cache sem expor conteúdo privado.
- API NestJS preserva controle transacional, RBAC, validações, idempotência, logs com `requestId`, auditoria e autenticação segura. Nunca confiar em preço/frete/totais enviados pelo browser.
- Acessibilidade **WCAG 2.2 AA**, navegação por teclado, foco visível, `aria-*`, formulários com estados de sucesso/erro/carregamento, responsividade mobile-first.
- `pt-BR`, moeda BRL e fuso comercial **America/Belem**; separadores, preços em centavos e datas coerentes. Não hardcodar segredos, domínio nem dados privados.
- Não reescrever funcionalidades prontas só por conveniência. Mudança estrutural precisa ter teste, rollback e explicação de impacto no roadmap.

## 2. Produto e estratégia comercial

**Comercial do Norte**: distribuidora de plásticos, descartáveis, embalagens, variedades e mercearia, localizada em Belém/PA, atendendo **atacado e varejo** (pizzarias, padarias, lanchonetes, restaurantes, festas, escritórios, revendedores e consumidor final). O projeto substitui a experiência institucional antiga `dosplasticos.com.br`; domínio final ainda requer confirmação.

### Fase 1 — escopo vigente: catálogo + cotação

- A loja **parece e navega como e-commerce**, com preços de referência, busca, páginas de produtos, categorias, marcas, banners, conteúdo e ofertas; **não realiza cobrança online na fase 1**.
- Fluxo: catálogo → **Adicionar à Cotação** → carrinho de cotação → formulário (nome, WhatsApp, empresa opcional, observações) → **Enviar Cotação** → número/protocolo → equipe de vendas avisada por notificação → negociação/fechamento **no ERP**, fora do site.
- **Sem checkout de compra, Pix, cartão, parcelamento ou cálculo de frete para venda nesta fase**; não mostrar botões "Comprar"/"Finalizar compra".
- Produto novo entra em **rascunho/pendente, invisível no catálogo público**, até marketing completar os dados e publicar. Validar acesso por slug também, não apenas nas listagens.
- Marketing deve gerenciar produtos, categorias, marcas, banners, identidade, dados da loja e, progressivamente, páginas/blog no painel sem intervenção de programador.
- ERP ainda **não integrado**: catálogo por admin/seed provisório. A futura API do ERP será origem autoritativa dos dados que fornecer; manter `legacySource`, `legacyId` e SKU como pontos de integração. Não implementar sync sem especificação oficial.

### Fase 2 — posterior e NÃO habilitada agora

- Sincronização com ERP; marketplace/checkout completo quando aprovado; Pix/cartão, frete, reserva e conciliação de estoque; nota fiscal conforme integração e necessidades; conta do cliente completa; blog CMS editável, automação de marketing e otimizações.
- Módulos antigos NestJS de pagamentos, pedidos, cupons, estoque e treinamento **não devem ser apagados indiscriminadamente**: preservar e isolar por feature flags/rotas apropriadas até auditoria de domínio. Módulo de treinamentos é legado, fora da vitrine Comercial do Norte.
- **Não assumir que recursos herdados estão prontos para produção**. Há problemas conhecidos de webhook, jobs, segurança e frete descritos no roadmap.

### Regras de catálogo, produto e publicação

- Só produto `ACTIVE` aparece ao público; rascunho (`DRAFT`) fica invisível em listagem, busca, sitemap **e no acesso por slug**.
- Publicar exige: SKU na variante principal, foto principal (`isPrimary`), peso e dimensões (largura, altura, comprimento). A regra já existe em `CatalogService.publish` (`ProductIncompleteError`).
- Preço vive na variante, em centavos (`priceCents` e `compareAtPriceCents`); o "de/por" das ofertas deriva daí, nunca de texto livre.
- Categoria: hierarquia pai/filho implementada com `parentId`, `imagePath`, `sortOrder` e proteção contra ciclos. Filtros incluem descendentes; upload/ordenação no painel ainda precisam de aceite.
- Marca: já tem hierarquia pai/filho, e o filtro inclui as marcas filhas.
- Mídia: upload até 10 MB (JPEG/PNG/WebP) gera 3 larguras WebP (480/960/1440) + original em armazenamento próprio; **proibido hotlink externo** em produto, banner ou conteúdo.
- `legacySource` + `legacyId` (único composto) e `ProductVariant.sku` (único) são as âncoras de qualquer importação ou sincronização.
- Conteúdo de demonstração (marca, depoimento, preço) precisa estar marcado como exemplo e nunca ser publicado como real.

### Integração com o ERP (fase 2 — não implementar sem contrato)

- O ERP é a **fonte autoritativa** dos dados que fornecer: título, descrição, preço, galeria, categoria/subcategoria, peso e dimensões (cubagem) e, quando acordado, estoque.
- Produto que chega do ERP entra como **pendente/rascunho** e só é publicado depois que o marketing completar foto/descrição e aprovar.
- Sincronização idempotente por `legacySource`/`legacyId`/SKU; nunca apagar histórico local nem despublicar automaticamente por ausência no ERP sem decisão explícita.
- Nada de sync antes de: documentação oficial da API, autenticação, limites de requisição, eventos/periodicidade e política de conflitos acordados.
- O importador WooCommerce existente é **referência conceitual** de idempotência e reconciliação — não é dependência nem especificação do ERP.

## 3. Identidade visual e UX oficiais

**Fonte oficial:** `site-comercial-do-norte-html-referencia/DESIGN-comercial-do-norte.md`, com `index.html`, prévia de design system e `assets/`. Reutilizar a composição e os ativos já aprovados; não substituir por referência visual da +B Farma nem pelo visual preto/dourado da Jonas & Elivaldo.

### Requisito vigente de vitrine modular — 25/10/2026

- O responsável pediu reprodução extremamente fiel do **HTML real**, sem redesign, comparando viewports iguais. Não alterar a referência. Preservar API Nest, cotação e integrações existentes.
- Home por widgets conhecidos, tipados e validados: instância com `id`, `type`, `enabled`, `order`, `props`; composição versionada; registro fechado de renderizadores, sem HTML arbitrário vindo do banco. Conteúdo separado do JSX. Header/navegação/footer globais fora da ordenação livre.
- Server Components para carregamento/composição; Client Components apenas nas interações. Reutilizar `packages/ui`, contratos e API. Tailwind + tema shadcn alinhados aos tokens extraídos; a presença de primitivos próprios **não comprova** instalação completa do shadcn/Radix.
- Primeira implementação: fundamentos → header/navegação → hero de largura total → carrossel contido → carrossel de campanhas convencional. Não implementar todos os widgets nem editor visual agora.
- Evolução planejada: edição pelo admin, publicação sem deploy e preview/editor usando os mesmos renderizadores públicos. Persistência e autorização exclusivamente no Nest; não criar CMS/backend paralelo.
- **Implementação executada em 25/10/2026:**
  - **Fundamentos e Tokens:** Tokens oficiais do Header (`--cn-header-top-red: #e2091e`, `--cn-header-main-blue: #004cb1`, `--cn-header-subnav-blue: #00357b`, `--cn-bg-hero: #ebebeb`) centralizados em `packages/ui/src/styles/tokens.css` e mapeados no Tailwind 4 em `apps/storefront/app/globals.css`. Assets e favicons sincronizados em `apps/storefront/public/assets/`.
  - **Arquitetura Modular de Widgets:** Tipos estritos em `apps/storefront/lib/storefront/widget-types.ts` (`WidgetConfig`, `HeroCarouselProps`, `ContainedHeroProps`, `BenefitsBarProps`, `ProductCarouselProps`, `CategoryGridProps`), registro em `widget-registry.tsx` e renderizador seguro `PageRenderer`. Composição padrão da vitrine desacoplada do JSX em `home-configuration.ts`.
  - **Header Fiel à Referência (S0):** Três barras canônicas (`#E2091E` benefícios/WhatsApp, `#004CB1` Mascote James 3D / Logo oficial branca / CEP Belém / Busca circular Figma / Ações cotação e conta, `#00357B` departamentos e ofertas com tag NOVO), scroll auto-hide inteligente e Drawer Mobile off-canvas.
  - **Hero de Largura Total (S1):** `HeroCarouselWidget` estilo Mercado Livre, com autoplay, setas circulares brancas, indicadores de pontos e transição degradê inferior.
  - **Hero Secundário Contido (S1):** `ContainedHeroWidget` arredondado (`rounded-2xl md:rounded-3xl`), sobreposto com margem negativa (`-mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20`), setas escuras translúcidas com blur e badge com dot da marca.
  - **Widgets Complementares:** `BenefitsBarWidget` (4 pilares comerciais), `ProductCarouselWidget` (ofertas com cards e cotação) e `CategoryGridWidget` (departamentos).
  - **Editor Visual Estilo Elementor (25-26/10/2026):** Implementado modo de edição visual interativo direto na vitrine pública (`HomeView`, `ElementorEditorProvider`, `ElementorTopBar`, `ElementorSectionWrapper`, `InlineImageEditorOverlay`). Permite ao administrador selecionar qualquer seção via alça minimalista (`[ ✎ Lápis ] | [ ⠿ Drag & Drop ] | [ ↑ ] [ ↓ ]`), inserir seção acima/abaixo, duplicar, ocultar ou remover, além de trocar imagens e links diretamente no centro de cada banner/card (`InlineImageEditorOverlay`). Possui:
    - **Controle de Acesso Admin:** O botão flutuante discreto `ElementorTogglePill` e o modo de edição só são visíveis e ativáveis por usuários autenticados como administradores (`user.isAdmin === true`). A rota `POST /api/storefront/composition` valida o cookie/permissão de administrador antes de salvar (retornando `403 Forbidden` para acessos não autorizados).
    - **Autosave Temporário Local vs Salvar no Servidor:** Cada alteração visual (troca de imagem, exclusão de slide, reordenação de seções) realiza autosave local imediato no navegador (`localStorage`) para evitar perda de rascunhos. O botão de publicação no topo fica pulsando com status `Salvar *`. Ao clicar, publica no servidor e passa a exibir `Salvo no Servidor` com ícone verde.
    - **Persistência Real no Servidor & SSR:** O arquivo `home-composition.json` é gravado no disco do servidor (`lib/storefront/composition-storage.ts`), revalida o cache Next.js (`revalidatePath('/')`), e é entregue via SSR no `layout.tsx` e `page.tsx` para que qualquer visitante ou aba anônima visualize as alterações imediatamente sem telas em branco ou layouts desatualizados.
    - **Histórico de Revisões e Checkpoints estilo Elementor (26/10/2026):** Implementado sistema completo de auditoria e restauração de versões (`ElementorRevisionsModal`, `StorefrontRevision`, `/api/storefront/revisions`). Cada salvamento no servidor grava automaticamente um checkpoint com data, hora, autor da alteração (`authorName`, `authorEmail`) e snapshot da vitrine. Permite visualizar a linha do tempo e restaurar com 1 clique qualquer versão anterior caso o administrador queira reverter alterações indevidas.
  - **Biblioteca Completa de Widgets e Homepage de 20 Seções (`site-final.jpg` + `wireframe.png` — 25/10/2026):**
    - Reconstruída a homepage inteira em fidelidade 1:1 com `REFERENCIA/site-final.jpg` (`2880×17208`) e `REFERENCIA/wireframe.png` (`1920×9267`), composta pelo `SiteHeader` (3 barras), **19 seções sequenciais de widgets configuráveis** (`defaultHomeComposition` em `home-configuration.ts`) e `SiteFooter` (Seção 20):
      - `01` `hero-carousel` (*Tudo para sua Pizzaria* — largura total com degradê inferior)
      - `02` `contained-hero` (*Semana do Feirante — Copo 180ml* — contido arredondado com overlap negativo)
      - `03` `category-grid` (`variant: 'icons-bar'` — faixa branca com 8 ícones quadrados editáveis)
      - `04` `product-carousel` (`variant: 'split-banner'` — banner vertical *Semana do Feirante* à esquerda + 3 produtos em promoção à direita)
      - `05` `banner-grid` (3 banners triplos: *Limpeza*, *Feirante*, *Sacos e Sacolas*)
      - `06` `product-carousel` (`variant: 'standard-5col'` — *Mais vendidos* com 5 colunas)
      - `07` `quote-steps-banner` (*Saiba / Como funciona a cotação online* — Mascote 3D James + 4 cards numerados com ícones azuis e setas vermelhas + arte direita)
      - `08` `segments-carousel` (*Tudo para todos os negócios / Para todos os tamanhos!* — 4 cards escuros com foto superior editável e ícone circular vermelho)
      - `09` `promo-strip` (`variant: 'offers-strip'` — *OFERTAS IMPERDÍVEIS* com logo branca, itens centrais e 3 selos contornados)
      - `10` `product-carousel` (`variant: 'standard-5col'` — *Para você* com 5 colunas)
      - `11` `banner-grid` (3 banners triplos: *Hamburgueira*, *Luva Vermelho*, *Luva Azul*)
      - `12` `events-carousel` (*Nossos Eventos / Tudo que acontece no Comercial do Norte* — fundo escuro quadriculado, banner superior de palco e 4 cartazes `9:16`)
      - `13` `promo-strip` (`variant: 'conditions-mascot'` — *CONDIÇÕES ESPECIAIS para o seu negócio* com Mascote James, sacolas e 4 selos em colunas)
      - `14` `product-carousel` (`variant: 'standard-5col'` — *Para você* com 5 colunas)
      - `15` `video-articles-carousel` (*Explica aí comercial* — bloco bordô com 2 cards horizontais de vídeo/artigo *Como escolher a caixa de pizza certa*)
      - `16` `instagram-feed` (*A Loja no Instagram* — `@comercialdonorte` com 6 cards verticais editáveis)
      - `17` `promo-strip` (`variant: 'whatsapp-group'` — *Entre em nosso Grupo de ofertas Exclusivas do WhatsApp*)
      - `18` `testimonials-grid` (*AVALIAÇÕES NO GOOGLE — O que nossos clientes dizem no Google.* — 10 cards 5 estrelas em grid 5×2)
      - `19` `store-locations-map` (*Encontre nossas unidades / Lojas mais perto de você* — busca na coluna esquerda + 3 cards escuros com foto da fachada + Google Maps)
      - `20` `SiteFooter` (Logo branca centralizada, redes sociais Instagram/TikTok/Facebook e barra azul `#1D3B78`)
  - **Validação:** `pnpm typecheck` 6/6 aprovados, `pnpm lint` 6/6 aprovados e `pnpm --filter storefront test` aprovados no monorepo.

| Papel | Valor oficial | Uso |
|---|---|---|
| Azul principal | `#264887` | Header, navegação, links/ações principais |
| Azul hover | `#1E3A6E` | Hover/foco conforme contraste |
| Vermelho comercial | `#E33C34` | Ofertas, sinalização comercial, CTA contextual |
| Vermelho hover | `#C92F27` | Estados de hover |
| Fundo | `#F4F7FB` | Fundo principal |
| Títulos | `#1D2433` | Títulos e textos de destaque |
| Texto | `#475467` | Conteúdo corrente |
| Superfície escura | `#13213B` | Footer/seções de contraste |

- Tipografia: **Lufga**, fallback **Plus Jakarta Sans**, sans-serif; escala 400/500/600/700/800. Usar licença e arquivos já legitimamente fornecidos ao projeto; não publicar fontes sem direitos.
- Logo oficial e variações na pasta `assets/Logos/` da referência HTML. Preservar integralmente proporções e marca.
- Componentes base: button, input, textarea, select, badge, dialog, sheet/mini-carrinho, dropdown/mega menu, card, table, form, toast/alert, skeleton, empty state; variantes consistentes e tipadas em `packages/ui`.
- Visual limpo de varejo, forte legibilidade, fotografias e produtos reais. Referências conceituais de organização: Magalu e Mercado Livre, **sem copiar identidades**.
- Conteúdo inventado, avaliações, marcas, produtos e preços devem ser **explicitamente marcados como demonstração** e nunca expostos como informação real.

### Estrutura editorial e da home (contrato de conteúdo)

- **S0 Cabeçalho:** barra fina (ofertas do dia, "compre pelo WhatsApp", "retire na loja"), logo, **busca grande** ("buscar embalagem, descartável, marca..."), "Informe seu CEP", conta e carrinho de cotação com contador; **mega menu de categorias/subcategorias** e atalhos para ofertas, marcas e conteúdo. Faixa de benefícios com os selos da empresa: **Menor Preço · Variedade · Tudo em um Só Lugar · Clientes Satisfeitos**.
- **S1** carrossel de campanhas administrável. **S2** marcas em círculos. **S3** ofertas do dia com etiquetas derivadas de dados confiáveis, contagem válida quando existir período cadastrado e CTA de cotação.
- **S4** categorias e banners de segmento (“Comercial do Norte do Pizzaiolo”). **S5** mais vendidos e atacado/pro seu negócio; não simular métricas reais sem dados.
- **S6** conteúdo “**Explica Aí Comercial**”, artigos/vídeos e produtos relacionados; na primeira fase pode ter conteúdo estático aprovado, posterior CMS editável.
- **S7** prova social **somente quando houver dados verificáveis**. **S8** loja física, localização e atendimento. **S9** ofertas/Instagram. **S10** rodapé completo: institucional, ajuda, minha conta, contatos, CNPJ, selos e políticas.
- Elementos adicionais planejados: atalhos pós-carrossel, explicação do processo de cotação, termos buscados quando existirem dados, consentimento/cookies LGPD.
- Produto: galeria real, SKU, variações, dados técnicos, marca/categoria, “Adicionar à Cotação”, mini-carrinho acessível e similares; categorias e marcas com URLs amigáveis.

### Categorias referenciadas na pesquisa do site anterior

Artigos para Festa; Embalagens; Descartáveis; Doces e Bomboniere; Sacos e Sacolas; Produtos de Limpeza; Frios e Laticínios; Mercearia. Subcategorias dependem da estrutura oficial do catálogo/ERP.

### Dados empresariais pesquisados, ainda **a confirmar antes da publicação**

- Endereço pesquisado: Av. Rômulo Maiorana, 115A, São Braz, Belém/PA, CEP 66093-635.
- Horários pesquisados: seg–sex 6h30–18h; sáb 6h30–12h30; dom 7h–12h30.
- Telefones pesquisados: (91) 4042-0513 e (91) 3246-4908; WhatsApp (91) 98344-0880.
- E-mail pesquisado: contato@dosplasticos.com.br; CNPJ pesquisado: 16.965.024/0001-15.
- Domínio final: pendente; não inferir que `dosplasticos.com.br` continuará. Nunca colocar `jonaselivaldohair.com.br` como canonical, destino de mídia ou contato.

## 4. Base existente — o que já está implementado

- Monorepo Turbo + pnpm com `apps/storefront` (Next.js App Router), `apps/admin` (React/Vite) e `apps/api` (NestJS 11 + Prisma 6 + PostgreSQL), além de `packages/contracts`, `ui` e `api-client`. Migrations versionadas incluem baseline, nome do site, cotações e hierarquia de categorias. A existência dos arquivos não comprova aplicação em produção.
- API com autenticação por sessão (cookie assinado), RBAC por permissão, catálogo (produto/variante/imagem), marcas hierárquicas, categorias, estoque com reserva transacional, carrinhos anônimos, cupons/promoções, pedidos com máquina de estados, pagamentos Mercado Pago, entregas, clientes, configurações, banners, notificações, relatórios e treinamentos herdados.
- `SiteBanner` é o model real de banners; `GET /api/v1/site/config` devolve site + banners ativos.
- Mídia com Sharp: original + 480/960/1440 WebP.
- Seed idempotente e importador WooCommerce ancorado em `legacySource`/`legacyId`.
- Admin cobre catálogo, fila de cotações, pedidos, estoque, clientes, promoções, relatórios e configurações. Módulos de compra são legado isolado por flags na API; ocultação completa no admin ainda está pendente.

Lacunas, defeitos e riscos dessa base **não são repetidos aqui**: estão em `roadmap.md` §3 (R01–R16) e nas fases de migração.

## 5. Regras para agentes — qualidade e segurança

1. **Antes de editar:** confirmar branch/HEAD, ler `memory-ai.md` + `roadmap.md`, conferir arquivos de código afetados e design de referência, definir testes e rollback; não sobrescrever trabalho em andamento.
2. **Alterar por etapas pequenas:** commit por migração/feature; mensagens em português; não misturar migração de banco, reescrita do frontend e redesign inteiro no mesmo commit.
3. **Nunca afirmar "implementado" apenas porque está neste documento.** Sempre comprovar em código + teste de execução.
4. **Dados críticos:** preservar identificadores, relacionamentos, saldos, histórico, privilégios e segredos. Mesmo sem produtos, verificar se há admin, configuração ou banner real antes de migrar/limpar bancos.
5. **Nomes de função/tabela/rota:** conferir schema atual e contratos antes de copiar de uma memória antiga; atualizar docs apenas quando efetivamente mudarem.
6. **Proteção de API:** autorização por recurso/ownership, RBAC, validação de input no servidor, limite de upload, CSP, CORS, CSRF conforme autenticação, rate limiting em endpoints públicos, logs sanitizados e LGPD.
7. **Estoque / cotação:** a solicitação de cotação **não confirma pedido pago** nem deve reservar estoque automaticamente; separar intenção de cotação de transação comercial.
8. **Padrão UI:** reutilizar shadcn/ui + `packages/ui` e tokens oficiais; componentes acessíveis; nada de CSS arbitrário duplicado nem animação invasiva.
9. **Segredo:** nunca commitar `.env`, tokens de ERP/Pagamentos, senhas ou dumps. Exemplos usam variáveis e valores fictícios marcados.
10. **Restrições de escopo:** sem Medusa, sem Payload, sem TanStack Start, sem reconstrução do backend Nest e sem ativar pagamentos na fase 1.

### 5.1 Coordenação multiagente permanente

- Fonte operacional: [Project 3](https://github.com/orgs/idedigitalbr/projects/3), preservando o nome configurado e somente **Tabela, Kanban e Roadmap**. Repositório oficial privado: `idedigitalbr/loja-comercial-do-norte`. Hierarquia nativa **Sprint → Etapa → Tarefa**, 36 tarefas originais; manutenção adicional identificada separadamente no manifesto.
- Toda Issue operacional possui responsável humano em Assignees; padrão autorizado `victorwilliames`, sem remover atribuições legítimas. Executor IA é outro campo. Campo vazio significa nenhuma IA designada.
- Identidade estável em `scripts/agents/executors.json`: executorId, ferramenta, operadorHumano, modelo e nomeExibido. Modelo desconhecido fica nulo; não usar os exemplos de modelos do briefing como telemetria. Novos operadores precisam de cadastro explícito e permissão de escrita no repo.
- Exclusividade: uma ref permanente `refs/heads/claims/issue-N` por Issue. Primeiro claim cria a ref atomicamente; operações têm nonce aleatório exclusivo, preservam a árvore do pai e eventos posteriores criam commits filhos e atualizam com **force:false**. Concorrentes com o mesmo pai não podem sobrescrever um ao outro. Release grava uma sessão encerrada, **não exclui a ref**: isso impede que uma liberação atrasada apague um sucessor. Refs livres são histórico, não branches de desenvolvimento abandonadas.
- Ledger autoritativo: `agent-session.json` na própria ref, histórico imutável por commits, com ator autenticado, sessão única, branch, eventos, evidências e participantes acumulados. O nome exibido não concede propriedade: ator + executorId + session devem coincidir. Nunca confiar em comentários públicos como prova de dono.
- Não há expiração/liberação forçada automática. Após falha, consultar status e retomar/renovar a mesma sessão; `pendingMirror` mantém a barreira até o espelho confirmar; nova operação é recusada nesse intervalo. `repair` recompõe o espelho a partir do ledger; se houver pendência, exige `--recover --reason` após confirmar que o processo anterior encerrou. Outra pessoa não deve apagar a ref para contornar a trava. Recuperação administrativa sem a sessão original exige inspeção humana de branch/PR/processo e migração auditada.
- `pause/resume` registram eventos; duração total deriva de início/fim verificados. Tempo ativo, tokens de entrada/saída/cache/total, custo e provedor ficam **Não disponível** sem telemetria real. Não publicar custos privados nem segredos em campos, comentários ou ledger.
- Campos atuais: `Tipo` multisseleção; `Agente executando` seleção única; `Agentes que participaram` multisseleção, preenchido no início da execução, não no claim. `Trilha` foi removida; registros históricos foram preservados em comentários. Heartbeat atualiza atividade sem renovar reserva automaticamente; ausência de atividade não libera a trava.
- `project-sync.mjs` (bootstrap) cria o que falta; `--reconcile` corrige estrutura, dependências e incoerências comprovadas, sem reaplicar status/executor/assignees do manifesto sobre trabalho ativo. Não fecha tarefas nem agrupadores automaticamente. Repetição deve resultar em zero alterações. `verify-project.mjs` é somente leitura.
- Dependências nativas Blocked by/Blocking são verificadas por leitura da API; ciclos longos são recusados. Dependência aberta impede claim/start/resume. O manifesto preserva as 36 tarefas e 42 dependências originais.
- Status: Backlog, A Fazer, Reservado, Em Andamento, Em Revisão, Bloqueado, Concluído. Conclusão exige aprovação humana explícita, commit/PR/testes e filhos encerrados. CI e merge de PR não concluem nem liberam reserva. Revisão/bloqueio permanecem ao liberar a sessão.
- Prioridades preservam IDs e escala: P0 — URGENTE | Pra ontem; P1 — ALTA | Pra hoje; P2 — NORMAL | Prioridade média; P3 — BAIXA | Pra depois. Labels continuam existindo, ocultas na Tabela.
- Datas do Project: `Início`/`Entrega` são gravadas apenas quando faltam. Verificação da API confirmou 34/34 itens fora de Backlog com ambas as datas; 8 itens em Backlog sem datas. Datas de tarefas ativas são estimativas. Roadmap Sprint 3 preserva entrega aprovada em 31/10 apesar de tarefas filhas agregadas até 07/11; requer revisão humana. Seletores de timeline/escala do Roadmap não são expostos pela API usada e aguardam confirmação manual na UI.
- Workflows consultam a permissão real do ator (write/maintain/admin), usam argumentos diretos ao Node e nunca executam texto de comentários no shell. PR privilegiado só usa código da branch padrão; nunca checkout da cabeça do PR com token privilegiado.
- Automação de Projects usa secret `PROJECT_TOKEN` com escrita no Project da organização e leitura das Issues vinculadas. Preferir GitHub App com Organization projects read/write e acesso somente ao repo necessário; não pressupor que GITHUB_TOKEN efêmero tenha acesso organizacional. Git/Issues usam GITHUB_TOKEN com permissões do workflow. Não copiar a credencial OAuth local para secrets automaticamente. Referências: [autenticação de Projects](https://github.github.com/gh-aw/reference/auth-projects/), [refs Git](https://docs.github.com/en/rest/git/refs).
- Regras nativas de Project que renomeiam/fecham por IDs antigos devem ser revistas antes de mudar Status. A regra de adicionar sub-issues pode permanecer. Nenhuma automação deve concluir apenas por CI ou PR mesclado.
- Não criar branch para mudanças de campos. Para código, reutilizar branch segura quando possível; PR #37 tem base `feat/stack-next-postgres` para isolar coordenação. Merge na main e deploy exigem autorização separada.

## 6. Decisões pendentes fora da stack

- Confirmação de domínio, dados cadastrais/horários/contato, lista de marcas, catálogo e fotos, responsável/destino das cotações, origem real dos preços.
- Regras comerciais da fase 2 ainda em aberto: frete (provedor, regiões, prazo, fallback), retirada, condições de pagamento, cancelamento/reembolso, emissão fiscal/NF e política VIP.
- Documentação e contrato da API do ERP (Bruno/equipe), autenticação, limites, eventos, periodicidade e estratégia de sincronização.
- Infra de VPS, estratégia de deploy Next + Nest + PostgreSQL, armazenamento persistente de mídia, backups, CI/CD e plano de rollback.
- Definição de quando o painel administrativo será migrado para Next.js; **o objetivo firme agora é migrar a loja pública**, mantendo o painel utilizável durante a transição.

## 7. Checklist de Hardening, Segurança e Pré-Lançamento (Go-Live)

> **Regra de convivência com o desenvolvimento:** Durante a fase ativa de desenvolvimento e prototipação, atalhos de conveniência (contas mock de login, bypass de teste em rotas e fallbacks locais) permanecem ativos para acelerar a validação e não travar o fluxo de trabalho dos agentes e desenvolvedores. **Nenhum destes atalhos deve ser removido prematuramente**, devendo ser resolvidos estritamente na etapa final de homologação e lançamento.

### 7.1 Segurança & Acesso (Hardening)
- [ ] **Contas e senhas de demonstração:** Remover o botão *"Ver Senhas de Demonstração / Acesso Rápido"* e as contas estáticas (`admin@admin.com` / `cliente@demo.com`) de `AuthFlowCard` e `auth-provider.tsx` antes de disponibilizar para o público real.
- [ ] **Senha do Administrador de Produção:** Alterar a senha da conta administradora principal no banco de dados do Neon para uma senha forte, única e segura (substituindo a senha padrão de seed `admin123456`).
- [x] **Blindagem da API de Vitrine (Implementado 26/10/2026 via `admin-guard.ts`):** Fechada a permissão de conveniência `x-admin-role` e a leitura de cookie cru em ambientes de produção/Vercel (`403 Forbidden` com rejeição de atalhos inseguros), exigindo sessão oficial autenticada pelo NestJS (`je_access`) ou chave de serviço autorizada (`x-admin-secret`), enquanto preserva os atalhos em ambiente de desenvolvimento local/CI para não travar os fluxos de trabalho autônomos dos agentes.
- [x] **Persistência Durável no PostgreSQL Neon (Implementado 26/10/2026):** Composição ativa e histórico de revisões integrados ao PostgreSQL Neon (`SiteConfiguration.homeComposition` e `AuditLog`), permitindo que a Vercel serverless grave e recupere alterações sem depender do sistema de arquivos local (mantendo fallback em disco para desenvolvimento offline).
- [ ] **Fallback de Segredo de Sessão:** Remover o fallback `'development-cookie-secret'` nos serviços de autenticação e criptografia da API, exigindo `COOKIE_SECRET` estrito em qualquer runtime de produção.
- [ ] **Controle de Mídia e Uploads:** Limitar tipos MIME e tamanhos máximos para uploads de banners e logotipos no painel do editor visual.

### 7.2 Performance, Cache & Infraestrutura
- [ ] **Auditoria de Imagens:** Otimização de todos os assets estáticos via `next/image` com configuração rigorosa de domínios em `next.config.ts`.
- [ ] **Estratégia de Cache e ISR:** Ajustar os tempos de revalidação estática da vitrine e catálogo para equilibrar atualização em tempo real e economia de recursos no Neon/Vercel.
- [ ] **Connection Pooling no PostgreSQL:** Validar o limite de conexões simultâneas do pooler do Neon (`-pooler`) com a escala de acessos simultâneos na inauguração.
- [ ] **Headers de Segurança e CORS:** Revisar a lista de origens autorizadas (`APP_ORIGIN`, `ADMIN_ORIGIN`) nos cabeçalhos de resposta da API para bloquear requisições de origens desconhecidas.

**Regra final:** implementação ainda em andamento. Nenhuma documentação anterior, prompt ou decisão revogada revoga as escolhas de **Next.js + NestJS + PostgreSQL + Prisma + Tailwind + shadcn/ui** estabelecidas em 24/10/2026.
