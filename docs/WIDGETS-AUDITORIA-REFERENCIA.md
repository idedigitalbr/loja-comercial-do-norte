# Auditoria de Widgets e Reconstrução da Homepage — Comercial do Norte

> **Referências oficiais analisadas:**
> - **Verdade visual (1:1):** `REFERENCIA/site-final.jpg` (`2880 × 17208 px` @2x)
> - **Verdade estrutural:** `REFERENCIA/wireframe.png` (`1920 × 9267 px`) e `REFERENCIA/wireframe-hd/` (20 seções numeradas de `01` a `20`)

---

## A. Visão Geral da Arquitetura Encontrada

- **Frontend da Vitrine (`apps/storefront`):** Next.js 16 (App Router) + React 19 + Tailwind CSS + Lucide Icons, integrado ao backend NestJS (`apps/api`) e banco PostgreSQL via Prisma.
- **Regra de Negócio (Fase 1):** Catálogo + Cotação online (`AddToQuoteButton` / `"Adicionar à cotação"` e `"Enviar Cotação"` via WhatsApp/API), sem checkout financeiro ou cálculo de frete de venda direta.
- **Motor Modular de Páginas e Construtor Visual (`apps/storefront/lib/storefront/` e `components/storefront/editor/`):**
  - **Contratos e Tipagens:** [`widget-types.ts`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/lib/storefront/widget-types.ts) define `WidgetType`, `BaseWidgetConfig`, `PageComposition` e as interfaces de propriedades de cada widget.
  - **Catálogo e Renderizador Dinâmico:** [`widget-registry.tsx`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/lib/storefront/widget-registry.tsx) mapeia cada `WidgetConfig` habilitado para seu componente React correspondente.
  - **Composição Oficial da Homepage:** [`home-configuration.ts`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/lib/storefront/home-configuration.ts) armazena a composição padrão (`defaultHomeComposition`, `version: 2`) com todas as 19 seções de widgets em sequência (+ Rodapé oficial na Seção 20).
  - **Persistência Híbrida:** `localStorage` (`cdn_home_composition_v2`) sincronizado com a rota de API [`/api/storefront/composition`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/app/api/storefront/composition/route.ts) (`data/home-composition.json`).
  - **Edição In-Place Minimalista (Estilo Shadcn Dark Mode):**
    - [`ElementorSectionWrapper`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/editor/elementor-section-wrapper.tsx): cápsula no topo direito de cada seção (`[ ✎ Lápis ] | [ ⠿ Drag & Drop ] | [ ↑ ] [ ↓ ]`) com menu para inserir seção acima/abaixo, duplicar, ocultar ou excluir.
    - [`InlineImageEditorOverlay`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/editor/inline-image-editor-overlay.tsx): barra central minimalista sobre imagens e banners com ícones de **Trocar Imagem** (`ImageUp`), **Trocar Link** (`Link2` com indicador verde quando ativo), **Novo Slide** (`Plus`) e **Remover Slide** (`Trash2`), suportando tanto slides (`slideId`) quanto caminhos aninhados (`fieldPath` / `linkFieldPath`).

---

## B. Inventário Completo dos Widgets

