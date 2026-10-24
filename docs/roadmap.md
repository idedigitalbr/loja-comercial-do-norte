# ROADMAP & AUDITORIA — COMERCIAL DO NORTE

> **Único documento operacional de execução, bloqueios, riscos e histórico breve** — atualizado em **24/10/2026**.
> Decisões permanentes e contexto: [`memory-ai.md`](./memory-ai.md). Não criar changelog, checklist ou prompts de memória separados nesta pasta.

## 1. Estado confirmado nesta revisão

- Repositório público consultável: `victorwilliames/loja-comercial-do-norte`; `main` HEAD `5781590` (2026-10-24 14:56 UTC). Último commit consultado é de **reorganização documental**, não de migração da stack.
- **Decidido, ainda não implementado no HEAD consultado:** frontend Next.js, PostgreSQL e padronização Tailwind/shadcn/ui. **Mantido:** NestJS, Prisma, Turborepo, pnpm, design de referência Comercial do Norte.
- O responsável afirma que **ainda não há produtos cadastrados, pois o projeto está em desenvolvimento**. Conferir existência de outras entidades e dados locais antes de recomeçar migrations.
- **Nada de execução foi validado neste ambiente:** `pnpm install` foi tentado em 24/10 e **bloqueado pelo sandbox local** (lock de store em `%LOCALAPPDATA%\pnpm-store-operation-locks`, acesso negado); `lint`, `typecheck`, `test`, `build`, migrations e navegação **não foram executados**. Resultados citados em relatórios antigos são de outros ambientes e datas — não tratar como evidência.
- **Permissões GitHub verificadas em 24/10:** `pull`, `push`, `admin` e `maintain`; `main` sem proteção de branch. O commit `5781590` foi publicado pelo próprio agente, e o push está autorizado nesta máquina. A consolidação documental de 24/10 está **na árvore de trabalho, ainda não commitada**.
- Prazo histórico da fase 1: **31/10/2026**, com escopo de catálogo + cotação. Avaliar viabilidade considerando mudanças estruturais; não sacrificar segurança/qualidade para cumprir data.

### Fonte única dos arquivos de memória

`docs/memory-ai.md` = decisões e fatos duradouros.
`docs/roadmap.md` = o que fazer, evidências, bloqueios, auditoria e changelog compacto.

Complementos permitidos: `docs/security/lgpd-data-map.md` e `docs/security/threat-model.md`. Nada além disso.

Toda a documentação anterior (memórias, auditoria técnica, prompts, planos/specs, runbooks MySQL/Hostinger, importação WooCommerce e MVP antigo) foi **removida do worktree** em 24/10/2026 e permanece somente no histórico Git (`5781590`). **Não recriar cópias**, arquivos `*-old.md`, `*-backup.md` ou pastas de arquivo dentro do repositório.

## 2. Sequência executável de migração — SEM BIG BANG

### Fase A — Congelamento seguro / base de qualidade (P0)

- [ ] **A1 — Backup / branch:** confirmar `git status` limpo e remoto sincronizado; criar branch de backup/tag referenciando HEAD real e branch de trabalho `feat/stack-next-postgres`; não apagar ou sobrescrever alterações de outro agente.
- [ ] **A2 — Diagnóstico reprodutível:** Node compatível com versão escolhida de Next e dependências existentes, pnpm fixado e ambiente novo; `pnpm install`, `lint`, `typecheck`, `test`, `build`; registrar resultados efetivos. A base anterior fixava Node 22 + pnpm 10.15.1; atualizar só com compatibilidade validada.
- [ ] **A3 — Configuração segura:** revisar `.env.example` (o seed exige `DEFAULT_ADMIN_PASSWORD` / `DEFAULT_CUSTOMER_PASSWORD`, hoje ausentes; `SETTINGS_ENCRYPTION_KEY` é obrigatória em produção como base64 de 32 bytes e a API recusa iniciar sem ela), storage, segredos, banco e CI. `storage/uploads` precisa ser volume persistente. Sem publicar segredo real.
- [ ] **A4 — CI:** restabelecer pipeline de lint/typecheck/test/build, testes com PostgreSQL real isolado, Playwright para jornadas críticas e checks de segurança. Camadas: unitário (Vitest) para contratos, preços, máquinas de estado e componentes; integração contra PostgreSQL real para Prisma, locks, jobs, pagamentos e concorrência; E2E (Playwright) para catálogo → cotação → envio → admin.
- [ ] **A5 — Inventário de dados:** confirmar se existe MySQL local/homologação, tabelas e registros de contas/admin, settings, banners; fazer backup se existir conteúdo a preservar.

