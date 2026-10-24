# Pendências e próximos passos

> Espelho operacional do projeto. Regra: só fica aqui o que **ainda não foi feito**.
> Ao concluir um item, marque `[x]`, registre no `changelog.md` e remova daqui no próximo ciclo.
> Última atualização: 2026-10-24 11:50 (-03).

---

## A. Interrompido / bloqueado (com motivo)

| Item | Motivo | Como resolver |
|---|---|---|
| `pnpm install` | Sandbox do DSH bloqueia o lock de store em `%LOCALAPPDATA%\pnpm-store-operation-locks` (acesso negado) | Rodar no terminal do usuário, no Node 22 + pnpm 10.15.1 |
| `pnpm test` / `build` / `typecheck` | Dependem do install | Depois do install, rodar `pnpm test` primeiro (espera-se falha em `institutional-pages.spec.tsx`, ver A11 da análise) |
| Validação das rotas de produção (`/`, `/admin`, `/loja`) | Não houve build executável | `pnpm build` + `node apps/api/dist/main.js` e conferir os 3 status do `scripts/verify-deployment.mjs` |
| `memory-ai.md` truncado | O arquivo perdia ~2.693 caracteres no fim (§7 dados da loja em diante) | **Reconstruído em 2026-10-24** a partir do `CONTEXTO-PARA-CHATGPT.md`; se existir o original, substituir |
| Commit da reorganização de pastas | `DESIGN.md`, `UX-CONTRACT.md`, `ANALISE-TECNICA-REUSO.md` e `prompts/00-master-like-payload.md` foram **movidos** (aparecem como deletados no `git status`) e `ui-design/` + `prompts-memory-ai/` estão untracked | Decidir com o usuário: commitar como rename (`git add -A` + commit `chore: organiza pastas e memória`) ou manter fora do Git |
| CI | Removido no commit `ecd0c39`; o token atual já tem scope `workflow` | Restaurar `.github/workflows/ci.yml` (`git revert ecd0c39` ou reescrever) |

---

## B. P0 — Destravar antes de qualquer feature

- [ ] **A1** Adicionar `DEFAULT_ADMIN_PASSWORD` e `DEFAULT_CUSTOMER_PASSWORD` ao `.env.example` (e documentar `SETTINGS_ENCRYPTION_KEY` como base64 de 32 bytes).
- [ ] **A2** Fixar ambiente: Node 22 (`nvm use 22`) e `pnpm@10.15.1` (`corepack prepare pnpm@10.15.1 --activate`).
- [ ] **A3** Rodar `pnpm install` fora do DSH e registrar o resultado no changelog.
- [ ] **A11/A15** Restaurar CI e fazer a suíte voltar ao verde (remover/reescrever os testes das rotas de salão que não existem mais).
- [ ] **A10** Confirmar em build de produção se `/`, `/admin` e `/loja` respondem 200; se não, excluir os controllers do public-shell do prefixo `api/v1`.

## C. P1 — Fase 1 (lançamento 31/10/2026)

- [ ] **Etapa 0** Criar `backup/base-original` + tag `v0-base-jonas-elivaldo` e a branch `feat/comercial-norte-fase1`.
- [ ] **Etapa 1** Feature flags: `FEATURE_TRAININGS=false`, `FEATURE_CHECKOUT=false` — esconder rotas/menus/botões do salão e do checkout, **sem deletar** módulos nem tabelas.
- [ ] **A6** Limpar todo o conteúdo do salão (textos, imagens externas, banners padrão, sidebar do admin, SEO, CSP).
- [ ] **Etapa 2 / A14** `Category.parentId` + subcategorias + imagem + ordem (molde: `BrandHierarchy`); filtro por categoria pai incluindo filhas; admin com seletor de pai e listagem indentada.
- [ ] **Etapa 3 / A8, A9** Fluxo de cotação: status `QUOTE_REQUESTED` + `createQuoteFromCart` (sem estoque, sem pagamento, visitante permitido), tela "Enviar Cotação", tela de sucesso com número, e-mail para a equipe de vendas com `recipientOverride`, filtro/detalhe no admin, testes.
- [ ] **Etapa 4** Seed da distribuidora: 8 categorias reais + 2–4 subcategorias, produtos exemplo com SKU/peso/dimensões, alguns `DRAFT`, marcas genéricas marcadas como provisórias, settings com dados de Belém.
- [ ] **Etapa 5** Home S0–S10 + mega menu + identidade azul/vermelho; página de produto com "Adicionar à Cotação", mini-carrinho e similares; busca `contains`.
- [ ] **Etapa 6** SEO mínimo: title/description/OG reais, `GET /sitemap.xml` na API, `robots.txt`.
- [ ] **Etapa 7** Suíte completa + `pnpm build` + relatório final das etapas 0–6.

## D. P2 — Segurança e dívida técnica

- [ ] **A4** Filtrar `status: ACTIVE` em `GET /catalog/products/:slug` (hoje DRAFT é público).
- [ ] **A12** Validar dono em `GET /orders/:publicId`.
- [ ] **A5** Remover `ORIGINAL_PUBLIC_BRANDS` do `shop-page.tsx`.
- [ ] **A13** Paginação/ordenação no servidor (`take`/`skip` + `orderBy`) e busca `contains` em nome/descrição.
- [ ] **A16** Tokens em fonte única (loja + admin), fim do dourado, reduzir os 205 KB de CSS; adotar `@commerce/api-client`.
- [ ] Peso do repositório: 61,8 MB de assets de referência — avaliar LFS ou storage externo.

## E. Fase 2 (depois do lançamento)

- [ ] Integração com ERP (molde: `woocommerce-importer.ts` + `legacySource`/`legacyId`); produto novo entra como pendente até marketing publicar.
- [ ] Religar checkout/pagamento/frete (já implementados, hoje desligados).
- [ ] Blog "Explica Aí Comercial" com conteúdo gerenciável (hoje previsto como cards estáticos).
- [ ] Páginas institucionais e blocos editáveis pelo marketing (CMS além de banners).
- [ ] SSR/pré-render do catálogo para SEO real.

---

## F. Decisões em aberto (dependem do cliente/equipe)

- Lista oficial de **marcas**.
- **Domínio** final (manter `dosplasticos.com.br` ou migrar).
- Confirmar **dados da loja** (endereço, telefones, WhatsApp, CNPJ) antes de publicar.
- Documentação da **API do ERP** (Bruno → Edmundo).
- Fotos reais dos produtos no lugar de placeholders.