### B.1. Widgets Existentes (Preservados)
| Tipo (`WidgetType`) | Componente | Função |
|---|---|---|
| `benefits-bar` | [`BenefitsBarWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/benefits-bar/benefits-bar.tsx) | Barra de vantagens comerciais com ícones configuráveis e edição inline. |
| `brands-carousel` | `BrandsCarouselProps` | Estrutura de suporte para vitrine de marcas parceiras. |

### B.2. Widgets Adaptados (Evoluídos com Variantes e Fidelidade Visual)
| Tipo (`WidgetType`) | Componente | Adaptações Realizadas |
|---|---|---|
| `hero-carousel` | [`HeroCarouselWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/hero-carousel/hero-carousel.tsx) | Banner 100% largura com degradê inferior suave (`bottomGradient`), suporte a slides sem link (`linkUrl` vazio) e integração com `InlineImageEditorOverlay`. |
| `contained-hero` | [`ContainedHeroWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/contained-hero/contained-hero.tsx) | Carrossel contido arredondado com sobreposição superior (`overlapTop: true`), paginação em pílula e edição inline de imagem/link. |
| `category-grid` | [`CategoryGridWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/category-grid/category-grid.tsx) | Adicionada variante `'icons-bar'` (faixa branca arredondada com 8 ícones quadrados configuráveis e labels) além da variante `'cards'`. |
| `product-carousel` | [`ProductCarouselWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/product-carousel/product-carousel.tsx) | Adicionadas as variantes `'split-banner'` (card de banner vertical à esquerda + 3 produtos em promoção à direita) e `'standard-5col'` (5 produtos por linha com dots em pílula e setas laterais), conectado aos produtos reais e `AddToQuoteButton`. |

### B.3. Novos Widgets Criados
| Tipo (`WidgetType`) | Componente | Descrição e Configurabilidade |
|---|---|---|
| `banner-grid` | [`BannerGridWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/banner-grid/banner-grid.tsx) | Grid de 2 ou 3 banners promocionais lado a lado dentro de container branco arredondado, com troca individual de imagem e link via `InlineImageEditorOverlay`. |
| `quote-steps-banner` | [`QuoteStepsBannerWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/quote-steps-banner/quote-steps-banner.tsx) | Banner institucional *"Saiba / Como funciona a cotação online"* com Mascote 3D James à esquerda, 4 cards brancos numerados ao centro e arte de WhatsApp + embalagens à direita. |
| `segments-carousel` | [`SegmentsCarouselWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/segments-carousel/segments-carousel.tsx) | Seção *"Tudo para todos os negócios / Para todos os tamanhos!"* com cabeçalho azul escuro e 4 cards de segmentos (*Lanchonete*, *Pizzaria*, *Padaria*, *Loja de Festas*) com fotografia superior editável, ícone vermelho circular, título e descrição. |
| `promo-strip` | [`PromoStripWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/promo-strip/promo-strip.tsx) | Faixa promocional multi-variante com 3 layouts configuráveis: `'offers-strip'` (*Ofertas Imperdíveis* + 3 selos), `'conditions-mascot'` (*Condições Especiais* + Mascote James + 4 selos) e `'whatsapp-group'` (*Grupo de Ofertas Exclusivas do WhatsApp* + Mascote + Mockup de celulares). |
| `events-carousel` | [`EventsCarouselWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/events-carousel/events-carousel.tsx) | Seção escura (`#060709`) *"Nossos Eventos / Tudo que acontece no Comercial do Norte"* com mini-banner no topo direito e 4 cartazes verticais (`9:16`) editáveis. |
| `video-articles-carousel` | [`VideoArticlesCarouselWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/video-articles-carousel/video-articles-carousel.tsx) | Bloco bordô (`#A50010` → `#5E0008`) *"Explica aí comercial"* com cards horizontais contendo foto + botão Play à esquerda, tags (`P/ DELIVERY`, `GUIA PRÁTICO`), texto explicativo e botão `"Ver Completo"` à direita. |
| `instagram-feed` | [`InstagramFeedWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/instagram-feed/instagram-feed.tsx) | Card branco *"A Loja no Instagram"* com link `@comercialdonorte` e grid de 6 cards verticais com imagem editável e selo do Instagram. |
| `testimonials-grid` | [`TestimonialsGridWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/testimonials-grid/testimonials-grid.tsx) | Seção *"AVALIAÇÕES NO GOOGLE — O que nossos clientes dizem no Google"* (`Classificação 4.8 de 5.0 estrelas`) com 10 cards de depoimentos distribuídos em 2 linhas de 5 colunas. |
| `store-locations-map` | [`StoreLocationsMapWidget`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/widgets/store-locations-map/store-locations-map.tsx) | Bloco escuro arredondado no topo (`#0B0C10`) *"Encontre nossas unidades / Lojas mais perto de você"* com busca interativa por endereço/CEP, 3 cards de unidades à esquerda e Google Maps interativo à direita. |

---

## C. Mapa Completo da Homepage (De Cima para Baixo — 20 Seções)

| Ordem | Referência (`wireframe-hd`) | Coordenada Y (`site-final.jpg`) | Widget / Componente Utilizado | Classificação |
|---|---|---|---|---|
| **Topo** | Barra Superior + Busca + Menu | `Y = 0 .. 340` | [`SiteHeader`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/site-header.tsx) (3 barras: `#E2091E`, `#004CB1` c/ Mascote James 3D, `#00357B` c/ departamentos) | **ADAPTAR** |
| **01** | `01-SECAO-CARROSSEL-LARGURA-TOTAL` | `Y = 340 .. 1060` | `hero-carousel` (`s01-hero-full-width` — *Tudo para sua Pizzaria*) | **ADAPTAR** |
| **02** | `02-SECAO-CARROSSEL-PADRAO` | `Y = 1060 .. 1765` | `contained-hero` (`s02-contained-hero` — *Semana do Feirante Copo 180ml*) | **ADAPTAR** |
| **03** | `03-SECAO-ICONES-CATEGORIAS` | `Y = 1815 .. 2050` | `category-grid` (`variant: 'icons-bar'`, 8 ícones quadrados) | **ADAPTAR** |
| **04** | `04-SECAO-CARROSSEL-PRODUTOS-DESTAQUE` | `Y = 2170 .. 3235` | `product-carousel` (`variant: 'split-banner'`, banner vertical + 3 produtos em promoção) | **ADAPTAR** |
| **05** | `05-SECAO-BANNERS-TRIPLOS` | `Y = 3300 .. 3855` | `banner-grid` (`s05-triple-banners-1` — Limpeza, Feirante, Sacolas) | **NOVO** |
| **06** | `06-SECAO-CARROSSEL-PRODUTOS` | `Y = 3935 .. 4845` | `product-carousel` (`variant: 'standard-5col'`, título *"Mais vendidos"*) | **REUTILIZAR** |
| **07** | `07-SECAO-BANNER-LARGURA-TOTAL` | `Y = 4915 .. 5560` | `quote-steps-banner` (*"Saiba / Como funciona a cotação online"* — 4 passos) | **NOVO** |
| **08** | `08-SECAO-CARROSSEL-CARDS-FUNDO-ESCURO` | `Y = 5635 .. 6925` | `segments-carousel` (*"Tudo para todos os negócios"* — Lanchonete, Pizzaria, Padaria, Festas) | **NOVO** |
| **09** | `09-SECAO-BANNER-HORIZONTAL` | `Y = 6975 .. 7215` | `promo-strip` (`variant: 'offers-strip'` — *OFERTAS IMPERDÍVEIS*) | **NOVO** |
| **10** | `10-SECAO-CARROSSEL-PRODUTOS` | `Y = 7285 .. 8200` | `product-carousel` (`variant: 'standard-5col'`, título *"Para você"*) | **REUTILIZAR** |
| **11** | `11-SECAO-BANNERS-TRIPLOS` | `Y = 8265 .. 8825` | `banner-grid` (`s11-triple-banners-2` — Hamburgueira, Luva Vermelho, Luva Azul) | **REUTILIZAR** |
| **12** | `12-SECAO-CARROSSEL-VIDEOS-VERTICAL` | `Y = 8960 .. 10480` | `events-carousel` (*"Nossos Eventos / Tudo que acontece no Comercial do Norte"*) | **NOVO** |
| **13** | `13-SECAO-BANNER-HORIZONTAL` | `Y = 10570 .. 10900` | `promo-strip` (`variant: 'conditions-mascot'` — *CONDIÇÕES ESPECIAIS para o seu negócio*) | **REUTILIZAR** |
| **14** | `14-SECAO-CARROSSEL-PRODUTOS` | `Y = 10985 .. 11900` | `product-carousel` (`variant: 'standard-5col'`, título *"Para você"*) | **REUTILIZAR** |
| **15** | `15-SECAO-CARROSSEL-VIDEOS-HORIZONTAL` | `Y = 11980 .. 13035` | `video-articles-carousel` (*"Explica aí comercial"* — *Como escolher a caixa de pizza certa*) | **NOVO** |
| **16** | `16-SECAO-CARROSSEL-CARDS-COMPACTOS` | `Y = 13180 .. 14045` | `instagram-feed` (*"A Loja no Instagram"* — `@comercialdonorte`, 6 cards verticais) | **NOVO** |
| **17** | `17-SECAO-BANNER-LARGURA-TOTAL` | `Y = 14120 .. 14780` | `promo-strip` (`variant: 'whatsapp-group'` — *Grupo de ofertas Exclusivas do WhatsApp*) | **REUTILIZAR** |
| **18** | `18-SECAO-AVALIACOES-DEPOIMENTOS` | `Y = 14890 .. 15590` | `testimonials-grid` (*"O que nossos clientes dizem no Google."* — 10 cards 5 estrelas) | **NOVO** |
| **19** | `19-SECAO-LOCALIZACAO-UNIDADES-MAPA` | `Y = 15725 .. 16790` | `store-locations-map` (*"Encontre nossas unidades / Lojas mais perto de você"* + Google Maps) | **NOVO** |
| **20** | `20-SECAO-RODAPE` | `Y = 16790 .. 17208` | [`SiteFooter`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/site-footer.tsx) (Logo branca centralizada, redes sociais e barra azul `#1D3B78`) | **ADAPTAR** |

---

## D. Decisões de Reutilização vs. Criação

1. **Unificação de Carrosséis de Produtos (`product-carousel`):**
   - Em vez de criar widgets separados para as Seções 04, 06, 10 e 14, evoluímos `ProductCarouselWidget` para suportar `variant: 'split-banner' | 'standard-5col'` e `sideBanner` configurável. Assim, a Seção 04 usa `'split-banner'` (banner vertical à esquerda + 3 produtos à direita) e as Seções 06, 10 e 14 reutilizam `'standard-5col'` (5 produtos por linha).
2. **Unificação das Faixas Promocionais (`promo-strip`):**
   - As Seções 09 (*Ofertas Imperdíveis*), 13 (*Condições Especiais com Mascote*) e 17 (*Grupo de Ofertas do WhatsApp*) compartilham o mesmo propósito de conversão horizontal. Foram implementadas como 3 variantes (`'offers-strip'`, `'conditions-mascot'` e `'whatsapp-group'`) de um único widget `PromoStripWidget`.
3. **Reutilização da Grade de Banners Triplos (`banner-grid`):**
   - As Seções 05 e 11 possuem a mesma estrutura de 3 banners horizontais arredondados em container branco; ambas utilizam `BannerGridWidget` com diferentes conjuntos de `banners`.
4. **Evolução da Grade de Categorias (`category-grid`):**
   - A Seção 03 (barra horizontal de 8 ícones quadrados) foi implementada como a variante `'icons-bar'` de `CategoryGridWidget`, preservando a variante `'cards'` para listagens de departamentos.

---

## E. Lista de Imagens e Slots Visuais Configuráveis

Todos os recortes visuais puros foram extraídos em alta resolução para `apps/storefront/public/assets/home-ref/` e catalogados em `availableMediaLibrary` ([`elementor-media-modal.tsx`](file:///d:/.GITHUB/sistemas/loja-comercial-do-norte/apps/storefront/components/storefront/editor/elementor-media-modal.tsx)), garantindo que **nenhuma seção dependa da imagem inteira da referência** e que cada slot possa ser trocado individualmente no construtor:

- **Seção 01:** `/assets/home-ref/s01-hero-pizzaria.jpg` (+ slides adicionais em `/assets/S1-banners-topo-hero/`)
- **Seção 02:** `/assets/home-ref/s02-contained-feirante.jpg`
- **Seção 03:** `/assets/home-ref/s03-icon-01-ofertas.jpg` até `s03-icon-08-utilidades.jpg` (8 ícones individuais editáveis)
- **Seção 04:** `/assets/home-ref/s04-side-banner-feirante.jpg` (banner vertical lateral editável) + fotos de produtos reais/fallback (`prod-prato-descartavel.jpg`, `prod-caixa-pizza.jpg`, `prod-sacola-plastica.jpg`, `prod-copo-descartavel.jpg`, `prod-papel-toalha.jpg`)
- **Seção 05:** `/assets/home-ref/s05-triple-01-limpeza.jpg`, `s05-triple-02-feirante.jpg`, `s05-triple-03-sacolas.jpg`
- **Seção 07:** `/assets/imgs/Mascote-3D-James-em-pe/outros/james-09-celular.png` (Mascote 3D PNG transparente) e `/assets/home-ref/s07-quote-right-mockup.jpg`
- **Seção 08:** `/assets/home-ref/s08-segment-01-lanchonete.jpg`, `s08-segment-02-pizzaria.jpg`, `s08-segment-03-padaria.jpg`, `s08-segment-04-festas.jpg` (somente a fotografia superior de cada card; o ícone vermelho, textos e barra são HTML/CSS reais)
- **Seção 11:** `/assets/home-ref/s11-triple-01-hamburgueira.jpg`, `s11-triple-02-luva-vermelho.jpg`, `s11-triple-03-luva-azul.jpg`
- **Seção 12:** `/assets/home-ref/s12-event-top-thumb.jpg` + 4 cartazes verticais (`s12-event-01-empreendedores.jpg` a `s12-event-04-croquete.jpg`)
- **Seção 13:** `/assets/imgs/Mascote-3D-James-em-pe/principais/Mascote 3D sorridente com joinha.png`
- **Seção 15:** `/assets/home-ref/s15-video-pizza-woman.jpg` (foto à esquerda; o botão Play, as pílulas, o título, os parágrafos e o CTA são HTML/CSS reais)
- **Seção 16:** `/assets/home-ref/s16-insta-01-dia-cliente.jpg` até `s16-insta-06-vale-compras.jpg` (6 cards individuais editáveis)
- **Seção 17:** `/assets/imgs/Mascote-3D-James-em-pe/outros/james-09-celular.png` + `/assets/home-ref/s17-whatsapp-phones.jpg`

---

## F. Validação Final Executada

1. **Typecheck (`pnpm --filter storefront typecheck`):** Passou com **0 erros** (`tsc --noEmit`).
2. **Lint (`pnpm --filter storefront lint`):** Validado sem erros.
3. **Testes Automatizados (`pnpm --filter storefront test`):** Suíte Vitest executada e validada.
4. **Verificação Visual e Funcional no Servidor Local (`http://localhost:3001`):**
   - Todas as 20 seções (Header + 19 seções de widgets + Rodapé) renderizam na ordem exata de `site-final.jpg`.
   - Todos os produtos exibem badge de desconto, avaliação, preços de referência, condição de atacado e botão funcional **"Adicionar à cotação"** integrado ao `QuoteCartProvider`.
   - Modo de Edição in-place permite trocar imagens, alterar links, editar títulos, reordenar seções e inserir novas seções acima/abaixo em qualquer ponto da página.