**Saída:** base conhecida e reproduzível, backup verificável e decisão documentada sobre dados que precisam ser migrados.

### Fase B — Migração MySQL → PostgreSQL (P0, isolada)

- [ ] **B1 — Ambiente:** provisionar PostgreSQL de desenvolvimento/testes; conexão e credenciais por variável, backup e política de acesso. **Não tocar banco original sem inventário.**
- [ ] **B2 — Schema Prisma:** avaliar compatibilidade dos **54 models** e enums atuais; mudar `provider`, revisar `@db.*`, índices, unicidades, collation, case sensitivity, JSON, timestamps e defaults. Não editar migrations MySQL como se fossem compatíveis com PostgreSQL.
- [ ] **B3 — Histórico de migrations:** preservar histórico MySQL no Git/backup; criar **histórico inicial PostgreSQL separado e consistente** conforme versão Prisma fixada. Validar geração/aplicação em PostgreSQL vazio e novamente em outro ambiente limpo. Não executar reset destrutivo em bancos com dados reais.
- [ ] **B4 — SQL específico:** adaptar `apps/api/src/modules/inventory/inventory.service.ts` (`SELECT ... FOR UPDATE` com identificadores PostgreSQL), `promotions/coupon.service.ts`, `trainings/trainings.service.ts`, `scripts/repair-migration-history.ts` e quaisquer `$queryRaw`/`$executeRaw` encontrados por busca completa.
- [ ] **B5 — Seed:** remover dados e domínios de Jonas & Elivaldo, tornar idempotente, credenciais por ambiente; criar somente dados reais aprovados ou DEMO claramente marcados. Conferir imagens e status DRAFT.
- [ ] **B6 — Integração:** transações, isolamento, locks concorrentes, reservas, cupons, login/RBAC, uploads, notificação, jobs, consultas, relatório. Testar com PostgreSQL real, não só mock.
- [ ] **B7 — Deploy:** ajustar `DATABASE_URL`, scripts e documentação de provisionamento/backup/recovery do PostgreSQL; não manter instruções que partem de MySQL como runbook atual.

**Aceite:** API NestJS inicia com PostgreSQL; schema e seed aplicam em ambiente limpo; suítes críticas passam; não existe dependência de runtime MySQL no caminho em produção; dados pré-existentes preservados se houver.

### Fase C — Design system e monorepo (P0/P1, gradual)

- [ ] **C1 — Fonte visual:** comparar `site-comercial-do-norte-html-referencia/` com a UI atual e mapear ativos/reaproveitamento; usar a paleta oficial `#264887`, `#E33C34`, demais tokens e Lufga / Plus Jakarta Sans.
- [ ] **C2 — Pacote UI:** normalizar `packages/ui`, tokens CSS, utilitário `cn`, variantes, Tailwind, configuração consistente do `shadcn/ui` em apps e pacote; componentes são versionados no repositório, não geridos por um serviço SaaS.
- [ ] **C3 — Inventário de componentes:** Button, inputs, form, badges, table, product-card, mega-menu, dialog/sheet, toast, empty-state, skeleton, media/hero, slider/carousel; para cada um definir comportamento, states, responsividade, acessibilidade e testes.
- [ ] **C4 — Admin existente:** manter React/Vite funcional enquanto incorpora tokens e componentes compartilhados; **não migrar o painel inteiro para Next antes de garantir o caminho crítico do lançamento**.
- [ ] **C5 — Cortar CSS duplicado por módulos, sem substituição total em um commit; remover preto/dourado e branding herdado.**

**Aceite:** uma fonte de cores/tipografia/espaçamentos, componentes compartilháveis entre loja e painel, sem identidades conflitantes.

### Fase D — Vite/React → Next.js na loja pública (P0/P1)

- [ ] **D1 — Preparação:** preservar rotas, layouts, contratos, SEO e UX críticos; Next.js App Router + TypeScript com `apps/storefront` (ou renomear em mudança separada e justificada).
- [ ] **D2 — Integração:** Next consulta REST NestJS por cliente tipado (`packages/api-client`) e contratos Zod; sem duplicar CRUD de comércio no Next ou abrir acesso direto do Next ao Prisma.
- [ ] **D3 — SEO:** produto, categoria, marca e páginas públicas com renderização indexável, `generateMetadata`/metadata, canonical, structured data apropriado, sitemaps/robots e redirects do legado; não usar domínio Jonas.
- [ ] **D4 — Performance:** otimização de mídia (armazenamento confiável), estratégia clara de cache/revalidação, paginação/busca no servidor, imagem responsiva, bundle e web vitals; evitar cache indevido em cotação/autenticação.
- [ ] **D5 — Integração visual:** converter o site HTML de referência em componentes Next/shadcn sem perder seções, responsividade e identidade já aprovada.
- [ ] **D6 — Rotas / SSR:** validar `/`, `/loja`, `/produto/:slug`, `/categoria/:slug`, `/marca/:slug`, fluxo de cotação e `/admin`; remover conflito do antigo Nest `public-shell` que servia SPAs por URL raiz.
- [ ] **D7 — Produção:** Nest e Next com serviços e portas independentes por reverse proxy; HTTPS, domínio configurável, cookies seguros, CORS/CSRF, assets persistentes, health checks, métricas e logs. **Não reaproveitar deploy de um processo sem adequar.**

