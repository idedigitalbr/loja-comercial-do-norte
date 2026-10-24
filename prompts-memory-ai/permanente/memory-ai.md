# CONTEXTO-IA: Comercial do Norte (novo site)

> Arquivo de contexto permanente do projeto. Qualquer IA (Antigravity, ChatGPT, Muse) que for trabalhar neste repositório deve ler este arquivo ANTES de qualquer mudança. Ele é a fonte da verdade sobre decisões de produto. Em conflito entre este arquivo e o código, as decisões de produto daqui vencem; os padrões de implementação do código vencem.

Última atualização: 2026-10-20 (por Paulo Muse, a partir da reunião Fathom de 2026-10-20, da pesquisa de templates e da análise completa do código da base).

---

## 1. O que é este projeto

Novo site da **Comercial do Norte**, distribuidora de plásticos, descartáveis e embalagens em Belém/PA (atacado e varejo). Substitui o site atual (dosplasticos.com.br, WordPress de 2018, só institucional).

- **Prazo de lançamento: 31/10/2026**, pra coincidir com um evento grande da ACP (Associação Comercial do Pará).
- **Identidade visual: azul e vermelho** (logo "comercial" em vermelho, "do norte" em azul).
- **Referências de layout: Magazine Luiza e Mercado Livre** (mega menu categorizado, carrossel, marcas em círculos, ofertas do dia, conteúdo estilo "Lu Explica").
- Equipe: Hesron (tech lead, back-end, autor da base), Willzada (front-end), Edmundo (gestão), Bruno (responsável pelo ERP).

## 2. Decisões da reunião (2026-10-20) — NÃO reabrir sem falar com a equipe

1. **Fase 1 é CATÁLOGO + COTAÇÃO. Não é e-commerce completo.** Sem checkout, sem pagamento online, sem cálculo de frete pra venda. O visual é de loja, a ação do cliente é montar um **carrinho de cotação** e enviar.
2. **Fluxo da cotação:** cliente monta o carrinho → envia (nome, WhatsApp, empresa, observação) → **equipe de vendas é notificada** → vendas finaliza a cotação **dentro do ERP**.
3. **Integração com o ERP é crítica, MAS fica pra etapa seguinte** (ver §3): a API do ERP entrega título, descrição, preço, galeria de fotos, categoria/subcategoria, peso e dimensões (cubagem), e sincroniza produtos/preços.
4. **Produto novo entra como "pendente"**: fica invisível até o marketing completar foto/descrição e publicar.
5. **Autonomia do marketing:** gerenciar produtos, banners, conteúdo e dados da loja pelo admin, sem depender de desenvolvedor.
6. Extras da home decididos: seção **"Comercial do..."** (clientes por setor: pizzaria, padaria, lanchonete...), **Mais Vendidos**, Instagram, banners sazonais dinâmicos, blog de conteúdo estilo "Lu Explica" (nome decidido em 2026-10-21: "Explica Aí Comercial"; vídeos como capa dos artigos, artigo abre completo com CTAs pros produtos).

## 3. Estratégia em duas etapas (decisão de 2026-10-20)

- **ETAPA ATUAL (sem API):** construir tudo em cima da base existente, com catálogo cadastrado pelo admin/seed. O que depende do ERP fica preparado (estrutura e ganchos), mas NÃO se constrói o sync agora. A documentação da API do ERP ainda não chegou (Bruno → Edmundo).
- **ETAPA SEGUINTE (com API):** módulo de sincronização com o ERP seguindo o molde do importador do WooCommerce que já existe no código (`apps/api/src/modules/catalog/woocommerce-importer.ts`), usando `legacySource`/`legacyId` do produto. Checkout/pagamento/frete completos também são etapa futura (já existem na base, ficam desligados).

## 4. A base (o que este repositório já é)

Monorepo Turborepo + pnpm, TypeScript, feito originalmente pro cliente Jonas & Elivaldo (salão/estética, migração de WooCommerce). Verificado no código em 2026-10-20:

