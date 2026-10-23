# Prompt Mestre — Projeto Like-Payload (engenharia reversa + design system)

**Objetivo:** fazer a engenharia reversa do Payload CMS e do template oficial
de e-commerce dele, comparar com este projeto e gerar UM checklist completo de
tudo que vamos recriar/ajustar aqui dentro pra nossa loja ficar no nível dele
— arquitetura, funcionalidades E padrão visual — sem instalar o Payload, sem
fork, sem segundo backend.

**Entrega única desta etapa:** o arquivo `CHECKLIST-LIKE-PAYLOAD.md` na raiz
deste repositório, cobrindo as duas partes deste prompt. NÃO escreva código de
funcionalidade nem reescreva CSS nesta etapa. A entrega é análise +
comparação + decisões + checklist.

---

## O projeto (este repo)

Monorepo Turborepo da Comercial do Norte (distribuidora de plásticos,
descartáveis e embalagens), baseado na base "Jonas & Elivaldo Commerce":

- `apps/api`: NestJS 11 + Prisma 6 + MySQL. Módulos existentes: account,
  audit, auth, carts, catalog, checkout, customers, database, files, health,
  inventory, jobs, notifications, orders, payments, pricing, promotions,
  reports, settings, trainings, vip.
- `apps/admin`: React 19 + Vite. Já tem páginas de catálogo, pedidos,
  promoções, banners da home e editor de produtos. Tema escuro grafite.
- `apps/storefront`: React 19 + Vite (SPA) — framework em decisão (Parte 1).
- `packages/`: api-client, contracts, ui (components + styles), configs.
- Leia antes de auditar: `ANALISE-TECNICA-REUSO.md` (fatos verificados no
  código: busca startsWith em catalog.service.ts, categorias planas sem
  parentId, Brand com hierarquia, produto nasce DRAFT,
  legacySource+legacyId, fluxo de cotação inexistente), `DESIGN.md` e
  `UX-CONTRACT.md`.

## Regras inegociáveis (valem pras duas partes)

1. **O Nest continua.** A API é e continuará sendo NestJS (stack do Hesron,
   dono da base). Nenhuma proposta troca, contorna ou duplica a API. O
   Payload NÃO entra como backend: é só a referência.
2. **ERP é a fonte da verdade** do catálogo, via `legacySource+legacyId`.
3. **Fase 1 = catálogo + carrinho de cotação.** Sem checkout, sem pagamento,
   sem cálculo de frete. O fluxo de compra da referência vira: carrinho ->
   enviar cotação -> notificação pra vendas -> vendas fecha no ERP.
   Lançamento: 31/10/2026.
4. **Produto nasce DRAFT** até o marketing completar (SKU, foto,
   peso/dimensões).
5. **Quem gerencia o conteúdo é o CLIENTE** (banners, produtos, páginas,
   blog) pelo admin, sem programador. Toda decisão de CMS, admin e bloco é
   julgada por esse critério.
6. **Fora de escopo** (decisão fechada, não recriar): versionamento de
   conteúdo, multi-idioma, multi-moeda. Pagamento/checkout = fase 2.
7. **Padronização é requisito, não enfeite:** tudo que nascer segue o design
   system (Parte 2). Componente ou bloco novo só entra pelo padrão.

---

# PARTE 1 — Arquitetura e funcionalidades

## Etapa A — Engenharia reversa da referência

Estude o repositório oficial `payloadcms/payload`, template `ecommerce`
(README + código do template + docs do plugin de e-commerce), e levante com
referência de arquivo/pasta:

- Modelo de dados: coleções (Users, Pages, Media, Categories, Products,
  Variants, Carts, Addresses, Orders, Transactions), campos que importam,
  relacionamentos, e os Globals (Header/Footer editáveis).
- Layout Builder: a lista de blocos (hero, conteúdo, mídia, CTA, listagem)
  e como o admin monta página com eles.
- Técnicas que fazem ele ser bom: controle de acesso por papel
  (admin/customer), mídia com tamanhos automáticos e ponto focal, busca com
  filtros, SEO (campos, plugin), revalidação sob demanda, publicação
  agendada, guest checkout, carrinho de visitante, testes do fluxo.
- Experiência do admin: o que o lojista faz sem tocar em código.

## Etapa B — Comparação com este projeto

Para cada item da Etapa A, verifique NO CÓDIGO deste repo (arquivo:linha,
como a ANALISE-TECNICA-REUSO.md faz) se: já existe / existe parcial / não
existe / conflita com as regras. Nada de afirmar sem abrir o arquivo.

## Etapa C — Decisão do framework da loja (storefront)

O storefront atual é Vite SPA (CSR): perde no Google, porque o buscador
enxerga pouco de página renderizada só no navegador. Avalie as opções pra
substituir SÓ a loja (a API Nest não muda; a loja consome a API):

- Next.js (SSR/SSG, padrão de mercado)
- TanStack Start
- Remix / React Router framework
- Manter Vite + pré-renderização das páginas de catálogo

Critérios, nesta ordem: SEO real de catálogo (produto/categoria), esforço de
migração a partir do storefront atual, reaproveitamento dos `packages/ui` e
`api-client`, maturidade/ecossistema, e impacto no prazo. Entregue UMA
recomendação com o porquê e o que se perde com ela. O checklist já nasce
escrito pro framework escolhido, e a Parte 2 é escrita pra funcionar com ele.