**Aceite:** loja Next funciona ponta a ponta consumindo Nest, páginas de produtos indexáveis e responsivas, nenhum backend comercial duplicado.

### Fase E — Entrega funcional da Comercial do Norte (P0/P1)

- [ ] **E1 — Flags de escopo:** checkout, pagamentos e treinamentos legados invisíveis/inacessíveis na fase de cotação (ex.: `FEATURE_CHECKOUT=false`, `FEATURE_TRAININGS=false`, lidas pela API e expostas em `GET /api/v1/site/config`). Com a flag desligada: rotas somem do router e do menu da loja, itens somem do admin, e os endpoints de checkout respondem 404/410. **Não apagar** módulos, tabelas nem testes — apenas isolar.
- [ ] **E2 — Categorias:** implementar hierarquia `Category.parentId`, imagens, ordenação e filtro descendente; admin capaz de gerir categorias.
- [ ] **E3 — Cotação real:** implementar entidade/estado `QUOTE_REQUESTED` ou modelo de Quote separado (escolha após avaliar relacionamentos existentes); dados de contato e itens em snapshot; **sem cobrar nem reservar estoque**; número visível ao solicitante, confirmação e idempotência.
- [ ] **E4 — Vendas:** notificação assíncrona confiável para destinatários configuráveis; visualizar, filtrar e concluir/cancelar solicitações pelo admin. Evitar dados pessoais em logs.
- [ ] **E5 — Conteúdo Comercial do Norte:** trocar seed, logo, categorias reais, dados de contato aprovados, imagens e banners; retirar conteúdo do salão e brands hardcoded. No seed, cada produto precisa de variante com SKU único, preço, peso e dimensões (a maioria `ACTIVE`, alguns `DRAFT` para exercitar a fila de pendentes); imagens em WebP geradas localmente, **sem hotlink**; marcas provisórias com nome genérico ("Marca Exemplo") até o cliente enviar a lista oficial. Nunca inventar marca real, depoimento ou dado de cliente.
- [ ] **E6 — Home e catálogo:** S0–S10, mega menu, campanhas, marcas, ofertas, categorias, mais vendidos se houver dados, “Explica Aí Comercial”, loja física e rodapé. CTA de cotação em cards, produto e carrinho.
- [ ] **E7 — Busca:** busca `contains`/estratégia de busca adequada a PostgreSQL, filtros, ordenação/paginação **server-side**, índices e contagem total.
- [ ] **E8 — Smoke tests e aceite:** visitante encontra produto → adiciona à cotação → envia formulário → vendas recebe → admin vê solicitação → visitante não tem checkout/pagamento. Validar mobile, teclado, a11y, LGPD, SEO e erros de rede.

**Aceite de negócio:** catálogo + cotação funciona de ponta a ponta, sem cobrar cliente, sem dados da outra empresa, e marketing opera o painel.

### Fase F — ERP e e-commerce completo (P2; só após decisão de produto)

- [ ] **F1 — ERP:** receber documentação oficial e acordo sobre fonte de verdade/IDs, mapeamento, auth, limites, logs, retries, conflitos, produtos DRAFT e reconciliação; só então implementar sync NestJS.
- [ ] **F2 — Checkout real:** corrigir fluxo de pagamentos e webhooks, estoque/reservas, frete/retirada, cupons, reembolso e conciliação; homologar com provedores e testes de concorrência reais. **Aceite:** duas reservas concorrentes não consomem a última unidade; webhook duplicado ou fora de ordem não duplica pagamento nem pedido; usuário sem permissão não executa ação administrativa crítica; pedido preserva snapshot de preço, frete e contato.
- [ ] **F3 — CMS próprio:** blocos e conteúdo editáveis no admin existente; se inspirar em UX de CMS sem instalar Payload.
- [ ] **F4 — Melhorias:** observabilidade, relatórios, automação de marketing, conta do cliente completa, desempenho do catálogo em escala e automação de deploy.

## 3. Achados técnicos que NÃO podem se perder

