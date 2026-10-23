# Prompt 02 — Padronização: Design System, tokens e componentes

**Objetivo:** padronizar o visual do projeto inteiro (loja, admin e blocos do
cliente) num Design System único, com tokens centralizados, componentes
reutilizáveis e um DESIGN.md canônico da Comercial do Norte — usando como
referência de organização o template de e-commerce do Payload (Next +
Tailwind + variáveis CSS), sem instalar o Payload.

**Entrega única desta etapa:** o arquivo `CHECKLIST-DESIGN-SYSTEM.md` na raiz
deste repositório. NÃO reescreva o CSS nesta etapa. A entrega é auditoria +
plano + checklist. Este prompt complementa o
`prompts/01-engenharia-reversa-payload.md` (a decisão de framework da loja
sai de lá; este plano é escrito pra funcionar com ela).

---

## Estado atual (verificado no código em 2026-10-23, confira você mesmo)

- **Sem Tailwind** em nenhum app/pacote. Tudo CSS manual.
- `apps/storefront/src/styles.css` tem **~202 KB** de CSS escrito à mão;
  `apps/admin/src/styles.css` tem ~36 KB.
- Tokens existem, mas **duplicados por app**: cada `styles.css` declara seu
  próprio `:root` (cores, fontes, espaçamentos). Duas fontes da verdade.
- A direção visual documentada no `DESIGN.md` atual ("editorial, premium",
  preto profundo + dourado, fonte Montserrat) e os tokens
  (`--color-gold-*`, `--gold-gradient`) são da identidade do cliente
  anterior da base (Jonas & Elivaldo), **não** da Comercial do Norte.
- `UX-CONTRACT.md` existe (acessibilidade WCAG 2.2 AA, estados de
  formulário, locale pt-BR/BRL, donos dos componentes) — reaproveitar a
  estrutura, atualizar o conteúdo.
- `packages/ui` já existe (components + styles + index.ts): é a semente da
  biblioteca de componentes, hoje subaproveitada.
- Existe `apps/storefront/public/design-preview.html`: página interativa de
  preview de tokens/componentes. Manter a ideia, ligando ela aos tokens
  novos.

## Identidade da Comercial do Norte (a que vale)

- Distribuidora de plásticos, descartáveis e embalagens. Referência de
  layout: varejo grande (Magalu/Mercado Livre), home em seções, mega menu.
- Cores: **azul e vermelho** (não é o preto/dourado da base).
- Referência de sistema visual: o design system da Mais B Farma (repo
  `idedigitalbr/site-maisbfarma`, DESIGN-maisbfarma.md) — estrutura de
  tokens e componentes, com as cores trocadas pras da Comercial.
- Quem usa o admin é o **cliente**: banner, produto e página têm que ser
  mexidos por ele, com componentes e blocos padronizados que não quebram o
  layout.

## Etapa A — Engenharia reversa do padrão Payload

No template `ecommerce` do `payloadcms/payload`, levante:

- Como os tokens vivem lá: Tailwind + variáveis CSS (padrão tipo shadcn),
  onde ficam, como tema claro/escuro e cores de estado são definidos.
- Inventário de componentes da loja e do admin: quais existem, variantes,
  estados (hover, disabled, erro), e como são reutilizados.
- Como os blocos do Layout Builder viram componentes visuais padronizados
  (o cliente escolhe o bloco, preenche e o visual já nasce certo).

## Etapa B — Auditoria do nosso CSS

- Mapeie os dois `styles.css`: quantas cores/valores soltos fora dos tokens,
  regras duplicadas entre loja e admin, componentes refeitos mais de uma vez
  com visual diferente (botões, cards, formulários).
- Liste o que do `packages/ui` é reaproveitável e o que falta.

## Entrega — CHECKLIST-DESIGN-SYSTEM.md

Estrutura obrigatória:

1. **Arquitetura de tokens proposta**: UMA fonte única de tokens (pacote
   próprio ou `packages/ui`), consumida por loja e admin; formato (CSS
   custom properties como base, Tailwind por cima no app que o adotar);
   lista das categorias de token (cor base, cor de marca azul/vermelho,
   estados, tipografia, espaçamento, raio, sombra, largura de conteúdo).
2. **DESIGN.md novo (rascunho do conteúdo)**: direção visual da Comercial
   do Norte, regras de botão/CTA (inclui botão de cotação), contraste,
   iconografia (Lucide), e o que muda em relação ao DESIGN.md atual.
3. **Inventário de componentes padrão**: os componentes únicos do projeto
   (botão, card de produto, banner, bloco de seção, formulário, tabela do
   admin etc.), onde cada um mora (`packages/ui` ou app), variantes e
   estados obrigatórios. Regra: componente novo só nasce no padrão ou não
   nasce.
4. **Blocos do cliente como design patterns**: cada bloco que o cliente
   monta no admin (hero, banner, grade de produtos, conteúdo, CTA) com o
   componente visual correspondente — bloco novo = componente novo no
   sistema, nunca CSS solto.
5. **Plano de migração do CSS manual**: ordem de ataque aos ~202 KB
   (primeiro tokens e componentes de maior reuso), sem big bang: o que é
   fase 1 (até 31/10) e o que é fase 2.
6. **CHECKLIST marcável** `- [ ]` de tudo acima, com esforço (P/M/G) e onde
   mexe (arquivo/pacote).
7. **Preview**: como o `design-preview.html` passa a refletir os tokens
   novos (troca de paleta em tempo real servindo à aprovação com o cliente).
