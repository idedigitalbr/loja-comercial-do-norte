# MEMORY AI — COMERCIAL DO NORTE

> **Documento canônico de contexto e decisões do projeto** — atualizado em **24/10/2026**.
> Leitura obrigatória para qualquer agente de IA ou desenvolvedor antes de planejar, implementar ou revisar alterações.
> Repositório: `https://github.com/victorwilliames/loja-comercial-do-norte`.
> Complemento operacional: [`roadmap.md`](./roadmap.md). **Nesta pasta existem somente estes dois arquivos `.md`** (os únicos complementos ficam em `security/`).

## 0. Ordem de autoridade e regra de atualização

1. **Decisões explícitas mais recentes do responsável pelo projeto**, registradas neste documento, prevalecem sobre propostas, prompts, planos e decisões técnicas anteriores.
2. **Código da branch realmente inspecionada** determina o que existe e funciona no repositório; memória de produto não deve ser interpretada como funcionalidade já implementada.
3. A referência **visual** oficial é `site-comercial-do-norte-html-referencia/`, especialmente `DESIGN-comercial-do-norte.md`, imagens e páginas HTML. Ela é um ativo a reutilizar, não motivo para reconstrução visual livre.
4. Documentação antiga (planos, specs, runbooks, auditorias e memórias da base Jonas) foi **removida do repositório** em 24/10/2026 e permanece apenas no histórico Git (`5781590`). Além destes dois arquivos, `docs/` contém somente complementos de segurança (`docs/security/`), que não são fonte de decisão de produto.
5. Não inventar conclusão, teste, deploy, conexão ao ERP ou dado comercial. Anotar como **decidido / implementado / pendente / bloqueado**.
6. Atualizar **este `memory-ai.md`** quando houver decisão duradoura, e **`roadmap.md`** quando houver mudança de status, commit, risco, bloqueio ou etapa. Não criar novos arquivos Markdown de memória nem pastas `permanente`/`prompts` paralelas.

### Estado atual do código (transição)

- Snapshot de referência **do código**: commit `5781590` (24/10/2026); a documentação foi consolidada depois, sem alterar código. Em 24/10/2026 o **storefront passou a ser Next.js 16 (App Router)** consumindo a API REST, o **admin** continua React/Vite, o Prisma aponta para **PostgreSQL** com migrations versionadas e o domínio de **cotação** já existe na API.
- A arquitetura-alvo da seção 1 está **decidida e ainda não implementada**. Nada neste documento deve ser lido como funcionalidade pronta sem conferir o código.
- Projeto **em desenvolvimento**; segundo o responsável, **ainda não há produtos cadastrados**. Não concluir daí que o banco está vazio: validar usuários, configurações, banners e demais registros antes de qualquer reset.
- Meta da fase 1: **31/10/2026** (evento ACP), sujeita à validação de prontidão. Não declarar lançamento realizado.

| Camada | Decidido | Implementado hoje | Pendente |
|---|---|---|---|
| Storefront | Next.js App Router + TypeScript | **Next.js 16.4.3** em `apps/storefront` (App Router) consumindo a API REST | estado vazio/erros de rede, E2E Playwright, design da referência (fase C/D5) |
| API | NestJS, fonte única da regra de negócio | NestJS 11 + Express 5 | manter e evoluir |
| Banco | PostgreSQL | PostgreSQL (provider e SQL nativo migrados em 24/10/2026; migration baseline pendente) | gerar/aplicar migrations PostgreSQL (B3) |
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
| Banco de dados | **PostgreSQL** | Substituir MySQL; planejamento e testes antes de mudar qualquer banco real |
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
  storefront/          # migrar Vite/React para Next.js App Router, por etapas
  admin/               # painel React/Vite EXISTENTE; padronizar shadcn/Tailwind
                         # avaliar integração futura ao Next, sem big bang
  api/                 # NestJS — única API de negócio e acesso ao PostgreSQL
packages/
  ui/                  # tokens globais, shadcn/ui, componentes compartilhados
  contracts/           # Zod, DTOs e tipos públicos compartilhados
  api-client/          # cliente de API tipado, autenticação e tratamento de erros
  config-eslint/
  config-typescript/
prisma/                  # schema PostgreSQL + migrations NOVAS coerentes
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
- Categoria: hoje é plana (sem `parentId`); o alvo é hierarquia pai/filho com imagem e ordem, no molde de `BrandHierarchy`.
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

- Monorepo Turbo + pnpm com `apps/storefront` (React 19 + Vite), `apps/admin` (React + Vite) e `apps/api` (NestJS 11 + Prisma 6 + MySQL 8), além de `packages/contracts`, `ui` e `api-client`.
- API com autenticação por sessão (cookie assinado), RBAC por permissão, catálogo (produto/variante/imagem), marcas hierárquicas, categorias, estoque com reserva transacional, carrinhos anônimos, cupons/promoções, pedidos com máquina de estados, pagamentos Mercado Pago, entregas, clientes, configurações, banners, notificações, relatórios e treinamentos herdados.
- `SiteBanner` é o model real de banners; `GET /api/v1/site/config` devolve site + banners ativos.
- Mídia com Sharp: original + 480/960/1440 WebP.
- Seed idempotente e importador WooCommerce ancorado em `legacySource`/`legacyId`.
- Admin cobre catálogo, pedidos, estoque, clientes, promoções, relatórios e configurações (site, banners, pagamentos, SMTP, templates).

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

## 6. Decisões pendentes fora da stack

- Confirmação de domínio, dados cadastrais/horários/contato, lista de marcas, catálogo e fotos, responsável/destino das cotações, origem real dos preços.
- Regras comerciais da fase 2 ainda em aberto: frete (provedor, regiões, prazo, fallback), retirada, condições de pagamento, cancelamento/reembolso, emissão fiscal/NF e política VIP.
- Documentação e contrato da API do ERP (Bruno/equipe), autenticação, limites, eventos, periodicidade e estratégia de sincronização.
- Infra de VPS, estratégia de deploy Next + Nest + PostgreSQL, armazenamento persistente de mídia, backups, CI/CD e plano de rollback.
- Definição de quando o painel administrativo será migrado para Next.js; **o objetivo firme agora é migrar a loja pública**, mantendo o painel utilizável durante a transição.

**Regra final:** implementação ainda em andamento. Nenhuma documentação anterior, prompt ou decisão revogada revoga as escolhas de **Next.js + NestJS + PostgreSQL + Prisma + Tailwind + shadcn/ui** estabelecidas em 24/10/2026.