| ID | Severidade | Problema constatado no código legado / ação | Evidência |
|---|---|---|---|
| R01 | **P0** | O `payments.service.ts` atualiza o pagamento no webhook mas não demonstra transição automática do pedido para `PAID`; testar e corrigir ANTES de habilitar checkout. | `apps/api/src/modules/payments/payments.service.ts` |
| R02 | **P0** | `checkout` aceita `shippingCents` fornecido pelo cliente; não confiar em preço, frete ou total vindos da interface. A API precisa recalcular/verificar cotação de frete autenticada. | `apps/api/src/modules/checkout/checkout.service.ts` / `orders/orders.service.ts` |
| R03 | **P0** | `job-handlers.ts` é um mapa de no-ops; apenas `SEND_TRANSACTIONAL_EMAIL` é sobrescrito com implementação real em `jobs.module.ts:20`. `RELEASE_EXPIRED_RESERVATIONS`, `RECONCILE_PAYMENT`, `GENERATE_REPORT` e `CLEAN_EXPIRED_CARTS` só retornam `undefined` — o runner marca o job como concluído sem executar nada. Implementar antes de operar vendas/estoque. | `apps/api/src/modules/jobs/job-handlers.ts:5-11`, `jobs.module.ts:18-21` |
| R04 | **P0** | Produto DRAFT acessível por slug (listagem só filtra ACTIVE). | `apps/api/src/modules/catalog/catalog.service.ts` |
| R05 | **P0** | `GET /orders/:publicId` pode não validar ownership; revisar autenticação/autorização de acesso a pedidos e cotações (IDOR). | `apps/api/src/modules/orders/orders.controller.ts` |
| R06 | **P1** | Melhor Envio provider é stub e não consulta API real. Retirada traz rótulo legado “salão”. | `apps/api/src/modules/shipping/providers/{melhor-envio,pickup}.provider.ts` |
| R07 | **P1** | SEO usa `Jonas & Elivaldo` e domínio antigo; CSP também permite domínio do salão; corrigir durante Next/limpeza. | `apps/api/src/public-shell/seo-renderer.service.ts`, `apps/api/src/main.ts` |
| R08 | **P1** | Front filtra marca por lista hardcoded do cliente anterior e usa busca/paginação do catálogo no navegador. | `apps/storefront/src/pages/shop-page.tsx` |
| R09 | **P1** | `Category` é plana; Brand já oferece padrão de hierarquia reutilizável. | `prisma/schema.prisma` |
| R10 | **P1** | Fluxo de cotação e notificação para equipe de vendas não existem; fluxo de pedidos atual cobra/segura estoque. | `orders.service.ts`, `notifications`, `checkout` |
| R11 | **P1** | Seed, banners default e páginas mantêm textos/mídia Jonas e Elivaldo; não publicar conteúdo herdado. | `prisma/seed.ts`, `settings/default-home-banners.ts`, `apps/storefront/src/content` |
| R12 | **P1** | `prisma/schema.prisma` e `migration_lock.toml` vinculados a MySQL; migrations SQL são específicas do dialeto. | `prisma/`, `scripts/repair-migration-history.ts` |
| R13 | **P1** | `public-shell` Nest legado pode conflitar com raiz Next/deploy de serviços separados. | `apps/api/src/public-shell/`, `apps/api/src/main.ts` |
| R14 | **P1** | CI não possui workflow ativo no snapshot; execução da suíte não comprovada nesta revisão. | `.github/workflows/` ausente |
| R15 | **P2** | Antigos testes institucionais referenciam rotas removidas; ajustar a contrato atual, não remover testes para ficar verde. | `apps/storefront/src/pages/institutional-pages.spec.tsx` |
| R16 | **P2** | CSS extenso duplicado e tokens de salão contradizem referência Comercial do Norte; `packages/ui` subaproveitado. | `apps/*/src/styles.css`, `packages/ui` |

**Severidade é de revisão estática; não significa exploração demonstrada.** Corrigir R04/R05 antes de abrir dados reais ao público; R01–R03/R06 são bloqueadores de **checkout de venda**, não necessariamente do MVP sem cobrança.

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

### Protocolo de manutenção daqui em diante

Após **cada etapa concluída**, substituir `[ ]` por `[x]` com evidência: data, branch/commit, comandos de teste, resultado, migrações aplicadas e rollback. Inserir uma linha nova no histórico **deste arquivo** em vez de criar `changelog.md` extra. Se o requisito mudar, atualizar `memory-ai.md` no mesmo commit.

**Critério principal de encerramento:** stack nova implementada e testada, projeto rodando em Next + Nest + PostgreSQL, UI padronizada em Tailwind/shadcn, negócio de cotação funcional, e nenhuma dependência de Medusa ou Payload.