---

# PARTE 2 — Padronização: design system, tokens e componentes

## Estado atual (verificado no código em 2026-10-23, confira você mesmo)

- **Sem Tailwind** em nenhum app/pacote. Tudo CSS manual.
- `apps/storefront/src/styles.css` tem **~202 KB** de CSS escrito à mão;
  `apps/admin/src/styles.css` tem ~36 KB.
- Tokens existem, mas **duplicados por app**: cada `styles.css` declara seu
  próprio `:root`. Duas fontes da verdade.
- A direção do `DESIGN.md` atual ("editorial, premium", preto profundo +
  dourado, Montserrat) e os tokens (`--color-gold-*`) são da identidade do
  cliente anterior da base (Jonas & Elivaldo), **não** da Comercial do Norte.
- `UX-CONTRACT.md` (WCAG 2.2 AA, estados de formulário, pt-BR/BRL, donos dos
  componentes): reaproveitar a estrutura, atualizar o conteúdo.
- `packages/ui` é a semente da biblioteca de componentes, subaproveitada.
- `apps/storefront/public/design-preview.html`: preview interativo de
  tokens/componentes. Manter a ideia, ligada aos tokens novos.

## Identidade da Comercial do Norte (a que vale)

- Referência de layout: varejo grande (Magalu/Mercado Livre), home em
  seções, mega menu.
- Cores: **azul e vermelho** (não é o preto/dourado da base).
- Referência de sistema visual: o design system da Mais B Farma (repo
  `idedigitalbr/site-maisbfarma`, DESIGN-maisbfarma.md) — estrutura de
  tokens e componentes, com as cores trocadas pras da Comercial.

## Etapa D — Engenharia reversa do padrão visual da referência

No mesmo template `ecommerce` do Payload, levante:

- Como os tokens vivem lá: Tailwind + variáveis CSS (padrão tipo shadcn),
  onde ficam, como tema e cores de estado são definidos.
- Inventário de componentes da loja e do admin: variantes, estados (hover,
  disabled, erro) e como são reutilizados.
- Como os blocos do Layout Builder viram componentes visuais padronizados
  (o cliente escolhe o bloco, preenche e o visual já nasce certo).

## Etapa E — Auditoria do nosso CSS

- Mapeie os dois `styles.css`: valores soltos fora dos tokens, regras
  duplicadas entre loja e admin, componentes refeitos com visual diferente
  (botões, cards, formulários).
- Liste o que do `packages/ui` é reaproveitável e o que falta.

---

# Entrega — CHECKLIST-LIKE-PAYLOAD.md

Estrutura obrigatória, nesta ordem:

1. **Resumo da engenharia reversa**: o que o Payload Ecommerce tem de bom
   (função e visual), em linguagem simples, com a referência de onde está lá.
2. **Decisão de framework da loja**: opção escolhida, porquês, perdedores e
   o motivo de cada derrota.
3. **Tabela comparativa**: item da referência | onde está lá | situação aqui
   (existe/parcial/não existe/conflito, com arquivo:linha) | o que fazer.
4. **Arquitetura de tokens proposta**: UMA fonte única de tokens (pacote
   próprio ou `packages/ui`), consumida por loja e admin; CSS custom
   properties como base, Tailwind por cima no app que o adotar; categorias
   de token (cor base, marca azul/vermelho, estados, tipografia,
   espaçamento, raio, sombra, largura de conteúdo).
5. **DESIGN.md novo (rascunho do conteúdo)**: direção visual da Comercial
   do Norte, regras de botão/CTA (inclui botão de cotação), contraste,
   iconografia (Lucide), e o que muda em relação ao DESIGN.md atual.
6. **Inventário de componentes padrão**: componente único por função
   (botão, card de produto, banner, bloco de seção, formulário, tabela do
   admin etc.), onde cada um mora, variantes e estados obrigatórios.
   Blocos do cliente = esses componentes: bloco novo nasce como componente
   no sistema, nunca como CSS solto.
7. **Plano de migração do CSS manual**: ordem de ataque aos ~202 KB, sem
   big bang; o que é fase 1 e o que é fase 2.
8. **CHECKLIST DO PROJETO (o coração do documento)**: itens marcáveis
   `- [ ]`, agrupados por área (Catálogo, Cotação, Admin do cliente, Blocos
   e conteúdo, Blog, Busca, SEO, Mídia, Conta e papéis, Design system e
   tokens, Componentes, Fase 2), cada item com: o que é, onde mexe
   (app/módulo/arquivo), esforço (P/M/G) e dependência se houver. Na Fase 1
   só entra o que a loja precisa pra lançar dia 31/10.
9. **O que NÃO vamos recriar**: versionamento, multi-idioma, multi-moeda e
   qualquer item da referência que não sirva a uma distribuidora B2B com
   cotação — cada um com o motivo em uma frase.
10. **Riscos e conflitos**: onde a referência briga com as regras (ex.:
    checkout com Stripe na fase 1) e como o checklist resolveu.
11. **Preview**: como o `design-preview.html` passa a refletir os tokens
    novos (troca de paleta em tempo real pra aprovação com o cliente).