- `apps/storefront`: React 19.1 + Vite 7.1 (SPA, CSR puro, sem SSR). Rotas públicas por slug (`/produto/:slug`, `/categoria/:slug`, `/marca/:slug`).
- `apps/admin`: React 19.1 + Vite, servido em `/admin/`.
- `apps/api`: NestJS 11.1 + Prisma 6.19 + MySQL 8, Node 22. Auth Argon2id + cookies HTTP-only, RBAC.
- `packages/`: `@commerce/contracts` (DTOs/Zod), `@commerce/ui`, `@commerce/api-client`.
- Deploy: Hostinger Web Business, processo Node único (a API serve os 2 SPAs), cron de 5 min em `POST /internal/cron/process` (fila própria no MySQL, tabela `ScheduledJob`).
- Testes: 50+ suítes (Vitest + Playwright). **Manter a suíte verde é regra.**

### O que já existe e resolve requisito (não reconstruir)

- Produto nasce `DRAFT` e só publica com SKU + foto principal + peso + dimensões (`CatalogService.publish`, erro `ProductIncompleteError`). Público só vê `ACTIVE`. **Isso É a regra do "pendente" do §2.4.**
- `Product.legacySource` + `legacyId` (unique composta) e `ProductVariant.sku` único: gancho pronto pro ERP.
- `ProductImage`: galeria com alt, ordem e foto principal. Upload com Sharp (3 tamanhos WebP + original, disco local `storage/uploads`, máx. 10 MB).
- `Brand` tem hierarquia pai/filhos; filtro por marca inclui as filhas.
- Preço na variante: `priceCents` + `compareAtPriceCents` (o "de/por" das etiquetas de oferta).
- Banners da home dinâmicos: tabela `HomeBanner`, admin próprio, servidos em `GET /api/v1/site/config`.
- Settings no admin: nome da loja, logo, favicon, endereço, telefone, WhatsApp, Instagram (grupo `site`); SMTP e templates de e-mail por evento; preferências de notificação com `recipientOverride`.
- Checkout com Mercado Pago, cupons/promoções, favoritos, área do cliente: existem, ficam **desligados/ocultos** na fase 1.
- Módulo de cursos/treinamentos (`Training` etc.): desacoplado do catálogo (tabelas e rotas separadas; checkout só cria itens de produto). Fica **desligado, sem deletar**.

### Gaps conhecidos (verificados no código)

- `Category` é **plana** (1 nível, sem `parentId`). Precisa de hierarquia (categoria/subcategoria) — molde: `BrandHierarchy`.
- Não existe fluxo de cotação: `OrdersService.createFromCart` exige totais, reserva estoque e vai pra `AWAITING_PAYMENT`. Estados atuais: DRAFT, AWAITING_PAYMENT, PAID, PREPARING, SHIPPED, READY_FOR_PICKUP, COMPLETED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED.
- Notificação de pedido novo só vai pro cliente; falta avisar a equipe de vendas.
- Busca do catálogo é `startsWith` em nome/slug (fraca). Paginação/ordenação são client-side (12/página).
- Mega menu **não existe** (header é lista simples de links fixos).
- Home atual é institucional de salão: conteúdo fixo em `apps/storefront/src/content/institutional-content.ts`.
- Cores/tema são CSS hardcoded (`styles.css` dos apps); **não** há config de cores no banco.
- SEO: sem sitemap; meta tags são placeholders nunca injetados (`<!--SEO_TITLE-->` no `index.html`); CSR puro.

## 5. Estrutura da home (S0–S10) — o layout a construir

Referência completa: checklist do projeto (S0–S10). Resumo:

- **S0 Header:** barra fina (ofertas do dia, compre pelo WhatsApp, retire na loja), logo, busca grande, "Informe seu CEP", conta, carrinho de cotação com contador; faixa de benefícios (Menor Preço, Variedade, Tudo em um Só Lugar, Clientes Satisfeitos — selos do site atual).
- **S0.1 Mega menu:** botão "Todas as categorias", painel com grupos e subcategorias, links rápidos (Ofertas do Dia, Mais Vendidos, Marcas, Blog).
- **S1:** carrossel principal (3–5 campanhas, usa `HomeBanner`).
- **S2:** marcas em círculos estilo Magalu → página da marca.
- **S3:** Ofertas do Dia com contagem regressiva, cards com foto/nome/preço/tag dinâmica ("35% OFF", "Oferta Relâmpago" a partir de `compareAtPriceCents`), botão **"Adicionar à Cotação"**.
- **Banner de segmento** entre seções: ex. "Comercial do Norte do Pizzaiolo" (tudo pra pizzaria).
- **S4:** compre por categoria (cards das categorias reais).
- **S5:** Mais Vendidos + fileira "Pro seu negócio" (atacado/volume).
- **S6:** blog/dicas estilo "Lu Explica" (3 cards; nome decidido: "Explica Aí Comercial", vídeo como capa do artigo; sem módulo de blog por ora — cards estáticos via conteúdo).
- **S7:** prova social (avaliação Google, depoimentos — marcar como exemplo até o cliente passar os reais).
- **S8:** loja física: foto, endereço, horários, botões WhatsApp/ligar/rota.
- **S9:** faixa "Receba as ofertas" + Instagram.
- **S10:** rodapé completo de e-commerce.
- **Página de produto:** CTA de cotação, **mini-carrinho lateral**, "Produtos Similares" (mesma categoria), tags dinâmicas.
- Extras do padrão Mercado Livre: cards de acesso rápido pós-carrossel (Retire na Loja, Cotação pelo WhatsApp, Atacado/Revenda, Entrega em Belém), bloco "como funciona a cotação", termos mais procurados, barra de cookies LGPD.

## 6. Categorias reais (do site atual)

Artigos para Festa · Embalagens · Doces e Bomboniere · Sacos e Sacolas · Produtos de Limpeza · Frios e Laticínios · Mercearia (+ Descartáveis como grupo forte do mix). Subcategorias serão criadas na adaptação (a API do ERP trará as oficiais depois).

## 7. Dados da loja (do site atual, confirmar com o cliente antes de publicar)

- **Endereço**: Av. Rômulo Maiorana, 115A, São Braz, Belém/PA, CEP 66093-635
- **Horários**: seg a sex 6h30 às 18h · sáb 6h30 às 12h30 · dom 7h às 12h30
- **Telefones**: (91) 4042-0513 · (91) 3246-4908 · **WhatsApp (91) 98344-0880**
- **E-mail**: contato@dosplasticos.com.br
- **CNPJ**: 16.965.024/0001-15
- Observação: esses dados vêm do site atual (época do nome Dosplásticos) e ainda serão confirmados com o cliente para o novo site; o domínio final (manter dosplasticos.com.br ou migrar) também está em aberto.

<!--
RECONSTRUÇÃO 2026-10-24: o arquivo original chegava até aqui truncado no marcador
"...[truncated 2693 chars]" e perdia o fim da seção 7. O trecho acima e as seções 8 e 9
foram recuperados de prompts-memory-ai/CONTEXTO-PARA-CHATGPT.md (§6, §8 e §9).
Se você tiver o texto original, substitua este bloco.
-->

## 8. Status e pendências

- Protótipo da home: feito e em melhoria.
- **Pendente do cliente/equipe**: lista oficial de marcas; nome/personagem do blog (ficou "Explica Aí Comercial"); confirmar dados da loja e domínio; documentação da API do ERP (para a fase 2); fotos reais dos produtos.

## 9. Instruções para qualquer IA

- Responda em **português brasileiro**.
- Trate este documento como a verdade do projeto: não reintroduza checkout/pagamento na fase 1, não troque as cores da marca, não invente marcas, preços reais, depoimentos ou dados da empresa. Precisou de algo que não está aqui, **pergunte**.
- Ao sugerir textos de tela, use a linguagem de cotação ("Adicionar à Cotação", "Enviar Cotação", "Pedir pelo WhatsApp"), nunca linguagem de compra direta, enquanto for fase 1.

> Nota de manutenção (2026-10-24): o model de banners da home chama-se **`SiteBanner`** (não `HomeBanner`), e o endpoint público é **`GET /api/v1/site/config`** devolvendo `{ site, banners }`. Detalhes e demais correções em `ANALISE-TECNICA-2026-10-24.md` §5.